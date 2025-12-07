import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { isAdultCategory } from "@/utils/contentPolicy";

// Simple in-memory cache with TTL
interface CacheEntry {
    data: unknown;
    expiry: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000; // 60 seconds

function getCacheKey(query: string, retailer: unknown, category: unknown, page: unknown, limit: unknown): string {
    return `search:${query}:${retailer}:${category}:${page}:${limit}`;
}

function getCached(key: string): unknown | null {
    const entry = queryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        queryCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCached(key: string, data: unknown): void {
    queryCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, retailer, category, type, includeAdult, page, limit } = body as Record<string, unknown>;
        // Also accept header-based consent for server-to-server or client-proxied calls
        const headerConsent = request.headers.get("x-user-consent") === "true";

        // Try local retailer adapter first if enabled
        const useLocalAdapter = process.env.USE_LOCAL_RETAILER_ADAPTER === "true";
        const adapterUrl = process.env.RETAILER_ADAPTER_URL || "http://localhost:8001";

        if (type === "search") {
            const cacheKey = getCacheKey(String(query), retailer, category, page, limit);
            const cached = getCached(cacheKey);
            if (cached) {
                return NextResponse.json(cached);
            }

            if (useLocalAdapter) {
                try {
                    const adapterRes = await fetch(`${adapterUrl}/search?q=${encodeURIComponent(String(query))}&page=${Number(page) || 1}&limit=${Number(limit) || 10}`);
                    if (adapterRes.ok) {
                        const data = await adapterRes.json();
                        setCached(cacheKey, data);
                        return NextResponse.json(data);
                    } else if (adapterRes.status === 501) {
                        console.warn("Local adapter not configured, falling back to Gemini");
                    } else {
                        throw new Error(`Adapter error: ${adapterRes.status}`);
                    }
                } catch (err) {
                    console.error("Local adapter failed:", err);
                    // Fall through to Gemini
                }
            }

            // Fallback to Gemini
            const apiKey = request.headers.get("x-google-api-key") || process.env.GOOGLE_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ error: "Missing API Key and no local adapter available" }, { status: 401 });
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
You are Aura, a personal shopping assistant for fashion, makeup, and wellness products.
The user is searching for: "${query}"
Category: ${category || "any"}
Preferred Retailer: ${retailer || "any"}

Generate 5 realistic product recommendations that would match this search.
Return ONLY a JSON array with this structure (no markdown, just raw JSON):
[
  {
    "name": "Product Name",
    "retailer": "amazon" | "sephora" | "ulta" | "target" | "walmart" | "etsy" | "adam-eve" | "other",
    "category": "fashion" | "shoes" | "accessories" | "makeup" | "skincare" | "haircare" | "adult" | "wellness" | "other",
    "price": 29.99,
    "description": "Brief description",
    "url": "https://example.com/product"
  }
]

Focus on relevant, helpful recommendations. For adult wellness products, be respectful and informative.
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            try {
                const parsed = JSON.parse(text);
                let products: unknown[] = [];
                if (Array.isArray(parsed)) products = parsed;
                // Filter adult items unless client explicitly consented
                if (!includeAdult && !headerConsent) {
                    products = products.filter(p => {
                        if (!p || typeof p !== "object") return true;
                        const cat = (p as Record<string, unknown>)["category"];
                        return !isAdultCategory(typeof cat === "string" ? cat : String(cat));
                    });
                }

                // Support pagination: accept page & limit from request body (defaults below)
                // If the client didn't pass numbers, fall back to sensible defaults.
                const pageNum = Math.max(1, Number(page) || 1);
                const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
                const start = (pageNum - 1) * limitNum;
                const end = start + limitNum;

                const total = products.length;
                const paginated = (products as unknown[]).slice(start, end);

                return NextResponse.json({ products: paginated, total, page: pageNum, limit: limitNum });
            } catch (parseErr) {
                console.error("Failed to parse Gemini response:", parseErr, text);
                return NextResponse.json({ 
                    error: "Failed to parse product recommendations",
                    products: [] 
                }, { status: 500 });
            }
        } else if (type === "recommendations") {
            // Get personalized recommendations based on inventory
            const apiKey = request.headers.get("x-google-api-key") || process.env.GOOGLE_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
            }
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `
You are Aura, a personal shopping advisor.

Based on shopping habits and style preferences, suggest 5 items the user should consider buying.
Focus on: fashion basics, makeup must-haves, and wellness products that complement a well-rounded lifestyle.

Return a JSON object with this structure:
{
  "recommendations": [
    {
      "name": "Item Name",
      "retailer": "amazon" | "sephora" | "ulta" | "target" | "walmart" | "etsy" | "adam-eve" | "other",
      "category": "fashion" | "shoes" | "accessories" | "makeup" | "skincare" | "haircare" | "adult" | "wellness" | "other",
      "price": 45.00,
      "reason": "Why you should buy this"
    }
  ]
}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            try {
                const obj = JSON.parse(text);
                if (!includeAdult && !headerConsent && Array.isArray(obj.recommendations)) {
                    obj.recommendations = obj.recommendations.filter((r: unknown) => {
                        if (!r || typeof r !== "object") return true;
                        const cat = (r as Record<string, unknown>)["category"];
                        return !isAdultCategory(typeof cat === "string" ? cat : String(cat));
                    });
                }
                return NextResponse.json(obj);
            } catch (err) {
                console.error("Failed to parse recommendations:", err, text);
                return NextResponse.json({ error: "Failed to parse recommendations" }, { status: 500 });
            }
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    } catch (error) {
        console.error("Shopping API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch shopping recommendations" },
            { status: 500 }
        );
    }
}
