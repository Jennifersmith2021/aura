"use client";

import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { Activity, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import clsx from "clsx";

function deltaLabel(delta?: number, unit = "") {
    if (delta === undefined) return "—";
    if (delta > 0) return `+${delta}${unit}`;
    if (delta < 0) return `${delta}${unit}`;
    return `0${unit}`;
}

export default function GrowthDashboard() {
    const { measurements = [] } = useStore();

    const { chartData, deltas, alerts } = useMemo(() => {
        const entries = measurements || [];
        if (!entries.length) return { chartData: [], deltas: {} as Record<string, number | undefined>, alerts: [] as string[] };
        const sorted = [...entries].sort((a, b) => a.date - b.date);
        const latest = sorted[sorted.length - 1];
        const first = sorted[0];

        const keys: (keyof typeof latest.values)[] = ["breast", "butt", "waist", "hips"];
        const deltaMap: Record<string, number | undefined> = {};
        keys.forEach((k) => {
            const curr = latest.values[k];
            const start = first.values[k];
            if (typeof curr === "number" && typeof start === "number") {
                deltaMap[k] = parseFloat((curr - start).toFixed(1));
            }
        });

        const data = sorted.slice(-12).map((m) => ({
            date: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            breast: m.values.breast ?? m.values.bust,
            butt: m.values.butt,
            waist: m.values.waist,
            hips: m.values.hips,
        }));

        const recent = sorted.slice(-4);
        const alerts: string[] = [];
        const checkTrend = (key: keyof typeof latest.values, label: string, inverse = false) => {
            if (recent.length < 3) return;
            const vals = recent.map((m) => m.values[key]).filter((v): v is number => typeof v === "number");
            if (vals.length < 3) return;
            const start = vals[0];
            const end = vals[vals.length - 1];
            const change = parseFloat((end - start).toFixed(1));
            const plateau = Math.abs(change) < 0.2;
            const reversal = inverse ? change > 0.2 : change < -0.2;
            if (reversal) alerts.push(`${label} is reversing; review your plan.`);
            else if (plateau) alerts.push(`${label} is plateauing; tweak routine or log more data.`);
        };

        checkTrend("breast", "Breast growth");
        checkTrend("butt", "Butt growth");
        checkTrend("waist", "Waist trimming", true);

        return { chartData: data, deltas: deltaMap, alerts };
    }, [measurements]);

    if (!measurements.length) return null;

    return (
        <div className="space-y-4 bg-white/5 rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-400" /> Growth Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">Breast, butt, and waist trends at a glance</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Breast" value={measurements[0]?.values.breast ?? measurements[0]?.values.bust} delta={deltas.breast} />
                <MetricCard label="Butt" value={measurements[0]?.values.butt} delta={deltas.butt} />
                <MetricCard label="Waist" value={measurements[0]?.values.waist} delta={deltas.waist} tone="inverse" />
                <MetricCard label="Hips" value={measurements[0]?.values.hips} delta={deltas.hips} />
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/5 h-64">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <Activity className="w-4 h-4 text-muted-foreground" /> Last 12 logs
                </div>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#ffffff50" style={{ fontSize: "12px" }} />
                            <YAxis stroke="#ffffff50" style={{ fontSize: "12px" }} domain={["auto", "auto"]} />
                            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                            <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                            <Line type="monotone" dataKey="breast" stroke="#f472b6" strokeWidth={2} dot={false} name="Breast" />
                            <Line type="monotone" dataKey="butt" stroke="#a855f7" strokeWidth={2} dot={false} name="Butt" />
                            <Line type="monotone" dataKey="waist" stroke="#38bdf8" strokeWidth={2} dot={false} name="Waist" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-sm text-muted-foreground">Add more measurements to see a trend chart.</div>
                )}
            </div>

            {alerts.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200 space-y-1">
                    {alerts.map((a, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <ArrowDownRight className="w-4 h-4 mt-0.5" />
                            <span>{a}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, delta, tone }: { label: string; value?: number; delta?: number; tone?: "inverse" }) {
    const positive = delta !== undefined && delta > 0;
    const negative = delta !== undefined && delta < 0;
    const trendingUp = tone === "inverse" ? negative : positive;
    const trendingDown = tone === "inverse" ? positive : negative;

    return (
        <div className="p-3 rounded-xl border border-white/10 bg-white/5">
            <div className="text-xs text-muted-foreground font-semibold mb-1">{label}</div>
            <div className="text-xl font-bold text-foreground">{value !== undefined ? `${value}` : "—"}</div>
            {delta !== undefined && (
                <div className={clsx("flex items-center gap-1 text-xs font-semibold", trendingUp && "text-emerald-400", trendingDown && "text-rose-400", !trendingUp && !trendingDown && "text-muted-foreground")}
                >
                    {trendingUp && <ArrowUpRight className="w-3 h-3" />}
                    {trendingDown && <ArrowDownRight className="w-3 h-3" />}
                    {deltaLabel(delta)}
                </div>
            )}
        </div>
    );
}
