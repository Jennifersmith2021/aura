"use client";

import { useStore } from "@/hooks/useStore";
import { getExpirationStatus, getDaysRemaining } from "@/utils/expiration";
import { AlertTriangle, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";

export function MakeupExpiration() {
    const { items } = useStore();

    const makeupItems = items.filter((i) => i.type === "makeup" && i.dateOpened).map(item => ({
        ...item,
        status: getExpirationStatus(item),
        daysLeft: getDaysRemaining(item)
    })).sort((a, b) => a.daysLeft - b.daysLeft); // Sort by urgency (lowest days first)

    const expiring = makeupItems.filter(i => i.status === "warning");
    const expired = makeupItems.filter(i => i.status === "expired");
    const good = makeupItems.filter(i => i.status === "good");

    // Calculate health score
    const totalWithDates = makeupItems.length;
    const healthScore = totalWithDates ? Math.round(((totalWithDates - expired.length) / totalWithDates) * 100) : 100;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Vanity Health</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                    <div className={`text-3xl font-bold mb-1 ${healthScore > 80 ? "text-emerald-500" :
                            healthScore > 50 ? "text-amber-500" : "text-rose-500"
                        }`}>
                        {healthScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Freshness Score</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {expired.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Expired Items</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Replacement Watchlist</span>
                </div>

                {makeupItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No makeup items with open dates tracked.
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {/* Prioritize Expired and Warning */}
                        {[...expired, ...expiring, ...good.slice(0, 3)].map((item) => (
                            <div key={item.id} className="p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 relative overflow-hidden">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                                </div>
                                <div className="text-right">
                                    {item.status === "expired" && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                            <AlertCircle className="w-3 h-3" /> Expired
                                        </span>
                                    )}
                                    {item.status === "warning" && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                            <AlertTriangle className="w-3 h-3" /> {item.daysLeft}d left
                                        </span>
                                    )}
                                    {item.status === "good" && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" /> {Math.round(item.daysLeft / 30)}mo left
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {good.length > 3 && expired.length + expiring.length === 0 && (
                            <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
                                + {good.length - 3} more healthy items
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
