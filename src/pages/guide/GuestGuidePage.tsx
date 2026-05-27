import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCheckInLink } from '@/services';
import { CheckInLink } from '@/types';
import { MapPin, Phone, Wifi, Key, Car, Clock, Users, Coffee, CreditCard, Music, Waves, Wrench } from 'lucide-react';

export function GuestGuidePage() {
  const { token } = useParams<{ token: string }>();
  const [link, setLink] = useState<CheckInLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGuide() {
      if (!token) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        const data = await getCheckInLink(token);
        if (!data) {
          setError('This guide link is no longer active');
        } else {
          setLink(data);
        }
      } catch {
        setError('Failed to load guide');
      } finally {
        setLoading(false);
      }
    }

    fetchGuide();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Guide Not Found</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const guide = link.guide as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="rounded-xl bg-card border border-border p-6 mb-4">
          <h1 className="text-2xl font-bold">{link.propertyName}</h1>
          <p className="text-sm text-muted-foreground capitalize mt-1">
            {link.propertyType} Guide
          </p>
        </div>

        {/* Location */}
        {guide.locationMap && (
          <GuideSection icon={MapPin} title="Location">
            <p className="text-sm">{guide.address as string}</p>
            <a
              href={guide.locationMap as string}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-primary hover:underline font-medium"
            >
              Get Directions →
            </a>
          </GuideSection>
        )}

        {/* Check-in/out times */}
        {(guide.checkInTime || guide.checkOutTime) && (
          <GuideSection icon={Clock} title="Schedule">
            {guide.checkInTime && <p className="text-sm">Check-in: {guide.checkInTime as string}</p>}
            {guide.checkOutTime && <p className="text-sm">Check-out: {guide.checkOutTime as string}</p>}
          </GuideSection>
        )}

        {/* WiFi */}
        {guide.wifiName && (
          <GuideSection icon={Wifi} title="WiFi">
            <p className="text-sm">Network: <strong>{guide.wifiName as string}</strong></p>
            {guide.wifiPassword && (
              <p className="text-sm">Password: <strong>{guide.wifiPassword as string}</strong></p>
            )}
          </GuideSection>
        )}

        {/* Key instructions */}
        {guide.keyInstructions && (
          <GuideSection icon={Key} title="Access">
            <p className="text-sm">{guide.keyInstructions as string}</p>
          </GuideSection>
        )}

        {/* Parking */}
        {guide.parkingInfo && (
          <GuideSection icon={Car} title="Parking">
            <p className="text-sm">{guide.parkingInfo as string}</p>
          </GuideSection>
        )}

        {/* Contact */}
        {guide.contactNumber && (
          <GuideSection icon={Phone} title="Contact">
            <p className="text-sm">{guide.contactName as string}</p>
            <a
              href={`tel:${guide.contactNumber}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              {guide.contactNumber as string}
            </a>
          </GuideSection>
        )}

        {/* Snacks */}
        {guide.snacks && (
          <GuideSection icon={Coffee} title="Snacks">
            <p className="text-sm">{guide.snacks as string}</p>
          </GuideSection>
        )}

        {/* Payment */}
        {(guide.paymentNotes || guide.monthlyRent) && (
          <GuideSection icon={CreditCard} title="Payment">
            {guide.monthlyRent && (
              <p className="text-sm">Monthly Rent: <strong>₱{(guide.monthlyRent as number).toLocaleString()}</strong></p>
            )}
            {guide.rentDueDate && (
              <p className="text-sm">Due every: <strong>{guide.rentDueDate as number}th of the month</strong></p>
            )}
            {guide.paymentMethod && (
              <p className="text-sm mt-1">{guide.paymentMethod as string}</p>
            )}
            {guide.paymentNotes && (
              <p className="text-sm">{guide.paymentNotes as string}</p>
            )}
          </GuideSection>
        )}

        {/* Karaoke (Resort) */}
        {guide.karaokeRules && (
          <GuideSection icon={Music} title="Karaoke">
            <p className="text-sm">{guide.karaokeRules as string}</p>
          </GuideSection>
        )}

        {/* Pool (Resort) */}
        {guide.poolRules && (
          <GuideSection icon={Waves} title="Pool Rules">
            <p className="text-sm">{guide.poolRules as string}</p>
          </GuideSection>
        )}

        {/* Capacity (Resort) */}
        {guide.capacityLimit && (
          <GuideSection icon={Users} title="Capacity">
            <p className="text-sm">Maximum: <strong>{guide.capacityLimit as number} guests</strong></p>
          </GuideSection>
        )}

        {/* Extra charges (Resort) */}
        {guide.extraCharges && Array.isArray(guide.extraCharges) && (guide.extraCharges as Array<{item: string; price: number}>).length > 0 && (
          <GuideSection icon={CreditCard} title="Extra Charges">
            <ul className="space-y-1">
              {(guide.extraCharges as Array<{item: string; price: number}>).map((charge, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{charge.item}</span>
                  <span className="font-medium">₱{charge.price}</span>
                </li>
              ))}
            </ul>
          </GuideSection>
        )}

        {/* Maintenance contact (Apartment) */}
        {guide.maintenanceContact && (
          <GuideSection icon={Wrench} title="Maintenance">
            <p className="text-sm">{guide.maintenanceContact as string}</p>
          </GuideSection>
        )}

        {/* House rules */}
        {guide.houseRules && (
          <GuideSection icon={Clock} title="House Rules">
            <p className="text-sm whitespace-pre-line">{guide.houseRules as string}</p>
          </GuideSection>
        )}

        {/* Extra notes */}
        {guide.extraNotes && (
          <div className="rounded-xl bg-card border border-border p-5 mb-4">
            <p className="text-sm text-muted-foreground">{guide.extraNotes as string}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by BookingHosts
        </p>
      </div>
    </div>
  );
}

function GuideSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
