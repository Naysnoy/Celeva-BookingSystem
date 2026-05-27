import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PLAN_LIMITS } from '@/shared';
import { PlanType, PropertyType } from '@/types';

export interface PlanLimits {
  maxProperties: number;
  maxBookings: number;
}

export interface SubscriptionInfo {
  plan: PlanType;
  limits: PlanLimits;
  isPaid: boolean;
  canUploadPhotos: boolean;
  canUseTimeline: boolean;
  canUseAdvancedRevenue: boolean;
  canImport: boolean;
  canEmailNotify: boolean;
  canAddProperty: (currentCount: number) => boolean;
  canAddPropertyOfType: (type: PropertyType) => boolean;
  canAddBooking: (currentCount: number) => boolean;
  canShareGuide: (currentLinkCount: number) => boolean;
  getUpgradeReason: (action: SubscriptionAction) => string | null;
}

export type SubscriptionAction =
  | { type: 'addProperty'; currentCount: number; propertyType: PropertyType }
  | { type: 'addBooking'; currentCount: number }
  | { type: 'uploadPhoto' }
  | { type: 'uploadGuestId' }
  | { type: 'uploadReceipt' }
  | { type: 'useTimeline' }
  | { type: 'useAdvancedRevenue' }
  | { type: 'import' }
  | { type: 'shareGuide'; currentLinkCount: number };

export function useSubscription(): SubscriptionInfo {
  const { hostUser } = useAuth();

  return useMemo(() => {
    const plan: PlanType = hostUser?.plan ?? 'free';
    const allowedTypes = hostUser?.allowedTypes ?? [];
    const limits = PLAN_LIMITS[plan];
    const isPaid = plan !== 'free';

    function canAddProperty(currentCount: number): boolean {
      return currentCount < limits.maxProperties;
    }

    function canAddPropertyOfType(type: PropertyType): boolean {
      if (plan === 'pro') return true;
      if (plan === 'starter') {
        // No type locked in yet — any type is allowed (first property will lock it)
        if (allowedTypes.length === 0) return true;
        return allowedTypes.includes(type);
      }
      // Free: any type allowed (limited by count, not type)
      return true;
    }

    function canAddBooking(currentCount: number): boolean {
      return currentCount < limits.maxBookings;
    }

    function canShareGuide(currentLinkCount: number): boolean {
      if (isPaid) return true;
      return currentLinkCount < 1;
    }

    function getUpgradeReason(action: SubscriptionAction): string | null {
      switch (action.type) {
        case 'addProperty':
          if (!canAddProperty(action.currentCount)) {
            return plan === 'free'
              ? 'Free plan allows 1 property. Upgrade to add unlimited properties.'
              : 'Upgrade to add more properties.';
          }
          if (!canAddPropertyOfType(action.propertyType)) {
            return `Your Starter plan only covers ${allowedTypes.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')} properties. Upgrade to Pro for ₱1,000 to unlock all property types.`;
          }
          return null;

        case 'addBooking':
          if (!canAddBooking(action.currentCount)) {
            return 'Free plan allows 3 bookings total. Upgrade to add unlimited bookings.';
          }
          return null;

        case 'uploadPhoto':
        case 'uploadGuestId':
        case 'uploadReceipt':
          if (!isPaid) {
            return 'Photo and file uploads are available on Starter and Pro plans.';
          }
          return null;

        case 'useTimeline':
          if (!isPaid) {
            return 'Timeline/Gantt view is available on Starter and Pro plans.';
          }
          return null;

        case 'useAdvancedRevenue':
          if (!isPaid) {
            return 'Advanced analytics and charts are available on Starter and Pro plans.';
          }
          return null;

        case 'import':
          if (!isPaid) {
            return 'CSV/iCal import is available on Starter and Pro plans.';
          }
          return null;

        case 'shareGuide':
          if (!canShareGuide(action.currentLinkCount)) {
            return 'Free plan allows 1 guide link. Upgrade to share unlimited guide links.';
          }
          return null;

        default:
          return null;
      }
    }

    return {
      plan,
      limits,
      isPaid,
      canUploadPhotos: isPaid,
      canUseTimeline: isPaid,
      canUseAdvancedRevenue: isPaid,
      canImport: isPaid,
      canEmailNotify: isPaid,
      canAddProperty,
      canAddPropertyOfType,
      canAddBooking,
      canShareGuide,
      getUpgradeReason,
    };
  }, [hostUser]);
}
