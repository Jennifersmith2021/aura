"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Sparkles, Scissors, Menu, Brush, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/closet", label: "Closet", icon: Shirt },
        { href: "/shopping", label: "Shop", icon: ShoppingBag },
        { href: "/vanity", label: "Vanity", icon: Brush },
        { href: "/fitting-room", label: "Try On", icon: Scissors },
        { href: "/studio", label: "Studio", icon: Menu },
        { href: "/stylist", label: "Ask Aura", icon: Sparkles },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-border z-50 pb-safe">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-16 space-y-1 transition-all duration-300",
                                isActive
                                    ? "text-primary scale-110"
                                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                            )}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
