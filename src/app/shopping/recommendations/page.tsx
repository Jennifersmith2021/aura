"use client";

import { PageTransition } from "@/components/PageTransition";
import { ShoppingRecommendations } from "@/components/ShoppingRecommendations";

export default function ShoppingRecommendationsPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shopping Recommendations</h1>
        <p className="text-sm text-muted-foreground">AI-powered picks tailored to your wardrobe.</p>
      </div>

      <ShoppingRecommendations />
    </PageTransition>
  );
}
