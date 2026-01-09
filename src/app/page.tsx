"use client";

import { useStore } from "@/hooks/useStore";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { DailyChallengeWidget } from "@/components/DailyChallengeWidget";
import DashboardWidget from "@/components/Dashboard";
import GoalPlanningTools from "@/components/GoalPlanningTools";
import { QuickMetrics } from "@/components/QuickMetrics";
import { QuickStatsWidget } from "@/components/QuickStatsWidget";
import { useState } from "react";
import { LogIn, LogOut, Plus, Shirt, Sparkles, LayoutDashboard, Target, Wand2 } from "lucide-react";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { ShoppingWidget } from "@/components/ShoppingWidget";
import { Timeline } from "@/components/Timeline";
import { getDailyQuote } from "@/utils/quotes";
import DailySchedule from "@/components/DailySchedule";
import DailyProgressSummary from "@/components/DailyProgressSummary";
import AffirmationOfTheDay from "@/components/AffirmationOfTheDay";
import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";

export default function Dashboard() {
  const { items, loading, addItem } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quote] = useState(() => getDailyQuote());
  const [activeView, setActiveView] = useState<"home" | "dashboard" | "goals">("home");
  const { data: session, status } = useSession();

  const clothingCount = items.filter((i) => i.type === "clothing").length;
  const makeupCount = items.filter((i) => i.type === "makeup").length;
  const recentItems = [...items].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 4);

  if (loading) return <div className="p-8 text-center">Loading Aura...</div>;

  const userInitials = (session?.user?.name || session?.user?.email || "Guest")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <PageTransition className="pb-24 pt-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            Good Morning
          </h1>
          <p className="text-muted-foreground text-sm mt-1 italic">&quot;{quote}&quot;</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{session?.user?.name || session?.user?.email || "Guest"}</p>
            <p className="text-xs text-muted-foreground">
              {status === "authenticated" ? "Synced" : "Offline mode"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
              <span className="font-bold text-xs">{userInitials}</span>
            </div>
          </div>
          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-primary">
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { id: "home", label: "Home", icon: Sparkles },
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "goals", label: "Goals", icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
              activeView === tab.id
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Home View */}
      {activeView === "home" && (
        <>
          {/* Affirmation of the Day */}
          <AffirmationOfTheDay />

          {/* Daily Challenges */}
          <DailyChallengeWidget />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800">
          <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
            <Shirt className="w-5 h-5" />
            <span className="font-medium">Closet</span>
          </div>
          <p className="text-2xl font-bold">{clothingCount}</p>
          <p className="text-xs text-muted-foreground">Items</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Vanity</span>
          </div>
          <p className="text-2xl font-bold">{makeupCount}</p>
          <p className="text-xs text-muted-foreground">Products</p>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daily Tasks</h2>
          <Link href="/sissy" className="text-sm text-primary font-medium">
            Open Full Schedule
          </Link>
        </div>
        <DailySchedule />
        <DailyProgressSummary />
      </div>

      {/* Quick Metrics */}
      <QuickMetrics />

      {/* Quick Stats Widget */}
      <QuickStatsWidget />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-medium shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
          <Link
            href="/outfit-designer"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-purple-200 dark:shadow-none active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Design Outfit
          </Link>
        </div>
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recently Added</h2>
          <Link href="/closet" className="text-sm text-primary font-medium">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
        {recentItems.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Your collection is empty. Start adding items!
          </p>
        )}
      </div>
      {/* Shopping Widget (wishlist & recommendations) */}
      <div>
        <ShoppingWidget showWishlistOnly={true} limit={4} />
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(item) => {
          addItem(item);
          toast.success(`Added ${item.name}!`);
        }}
      />
      {/* Style Journey */}
      <div>
        <Timeline />
      </div>
        </>
      )}

      {/* Dashboard View */}
      {activeView === "dashboard" && <DashboardWidget />}

      {/* Goals View */}
      {activeView === "goals" && <GoalPlanningTools />}


    </PageTransition>
  );
}
