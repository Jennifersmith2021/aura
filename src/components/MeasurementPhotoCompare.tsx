"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import clsx from "clsx";

export default function MeasurementPhotoCompare() {
    const { measurements = [] } = useStore();
    const [selectedIndices, setSelectedIndices] = useState<[number, number]>([0, 1]);

    const photosWithDates = useMemo(() => {
        const entries = measurements || [];
        return entries
            .filter((m) => m.photo)
            .map((m, idx) => ({
                idx,
                photo: m.photo!,
                date: new Date(m.date),
                measurement: m,
            }));
    }, [measurements]);

    if (photosWithDates.length < 2) {
        return (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground font-semibold">
                    Need at least 2 measurement photos to compare
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Upload photos when logging measurements to enable side-by-side growth comparison
                </p>
            </div>
        );
    }

    const [left, right] = selectedIndices;
    const leftPhoto = photosWithDates[left];
    const rightPhoto = photosWithDates[right];

    const handlePrevLeft = () => {
        setSelectedIndices([Math.max(0, left - 1), right]);
    };

    const handleNextLeft = () => {
        if (left < photosWithDates.length - 1 && left < right - 1) {
            setSelectedIndices([left + 1, right]);
        }
    };

    const handlePrevRight = () => {
        if (right > left + 1) {
            setSelectedIndices([left, right - 1]);
        }
    };

    const handleNextRight = () => {
        setSelectedIndices([left, Math.min(photosWithDates.length - 1, right + 1)]);
    };

    const daysDiff = Math.floor((rightPhoto.date.getTime() - leftPhoto.date.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-4 bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Photo Comparison</h3>
                    <p className="text-sm text-muted-foreground">See your growth side by side</p>
                </div>
                <Camera className="w-5 h-5 text-pink-400" />
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Photo */}
                <div className="space-y-2">
                    <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[3/4] border border-white/10">
                        <img
                            src={leftPhoto.photo}
                            alt="before"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <div className="text-xs font-semibold opacity-75">BEFORE</div>
                            <div className="text-lg font-bold">
                                {leftPhoto.date.toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevLeft}
                            disabled={left === 0}
                            className={clsx(
                                "flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1",
                                left === 0
                                    ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                    : "bg-white/10 hover:bg-white/20 text-foreground"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Earlier
                        </button>
                        <button
                            onClick={handleNextLeft}
                            disabled={left >= right - 1}
                            className={clsx(
                                "flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1",
                                left >= right - 1
                                    ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                    : "bg-white/10 hover:bg-white/20 text-foreground"
                            )}
                        >
                            Later
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Photo */}
                <div className="space-y-2">
                    <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[3/4] border border-white/10">
                        <img
                            src={rightPhoto.photo}
                            alt="after"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <div className="text-xs font-semibold opacity-75">AFTER</div>
                            <div className="text-lg font-bold">
                                {rightPhoto.date.toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevRight}
                            disabled={right <= left + 1}
                            className={clsx(
                                "flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1",
                                right <= left + 1
                                    ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                    : "bg-white/10 hover:bg-white/20 text-foreground"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Earlier
                        </button>
                        <button
                            onClick={handleNextRight}
                            disabled={right === photosWithDates.length - 1}
                            className={clsx(
                                "flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1",
                                right === photosWithDates.length - 1
                                    ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                    : "bg-white/10 hover:bg-white/20 text-foreground"
                            )}
                        >
                            Later
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline info */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30 p-4">
                <div className="text-sm text-foreground font-semibold mb-2">Progress Timeline</div>
                <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-pink-300">{daysDiff} days</span> of growth between photos. Keep taking measurements at the same angle and distance to see clear changes!
                </p>
            </div>

            {/* Measurement comparison */}
            <div className="grid grid-cols-2 gap-3">
                <MeasurementDelta
                    label="Waist"
                    before={leftPhoto.measurement.values.waist}
                    after={rightPhoto.measurement.values.waist}
                    unit='"'
                />
                <MeasurementDelta
                    label="Hips"
                    before={leftPhoto.measurement.values.hips}
                    after={rightPhoto.measurement.values.hips}
                    unit='"'
                />
                <MeasurementDelta
                    label="Bust"
                    before={leftPhoto.measurement.values.bust}
                    after={rightPhoto.measurement.values.bust}
                    unit='"'
                />
                <MeasurementDelta
                    label="Breast"
                    before={leftPhoto.measurement.values.breast}
                    after={rightPhoto.measurement.values.breast}
                    unit='"'
                />
                <MeasurementDelta
                    label="Butt"
                    before={leftPhoto.measurement.values.butt}
                    after={rightPhoto.measurement.values.butt}
                    unit='"'
                />
                <MeasurementDelta
                    label="Clit Length"
                    before={leftPhoto.measurement.values.clitLengthMm}
                    after={rightPhoto.measurement.values.clitLengthMm}
                    unit=" mm"
                />
            </div>
        </div>
    );
}

function MeasurementDelta({
    label,
    before,
    after,
    unit,
}: {
    label: string;
    before?: number;
    after?: number;
    unit: string;
}) {
    if (before === undefined || after === undefined) return null;

    const delta = after - before;
    const isPositive = delta > 0;

    return (
        <div className="bg-white/5 rounded-lg border border-white/10 p-3">
            <div className="text-xs text-muted-foreground font-semibold">{label}</div>
            <div className="flex items-center justify-between mt-1">
                <div className="flex gap-1 text-xs">
                    <span className="text-muted-foreground">{before}{unit}</span>
                    <span className="text-white/30">→</span>
                    <span className="font-bold text-foreground">{after}{unit}</span>
                </div>
                <div
                    className={clsx(
                        "font-bold text-xs px-2 py-1 rounded",
                        isPositive
                            ? "bg-green-500/20 text-green-300"
                            : delta < 0
                            ? "bg-red-500/20 text-red-300"
                            : "bg-white/10 text-white"
                    )}
                >
                    {isPositive ? "+" : ""}{delta.toFixed(1)}{unit}
                </div>
            </div>
        </div>
    );
}
