import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/services/bookingService';
import { getProperties } from '@/services/propertyService';
import { formatDate, formatCurrency } from '@/utils';
import { Booking } from '@/types';
import { X } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  pending: '#eab308',
  cancelled: '#ef4444',
  completed: '#3b82f6',
};

export function CalendarPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [propertyFilter, setPropertyFilter] = useState('');

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', hostUser?.id],
    queryFn: () => getBookings(hostUser!.id),
    enabled: !!hostUser,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  const events = useMemo(() => {
    const filtered = propertyFilter
      ? bookings.filter((b) => b.propertyId === propertyFilter)
      : bookings;

    return filtered.map((b) => ({
      id: b.id,
      title: `${b.guestName} — ${b.propertyName}`,
      start: b.checkIn.toDate(),
      end: b.checkOut.toDate(),
      backgroundColor: STATUS_COLORS[b.status] || '#6b7280',
      borderColor: STATUS_COLORS[b.status] || '#6b7280',
      extendedProps: { booking: b },
    }));
  }, [bookings, propertyFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View all bookings on a calendar</p>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs capitalize text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }}
          height="auto"
          eventClick={(info) => {
            const booking = info.event.extendedProps.booking as Booking;
            setSelectedBooking(booking);
          }}
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setSelectedBooking(null)}>
          <div className="rounded-xl bg-card border border-border p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedBooking.guestName}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Property:</span> {selectedBooking.propertyName}</p>
              <p><span className="text-muted-foreground">Check-in:</span> {formatDate(selectedBooking.checkIn.toDate())}</p>
              <p><span className="text-muted-foreground">Check-out:</span> {formatDate(selectedBooking.checkOut.toDate())}</p>
              <p><span className="text-muted-foreground">Nights:</span> {selectedBooking.nights}</p>
              <p><span className="text-muted-foreground">Status:</span> <span className="capitalize">{selectedBooking.status}</span></p>
              <p><span className="text-muted-foreground">Revenue:</span> {formatCurrency(selectedBooking.revenue)}</p>
              <p><span className="text-muted-foreground">Net Profit:</span> {formatCurrency(selectedBooking.netProfit)}</p>
              {selectedBooking.guestPhone && (
                <p><span className="text-muted-foreground">Phone:</span> {selectedBooking.guestPhone}</p>
              )}
              {selectedBooking.notes && (
                <p><span className="text-muted-foreground">Notes:</span> {selectedBooking.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
