"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState, useMemo } from "react";
import { Pill, Plus, Trash2, TrendingUp, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface HormoneLog {
    id: string;
    date: string;
    medication: string;
    dosage: string;
    time: string; // HH:MM format
    notes: string;
    sideEffects: string[];
}

interface SupplementLog {
    id: string;
    date: string;
    supplement: string;
    dosage: string;
    time: string;
    notes: string;
}

interface EffectTracking {
    date: string;
    mood: number; // 1-10
    breastTenderness: number; // 1-10
    skinClarity: number; // 1-10
    energy: number; // 1-10
    libido: number; // 1-10
    notes: string;
}

const commonMedications = [
    { name: "Estradiol (Hrt)", dosage: "2mg, 4mg, 6mg" },
    { name: "Spironolactone (Anti-androgen)", dosage: "50mg, 100mg, 200mg" },
    { name: "Finasteride (Hair loss)", dosage: "1mg, 5mg" },
    { name: "Progesterone", dosage: "100mg, 200mg, 300mg" },
];

const commonSupplements = [
    "Spearmint Tea",
    "Saw Palmetto",
    "Pm (Breast enhancement)",
    "Dong Quai",
    "Fenugreek",
    "Fennel",
    "Blessed Thistle",
    "Flaxseed",
    "Evening Primrose Oil",
];

export default function HormoneSupplementTracker() {
    const [hormones, setHormones] = useState<HormoneLog[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("hormoneLogs");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [supplements, setSupplements] = useState<SupplementLog[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("supplementLogs");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [effects, setEffects] = useState<EffectTracking[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("effectTracking");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [showHormoneForm, setShowHormoneForm] = useState(false);
    const [showSupplementForm, setShowSupplementForm] = useState(false);
    const [showEffectForm, setShowEffectForm] = useState(false);

    // Form states
    const [hormoneForm, setHormoneForm] = useState({ medication: "", dosage: "", time: "", notes: "", sideEffects: [] });
    const [supplementForm, setSupplementForm] = useState({ supplement: "", dosage: "", time: "", notes: "" });
    const [effectForm, setEffectForm] = useState({
        date: new Date().toISOString().split("T")[0],
        mood: 5,
        breastTenderness: 5,
        skinClarity: 5,
        energy: 5,
        libido: 5,
        notes: "",
    });

    // Calculate stats
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const todayHormones = hormones.filter((h) => h.date === today);
        const todaySupplements = supplements.filter((s) => s.date === today);
        const todayEffects = effects.find((e) => e.date === today);

        return {
            hormonesLogged: todayHormones.length,
            supplementsLogged: todaySupplements.length,
            effectsLogged: !!todayEffects,
            avgMood: effects.length > 0 ? Math.round(effects.reduce((sum, e) => sum + e.mood, 0) / effects.length) : 0,
        };
    }, [hormones, supplements, effects]);

    const addHormone = () => {
        if (!hormoneForm.medication || !hormoneForm.dosage || !hormoneForm.time) {
            alert("Please fill required fields");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        const newHormone: HormoneLog = {
            id: `hormone-${Date.now()}`,
            date: today,
            ...hormoneForm,
        };

        const updated = [...hormones, newHormone];
        setHormones(updated);
        localStorage.setItem("hormoneLogs", JSON.stringify(updated));
        setHormoneForm({ medication: "", dosage: "", time: "", notes: "", sideEffects: [] });
        setShowHormoneForm(false);
    };

    const addSupplement = () => {
        if (!supplementForm.supplement || !supplementForm.dosage || !supplementForm.time) {
            alert("Please fill required fields");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        const newSupplement: SupplementLog = {
            id: `supplement-${Date.now()}`,
            date: today,
            ...supplementForm,
        };

        const updated = [...supplements, newSupplement];
        setSupplements(updated);
        localStorage.setItem("supplementLogs", JSON.stringify(updated));
        setSupplementForm({ supplement: "", dosage: "", time: "", notes: "" });
        setShowSupplementForm(false);
    };

    const addEffect = () => {
        const existing = effects.findIndex((e) => e.date === effectForm.date);
        let updated;

        if (existing >= 0) {
            updated = effects.map((e, idx) => (idx === existing ? effectForm : e));
        } else {
            updated = [...effects, effectForm];
        }

        setEffects(updated);
        localStorage.setItem("effectTracking", JSON.stringify(updated));
        setEffectForm({
            date: new Date().toISOString().split("T")[0],
            mood: 5,
            breastTenderness: 5,
            skinClarity: 5,
            energy: 5,
            libido: 5,
            notes: "",
        });
        setShowEffectForm(false);
    };

    const deleteHormone = (id: string) => {
        const updated = hormones.filter((h) => h.id !== id);
        setHormones(updated);
        localStorage.setItem("hormoneLogs", JSON.stringify(updated));
    };

    const deleteSupplement = (id: string) => {
        const updated = supplements.filter((s) => s.id !== id);
        setSupplements(updated);
        localStorage.setItem("supplementLogs", JSON.stringify(updated));
    };

    const today = new Date().toISOString().split("T")[0];
    const todayHormones = hormones.filter((h) => h.date === today).sort((a, b) => a.time.localeCompare(b.time));
    const todaySupplements = supplements.filter((s) => s.date === today).sort((a, b) => a.time.localeCompare(b.time));
    const todayEffects = effects.find((e) => e.date === today);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Hormone & Supplement Tracker</h2>
                    <p className="text-sm text-muted-foreground">Monitor HRT and supplements with effect tracking</p>
                </div>
                <Pill className="w-8 h-8 text-pink-400" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center"
                >
                    <div className="text-2xl font-bold text-foreground">{stats.hormonesLogged}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Hormones Today</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center"
                >
                    <div className="text-2xl font-bold text-foreground">{stats.supplementsLogged}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Supplements Today</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center"
                >
                    <div className="text-2xl font-bold text-foreground">{stats.effectsLogged ? "✓" : "-"}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Effects Logged</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center"
                >
                    <div className="text-2xl font-bold text-foreground">{stats.avgMood || "-"}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Avg Mood</div>
                </motion.div>
            </div>

            {/* Hormone Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Today's Hormones</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowHormoneForm(!showHormoneForm)}
                        className="p-2 bg-pink-500/20 border border-pink-500/50 rounded-lg hover:bg-pink-500/30 transition-all"
                    >
                        <Plus className="w-5 h-5 text-pink-300" />
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showHormoneForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 space-y-3"
                        >
                            <select
                                value={hormoneForm.medication}
                                onChange={(e) => setHormoneForm({ ...hormoneForm, medication: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                            >
                                <option value="">Select medication</option>
                                {commonMedications.map((med) => (
                                    <option key={med.name} value={med.name}>
                                        {med.name}
                                    </option>
                                ))}
                                <option value="other">Other (type below)</option>
                            </select>

                            {hormoneForm.medication === "other" && (
                                <input
                                    type="text"
                                    placeholder="Medication name"
                                    value={hormoneForm.medication === "other" ? "" : hormoneForm.medication}
                                    onChange={(e) => setHormoneForm({ ...hormoneForm, medication: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                                />
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Dosage"
                                    value={hormoneForm.dosage}
                                    onChange={(e) => setHormoneForm({ ...hormoneForm, dosage: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                                />
                                <input
                                    type="time"
                                    value={hormoneForm.time}
                                    onChange={(e) => setHormoneForm({ ...hormoneForm, time: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none"
                                />
                            </div>

                            <textarea
                                placeholder="Side effects or notes"
                                value={hormoneForm.notes}
                                onChange={(e) => setHormoneForm({ ...hormoneForm, notes: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-pink-500 outline-none resize-none h-16"
                            />

                            <button
                                onClick={addHormone}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-2 rounded-lg"
                            >
                                Log Hormone
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {todayHormones.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No hormones logged today</div>
                ) : (
                    <div className="space-y-2">
                        {todayHormones.map((hormone) => (
                            <motion.div
                                key={hormone.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 flex items-start justify-between"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-foreground">{hormone.medication}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {hormone.dosage} at {hormone.time}
                                    </div>
                                    {hormone.notes && (
                                        <div className="text-xs text-muted-foreground italic mt-1">{hormone.notes}</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteHormone(hormone.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4 text-red-300" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Supplement Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Today's Supplements</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSupplementForm(!showSupplementForm)}
                        className="p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-all"
                    >
                        <Plus className="w-5 h-5 text-blue-300" />
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showSupplementForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3"
                        >
                            <select
                                value={supplementForm.supplement}
                                onChange={(e) => setSupplementForm({ ...supplementForm, supplement: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none"
                            >
                                <option value="">Select supplement</option>
                                {commonSupplements.map((sup) => (
                                    <option key={sup} value={sup}>
                                        {sup}
                                    </option>
                                ))}
                                <option value="other">Other</option>
                            </select>

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Dosage"
                                    value={supplementForm.dosage}
                                    onChange={(e) => setSupplementForm({ ...supplementForm, dosage: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none"
                                />
                                <input
                                    type="time"
                                    value={supplementForm.time}
                                    onChange={(e) => setSupplementForm({ ...supplementForm, time: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none"
                                />
                            </div>

                            <textarea
                                placeholder="Notes"
                                value={supplementForm.notes}
                                onChange={(e) => setSupplementForm({ ...supplementForm, notes: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none resize-none h-16"
                            />

                            <button
                                onClick={addSupplement}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-2 rounded-lg"
                            >
                                Log Supplement
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {todaySupplements.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No supplements logged today</div>
                ) : (
                    <div className="space-y-2">
                        {todaySupplements.map((supplement) => (
                            <motion.div
                                key={supplement.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start justify-between"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-foreground">{supplement.supplement}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {supplement.dosage} at {supplement.time}
                                    </div>
                                    {supplement.notes && (
                                        <div className="text-xs text-muted-foreground italic mt-1">{supplement.notes}</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteSupplement(supplement.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4 text-red-300" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Effect Tracking */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Effects & Side Effects</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEffectForm(!showEffectForm)}
                        className="p-2 bg-green-500/20 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition-all"
                    >
                        <Plus className="w-5 h-5 text-green-300" />
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showEffectForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3"
                        >
                            <input
                                type="date"
                                value={effectForm.date}
                                onChange={(e) => setEffectForm({ ...effectForm, date: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-green-500 outline-none"
                            />

                            <div className="space-y-3">
                                {[
                                    { key: "mood", label: "Mood" },
                                    { key: "breastTenderness", label: "Breast Tenderness" },
                                    { key: "skinClarity", label: "Skin Clarity" },
                                    { key: "energy", label: "Energy Level" },
                                    { key: "libido", label: "Libido" },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-semibold text-foreground">{label}</label>
                                            <span className="text-sm font-bold text-yellow-400">
                                                {effectForm[key as keyof typeof effectForm]}/10
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={effectForm[key as keyof typeof effectForm]}
                                            onChange={(e) =>
                                                setEffectForm({
                                                    ...effectForm,
                                                    [key]: parseInt(e.target.value),
                                                })
                                            }
                                            className="w-full"
                                        />
                                    </div>
                                ))}
                            </div>

                            <textarea
                                placeholder="Detailed effect notes"
                                value={effectForm.notes}
                                onChange={(e) => setEffectForm({ ...effectForm, notes: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-green-500 outline-none resize-none h-16"
                            />

                            <button
                                onClick={addEffect}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 rounded-lg"
                            >
                                Log Effects
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!todayEffects ? (
                    <div className="text-center py-6 text-muted-foreground">No effects logged today</div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3"
                    >
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {[
                                { value: todayEffects.mood, label: "Mood" },
                                { value: todayEffects.breastTenderness, label: "Breast" },
                                { value: todayEffects.skinClarity, label: "Skin" },
                                { value: todayEffects.energy, label: "Energy" },
                                { value: todayEffects.libido, label: "Libido" },
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-white/10 rounded-lg p-2">
                                    <div className="text-lg font-bold text-green-400">{value}</div>
                                    <div className="text-xs text-muted-foreground">{label}</div>
                                </div>
                            ))}
                        </div>
                        {todayEffects.notes && (
                            <p className="text-sm text-muted-foreground italic">{todayEffects.notes}</p>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
