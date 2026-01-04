"use client";

import { useState } from "react";
import { SupplementTracker } from "./SupplementTracker";
import { SissyAffirmations } from "./SissyAffirmations";
import { WorkoutPlanner } from "./WorkoutPlanner";
import { WorkoutLogger } from "./WorkoutLogger";
import { CorsetTrainer } from "./CorsetTrainer";
import { Pill, MessageSquare, Dumbbell, Activity, Hourglass } from "lucide-react";
import clsx from "clsx";

type Tab = "supplements" | "affirmations" | "planner" | "logger" | "corset";

export function TrainingHub() {
    const [activeTab, setActiveTab] = useState<Tab>("affirmations");

    const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
        { id: "affirmations", label: "Affirmations", icon: <MessageSquare className="w-5 h-5" /> },
        { id: "corset", label: "Corset", icon: <Hourglass className="w-5 h-5" /> },
        { id: "supplements", label: "Supplements", icon: <Pill className="w-5 h-5" /> },
        { id: "planner", label: "Workouts", icon: <Dumbbell className="w-5 h-5" /> },
        { id: "logger", label: "Sessions", icon: <Activity className="w-5 h-5" /> },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Training & Wellness</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your affirmations, supplements, and workouts all in one place.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex-shrink-0",
                            activeTab === tab.id
                                ? "bg-primary text-white"
                                : "bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "supplements" && <SupplementTracker />}
                {activeTab === "affirmations" && <SissyAffirmations />}
                {activeTab === "corset" && <CorsetTrainer />}
                {activeTab === "planner" && <WorkoutPlanner />}
                {activeTab === "logger" && <WorkoutLogger />}
            </div>
        </div>
    );
}
