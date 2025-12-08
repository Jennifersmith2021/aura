import { PageTransition } from "@/components/PageTransition";
import { WorkoutLogger } from "@/components/WorkoutLogger";

export default function TrainingLogsPage() {
    return (
        <PageTransition>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Workout Log</h1>
                <p className="text-sm text-muted-foreground">Log completed sessions, durations, and linked plans.</p>
                <WorkoutLogger />
            </div>
        </PageTransition>
    );
}
