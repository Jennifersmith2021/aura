"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export function ChatInterface() {
    const { items } = useStore();
    const { weather } = useWeather();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm Aura, your personal stylist. How can I help you today? I can suggest outfits from your closet or give makeup tips!",
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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare context (simplify items to reduce token count)
            const context = items.map(i => ({
                name: i.name,
                type: i.type,
                category: i.category,
                color: i.color || i.notes || "unknown"
            }));

            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: userMsg.content,
                    type: "text",
                    context: context,
                    weather: weather ? {
                        temp: weather.temperature,
                        code: weather.weatherCode,
                        isDay: weather.isDay
                    } : null
                }),
            });

            const data = await res.json();

            if (data.text) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.text,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error("Chat error", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I'm having trouble connecting to my fashion sense right now. Please try again later.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-purple-500 flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-semibold">Ask Aura</h2>
                    <p className="text-xs text-muted-foreground">AI Personal Stylist</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === "user" ? "bg-slate-200 dark:bg-slate-700" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
                        )}>
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </div>
                        <div className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed",
                            msg.role === "user"
                                ? "bg-slate-900 text-white rounded-tr-none dark:bg-white dark:text-slate-900"
                                : "bg-slate-100 dark:bg-slate-700 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-white dark:bg-slate-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask for an outfit idea..."
                        className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
