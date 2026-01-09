"use client";

import { PageTransition } from "@/components/PageTransition";
import { Lookbook } from "@/components/Lookbook";
import OutfitSimulator from "@/components/OutfitSimulator";
import WardrobePlanner from "@/components/WardrobePlanner";
import { InspirationBoard } from "@/components/InspirationBoard";
import { ShoppingRecommendations } from "@/components/ShoppingRecommendations";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function LooksPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Looks & Planning</h1>
          <p className="text-sm text-muted-foreground">Build outfits, plan wardrobes, and explore inspirations.</p>
        </div>
        <div className="scale-75 origin-right">
          <WeatherWidget />
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lookbook</h2>
            <p className="text-xs text-muted-foreground">Curate and rate your favorite outfits.</p>
          </div>
          <Lookbook />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Outfit Mixer</h2>
            <p className="text-xs text-muted-foreground">Simulate looks and test combinations before wearing.</p>
          </div>
          <OutfitSimulator />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wardrobe Planner</h2>
            <p className="text-xs text-muted-foreground">Plan ahead for events and track upcoming looks.</p>
          </div>
          <WardrobePlanner />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Inspiration</h2>
            <p className="text-xs text-muted-foreground">Collect mood boards and style ideas.</p>
          </div>
          <InspirationBoard />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">Smart picks to complement your wardrobe.</p>
          </div>
          <ShoppingRecommendations />
        </section>
      </div>
    </PageTransition>
  );
}
