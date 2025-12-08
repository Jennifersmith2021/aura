"use client";

import { useStore } from "@/hooks/useStore";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export function Timeline() {
    const { timeline, addTimelineEntry } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState("");

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                setIsUploading(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (preview) {
            addTimelineEntry({
                id: uuidv4(),
                date: Date.now(),
                photo: preview,
                notes: caption,
            });
            setIsUploading(false);
            setPreview(null);
            setCaption("");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Style Journey</h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-primary font-medium"
                >
                    <Camera className="w-4 h-4" />
                    Log Outfit
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Upload Modal */}
            {isUploading && preview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 w-full max-w-sm space-y-4">
                        <h3 className="font-semibold text-lg">Add to Journey</h3>
                        <div className="aspect-[4/5] relative rounded-lg overflow-hidden bg-slate-100">
                            <Image src={preview} alt="Preview" fill className="object-cover" />
                        </div>
                        <textarea
                            className="w-full p-2 rounded-lg border border-border resize-none"
                            placeholder="Outfit details / How you felt..."
                            rows={3}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsUploading(false); setPreview(null); }}
                                className="flex-1 py-2 rounded-lg border hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2 rounded-lg bg-primary text-white hover:opacity-90"
                            >
                                Post Look
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {timeline.map((entry) => (
                    <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-rose-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <div className="w-3 h-3 bg-white rounded-full" />
                        </div>

                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-border shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900 dark:text-white">
                                    {new Date(entry.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-muted mb-2 relative">
                                <Image src={entry.photo} alt="Progress" fill className="object-cover" />
                            </div>
                            {entry.notes && (
                                <div className="text-sm text-slate-600 dark:text-slate-300 italic p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    &quot;{entry.notes}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
