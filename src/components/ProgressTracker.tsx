"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useMemo } from "react";
import {
    Camera,
    TrendingDown,
    TrendingUp,
    Calendar,
    Ruler,
    Scale,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Plus,
    X,
    Download,
    Target,
    Award,
    Sparkles
} from "lucide-react";
import { format, differenceInDays, subDays, subMonths } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

type TimeRange = "week" | "month" | "3months" | "6months" | "year" | "all";
type ComparisonView = "side-by-side" | "overlay" | "grid";

export function ProgressTracker() {
    const { measurements, addMeasurement } = useStore();
    const [timeRange, setTimeRange] = useState<TimeRange>("month");
    const [comparisonView, setComparisonView] = useState<ComparisonView>("side-by-side");
    const [selectedPhotos, setSelectedPhotos] = useState<[number, number]>([0, Math.min(1, measurements.filter(m => m.photo).length - 1)]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        weight: "",
        bust: "",
        waist: "",
        hips: "",
        breast: "",
        butt: "",
        clitLengthMm: "",
        clitGirthMm: "",
        goalWaist: "",
        notes: ""
    });

    // Filter measurements by time range
    const filteredMeasurements = useMemo(() => {
        if (!measurements.length) return [];
        
        const now = Date.now();
        const cutoffDate = (() => {
            switch (timeRange) {
                case "week": return subDays(now, 7).getTime();
                case "month": return subMonths(now, 1).getTime();
                case "3months": return subMonths(now, 3).getTime();
                case "6months": return subMonths(now, 6).getTime();
                case "year": return subMonths(now, 12).getTime();
                default: return 0;
            }
        })();

        return [...measurements]
            .filter(m => m.date >= cutoffDate)
            .sort((a, b) => a.date - b.date);
    }, [measurements, timeRange]);

    // Photos with measurements
    const photosWithMeasurements = useMemo(() => {
        return measurements
            .filter(m => m.photo)
            .sort((a, b) => b.date - a.date);
    }, [measurements]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (filteredMeasurements.length < 2) return null;

        const first = filteredMeasurements[0];
        const latest = filteredMeasurements[filteredMeasurements.length - 1];

        return {
            weightChange: latest.values.weight && first.values.weight 
                ? latest.values.weight - first.values.weight 
                : null,
            waistChange: latest.values.waist && first.values.waist
                ? latest.values.waist - first.values.waist
                : null,
            bustChange: latest.values.bust && first.values.bust
                ? latest.values.bust - first.values.bust
                : null,
            hipChange: latest.values.hips && first.values.hips
                ? latest.values.hips - first.values.hips
                : null,
            buttChange: latest.values.butt && first.values.butt
                ? latest.values.butt - first.values.butt
                : null,
            breastChange: latest.values.breast && first.values.breast
                ? latest.values.breast - first.values.breast
                : null,
            daysBetween: differenceInDays(latest.date, first.date)
        };
    }, [filteredMeasurements]);

    // Chart data
    const chartData = useMemo(() => {
        return filteredMeasurements.map(m => ({
            date: format(m.date, "MMM d"),
            weight: m.values.weight,
            waist: m.values.waist,
            bust: m.values.bust,
            hips: m.values.hips,
            breast: m.values.breast,
            butt: m.values.butt
        }));
    }, [filteredMeasurements]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveMeasurement = () => {
        addMeasurement({
            id: uuidv4(),
            date: Date.now(),
            values: {
                weight: parseFloat(formData.weight) || undefined,
                bust: parseFloat(formData.bust) || undefined,
                waist: parseFloat(formData.waist) || undefined,
                hips: parseFloat(formData.hips) || undefined,
                breast: parseFloat(formData.breast) || undefined,
                butt: parseFloat(formData.butt) || undefined,
                clitLengthMm: parseFloat(formData.clitLengthMm) || undefined,
                clitGirthMm: parseFloat(formData.clitGirthMm) || undefined,
            },
            photo: photoPreview || undefined,
            goalWaist: parseFloat(formData.goalWaist) || undefined,
        });

        // Reset form
        setFormData({
            weight: "",
            bust: "",
            waist: "",
            hips: "",
            breast: "",
            butt: "",
            clitLengthMm: "",
            clitGirthMm: "",
            goalWaist: "",
            notes: ""
        });
        setPhotoPreview(null);
        setShowAddModal(false);
    };

    const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        Progress Tracker
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track your transformation with photos and measurements
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Entry
                </button>
            </div>

            {/* Quick Stats */}
            {latestMeasurement && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {latestMeasurement.values.weight && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <Scale className="w-5 h-5 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold">{latestMeasurement.values.weight}</div>
                            <div className="text-xs text-muted-foreground">lbs</div>
                        </div>
                    )}
                    {latestMeasurement.values.waist && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                            <Ruler className="w-5 h-5 text-purple-600 mb-2" />
                            <div className="text-2xl font-bold">{latestMeasurement.values.waist}"</div>
                            <div className="text-xs text-muted-foreground">Waist</div>
                        </div>
                    )}
                    {latestMeasurement.values.breast && (
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
                            <Ruler className="w-5 h-5 text-rose-600 mb-2" />
                            <div className="text-2xl font-bold">{latestMeasurement.values.breast}"</div>
                            <div className="text-xs text-muted-foreground">Breast</div>
                        </div>
                    )}
                    {latestMeasurement.values.butt && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                            <Ruler className="w-5 h-5 text-amber-600 mb-2" />
                            <div className="text-2xl font-bold">{latestMeasurement.values.butt}"</div>
                            <div className="text-xs text-muted-foreground">Butt</div>
                        </div>
                    )}
                </div>
            )}

            {/* Time Range Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {(["week", "month", "3months", "6months", "year", "all"] as TimeRange[]).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
                            timeRange === range
                                ? "bg-purple-600 text-white"
                                : "bg-white dark:bg-slate-800 border border-border hover:bg-muted"
                        )}
                    >
                        {range === "3months" ? "3 Months" : range === "6months" ? "6 Months" : range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                ))}
            </div>

            {/* Progress Stats */}
            {stats && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">Changes Over {stats.daysBetween} Days</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {stats.weightChange !== null && (
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    stats.weightChange > 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-emerald-100 dark:bg-emerald-900/20"
                                )}>
                                    {stats.weightChange > 0 ? 
                                        <TrendingUp className="w-5 h-5 text-red-600" /> :
                                        <TrendingDown className="w-5 h-5 text-emerald-600" />
                                    }
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Weight</div>
                                    <div className="font-bold">{stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} lbs</div>
                                </div>
                            </div>
                        )}
                        {stats.waistChange !== null && (
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    stats.waistChange < 0 ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-red-100 dark:bg-red-900/20"
                                )}>
                                    {stats.waistChange < 0 ? 
                                        <TrendingDown className="w-5 h-5 text-emerald-600" /> :
                                        <TrendingUp className="w-5 h-5 text-red-600" />
                                    }
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Waist</div>
                                    <div className="font-bold">{stats.waistChange > 0 ? '+' : ''}{stats.waistChange.toFixed(1)}"</div>
                                </div>
                            </div>
                        )}
                        {stats.breastChange !== null && (
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    stats.breastChange > 0 ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-red-100 dark:bg-red-900/20"
                                )}>
                                    {stats.breastChange > 0 ? 
                                        <TrendingUp className="w-5 h-5 text-emerald-600" /> :
                                        <TrendingDown className="w-5 h-5 text-red-600" />
                                    }
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Breast</div>
                                    <div className="font-bold">{stats.breastChange > 0 ? '+' : ''}{stats.breastChange.toFixed(1)}"</div>
                                </div>
                            </div>
                        )}
                        {stats.buttChange !== null && (
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    stats.buttChange > 0 ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-red-100 dark:bg-red-900/20"
                                )}>
                                    {stats.buttChange > 0 ? 
                                        <TrendingUp className="w-5 h-5 text-emerald-600" /> :
                                        <TrendingDown className="w-5 h-5 text-red-600" />
                                    }
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Butt</div>
                                    <div className="font-bold">{stats.buttChange > 0 ? '+' : ''}{stats.buttChange.toFixed(1)}"</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Charts */}
            {chartData.length > 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-5">
                    <h3 className="font-semibold mb-4">Measurement Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                                dataKey="date" 
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis 
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgb(var(--background))',
                                    border: '1px solid rgb(var(--border))',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            {chartData.some(d => d.weight) && (
                                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Weight (lbs)" />
                            )}
                            {chartData.some(d => d.waist) && (
                                <Line type="monotone" dataKey="waist" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} name="Waist (in)" />
                            )}
                            {chartData.some(d => d.breast) && (
                                <Line type="monotone" dataKey="breast" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} name="Breast (in)" />
                            )}
                            {chartData.some(d => d.butt) && (
                                <Line type="monotone" dataKey="butt" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Butt (in)" />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Photo Comparison */}
            {photosWithMeasurements.length >= 2 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-purple-500" />
                            <h3 className="font-semibold">Photo Comparison</h3>
                        </div>
                        <div className="flex gap-2">
                            {(["side-by-side", "overlay", "grid"] as ComparisonView[]).map(view => (
                                <button
                                    key={view}
                                    onClick={() => setComparisonView(view)}
                                    className={clsx(
                                        "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                        comparisonView === view
                                            ? "bg-purple-600 text-white"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                >
                                    {view === "side-by-side" ? "Side by Side" : view.charAt(0).toUpperCase() + view.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {comparisonView === "side-by-side" && (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Before Photo */}
                            <div className="space-y-2">
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={photosWithMeasurements[selectedPhotos[0]].photo!}
                                        alt="Before"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                        <div className="text-xs font-semibold opacity-75">BEFORE</div>
                                        <div className="text-sm font-bold">
                                            {format(photosWithMeasurements[selectedPhotos[0]].date, "MMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedPhotos([Math.max(0, selectedPhotos[0] - 1), selectedPhotos[1]])}
                                        disabled={selectedPhotos[0] === 0}
                                        className="flex-1 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Older
                                    </button>
                                    <button
                                        onClick={() => setSelectedPhotos([Math.min(photosWithMeasurements.length - 2, selectedPhotos[0] + 1), selectedPhotos[1]])}
                                        disabled={selectedPhotos[0] >= selectedPhotos[1] - 1}
                                        className="flex-1 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                        Newer
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* After Photo */}
                            <div className="space-y-2">
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={photosWithMeasurements[selectedPhotos[1]].photo!}
                                        alt="After"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                        <div className="text-xs font-semibold opacity-75">AFTER</div>
                                        <div className="text-sm font-bold">
                                            {format(photosWithMeasurements[selectedPhotos[1]].date, "MMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedPhotos([selectedPhotos[0], Math.max(selectedPhotos[0] + 1, selectedPhotos[1] - 1)])}
                                        disabled={selectedPhotos[1] <= selectedPhotos[0] + 1}
                                        className="flex-1 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Older
                                    </button>
                                    <button
                                        onClick={() => setSelectedPhotos([selectedPhotos[0], Math.min(photosWithMeasurements.length - 1, selectedPhotos[1] + 1)])}
                                        disabled={selectedPhotos[1] >= photosWithMeasurements.length - 1}
                                        className="flex-1 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg flex items-center justify-center gap-1"
                                    >
                                        Newer
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {comparisonView === "grid" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {photosWithMeasurements.map((item, idx) => (
                                <div key={item.id} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={item.photo!}
                                        alt={`Progress ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                                        <div className="text-xs font-bold">
                                            {format(item.date, "MMM d")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Measurement Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Add Progress Entry</h3>
                            <button onClick={() => setShowAddModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Photo Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Progress Photo</label>
                            {photoPreview ? (
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 mb-2">
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setPhotoPreview(null)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                                    <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">Click to upload photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Measurements Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Weight (lbs)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={e => setFormData({...formData, weight: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="150"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Waist (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.waist}
                                    onChange={e => setFormData({...formData, waist: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="28"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Bust (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.bust}
                                    onChange={e => setFormData({...formData, bust: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="36"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Hips (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.hips}
                                    onChange={e => setFormData({...formData, hips: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="38"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Breast (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.breast}
                                    onChange={e => setFormData({...formData, breast: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="36"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Butt (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.butt}
                                    onChange={e => setFormData({...formData, butt: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Clit Length (mm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.clitLengthMm}
                                    onChange={e => setFormData({...formData, clitLengthMm: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Clit Girth (mm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.clitGirthMm}
                                    onChange={e => setFormData({...formData, clitGirthMm: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                    placeholder="25"
                                />
                            </div>
                        </div>

                        {/* Goal */}
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Goal Waist (in)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.goalWaist}
                                onChange={e => setFormData({...formData, goalWaist: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                placeholder="24"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-2 rounded-lg border border-border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveMeasurement}
                                className="flex-1 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                            >
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
