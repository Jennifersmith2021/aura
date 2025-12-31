"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Sparkles, Brush, ShoppingBag, Dumbbell, Wind, Target, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/closet", label: "Closet", icon: Shirt },
        { href: "/shopping", label: "Shop", icon: ShoppingBag },
        { href: "/vanity", label: "Vanity", icon: Brush },
        { href: "/studio", label: "Studio", icon: Sparkles },
    ];

    const trainingLinks = [
        { href: "/training", label: "Training Hub", icon: Target },
        { href: "/training/workouts", label: "Workouts", icon: Dumbbell },
        { href: "/training/affirmations", label: "Affirmations", icon: Sparkles },
        { href: "/training/supplements", label: "Supplements", icon: Heart },
        { href: "/training/logs", label: "Training Logs", icon: Wind },
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
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
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

                {/* Training Section */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        Training
                    </h3>
                    <div className="space-y-1">
                        {trainingLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname.startsWith(link.href);
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
