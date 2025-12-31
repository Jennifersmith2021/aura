"use client";
/* eslint-disable react/no-unescaped-entities */

import { useStore } from "@/hooks/useStore";
import { useMemo } from "react";
import { Brain, Zap, BookOpen } from "lucide-react";
import clsx from "clsx";

export default function AffirmationOfTheDay() {
    const affirmations = [
        "I am beautiful and feminine",
        "My transformation is my power",
        "I embrace my sissy identity with pride",
        "Every day I grow more confident",
        "I deserve to feel sexy and desirable",
        "My curves are my strength",
        "I am becoming the woman I desire to be",
        "Femininity flows through me naturally",
    ];

    const affirmation = useMemo(() => {
        const today = new Date().getDate();
        return affirmations[today % affirmations.length];
    }, []);

    return (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 p-5">
            <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                    <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                        Today's Affirmation
                    </div>
                    <p className="text-sm text-foreground font-semibold italic leading-relaxed mt-2">
                        "{affirmation}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Repeat this throughout your day to reinforce your feminine identity and build unshakeable confidence.
                    </p>
                </div>
            </div>
        </div>
    );
}
