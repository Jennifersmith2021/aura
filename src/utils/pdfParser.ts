/**
 * PDF Receipt Parser for Amazon receipts
 * Extracts item information from PDF receipts using PDF.js
 */

import { Item } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { debugLogger } from "./debugLogger";
import { normalizeImageUrl } from "./imageUrl";

interface ImageSearchResult {
    image?: string;
    productUrl?: string;
}

interface ParsedItem {
    name: string;
    price?: number;
    quantity?: number;
    date?: number;
    purchaseUrl?: string;
}

/**
 * Parse PDF receipt and extract items
 * This is a client-side implementation that uses PDF.js via CDN
 */
export async function parsePDFReceipt(file: File): Promise<Item[]> {
    try {
        debugLogger.info('🔵 START PDF PARSING');
        debugLogger.info('📄 File', { name: file.name, size: file.size });
        
        // Load PDF.js library dynamically
        if (typeof window === 'undefined') {
            throw new Error('PDF parsing is only available in the browser');
        }

        // Load PDF.js from CDN if not already loaded
        if (!(window as any).pdfjsLib) {
            debugLogger.info('📚 Loading PDF.js library...');
            await loadPDFJS();
        }

        const pdfjsLib = (window as any).pdfjsLib;
        debugLogger.info('✅ PDF.js loaded');
        
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        debugLogger.info('📖 File read');
        
        // Load PDF document
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        debugLogger.info('📑 PDF loaded', { pages: pdf.numPages });
        
        let fullText = '';
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }
        
        debugLogger.info('📝 Extracted text length', { length: fullText.length });
        debugLogger.debug('📝 EXTRACTED TEXT', fullText.substring(0, 1000));
        
        // Load settings for enrichment
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const preferredModel = settings.geminiModel || 'gemini-2.5-flash';

        // Parse the extracted text
        const parsedItems = parseReceiptText(fullText);
        debugLogger.info('✅ Parsed items from receipt', { count: parsedItems.length, items: parsedItems });
        
        if (parsedItems.length === 0) {
            // If keyword parsing fails, try to identify items with Gemini
            debugLogger.info('🤖 No items found with keyword parsing, trying Gemini AI...');
            const aiParsedItems = await identifyItemsWithAI(fullText);
            debugLogger.info('🤖 Gemini identified items', { count: aiParsedItems.length, items: aiParsedItems });
            
            if (aiParsedItems.length > 0) {
                const enrichedAi = await Promise.all(
                    aiParsedItems.map(async (item) => {
                        try {
                            const imageResult = await searchProductImage(item.name, settings.googleApiKey, preferredModel);
                            return {
                                ...item,
                                image: normalizeImageUrl(imageResult?.image || item.image),
                                purchaseUrl: imageResult?.productUrl || item.purchaseUrl
                            };
                        } catch (error) {
                            debugLogger.warn('⚠️ Failed to get image for AI item', { name: item.name });
                            return item;
                        }
                    })
                );
                debugLogger.info('✅ Enriched AI items', enrichedAi);
                debugLogger.info('🎉 FINAL RESULT', { count: enrichedAi.length });
                return enrichedAi;
            }
            
            // If still no items, return empty (don't throw error)
            debugLogger.warn('⚠️ No items found with either parsing method', { textLength: fullText.length });
            return [];
        }

        // Enrich items with images from Amazon search
        const enrichedItems = await Promise.all(
            parsedItems.map(async (item) => {
                try {
                    const imageResult = await searchProductImage(item.name, settings.googleApiKey, preferredModel);
                    const base = createItemFromParsed(item);
                    return {
                        ...base,
                        image: normalizeImageUrl(imageResult?.image) || base.image,
                        purchaseUrl: imageResult?.productUrl || base.purchaseUrl
                    };
                } catch (error) {
                    debugLogger.warn('⚠️ Failed to get image for', item.name);
                    return createItemFromParsed(item);
                }
            })
        );
        
        debugLogger.info('✅ Enriched items', enrichedItems);
        debugLogger.info('🎉 FINAL RESULT', { count: enrichedItems.length });
        return enrichedItems;
        
    } catch (error) {
        debugLogger.error('❌ PDF parsing error', error);
        throw new Error('Failed to parse PDF receipt. Please ensure it\'s a valid Amazon receipt.');
    }
}

/**
 * Use Gemini AI to identify clothing/beauty items in the receipt text
 */
async function identifyItemsWithAI(receiptText: string): Promise<Item[]> {
    try {
        debugLogger.info('🤖 === GEMINI AI IDENTIFICATION ===');
        debugLogger.info('📤 Calling Gemini API...');
        
        // Get API key from settings
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const apiKey = settings.googleApiKey;
        const preferredModel = settings.geminiModel || 'gemini-2.5-flash';
        
        if (!apiKey) {
            debugLogger.error('❌ No Google API key configured', { instruction: 'Add your API key in Settings' });
            return [];
        }
        
        debugLogger.debug('🔑 Using API key:', { keyLength: apiKey.length });
        
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-google-api-key': apiKey
            },
            body: JSON.stringify({
                type: 'json',
                model: preferredModel,
                prompt: `Extract ALL products from this Amazon receipt that are clothing, shoes, accessories, or beauty/makeup.
Return a JSON array of objects with fields: name, price, brand, color, size, category, image, productUrl.
- name: exact product name
- price: number
- brand: brand if present
- color: simple color if present
- size: size token (e.g., L/XL, S, M)
- category: one of top, bottom, dress, shoe, outerwear, accessory, legging, face, eye, lip, cheek, tool, other
- image: direct image URL if known
- productUrl: product page URL if known
Only include real products (no shipping/tax/totals).

Receipt text:
${receiptText.substring(0, 3000)}`
            })
        });

        debugLogger.info('📥 Gemini response status', { status: response.status });
        
        if (!response.ok) {
            const errorText = await response.text();
            debugLogger.error('❌ Gemini API error', { 
                status: response.status, 
                error: errorText,
                instruction: 'Check Settings to add/verify your Google API key'
            });
            return [];
        }
        
        const data = await response.json();
        debugLogger.debug('📊 Gemini raw response', data);
        
        let items: any[] = [];
        
        // Try to extract items from various response formats
        if (Array.isArray(data)) {
            items = data;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        } else if (data.products && Array.isArray(data.products)) {
            items = data.products;
        } else if (data.recommendations && Array.isArray(data.recommendations)) {
            items = data.recommendations;
        } else if (typeof data === 'object' && data !== null) {
            // Handle responses shaped like { "0": { name, price }, ... }
            const numericValues = Object.keys(data)
                .filter((k) => !Number.isNaN(Number(k)))
                .map((k) => (data as any)[k]);
            if (numericValues.length > 0) {
                items = numericValues;
            } else if ((data as any).name || (data as any).product || (data as any).title) {
                // Single object payload
                items = [data];
            }
        } else if (typeof data === 'string') {
            try {
                items = JSON.parse(data);
                if (!Array.isArray(items)) items = [];
            } catch (e) {
                items = [];
            }
        }
        
        debugLogger.info('📋 Extracted items array', { count: items.length, items });
        
        if (items.length === 0) {
            debugLogger.warn('⚠️ No items found in Gemini response');
            return [];
        }
        
        // Convert to Item format with inferred attributes
        const converted = items.map((item: any) => {
            const itemName = item.name || item.product || item.title || '';
            if (!itemName || itemName.length === 0) return null;

            const priceVal = typeof item.price === 'number' ? item.price : (parseFloat(item.price) || 9.99);
            const base = buildItemWithAttributes(itemName, priceVal);
            const mappedCategory = mapAiCategory(item.category, base.type);
            const merged: Item = {
                ...base,
                category: mappedCategory,
                price: priceVal,
                color: item.color || base.color,
                brand: item.brand || base.brand,
                importMeta: {
                    confidence: 0.9,
                    source: 'ai'
                }
            };
            if (item.size) merged.notes = `Size: ${item.size}`;
            if (item.image) merged.image = normalizeImageUrl(item.image);
            if (item.productUrl) merged.purchaseUrl = item.productUrl;
            return {
                ...merged
            } as Item;
        }).filter((item: Item | null) => item !== null);
        
        debugLogger.info('✅ Converted items', { count: converted.length, items: converted });
        debugLogger.info('🏁 === END GEMINI IDENTIFICATION ===');
        return converted as Item[];
        
    } catch (error) {
        debugLogger.error('❌ AI item identification failed', error);
        return [];
    }
}

/**
 * Search for product image on Amazon
 */
async function searchProductImage(productName: string, apiKey?: string, model?: string): Promise<ImageSearchResult | undefined> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'x-google-api-key': apiKey } : {}),
            },
            body: JSON.stringify({
                type: 'json',
                model: model || 'gemini-2.5-flash',
                prompt: `Find this product on Amazon and return JSON with just the image URL: "${productName}". Return only: {"image": "https://..."}. If not found, return {"image": null}`
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            debugLogger.warn('⚠️ Image search failed', { status: response.status, error: errorText });
            return undefined;
        }
        
        const data = await response.json();
        debugLogger.info('🖼️ Image search response', data);
        
        const image = normalizeImageUrl(data.image || data.recommendations?.[0]?.image);
        const productUrl = data.productUrl || data.url || data.recommendations?.[0]?.productUrl;
        if (!image && !productUrl) return undefined;
        return { image, productUrl };
    } catch (error) {
        console.warn('Image search failed:', error);
        return undefined;
    }
}

/**
 * Load PDF.js library from CDN
 */
function loadPDFJS(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as any).pdfjsLib) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            // Set worker path
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load PDF.js library'));
        document.head.appendChild(script);
    });
}

/**
 * Parse receipt text to extract items
 */
function parseReceiptText(text: string): ParsedItem[] {
    const items: ParsedItem[] = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    debugLogger.info('🔍 === PARSING RECEIPT TEXT ===');
    debugLogger.info('📊 Total lines', { count: lines.length });
    
    // Find ALL prices - prices are the most reliable anchor point
    const pricePattern = /\$\s*(\d+\.?\d*)/g;
    const priceLines: Array<{price: number, lineIndex: number}> = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pricePattern.test(line)) {
            const priceMatch = line.match(/\$\s*(\d+\.?\d*)/);
            if (priceMatch) {
                const price = parseFloat(priceMatch[1]);
                priceLines.push({price, lineIndex: i});
                debugLogger.debug(`💰 Found price $${price} at line ${i}`, { line });
            }
        }
    }
    
    debugLogger.info('💰 Total prices found', { count: priceLines.length });
    
    // For each price, look backward for the product name
    for (const {price, lineIndex} of priceLines) {
        // Skip very small/large prices (shipping, tax, totals)
        if (price < 0.5 || price > 500) {
            debugLogger.debug(`⏭️ Skipping price $${price} (too small/large)`);
            continue;
        }
        
        let productName = '';
        
        // Look backwards for the actual product name
        for (let j = lineIndex - 1; j >= Math.max(0, lineIndex - 10); j--) {
            const candidate = lines[j].trim();
            // Skip common non-product lines
            if (candidate.length > 5 && 
                !candidate.match(/^\d+\.\d{2}$/) && 
                !candidate.toLowerCase().includes('total') &&
                !candidate.toLowerCase().includes('tax') &&
                !candidate.toLowerCase().includes('shipping') &&
                !candidate.toLowerCase().includes('qty') &&
                !candidate.match(/^\d+$/) &&
                candidate.length < 200) {
                productName = candidate;
                debugLogger.debug(`📦 Found product`, { productName });
                break;
            }
        }
        
        if (productName) {
            const purchaseUrl = findNearbyAmazonUrl(lines, lineIndex);
            const item: ParsedItem = {
                name: cleanItemName(productName),
                price: price,
                quantity: 1,
                date: Date.now(),
                purchaseUrl
            };
            debugLogger.info(`✅ Adding item`, { name: item.name, price, purchaseUrl });
            items.push(item);
        }
    }
    
    debugLogger.info('🏁 === END PARSING ===', { totalItems: items.length });
    
    return items;
}

/**
 * Clean up item name
 */
function cleanItemName(name: string): string {
    return name
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-.,]/g, '')
        .trim()
        .substring(0, 100); // Limit length
}

function findNearbyAmazonUrl(lines: string[], priceLineIndex: number): string | undefined {
    const urlRegex = /(https?:\/\/\S*amazon\.com\S*)/i;
    const start = Math.max(0, priceLineIndex - 6);
    const end = Math.min(lines.length - 1, priceLineIndex + 6);

    for (let i = start; i <= end; i++) {
        const match = lines[i].match(urlRegex);
        if (match && match[1]) {
            const candidate = match[1].trim();
            debugLogger.debug('🔗 Found nearby Amazon URL', { line: i, url: candidate });
            return candidate.split(')')[0].split(']')[0];
        }
    }

    return undefined;
}

function mapAiCategory(raw: any, fallbackType: "clothing" | "makeup"): any {
    const normalized = typeof raw === 'string' ? raw.toLowerCase() : '';
    const allowed = ['top','bottom','dress','shoe','outerwear','accessory','legging','face','eye','lip','cheek','tool','other'];
    if (allowed.includes(normalized)) return normalized as any;
    return inferCategory('', fallbackType);
}

/**
 * Convert parsed item to Aura Item format
 */
function createItemFromParsed(parsed: ParsedItem): Item {
    const base = buildItemWithAttributes(parsed.name, parsed.price);
    return {
        ...base,
        dateAdded: parsed.date || Date.now(),
        purchaseUrl: parsed.purchaseUrl,
        importMeta: {
            confidence: 0.7,
            source: 'parsed'
        }
    };
}

function buildItemWithAttributes(name: string, price?: number): Item {
    const type = inferItemType(name);
    const category = inferCategory(name, type);
    const { color, size, brand } = inferAttributes(name);

    return {
        id: uuidv4(),
        name,
        type,
        category,
        price,
        color,
        brand,
        notes: size ? `Size: ${size}` : undefined,
        importMeta: {
            confidence: 0.75,
            source: 'ai'
        },
        dateAdded: Date.now()
    } as Item;
}

function inferAttributes(name: string): { color?: string; size?: string; brand?: string } {
    const nameLower = name.toLowerCase();

    const colors = ['black','white','red','blue','green','yellow','pink','purple','brown','beige','gray','grey','nude','ivory','orange'];
    const foundColor = colors.find(c => nameLower.includes(c));

    // Simple size extraction: common tokens or patterns like L/XL, XS, S, M, L, XL, XXL
    const sizeMatch = name.match(/\b(XXL|XL|L\/XL|L|M|S|XS|XXS|\d+[ -]?pack|\d+T|\d+W|\d+H)\b/i);
    const size = sizeMatch ? sizeMatch[1] : undefined;

    // Brand heuristic: first word token before a space or comma
    const brand = name.split(/[\s,]+/)[0];

    return { color: foundColor, size, brand };
}

/**
 * Infer if item is clothing or makeup based on name
 */
function inferItemType(name: string): "clothing" | "makeup" {
    const nameLower = name.toLowerCase();
    
    const makeupKeywords = [
        'makeup', 'cosmetic', 'lipstick', 'mascara', 'eyeshadow', 'foundation',
        'blush', 'powder', 'concealer', 'primer', 'highlighter', 'bronzer',
        'nail polish', 'eyeliner', 'lip gloss', 'lip balm',
        'skincare', 'moisturizer', 'serum', 'cleanser', 'toner',
        'perfume', 'fragrance', 'cologne',
        'brush set', 'makeup brush', 'beauty blender', 'sponge'
    ];
    
    const isBeauty = makeupKeywords.some(keyword => nameLower.includes(keyword));
    
    return isBeauty ? "makeup" : "clothing";
}

/**
 * Infer category based on item name and type
 */
function inferCategory(name: string, type: "clothing" | "makeup"): any {
    const nameLower = name.toLowerCase();
    
    if (type === "makeup") {
        if (nameLower.includes('lipstick') || nameLower.includes('lip gloss') || nameLower.includes('lip')) return 'lip';
        if (nameLower.includes('eyeshadow') || nameLower.includes('mascara') || nameLower.includes('eyeliner')) return 'eye';
        if (nameLower.includes('foundation') || nameLower.includes('concealer') || nameLower.includes('powder')) return 'face';
        if (nameLower.includes('blush') || nameLower.includes('bronzer') || nameLower.includes('highlighter')) return 'cheek';
        if (nameLower.includes('brush') || nameLower.includes('sponge') || nameLower.includes('applicator')) return 'tool';
        return 'face';
    }
    
    // Clothing categories
    if (nameLower.includes('dress')) return 'dress';
    if (nameLower.includes('skirt') || nameLower.includes('bottom') || nameLower.includes('pants') || nameLower.includes('jeans')) return 'bottom';
    if (nameLower.includes('top') || nameLower.includes('blouse') || nameLower.includes('shirt')) return 'top';
    if (nameLower.includes('shoe') || nameLower.includes('heel') || nameLower.includes('boot') || nameLower.includes('sandal')) return 'shoe';
    if (nameLower.includes('jacket') || nameLower.includes('coat') || nameLower.includes('sweater')) return 'outerwear';
    if (nameLower.includes('legging') || nameLower.includes('tights') || nameLower.includes('stockings')) return 'legging';
    if (nameLower.includes('accessories') || nameLower.includes('jewelry') || nameLower.includes('necklace') || 
        nameLower.includes('bracelet') || nameLower.includes('earring')) return 'accessory';
    
    return 'other';
}
