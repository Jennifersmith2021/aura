"use client";

import { PageTransition } from "@/components/PageTransition";
import OutfitRatingSystem from "@/components/OutfitRatingSystem";
import AchievementBadges from "@/components/AchievementBadges";
import ChallengeSystem from "@/components/ChallengeSystem";

export default function SocialPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Social & Challenges</h1>
        <p className="text-sm text-muted-foreground">Share looks, earn badges, and take on challenges.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Rate & Share</h2>
          <OutfitRatingSystem />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Achievements & Challenges</h2>
          <div className="space-y-4">
            <AchievementBadges />
            <ChallengeSystem />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
