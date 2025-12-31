"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import clsx from "clsx";

interface OutfitPlan {
    id: string;
    date: string;
    occasion: string;
    itemIds: string[];
    notes?: string;
}

const occasions = [
    "Casual Day",
    "Work/Professional",
    "Date Night",
    "Night Out",
    "Shopping",
    "Gym/Exercise",
    "Loungewear",
    "Special Event",
];

export default function WardrobePlanner() {
    const { items } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [outfitPlans, setOutfitPlans] = useState<OutfitPlan[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newPlan, setNewPlan] = useState({
        occasion: "Casual Day",
        itemIds: [] as string[],
        notes: "",
    });

    // Load outfit plans from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("outfitPlans");
        if (stored) {
            setOutfitPlans(JSON.parse(stored));
        }
    }, []);

    const saveOutfitPlans = (plans: OutfitPlan[]) => {
        setOutfitPlans(plans);
        localStorage.setItem("outfitPlans", JSON.stringify(plans));
    };

    const addOutfitPlan = () => {
        if (!selectedDate || newPlan.itemIds.length === 0) return;

        const plan: OutfitPlan = {
            id: Date.now().toString(),
            date: selectedDate.toISOString(),
            occasion: newPlan.occasion,
            itemIds: newPlan.itemIds,
            notes: newPlan.notes || undefined,
        };

        saveOutfitPlans([...outfitPlans, plan]);
        setNewPlan({ occasion: "Casual Day", itemIds: [], notes: "" });
        setShowAddModal(false);
        setSelectedDate(null);
    };

    const deleteOutfitPlan = (id: string) => {
        saveOutfitPlans(outfitPlans.filter((p) => p.id !== id));
    };

    const toggleItemInPlan = (itemId: string) => {
        setNewPlan((prev) => ({
            ...prev,
            itemIds: prev.itemIds.includes(itemId)
                ? prev.itemIds.filter((id) => id !== itemId)
                : [...prev.itemIds, itemId],
        }));
    };

    // Calendar generation
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getPlansForDate = (day: number) => {
        const dateStr = new Date(year, month, day).toDateString();
        return outfitPlans.filter((plan) => new Date(plan.date).toDateString() === dateStr);
    };

    const clothingItems = items.filter((i) => i.type === "clothing");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Wardrobe Planner</h2>
                    <p className="text-sm text-muted-foreground">Plan your outfits for the week</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
            </div>

            {/* Calendar Navigation */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <h3 className="text-xl font-bold text-foreground">
                        {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Calendar days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const plans = getPlansForDate(day);
                        const dateObj = new Date(year, month, day);
                        const isToday = dateObj.toDateString() === new Date().toDateString();

                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    setSelectedDate(dateObj);
                                    setShowAddModal(true);
                                }}
                                className={clsx(
                                    "aspect-square rounded-lg p-1 text-sm font-semibold transition-all relative",
                                    isToday
                                        ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                                        : plans.length > 0
                                        ? "bg-purple-500/20 text-foreground hover:bg-purple-500/30"
                                        : "bg-secondary text-foreground hover:bg-accent"
                                )}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span>{day}</span>
                                    {plans.length > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {plans.slice(0, 3).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-1 h-1 rounded-full bg-purple-400"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Outfits */}
            <div className="space-y-3">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Upcoming Outfits
                </h3>

                {outfitPlans
                    .filter((plan) => new Date(plan.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((plan) => {
                        const planItems = items.filter((i) => plan.itemIds.includes(i.id));
                        return (
                            <div
                                key={plan.id}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-base text-foreground">{plan.occasion}</h4>
                                        <p className="text-sm text-purple-400 font-medium">
                                            {new Date(plan.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteOutfitPlan(plan.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Items in outfit */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {planItems.slice(0, 4).map((item) => (
                                        <div
                                            key={item.id}
                                            className="aspect-square rounded-lg overflow-hidden bg-secondary"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium text-center p-1">
                                                    {item.name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {planItems.length > 4 && (
                                        <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-sm text-muted-foreground font-bold">
                                            +{planItems.length - 4}
                                        </div>
                                    )}
                                </div>

                                {plan.notes && (
                                    <p className="text-sm text-muted-foreground italic">{plan.notes}</p>
                                )}
                            </div>
                        );
                    })}

                {outfitPlans.filter((plan) => new Date(plan.date) >= new Date()).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No upcoming outfits planned</p>
                        <p className="text-sm mt-1">Click a date on the calendar to start planning!</p>
                    </div>
                )}
            </div>

            {/* Add Outfit Modal */}
            <AnimatePresence>
                {showAddModal && selectedDate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background rounded-2xl border border-border max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 space-y-4">
                                <h3 className="text-xl font-bold text-foreground">
                                    Plan Outfit for{" "}
                                    {selectedDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </h3>

                                {/* Occasion */}
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Occasion
                                    </label>
                                    <select
                                        value={newPlan.occasion}
                                        onChange={(e) =>
                                            setNewPlan({ ...newPlan, occasion: e.target.value })
                                        }
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                    >
                                        {occasions.map((occ) => (
                                            <option key={occ} value={occ}>
                                                {occ}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select Items */}
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Select Items ({newPlan.itemIds.length} selected)
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-secondary rounded-lg">
                                        {clothingItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleItemInPlan(item.id)}
                                                className={clsx(
                                                    "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                                    newPlan.itemIds.includes(item.id)
                                                        ? "border-purple-500 ring-2 ring-purple-500"
                                                        : "border-transparent hover:border-purple-300"
                                                )}
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-accent flex items-center justify-center text-xs text-foreground font-medium text-center p-1">
                                                        {item.name}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        value={newPlan.notes}
                                        onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                                        placeholder="Add any notes about this outfit..."
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={addOutfitPlan}
                                        disabled={newPlan.itemIds.length === 0}
                                        className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Outfit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setNewPlan({ occasion: "Casual Day", itemIds: [], notes: "" });
                                        }}
                                        className="px-6 py-2.5 bg-secondary text-foreground rounded-xl font-semibold text-sm hover:bg-accent transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
