import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* â”€â”€ Left panel: Hero image / brand â”€â”€ */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[52%] flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #C4A574 0%, #8A6840 60%, #5C3D1E 100%)',
        }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 0),
                              radial-gradient(circle at 75% 75%, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 65%)' }} />
          <div className="absolute bottom-[-5%] left-[-5%] h-[400px] w-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(255,220,160,0.5) 0%, transparent 65%)' }} />
        </div>

        {/* Top logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-2xl text-white select-none" style={{ fontFamily: "'Great Vibes', cursive" }}>B</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">BookingHosts</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 px-10 pb-4">
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Manage your properties like a pro
          </h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            Track bookings, revenue, and guests across all your Airbnb, resort, and apartment listings in one place.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex gap-8">
            {[
              { value: '500+', label: 'Active hosts' },
              { value: '10K+', label: 'Bookings tracked' },
              { value: '99%', label: 'Uptime' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 p-10 pt-8">
          <div className="flex gap-2">
            {['Airbnb', 'Resort', 'Apartment', 'Condo'].map((type) => (
              <span key={type} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white/80 font-medium">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Right panel: Form â”€â”€ */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="mb-8 text-center lg:hidden">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C4A574 0%, #8A6840 100%)' }}
          >
            <span className="text-2xl text-white select-none" style={{ fontFamily: "'Great Vibes', cursive" }}>B</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">BookingHosts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your rental bookings</p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            {children}
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Â© {new Date().getFullYear()} BookingHosts Â· All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
