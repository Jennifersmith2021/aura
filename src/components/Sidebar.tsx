"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Sparkles, Brush, ShoppingBag, Dumbbell, Wind, Target, Heart, Package, ListChecks, Settings, Palette, Compass, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    const mainLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/closet", label: "Closet", icon: Shirt },
        { href: "/looks", label: "Looks", icon: Sparkles },
        { href: "/journey", label: "Journey", icon: Compass },
        { href: "/stats", label: "Stats", icon: BarChart3 },
    ];

    const styleLinks = [
        { href: "/vanity", label: "Vanity", icon: Brush },
        { href: "/style-guide", label: "Style Guide", icon: Target },
        { href: "/color-lab", label: "Color Lab", icon: Palette },
    ];

    const trainingLinks = [
        { href: "/training", label: "Training Hub", icon: Dumbbell },
        { href: "/training/workouts", label: "Workouts", icon: Dumbbell },
        { href: "/training/affirmations", label: "Affirmations", icon: Sparkles },
        { href: "/training/supplements", label: "Supplements", icon: Heart },
        { href: "/training/logs", label: "Training Logs", icon: Wind },
    ];

    const wellnessLinks = [
        { href: "/wellness", label: "Wellness", icon: Heart },
        { href: "/social", label: "Social", icon: Sparkles },
        { href: "/sissy", label: "Sissy Journey", icon: Heart },
    ];

    const shoppingLinks = [
        { href: "/shopping", label: "Shop", icon: ShoppingBag },
        { href: "/shopping/recommendations", label: "AI Recs", icon: Sparkles },
        { href: "/amazon", label: "Amazon Sync", icon: Package },
        { href: "/wishlist", label: "Wishlist", icon: ListChecks },
    ];

    const systemLinks = [
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className="hidden lg:flex lg:flex-col w-72 border-r border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 text-white p-6 sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-7 h-7" fill="currentColor" />
                    <h1 className="text-xl font-bold">Aura</h1>
                </div>
                <p className="text-white/90 text-sm">
                    Your style & beauty companion
                </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-6">
                {/* Main Navigation */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Main
                    </h3>
                    <div className="space-y-1">
                        {mainLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Style & Fit */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Style & Fit
                    </h3>
                    <div className="space-y-1">
                        {styleLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Training */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Training
                    </h3>
                    <div className="space-y-1">
                        {trainingLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Wellness & Social */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Wellness & Social
                    </h3>
                    <div className="space-y-1">
                        {wellnessLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Shopping & Sync */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Shopping & Sync
                    </h3>
                    <div className="space-y-1">
                        {shoppingLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* System */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        System
                    </h3>
                    <div className="space-y-1">
                        {systemLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                                            : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Footer Info */}
            <div className="p-4 border-t border-border">
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg p-3 border border-pink-500/20">
                    <p className="text-xs text-muted-foreground font-medium">
                        ✨ Your journey to femininity and self-expression
                    </p>
                </div>
            </div>
        </aside>
    );
}
