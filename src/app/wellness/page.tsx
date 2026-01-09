"use client";

import { PageTransition } from "@/components/PageTransition";
import SissyTraining from "@/components/SissyTraining";
import { ChastityTracker } from "@/components/ChastityTracker";
import { OrgasmTracker } from "@/components/OrgasmTracker";
import ArousalTracker from "@/components/ArousalTracker";
import ToyCollectionManager from "@/components/ToyCollectionManager";
import IntimacyJournal from "@/components/IntimacyJournal";
import { CorsetTracker } from "@/components/CorsetTracker";
import { ButtPlugTracker } from "@/components/ButtPlugTracker";
import ClitSizeTracker from "@/components/ClitSizeTracker";
import BreastGrowthTracker from "@/components/BreastGrowthTracker";
import WigInventory from "@/components/WigInventory";
import HairStyleGallery from "@/components/HairStyleGallery";

export default function WellnessPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Wellness & Body</h1>
        <p className="text-sm text-muted-foreground">Track wellness, body changes, and intimate journeys.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Guided Journeys</h2>
          <SissyTraining />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Body Tracking</h2>
          <div className="space-y-4">
            <BreastGrowthTracker />
            <ClitSizeTracker />
            <CorsetTracker />
            <ButtPlugTracker />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Intimate Tracking</h2>
          <div className="space-y-4">
            <ChastityTracker />
            <OrgasmTracker />
            <ArousalTracker />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Collections & Journal</h2>
          <div className="space-y-4">
            <ToyCollectionManager />
            <IntimacyJournal />
            <WigInventory />
            <HairStyleGallery />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
