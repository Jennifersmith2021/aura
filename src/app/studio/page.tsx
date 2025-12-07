"use client";

import { useState } from "react";
import { Lookbook } from "@/components/Lookbook";
import { Timeline } from "@/components/Timeline";
import { Measurements } from "@/components/Measurements";
import { EssentialsChecklist } from "@/components/EssentialsChecklist";
import { ColorAnalysis } from "@/components/ColorAnalysis";
import { BudgetTracker } from "@/components/BudgetTracker";
import { ShoppingRecommendations } from "@/components/ShoppingRecommendations";
import { InspirationBoard } from "@/components/InspirationBoard";
import { AmazonImport } from "@/components/AmazonImport";
import { MakeupExpiration } from "@/components/MakeupExpiration";
import { ChastityTracker } from "@/components/ChastityTracker";
import { CorsetTracker } from "@/components/CorsetTracker";
import { OrgasmTracker } from "@/components/OrgasmTracker";
import ArousalTracker from "@/components/ArousalTracker";
import ToyCollectionManager from "@/components/ToyCollectionManager";
import IntimacyJournal from "@/components/IntimacyJournal";
import ClitSizeTracker from "@/components/ClitSizeTracker";
import WigInventory from "@/components/WigInventory";
import HairStyleGallery from "@/components/HairStyleGallery";
import SissyTraining from "@/components/SissyTraining";
import SizeConversionChart from "@/components/SizeConversionChart";
import PackingListGenerator from "@/components/PackingListGenerator";
import ClosetAnalytics from "@/components/ClosetAnalytics";
import OutfitRatingSystem from "@/components/OutfitRatingSystem";
import ChallengeSystem from "@/components/ChallengeSystem";
import AchievementBadges from "@/components/AchievementBadges";
import SmartMirror from "@/components/SmartMirror";
import DailyAffirmations from "@/components/DailyAffirmations";
import ProgressPhotoGallery from "@/components/ProgressPhotoGallery";
import { WeatherWidget } from "@/components/WeatherWidget";
import { cn } from "@/lib/utils";

type Tab = "looks" | "journey" | "stats" | "guide" | "color" | "shop" | "inspo" | "love" | "social" | "games";

export default function StudioPage() {
    const [activeTab, setActiveTab] = useState<Tab>("looks");

    const tabs: { id: Tab; label: string }[] = [
        { id: "looks", label: "Looks" },
        { id: "journey", label: "Journey" },
        { id: "stats", label: "Stats" },
        { id: "guide", label: "Guide" },
        { id: "color", label: "Color" },
        { id: "shop", label: "Shop" },
        { id: "inspo", label: "Inspo" },
        { id: "love", label: "Love" },
        { id: "social", label: "Social" },
        { id: "games", label: "Games" },
    ];

    return (
        <div className="pb-24 pt-4 px-4 min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Studio</h1>
                <div className="scale-75 origin-right">
                    <WeatherWidget />
                </div>
            </div>

            {/* Scrollable Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                            activeTab === tab.id
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1">
                {activeTab === "looks" && <Lookbook />}
                {activeTab === "journey" && (
                    <div className="space-y-8">
                        <DailyAffirmations />
                        <ProgressPhotoGallery />
                        <Timeline />
                    </div>
                )}
                {activeTab === "stats" && (
                    <div className="space-y-8">
                        <ClosetAnalytics />
                        <Measurements />
                        <MakeupExpiration />
                        <BudgetTracker />
                        <AmazonImport />
                    </div>
                )}
                {activeTab === "guide" && (
                    <div className="space-y-8">
                        <SmartMirror />
                        <EssentialsChecklist />
                        <SizeConversionChart />
                        <PackingListGenerator />
                    </div>
                )}
                {activeTab === "color" && <ColorAnalysis />}
                {activeTab === "shop" && <ShoppingRecommendations />}
                {activeTab === "inspo" && <InspirationBoard />}
                {activeTab === "love" && (
                    <div className="space-y-8">
                        <SissyTraining />
                        <ChastityTracker />
                        <OrgasmTracker />
                        <ArousalTracker />
                        <ToyCollectionManager />
                        <IntimacyJournal />
                        <CorsetTracker />
                        <ClitSizeTracker />
                        <WigInventory />
                        <HairStyleGallery />
                    </div>
                )}
                {activeTab === "social" && (
                    <div className="space-y-8">
                        <OutfitRatingSystem />
                    </div>
                )}
                {activeTab === "games" && (
                    <div className="space-y-8">
                        <AchievementBadges />
                        <ChallengeSystem />
                    </div>
                )}
            </div>
        </div>
    );
}
