"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { Lock, Unlock, Timer, ShowerHead, History, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { formatDistance } from "date-fns";

export function ChastityTracker() {
    const { chastitySessions, lock, unlock, logHygiene } = useStore();
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [keyholder, setKeyholder] = useState("");
    const [note, setNote] = useState("");
    const [cageModel, setCageModel] = useState("");
    const [ringSize, setRingSize] = useState("");

    // Find active session
    const currentSession = chastitySessions.find(s => !s.endDate);
    const sortedHistory = chastitySessions
        .filter(s => s.endDate)
        .sort((a, b) => b.startDate - a.startDate);

    const [timer, setTimer] = useState<string>("");

    useEffect(() => {
        if (!currentSession) return;

        const tick = () => {
            const now = Date.now();
            const start = currentSession.startDate;
            const diff = now - start;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimer(`${days}d ${hours}h ${minutes}m`);
        };

        tick();
        const interval = setInterval(tick, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [currentSession]);

    const handleLock = async () => {
        await lock({
            id: uuidv4(),
            startDate: Date.now(),
            hygieneChecks: [],
            keyholder: keyholder || undefined,
            note: note || undefined,
            cageModel: cageModel || undefined,
            ringSize: ringSize || undefined
        });
        setIsLockModalOpen(false);
        setKeyholder("");
        setNote("");
        setCageModel("");
        setRingSize("");
    };

    const handleUnlock = async () => {
        if (!currentSession) return;
        if (confirm("Are you sure you want to end this session?")) {
            await unlock(currentSession.id);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Chastity Tracker
            </h2>

            {/* Current Status Card */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-colors ${currentSession
                    ? "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800"
                    : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
                }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${currentSession ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500"
                    }`}>
                    {currentSession ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
                </div>

                <h3 className="text-2xl font-bold mb-1">
                    {currentSession ? "LOCKED" : "UNLOCKED"}
                </h3>

                {currentSession ? (
                    <div className="space-y-4 w-full">
                        <div className="text-sm font-medium text-rose-600 dark:text-rose-400 font-mono">
                            {timer || "Just started"}
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full max-w-xs mx-auto">
                            <button
                                onClick={() => logHygiene(currentSession.id)}
                                className="flex flex-col items-center justify-center p-3 bg-white/50 hover:bg-white/80 rounded-xl transition-colors text-xs font-medium gap-1"
                            >
                                <ShowerHead className="w-4 h-4 text-blue-500" />
                                Log Clean
                            </button>
                            <button
                                onClick={handleUnlock}
                                className="flex flex-col items-center justify-center p-3 bg-white/50 hover:bg-white/80 rounded-xl transition-colors text-xs font-medium gap-1 text-rose-600"
                            >
                                <Unlock className="w-4 h-4" />
                                Unlock
                            </button>
                        </div>

                        {currentSession.keyholder && (
                            <p className="text-xs text-muted-foreground">
                                Keyholder: <span className="font-medium">{currentSession.keyholder}</span>
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mt-2">
                        <button
                            onClick={() => setIsLockModalOpen(true)}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
                        >
                            Start Session
                        </button>
                    </div>
                )}
            </div>

            {/* Lock Modal */}
            {isLockModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
                        <h3 className="font-semibold text-lg">New Session</h3>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Keyholder (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="Self / Name"
                                value={keyholder}
                                onChange={e => setKeyholder(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Cage Model (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="e.g. CB-6000, Holy Trainer"
                                value={cageModel}
                                onChange={e => setCageModel(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Ring Size (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="e.g. 45mm, 1.75in"
                                value={ringSize}
                                onChange={e => setRingSize(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Note (Optional)</label>
                            <textarea
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="Intentions for this session..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsLockModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLock}
                                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2"
                            >
                                <Lock className="w-4 h-4" /> Lock
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History */}
            {sortedHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border font-medium flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <span>Session History</span>
                    </div>
                    <div className="divide-y divide-border">
                        {sortedHistory.map(session => (
                            <div key={session.id} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-medium text-sm">
                                        {formatDistance(session.endDate!, session.startDate)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(session.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    {session.keyholder && (
                                        <span>🔑 {session.keyholder}</span>
                                    )}
                                    {session.hygieneChecks?.length > 0 && (
                                        <span>🚿 {session.hygieneChecks.length} cleans</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
