import { NextResponse } from "next/server";

// Default models (v1) aligned to the currently listed supported set
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-pro";
const JSON_MODEL = process.env.GEMINI_JSON_MODEL || "gemini-2.5-flash";

function uniqueModels(models: Array<string | undefined | null>): string[] {
    return models.filter((m): m is string => Boolean(m)).filter((m, i, arr) => arr.indexOf(m) === i);
}
async function generateWithFallback(models: string[], prompt: string, apiKey: string) {
    const tried: string[] = [];
    let lastError: any;

    for (const modelId of models) {
        tried.push(modelId);
        try {
            const text = await generateContentHttp(modelId, prompt, apiKey);
            return { text, modelId, tried };
        } catch (err: any) {
            lastError = err;
            const status = err?.status;
            const retryable = [400, 401, 403, 404, 429, 500, 503].includes(status as number);
            if (!retryable) break;
        }
    }

    const status = lastError?.status;
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    throw { status, message, tried, lastError };
}

async function generateContentHttp(modelId: string, prompt: string, apiKey: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ parts: [{ text: prompt }]}]
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const text = await res.text();
        const error = new Error(text || res.statusText);
        (error as any).status = res.status;
        (error as any).responseText = text;
        throw error;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const text = parts.map((p: any) => p.text || p).join("");
    if (!text) {
        const error = new Error("Empty response");
        (error as any).status = 500;
        throw error;
    }
    return text;
}

export async function POST(request: Request) {
    try {
        const { prompt, type, context, weather, model: modelOverride } = await request.json();

        // Allow passing key from client for demo purposes, or use env var
        // For production, prefer server-side env var and ignore client-passed keys
        const clientKey = request.headers.get("x-google-api-key");
        const apiKey = (process.env.NODE_ENV === "production") ? process.env.GOOGLE_API_KEY : (clientKey || process.env.GOOGLE_API_KEY);

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        // Build ordered model preference lists with deduplication
        const textModels = uniqueModels([
            modelOverride,
            TEXT_MODEL,
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.5-flash"
        ]);

        const jsonModels = uniqueModels([
            modelOverride,
            JSON_MODEL,
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash-lite-001"
        ]);

        // Quick path: list supported models for troubleshooting
        if (type === "list") {
            const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
            const res = await fetch(listUrl, { method: "GET" });
            const text = await res.text();

            if (!res.ok) {
                return NextResponse.json(
                    { error: "Failed to list models", status: res.status, details: text },
                    { status: res.status }
                );
            }

            try {
                const data = JSON.parse(text);
                const models = data.models || [];
                // Surface only ids and supported generation methods for clarity
                const simplified = models.map((m: any) => ({
                    name: m.name,
                    supportedGenerationMethods: m.supportedGenerationMethods,
                    displayName: m.displayName,
                    version: m.version,
                }));
                return NextResponse.json({ models: simplified });
            } catch (err) {
                return NextResponse.json({ raw: text }, { status: 200 });
            }
        }

        if (type === "text") {
            // For generating descriptions or advice
            let finalPrompt = prompt;
            if (context || weather) {
                finalPrompt = `
You are Aura, a personal AI stylist and beauty consultant. 
You are helpful, encouraging, and knowledgeable about fashion, makeup, and color theory.

${weather ? `Current Weather: ${Math.round(weather.temp)}°F, Condition Code: ${weather.code}, ${weather.isDay ? "Daytime" : "Nighttime"}` : ""}

${context ? `The user has the following items in their inventory:
${JSON.stringify(context, null, 2)}` : ""}

User Question: ${prompt}

Provide a personalized recommendation based on their inventory and the current weather if relevant. 
If suggesting an outfit, mention specific items from their inventory by name.
`;
            }

            const { text, modelId, tried } = await generateWithFallback(textModels, finalPrompt, apiKey);
            return NextResponse.json({ text, modelUsed: modelId, triedModels: tried });
        } else if (type === "json") {
            // For structured data like shopping recommendations
            const fallbackPrompt = `
You are a personal stylist. Analyze the user's current inventory and suggest 5 NEW items they should buy to elevate their style.
Focus on creating a cohesive capsule wardrobe or completing makeup routines.

Rules:
1. Suggest items that specifically complement existing items (e.g. "A wide belt to cinch your [Existing Dress]").
2. Balance between clothing (3 items) and makeup/beauty (2 items).
3. Ensure the output is valid JSON.

User Inventory:
${JSON.stringify(context, null, 2)}

Return ONLY a JSON object with this exact structure:
{
    "recommendations": [
        {
            "name": "Specific Item Name (e.g. 'Gold Hoop Earrings')",
            "reason": "Specific reason linking to their inventory (e.g. 'Pairs perfectly with your [Black Turtleneck] for a classic look')",
            "category": "clothing" or "makeup"
        }
    ]
}
`;

            const promptToUse = prompt || fallbackPrompt;
            const { text, modelId, tried } = await generateWithFallback(jsonModels, promptToUse, apiKey);

            // Remove markdown code blocks if present
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            try {
                const parsed = JSON.parse(cleaned);
                return NextResponse.json({ ...parsed, modelUsed: modelId, triedModels: tried });
            } catch (parseError) {
                console.error("JSON parse error:", parseError, "Raw text:", cleaned);
                return NextResponse.json({ error: "Failed to parse AI response as JSON", rawText: cleaned, modelUsed: modelId, triedModels: tried }, { status: 500 });
            }
        } else if (type === "image") {
            // Attempt server-side image generation via configured provider; otherwise fallback
            try {
                const { generateImage } = await import("@/lib/imageGenerator");
                const result = await generateImage(prompt);
                return NextResponse.json(result);
            } catch (err) {
                console.error("Image generation error:", err);
                return NextResponse.json({
                    image: `https://placehold.co/600x800/e11d48/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`
                });
            }
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    } catch (error: any) {
        const statusFromError = error?.status || error?.response?.status;
        let details = error?.message || (error?.lastError instanceof Error ? error.lastError.message : String(error?.lastError || error));

        try {
            if (error?.lastError?.responseText) {
                details = error.lastError.responseText;
            } else if (error?.responseText) {
                details = error.responseText;
            }
        } catch (readErr) {
            console.error("Failed to read error response body", readErr);
        }

        const status = typeof statusFromError === "number" ? statusFromError : 502;
        const triedModels = error?.tried || [];

        console.error("Gemini API Error:", { status, details, triedModels, error });

        return NextResponse.json(
            {
                error: "Failed to generate content",
                details,
                status,
                hint: "Verify your Google API key, model access, and network connectivity.",
                triedModels,
            },
            { status }
        );
    }
}
