import { ProgressAnalytics } from "@/components/ProgressAnalytics";
import { PageTransition } from "@/components/PageTransition";

export default function AnalyticsPage() {
    return (
        <PageTransition>
            <div className="container max-w-4xl mx-auto py-8">
                <ProgressAnalytics />
            </div>
        </PageTransition>
    );
}
