import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CalendarDays, Search, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getBookingCount, deleteBooking } from '@/services/bookingService';
import { BOOKING_STATUS_OPTIONS } from '@/shared';
import { BookingStatus, PropertyType } from '@/types';
import { formatDate, formatCurrency } from '@/utils';

const TYPE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'resort', label: 'Resort' },
  { value: 'apartment', label: 'Apartment' },
];

export function BookingsPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: bookingCount = 0 } = useQuery({
    queryKey: ['bookingCount', hostUser?.id],
    queryFn: () => getBookingCount(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', hostUser?.id, typeFilter, statusFilter],
    queryFn: () =>
      getBookings(hostUser!.id, {
        propertyType: typeFilter !== 'all' ? (typeFilter as PropertyType) : undefined,
        status: statusFilter ? (statusFilter as BookingStatus) : undefined,
      }),
    enabled: !!hostUser,
  });

  const upgradeReason = subscription.getUpgradeReason({
    type: 'addBooking',
    currentCount: bookingCount,
  });

  const filtered = searchQuery
    ? bookings.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookings;

  const statusColor: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const deleteMutation = useMutation({
    mutationFn: (bookingId: string) => deleteBooking(hostUser!.id, bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingCount'] });
      setDeletingId(null);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground mt-1">Track all your guest bookings</p>
        </div>
        {!upgradeReason && (
          <Link
            to="/bookings/add"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Booking
          </Link>
        )}
      </div>

      {upgradeReason && (
        <div className="mb-6">
          <UpgradePrompt message={upgradeReason} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                typeFilter === tab.value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {BOOKING_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guest or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No bookings yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {bookings.length > 0 ? 'No bookings match your filters.' : 'Add a property first, then create your first booking.'}
          </p>
          {!upgradeReason && bookings.length === 0 && (
            <Link
              to="/bookings/add"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} /> Add Booking
            </Link>
          )}
        </div>
      ) : (
          <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{booking.guestName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[booking.status] || ''}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{booking.propertyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(booking.checkIn.toDate())} → {formatDate(booking.checkOut.toDate())} · {booking.nights} night{booking.nights > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="font-semibold">{formatCurrency(booking.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Net: {formatCurrency(booking.netProfit)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                    title="Edit booking"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(booking.id)}
                    className="rounded-xl border border-transparent p-1.5 text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors"
                    title="Delete booking"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Inline delete confirmation */}
              {deletingId === booking.id && (
                <div className="rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-destructive font-medium">Delete this booking?</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => deleteMutation.mutate(booking.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                    >
                      {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
