"use client";

import { useStore } from "@/hooks/useStore";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { useState } from "react";
import { Plus, Shirt, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { ShoppingWidget } from "@/components/ShoppingWidget";
import { Timeline } from "@/components/Timeline";
import { getDailyQuote } from "@/utils/quotes";

export default function Dashboard() {
  const { items, loading, addItem } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quote] = useState(() => getDailyQuote());

  const clothingCount = items.filter((i) => i.type === "clothing").length;
  const makeupCount = items.filter((i) => i.type === "makeup").length;
  const recentItems = [...items].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 4);

  if (loading) return <div className="p-8 text-center">Loading Aura...</div>;

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
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-purple-500 p-[2px]">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
            <span className="font-bold text-xs">JD</span>
          </div>
        </div>
      </div>

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

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-medium shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Item
        </button>
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
        onAdd={addItem}
      />
      {/* Style Journey */}
      <div>
        <Timeline />
      </div>

    </PageTransition>
  );
}
