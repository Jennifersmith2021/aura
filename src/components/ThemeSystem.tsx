"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Palette, Check } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "@/lib/toast";

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
}

const PRESET_THEMES: Theme[] = [
  {
    id: "rose-pink",
    name: "Rose Pink",
    colors: { primary: "#ec4899", accent: "#f43f5e", background: "#1a1625" },
  },
  {
    id: "purple",
    name: "Purple",
    colors: { primary: "#a855f7", accent: "#d946ef", background: "#1a1a2e" },
  },
  {
    id: "blue",
    name: "Ocean Blue",
    colors: { primary: "#3b82f6", accent: "#06b6d4", background: "#0f1419" },
  },
  {
    id: "green",
    name: "Emerald",
    colors: { primary: "#10b981", accent: "#34d399", background: "#0f2818" },
  },
  {
    id: "orange",
    name: "Sunset",
    colors: { primary: "#f97316", accent: "#fb923c", background: "#1a0f05" },
  },
];

type ColorMode = "light" | "dark" | "auto";

export default function ThemeSystem() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(PRESET_THEMES[0]);
  const [colorMode, setColorMode] = useState<ColorMode>("dark");
  const [customColor, setCustomColor] = useState("#ec4899");
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const savedMode = localStorage.getItem("colorMode") as ColorMode || "dark";
    setColorMode(savedMode);
    
    if (saved) {
      try {
        setCurrentTheme(JSON.parse(saved));
      } catch {
        // Use default theme
      }
    }

    applyTheme(currentTheme, savedMode);
  }, []);

  const applyTheme = (theme: Theme, mode: ColorMode) => {
    const root = document.documentElement;
    const isDark = mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Set theme colors
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-accent", theme.colors.accent);

    // Set light/dark mode
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const selectTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", JSON.stringify(theme));
    applyTheme(theme, colorMode);
    toast.success(`Theme changed to ${theme.name}`);
  };

  const setMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem("colorMode", mode);
    applyTheme(currentTheme, mode);
    toast.info(`Switched to ${mode} mode`);
  };

  const createCustomTheme = () => {
    const customTheme: Theme = {
      id: "custom",
      name: "Custom Theme",
      colors: {
        primary: customColor,
        accent: customColor,
        background: "#1a1a1a",
      },
    };
    selectTheme(customTheme);
    setShowCustomizer(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Themes & Personalization</h2>
        <p className="text-sm text-muted-foreground">
          Customize your Aura experience
        </p>
      </div>

      {/* Color Mode Selector */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">Display Mode</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMode("light")}
            className={clsx(
              "flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition-colors",
              colorMode === "light"
                ? "bg-primary text-white"
                : "bg-white/10 text-muted-foreground hover:bg-white/20"
            )}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button
            onClick={() => setMode("dark")}
            className={clsx(
              "flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition-colors",
              colorMode === "dark"
                ? "bg-primary text-white"
                : "bg-white/10 text-muted-foreground hover:bg-white/20"
            )}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs font-medium">Dark</span>
          </button>
          <button
            onClick={() => setMode("auto")}
            className={clsx(
              "flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition-colors",
              colorMode === "auto"
                ? "bg-primary text-white"
                : "bg-white/10 text-muted-foreground hover:bg-white/20"
            )}
          >
            <Sun className="w-4 h-4" />
            <Moon className="w-4 h-4" />
            <span className="text-xs font-medium">Auto</span>
          </button>
        </div>
      </div>

      {/* Preset Themes */}
      <div className="space-y-3">
        <h3 className="font-semibold">Color Themes</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {PRESET_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => selectTheme(theme)}
              className={clsx(
                "relative px-4 py-3 rounded-lg border-2 transition-all group",
                currentTheme.id === theme.id
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="text-sm font-medium">{theme.name}</span>
              </div>
              {currentTheme.id === theme.id && (
                <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Theme Creator */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Custom Theme
          </h3>
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="text-sm text-primary hover:text-primary/80"
          >
            {showCustomizer ? "Cancel" : "Create"}
          </button>
        </div>

        {showCustomizer && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-white/20"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {customColor}
                </span>
              </div>
            </div>

            <button
              onClick={createCustomTheme}
              className="w-full px-3 py-2 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors"
            >
              Apply Custom Theme
            </button>
          </div>
        )}
      </div>

      {/* Theme Preview */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">Preview</h3>
        <div className="space-y-2">
          <div
            className="h-10 rounded-lg border border-white/20"
            style={{ backgroundColor: currentTheme.colors.primary }}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 rounded border border-white/20 bg-white/5" />
            <div className="h-8 rounded border border-white/20 bg-white/5" />
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-200">
          💡 <strong>Tip:</strong> Your theme preference is saved locally and will persist across sessions.
        </p>
      </div>
    </div>
  );
}
