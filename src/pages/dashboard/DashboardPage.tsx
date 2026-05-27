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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'hsl(142 55% 90%)' }}>
                <TrendingUp size={18} style={{ color: 'hsl(142 60% 35%)' }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {formatCurrency(monthRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Expenses: <span className="text-destructive font-medium">{formatCurrency(monthExpenses)}</span>
            </p>
          </div>

          {/* Active Bookings */}
          <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'hsl(45 60% 90%)' }}>
                <CalendarDays size={18} style={{ color: 'hsl(38 55% 45%)' }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {activeBookings}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">Confirmed + Pending</p>
          </div>

          {/* Properties */}
          <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'hsl(220 60% 92%)' }}>
                <Building2 size={18} style={{ color: 'hsl(220 55% 45%)' }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Properties</p>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {properties.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">Total managed</p>
          </div>

          {/* Occupancy */}
          <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'hsl(270 55% 92%)' }}>
                <Wallet size={18} style={{ color: 'hsl(270 50% 50%)' }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {occupancyRate}%
            </p>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${occupancyRate}%`,
                    background: 'linear-gradient(90deg, hsl(45 58% 59%) 0%, hsl(38 55% 52%) 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-base mb-4">Today's Check-ins</h3>
          {isLoading ? (
            <ListRowSkeleton rows={2} />
          ) : todayCheckIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-ins today</p>
          ) : (
            <div className="space-y-2">
              {todayCheckIns.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{b.guestName}</p>
                    <p className="text-xs text-muted-foreground">{b.propertyName}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">
                    {b.nights} night{b.nights > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-base mb-4">Today's Check-outs</h3>
          {isLoading ? (
            <ListRowSkeleton rows={2} />
          ) : todayCheckOuts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-outs today</p>
          ) : (
            <div className="space-y-2">
              {todayCheckOuts.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{b.guestName}</p>
                    <p className="text-xs text-muted-foreground">{b.propertyName}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                    {formatCurrency(b.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming 7 days */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Upcoming 7 Days</h3>
          <Link
            to="/calendar"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
          >
            View calendar <ArrowRight size={14} />
          </Link>
        </div>
        {isLoading ? (
          <ListRowSkeleton rows={3} />
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bookings in the next 7 days</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{b.guestName}</p>
                  <p className="text-xs text-muted-foreground">{b.propertyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{formatDate(b.checkIn.toDate())}</p>
                  <p className="text-xs font-medium">{b.nights} night{b.nights > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
