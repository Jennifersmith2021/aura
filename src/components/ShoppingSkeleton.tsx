"use client";

export function ShoppingSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-border h-40">
                    <div className="h-28 bg-muted" />
                    <div className="p-3">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
