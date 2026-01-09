"use client";

import { PageTransition } from "@/components/PageTransition";
import { OutfitDesignerChat } from "@/components/OutfitDesignerChat";

export default function OutfitDesignPage() {
    return (
        <PageTransition className="pb-24 pt-6 px-4 sm:px-6 h-screen flex flex-col">
            <OutfitDesignerChat />
        </PageTransition>
    );
}
