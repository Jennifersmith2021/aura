"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { 
    Hourglass, 
    TrendingDown, 
    Award, 
    BookOpen, 
    Target, 
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Info
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";

type TrainingLevel = "beginner" | "intermediate" | "advanced";

interface TrainingProgram {
    id: string;
    level: TrainingLevel;
    name: string;
    description: string;
    goalReduction: number; // inches
    duration: string; // e.g., "8 weeks"
    schedule: {
        week: number;
        hoursPerDay: number;
        daysPerWeek: number;
        maxReduction: number; // inches from natural waist
    }[];
}

const TRAINING_PROGRAMS: TrainingProgram[] = [
    {
        id: "beginner",
        level: "beginner",
        name: "Gentle Introduction",
        description: "Perfect for first-time waist trainers. Focuses on comfort and building tolerance.",
        goalReduction: 2,
        duration: "8 weeks",
        schedule: [
            { week: 1, hoursPerDay: 1, daysPerWeek: 3, maxReduction: 1 },
            { week: 2, hoursPerDay: 2, daysPerWeek: 4, maxReduction: 1 },
            { week: 3, hoursPerDay: 3, daysPerWeek: 4, maxReduction: 1.5 },
            { week: 4, hoursPerDay: 4, daysPerWeek: 5, maxReduction: 1.5 },
            { week: 5, hoursPerDay: 4, daysPerWeek: 5, maxReduction: 2 },
            { week: 6, hoursPerDay: 5, daysPerWeek: 5, maxReduction: 2 },
            { week: 7, hoursPerDay: 6, daysPerWeek: 6, maxReduction: 2 },
            { week: 8, hoursPerDay: 6, daysPerWeek: 6, maxReduction: 2 },
        ]
    },
    {
        id: "intermediate",
        level: "intermediate",
        name: "Progressive Training",
        description: "For those with 2-3 months of experience. Increases duration and intensity.",
        goalReduction: 4,
        duration: "12 weeks",
        schedule: [
            { week: 1, hoursPerDay: 4, daysPerWeek: 5, maxReduction: 2 },
            { week: 2, hoursPerDay: 5, daysPerWeek: 5, maxReduction: 2.5 },
            { week: 3, hoursPerDay: 6, daysPerWeek: 6, maxReduction: 2.5 },
            { week: 4, hoursPerDay: 6, daysPerWeek: 6, maxReduction: 3 },
            { week: 5, hoursPerDay: 7, daysPerWeek: 6, maxReduction: 3 },
            { week: 6, hoursPerDay: 8, daysPerWeek: 6, maxReduction: 3.5 },
            { week: 7, hoursPerDay: 8, daysPerWeek: 7, maxReduction: 3.5 },
            { week: 8, hoursPerDay: 9, daysPerWeek: 7, maxReduction: 4 },
            { week: 9, hoursPerDay: 10, daysPerWeek: 7, maxReduction: 4 },
            { week: 10, hoursPerDay: 10, daysPerWeek: 7, maxReduction: 4 },
            { week: 11, hoursPerDay: 10, daysPerWeek: 7, maxReduction: 4 },
            { week: 12, hoursPerDay: 10, daysPerWeek: 7, maxReduction: 4 },
        ]
    },
    {
        id: "advanced",
        level: "advanced",
        name: "Dedicated Practitioner",
        description: "For experienced trainers seeking dramatic results. Requires commitment and proper technique.",
        goalReduction: 6,
        duration: "16 weeks",
        schedule: [
            { week: 1, hoursPerDay: 8, daysPerWeek: 7, maxReduction: 3 },
            { week: 2, hoursPerDay: 10, daysPerWeek: 7, maxReduction: 3.5 },
            { week: 3, hoursPerDay: 12, daysPerWeek: 7, maxReduction: 4 },
            { week: 4, hoursPerDay: 12, daysPerWeek: 7, maxReduction: 4.5 },
            { week: 5, hoursPerDay: 14, daysPerWeek: 7, maxReduction: 4.5 },
            { week: 6, hoursPerDay: 14, daysPerWeek: 7, maxReduction: 5 },
            { week: 7, hoursPerDay: 16, daysPerWeek: 7, maxReduction: 5 },
            { week: 8, hoursPerDay: 16, daysPerWeek: 7, maxReduction: 5.5 },
            { week: 9, hoursPerDay: 18, daysPerWeek: 7, maxReduction: 5.5 },
            { week: 10, hoursPerDay: 18, daysPerWeek: 7, maxReduction: 6 },
            { week: 11, hoursPerDay: 20, daysPerWeek: 7, maxReduction: 6 },
            { week: 12, hoursPerDay: 20, daysPerWeek: 7, maxReduction: 6 },
            { week: 13, hoursPerDay: 22, daysPerWeek: 7, maxReduction: 6 },
            { week: 14, hoursPerDay: 22, daysPerWeek: 7, maxReduction: 6 },
            { week: 15, hoursPerDay: 23, daysPerWeek: 7, maxReduction: 6 },
            { week: 16, hoursPerDay: 23, daysPerWeek: 7, maxReduction: 6 },
        ]
    }
];

const SAFETY_TIPS = [
    "Never lace tighter than comfortable - you should be able to breathe deeply",
    "Start gradually - increase wearing time by 1 hour per week",
    "Take breaks - remove corset if you feel numbness, pain, or difficulty breathing",
    "Stay hydrated and eat smaller, more frequent meals",
    "Only wear while awake and alert - never sleep in a corset as a beginner",
    "Use a liner to protect your skin and the corset",
    "Season new corsets gradually before tight lacing",
    "Listen to your body - discomfort is normal, pain is not"
];

export function CorsetTrainer() {
    const { corsetSessions, measurements } = useStore();
    const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
    const [showSafetyGuide, setShowSafetyGuide] = useState(false);
    const [programStartDate, setProgramStartDate] = useState<number>(Date.now());

    // Calculate current stats
    const completedSessions = corsetSessions.filter(s => s.endDate);
    const totalHours = completedSessions.reduce((acc, s) => {
        if (s.endDate) {
            const duration = (s.endDate - s.startDate) / (1000 * 60 * 60);
            return acc + duration;
        }
        return acc;
    }, 0);

    // Calculate waist reduction progress
    const latestMeasurement = measurements.length > 0 
        ? [...measurements].sort((a, b) => b.date - a.date)[0]
        : null;
    
    const oldestMeasurement = measurements.length > 0
        ? [...measurements].sort((a, b) => a.date - b.date)[0]
        : null;

    const totalWaistReduction = (oldestMeasurement?.values.waist && latestMeasurement?.values.waist)
        ? oldestMeasurement.values.waist - latestMeasurement.values.waist
        : 0;

    // Calculate program progress
    const getCurrentWeek = () => {
        if (!selectedProgram) return 0;
        const daysSinceStart = differenceInDays(Date.now(), programStartDate);
        return Math.min(Math.floor(daysSinceStart / 7) + 1, selectedProgram.schedule.length);
    };

    const currentWeek = getCurrentWeek();
    const currentWeekSchedule = selectedProgram?.schedule.find(s => s.week === currentWeek);

    // Calculate this week's compliance
    const getWeekCompliance = () => {
        if (!selectedProgram || !currentWeekSchedule) return { sessions: 0, hours: 0 };
        
        const weekStart = subDays(Date.now(), (currentWeek - 1) * 7);
        const weekSessions = completedSessions.filter(s => 
            s.startDate >= weekStart.getTime() && s.endDate! <= Date.now()
        );

        const weekHours = weekSessions.reduce((acc, s) => {
            if (s.endDate) {
                return acc + (s.endDate - s.startDate) / (1000 * 60 * 60);
            }
            return acc;
        }, 0);

        return {
            sessions: weekSessions.length,
            hours: weekHours
        };
    };

    const weekCompliance = getWeekCompliance();
    const targetHours = currentWeekSchedule ? currentWeekSchedule.hoursPerDay * currentWeekSchedule.daysPerWeek : 0;
    const compliancePercentage = targetHours > 0 ? Math.min((weekCompliance.hours / targetHours) * 100, 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Hourglass className="w-5 h-5 text-purple-500" />
                    Corset Training Program
                </h2>
                <button
                    onClick={() => setShowSafetyGuide(!showSafetyGuide)}
                    className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                >
                    <AlertCircle className="w-3 h-3" />
                    Safety Guide
                </button>
            </div>

            {/* Safety Guide Modal */}
            {showSafetyGuide && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Waist Training Safety</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {SAFETY_TIPS.map((tip, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">{tip}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                                <strong>Medical Disclaimer:</strong> Consult a healthcare provider before beginning any waist training program. 
                                Stop immediately if you experience pain, numbness, or difficulty breathing.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowSafetyGuide(false)}
                            className="w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Clock className="w-4 h-4 text-purple-600 mb-1" />
                    <div className="text-2xl font-bold">{totalHours.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Total Hours</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
                    <TrendingDown className="w-4 h-4 text-rose-600 mb-1" />
                    <div className="text-2xl font-bold">{totalWaistReduction.toFixed(1)}"</div>
                    <div className="text-xs text-muted-foreground">Waist Reduced</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <Award className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="text-2xl font-bold">{completedSessions.length}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
            </div>

            {/* Active Program */}
            {selectedProgram ? (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase mb-1">Active Program</div>
                                <h3 className="font-bold text-lg">{selectedProgram.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{selectedProgram.description}</p>
                            </div>
                            <button
                                onClick={() => setSelectedProgram(null)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Change
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                                <div className="text-xs text-muted-foreground">Week</div>
                                <div className="text-xl font-bold">{currentWeek} / {selectedProgram.schedule.length}</div>
                            </div>
                            <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                                <div className="text-xs text-muted-foreground">Goal</div>
                                <div className="text-xl font-bold">-{selectedProgram.goalReduction}"</div>
                            </div>
                        </div>

                        {currentWeekSchedule && (
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">This Week's Target</span>
                                    <span className="font-semibold">
                                        {currentWeekSchedule.hoursPerDay}h/day × {currentWeekSchedule.daysPerWeek} days
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{weekCompliance.hours.toFixed(1)}h / {targetHours}h</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                            style={{ width: `${compliancePercentage}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        {compliancePercentage >= 100 ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Week completed!</span>
                                            </>
                                        ) : compliancePercentage >= 80 ? (
                                            <>
                                                <Target className="w-3 h-3 text-amber-500" />
                                                <span className="text-amber-600 dark:text-amber-400">Almost there - {(100 - compliancePercentage).toFixed(0)}% to go</span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">{compliancePercentage.toFixed(0)}% complete</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Info className="w-3 h-3" />
                                        <span>Max reduction: {currentWeekSchedule.maxReduction}" from natural waist</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Program Selection */
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span>Choose a training program to get started</span>
                    </div>

                    {TRAINING_PROGRAMS.map(program => (
                        <div
                            key={program.id}
                            className="bg-white dark:bg-slate-800 border border-border rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
                            onClick={() => setSelectedProgram(program)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold">{program.name}</h3>
                                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                            {program.level}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{program.description}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                                    <div className="font-semibold">{program.duration}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Goal</div>
                                    <div className="font-semibold">-{program.goalReduction}"</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Starting</div>
                                    <div className="font-semibold">{program.schedule[0].hoursPerDay}h/day</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Educational Resources */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold">Training Tips</h3>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p><strong>Seasoning:</strong> Wear a new corset loosely for 2 weeks before tight lacing</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p><strong>The Two-Finger Rule:</strong> You should fit 2 fingers between the corset and your body</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p><strong>Breathing:</strong> Practice deep belly breaths while corseted to expand lung capacity</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p><strong>Posture:</strong> Corsets should improve posture - if you're slouching, it's too tight</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
