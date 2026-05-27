import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/services/bookingService';
import { getExpenses } from '@/services/expenseService';
import { getProperties } from '@/services/propertyService';
import { formatCurrency } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

export function RevenuePage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const [propertyFilter, setPropertyFilter] = useState('');

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', hostUser?.id],
    queryFn: () => getBookings(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', hostUser?.id],
    queryFn: () => getExpenses(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  const filtered = propertyFilter
    ? bookings.filter((b) => b.propertyId === propertyFilter)
    : bookings;

  const filteredExpenses = propertyFilter
    ? expenses.filter((e) => e.propertyId === propertyFilter)
    : expenses;

  // Summary stats
  const totalRevenue = filtered.reduce((s, b) => s + b.revenue, 0);
  const totalNetProfit = filtered.reduce((s, b) => s + b.netProfit, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalBookings = filtered.length;
  const totalNights = filtered.reduce((s, b) => s + b.nights, 0);
  const avgPerNight = totalNights > 0 ? totalRevenue / totalNights : 0;

  // Monthly chart data (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { month: string; revenue: number; expenses: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = dayjs().subtract(i, 'month');
      const mStart = m.startOf('month');
      const mEnd = m.endOf('month');

      const monthRevenue = filtered
        .filter((b) => {
          const d = dayjs(b.checkIn.toDate());
          return d.isAfter(mStart) && d.isBefore(mEnd);
        })
        .reduce((s, b) => s + b.revenue, 0);

      const monthExpenses = filteredExpenses
        .filter((e) => {
          const d = dayjs(e.date.toDate());
          return d.isAfter(mStart) && d.isBefore(mEnd);
        })
        .reduce((s, e) => s + e.amount, 0);

      months.push({
        month: m.format('MMM'),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
      });
    }
    return months;
  }, [filtered, filteredExpenses]);

  // Per-property breakdown
  const propertyBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; bookings: number; nights: number }>();
    for (const b of filtered) {
      const existing = map.get(b.propertyId) || { name: b.propertyName, revenue: 0, bookings: 0, nights: 0 };
      existing.revenue += b.revenue;
      existing.bookings += 1;
      existing.nights += b.nights;
      map.set(b.propertyId, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  const advancedUpgradeReason = subscription.getUpgradeReason({ type: 'useAdvancedRevenue' });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Revenue</h1>
          <p className="text-muted-foreground mt-1">Track your income and profitability</p>
        </div>
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Summary cards (ALL PLANS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${totalNetProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(totalNetProfit)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Avg / Night</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(avgPerNight)}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalBookings} bookings · {totalNights} nights</p>
        </div>
      </div>

      {/* Advanced analytics (PAID) */}
      {advancedUpgradeReason ? (
        <UpgradePrompt message={advancedUpgradeReason} />
      ) : (
        <div className="space-y-6">
          {/* Monthly chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">Monthly Revenue (Last 6 Months)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(0, 84.2%, 60.2%)" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-property breakdown */}
          {propertyBreakdown.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold mb-4">Per Property Breakdown</h2>
              <div className="space-y-3">
                {propertyBreakdown.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.bookings} bookings · {p.nights} nights</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
