"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { BookOpenCheck, CheckCircle2, PlayCircle, Sparkles, Timer, Trash2, Plus, Link2, Star } from "lucide-react";
import clsx from "clsx";

interface Tutorial {
    id: string;
    title: string;
    source?: string;
    focus?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    status: "planned" | "in-progress" | "done";
    practiceCount: number;
    lastPracticed?: number;
    note?: string;
    imageUrl?: string;
}

const statusLabels: Record<Tutorial["status"], string> = {
    "planned": "Planned",
    "in-progress": "Practicing",
    "done": "Mastered",
};

const difficultyTone: Record<NonNullable<Tutorial["difficulty"]>, string> = {
    beginner: "text-emerald-400",
    intermediate: "text-amber-300",
    advanced: "text-rose-300",
};

export default function MakeupTutorialTracker() {
    const { makeupTutorials, addMakeupTutorial, updateMakeupTutorial, removeMakeupTutorial, logMakeupPractice } = useStore();
    const [filter, setFilter] = useState<Tutorial["status"] | "all">("all");

    const [title, setTitle] = useState("");
    const [source, setSource] = useState("");
    const [focus, setFocus] = useState("");
    const [difficulty, setDifficulty] = useState<Tutorial["difficulty"]>("beginner");
    const [status, setStatus] = useState<Tutorial["status"]>("planned");
    const [note, setNote] = useState("");

    const filtered = useMemo(() => {
        return filter === "all" ? makeupTutorials : makeupTutorials.filter((t) => t.status === filter);
    }, [filter, makeupTutorials]);

    const stats = useMemo(() => {
        const completed = makeupTutorials.filter((t) => t.status === "done").length;
        const practicing = makeupTutorials.filter((t) => t.status === "in-progress").length;
        const planned = makeupTutorials.filter((t) => t.status === "planned").length;
        return { completed, practicing, planned, total: makeupTutorials.length };
    }, [makeupTutorials]);

    const addTutorial = () => {
        if (!title.trim()) return;
        addMakeupTutorial({
            id: crypto.randomUUID(),
            title: title.trim(),
            source: source.trim() || undefined,
            focus: focus.trim() || undefined,
            difficulty,
            status,
            practiceCount: 0,
            note: note.trim() || undefined,
        });
        setTitle("");
        setSource("");
        setFocus("");
        setDifficulty("beginner");
        setStatus("planned");
        setNote("");
    };

    const lastPracticeLabel = (ts?: number) => ts ? new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Never";

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-400" />
                        Makeup Tutorial Tracker
                    </h3>
                    <p className="text-xs text-muted-foreground">Queue videos, track practice, and mark mastery</p>
                </div>
                <div className="flex gap-2">
                    {["all", "planned", "in-progress", "done"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={clsx(
                                "px-3 py-1.5 rounded-full text-xs font-semibold border",
                                filter === f ? "bg-pink-500 text-white border-pink-400" : "bg-white/5 border-white/10 text-foreground"
                            )}
                        >
                            {f === "all" ? "All" : statusLabels[f as Tutorial["status"]]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Queued" value={stats.planned} icon={<BookOpenCheck className="w-4 h-4 text-pink-400" />} />
                <StatCard label="Practicing" value={stats.practicing} icon={<Timer className="w-4 h-4 text-amber-400" />} />
                <StatCard label="Mastered" value={stats.completed} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} />
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        placeholder="Tutorial title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        placeholder="YouTube URL or source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <input
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        placeholder="Focus (e.g., soft glam, eyeliner)"
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                    />
                    <select
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Tutorial["difficulty"])}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <select
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Tutorial["status"])}
                    >
                        <option value="planned">Planned</option>
                        <option value="in-progress">Practicing</option>
                        <option value="done">Mastered</option>
                    </select>
                </div>
                <textarea
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                    placeholder="Notes or products used"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                />
                <button
                    onClick={addTutorial}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add Tutorial
                </button>
            </div>

            <div className="space-y-3">
                {filtered.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-white/15 text-sm text-muted-foreground">
                        No tutorials yet. Add one to get started.
                    </div>
                )}
                {filtered.map((tut) => (
                    <div key={tut.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                        {tut.imageUrl && (
                            <div className="relative rounded-lg overflow-hidden aspect-[16/9] mb-3">
                                <img
                                    src={tut.imageUrl}
                                    alt={tut.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold flex items-center gap-2">
                                    {tut.title}
                                    {tut.difficulty && (
                                        <span className={clsx("text-[11px] uppercase tracking-wide font-bold", difficultyTone[tut.difficulty])}>
                                            {tut.difficulty}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1 items-center">
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                                        {statusLabels[tut.status]}
                                    </span>
                                    {tut.focus && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{tut.focus}</span>}
                                    {tut.source && (
                                        <a
                                            href={tut.source}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline"
                                        >
                                            <Link2 className="w-3 h-3" />
                                            Watch
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => logMakeupPractice(tut.id)}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold flex items-center gap-1"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    Practice
                                </button>
                                <button
                                    onClick={() => updateMakeupTutorial(tut.id, { status: tut.status === "done" ? "planned" : "done" })}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {tut.status === "done" ? "Reset" : "Mastered"}
                                </button>
                                <button
                                    onClick={() => removeMakeupTutorial(tut.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {tut.practiceCount} practice(s)
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Last: {lastPracticeLabel(tut.lastPracticed)}
                            </div>
                        </div>
                        {tut.note && <p className="text-sm text-white/70">{tut.note}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <div className="text-lg font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}
