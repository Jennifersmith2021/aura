"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Heart, Plus, Trash2, Calendar } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { formatDistance } from "date-fns";
import { OrgasmLog } from "@/types";

export function OrgasmTracker() {
    const { orgasmLogs, addOrgasmLog, removeOrgasmLog, chastitySessions } = useStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [type, setType] = useState<"solo" | "partnered" | "other">("solo");
    const [method, setMethod] = useState<"wand" | "anal" | "penetration" | "oral" | "hands" | "other">("wand");
    const [chastityStatus, setChastityStatus] = useState<"locked" | "unlocked">("unlocked");
    const [note, setNote] = useState("");
    const [customDate, setCustomDate] = useState("");

    // Find active chastity session
    const activeChastity = chastitySessions.find(s => !s.endDate);

    const handleAdd = async () => {
        const logDate = customDate ? new Date(customDate).getTime() : Date.now();
        
        await addOrgasmLog({
            id: uuidv4(),
            date: logDate,
            type,
            method,
            chastityStatus,
            note: note || undefined
        });
        
        setIsAddModalOpen(false);
        setType("solo");
        setMethod("wand");
        setChastityStatus("unlocked");
        setNote("");
        setCustomDate("");
    };

    // Calculate stats
    const last30Days = orgasmLogs.filter(log => log.date > Date.now() - 30 * 24 * 60 * 60 * 1000);
    const avgPerMonth = last30Days.length;
    const lastOrgasm = orgasmLogs.length > 0 ? orgasmLogs[0] : null;
    const daysSince = lastOrgasm ? Math.floor((Date.now() - lastOrgasm.date) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Orgasm Tracker
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={!!activeChastity}
                    className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={activeChastity ? "Cannot log while locked" : "Log orgasm"}
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Warning if locked */}
            {activeChastity && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-sm text-rose-700 dark:text-rose-400">
                    🔒 You are currently in chastity. Unlock to log orgasms.
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800">
                    <div className="text-xs text-muted-foreground mb-1">Days Since Last</div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {daysSince !== null ? daysSince : "—"}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                    <div className="text-xs text-muted-foreground mb-1">Last 30 Days</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {avgPerMonth}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
                        <h3 className="font-semibold text-lg">Log Orgasm</h3>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-2">Type</label>
                            <div className="flex gap-2">
                                {(["solo", "partnered", "other"] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`flex-1 py-2 rounded-lg border font-medium text-sm capitalize transition-colors ${
                                            type === t 
                                                ? "bg-primary text-primary-foreground border-primary" 
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-2">Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["wand", "anal", "penetration", "oral", "hands", "other"] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setMethod(m)}
                                        className={`py-2 rounded-lg border font-medium text-xs capitalize transition-colors ${
                                            method === m 
                                                ? "bg-primary text-primary-foreground border-primary" 
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-2">Chastity Status</label>
                            <div className="flex gap-2">
                                {(["unlocked", "locked"] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setChastityStatus(s)}
                                        className={`flex-1 py-2 rounded-lg border font-medium text-sm capitalize transition-colors ${
                                            chastityStatus === s 
                                                ? "bg-primary text-primary-foreground border-primary" 
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        {s === "locked" ? "🔒 Locked" : "🔓 Unlocked"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Date (Optional)</label>
                            <input
                                type="date"
                                className="w-full p-2 rounded-lg border border-border"
                                value={customDate}
                                onChange={e => setCustomDate(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Leave blank for today</p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Note (Optional)</label>
                            <textarea
                                className="w-full p-2 rounded-lg border border-border"
                                placeholder="Any details you want to remember..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setType("solo");
                                    setMethod("wand");
                                    setChastityStatus("unlocked");
                                    setNote("");
                                    setCustomDate("");
                                }}
                                className="flex-1 py-2 rounded-lg border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log History */}
            {orgasmLogs.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>History</span>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {orgasmLogs.length} total
                        </span>
                    </div>
                    <div className="divide-y divide-border max-h-96 overflow-y-auto">
                        {orgasmLogs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-medium text-sm capitalize">
                                                {log.type || "Unspecified"}
                                            </span>
                                            {log.method && (
                                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                                    {log.method}
                                                </span>
                                            )}
                                            {log.chastityStatus && (
                                                <span className="text-xs">
                                                    {log.chastityStatus === "locked" ? "🔒" : "🔓"}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistance(log.date, Date.now(), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(log.date).toLocaleDateString(undefined, { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        {log.note && (
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                {log.note}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm("Delete this log?")) {
                                                removeOrgasmLog(log.id);
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-600 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p>No logs yet</p>
                    <p className="text-xs mt-1">Track your intimate moments</p>
                </div>
            )}
        </div>
    );
}
