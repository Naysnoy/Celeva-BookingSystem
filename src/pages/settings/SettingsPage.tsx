import { useState } from 'react';
import { CheckCircle, Clock, ExternalLink, MessageCircle, Star, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { requestPlanUpgrade } from '@/services/authService';
import { PRICING } from '@/shared';
import { PlanType } from '@/types';

const FACEBOOK_URL = 'https://m.me/celevainvitation';

const PLAN_INFO: Record<Exclude<PlanType, 'free'>, { label: string; price: number; features: string[] }> = {
  starter: {
    label: 'Starter',
    price: PRICING.starter,
    features: [
      'Unlimited properties (1 type)',
      'Unlimited bookings',
      'Full calendar (grid + timeline)',
      'Advanced analytics & charts',
      'Photo upload (property + receipts)',
      'Guest ID storage',
      'Unlimited guide links',
    ],
  },
  pro: {
    label: 'Pro',
    price: PRICING.pro,
    features: [
      'Everything in Starter',
      'All property types (Airbnb + Resort + Apartment)',
      'Cross-type analytics',
      'Apartment tenant billing',
      'Resort amenity management',
      'Priority support',
    ],
  },
};

export function SettingsPage() {
  const { hostUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = hostUser?.plan ?? 'free';
  const pendingPlan = hostUser?.pendingPlan ?? null;

  async function handleRequestUpgrade(plan: PlanType) {
    if (!hostUser) return;
    setError(null);
    setLoading(true);
    try {
      await requestPlanUpgrade(hostUser.id, plan);
    } catch (err) {
      setError('Failed to submit upgrade request. Please try again.');
      setLoading(false);
      return;
    }
    setLoading(false);
    window.open(FACEBOOK_URL, '_blank');
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and subscription.</p>
      </div>

      {/* Current plan */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold text-lg">Current Plan</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="capitalize rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
            {currentPlan}
          </span>
          {currentPlan !== 'free' && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Active
            </span>
          )}
          {pendingPlan && (
            <span className="flex items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-400">
              <Clock className="h-4 w-4" />
              Upgrade to <span className="font-medium capitalize">{pendingPlan}</span> pending approval
            </span>
          )}
        </div>

        {pendingPlan && (
          <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground space-y-2">
            <p>Your upgrade request has been submitted. Message us on Facebook to complete your payment and we'll activate your plan within 24 hours.</p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Message us on Facebook
            </a>
          </div>
        )}
      </section>

      {/* Upgrade section */}
      {currentPlan !== 'pro' && (
        <section className="space-y-4">
          <h2 className="font-semibold text-lg">Upgrade Your Plan</h2>
          <p className="text-sm text-muted-foreground">
            One-time payment. Message us on Facebook, send your payment (GCash/bank transfer), and we'll activate your plan within 24 hours.
          </p>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(PLAN_INFO) as [Exclude<PlanType, 'free'>, typeof PLAN_INFO['starter']][]).map(
              ([key, info]) => {
                const isCurrentPlan = currentPlan === key;
                const isPending = pendingPlan === key;
                const isUpgrade = key === 'pro' && currentPlan === 'starter';
                const price = isUpgrade ? PRICING.upgrade : info.price;

                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-5 space-y-4 ${
                      key === 'pro'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {key === 'pro' ? (
                          <Zap className="h-4 w-4 text-primary" />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold">{info.label}</span>
                      </div>
                      {key === 'pro' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-2xl font-bold">₱{price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {isUpgrade ? 'upgrade from Starter' : 'one-time'}
                      </span>
                    </div>

                    <ul className="space-y-1.5">
                      {info.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <div className="w-full text-center text-sm text-muted-foreground py-2 rounded-lg border border-border">
                        Current Plan
                      </div>
                    ) : isPending ? (
                      <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Pending — Message us
                      </a>
                    ) : (
                      <button
                        onClick={() => handleRequestUpgrade(key)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {loading ? (
                          'Please wait…'
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            Get {info.label}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            After clicking, you'll be redirected to our Facebook page. Send your payment via GCash or bank transfer and include the email you registered with. We'll activate your plan within 24 hours.
          </p>
        </section>
      )}
    </div>
  );
}

