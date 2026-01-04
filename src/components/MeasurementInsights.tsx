"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { TrendingUp, Ruler, Sparkles, Activity, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import clsx from "clsx";

function formatDelta(value?: number, unit = "") {
    if (value === undefined) return "";
    if (value > 0) return `+${value}${unit}`;
    if (value < 0) return `${value}${unit}`;
    return "0" + unit;
}

function inferCup(bust?: number, band?: number) {
    if (!bust || !band) return null;
    const diff = bust - band;
    // Approx inch-based mapping
    const map: Record<number, string> = {
        0: "AA",
        1: "A",
        2: "B",
        3: "C",
        4: "D",
        5: "DD",
        6: "DDD/F",
        7: "G",
        8: "H",
    };
    const rounded = Math.max(0, Math.min(8, Math.round(diff)));
    return `${band}${map[rounded] ?? ""}`;
}

export default function MeasurementInsights() {
    const { measurements = [] } = useStore();

    const { latest, first, deltas, whr, whrDelta, cupSize, clitTrendData, hipTrendData } = useMemo(() => {
        const entries = measurements || [];
        const latestEntry = entries[0];
        const firstEntry = entries[entries.length - 1];

        const latestValues = latestEntry?.values;
        const firstValues = firstEntry?.values;

        const getDelta = (key: keyof typeof latestValues) => {
            const latestVal = latestValues?.[key];
            const firstVal = firstValues?.[key];
            if (latestVal === undefined || firstVal === undefined) return undefined;
            if (typeof latestVal !== "number" || typeof firstVal !== "number") return undefined;
            return parseFloat((latestVal - firstVal).toFixed(1));
        };

        const waist = latestValues?.waist;
        const hips = latestValues?.hips;
        const whrVal = waist && hips ? parseFloat((waist / hips).toFixed(3)) : undefined;
        const whrStart = firstValues?.waist && firstValues?.hips ? firstValues.waist / firstValues.hips : undefined;
        const whrDeltaVal =
            whrVal !== undefined && whrStart !== undefined
                ? parseFloat((whrVal - whrStart).toFixed(3))
                : undefined;

        const cup = inferCup(latestValues?.bust ?? latestValues?.breast, latestValues?.braBand);

        const clitData = measurements
            .filter((m) => m.values.clitLengthMm)
            .slice()
            .reverse()
            .map((m) => ({
                date: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                clit: m.values.clitLengthMm,
            }));

        const hipData = measurements
            .filter((m) => m.values.hips)
            .slice()
            .reverse()
            .map((m) => ({
                date: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                hips: m.values.hips,
            }));

        return {
            latest: latestValues,
            first: firstValues,
            deltas: {
                waist: getDelta("waist" as any),
                hips: getDelta("hips" as any),
                bust: getDelta("bust" as any),
                breast: getDelta("breast" as any),
                butt: getDelta("butt" as any),
                clitLengthMm: getDelta("clitLengthMm" as any),
            },
            whr: whrVal,
            whrDelta: whrDeltaVal,
            cupSize: cup,
            clitTrendData: clitData,
            hipTrendData: hipData,
        };
    }, [measurements]);

    if (!latest || measurements.length === 0) return null;

    const insightCards = [
        {
            title: "Waist",
            value: latest.waist ? `${latest.waist}"` : "—",
            delta: deltas.waist,
            tone: "positive" as const,
        },
        {
            title: "Hips",
            value: latest.hips ? `${latest.hips}"` : "—",
            delta: deltas.hips,
            tone: "neutral" as const,
        },
        {
            title: "Butt",
            value: latest.butt ? `${latest.butt}"` : "—",
            delta: deltas.butt,
            tone: "neutral" as const,
        },
        {
            title: "Breast",
            value: latest.breast ? `${latest.breast}"` : "—",
            delta: deltas.breast,
            tone: "positive" as const,
        },
        {
            title: "Clit Length",
            value: latest.clitLengthMm ? `${latest.clitLengthMm} mm` : "—",
            delta: deltas.clitLengthMm,
            tone: "neutral" as const,
        },
    ];

    return (
        <div className="space-y-4 bg-white/5 rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Measurement Insights</h3>
                    <p className="text-sm text-muted-foreground">Trends and growth highlights</p>
                </div>
                <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>

            {/* Key cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {insightCards.map((card) => (
                    <div
                        key={card.title}
                        className="p-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0"
                    >
                        <div className="text-xs text-muted-foreground font-semibold mb-1">{card.title}</div>
                        <div className="text-xl font-bold text-foreground">{card.value}</div>
                        {card.delta !== undefined && (
                            <div
                                className={clsx(
                                    "text-xs font-semibold mt-1",
                                    card.delta > 0 ? "text-green-400" : card.delta < 0 ? "text-red-400" : "text-muted-foreground"
                                )}
                            >
                                {formatDelta(card.delta, card.title === "Clit Length" ? " mm" : "")}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* WHR & Bra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Ruler className="w-4 h-4 text-purple-400" /> Waist-Hip Ratio
                        </div>
                        {whr !== undefined && (
                            <span className="text-xs font-semibold text-muted-foreground">{whr}</span>
                        )}
                    </div>
                    {whr !== undefined && (
                        <p className="text-xs text-muted-foreground">
                            {whrDelta !== undefined && (
                                <span className={clsx(
                                    "font-semibold",
                                    whrDelta < 0 ? "text-green-400" : whrDelta > 0 ? "text-amber-400" : "text-muted-foreground"
                                )}>
                                    {whrDelta < 0 ? "Improving" : whrDelta > 0 ? "Higher" : "Stable"} by {Math.abs(whrDelta)}
                                </span>
                            )} toward the target hourglass ratio (~0.70).
                        </p>
                    )}
                    {whr === undefined && <p className="text-xs text-muted-foreground">Add waist and hips to see WHR.</p>}
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Sparkles className="w-4 h-4 text-pink-400" /> Bra Size Suggestion
                        </div>
                        <span className="text-xs text-muted-foreground">Based on band/bust</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                        {cupSize ?? "Add band + bust to suggest"}
                    </p>
                    <p className="text-xs text-muted-foreground">Uses bust - band difference to estimate cup.</p>
                </div>
            </div>

            {/* Trend charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TrendChart
                    title="Hips Trend"
                    data={hipTrendData}
                    dataKey="hips"
                    color="#ec4899"
                    placeholder="Log hips to see trend."
                />
                <TrendChart
                    title="Clit Length Trend"
                    data={clitTrendData}
                    dataKey="clit"
                    color="#a855f7"
                    placeholder="Log clit length to see trend."
                />
            </div>

            {/* Alert */}
            {deltas.waist !== undefined && deltas.waist > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-4 h-4" /> Waist increased. Consider tightening your waist goal actions.
                </div>
            )}
        </div>
    );
}

function TrendChart({
    title,
    data,
    dataKey,
    color,
    placeholder,
}: {
    title: string;
    data: { date: string; [k: string]: number | string | undefined }[];
    dataKey: string;
    color: string;
    placeholder: string;
}) {
    const hasData = data && data.length > 1;
    return (
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 h-56">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    {title}
                </div>
            </div>
            {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} domain={["auto", "auto"]} />
                        <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 8 }}
                            labelStyle={{ color: "#e5e7eb" }}
                            itemStyle={{ color: "#e5e7eb" }}
                        />
                        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-xs text-muted-foreground font-semibold">{placeholder}</div>
            )}
        </div>
    );
}
