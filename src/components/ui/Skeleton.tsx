import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Height — accepts any Tailwind h-* class value or inline style */
  h?: string;
  /** Width — accepts any Tailwind w-* class value or inline style */
  w?: string;
  /** Make the skeleton a circle (for avatars) */
  circle?: boolean;
}

export function Skeleton({ h = 'h-4', w = 'w-full', circle = false, className = '', ...rest }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${h} ${w} ${circle ? 'rounded-full' : ''} ${className}`}
      aria-hidden="true"
      {...rest}
    />
  );
}

/** Pre-built skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton h="h-10" w="w-10" className="rounded-xl" />
        <Skeleton h="h-3.5" w="w-28" />
      </div>
      <Skeleton h="h-7" w="w-20" />
      <Skeleton h="h-3" w="w-36" />
    </div>
  );
}

/** Pre-built skeleton for a list row */
export function ListRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-1.5 flex-1">
            <Skeleton h="h-3.5" w="w-36" />
            <Skeleton h="h-3" w="w-24" />
          </div>
          <Skeleton h="h-6" w="w-16" className="rounded-full" />
        </div>
      ))}
    </div>
  );
}
