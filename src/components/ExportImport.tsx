"use client";

import { useCallback, useRef } from "react";
import { useStore } from "@/hooks/useStore";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { set as idbSet } from "idb-keyval";

export function ExportImport() {
    const store = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<"idle" | "exporting" | "importing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleExport = useCallback(async () => {
        try {
            setStatus("exporting");
            
            // Gather all data from store
            const dataToExport = {
                items: store.items,
                looks: store.looks,
                measurements: store.measurements,
                timeline: store.timeline,
                routines: store.routines,
                shoppingItems: store.shoppingItems,
                shoppingLists: store.shoppingLists,
                inspiration: store.inspiration,
                colorSeason: store.colorSeason,
                chastitySessions: store.chastitySessions,
                corsetSessions: store.corsetSessions,
                buttPlugSessions: store.buttPlugSessions,
                orgasmLogs: store.orgasmLogs,
                arousalLogs: store.arousalLogs,
                toyCollection: store.toyCollection,
                intimacyJournal: store.intimacyJournal,
                skincareProducts: store.skincareProducts,
                clitMeasurements: store.clitMeasurements,
                breastGrowth: store.breastGrowth,
                wigCollection: store.wigCollection,
                hairStyles: store.hairStyles,
                sissyGoals: store.sissyGoals,
                sissyLogs: store.sissyLogs,
                compliments: store.compliments,
                packingLists: store.packingLists,
                supplements: store.supplements,
                workoutPlans: store.workoutPlans,
                workoutSessions: store.workoutSessions,
                dailyAffirmations: store.dailyAffirmations,
                makeupTutorials: store.makeupTutorials,
                notifications: store.notifications,
                tags: store.tags,
                notes: store.notes,
                favorites: store.favorites,
                exportDate: new Date().toISOString(),
                version: "1.0"
            };

            // Create JSON blob
            const jsonStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            
            // Download file
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `aura-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setStatus("success");
            setMessage(`✓ Exported all your data successfully`);
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            setStatus("error");
            setMessage(`✗ Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            setTimeout(() => setStatus("idle"), 3000);
        }
    }, [store]);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setStatus("importing");
            const file = event.target.files?.[0];
            if (!file) return;

            const text = await file.text();
            const data = JSON.parse(text);

            // Validate basic structure
            if (!data.items || !data.measurements) {
                throw new Error("Invalid backup file format");
            }

            // Import all collections into IndexedDB
            let imported = 0;
            const collections = [
                "items", "looks", "measurements", "timeline", "routines", 
                "shoppingItems", "shoppingLists", "inspiration", "colorSeason",
                "chastitySessions", "corsetSessions", "buttPlugSessions", "orgasmLogs", "arousalLogs",
                "toyCollection", "intimacyJournal", "skincareProducts", "clitMeasurements",
                "breastGrowth", "wigCollection", "hairStyles", "sissyGoals", "sissyLogs",
                "compliments", "packingLists", "supplements", "workoutPlans", "workoutSessions",
                "dailyAffirmations", "makeupTutorials", "notifications", "tags", "notes", "favorites"
            ];

            for (const collection of collections) {
                if (data[collection]) {
                    await idbSet(collection, data[collection]);
                    imported++;
                }
            }

            setStatus("success");
            setMessage(`✓ Imported ${imported} data collections. Please refresh to see changes.`);
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            
            // Reload page after 2 seconds to show new data
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setStatus("error");
            setMessage(`✗ Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            setTimeout(() => setStatus("idle"), 3000);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Data
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Download all your Aura data as a JSON backup file.
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={status === "exporting"}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
                >
                    {status === "exporting" ? "Exporting..." : "Export All Data"}
                </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import Data
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Restore your data from a previously exported backup file.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                />

                <button
                    onClick={handleImportClick}
                    disabled={status === "importing"}
                    className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition"
                >
                    {status === "importing" ? "Importing..." : "Import from File"}
                </button>
            </div>

            {status !== "idle" && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    status === "success"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : status === "error"
                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                        : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                }`}>
                    {status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : status === "error" ? (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
                    )}
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}
