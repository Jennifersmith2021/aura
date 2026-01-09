"use client";

import { useState, useMemo } from "react";
import { Camera, UploadCloud, Sparkles, Trash2, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { format } from "date-fns";

export default function BreastGrowthTracker() {
  const {
    breastGrowth,
    addBreastGrowthEntry,
    updateBreastGrowthEntry,
    removeBreastGrowthEntry,
    measurements,
  } = useStore();

  const [photoData, setPhotoData] = useState<string | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [bustIn, setBustIn] = useState<string>("");
  const [underbustIn, setUnderbustIn] = useState<string>("");
  const [weightLbs, setWeightLbs] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lastMeasurement = useMemo(() => measurements[0], [measurements]);

  const latestEntry = breastGrowth[0];
  const previousEntry = breastGrowth[1];
  const bustDelta = latestEntry && previousEntry && latestEntry.bustCm && previousEntry.bustCm
    ? latestEntry.bustCm - previousEntry.bustCm
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!photoData) return;
    const parsedBust = bustIn ? parseFloat(bustIn) : undefined;
    const parsedUnderbust = underbustIn ? parseFloat(underbustIn) : undefined;
    const parsedWeight = weightLbs ? parseFloat(weightLbs) : undefined;

    await addBreastGrowthEntry({
      date: new Date(date).getTime(),
      photo: photoData,
      bustCm: parsedBust,
      underbustCm: parsedUnderbust,
      weightKg: parsedWeight,
      note: note.trim() || undefined,
    });

    setPhotoData(null);
    setBustIn("");
    setUnderbustIn("");
    setWeightLbs("");
    setNote("");
  };

  const runAnalysis = async () => {
    if (!latestEntry) return;
    setIsAnalyzing(true);

    const history = breastGrowth.slice(0, 4).map((entry) => ({
      date: format(entry.date, "yyyy-MM-dd"),
      bustCm: entry.bustCm,
      underbustCm: entry.underbustCm,
      weightKg: entry.weightKg,
      note: entry.note,
    }));

    const prompt = `You are Aura, a supportive style and body-confidence coach. Analyze breast growth progress based on recent entries. Do NOT give medical advice.
Provide:
- 2-3 sentences noting positive progress and visual cues to look for
- 2 encouragement lines focused on confidence and patience
Data: ${JSON.stringify(history, null, 2)}`;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", prompt }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      const encouragement = data.text || "Keep going—your consistency is paying off.";
      await updateBreastGrowthEntry(latestEntry.id, { encouragement, aiSummary: encouragement });
    } catch (err) {
      const fallback = "Beautiful progress. Stay gentle with yourself and celebrate each small change.";
      await updateBreastGrowthEntry(latestEntry.id, { encouragement: fallback, aiSummary: fallback });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Breast Growth Tracker</h2>
          <p className="text-sm text-muted-foreground">Capture progress photos privately and track changes over time.</p>
        </div>
        {latestEntry && bustDelta !== null && (
          <div className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm font-semibold">
            {bustDelta >= 0 ? "+" : ""}{bustDelta.toFixed(1)} in since last entry
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs text-muted-foreground">Photo</label>
            <div className="flex gap-3 items-center">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-sm font-semibold rounded-lg cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                Capture / Upload
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {photoData && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoData} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Bust (in)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder={lastMeasurement?.values.bust?.toString() || ""}
              value={bustIn}
              onChange={(e) => setBustIn(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Underbust (in)</label>
            <input
              type="number"
              inputMode="decimal"
              value={underbustIn}
              onChange={(e) => setUnderbustIn(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Notes</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Swelling, cycle phase, etc."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            disabled={!photoData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-sm font-semibold disabled:opacity-60"
          >
            <UploadCloud className="w-4 h-4" />
            Save Entry
          </button>
        </div>
      </div>

      {breastGrowth.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Start by capturing your first photo. Everything stays on your device (IndexedDB).</p>
        </div>
      )}

      {breastGrowth.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent entries</h3>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || !latestEntry}
              className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAnalyzing ? "Analyzing" : "AI encouragement"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {breastGrowth.map((entry) => (
              <div key={entry.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-24 h-28 rounded-lg overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.photo} alt="Entry" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{format(entry.date, "PPP")}</p>
                    <p className="text-xs text-muted-foreground">Bust {entry.bustCm ? `${entry.bustCm} in` : "–"} • Underbust {entry.underbustCm ? `${entry.underbustCm} in` : "–"}</p>
                    {entry.weightKg && <p className="text-xs text-muted-foreground">Weight {entry.weightKg} lbs</p>}
                    {entry.note && <p className="text-sm text-white/80">{entry.note}</p>}
                  </div>
                  <button
                    onClick={() => removeBreastGrowthEntry(entry.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {(entry.aiSummary || entry.encouragement) && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-100">
                    {entry.aiSummary || entry.encouragement}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
