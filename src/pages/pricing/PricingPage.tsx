import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PRICING } from '@/shared';
import { formatCurrency } from '@/utils';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Try BookingHosts with basic features',
    features: [
      '1 property (any type)',
      '3 bookings total',
      'Basic calendar (monthly grid)',
      'Basic revenue totals',
      'Expense tracking',
      'In-app notifications',
      '1 shareable guide link',
    ],
    cta: 'Get Started Free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: PRICING.starter,
    description: 'For hosts managing one property type',
    features: [
      'Unlimited properties (1 type)',
      'Unlimited bookings',
      'Full calendar (grid + timeline)',
      'Advanced analytics & charts',
      'Photo upload (property + receipts)',
      'Guest ID storage',
      'CSV/iCal import',
      'Email notifications',
      'Unlimited guide links',
    ],
    cta: 'Buy Starter — One-time',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: PRICING.pro,
    description: 'For hosts with multiple property types',
    features: [
      'Everything in Starter',
      'All property types (Airbnb + Resort + Apartment)',
      'Cross-type analytics',
      'Apartment tenant billing',
      'Resort amenity management',
      'Priority support',
    ],
    cta: 'Buy Pro — One-time',
    href: '/register',
    highlighted: true,
  },
];

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-primary">BookingHosts</h1>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-4xl font-bold">Simple, one-time pricing</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Pay once. Use forever. No monthly fees, no surprises.
        </p>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.highlighted
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

              <div className="mt-4">
                {plan.price === 0 ? (
                  <p className="text-3xl font-bold">Free</p>
                ) : (
                  <div>
                    <p className="text-3xl font-bold">{formatCurrency(plan.price)}</p>
                    <p className="text-sm text-muted-foreground">one-time payment</p>
                  </div>
                )}
              </div>

              <Link
                to={plan.href}
                className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already on Starter?{' '}
          <span className="font-medium">Upgrade to Pro for just {formatCurrency(PRICING.upgrade)}</span>
        </p>
      </section>
    </div>
  );
}
