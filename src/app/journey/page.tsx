"use client";

import { PageTransition } from "@/components/PageTransition";
import DailyAffirmations from "@/components/DailyAffirmations";
import ProgressPhotoGallery from "@/components/ProgressPhotoGallery";
import { Timeline } from "@/components/Timeline";

export default function JourneyPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Journey</h1>
        <p className="text-sm text-muted-foreground">Track your progress, celebrate wins, and keep motivated.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Daily Affirmations</h2>
          <DailyAffirmations />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Progress Photos</h2>
          <ProgressPhotoGallery />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <Timeline />
        </section>
      </div>
    </PageTransition>
  );
}
