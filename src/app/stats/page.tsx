"use client";

import { PageTransition } from "@/components/PageTransition";
import ClosetAnalytics from "@/components/ClosetAnalytics";
import { Measurements } from "@/components/Measurements";
import { MakeupExpiration } from "@/components/MakeupExpiration";
import { BudgetTracker } from "@/components/BudgetTracker";
import { AmazonImport } from "@/components/AmazonImport";
import GoalPlanningTools from "@/components/GoalPlanningTools";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function StatsPage() {
  return (
    <PageTransition className="pb-24 pt-6 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Stats & Maintenance</h1>
        <p className="text-sm text-muted-foreground">Track wardrobe health, measurements, and spend.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
          <AnalyticsDashboard />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Goal Planning</h2>
          <GoalPlanningTools />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Closet Analytics</h2>
          <ClosetAnalytics />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Measurements</h2>
          <Measurements />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Makeup Expiration</h2>
          <MakeupExpiration />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Budget Tracker</h2>
          <BudgetTracker />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Amazon Imports</h2>
          <AmazonImport />
        </section>
      </div>
    </PageTransition>
  );
}
