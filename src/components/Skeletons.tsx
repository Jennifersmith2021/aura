"use client";

import { clsx } from "clsx";

export function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-40 bg-white/10 rounded-lg" />
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "h-4 bg-white/10 rounded",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 animate-pulse md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 h-48" />
      ))}
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-pulse">
      <div className="w-10 h-10 bg-white/10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonLine() {
  return <div className="h-4 bg-white/10 rounded w-full animate-pulse" />;
}
