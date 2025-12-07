"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { Hourglass, Play, StopCircle, Clock, CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { formatDistance } from "date-fns";

export function CorsetTracker() {
    const { corsetSessions, startCorsetSession, endCorsetSession } = useStore();
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [waistBefore, setWaistBefore] = useState("");
    const [waistCorseted, setWaistCorseted] = useState("");
    const [corsetType, setCorsetType] = useState("");
    const [waistAfter, setWaistAfter] = useState("");
    const [note, setNote] = useState("");

    // Find active session
    const activeSession = corsetSessions.find(s => !s.endDate);

    // Calculate total hours trained
    const totalHours = corsetSessions
        .filter(s => s.endDate)
        .reduce((acc, s) => {
            const duration = s.endDate! - s.startDate;
            return acc + (duration / (1000 * 60 * 60));
        }, 0);

    const [timer, setTimer] = useState<string>("");

    useEffect(() => {
        if (!activeSession) return;

        const tick = () => {
            const now = Date.now();
            const start = activeSession.startDate;
            const diff = now - start;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimer(`${hours}h ${minutes}m`);
        };

        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const handleStartSession = async () => {
        await startCorsetSession({
            id: uuidv4(),
            startDate: Date.now(),
            waistBefore: parseFloat(waistBefore) || undefined,
            waistCorseted: parseFloat(waistCorseted) || undefined,
            corsetType: corsetType || undefined,
        });
        setIsStartModalOpen(false);
        setWaistBefore("");
        setWaistCorseted("");
        setCorsetType("");
    };

    const handleEnd = async () => {
        if (!activeSession) return;
        const duration = Math.floor((Date.now() - activeSession.startDate) / (1000 * 60)); // minutes
        await endCorsetSession(activeSession.id, parseFloat(waistAfter) || undefined, note);
        setIsEndModalOpen(false);
        setWaistAfter("");
        setNote("");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Hourglass className="w-5 h-5 text-purple-500" />
                Waist Training
            </h2>

            {/* Total Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground uppercase font-medium">Total Trained</span>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                        {totalHours.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs</span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground uppercase font-medium">Session Count</span>
                    <div className="text-2xl font-bold">
                        {corsetSessions.filter(s => s.endDate).length}
                    </div>
                </div>
            </div>

            {/* Active Session Card */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-colors ${activeSession
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800"
                    : "bg-white dark:bg-slate-800 border-border"
                }`}>
                {activeSession ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto text-purple-600 animate-pulse">
                            <Hourglass className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">Training Active</h3>
                            <div className="text-3xl font-mono font-medium mt-2">{timer || "0h 0m"}</div>
                        </div>
                        <button
                            onClick={() => setIsEndModalOpen(true)}
                            className="bg-white text-rose-600 border border-rose-200 px-6 py-2 rounded-full font-medium hover:bg-rose-50 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <StopCircle className="w-4 h-4" /> Stop Session
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-muted-foreground">
                            <Play className="w-8 h-8 ml-1" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Ready to Train?</h3>
                            <p className="text-sm text-muted-foreground">Log your hours to track progress.</p>
                        </div>
                        <button
                            onClick={() => setIsStartModalOpen(true)}
                            className="bg-purple-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Play className="w-4 h-4 fill-current" /> Start Timer
                        </button>
                    </div>
                )}
            </div>

            {/* Start Session Modal */}
            {isStartModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Play className="w-5 h-5 text-purple-500" />
                            Start Training Session
                        </h3>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Natural Waist (Before)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 pl-3 pr-8 rounded-lg border border-border"
                                    placeholder="e.g., 28"
                                    value={waistBefore}
                                    onChange={e => setWaistBefore(e.target.value)}
                                />
                                <span className="absolute right-3 top-2 text-muted-foreground text-sm">in</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Corseted Waist</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 pl-3 pr-8 rounded-lg border border-border"
                                    placeholder="e.g., 24"
                                    value={waistCorseted}
                                    onChange={e => setWaistCorseted(e.target.value)}
                                />
                                <span className="absolute right-3 top-2 text-muted-foreground text-sm">in</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Corset Type (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="e.g., Steel Boned Underbust"
                                value={corsetType}
                                onChange={e => setCorsetType(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setIsStartModalOpen(false);
                                    setWaistBefore("");
                                    setWaistCorseted("");
                                    setCorsetType("");
                                }}
                                className="flex-1 py-2 rounded-lg border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartSession}
                                className="flex-1 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4" /> Start
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* End Session Modal */}
            {isEndModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            Session Complete
                        </h3>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Waist Measurement (After)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full p-2 pl-3 pr-8 rounded-lg border border-border"
                                    placeholder="28.5"
                                    value={waistAfter}
                                    onChange={e => setWaistAfter(e.target.value)}
                                />
                                <span className="absolute right-3 top-2 text-muted-foreground text-sm">in</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
                            <textarea
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="How did it feel? Which corset?"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsEndModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEnd}
                                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Save Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
