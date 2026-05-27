import { Lock, MessageCircle, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { requestPlanUpgrade } from '@/services/authService';
import { PRICING } from '@/shared';
import { useState } from 'react';

const FACEBOOK_URL = 'https://m.me/celevainvitation';

interface UpgradePromptProps {
  message: string;
  showStarterUpgrade?: boolean;
}

export function UpgradePrompt({ message, showStarterUpgrade = false }: UpgradePromptProps) {
  const { hostUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const currentPlan = hostUser?.plan ?? 'free';
  const pendingPlan = hostUser?.pendingPlan ?? null;

  async function handleUpgrade(plan: 'starter' | 'pro') {
    if (!hostUser) return;
    setLoading(true);
    try {
      await requestPlanUpgrade(hostUser.id, plan);
      window.open(FACEBOOK_URL, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  }

  const targetPlan = showStarterUpgrade && currentPlan === 'starter' ? 'pro' : currentPlan === 'free' ? 'starter' : 'pro';
  const price = targetPlan === 'pro' && currentPlan === 'starter' ? PRICING.upgrade : targetPlan === 'pro' ? PRICING.pro : PRICING.starter;
  const isPending = pendingPlan !== null;

  return (
    <div className="rounded-2xl border border-[#C4A574]/20 bg-gradient-to-br from-[#C4A574]/5 to-transparent p-6 text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C4A574]/10">
        <Lock className="h-7 w-7 text-[#C4A574]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">Upgrade Required</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {isPending ? (
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-5 py-2.5 text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Upgrade pending — Message us on Facebook
        </a>
      ) : (
        <button
          onClick={() => handleUpgrade(targetPlan)}
          disabled={loading}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Please wait…'
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Get {targetPlan === 'starter' ? 'Starter' : 'Pro'} — ₱{price.toLocaleString()}
            </>
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">
        One-time payment via GCash or bank transfer. Activated within 24 hours.
      </p>
    </div>
  );
}
