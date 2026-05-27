import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background:
          'linear-gradient(145deg, hsl(45 40% 93%) 0%, hsl(38 30% 89%) 50%, hsl(45 35% 95%) 100%)',
      }}
    >
      {/* Decorative soft-glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, hsl(45 58% 70%) 0%, transparent 65%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(38 50% 72%) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(45 45% 75%) 0%, transparent 60%)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(45 58% 62%) 0%, hsl(38 55% 52%) 100%)',
              boxShadow: '0 8px 24px hsla(45, 55%, 45%, 0.35)',
            }}
          >
            <span
              className="text-3xl text-white select-none"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              B
            </span>
          </div>
          <h1
            className="text-[2.4rem] leading-tight text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            BookingHosts
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your Airbnb, Resort &amp; Apartment bookings
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-border bg-card p-8"
          style={{ boxShadow: '0 8px 48px hsla(35, 35%, 40%, 0.10), 0 1px 4px hsla(35, 25%, 40%, 0.08)' }}
        >
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} BookingHosts. All rights reserved.
        </p>
      </div>
    </div>
  );
}
