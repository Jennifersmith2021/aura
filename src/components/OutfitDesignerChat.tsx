"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles, Loader2, RefreshCw, Download } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";
import { Item } from "@/types";

interface OutfitMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    outfitSuggestion?: OutfitSuggestion;
    timestamp: number;
}

interface OutfitSuggestion {
    title: string;
    items: string[];
    reason: string;
    occasion?: string;
    colors?: string[];
}

export function OutfitDesignerChat() {
    const { items } = useStore();
    const { weather } = useWeather();
    const [messages, setMessages] = useState<OutfitMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "✨ Hey! I'm your Outfit Designer. Tell me about your mood, the occasion, or the weather, and I'll suggest perfect outfits from your closet. You can also ask for specific styles like 'casual feminine' or 'business chic'!",
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const clothingItems = items.filter(i => i.type === "clothing");

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: OutfitMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Create organized inventory summary
            const byCategory = clothingItems.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(`${item.name}${item.color ? ` (${item.color})` : ""}`);
                return acc;
            }, {} as Record<string, string[]>);

            const inventorySummary = Object.entries(byCategory)
                .map(([cat, items]) => `${cat}: ${items.join(", ")}`)
                .join("\n");

            // Build outfit design prompt
            const prompt = `You are an expert personal stylist creating outfit suggestions. 

User's Wardrobe:
${inventorySummary}

Weather: ${weather ? `${weather.temperature}°, ${weather.isDay ? 'daytime' : 'nighttime'}` : 'Unknown'}

User Request: "${input}"

Respond with:
1. A warm, personalized greeting
2. A suggested outfit with:
   - OUTFIT TITLE: [catchy name]
   - ITEMS: [list of 4-6 items from their closet that work together]
   - REASON: [why these items work well together]
   - OCCASION: [when/where to wear this]
   - STYLING TIPS: [1-2 brief tips for pulling it together]
3. A suggestion for how they could accessorize or adapt it

Be specific - only suggest items they actually own. Be encouraging and fun!`;

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    type: "text",
                }),
            });

            const data = await res.json();

            if (data.text) {
                const aiMsg: OutfitMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.text,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            } else {
                throw new Error(data.error || "Failed to generate outfit");
            }
        } catch (error) {
            console.error("Outfit designer error", error);
            const errorMsg: OutfitMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "😅 Oops! I had trouble thinking of outfits. Try describing your mood or the occasion more clearly, and I'll give it another shot!",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickPrompts = [
        "Something casual and feminine",
        "Business meeting outfit",
        "Date night vibes",
        "Weekend brunch style",
        "Rainy day cozy",
        "High confidence look",
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950 rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Outfit Designer</h2>
                        <p className="text-xs opacity-90">
                            {clothingItems.length} items in your closet
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        {msg.role === "assistant" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                A
                            </div>
                        )}

                        <div
                            className={cn(
                                "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg text-sm leading-relaxed",
                                msg.role === "user"
                                    ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-none"
                                    : "bg-white dark:bg-slate-800 text-foreground border border-purple-200 dark:border-purple-700 rounded-bl-none"
                            )}
                        >
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        </div>

                        {msg.role === "user" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            A
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Designing outfit...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Prompts (shown after welcome) */}
            {messages.length === 1 && !isLoading && (
                <div className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border-t border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickPrompt(prompt)}
                                className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 rounded-full hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/60 dark:hover:to-pink-900/60 transition-all"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-slate-800/90 p-4 space-y-3">
                {clothingItems.length === 0 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                        💡 Add some clothing items to your closet first so I can suggest outfits!
                    </div>
                )}

                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe your mood, occasion, or desired style..."
                        disabled={isLoading || clothingItems.length === 0}
                        className="flex-1 resize-none px-4 py-2.5 bg-white dark:bg-slate-700 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 text-sm"
                        rows={2}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim() || clothingItems.length === 0}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Design</span>
                    </button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    Shift+Enter for new line • Powered by Gemini AI
                </div>
            </div>
        </div>
    );
}
