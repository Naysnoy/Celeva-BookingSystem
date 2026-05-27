import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingCount, createBooking } from '@/services/bookingService';
import { getProperties } from '@/services/propertyService';
import { uploadGuestId } from '@/services/storageService';
import { BOOKING_STATUS_OPTIONS, BOOKING_SOURCE_OPTIONS } from '@/shared';
import { BookingStatus, BookingSource, Property } from '@/types';
import { calculateNetProfit, calculateNights } from '@/utils';
import { Timestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export function AddBookingPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookingCount = 0 } = useQuery({
    queryKey: ['bookingCount', hostUser?.id],
    queryFn: () => getBookingCount(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  const [propertyId, setPropertyId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState<BookingStatus>('confirmed');
  const [source, setSource] = useState<BookingSource>('manual');
  const [revenue, setRevenue] = useState<number | ''>('');
  const [platformFee, setPlatformFee] = useState<number | ''>(0);
  const [cleaningFee, setCleaningFee] = useState<number | ''>(0);
  const [otherExpenses, setOtherExpenses] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  const [guestIdFrontFile, setGuestIdFrontFile] = useState<File | null>(null);
  const [guestIdBackFile, setGuestIdBackFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const netProfit = calculateNetProfit(
    Number(revenue) || 0,
    Number(platformFee) || 0,
    Number(cleaningFee) || 0,
    Number(otherExpenses) || 0
  );

  const upgradeReason = subscription.getUpgradeReason({
    type: 'addBooking',
    currentCount: bookingCount,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!hostUser || !selectedProperty) throw new Error('Missing data');

      const bookingData = {
        propertyId,
        propertyType: selectedProperty.type,
        propertyName: selectedProperty.name,
        guestName,
        guestEmail,
        guestPhone,
        guestIdFront: null as string | null,
        guestIdBack: null as string | null,
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

      const bookingId = await createBooking(hostUser.id, bookingData);

      // Upload guest IDs (paid only)
      if (subscription.canUploadPhotos) {
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

      return bookingId;
    },
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
    createMutation.mutate();
  }

  if (upgradeReason) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Add Booking</h1>
        <UpgradePrompt message={upgradeReason} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/bookings')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to Bookings
      </button>

      <h1 className="text-2xl font-bold mb-6">Add Booking</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {properties.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">You need to add a property before creating a booking.</p>
          <button onClick={() => navigate('/properties/add')} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Add Property</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property + Guest */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Booking Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Property</label>
              <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guest Name</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Guest Email</label>
                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guest Phone</label>
                <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </section>

          {/* Dates */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Dates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in Time <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out Time <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Set times to allow multiple bookings on the same day (e.g. morning &amp; afternoon resort rentals).</p>
            {nights > 0 && (
              <p className="text-sm text-muted-foreground">{nights} night{nights > 1 ? 's' : ''}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {BOOKING_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value as BookingSource)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {BOOKING_SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Revenue (₱)</label>
                <input type="number" min={0} value={revenue} onChange={(e) => setRevenue(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform Fee (₱)</label>
                <input type="number" min={0} value={platformFee} onChange={(e) => setPlatformFee(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cleaning Fee (₱)</label>
                <input type="number" min={0} value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Other Expenses (₱)</label>
                <input type="number" min={0} value={otherExpenses} onChange={(e) => setOtherExpenses(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-sm font-medium">Net Profit: <span className={netProfit >= 0 ? 'text-green-600' : 'text-destructive'}>₱{netProfit.toLocaleString()}</span></p>
            </div>
          </section>

          {/* Guest ID Upload (paid) */}
          {subscription.canUploadPhotos && (
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold">Guest ID</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID Front</label>
                  <input type="file" accept="image/*" onChange={(e) => setGuestIdFrontFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Back</label>
                  <input type="file" accept="image/*" onChange={(e) => setGuestIdBackFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Notes</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional notes..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </section>

          <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full disabled:opacity-50">
            {createMutation.isPending ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      )}
    </div>
  );
}
