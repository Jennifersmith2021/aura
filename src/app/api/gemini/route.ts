import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { prompt, type, context, weather } = await request.json();

        // Allow passing key from client for demo purposes, or use env var
        // For production, prefer server-side env var and ignore client-passed keys
        const clientKey = request.headers.get("x-google-api-key");
        const apiKey = (process.env.NODE_ENV === "production") ? process.env.GOOGLE_API_KEY : (clientKey || process.env.GOOGLE_API_KEY);

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        if (type === "text") {
            // For generating descriptions or advice
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            const text = response.text();
            return NextResponse.json({ text });
        } else if (type === "json") {
            // For structured data like shopping recommendations
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const finalPrompt = `
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

            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            let text = response.text();
            
            // Remove markdown code blocks if present
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            try {
                const parsed = JSON.parse(text);
                return NextResponse.json(parsed);
            } catch (parseError) {
                console.error("JSON parse error:", parseError, "Raw text:", text);
                return NextResponse.json({ error: "Failed to parse AI response as JSON", rawText: text }, { status: 500 });
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

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: `Failed to generate content: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}
