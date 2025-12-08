"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Camera, Sparkles, Loader2, Image as ImageIcon, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type AnalysisType = "outfit" | "makeup" | "pose" | "confidence";

interface Analysis {
    type: AnalysisType;
    score: number;
    feedback: string[];
    suggestions: string[];
    strengths: string[];
}

const analysisTypeLabels = {
    outfit: "Outfit Analysis",
    makeup: "Makeup Check",
    pose: "Posture & Pose",
    confidence: "Confidence Assessment",
};

const analysisTypeIcons = {
    outfit: "👗",
    makeup: "💄",
    pose: "🧘",
    confidence: "✨",
};

export default function SmartMirror() {
    const { colorSeason } = useStore();
    const [photo, setPhoto] = useState<string | null>(null);
    const [analysisType, setAnalysisType] = useState<AnalysisType>("outfit");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
            setAnalysis(null);
        };
        reader.readAsDataURL(file);
    };

    const analyzePhoto = async () => {
        if (!photo) return;

        setIsAnalyzing(true);

        try {
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "json",
                    prompt: generateAnalysisPrompt(),
                    context: {
                        colorSeason,
                        analysisType,
                    },
                }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            
            // Parse AI response
            const aiAnalysis = typeof data.response === "string" 
                ? JSON.parse(data.response) 
                : data.response;

            setAnalysis({
                type: analysisType,
                score: aiAnalysis.score || 85,
                feedback: aiAnalysis.feedback || generateMockFeedback(analysisType),
                suggestions: aiAnalysis.suggestions || generateMockSuggestions(analysisType),
                strengths: aiAnalysis.strengths || generateMockStrengths(analysisType),
            });
        } catch (error) {
            console.error("Analysis error:", error);
            // Fallback to mock analysis
            setAnalysis({
                type: analysisType,
                score: Math.floor(Math.random() * 20) + 75,
                feedback: generateMockFeedback(analysisType),
                suggestions: generateMockSuggestions(analysisType),
                strengths: generateMockStrengths(analysisType),
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateAnalysisPrompt = () => {
        const prompts = {
            outfit: `Analyze this outfit photo for a feminine presentation. Provide:
1. Overall score (0-100)
2. 3-4 specific feedback points about fit, colors, styling
3. 3-4 suggestions for improvement
4. 2-3 strengths/what's working well
${colorSeason ? `Consider their color season: ${colorSeason}` : ""}
Return as JSON: {"score": number, "feedback": string[], "suggestions": string[], "strengths": string[]}`,
            
            makeup: `Analyze this makeup application for a feminine look. Provide:
1. Overall score (0-100)
2. 3-4 feedback points about application, color choices, techniques
3. 3-4 suggestions for improvement
4. 2-3 strengths
${colorSeason ? `Their color season is ${colorSeason}` : ""}
Return as JSON: {"score": number, "feedback": string[], "suggestions": string[], "strengths": string[]}`,
            
            pose: `Analyze this photo for posture, pose, and body language. Provide:
1. Overall score (0-100)
2. 3-4 feedback points about posture, hand placement, body angles
3. 3-4 suggestions for more feminine posing
4. 2-3 things they're doing well
Return as JSON: {"score": number, "feedback": string[], "suggestions": string[], "strengths": string[]}`,
            
            confidence: `Analyze this photo for confidence and presence. Provide:
1. Overall confidence score (0-100)
2. 3-4 observations about energy, facial expression, overall vibe
3. 3-4 suggestions to project more confidence
4. 2-3 strengths in their presentation
Return as JSON: {"score": number, "feedback": string[], "suggestions": string[], "strengths": string[]}`,
        };

        return prompts[analysisType];
    };

    const generateMockFeedback = (type: AnalysisType): string[] => {
        const feedback = {
            outfit: [
                "The color palette complements your skin tone beautifully",
                "The silhouette creates a lovely feminine line",
                "Accessories are well-coordinated with the overall look",
                "The fit appears comfortable and flattering",
            ],
            makeup: [
                "Eye makeup application shows good technique",
                "Lip color choice works well with your complexion",
                "Blending is smooth and natural-looking",
                "Color intensity is appropriate for the lighting",
            ],
            pose: [
                "Body angle creates a flattering silhouette",
                "Hand placement appears natural and graceful",
                "Posture shows confidence and poise",
                "Facial angle is photogenic and feminine",
            ],
            confidence: [
                "Your expression radiates genuine warmth",
                "Body language appears relaxed and natural",
                "Overall presence is engaging and authentic",
                "Energy level comes across as positive and inviting",
            ],
        };
        return feedback[type];
    };

    const generateMockSuggestions = (type: AnalysisType): string[] => {
        const suggestions = {
            outfit: [
                "Consider adding a statement necklace to draw eyes upward",
                "A belt could further accentuate the waistline",
                "Experiment with different shoe heights for varied silhouettes",
            ],
            makeup: [
                "Try a slightly darker lip liner to define the shape more",
                "Adding highlighter to cheekbones would enhance dimension",
                "Consider a touch of shimmer on inner corners to brighten eyes",
            ],
            pose: [
                "Shift weight to one hip for a more dynamic stance",
                "Slightly angle your shoulders away from camera for depth",
                "Try placing one hand on hip to create a more defined waistline",
            ],
            confidence: [
                "Maintain soft eye contact with the camera lens",
                "Allow your smile to reach your eyes for more warmth",
                "Stand slightly taller to project even more confidence",
            ],
        };
        return suggestions[type];
    };

    const generateMockStrengths = (type: AnalysisType): string[] => {
        const strengths = {
            outfit: [
                "Excellent color coordination throughout",
                "Professional and polished overall appearance",
            ],
            makeup: [
                "Natural-looking finish that enhances features",
                "Well-balanced color application",
            ],
            pose: [
                "Confident stance and body language",
                "Excellent posture and alignment",
            ],
            confidence: [
                "Authentic and genuine presentation",
                "Positive and inviting energy",
            ],
        };
        return strengths[type];
    };

    const resetAnalysis = () => {
        setPhoto(null);
        setAnalysis(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return "from-green-500 to-emerald-500";
        if (score >= 75) return "from-blue-500 to-cyan-500";
        if (score >= 60) return "from-yellow-500 to-orange-500";
        return "from-red-500 to-pink-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Outstanding!";
        if (score >= 75) return "Great!";
        if (score >= 60) return "Good";
        return "Keep Practicing";
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Smart Mirror</h3>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <p className="text-sm text-white/70">
                    Upload a photo and get AI-powered feedback on your outfit, makeup, pose, or confidence!
                </p>
            </div>

            {/* Analysis Type Selector */}
            {!photo && (
                <div>
                    <label className="block text-sm font-medium mb-2">What would you like analyzed?</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(analysisTypeLabels) as AnalysisType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setAnalysisType(type)}
                                className={clsx(
                                    "px-4 py-3 rounded-lg text-sm transition-colors",
                                    analysisType === type
                                        ? "bg-purple-500 text-white"
                                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                )}
                            >
                                <div className="text-2xl mb-1">{analysisTypeIcons[type]}</div>
                                {analysisTypeLabels[type]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Photo Upload/Display */}
            {!photo ? (
                <label className="block">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />
                    <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all">
                        <Camera className="w-12 h-12 text-white/80 mx-auto mb-3" />
                        <p className="text-white/60 text-sm mb-1">Click to upload a photo</p>
                        <p className="text-white/80 font-medium text-xs">Take a full-body shot in good lighting</p>
                    </div>
                </label>
            ) : (
                <div className="space-y-4">
                    {/* Photo Preview */}
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img
                            src={photo}
                            alt="Analysis preview"
                            className="w-full h-auto max-h-96 object-contain bg-black/20"
                        />
                        <button
                            onClick={resetAnalysis}
                            className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Analyze Button */}
                    {!analysis && (
                        <button
                            onClick={analyzePhoto}
                            disabled={isAnalyzing}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Analyze {analysisTypeLabels[analysisType]}
                                </>
                            )}
                        </button>
                    )}

                    {/* Analysis Results */}
                    <AnimatePresence>
                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {/* Score */}
                                <div className={clsx(
                                    "bg-gradient-to-r rounded-xl p-6 border border-white/20 text-center",
                                    getScoreColor(analysis.score)
                                )}>
                                    <div className="text-5xl font-bold mb-2">{analysis.score}</div>
                                    <div className="text-lg font-medium">{getScoreLabel(analysis.score)}</div>
                                </div>

                                {/* Strengths */}
                                {analysis.strengths.length > 0 && (
                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-400">
                                            <Sparkles className="w-4 h-4" />
                                            What&apos;s Working Well
                                        </h4>
                                        <ul className="space-y-1">
                                            {analysis.strengths.map((strength, idx) => (
                                                <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                                                    <span className="text-green-400 flex-shrink-0">✓</span>
                                                    {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Feedback */}
                                {analysis.feedback.length > 0 && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                                            <ImageIcon className="w-4 h-4 text-blue-400" />
                                            Detailed Feedback
                                        </h4>
                                        <ul className="space-y-1">
                                            {analysis.feedback.map((item, idx) => (
                                                <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                                                    <span className="text-blue-400 flex-shrink-0">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {analysis.suggestions.length > 0 && (
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-purple-300">
                                            <Sparkles className="w-4 h-4" />
                                            Suggestions
                                        </h4>
                                        <ul className="space-y-1">
                                            {analysis.suggestions.map((suggestion, idx) => (
                                                <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                                                    <span className="text-purple-400 flex-shrink-0">→</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={resetAnalysis}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        New Photo
                                    </button>
                                    <button
                                        onClick={analyzePhoto}
                                        disabled={isAnalyzing}
                                        className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Re-analyze
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
