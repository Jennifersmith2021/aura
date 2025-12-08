import { PageTransition } from "@/components/PageTransition";
import { SupplementTracker } from "@/components/SupplementTracker";

export default function TrainingSupplementsPage() {
    return (
        <PageTransition>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Supplements</h1>
                <p className="text-sm text-muted-foreground">Track vitamins, minerals, herbs, and proteins with dosage and notes.</p>
                <SupplementTracker />
            </div>
        </PageTransition>
    );
}
