import { PageTransition } from "@/components/PageTransition";
import { WorkoutPlanner } from "@/components/WorkoutPlanner";

export default function TrainingWorkoutsPage() {
    return (
        <PageTransition>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Workout Planner</h1>
                <p className="text-sm text-muted-foreground">Plan your weekly workouts with sets, reps, weight, and tutorial links.</p>
                <WorkoutPlanner />
            </div>
        </PageTransition>
    );
}
