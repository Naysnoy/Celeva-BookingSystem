import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooking, editBooking, deleteBooking } from '@/services/bookingService';
import { getProperties } from '@/services/propertyService';
import { uploadGuestId } from '@/services/storageService';
import { BOOKING_STATUS_OPTIONS, BOOKING_SOURCE_OPTIONS } from '@/shared';
import { BookingStatus, BookingSource } from '@/types';
import { calculateNetProfit, calculateNights } from '@/utils';
import { Timestamp } from 'firebase/firestore';
import { ArrowLeft, CalendarDays, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import dayjs from 'dayjs';

export function EditBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Load existing booking ──
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', hostUser?.id, bookingId],
    queryFn: () => getBooking(hostUser!.id, bookingId!),
    enabled: !!hostUser && !!bookingId,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  // ── Form state ──
  const [propertyId, setPropertyId]         = useState('');
  const [guestName, setGuestName]           = useState('');
  const [guestEmail, setGuestEmail]         = useState('');
  const [guestPhone, setGuestPhone]         = useState('');
  const [checkIn, setCheckIn]               = useState('');
  const [checkOut, setCheckOut]             = useState('');
  const [checkInTime, setCheckInTime]       = useState('');
  const [checkOutTime, setCheckOutTime]     = useState('');
  const [status, setStatus]                 = useState<BookingStatus>('confirmed');
  const [source, setSource]                 = useState<BookingSource>('manual');
  const [revenue, setRevenue]               = useState<number | ''>('');
  const [platformFee, setPlatformFee]       = useState<number | ''>(0);
  const [cleaningFee, setCleaningFee]       = useState<number | ''>(0);
  const [otherExpenses, setOtherExpenses]   = useState<number | ''>(0);
  const [notes, setNotes]                   = useState('');
  const [guestIdFrontFile, setGuestIdFrontFile] = useState<File | null>(null);
  const [guestIdBackFile, setGuestIdBackFile]   = useState<File | null>(null);
  const [error, setError]                   = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Pre-fill form once booking is loaded ──
  useEffect(() => {
    if (!booking) return;
    setPropertyId(booking.propertyId);
    setGuestName(booking.guestName);
    setGuestEmail(booking.guestEmail ?? '');
    setGuestPhone(booking.guestPhone ?? '');
    setCheckIn(dayjs(booking.checkIn.toDate()).format('YYYY-MM-DD'));
    setCheckOut(dayjs(booking.checkOut.toDate()).format('YYYY-MM-DD'));
    setCheckInTime(booking.checkInTime ?? '');
    setCheckOutTime(booking.checkOutTime ?? '');
    setStatus(booking.status);
    setSource(booking.source);
    setRevenue(booking.revenue);
    setPlatformFee(booking.platformFee);
    setCleaningFee(booking.cleaningFee);
    setOtherExpenses(booking.otherExpenses);
    setNotes(booking.notes ?? '');
  }, [booking]);

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const netProfit = calculateNetProfit(
    Number(revenue) || 0,
    Number(platformFee) || 0,
    Number(cleaningFee) || 0,
    Number(otherExpenses) || 0
  );

  // ── Quick extend helpers ──
  function extendByNights(n: number) {
    if (!checkOut) return;
    setCheckOut(dayjs(checkOut).add(n, 'day').format('YYYY-MM-DD'));
  }

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!hostUser || !selectedProperty || !bookingId) throw new Error('Missing data');

      const bookingData = {
        propertyId,
        propertyType: selectedProperty.type,
        propertyName: selectedProperty.name,
        guestName,
        guestEmail,
        guestPhone,
        guestIdFront: booking?.guestIdFront ?? null,
        guestIdBack: booking?.guestIdBack ?? null,
        checkIn: Timestamp.fromDate(new Date(checkIn)),
        checkOut: Timestamp.fromDate(new Date(checkOut)),
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        nights,
        status,
        source,
        revenue: Number(revenue) || 0,
        platformFee: Number(platformFee) || 0,
        cleaningFee: Number(cleaningFee) || 0,
        otherExpenses: Number(otherExpenses) || 0,
        netProfit,
        notes,
      };

      await editBooking(hostUser.id, bookingId, bookingData);

      // Upload new guest ID photos if provided
      if (subscription.canUploadPhotos && (guestIdFrontFile || guestIdBackFile)) {
        const { updateBooking } = await import('@/services/bookingService');
        const updates: Record<string, string> = {};
        if (guestIdFrontFile) {
          updates.guestIdFront = await uploadGuestId(hostUser.id, bookingId, guestIdFrontFile, 'front');
        }
        if (guestIdBackFile) {
          updates.guestIdBack = await uploadGuestId(hostUser.id, bookingId, guestIdBackFile, 'back');
        }
        if (Object.keys(updates).length > 0) {
          await updateBooking(hostUser.id, bookingId, updates);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', hostUser?.id, bookingId] });
      navigate('/bookings');
    },
    onError: (err: Error) => setError(err.message),
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: () => deleteBooking(hostUser!.id, bookingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingCount'] });
      navigate('/bookings');
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) return setError('Select a property');
    if (!guestName.trim()) return setError('Guest name is required');
    if (!checkIn || !checkOut) return setError('Check-in and check-out dates are required');
    if (nights <= 0) return setError('Check-out must be after check-in');
    setError('');
    saveMutation.mutate();
  }

  // ── Loading state ──
  if (bookingLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton h="h-6" w="w-32" />
        <Skeleton h="h-8" w="w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Skeleton h="h-5" w="w-32" />
            <Skeleton h="h-10" w="w-full" />
            <Skeleton h="h-10" w="w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Booking not found.</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const inputCls = 'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150';

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Bookings
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Booking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{booking.guestName} · {booking.propertyName}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive mb-3">
            Are you sure you want to delete this booking? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-destructive px-4 py-1.5 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-xl border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive flex items-start gap-2">
          <span className="mt-0.5 shrink-0">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Guest info */}
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-base">Guest Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className={inputCls}
            >
              <option value="">Select property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Guest Name</label>
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guest Email</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guest Phone</label>
              <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Dates — prominently placed for "extend stay" use case */}
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            <h2 className="font-semibold text-base">Dates &amp; Times</h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            To extend the stay, simply move the Check-out date forward.
          </p>

          {/* Quick-extend shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Quick extend:</span>
            {[1, 2, 3, 7].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => extendByNights(n)}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
              >
                +{n} night{n > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out</label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Check-in Time <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Check-out Time <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className={inputCls} />
            </div>
          </div>
          {nights > 0 && (
            <div className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-2.5 text-sm font-medium text-primary">
              {nights} night{nights > 1 ? 's' : ''} total
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className={inputCls}>
                {BOOKING_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as BookingSource)} className={inputCls}>
                {BOOKING_SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-base">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Revenue (₱)</label>
              <input
                type="number"
                min={0}
                value={revenue}
                onChange={(e) => setRevenue(e.target.value ? Number(e.target.value) : '')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Platform Fee (₱)</label>
              <input
                type="number"
                min={0}
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value ? Number(e.target.value) : '')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cleaning Fee (₱)</label>
              <input
                type="number"
                min={0}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value ? Number(e.target.value) : '')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Expenses (₱)</label>
              <input
                type="number"
                min={0}
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(e.target.value ? Number(e.target.value) : '')}
                className={inputCls}
              />
            </div>
          </div>
          <div className="rounded-xl bg-muted px-4 py-3">
            <p className="text-sm font-medium">
              Net Profit:{' '}
              <span className={netProfit >= 0 ? 'text-green-600' : 'text-destructive'}>
                ₱{netProfit.toLocaleString()}
              </span>
            </p>
          </div>
        </section>

        {/* Guest ID upload (paid) */}
        {subscription.canUploadPhotos && (
          <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-base">Guest ID</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID Front</label>
                {booking.guestIdFront && (
                  <p className="text-xs text-muted-foreground mb-1.5">Current file saved — upload to replace.</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGuestIdFrontFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Back</label>
                {booking.guestIdBack && (
                  <p className="text-xs text-muted-foreground mb-1.5">Current file saved — upload to replace.</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGuestIdBackFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </div>
          </section>
        )}

        {/* Notes */}
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-base">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes…"
            className={`${inputCls} resize-none`}
          />
        </section>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, hsl(45 58% 62%) 0%, hsl(38 55% 52%) 100%)',
            boxShadow: saveMutation.isPending ? 'none' : '0 2px 12px hsla(45, 55%, 50%, 0.28)',
          }}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
