"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Calculator, Target, Zap, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

export default function GoalPlanningTools() {
  const { measurements, sissyGoals, addSissyGoal } = useStore();
  const [activeTab, setActiveTab] = useState<"calculator" | "templates" | "protocols">("calculator");

  const latestMeasurement = measurements[0];

  // Body Measurement Calculators
  const calculateIdealWaist = (height: number, bodyType: "petite" | "average" | "athletic") => {
    const baseRatio = bodyType === "petite" ? 0.38 : bodyType === "average" ? 0.42 : 0.45;
    return (height * baseRatio).toFixed(1);
  };

  const calculateWHR = (waist: number, hip: number) => {
    return (waist / hip).toFixed(2);
  };

  const [height, setHeight] = useState(170);
  const [bodyType, setBodyType] = useState<"petite" | "average" | "athletic">("average");
  const idealWaist = calculateIdealWaist(height, bodyType);
  
  const currentWHR = latestMeasurement?.values?.waist && latestMeasurement?.values?.hips
    ? calculateWHR(latestMeasurement.values.waist, latestMeasurement.values.hips)
    : null;

  // Workout Templates
  const workoutTemplates = [
    {
      id: "beginner-fem",
      name: "Beginner Feminization",
      level: "Beginner",
      description: "Build curves with glute and hip focused exercises",
      exercises: [
        { name: "Glute Bridges", sets: 3, reps: 15, youtubeUrl: "https://youtube.com/watch?v=OUgsJ8-Vi0E" },
        { name: "Side Leg Raises", sets: 3, reps: 20, youtubeUrl: "https://youtube.com/watch?v=izV5th7YVIA" },
        { name: "Donkey Kicks", sets: 3, reps: 15, youtubeUrl: "https://youtube.com/watch?v=4ranVQDqlaU" },
        { name: "Clamshells", sets: 3, reps: 20, youtubeUrl: "https://youtube.com/watch?v=ZJGJbhh8740" },
      ],
    },
    {
      id: "intermediate-curves",
      name: "Intermediate Curves",
      level: "Intermediate",
      description: "Progressive overload for glutes, quads, and waist definition",
      exercises: [
        { name: "Hip Thrusts", sets: 4, reps: 12, weight: 20, youtubeUrl: "https://youtube.com/watch?v=xDmFkJxPzeM" },
        { name: "Bulgarian Split Squats", sets: 3, reps: 10, youtubeUrl: "https://youtube.com/watch?v=2C-uNgKwPLE" },
        { name: "Cable Kickbacks", sets: 3, reps: 15, youtubeUrl: "https://youtube.com/watch?v=ECV8dBQsZY8" },
        { name: "Oblique Crunches", sets: 3, reps: 20, youtubeUrl: "https://youtube.com/watch?v=_p9k695igvM" },
      ],
    },
    {
      id: "advanced-hourglass",
      name: "Advanced Hourglass",
      level: "Advanced",
      description: "Maximum curve development and waist cinching",
      exercises: [
        { name: "Barbell Hip Thrusts", sets: 4, reps: 8, weight: 40, youtubeUrl: "https://youtube.com/watch?v=xDmFkJxPzeM" },
        { name: "Sumo Squats", sets: 4, reps: 10, weight: 30, youtubeUrl: "https://youtube.com/watch?v=lhQ9g41tpVQ" },
        { name: "Cable Pull-Throughs", sets: 3, reps: 12, youtubeUrl: "https://youtube.com/watch?v=FQWv0LfKSKI" },
        { name: "Vacuum Holds", sets: 3, reps: 10, youtubeUrl: "https://youtube.com/watch?v=_qFJqrk5HGw" },
        { name: "Side Planks", sets: 3, reps: 30, youtubeUrl: "https://youtube.com/watch?v=XeN4pEZZJNE" },
      ],
    },
  ];

  // Supplement Protocols
  const supplementProtocols = [
    {
      id: "recovery",
      name: "Recovery Stack",
      goal: "Post-workout recovery and muscle repair",
      supplements: [
        { name: "Whey Protein", dosage: "25-30g", timing: "Post-workout" },
        { name: "Creatine", dosage: "5g", timing: "Daily" },
        { name: "Electrolytes", dosage: "1 serving", timing: "During workout" },
        { name: "Magnesium", dosage: "400mg", timing: "Before bed" },
      ],
    },
    {
      id: "feminization",
      name: "Feminization Support",
      goal: "Skin, hair, and hormone support",
      supplements: [
        { name: "Collagen Peptides", dosage: "10g", timing: "Morning" },
        { name: "Biotin", dosage: "5000mcg", timing: "Morning" },
        { name: "Vitamin D3", dosage: "2000 IU", timing: "Morning" },
        { name: "Omega-3", dosage: "1000mg", timing: "With meals" },
        { name: "Evening Primrose Oil", dosage: "1000mg", timing: "Evening" },
      ],
    },
    {
      id: "curves",
      name: "Curve Enhancement",
      goal: "Support healthy fat distribution and muscle growth",
      supplements: [
        { name: "Protein Powder", dosage: "20-30g", timing: "2x daily" },
        { name: "Healthy Fats (Omega-3)", dosage: "1-2g", timing: "With meals" },
        { name: "B-Complex", dosage: "1 tablet", timing: "Morning" },
        { name: "Zinc", dosage: "15mg", timing: "Evening" },
      ],
    },
  ];

  const createGoalFromTemplate = (templateId: string) => {
    const template = workoutTemplates.find((t) => t.id === templateId);
    if (!template) return;

    addSissyGoal({
      id: crypto.randomUUID(),
      title: `Complete ${template.name} Program`,
      category: "fitness",
      description: template.description,
      targetDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days from now
      completed: false,
      priority: "high",
      progress: 0,
      milestones: template.exercises.map((ex) => `Master ${ex.name}`),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Goal Planning Tools</h2>
        <p className="text-sm text-muted-foreground">Calculators, templates, and protocols to help you reach your goals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: "calculator", label: "Calculators", icon: Calculator },
          { id: "templates", label: "Workout Templates", icon: Zap },
          { id: "protocols", label: "Supplement Protocols", icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calculator Tab */}
      {activeTab === "calculator" && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Ideal Waist Calculator
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Height (in)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Body Type</label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                >
                  <option value="petite">Petite</option>
                  <option value="average">Average</option>
                  <option value="athletic">Athletic</option>
                </select>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Ideal Waist Measurement</p>
              <p className="text-3xl font-bold text-primary">{idealWaist} in</p>
              {latestMeasurement?.values?.waist && (
                <p className="text-xs text-muted-foreground mt-2">
                  Current: {latestMeasurement.values.waist} in
                  {latestMeasurement.values.waist > Number(idealWaist) && (
                    <span className="text-amber-400"> ({(latestMeasurement.values.waist - Number(idealWaist)).toFixed(1)}" to goal)</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Waist-to-Hip Ratio (WHR)
            </h3>
            <p className="text-sm text-muted-foreground">
              Ideal feminine WHR: <strong className="text-primary">0.67-0.80</strong>
            </p>
            {currentWHR ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Your Current WHR</p>
                <p className="text-3xl font-bold text-primary">{currentWHR}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {Number(currentWHR) < 0.67
                    ? "Below ideal range"
                    : Number(currentWHR) > 0.80
                    ? "Above ideal range - focus on waist reduction and hip building"
                    : "Within ideal feminine range! 🎉"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add waist and hip measurements to calculate your WHR</p>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {workoutTemplates.map((template) => (
            <div key={template.id} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                      {template.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                <button
                  onClick={() => createGoalFromTemplate(template.id)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-semibold transition-colors"
                >
                  Create Goal
                </button>
              </div>

              <div className="space-y-2">
                {template.exercises.map((exercise, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.weight && ` • ${exercise.weight} lbs`}
                      </p>
                    </div>
                    {exercise.youtubeUrl && (
                      <a
                        href={exercise.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                      >
                        Video
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === "protocols" && (
        <div className="space-y-4">
          {supplementProtocols.map((protocol) => (
            <div key={protocol.id} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-semibold">{protocol.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{protocol.goal}</p>
              </div>

              <div className="space-y-2">
                {protocol.supplements.map((supp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{supp.name}</p>
                      <p className="text-xs text-muted-foreground">{supp.timing}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                      {supp.dosage}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                ⚠️ Consult with a healthcare provider before starting any supplement regimen
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
