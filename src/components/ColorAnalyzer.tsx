"use client";

import { useState } from "react";
import { Palette, Upload, Camera, Sparkles, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ColorAnalysis {
    dominantColors: string[];
    season: "spring" | "summer" | "autumn" | "winter";
    palette: string[];
    recommendations: string[];
}

const seasonalPalettes = {
    spring: {
        colors: ["#FFB6C1", "#FFD700", "#98FB98", "#87CEEB", "#FFA07A", "#F0E68C"],
        description: "Light, warm, and clear colors",
        characteristics: ["Warm undertones", "Light and bright", "Clear and vibrant"],
        bestColors: ["Peach", "Coral", "Golden Yellow", "Warm Pink", "Turquoise", "Light Periwinkle"],
        avoid: ["Black", "Pure White", "Dark Navy", "Burgundy"],
    },
    summer: {
        colors: ["#E6E6FA", "#B0C4DE", "#DDA0DD", "#F0F8FF", "#D8BFD8", "#FFB6C1"],
        description: "Soft, cool, and muted colors",
        characteristics: ["Cool undertones", "Soft and muted", "Gentle and subtle"],
        bestColors: ["Soft Blue", "Lavender", "Rose Pink", "Mauve", "Powder Blue", "Soft White"],
        avoid: ["Orange", "Gold", "Warm Browns", "Bright Colors"],
    },
    autumn: {
        colors: ["#8B4513", "#D2691E", "#DAA520", "#CD853F", "#BC8F8F", "#F4A460"],
        description: "Deep, warm, and muted colors",
        characteristics: ["Warm undertones", "Rich and earthy", "Muted and golden"],
        bestColors: ["Rust", "Olive", "Terracotta", "Gold", "Warm Brown", "Deep Orange"],
        avoid: ["Icy colors", "Black", "Bright Pink", "Cool Blues"],
    },
    winter: {
        colors: ["#000000", "#FFFFFF", "#DC143C", "#4169E1", "#8B008B", "#FF1493"],
        description: "Deep, cool, and vivid colors",
        characteristics: ["Cool undertones", "High contrast", "Bold and vivid"],
        bestColors: ["True Black", "Pure White", "Royal Blue", "Magenta", "Emerald", "Icy Pink"],
        avoid: ["Warm Browns", "Orange", "Gold", "Muted Colors"],
    },
};

export default function ColorAnalyzer() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<ColorAnalysis | null>(null);
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                analyzeImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async (imageData: string) => {
        setIsAnalyzing(true);
        
        // Simulate AI analysis (in production, this would call your AI API)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock analysis result
        const seasons: Array<"spring" | "summer" | "autumn" | "winter"> = ["spring", "summer", "autumn", "winter"];
        const detectedSeason = seasons[Math.floor(Math.random() * seasons.length)];
        
        setAnalysis({
            dominantColors: ["#FFB6C1", "#87CEEB", "#FFD700", "#98FB98", "#FFA07A"],
            season: detectedSeason,
            palette: seasonalPalettes[detectedSeason].colors,
            recommendations: seasonalPalettes[detectedSeason].bestColors,
        });
        
        setIsAnalyzing(false);
    };

    const copyColor = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">AI Color Analyzer</h2>
                    <p className="text-sm text-muted-foreground">
                        Discover your perfect color palette
                    </p>
                </div>
                <Palette className="w-8 h-8 text-purple-400" />
            </div>

            {/* Upload Section */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30">
                {!uploadedImage ? (
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                        <div className="w-full aspect-video rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:border-purple-400 transition-colors">
                            <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                            <p className="text-foreground font-semibold mb-1">Upload a photo</p>
                            <p className="text-sm text-muted-foreground">
                                Selfie, outfit, or any clothing item
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={uploadedImage}
                                alt="Uploaded"
                                className="w-full aspect-video object-cover rounded-xl"
                            />
                            <button
                                onClick={() => {
                                    setUploadedImage(null);
                                    setAnalysis(null);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isAnalyzing && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-pulse" />
                    <p className="text-foreground font-semibold">Analyzing colors...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        AI is detecting your color palette
                    </p>
                </div>
            )}

            {/* Analysis Results */}
            <AnimatePresence>
                {analysis && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Dominant Colors */}
                        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                            <h3 className="font-bold text-lg text-foreground mb-4">
                                Detected Colors
                            </h3>
                            <div className="grid grid-cols-5 gap-3">
                                {analysis.dominantColors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => copyColor(color)}
                                        className="relative group"
                                    >
                                        <div
                                            className="aspect-square rounded-xl border-2 border-white/20 hover:border-purple-400 transition-all hover:scale-105"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedColor === color ? (
                                                <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-white drop-shadow-lg" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                                            {color}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Season Analysis */}
                        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-6 border border-pink-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-6 h-6 text-pink-400" />
                                <div>
                                    <h3 className="font-bold text-xl text-foreground capitalize">
                                        {analysis.season} Season
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {seasonalPalettes[analysis.season].description}
                                    </p>
                                </div>
                            </div>

                            {/* Characteristics */}
                            <div className="space-y-2 mb-4">
                                <h4 className="font-semibold text-sm text-foreground">
                                    Your Characteristics:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {seasonalPalettes[analysis.season].characteristics.map(
                                        (char, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-foreground"
                                            >
                                                {char}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Season Palette */}
                            <div className="mb-4">
                                <h4 className="font-semibold text-sm text-foreground mb-2">
                                    Your Perfect Palette:
                                </h4>
                                <div className="grid grid-cols-6 gap-2">
                                    {seasonalPalettes[analysis.season].colors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => copyColor(color)}
                                            className="relative group"
                                        >
                                            <div
                                                className="aspect-square rounded-lg border border-white/20 hover:border-pink-400 transition-all hover:scale-105"
                                                style={{ backgroundColor: color }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedColor === color ? (
                                                    <Check className="w-4 h-4 text-white drop-shadow-lg" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-white drop-shadow-lg" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-green-500/10 rounded-lg p-4 mb-3">
                                <h4 className="font-semibold text-sm text-green-300 mb-2">
                                    ✓ Best Colors for You:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {seasonalPalettes[analysis.season].bestColors.map(
                                        (color, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-green-500/20 rounded text-xs font-medium text-foreground"
                                            >
                                                {color}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Avoid */}
                            <div className="bg-red-500/10 rounded-lg p-4">
                                <h4 className="font-semibold text-sm text-red-300 mb-2">
                                    ✗ Colors to Avoid:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {seasonalPalettes[analysis.season].avoid.map((color, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-red-500/20 rounded text-xs font-medium text-foreground"
                                        >
                                            {color}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/30">
                            <h3 className="font-bold text-base text-blue-300 mb-3">
                                💡 Styling Tips
                            </h3>
                            <ul className="space-y-2 text-sm text-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>
                                        Build your wardrobe around colors from your seasonal palette
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>
                                        Use your best colors near your face for maximum impact
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>
                                        Colors to avoid can be used in accessories or away from face
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>
                                        Mix colors within your palette for harmonious looks
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Box */}
            {!uploadedImage && (
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-sm text-foreground font-medium">
                        <strong>How it works:</strong> Upload a photo and our AI will analyze the
                        colors, determine your seasonal color type, and provide personalized
                        recommendations for colors that complement you best.
                    </p>
                </div>
            )}
        </div>
    );
}
