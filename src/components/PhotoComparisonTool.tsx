"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { ChevronLeft, ChevronRight, ArrowLeftRight, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

/**
 * Photo Comparison Tool - Compare progress photos side-by-side
 * Shows measurements and date for context
 */
export function PhotoComparisonTool() {
    const { measurements } = useStore();

    // Get all entries with photos (from measurements)
    const photoEntries = useMemo(() => {
        const entries: Array<{
            id: string;
            date: number;
            photo: string;
            measurements?: {
                waist?: number;
                hips?: number;
                bust?: number;
                weight?: number;
            };
            notes?: string;
        }> = [];

        // Add measurement photos
        measurements?.forEach(m => {
            if (m.photo) {
                entries.push({
                    id: `measurement-${m.id}`,
                    date: m.date,
                    photo: m.photo,
                    measurements: {
                        waist: m.values?.waist,
                        hips: m.values?.hips,
                        bust: m.values?.bust,
                        weight: m.values?.weight,
                    },
                });
            }
        });

        // Sort by date descending (newest first)
        return entries.sort((a, b) => b.date - a.date);
    }, [measurements]);

    const [leftIndex, setLeftIndex] = useState(photoEntries.length > 1 ? 1 : 0);
    const [rightIndex, setRightIndex] = useState(0);

    const leftPhoto = photoEntries[leftIndex];
    const rightPhoto = photoEntries[rightIndex];

    const handleSwap = () => {
        const temp = leftIndex;
        setLeftIndex(rightIndex);
        setRightIndex(temp);
    };

    const calculateDifference = (metric: 'waist' | 'hips' | 'bust' | 'weight') => {
        const left = leftPhoto?.measurements?.[metric];
        const right = rightPhoto?.measurements?.[metric];
        if (!left || !right) return null;
        const diff = right - left;
        return diff;
    };

    if (photoEntries.length === 0) {
        return (
            <div className="bg-background border border-border rounded-xl p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Photos Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Take measurement photos or upload progress photos to use the comparison tool
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Photo Comparison
                </h2>
                <button
                    onClick={handleSwap}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <ArrowLeftRight className="w-4 h-4" />
                    Swap
                </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Left Photo */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setLeftIndex(Math.min(leftIndex + 1, photoEntries.length - 1))}
                            disabled={leftIndex >= photoEntries.length - 1}
                            className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-muted-foreground">
                            {format(leftPhoto.date, "MMM d, yyyy")}
                        </span>
                        <button
                            onClick={() => setLeftIndex(Math.max(leftIndex - 1, 0))}
                            disabled={leftIndex <= 0}
                            className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={leftPhoto.photo}
                            alt="Before"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {leftPhoto.measurements && (
                        <div className="bg-background border border-border rounded-lg p-3 space-y-1 text-sm">
                            {leftPhoto.measurements.waist && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Waist:</span>
                                    <span className="font-semibold">{leftPhoto.measurements.waist}"</span>
                                </div>
                            )}
                            {leftPhoto.measurements.hips && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hips:</span>
                                    <span className="font-semibold">{leftPhoto.measurements.hips}"</span>
                                </div>
                            )}
                            {leftPhoto.measurements.bust && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bust:</span>
                                    <span className="font-semibold">{leftPhoto.measurements.bust}"</span>
                                </div>
                            )}
                            {leftPhoto.measurements.weight && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Weight:</span>
                                    <span className="font-semibold">{leftPhoto.measurements.weight} lbs</span>
                                </div>
                            )}
                        </div>
                    )}

                    {leftPhoto.notes && (
                        <p className="text-sm text-muted-foreground italic">{leftPhoto.notes}</p>
                    )}
                </div>

                {/* Right Photo */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setRightIndex(Math.min(rightIndex + 1, photoEntries.length - 1))}
                            disabled={rightIndex >= photoEntries.length - 1}
                            className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-muted-foreground">
                            {format(rightPhoto.date, "MMM d, yyyy")}
                        </span>
                        <button
                            onClick={() => setRightIndex(Math.max(rightIndex - 1, 0))}
                            disabled={rightIndex <= 0}
                            className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={rightPhoto.photo}
                            alt="After"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {rightPhoto.measurements && (
                        <div className="bg-background border border-border rounded-lg p-3 space-y-1 text-sm">
                            {rightPhoto.measurements.waist && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Waist:</span>
                                    <span className="font-semibold">{rightPhoto.measurements.waist}"</span>
                                </div>
                            )}
                            {rightPhoto.measurements.hips && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hips:</span>
                                    <span className="font-semibold">{rightPhoto.measurements.hips}"</span>
                                </div>
                            )}
                            {rightPhoto.measurements.bust && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bust:</span>
                                    <span className="font-semibold">{rightPhoto.measurements.bust}"</span>
                                </div>
                            )}
                            {rightPhoto.measurements.weight && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Weight:</span>
                                    <span className="font-semibold">{rightPhoto.measurements.weight} lbs</span>
                                </div>
                            )}
                        </div>
                    )}

                    {rightPhoto.notes && (
                        <p className="text-sm text-muted-foreground italic">{rightPhoto.notes}</p>
                    )}
                </div>
            </div>

            {/* Difference Summary */}
            {leftPhoto.measurements && rightPhoto.measurements && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Progress Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {calculateDifference('waist') !== null && (
                            <div>
                                <div className="text-muted-foreground mb-1">Waist Change</div>
                                <div className={`font-bold text-lg ${
                                    calculateDifference('waist')! < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {calculateDifference('waist')! > 0 ? '+' : ''}{calculateDifference('waist')?.toFixed(1)}"
                                </div>
                            </div>
                        )}
                        {calculateDifference('hips') !== null && (
                            <div>
                                <div className="text-muted-foreground mb-1">Hips Change</div>
                                <div className={`font-bold text-lg ${
                                    calculateDifference('hips')! > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {calculateDifference('hips')! > 0 ? '+' : ''}{calculateDifference('hips')?.toFixed(1)}"
                                </div>
                            </div>
                        )}
                        {calculateDifference('bust') !== null && (
                            <div>
                                <div className="text-muted-foreground mb-1">Bust Change</div>
                                <div className={`font-bold text-lg ${
                                    calculateDifference('bust')! > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {calculateDifference('bust')! > 0 ? '+' : ''}{calculateDifference('bust')?.toFixed(1)}"
                                </div>
                            </div>
                        )}
                        {calculateDifference('weight') !== null && (
                            <div>
                                <div className="text-muted-foreground mb-1">Weight Change</div>
                                <div className={`font-bold text-lg ${
                                    calculateDifference('weight')! < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {calculateDifference('weight')! > 0 ? '+' : ''}{calculateDifference('weight')?.toFixed(1)} lbs
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Comparing photos from {format(leftPhoto.date, "MMM d")} to {format(rightPhoto.date, "MMM d, yyyy")} 
                        {leftPhoto.date !== rightPhoto.date && ` (${Math.abs(Math.floor((rightPhoto.date - leftPhoto.date) / (1000 * 60 * 60 * 24)))} days apart)`}
                    </p>
                </div>
            )}
        </div>
    );
}
