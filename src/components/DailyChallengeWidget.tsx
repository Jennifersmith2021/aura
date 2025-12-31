"use client";

import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function DailyChallengeWidget() {
    const { challenges } = useStore();

    const todaysChallenges = useMemo(() => {
        const today = new Date().toDateString();
        return challenges
            .filter((c) => c.isActive)
            .map((challenge) => {
                const todayTask = challenge.dailyTasks?.find((t) => new Date(t.date).toDateString() === today);
                return { challenge, todayTask };
            })
            .filter(({ todayTask }) => todayTask);
    }, [challenges]);

    const completedToday = useMemo(() => {
        return todaysChallenges.filter(({ todayTask }) => todayTask?.completed).length;
    }, [todaysChallenges]);

    if (todaysChallenges.length === 0) {
        return (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                        <p className="font-semibold text-sm">No active challenges today</p>
                        <p className="text-xs text-muted-foreground">Start a challenge to stay motivated!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Today's Challenges ({completedToday}/{todaysChallenges.length})
                </h3>
            </div>

            {todaysChallenges.map(({ challenge, todayTask }) => (
                <div
                    key={challenge.id}
                    className={`border rounded-lg p-3 transition ${
                        todayTask?.completed
                            ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : "bg-muted hover:bg-muted/80"
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            {todayTask?.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${todayTask?.completed ? "line-through text-muted-foreground" : ""}`}>
                                {todayTask?.task || challenge.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {challenge.name} • Difficulty: {challenge.difficulty}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
