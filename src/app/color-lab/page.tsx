"use client";

import { PageTransition } from "@/components/PageTransition";
import ColorAnalyzer from "@/components/ColorAnalyzer";
import { ColorAnalysis } from "@/components/ColorAnalysis";

export default function ColorLabPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Color Lab</h1>
        <p className="text-sm text-muted-foreground">Find your palettes, test matches, and plan color stories.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Analyzer</h2>
          <ColorAnalyzer />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Seasonal Color Analysis</h2>
          <ColorAnalysis />
        </section>
      </div>
    </PageTransition>
  );
}
