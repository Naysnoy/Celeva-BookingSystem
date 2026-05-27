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
      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length} reservation{bookings.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {!upgradeReason && (
          <Link
            to="/bookings/add"
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
          >
            <Plus size={16} />
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Type pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 border ${
                typeFilter === tab.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C4A574]/30 focus:border-[#C4A574] transition-all"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search guest or property…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A574]/30 focus:border-[#C4A574] transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#C4A574] border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold mb-1">No bookings found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {bookings.length > 0 ? "Try adjusting your filters to find what you're looking for." : "Add your first property and create a booking to get started."}
          </p>
          {!upgradeReason && bookings.length === 0 && (
            <Link
              to="/bookings/add"
              className="btn-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
            >
              <Plus size={15} /> Add Your First Booking
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Table header (desktop) */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-muted/40 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Guest</span>
            <span>Dates</span>
            <span className="text-right">Revenue</span>
            <span className="text-center">Status</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {filtered.map((booking) => (
              <div key={booking.id}>
                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center gap-3 sm:gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                  {/* Guest */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C4A574, #8A6840)' }}
                    >
                      {booking.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{booking.guestName}</p>
                      <p className="text-xs text-muted-foreground truncate">{booking.propertyName}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="pl-13 sm:pl-0">
                    <p className="text-sm font-medium">
                      {formatDate(booking.checkIn.toDate())} â†’ {formatDate(booking.checkOut.toDate())}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {booking.nights} night{booking.nights > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="pl-13 sm:pl-0 sm:text-right">
                    <p className="text-sm font-bold">{formatCurrency(booking.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Net: {formatCurrency(booking.netProfit)}</p>
                  </div>

                  {/* Status badge */}
                  <div className="pl-13 sm:pl-0 sm:flex sm:justify-center">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold capitalize status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pl-13 sm:pl-0">
                    <button
                      onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                      className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-[#C4A574] hover:text-[#C4A574] hover:bg-[#C4A574]/4 transition-all duration-150"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(booking.id)}
                      className="rounded-xl border border-transparent p-1.5 text-muted-foreground hover:border-destructive/30 hover:text-destructive hover:bg-destructive/5 transition-all duration-150"
                      title="Delete booking"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inline delete confirm */}
                {deletingId === booking.id && (
                  <div className="mx-4 mb-3 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-destructive font-semibold">Delete this booking?</p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => deleteMutation.mutate(booking.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                      >
                        {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
