"use client";

import { PageTransition } from "@/components/PageTransition";
import WeatherOutfitSuggester from "@/components/WeatherOutfitSuggester";
import StyleAdvisor from "@/components/StyleAdvisor";
import SmartMirror from "@/components/SmartMirror";
import { EssentialsChecklist } from "@/components/EssentialsChecklist";
import SizeConversionChart from "@/components/SizeConversionChart";
import PackingListGenerator from "@/components/PackingListGenerator";

export default function StyleGuidePage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Style Guide</h1>
        <p className="text-sm text-muted-foreground">Practical guides, packing lists, and smart assistants.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Weather & Occasion</h2>
          <WeatherOutfitSuggester />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Style Advisor</h2>
          <StyleAdvisor />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Smart Mirror</h2>
          <SmartMirror />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Essentials Checklist</h2>
          <EssentialsChecklist />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Size & Packing Helpers</h2>
          <div className="space-y-4">
            <SizeConversionChart />
            <PackingListGenerator />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
