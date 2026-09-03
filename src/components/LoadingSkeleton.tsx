"use client";

import React from "react";

export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/70 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] bg-neutral-200" />
      {/* Info skeleton */}
      <div className="p-3 space-y-2">
        <div className="w-4/5 h-4 bg-neutral-200 rounded" />
        <div className="w-1/2 h-3.5 bg-neutral-200 rounded" />
        <div className="w-3/5 h-3 bg-neutral-100 rounded-full" />
        <div className="w-full h-3 bg-neutral-100 rounded" />
        <div className="mt-1 w-full h-8 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  );
}

export function MenuGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(count)].map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  );
}
