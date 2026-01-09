"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Palette, Sparkles, Target, Heart, BarChart3, ShoppingBag, Wand2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const destinations = [
    { href: "/outfit-designer", label: "Outfit Designer", icon: Wand2, desc: "Chat with AI to design outfits" },
    { href: "/looks", label: "Looks & Planning", icon: Sparkles, desc: "Lookbook, outfit mixer, planner, inspiration" },
    { href: "/journey", label: "Journey", icon: Heart, desc: "Affirmations, progress photos, timeline" },
    { href: "/stats", label: "Stats", icon: BarChart3, desc: "Analytics, measurements, expiration, budget, imports" },
    { href: "/style-guide", label: "Style Guide", icon: Target, desc: "Advisor, weather, essentials, packing" },
    { href: "/color-lab", label: "Color Lab", icon: Palette, desc: "Analyzer and seasonal color analysis" },
    { href: "/wellness", label: "Wellness", icon: Heart, desc: "Training, trackers, journal, collections" },
    { href: "/social", label: "Social", icon: Sparkles, desc: "Ratings, achievements, challenges" },
    { href: "/shopping/recommendations", label: "Shopping Recs", icon: ShoppingBag, desc: "AI product picks" },
];

export default function StudioPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/looks");
    }, [router]);

    return (
        <PageTransition className="pb-24 pt-6 px-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Studio has moved</h1>
                <p className="text-sm text-muted-foreground">We've broken Studio into focused destinations. Pick where you want to go:</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {destinations.map((dest) => {
                    const Icon = dest.icon;
                    return (
                        <Link
                            key={dest.href}
                            href={dest.href}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-white/80 dark:bg-slate-900/60 hover:border-primary/50 transition-colors"
                        >
                            <div className="p-2 rounded-md bg-primary/10 text-primary">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">{dest.label}</div>
                                <div className="text-xs text-muted-foreground">{dest.desc}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                    );
                })}
            </div>
        </PageTransition>
    );
}
