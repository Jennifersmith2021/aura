"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Download, Upload, FileJson, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { set as idbSet } from "idb-keyval";

export default function DataExport() {
  const store = useStore();
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = () => {
    try {
      const data = {
        version: "1.0.0",
        exportDate: Date.now(),
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
        orgasmLogs: store.orgasmLogs,
        arousalLogs: store.arousalLogs,
        toyCollection: store.toyCollection,
        intimacyJournal: store.intimacyJournal,
        skincareProducts: store.skincareProducts,
        clitMeasurements: store.clitMeasurements,
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
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aura-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "Data exported successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Export error:", error);
      setMessage({ type: "error", text: "Failed to export data" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.version || !data.exportDate) {
          throw new Error("Invalid backup file format");
        }

        // Import all data directly to IndexedDB
        const imports = [];
        if (data.items) imports.push(idbSet("items", data.items));
        if (data.looks) imports.push(idbSet("looks", data.looks));
        if (data.measurements) imports.push(idbSet("measurements", data.measurements));
        if (data.timeline) imports.push(idbSet("timeline", data.timeline));
        if (data.routines) imports.push(idbSet("routines", data.routines));
        if (data.shoppingItems) imports.push(idbSet("shoppingItems", data.shoppingItems));
        if (data.shoppingLists) imports.push(idbSet("shoppingLists", data.shoppingLists));
        if (data.inspiration) imports.push(idbSet("inspiration", data.inspiration));
        if (data.colorSeason) imports.push(idbSet("colorSeason", data.colorSeason));
        if (data.chastitySessions) imports.push(idbSet("chastitySessions", data.chastitySessions));
        if (data.corsetSessions) imports.push(idbSet("corsetSessions", data.corsetSessions));
        if (data.orgasmLogs) imports.push(idbSet("orgasmLogs", data.orgasmLogs));
        if (data.arousalLogs) imports.push(idbSet("arousalLogs", data.arousalLogs));
        if (data.toyCollection) imports.push(idbSet("toyCollection", data.toyCollection));
        if (data.intimacyJournal) imports.push(idbSet("intimacyJournal", data.intimacyJournal));
        if (data.skincareProducts) imports.push(idbSet("skincareProducts", data.skincareProducts));
        if (data.clitMeasurements) imports.push(idbSet("clitMeasurements", data.clitMeasurements));
        if (data.wigCollection) imports.push(idbSet("wigCollection", data.wigCollection));
        if (data.hairStyles) imports.push(idbSet("hairStyles", data.hairStyles));
        if (data.sissyGoals) imports.push(idbSet("sissyGoals", data.sissyGoals));
        if (data.sissyLogs) imports.push(idbSet("sissyLogs", data.sissyLogs));
        if (data.compliments) imports.push(idbSet("compliments", data.compliments));
        if (data.packingLists) imports.push(idbSet("packingLists", data.packingLists));
        if (data.supplements) imports.push(idbSet("supplements", data.supplements));
        if (data.workoutPlans) imports.push(idbSet("workoutPlans", data.workoutPlans));
        if (data.workoutSessions) imports.push(idbSet("workoutSessions", data.workoutSessions));
        if (data.dailyAffirmations) imports.push(idbSet("dailyAffirmations", data.dailyAffirmations));
        if (data.makeupTutorials) imports.push(idbSet("makeupTutorials", data.makeupTutorials));

        await Promise.all(imports);

        setMessage({ type: "success", text: "Data imported! Reloading..." });
        
        // Reload page to refresh state from IndexedDB
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error("Import error:", error);
        setMessage({ type: "error", text: "Failed to import data - invalid file format" });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setImporting(false);
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setMessage({ type: "error", text: "Failed to read file" });
      setTimeout(() => setMessage(null), 3000);
      setImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Data Management</h2>
        <p className="text-sm text-muted-foreground">
          Export your data for backup or import from a previous backup
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Export */}
        <button
          onClick={handleExport}
          className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
        >
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Download className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">Export Data</div>
            <div className="text-xs text-muted-foreground">
              Download all your data as JSON
            </div>
          </div>
        </button>

        {/* Import */}
        <label className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <Upload className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">Import Data</div>
            <div className="text-xs text-muted-foreground">
              {importing ? "Importing..." : "Restore from backup file"}
            </div>
          </div>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
          />
        </label>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-start gap-3">
          <FileJson className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm space-y-2">
            <p className="font-medium">Important Notes:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Exported data includes all your closet items, measurements, logs, and settings</li>
              <li>• Importing will replace ALL existing data with the backup</li>
              <li>• Keep your backup files in a safe location</li>
              <li>• Backup files are in JSON format and can be opened in any text editor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
