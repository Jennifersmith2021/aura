import { PageTransition } from "@/components/PageTransition";
import { SissyAffirmations } from "@/components/SissyAffirmations";

export default function TrainingAffirmationsPage() {
    return (
        <PageTransition>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Affirmations</h1>
                <p className="text-sm text-muted-foreground">Daily sissy affirmations with optional reinforcement videos.</p>
                <SissyAffirmations />
            </div>
        </PageTransition>
    );
}
