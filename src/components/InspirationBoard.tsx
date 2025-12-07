"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import Image from "next/image";

import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/hooks/useStore";

export function InspirationBoard() {
    const { inspiration, addInspiration } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    addInspiration({
                        id: uuidv4(),
                        image: e.target.result as string,
                        dateAdded: Date.now(),
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Inspiration</h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary font-medium"
                >
                    Add Image
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            </div>

            <div className="columns-2 gap-4 space-y-4">
                {inspiration.map((insp, i) => (
                    <div key={insp.id} className="break-inside-avoid rounded-xl overflow-hidden relative">
                        <Image src={insp.image} alt="Inspo" fill className="object-cover" />
                    </div>
                ))}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="break-inside-avoid aspect-square bg-muted rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                >
                    <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}
