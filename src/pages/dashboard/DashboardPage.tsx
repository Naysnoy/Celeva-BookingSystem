import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/services/bookingService';
import { getProperties } from '@/services/propertyService';
import { getExpenses } from '@/services/expenseService';
import { formatCurrency, formatDate } from '@/utils';
import { CalendarDays, Building2, TrendingUp, ArrowRight, Wallet } from 'lucide-react';
import { StatCardSkeleton, ListRowSkeleton } from '@/components/ui/Skeleton';
import dayjs from 'dayjs';

export function DashboardPage() {
  const { hostUser } = useAuth();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', hostUser?.id],
    queryFn: () => getBookings(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', hostUser?.id],
    queryFn: () => getExpenses(hostUser!.id),
    enabled: !!hostUser,
  });

  const isLoading = bookingsLoading || propertiesLoading || expensesLoading;

  const today = dayjs();
  const monthStart = today.startOf('month');
  const monthEnd = today.endOf('month');

  // Stats
  const monthBookings = bookings.filter((b) => {
    const d = dayjs(b.checkIn.toDate());
    return d.isAfter(monthStart) && d.isBefore(monthEnd);
  });
  const monthRevenue = monthBookings.reduce((s, b) => s + b.revenue, 0);
  const monthExpenses = expenses
    .filter((e) => {
      const d = dayjs(e.date.toDate());
      return d.isAfter(monthStart) && d.isBefore(monthEnd);
    })
    .reduce((s, e) => s + e.amount, 0);
  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
  const totalNights = monthBookings.reduce((s, b) => s + b.nights, 0);
  const daysInMonth = today.daysInMonth();
  const occupancyRate = properties.length > 0 && daysInMonth > 0
    ? Math.min(100, Math.round((totalNights / (properties.length * daysInMonth)) * 100))
    : 0;

  // Today's activity
  const todayCheckIns = useMemo(
    () =>
      bookings.filter(
        (b) => dayjs(b.checkIn.toDate()).isSame(today, 'day') && (b.status === 'confirmed' || b.status === 'pending')
      ),
    [bookings]
  );

  const todayCheckOuts = useMemo(
    () =>
      bookings.filter(
        (b) => dayjs(b.checkOut.toDate()).isSame(today, 'day') && (b.status === 'confirmed' || b.status === 'completed')
      ),
    [bookings]
  );

  // Upcoming 7 days
  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => {
          const ci = dayjs(b.checkIn.toDate());
          return ci.isAfter(today) && ci.isBefore(today.add(7, 'day')) && b.status !== 'cancelled';
        })
        .sort((a, b) => a.checkIn.toDate().getTime() - b.checkIn.toDate().getTime()),
    [bookings]
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {hostUser?.displayName?.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening with your properties today.
        </p>
      </div>

      {/* Stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Revenue */}
          <div className="airbnb-card group rounded-2xl border border-border bg-card p-5 cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-900/20">
                <TrendingUp size={17} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">This month</span>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1.5">{formatCurrency(monthRevenue)}</p>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
              <span className="text-xs text-destructive font-medium">−{formatCurrency(monthExpenses)}</span>
              <span className="text-xs text-muted-foreground">in expenses</span>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="airbnb-card group rounded-2xl border border-border bg-card p-5 cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-[#C4A574]/8">
                <CalendarDays size={17} className="text-[#C4A574]" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1.5">{activeBookings}</p>
            <p className="text-xs text-muted-foreground">Active Bookings</p>
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Confirmed + Pending</span>
            </div>
          </div>

          {/* Properties */}
          <div className="airbnb-card group rounded-2xl border border-border bg-card p-5 cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20">
                <Building2 size={17} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1.5">{properties.length}</p>
            <p className="text-xs text-muted-foreground">Properties</p>
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Managed listings</span>
            </div>
          </div>

          {/* Occupancy */}
          <div className="airbnb-card group rounded-2xl border border-border bg-card p-5 cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-900/20">
                <Wallet size={17} className="text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1.5">{occupancyRate}%</p>
            <p className="text-xs text-muted-foreground">Occupancy Rate</p>
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${occupancyRate}%`, background: 'linear-gradient(90deg, #C4A574, #8A6840)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-sm">Today's Check-ins</h3>
            <span className="ml-auto text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              {todayCheckIns.length}
            </span>
          </div>
          <div className="p-4">
            {isLoading ? (
              <ListRowSkeleton rows={2} />
            ) : todayCheckIns.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No check-ins today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C4A574, #8A6840)' }}
                    >
                      {b.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{b.guestName}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.propertyName}</p>
                    </div>
                    <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold shrink-0">
                      {b.nights}n
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <h3 className="font-bold text-sm">Today's Check-outs</h3>
            <span className="ml-auto text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {todayCheckOuts.length}
            </span>
          </div>
          <div className="p-4">
            {isLoading ? (
              <ListRowSkeleton rows={2} />
            ) : todayCheckOuts.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No check-outs today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                    >
                      {b.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{b.guestName}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.propertyName}</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0">
                      {formatCurrency(b.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming 7 days */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <h3 className="font-bold text-sm">Upcoming 7 Days</h3>
          <Link
            to="/calendar"
            className="text-xs text-[#C4A574] hover:underline flex items-center gap-1 font-semibold transition-colors"
          >
            View calendar <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-4"><ListRowSkeleton rows={3} /></div>
        ) : upcoming.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming bookings in the next 7 days</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C4A574, #8A6840)' }}
                >
                  {b.guestName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{b.guestName}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.propertyName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-foreground">{formatDate(b.checkIn.toDate())}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.nights} night{b.nights > 1 ? 's' : ''}</p>
                </div>
                <div className="shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize status-${b.status}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
