"use client";

import { PageTransition } from "@/components/PageTransition";
import { AmazonOrderSync } from "@/components/AmazonOrderSync";
import { AmazonInventoryManager } from "@/components/AmazonInventoryManager";
import { useState } from "react";
import { Package, Settings } from "lucide-react";

export default function AmazonIntegrationPage() {
  const [activeTab, setActiveTab] = useState<"sync" | "inventory">("sync");

  return (
    <PageTransition className="pb-24 pt-8 px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="w-8 h-8" />
          Amazon Integration
        </h1>
        <p className="text-muted-foreground mt-2">
          Sync your Amazon orders and manage your closet inventory
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("sync")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "sync"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Sync Orders
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "inventory"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Inventory Manager
        </button>
      </div>

      {/* Content */}
      {activeTab === "sync" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <AmazonOrderSync />
        </div>
      )}

      {activeTab === "inventory" && (
        <AmazonInventoryManager />
      )}
    </PageTransition>
  );
}
