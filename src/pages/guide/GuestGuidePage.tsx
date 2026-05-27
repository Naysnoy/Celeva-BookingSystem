import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCheckInLink } from '@/services';
import { CheckInLink } from '@/types';
import {
  MapPin, Phone, Wifi, Key, Car, Clock, Users, Coffee,
  CreditCard, Music, Waves, Wrench, ChevronRight, Copy, Check,
  Home, Shield, Star,
} from 'lucide-react';

type Guide = Record<string, unknown>;
type ExtraCharge = { item: string; price: number };
type Amenity = { name: string; price: number; per: string };

const SECTION_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  location:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20',  icon: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
  schedule:    { bg: 'bg-blue-50 dark:bg-blue-900/20',        icon: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-100 dark:border-blue-800' },
  access:      { bg: 'bg-amber-50 dark:bg-amber-900/20',      icon: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-100 dark:border-amber-800' },
  parking:     { bg: 'bg-sky-50 dark:bg-sky-900/20',          icon: 'text-sky-600 dark:text-sky-400',         border: 'border-sky-100 dark:border-sky-800' },
  food:        { bg: 'bg-orange-50 dark:bg-orange-900/20',    icon: 'text-orange-600 dark:text-orange-400',   border: 'border-orange-100 dark:border-orange-800' },
  payment:     { bg: 'bg-teal-50 dark:bg-teal-900/20',        icon: 'text-teal-600 dark:text-teal-400',       border: 'border-teal-100 dark:border-teal-800' },
  pool:        { bg: 'bg-cyan-50 dark:bg-cyan-900/20',        icon: 'text-cyan-600 dark:text-cyan-400',       border: 'border-cyan-100 dark:border-cyan-800' },
  rules:       { bg: 'bg-slate-50 dark:bg-slate-900/20',      icon: 'text-slate-600 dark:text-slate-400',     border: 'border-slate-200 dark:border-slate-700' },
  maintenance: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',    icon: 'text-yellow-600 dark:text-yellow-400',   border: 'border-yellow-100 dark:border-yellow-800' },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={handleCopy} className="ml-2 rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Copy">
      {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
    </button>
  );
}

function Section({ colorKey, icon: Icon, title, children }: {
  colorKey: keyof typeof SECTION_COLORS;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const c = SECTION_COLORS[colorKey] ?? SECTION_COLORS.rules;
  return (
    <div className={`rounded-2xl border ${c.border} bg-white dark:bg-card overflow-hidden`}>
      <div className={`${c.bg} px-5 py-3.5 flex items-center gap-3 border-b ${c.border}`}>
        <div className="rounded-xl p-2 bg-white/60 dark:bg-black/20">
          <Icon size={18} className={c.icon} />
        </div>
        <h3 className="font-bold text-sm tracking-wide uppercase">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export function GuestGuidePage() {
  const { token } = useParams<{ token: string }>();
  const [link, setLink] = useState<CheckInLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('Invalid link'); setLoading(false); return; }
    getCheckInLink(token)
      .then((data) => { if (!data) setError('This guide link is no longer active'); else setLink(data); })
      .catch(() => setError('Failed to load guide'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F4ED]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C4A574] border-t-transparent" />
          <p className="text-sm text-[#7A6B5D] font-medium">Loading your guide...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F4ED] px-4">
        <div className="text-center max-w-xs">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#C4A574]/10 flex items-center justify-center">
            <Home size={28} className="text-[#C4A574]" />
          </div>
          <h1 className="text-xl font-bold text-[#3D3228]">Guide Not Found</h1>
          <p className="mt-2 text-sm text-[#7A6B5D]">{error}</p>
        </div>
      </div>
    );
  }

  const guide = link.guide as Guide;
  const extraCharges = (guide.extraCharges as ExtraCharge[] | undefined) ?? [];
  const amenities = (guide.amenities as Amenity[] | undefined) ?? [];
  const totalExtras = extraCharges.reduce((s, c) => s + c.price, 0);

  return (
    <div className="min-h-screen bg-[#F9F4ED]">

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #C4A574 0%, #A88255 55%, #5C3D1E 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,220,160,0.35) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
        <div className="relative px-6 pt-14 pb-10 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90 mb-4 capitalize">
            <Star size={11} className="fill-white/80 text-white/80" />
            {link.propertyType} Guest Guide
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {link.propertyName}
          </h1>
          <p className="mt-2 text-white/75 text-sm">Everything you need for a perfect stay</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {guide.checkInTime && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs text-white font-medium">
                <Clock size={11} /> In: {guide.checkInTime as string}
              </div>
            )}
            {guide.checkOutTime && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs text-white font-medium">
                <Clock size={11} /> Out: {guide.checkOutTime as string}
              </div>
            )}
            {guide.capacityLimit && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs text-white font-medium">
                <Users size={11} /> Max {guide.capacityLimit as number} guests
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* WiFi credential card */}
        {guide.wifiName && (
          <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
            <div className="px-5 pt-4 pb-2 flex items-center gap-2.5">
              <div className="rounded-xl bg-white/10 p-2"><Wifi size={18} className="text-violet-300" /></div>
              <span className="font-bold text-sm tracking-widest text-white/80 uppercase">WiFi Access</span>
            </div>
            <div className="px-5 pb-5 space-y-3 mt-1">
              <div className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs text-white/50 mb-0.5 uppercase tracking-wider">Network</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-lg">{guide.wifiName as string}</p>
                  <CopyButton value={guide.wifiName as string} />
                </div>
              </div>
              {guide.wifiPassword && (
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/50 mb-0.5 uppercase tracking-wider">Password</p>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold text-lg tracking-widest">{guide.wifiPassword as string}</p>
                    <CopyButton value={guide.wifiPassword as string} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {(guide.locationMap || guide.address) && (
          <Section colorKey="location" icon={MapPin} title="Location">
            {guide.address && <p className="text-sm text-[#3D3228] dark:text-foreground">{guide.address as string}</p>}
            {guide.locationMap && (
              <a href={guide.locationMap as string} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                Open in Google Maps <ChevronRight size={15} />
              </a>
            )}
          </Section>
        )}

        {/* Schedule */}
        {(guide.checkInTime || guide.checkOutTime) && (
          <Section colorKey="schedule" icon={Clock} title="Schedule">
            <div className="grid grid-cols-2 gap-3">
              {guide.checkInTime && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Check-in</p>
                  <p className="text-lg font-bold text-[#3D3228] dark:text-foreground">{guide.checkInTime as string}</p>
                </div>
              )}
              {guide.checkOutTime && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Check-out</p>
                  <p className="text-lg font-bold text-[#3D3228] dark:text-foreground">{guide.checkOutTime as string}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Access */}
        {guide.keyInstructions && (
          <Section colorKey="access" icon={Key} title="Access & Check-in">
            <p className="text-sm text-[#3D3228] dark:text-foreground leading-relaxed">{guide.keyInstructions as string}</p>
          </Section>
        )}

        {/* Parking */}
        {guide.parkingInfo && (
          <Section colorKey="parking" icon={Car} title="Parking">
            <p className="text-sm text-[#3D3228] dark:text-foreground leading-relaxed">{guide.parkingInfo as string}</p>
          </Section>
        )}

        {/* Food */}
        {guide.snacks && (
          <Section colorKey="food" icon={Coffee} title="Food & Snacks">
            <p className="text-sm text-[#3D3228] dark:text-foreground leading-relaxed">{guide.snacks as string}</p>
          </Section>
        )}

        {/* Pool */}
        {guide.poolRules && (
          <Section colorKey="pool" icon={Waves} title="Pool Rules">
            <p className="text-sm text-[#3D3228] dark:text-foreground leading-relaxed">{guide.poolRules as string}</p>
          </Section>
        )}

        {/* Karaoke */}
        {guide.karaokeRules && (
          <Section colorKey="rules" icon={Music} title="Karaoke">
            <p className="text-sm text-[#3D3228] dark:text-foreground leading-relaxed">{guide.karaokeRules as string}</p>
          </Section>
        )}

        {/* Extra charges */}
        {extraCharges.length > 0 && (
          <Section colorKey="payment" icon={CreditCard} title="Extra Charges">
            <div className="space-y-2">
              {extraCharges.map((charge, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#D9CFBE]/50 last:border-0">
                  <span className="text-sm text-[#3D3228] dark:text-foreground">{charge.item}</span>
                  <span className="text-sm font-bold text-[#C4A574]">P{charge.price.toLocaleString()}</span>
                </div>
              ))}
              {extraCharges.length > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
                  <span className="font-bold text-[#C4A574]">P{totalExtras.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <Section colorKey="food" icon={Star} title="Amenities">
            <div className="space-y-2">
              {amenities.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#D9CFBE]/50 last:border-0">
                  <span className="text-sm text-[#3D3228] dark:text-foreground">{a.name}</span>
                  <span className="text-sm font-bold text-[#C4A574]">P{a.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/{a.per}</span></span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Payment */}
        {(guide.paymentNotes || guide.monthlyRent) && (
          <Section colorKey="payment" icon={CreditCard} title="Payment">
            {guide.monthlyRent && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Monthly rent</span>
                <span className="font-bold text-[#C4A574]">P{(guide.monthlyRent as number).toLocaleString()}</span>
              </div>
            )}
            {guide.rentDueDate && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Due date</span>
                <span className="text-sm font-semibold">{guide.rentDueDate as number}th of the month</span>
              </div>
            )}
            {guide.paymentMethod && <p className="text-sm text-[#3D3228] dark:text-foreground mt-2">{guide.paymentMethod as string}</p>}
            {guide.paymentNotes && <p className="text-sm text-muted-foreground mt-1">{guide.paymentNotes as string}</p>}
          </Section>
        )}

        {/* Maintenance */}
        {guide.maintenanceContact && (
          <Section colorKey="maintenance" icon={Wrench} title="Maintenance">
            <p className="text-sm text-[#3D3228] dark:text-foreground">{guide.maintenanceContact as string}</p>
          </Section>
        )}

        {/* House rules */}
        {guide.houseRules && (
          <Section colorKey="rules" icon={Shield} title="House Rules">
            <div className="space-y-2">
              {(guide.houseRules as string).split('\n').filter(Boolean).map((rule, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">{i + 1}</span>
                  <p className="text-sm text-[#3D3228] dark:text-foreground leading-snug">{rule}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Extra notes */}
        {guide.extraNotes && (
          <div className="rounded-2xl border border-[#D9CFBE] bg-[#FCFBF9] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B5D] mb-2">Notes from your host</p>
            <p className="text-sm text-[#3D3228] leading-relaxed italic">{guide.extraNotes as string}</p>
          </div>
        )}

        {/* Contact CTA */}
        {guide.contactNumber && (
          <div className="rounded-2xl overflow-hidden border border-rose-100 dark:border-rose-900">
            <div className="bg-rose-50 dark:bg-rose-900/20 px-5 py-3.5 flex items-center gap-3 border-b border-rose-100 dark:border-rose-900">
              <div className="rounded-xl p-2 bg-white/60 dark:bg-black/20"><Phone size={18} className="text-rose-600 dark:text-rose-400" /></div>
              <h3 className="font-bold text-sm tracking-wide uppercase">Contact Host</h3>
            </div>
            <div className="bg-white dark:bg-card px-5 py-4 flex items-center justify-between gap-4">
              <div>
                {guide.contactName && <p className="font-semibold text-[#3D3228] dark:text-foreground">{guide.contactName as string}</p>}
                <p className="text-sm text-muted-foreground">{guide.contactNumber as string}</p>
              </div>
              <a href={`tel:${guide.contactNumber}`}
                className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#2A1F12] transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(to right, #C4A574, #A88255)' }}>
                <Phone size={14} /> Call
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 pb-8 text-center">
          <p className="text-xs text-[#7A6B5D]">
            Powered by <span className="font-bold text-[#C4A574]">BookingHosts</span>
          </p>
        </div>
      </div>
    </div>
  );
}