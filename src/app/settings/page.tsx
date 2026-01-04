"use client";

import { SettingsPage } from "@/components/SettingsPage";
import { PageTransition } from "@/components/PageTransition";
import { DebugPanel } from "@/components/DebugPanel";

export default function SettingsRoute() {
    return (
        <PageTransition>
            <SettingsPage />
            <DebugPanel />
        </PageTransition>
    );
}
