"use client";

import { useState } from "react";
import { BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface GuideSection {
    title: string;
    description: string;
    steps: string[];
    tips?: string[];
    imageUrl?: string;
}

const makeupGuides: GuideSection[] = [
    {
        title: "Complete Makeup Application Order",
        description: "Follow this order for flawless makeup application",
        steps: [
            "1. Cleanse and moisturize face",
            "2. Apply primer (helps makeup last longer)",
            "3. Color corrector (orange/peach for beard shadow)",
            "4. Foundation (use stippling motion over beard area)",
            "5. Concealer (under eyes, blemishes, beard shadow)",
            "6. Setting powder (especially over beard area)",
            "7. Contour (cheekbones, nose, jawline)",
            "8. Blush (apples of cheeks)",
            "9. Highlighter (cheekbones, nose bridge, cupid's bow)",
            "10. Eyebrow pencil/powder",
            "11. Eyeshadow primer",
            "12. Eyeshadow (light to dark)",
            "13. Eyeliner",
            "14. Mascara",
            "15. Lip liner",
            "16. Lipstick or gloss",
            "17. Setting spray (final seal)",
        ],
        tips: [
            "Always work in natural lighting when possible",
            "Blend, blend, blend - no harsh lines",
            "Less is more - build up gradually",
            "Clean brushes weekly for best results",
        ],
        imageUrl: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&h=400&fit=crop&q=80",
    },
    {
        title: "Covering Beard Shadow",
        description: "Special techniques for covering facial hair shadow",
        steps: [
            "1. Shave as close as possible (use sharp razor)",
            "2. Apply moisturizer and let absorb",
            "3. Use orange/peach color corrector on shadow areas",
            "4. Pat (don't rub) color corrector into skin",
            "5. Apply full-coverage foundation with stippling brush",
            "6. Use stippling motion (up and down tapping)",
            "7. Layer thin coats - never one thick layer",
            "8. Apply concealer over any remaining shadow",
            "9. Set with translucent powder using pressing motion",
            "10. Optional: Apply another thin layer of foundation",
            "11. Set again with powder",
            "12. Use setting spray for longevity",
        ],
        tips: [
            "Orange corrector for dark beards, peach for lighter",
            "NYX HD Concealer in Orange is affordable and effective",
            "Stippling brushes work better than sponges for beard coverage",
            "Consider laser hair removal for permanent solution",
            "Practice makes perfect - don't give up!",
        ],
        imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=400&fit=crop&q=80",
    },
    {
        title: "Beginner Makeup Essentials",
        description: "Must-have products to start your makeup journey",
        steps: [
            "Foundation - Match to jawline, not hand",
            "Concealer - 1-2 shades lighter than foundation",
            "Setting powder - Translucent for all skin tones",
            "Eyebrow pencil - Match hair color or slightly lighter",
            "Neutral eyeshadow palette - Browns, taupes, creams",
            "Black or brown eyeliner - Pencil easier for beginners",
            "Mascara - Start with waterproof",
            "Blush - Pink for cool tones, peach for warm",
            "Nude lipstick - MLBB (my lips but better) shade",
            "Makeup brushes - Foundation, powder, eyeshadow set",
            "Beauty blender/sponge - For blending foundation",
            "Makeup remover - Micellar water or oil cleanser",
        ],
        tips: [
            "Start with drugstore products while learning",
            "Invest in good brushes - they make huge difference",
            "Watch YouTube tutorials for techniques",
            "Practice on days you're staying home",
        ],
    },
    {
        title: "Eye Makeup for Beginners",
        description: "Create beautiful eyes step by step",
        steps: [
            "1. Apply eyeshadow primer to lids",
            "2. Set primer with light neutral shade all over",
            "3. Apply medium shade in crease",
            "4. Blend crease color with windshield wiper motion",
            "5. Apply darker shade to outer corner",
            "6. Blend outer corner into crease",
            "7. Add highlight to inner corner and brow bone",
            "8. Line upper lash line with eyeliner",
            "9. Optional: Line lower lash line (outer 2/3 only)",
            "10. Curl lashes with eyelash curler",
            "11. Apply mascara - wiggle at roots, sweep to tips",
            "12. Optional: False lashes for extra drama",
        ],
        tips: [
            "Use tape at outer corner for perfect wing liner",
            "Darker colors make eyes appear smaller - use strategically",
            "Highlight inner corners to brighten eyes",
            "Individual false lashes look more natural than strips",
        ],
    },
];

const fashionGuides: GuideSection[] = [
    {
        title: "Building a Feminine Wardrobe",
        description: "Essential pieces every sissy needs",
        steps: [
            "Lingerie - Start with panties, bras, stockings",
            "Little Black Dress - Versatile and classic",
            "Skinny jeans - Feminine fit, shows curves",
            "Blouses - Flowy, feminine styles in various colors",
            "Skirts - A-line, pencil, and mini styles",
            "Heels - Start with 3-4 inch, work up to stilettos",
            "Leggings - Comfortable and flattering",
            "Cardigans - Layering and modesty",
            "Accessories - Jewelry, belts, scarves, purses",
            "Nightwear - Babydolls, chemises, robes",
        ],
        tips: [
            "Focus on fit over size number",
            "Start with neutrals, add color gradually",
            "Quality basics > trendy pieces",
            "Thrift stores great for experimentation",
        ],
    },
    {
        title: "Dressing for Your Body Type",
        description: "Flattering styles for different figures",
        steps: [
            "Pear Shape - Emphasize shoulders, A-line skirts",
            "Apple Shape - Empire waists, V-necks, define waist",
            "Rectangle - Create curves with peplum, belts",
            "Hourglass - Show curves, wrap dresses, fitted styles",
            "Inverted Triangle - Balance with A-line skirts, bootcut pants",
            "Petite - Monochrome outfits, high waists, avoid overwhelming prints",
            "Plus Size - Structured pieces, strategic patterns, spanx",
        ],
        tips: [
            "Corsets and waist trainers help create curves",
            "Padded bras and hip pads enhance figure",
            "Vertical stripes elongate",
            "Dark colors generally more slimming",
        ],
    },
    {
        title: "Outfit Ideas by Occasion",
        description: "What to wear for different situations",
        steps: [
            "Casual Day: Skinny jeans, cute top, flats or low heels",
            "Date Night: Little black dress, heels, statement jewelry",
            "Work/Professional: Pencil skirt, blouse, blazer, pumps",
            "Night Out: Short dress or crop top with skirt, stilettos",
            "Loungewear: Leggings, oversized sweater, slippers",
            "Gym: Sports bra, leggings, tank top, sneakers",
            "Beach: One-piece or bikini, cover-up, sandals",
            "Shopping: Comfortable dress or jeans, wedges, crossbody bag",
        ],
        tips: [
            "Always dress for YOUR comfort level",
            "Start in private, build confidence gradually",
            "Weather appropriate is always important",
            "Confidence is the best accessory",
        ],
    },
    {
        title: "Accessorizing Like a Pro",
        description: "Complete your look with the right accessories",
        steps: [
            "Jewelry - Start with simple studs, delicate necklace",
            "Watches - Feminine styles with smaller faces",
            "Bracelets - Thin bangles or charm bracelets",
            "Rings - One per hand unless very delicate",
            "Belts - Define waist, match shoes if possible",
            "Scarves - Add color, femininity, hide Adam's apple",
            "Purses - Match occasion (clutch vs tote)",
            "Sunglasses - Oversized, cat-eye, or feminine frames",
            "Hair accessories - Headbands, clips, scrunchies",
            "Hosiery - Nude, black, or colored tights/stockings",
        ],
        tips: [
            "Less is more - don't over-accessorize",
            "Match metals (all gold or all silver)",
            "Purse should be proportional to body size",
            "Practice walking in heels at home first",
        ],
    },
];

export default function BeautyGuides() {
    const [activeTab, setActiveTab] = useState<"makeup" | "fashion">("makeup");
    const [expandedGuide, setExpandedGuide] = useState<number | null>(0);

    const currentGuides = activeTab === "makeup" ? makeupGuides : fashionGuides;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold">Beauty & Fashion Guides</h3>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        setActiveTab("makeup");
                        setExpandedGuide(0);
                    }}
                    className={clsx(
                        "flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                        activeTab === "makeup"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    💄 Makeup Guides
                </button>
                <button
                    onClick={() => {
                        setActiveTab("fashion");
                        setExpandedGuide(0);
                    }}
                    className={clsx(
                        "flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                        activeTab === "fashion"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                >
                    👗 Fashion Guides
                </button>
            </div>

            {/* Guides List */}
            <div className="space-y-3">
                {currentGuides.map((guide, index) => (
                    <div
                        key={index}
                        className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                    >
                        <button
                            onClick={() => setExpandedGuide(expandedGuide === index ? null : index)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-left">
                                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-base text-foreground">{guide.title}</h4>
                                    <p className="text-sm text-muted-foreground font-medium">{guide.description}</p>
                                </div>
                            </div>
                            {expandedGuide === index ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                            )}
                        </button>

                        <AnimatePresence>
                            {expandedGuide === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                                        {/* Image */}
                                        {guide.imageUrl && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative rounded-xl overflow-hidden aspect-[4/3]"
                                            >
                                                <img
                                                    src={guide.imageUrl}
                                                    alt={guide.title}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                            </motion.div>
                                        )}

                                        {/* Steps */}
                                        <div>
                                            <h5 className="font-semibold text-sm text-foreground mb-2">Steps:</h5>
                                            <ol className="space-y-2">
                                                {guide.steps.map((step, stepIndex) => (
                                                    <li
                                                        key={stepIndex}
                                                        className="text-sm text-muted-foreground font-medium pl-2"
                                                    >
                                                        {step}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        {/* Tips */}
                                        {guide.tips && guide.tips.length > 0 && (
                                            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                                                <h5 className="font-semibold text-sm text-purple-300 mb-2">💡 Pro Tips:</h5>
                                                <ul className="space-y-1">
                                                    {guide.tips.map((tip, tipIndex) => (
                                                        <li
                                                            key={tipIndex}
                                                            className="text-sm text-foreground font-medium flex items-start gap-2"
                                                        >
                                                            <span className="text-purple-400 shrink-0">•</span>
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
