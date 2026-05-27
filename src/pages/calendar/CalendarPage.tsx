import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { X, Pencil } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  pending: '#eab308',
  cancelled: '#ef4444',
  completed: '#3b82f6',
};

export function CalendarPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSelectedBooking(null)}>
          <div className="rounded-2xl bg-card border border-border w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold">{selectedBooking.guestName}</h3>
                <p className="text-sm text-muted-foreground">{selectedBooking.propertyName}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-medium">{formatDate(selectedBooking.checkIn.toDate())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-medium">{formatDate(selectedBooking.checkOut.toDate())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nights</span>
                <span className="font-medium">{selectedBooking.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`status-${selectedBooking.status} capitalize text-xs px-2 py-0.5 rounded-full`}>{selectedBooking.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">{formatCurrency(selectedBooking.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Profit</span>
                <span className="font-medium">{formatCurrency(selectedBooking.netProfit)}</span>
              </div>
              {selectedBooking.guestPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedBooking.guestPhone}</span>
                </div>
              )}
              {selectedBooking.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground mb-1">Notes</p>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="px-6 pb-5 pt-3 border-t border-border flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/bookings/${selectedBooking.id}/edit`)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Pencil size={14} /> Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
