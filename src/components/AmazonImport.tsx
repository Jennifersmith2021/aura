"use client";

import { useState } from "react";
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import { parseAmazonCSV } from "@/utils/amazonParser";
import { useStore } from "@/hooks/useStore";
import { cn } from "@/lib/utils";

export function AmazonImport() {
    const { addItem } = useStore();
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setStatus("idle");
        setMessage("");

        try {
            const items = await parseAmazonCSV(file);

            if (items.length === 0) {
                setStatus("error");
                setMessage("No relevant clothing or makeup items found in this CSV.");
                return;
            }

            // Add items to store
            for (const item of items) {
                await addItem(item);
            }

            setStatus("success");
            setMessage(`Successfully imported ${items.length} items!`);
        } catch (error) {
            console.error("Import failed:", error);
            setStatus("error");
            setMessage("Failed to parse CSV. Please ensure it's a valid Amazon Order History file.");
        } finally {
            setIsUploading(false);
            // Reset file input
            e.target.value = "";
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                    <Upload className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Import Amazon History</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Upload your &quot;Order History Reports&quot; CSV from Amazon to automatically populate your inventory and budget tracker.
                        We&apos;ll filter for clothing and beauty items.
                    </p>

                    <div className="flex items-center gap-4">
                        <label className={cn(
                            "cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            isUploading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        )}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Select CSV File
                                </>
                            )}
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </label>

                        {status === "success" && (
                            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-left-2">
                                <Check className="w-4 h-4" />
                                {message}
                            </div>
                        )}

                        {status === "error" && (
                            <div className="flex items-center gap-2 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-left-2">
                                <AlertCircle className="w-4 h-4" />
                                {message}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                        Note: To get your data, go to Amazon Account &gt; Request Your Information &gt; Order History Reports.
                    </p>
                </div>
            </div>
        </div>
    );
}
