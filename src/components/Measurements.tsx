"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Save, Scale, Ruler, Footprints } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export function Measurements() {
    const { measurements, addMeasurement } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        bust: "",
        waist: "",
        hips: "",
        weight: "",
        dressSize: "",
        shoeSize: "",
        goalWaist: "",
        goalWHR: "",
    });

    // Get latest measurement for current display
    const latest = measurements.length > 0 ? measurements[0] : null;
    const latestValues = latest?.values;

    // Calculate Waist-to-Hip Ratio
    const whr = latestValues?.waist && latestValues?.hips
        ? (latestValues.waist / latestValues.hips).toFixed(2)
        : null;
    
    // Goal progress
    const goalWaist = latest?.goalWaist;
    const goalWHR = latest?.goalWHR;
    const waistProgress = goalWaist && latestValues?.waist 
        ? ((1 - Math.abs(latestValues.waist - goalWaist) / goalWaist) * 100).toFixed(1)
        : null;
    const whrProgress = goalWHR && whr
        ? ((1 - Math.abs(parseFloat(whr) - goalWHR) / goalWHR) * 100).toFixed(1)
        : null;

    const handleSave = () => {
        addMeasurement({
            id: uuidv4(),
            date: Date.now(),
            values: {
                bust: parseFloat(form.bust) || undefined,
                waist: parseFloat(form.waist) || undefined,
                hips: parseFloat(form.hips) || undefined,
                weight: parseFloat(form.weight) || undefined,
                dressSize: parseFloat(form.dressSize) || undefined,
                shoeSize: parseFloat(form.shoeSize) || undefined,
            },
            goalWaist: parseFloat(form.goalWaist) || undefined,
            goalWHR: parseFloat(form.goalWHR) || undefined,
        });
        setIsAdding(false);
        setForm({ bust: "", waist: "", hips: "", weight: "", dressSize: "", shoeSize: "", goalWaist: "", goalWHR: "" });
    };

    // Prepare data for chart (reverse to show oldest first)
    const chartData = [...measurements].reverse().map(m => ({
        date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        bust: m.values.bust,
        waist: m.values.waist,
        hips: m.values.hips,
        weight: m.values.weight,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Body Stats</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm text-primary font-medium"
                >
                    {isAdding ? "Cancel" : "Log New"}
                </button>
            </div>

            {/* Current Stats Overview */}
            {latestValues && !isAdding && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {latestValues.weight && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-border flex flex-col items-center">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Weight</span>
                                <div className="text-lg font-bold flex items-center gap-1">
                                    <Scale className="w-4 h-4 text-primary" />
                                    {latestValues.weight} <span className="text-xs font-normal">lbs</span>
                                </div>
                            </div>
                        )}
                        {whr && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-border flex flex-col items-center">
                                <span className="text-xs text-muted-foreground uppercase font-medium">W / H Ratio</span>
                                <div className="text-lg font-bold flex items-center gap-1">
                                    <Ruler className="w-4 h-4 text-purple-500" />
                                    {whr}
                                </div>
                                {goalWHR && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Goal: {goalWHR} {whrProgress && `(${whrProgress}%)`}
                                    </div>
                                )}
                            </div>
                        )}
                        {latestValues.dressSize && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-border flex flex-col items-center">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Dress Size</span>
                                <div className="text-lg font-bold">{latestValues.dressSize}</div>
                            </div>
                        )}
                        {latestValues.shoeSize && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-border flex flex-col items-center">
                                <span className="text-xs text-muted-foreground uppercase font-medium">Shoe Size</span>
                                <div className="text-lg font-bold flex items-center gap-1">
                                    <Footprints className="w-4 h-4 text-emerald-500" />
                                    {latestValues.shoeSize}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Goal Progress */}
                    {(goalWaist || goalWHR) && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                            <div className="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-100">Goals</div>
                            <div className="grid grid-cols-2 gap-4">
                                {goalWaist && latestValues.waist && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Waist Goal</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold">{latestValues.waist}"</span>
                                            <span className="text-xs text-muted-foreground">→ {goalWaist}"</span>
                                        </div>
                                        <div className="w-full bg-white/50 dark:bg-slate-900/50 rounded-full h-2 mt-1">
                                            <div 
                                                className="bg-purple-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, Math.max(0, parseFloat(waistProgress || "0")))}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {goalWHR && whr && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">WHR Goal</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold">{whr}</span>
                                            <span className="text-xs text-muted-foreground">→ {goalWHR}</span>
                                        </div>
                                        <div className="w-full bg-white/50 dark:bg-slate-900/50 rounded-full h-2 mt-1">
                                            <div 
                                                className="bg-pink-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, Math.max(0, parseFloat(whrProgress || "0")))}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isAdding && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-4 border border-border">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Bust</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-lg border border-border"
                                value={form.bust}
                                onChange={(e) => setForm({ ...form, bust: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Waist</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-lg border border-border"
                                value={form.waist}
                                onChange={(e) => setForm({ ...form, waist: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Hips</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-lg border border-border"
                                value={form.hips}
                                onChange={(e) => setForm({ ...form, hips: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Weight (lbs)</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-lg border border-border"
                                value={form.weight}
                                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Dress Size</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-lg border border-border"
                                value={form.dressSize}
                                onChange={(e) => setForm({ ...form, dressSize: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Shoe Size</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded-lg border border-border"
                                value={form.shoeSize}
                                onChange={(e) => setForm({ ...form, shoeSize: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">Goals (Optional)</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Target Waist (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 rounded-lg border border-border"
                                    placeholder="e.g., 24"
                                    value={form.goalWaist}
                                    onChange={(e) => setForm({ ...form, goalWaist: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Target WHR</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 rounded-lg border border-border"
                                    placeholder="e.g., 0.7"
                                    value={form.goalWHR}
                                    onChange={(e) => setForm({ ...form, goalWHR: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Log
                    </button>
                </div>
            )}

            <div className="h-64 w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-border">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="bust" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="waist" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="hips" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="weight" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-4 justify-center text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500" /> Bust</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500" /> Waist</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Hips</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500" /> Weight</div>
            </div>
        </div>
    );
}
