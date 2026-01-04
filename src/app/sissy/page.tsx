"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Target, Trophy, Lock, Zap, Sparkles, BookHeart, Gift, Mic, Footprints, Camera, Calendar, Droplet, Armchair, Ruler, Dumbbell, Wind, Eye, Pill, Flame, SunMedium, Brush } from "lucide-react";
import SissyTraining from "@/components/SissyTraining";
import AchievementBadges from "@/components/AchievementBadges";
import ChallengeSystem from "@/components/ChallengeSystem";
import { ChastityTracker } from "@/components/ChastityTracker";
import { OrgasmTracker } from "@/components/OrgasmTracker";
import ToyCollectionManager from "@/components/ToyCollectionManager";
import ComplimentJournal from "@/components/ComplimentJournal";
import VoiceTraining from "@/components/VoiceTraining";
import PostureWalkingGuide from "@/components/PostureWalkingGuide";
import ProgressPhotos from "@/components/ProgressPhotos";
import DailySchedule from "@/components/DailySchedule";
import DailySkincareTracker from "@/components/DailySkincareTracker";
import FeminineSittingPractice from "@/components/FeminineSittingPractice";
import FeminineWalkingPractice from "@/components/FeminineWalkingPractice";
import DailyProgressSummary from "@/components/DailyProgressSummary";
import { Measurements } from "@/components/Measurements";
import MeasurementInsights from "@/components/MeasurementInsights";
import MeasurementPhotoCompare from "@/components/MeasurementPhotoCompare";
import DailyAffirmationTracker from "@/components/DailyAffirmationTracker";
import FeminineWorkoutRoutines from "@/components/FeminineWorkoutRoutines";
import YogaRoutines from "@/components/YogaRoutines";
import OutfitCombinator from "@/components/OutfitCombinator";
import DailyChallenges from "@/components/DailyChallenges";
import HormoneSupplementTracker from "@/components/HormoneSupplementTracker";
import SissyPersonaBuilder from "@/components/SissyPersonaBuilder";
import ArousalTracker from "@/components/ArousalTracker";
import OutfitOfTheDay from "@/components/OutfitOfTheDay";
import MakeupTutorialTracker from "@/components/MakeupTutorialTracker";
import GrowthDashboard from "@/components/GrowthDashboard";
import { SissificationTracker } from "@/components/SissificationTracker";

type Tab = "training" | "achievements" | "challenges" | "chastity" | "orgasms" | "arousal" | "toys" | "compliments" | "voice" | "posture" | "photos" | "schedule" | "skincare" | "sitting" | "walking" | "measurements" | "affirmations" | "yoga" | "workouts" | "outfits" | "ootd" | "makeup" | "daily-challenges" | "hormones" | "personas" | "sissy-tracker";

export default function SissyPage() {
    const [activeTab, setActiveTab] = useState<Tab>("training");

    const tabGroups = [
        {
            label: "Daily",
            tabs: [
                { id: "sissy-tracker", label: "Daily Tasks", icon: Target },
                { id: "schedule", label: "Schedule", icon: Calendar },
                { id: "affirmations", label: "Affirmations", icon: Sparkles },
                { id: "daily-challenges", label: "Daily Challenges", icon: Zap },
            ]
        },
        {
            label: "Body & Fitness",
            tabs: [
                { id: "yoga", label: "Yoga", icon: Wind },
                { id: "workouts", label: "Workouts", icon: Dumbbell },
                { id: "measurements", label: "Measurements", icon: Ruler },
                { id: "photos", label: "Progress Photos", icon: Camera },
                { id: "hormones", label: "Hormones", icon: Pill },
            ]
        },
        {
            label: "Training & Skills",
            tabs: [
                { id: "training", label: "Training Goals", icon: Target },
                { id: "sitting", label: "Sitting", icon: Armchair },
                { id: "walking", label: "Walking", icon: Footprints },
                { id: "voice", label: "Voice", icon: Mic },
                { id: "posture", label: "Posture", icon: Footprints },
            ]
        },
        {
            label: "Beauty & Style",
            tabs: [
                { id: "skincare", label: "Skincare", icon: Droplet },
                { id: "makeup", label: "Makeup", icon: Brush },
                { id: "outfits", label: "Outfits", icon: Eye },
                { id: "ootd", label: "OOTD", icon: SunMedium },
            ]
        },
        {
            label: "Intimacy",
            tabs: [
                { id: "chastity", label: "Chastity", icon: Lock },
                { id: "arousal", label: "Arousal/Edging", icon: Flame },
                { id: "orgasms", label: "Orgasms", icon: Sparkles },
                { id: "toys", label: "Toys", icon: Gift },
            ]
        },
        {
            label: "Progress",
            tabs: [
                { id: "achievements", label: "Achievements", icon: Trophy },
                { id: "challenges", label: "Challenges", icon: Target },
                { id: "compliments", label: "Compliments", icon: BookHeart },
                { id: "personas", label: "Personas", icon: Sparkles },
            ]
        }
    ] as const;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
            {/* Mobile Header - Only shown on mobile */}
            <div className="lg:hidden bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 text-white p-6 shadow-lg sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-8 h-8" fill="currentColor" />
                    <h1 className="text-3xl font-bold">Sissy Training Hub</h1>
                </div>
                <p className="text-white/90 text-base font-medium">
                    Your complete sissy transformation journey
                </p>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="px-4 py-3 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(tabGroups as any).flatMap((g: any) => g.tabs).map((tab: any) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                                            : "bg-secondary text-foreground hover:bg-accent"
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {activeTab === "schedule" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-pink-500" />
                                    Daily Sissy Schedule
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Your complete daily training routine with task tracking
                                </p>
                            </div>
                            <DailySchedule />
                            <DailyProgressSummary />
                        </div>
                    )}

                    {activeTab === "sissy-tracker" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-500" />
                                    Sissification Progress Tracker
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Complete daily tasks, earn XP, level up, and track your sissy transformation
                                </p>
                            </div>
                            <SissificationTracker />
                        </div>
                    )}

                    {activeTab === "affirmations" && (
                        <div className="space-y-6">
                            <DailyAffirmationTracker />
                        </div>
                    )}

                    {activeTab === "personas" && (
                        <div className="space-y-6">
                            <SissyPersonaBuilder />
                        </div>
                    )}

                    {activeTab === "yoga" && (
                        <div className="space-y-6">
                            <YogaRoutines />
                        </div>
                    )}

                    {activeTab === "workouts" && (
                        <div className="space-y-6">
                            <FeminineWorkoutRoutines />
                        </div>
                    )}

                    {activeTab === "training" && (
                        <div className="space-y-6">
                            <SissyTraining />
                        </div>
                    )}

                    {activeTab === "skincare" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Droplet className="w-6 h-6 text-pink-500" />
                                    Daily Skincare Routine
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Maintain radiant, feminine skin with morning and evening routines
                                </p>
                            </div>
                            <DailySkincareTracker />
                        </div>
                    )}

                    {activeTab === "sitting" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Armchair className="w-6 h-6 text-purple-500" />
                                    Feminine Sitting Practice
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Master graceful sitting positions and leg crossing techniques
                                </p>
                            </div>
                            <FeminineSittingPractice />
                        </div>
                    )}

                    {activeTab === "walking" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Footprints className="w-6 h-6 text-pink-500" />
                                    Feminine Walking Practice
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Perfect your walk with and without heels
                                </p>
                            </div>
                            <FeminineWalkingPractice />
                        </div>
                    )}

                    {activeTab === "measurements" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Ruler className="w-6 h-6 text-purple-500" />
                                    Measurements & Growth
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Track hips, bra size, breast, butt, clit size and log photos for growth monitoring
                                </p>
                            </div>
                            <Measurements />
                            <MeasurementInsights />
                            <GrowthDashboard />
                            <MeasurementPhotoCompare />
                        </div>
                    )}

                    {activeTab === "achievements" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    Sissy Achievements
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Track your progress with sissy-specific achievements
                                </p>
                            </div>
                            <AchievementBadges />
                        </div>
                    )}

                    {activeTab === "challenges" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Target className="w-6 h-6 text-purple-500" />
                                    Long-term Sissy Challenges
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Work toward extended transformation challenges
                                </p>
                            </div>
                            <ChallengeSystem />
                        </div>
                    )}

                    {activeTab === "chastity" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Lock className="w-6 h-6 text-pink-500" />
                                    Chastity Tracking
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Track your chastity sessions and denial journey
                                </p>
                            </div>
                            <ChastityTracker />
                        </div>
                    )}

                    {activeTab === "arousal" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Flame className="w-6 h-6 text-pink-500" />
                                    Arousal & Edging Log
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Track desire waves, edging sessions, denials, and afterglow notes
                                </p>
                            </div>
                            <ArousalTracker />
                        </div>
                    )}

                    {activeTab === "orgasms" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-500" />
                                    Orgasm Tracking
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Log and track your orgasms and denial progress
                                </p>
                            </div>
                            <OrgasmTracker />
                        </div>
                    )}

                    {activeTab === "toys" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-6 border border-rose-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Gift className="w-6 h-6 text-rose-500" />
                                    Toy Collection
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Manage your toy collection including butt plugs and more
                                </p>
                            </div>
                            <ToyCollectionManager />
                        </div>
                    )}

                    {activeTab === "voice" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Mic className="w-6 h-6 text-purple-500" />
                                    Voice Feminization
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Train your voice to be more feminine and natural
                                </p>
                            </div>
                            <VoiceTraining />
                        </div>
                    )}

                    {activeTab === "posture" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Footprints className="w-6 h-6 text-pink-500" />
                                    Posture & Walking
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Learn to move with grace and feminine elegance
                                </p>
                            </div>
                            <PostureWalkingGuide />
                        </div>
                    )}

                    {activeTab === "photos" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Camera className="w-6 h-6 text-purple-500" />
                                    Progress Photos
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Document your transformation journey with photos
                                </p>
                            </div>
                            <ProgressPhotos />
                        </div>
                    )}

                    {activeTab === "outfits" && (
                        <div className="space-y-6">
                            <OutfitCombinator />
                        </div>
                    )}

                    {activeTab === "ootd" && (
                        <div className="space-y-6">
                            <OutfitOfTheDay />
                        </div>
                    )}

                    {activeTab === "makeup" && (
                        <div className="space-y-6">
                            <MakeupTutorialTracker />
                        </div>
                    )}

                    {activeTab === "daily-challenges" && (
                        <div className="space-y-6">
                            <DailyChallenges />
                        </div>
                    )}

                    {activeTab === "hormones" && (
                        <div className="space-y-6">
                            <HormoneSupplementTracker />
                        </div>
                    )}

                    {activeTab === "achievements" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <BookHeart className="w-6 h-6 text-pink-500" />
                                    Compliment Journal
                                </h2>
                                <p className="text-muted-foreground font-medium mb-4">
                                    Save and celebrate compliments on your sissy journey
                                </p>
                            </div>
                            <ComplimentJournal />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
