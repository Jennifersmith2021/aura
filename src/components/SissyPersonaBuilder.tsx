"use client";
/* eslint-disable react-hooks/purity */

import { useState, useMemo } from "react";
import { Sparkles, Plus, Trash2, Download, Copy, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface SissyPersona {
    id: string;
    name: string;
    feminineName: string;
    age: number;
    occupation: string;
    personality: string[];
    backstory: string;
    goals: string[];
    style: {
        preferredColors: string[];
        fashionStyle: string;
        makeupStyle: string;
        heelHeight: string;
    };
    createdDate: string;
    isActive: boolean;
}

const nameGenerators = {
    first: [
        "Ashley", "Bailey", "Brittany", "Crystal", "Daisy", "Emily", "Felicity", "Grace",
        "Harper", "Iris", "Jasmine", "Kimberly", "Lily", "Madison", "Natasha", "Olivia",
        "Penelope", "Quinn", "Ruby", "Sophia", "Taylor", "Violet", "Whitney", "Zoey",
    ],
    last: [
        "Adams", "Bennett", "Cross", "Diamond", "Evans", "Frost", "Grant", "Hayes",
        "Ivy", "Johnson", "Kelly", "Lane", "Morgan", "North", "Owen", "Prince",
        "Quinn", "Rose", "Sterling", "Taylor", "Vale", "Wade", "Wyn", "Yates",
    ],
};

const personalities = [
    "Playful", "Flirty", "Innocent", "Seductive", "Dominant", "Submissive",
    "Confident", "Shy", "Adventurous", "Artistic", "Intellectual", "Bubbly",
    "Mysterious", "Sophisticated", "Carefree", "Compassionate", "Ambitious", "Sensual",
];

const fashionStyles = [
    "Girly & Cute", "Sexy & Bold", "Elegant & Classy", "Alternative & Edgy",
    "Sporty & Casual", "Vintage & Retro", "Punk & Gothic", "Business & Professional",
    "Bohemian & Free", "Glamorous & Diva",
];

const makeupStyles = [
    "Natural & Subtle", "Bold & Dramatic", "Artistic & Creative", "Heavy & Glam",
    "Minimal & Fresh", "Smokey & Mysterious", "Colorful & Fun", "Classic & Timeless",
];

export default function SissyPersonaBuilder() {
    const [personas, setPersonas] = useState<SissyPersona[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sissyPersonas");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [showBuilder, setShowBuilder] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<SissyPersona>>({
        name: "",
        feminineName: "",
        age: 25,
        occupation: "",
        personality: [],
        backstory: "",
        goals: [],
        style: {
            preferredColors: [],
            fashionStyle: "",
            makeupStyle: "",
            heelHeight: "",
        } as SissyPersona["style"],
    });

    const activePersona = useMemo(() => personas.find((p) => p.isActive), [personas]);

    const savePersona = () => {
        if (!form.name || !form.feminineName) {
            alert("Please fill in name and feminine name");
            return;
        }

        if (editingId) {
            const updated = personas.map((p) =>
                p.id === editingId
                    ? { ...p, ...form, id: p.id, createdDate: p.createdDate }
                    : p
            );
            setPersonas(updated);
            localStorage.setItem("sissyPersonas", JSON.stringify(updated));
            setEditingId(null);
        } else {
            const newPersona: SissyPersona = {
                id: `persona-${Date.now()}`,
                name: form.name || "",
                feminineName: form.feminineName || "",
                age: form.age || 25,
                occupation: form.occupation || "",
                personality: form.personality || [],
                backstory: form.backstory || "",
                goals: form.goals || [],
                style: form.style || {
                    preferredColors: [],
                    fashionStyle: "",
                    makeupStyle: "",
                    heelHeight: "",
                },
                createdDate: new Date().toISOString(),
                isActive: personas.length === 0,
            };
            setPersonas([...personas, newPersona]);
            localStorage.setItem("sissyPersonas", JSON.stringify([...personas, newPersona]));
        }

        resetForm();
        setShowBuilder(false);
    };

    const resetForm = () => {
        setForm({
            name: "",
            feminineName: "",
            age: 25,
            occupation: "",
            personality: [],
            backstory: "",
            goals: [],
            style: {
                preferredColors: [],
                fashionStyle: "",
                makeupStyle: "",
                heelHeight: "",
            } as SissyPersona["style"],
        });
    };

    const editPersona = (persona: SissyPersona) => {
        setForm(persona);
        setEditingId(persona.id);
        setShowBuilder(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deletePersona = (id: string) => {
        const updated = personas.filter((p) => p.id !== id);
        setPersonas(updated);
        localStorage.setItem("sissyPersonas", JSON.stringify(updated));
    };

    const switchPersona = (id: string) => {
        const updated = personas.map((p) => ({
            ...p,
            isActive: p.id === id,
        }));
        setPersonas(updated);
        localStorage.setItem("sissyPersonas", JSON.stringify(updated));
    };

    const generateName = () => {
        const first = nameGenerators.first[Math.floor(Math.random() * nameGenerators.first.length)];
        const last = nameGenerators.last[Math.floor(Math.random() * nameGenerators.last.length)];
        setForm({ ...form, feminineName: `${first} ${last}` });
    };

    const togglePersonality = (trait: string) => {
        const current = form.personality || [];
        setForm({
            ...form,
            personality: current.includes(trait) ? current.filter((p) => p !== trait) : [...current, trait],
        });
    };

    const toggleColor = (color: string) => {
        const current = form.style?.preferredColors || [];
        setForm({
            ...form,
            style: {
                ...(form.style || { preferredColors: [], fashionStyle: "", makeupStyle: "", heelHeight: "" }),
                preferredColors: current.includes(color) ? current.filter((c) => c !== color) : [...current, color],
            } as SissyPersona["style"],
        });
    };

    const addGoal = (goal: string) => {
        if (goal.trim()) {
            setForm({
                ...form,
                goals: [...(form.goals || []), goal],
            });
        }
    };

    const removeGoal = (index: number) => {
        setForm({
            ...form,
            goals: form.goals?.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Sissy Persona Builder</h2>
                    <p className="text-sm text-muted-foreground">Create and manage your sissy personas</p>
                </div>
                <Sparkles className="w-8 h-8 text-pink-400" />
            </div>

            {/* Active Persona Display */}
            {activePersona && !showBuilder && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50 rounded-xl p-6"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-sm font-bold text-pink-300 uppercase mb-1">Active Persona</div>
                            <h3 className="text-3xl font-bold text-foreground">{activePersona.feminineName}</h3>
                            <p className="text-muted-foreground mt-1">{activePersona.occupation}</p>
                        </div>
                        <span className="px-3 py-1 bg-pink-500 text-white font-bold text-sm rounded-full">
                            ACTIVE
                        </span>
                    </div>

                    <p className="text-foreground italic mb-4 line-clamp-3">{activePersona.backstory}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2">Personality</div>
                            <div className="flex flex-wrap gap-1">
                                {activePersona.personality.slice(0, 3).map((p) => (
                                    <span key={p} className="text-xs bg-white/10 px-2 py-1 rounded text-foreground">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-2">Style</div>
                            <div className="text-sm text-foreground font-medium">{activePersona.style.fashionStyle}</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => editPersona(activePersona)}
                            className="flex-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 font-bold py-2 rounded-lg hover:bg-blue-500/30"
                        >
                            <Edit2 className="w-4 h-4 inline mr-2" />
                            Edit Persona
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Create/Edit Form */}
            {showBuilder && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 space-y-4"
                >
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-purple-400" />
                        {editingId ? "Edit Persona" : "Create New Persona"}
                    </h3>

                    {/* Basic Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Real name (private)"
                            value={form.name || ""}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Feminine name"
                                value={form.feminineName || ""}
                                onChange={(e) => setForm({ ...form, feminineName: e.target.value })}
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={generateName}
                                className="px-3 bg-purple-500/30 border border-purple-500 rounded-lg text-purple-300 font-bold text-sm hover:bg-purple-500/50"
                            >
                                Generate
                            </motion.button>
                        </div>
                        <input
                            type="number"
                            placeholder="Age"
                            value={form.age || ""}
                            onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none"
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Occupation / Role"
                        value={form.occupation || ""}
                        onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none"
                    />

                    {/* Backstory */}
                    <textarea
                        placeholder="Tell your persona's backstory - how did you discover your sissy nature?"
                        value={form.backstory || ""}
                        onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none resize-none h-24"
                    />

                    {/* Personality Traits */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Personality Traits</label>
                        <div className="grid grid-cols-3 gap-2">
                            {personalities.map((trait) => {
                                const isSelected = form.personality?.includes(trait);
                                return (
                                    <motion.button
                                        key={trait}
                                        onClick={() => togglePersonality(trait)}
                                        whileHover={{ scale: 1.02 }}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                            isSelected
                                                ? "bg-purple-500/30 border-purple-500 text-purple-300"
                                                : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                                        )}
                                    >
                                        {trait}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Style Preferences */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground block">Fashion Style</label>
                        <select
                            value={form.style?.fashionStyle || ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    style: { ...(form.style || { preferredColors: [], fashionStyle: "", makeupStyle: "", heelHeight: "" }), fashionStyle: e.target.value } as SissyPersona["style"],
                                })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-purple-500 outline-none"
                        >
                            <option value="">Select fashion style</option>
                            {fashionStyles.map((style) => (
                                <option key={style} value={style}>
                                    {style}
                                </option>
                            ))}
                        </select>

                        <label className="text-sm font-semibold text-foreground block">Makeup Style</label>
                        <select
                            value={form.style?.makeupStyle || ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    style: { ...(form.style || { preferredColors: [], fashionStyle: "", makeupStyle: "", heelHeight: "" }), makeupStyle: e.target.value } as SissyPersona["style"],
                                })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-purple-500 outline-none"
                        >
                            <option value="">Select makeup style</option>
                            {makeupStyles.map((style) => (
                                <option key={style} value={style}>
                                    {style}
                                </option>
                            ))}
                        </select>

                        <label className="text-sm font-semibold text-foreground block">Preferred Colors</label>
                        <div className="grid grid-cols-5 gap-2">
                            {["Pink", "Purple", "Red", "Black", "White", "Blue", "Green", "Gold", "Silver", "Rose"].map((color) => {
                                const isSelected = form.style?.preferredColors?.includes(color);
                                return (
                                    <motion.button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                            isSelected
                                                ? "bg-pink-500/30 border-pink-500 text-pink-300"
                                                : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                                        )}
                                    >
                                        {color}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <label className="text-sm font-semibold text-foreground block">Preferred Heel Height</label>
                        <select
                            value={form.style?.heelHeight || ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    style: { ...(form.style || { preferredColors: [], fashionStyle: "", makeupStyle: "", heelHeight: "" }), heelHeight: e.target.value } as SissyPersona["style"],
                                })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-purple-500 outline-none"
                        >
                            <option value="">Select heel height</option>
                            <option value="Flats">Flats</option>
                            <option value="1-2 inches">1-2 inches</option>
                            <option value="2-3 inches">2-3 inches</option>
                            <option value="3-4 inches">3-4 inches</option>
                            <option value="4+ inches">4+ inches</option>
                        </select>
                    </div>

                    {/* Goals */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Goals</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Add a goal"
                                id="goalInput"
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        addGoal((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = "";
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    const input = document.getElementById("goalInput") as HTMLInputElement;
                                    addGoal(input.value);
                                    input.value = "";
                                }}
                                className="px-4 bg-purple-500/30 border border-purple-500 rounded-lg text-purple-300 font-bold"
                            >
                                Add
                            </button>
                        </div>
                        {form.goals && form.goals.length > 0 && (
                            <div className="space-y-1">
                                {form.goals.map((goal, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-2 flex items-center justify-between">
                                        <span className="text-sm text-foreground">• {goal}</span>
                                        <button
                                            onClick={() => removeGoal(idx)}
                                            className="text-red-300 hover:text-red-200"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={savePersona}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-2 rounded-lg"
                        >
                            {editingId ? "Update Persona" : "Create Persona"}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setShowBuilder(false);
                                resetForm();
                                setEditingId(null);
                            }}
                            className="px-6 bg-white/10 border border-white/20 text-foreground font-bold py-2 rounded-lg"
                        >
                            Cancel
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Create Button */}
            {!showBuilder && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        resetForm();
                        setEditingId(null);
                        setShowBuilder(true);
                    }}
                    className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-dashed border-pink-500/50 hover:border-pink-500 rounded-xl py-4 font-bold text-pink-300 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Create New Persona
                </motion.button>
            )}

            {/* Personas List */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold">Your Personas ({personas.length})</h3>

                <AnimatePresence>
                    {personas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-8 text-center"
                        >
                            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground font-medium">
                                Create your first sissy persona to get started!
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {personas.map((persona) => (
                                <motion.div
                                    key={persona.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={clsx(
                                        "p-4 rounded-xl border transition-all cursor-pointer hover:bg-white/10",
                                        persona.isActive
                                            ? "bg-pink-500/20 border-pink-500/50"
                                            : "bg-white/5 border-white/10"
                                    )}
                                    onClick={() => switchPersona(persona.id)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-foreground text-lg">
                                                    {persona.feminineName}
                                                </h4>
                                                {persona.isActive && (
                                                    <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded-full font-bold">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{persona.occupation}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    editPersona(persona);
                                                }}
                                                className="p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-300" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePersona(persona.id);
                                                }}
                                                className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-300" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-foreground italic line-clamp-2 mb-3">
                                        {persona.backstory}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <div className="text-muted-foreground font-semibold mb-1">Personality</div>
                                            <div className="flex flex-wrap gap-1">
                                                {persona.personality.slice(0, 2).map((p) => (
                                                    <span key={p} className="bg-white/10 px-2 py-0.5 rounded text-foreground">
                                                        {p}
                                                    </span>
                                                ))}
                                                {persona.personality.length > 2 && (
                                                    <span className="text-muted-foreground">
                                                        +{persona.personality.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground font-semibold mb-1">Goals</div>
                                            <div className="text-foreground">
                                                {persona.goals.length} goals • {persona.style.fashionStyle}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
