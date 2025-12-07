"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { PageTransition } from "@/components/PageTransition";

export default function StylistPage() {
    return (
        <PageTransition className="pb-24 pt-8 px-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">AI Stylist</h1>
            </div>

            <ChatInterface />
        </PageTransition>
    );
}
