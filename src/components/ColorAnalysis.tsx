"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { ColorSeason } from "@/types";

const SEASONS = {
    Spring: { colors: ["#fca5a5", "#fdba74", "#86efac", "#fef08a"], desc: "Warm & Bright" },
    Summer: { colors: ["#f9a8d4", "#a5b4fc", "#93c5fd", "#e2e8f0"], desc: "Cool & Muted" },
    Autumn: { colors: ["#b45309", "#15803d", "#78350f", "#f59e0b"], desc: "Warm & Muted" },
    Winter: { colors: ["#be123c", "#1e3a8a", "#000000", "#ffffff"], desc: "Cool & Bright" },
};

export function ColorAnalysis() {
    const { colorSeason, setSeason } = useStore();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    // Derived result for quiz flow, but final truth comes from store
    const [quizResult, setQuizResult] = useState<ColorSeason | null>(null);

    const questions = [
        { q: "Your veins look...", options: ["Blue/Purple (Cool)", "Green (Warm)"] },
        { q: "Silver or Gold jewelry?", options: ["Silver (Cool)", "Gold (Warm)"] },
        { q: "Your eyes are...", options: ["Blue/Grey/Black (Cool)", "Brown/Hazel/Green (Warm)"] },
    ];

    const handleAnswer = (ans: string) => {
        const newAnswers = [...answers, ans];
        if (step < questions.length - 1) {
            setAnswers(newAnswers);
            setStep(step + 1);
        } else {
            // Simple logic: Majority wins
            const warmCount = newAnswers.filter(a => a.includes("Warm")).length;
            // Randomly pick sub-season for demo if tie or based on logic
            // Warm -> Autumn (Darker) or Spring (Lighter). Let's default to Autumn for Warm, Winter for Cool for simplicity
            const result: ColorSeason = warmCount > 1 ? "Autumn" : "Winter";
            setQuizResult(result);
            setSeason(result);
        }
    };

    const activeSeason = colorSeason || quizResult;

    if (activeSeason) {
        return (
            <div className="text-center space-y-6 p-6 bg-white dark:bg-slate-800 rounded-xl border border-border">
                <h2 className="text-2xl font-bold">You are a {activeSeason}!</h2>
                <p className="text-muted-foreground">{SEASONS[activeSeason].desc}</p>
                <div className="flex justify-center gap-2">
                    {SEASONS[activeSeason].colors.map(c => (
                        <div key={c} className="w-12 h-12 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                </div>
                <button onClick={() => { setStep(0); setQuizResult(null); setSeason(null); setAnswers([]); }} className="text-sm text-primary underline">
                    Retake Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Find Your Season</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border">
                <p className="text-lg font-medium mb-6">{questions[step].q}</p>
                <div className="space-y-3">
                    {questions[step].options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="w-full p-3 text-left rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                    Question {step + 1} of {questions.length}
                </div>
            </div>
        </div>
    );
}
