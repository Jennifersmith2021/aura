export type Retailer = "amazon" | "sephora" | "ulta" | "target" | "walmart" | "etsy" | "adam-eve" | "other";

export interface RetailProduct {
    id: string;
    name: string;
    retailer: Retailer;
    category: string;
    price?: number;
    description?: string;
    url?: string;
    image?: string;
}

/**
 * Stub adapter that returns mock data. Replace implementation with real retailer API integration.
 * Example: implement separate adapters for Amazon, Sephora, etc., then route to them here.
 */
export async function searchRetailer(query: string, retailer: Retailer | null, category: string | null, page = 1, limit = 10): Promise<{ products: RetailProduct[]; total: number; page: number; limit: number }> {
    // Simple mock generation to match API shape
    const total = 42; // pretend there are 42 results
    const items = Array.from({ length: limit }).map((_, i) => {
        const idx = (page - 1) * limit + i + 1;
        return {
            id: `mock-${retailer || 'any'}-${idx}`,
            name: `${query} Example ${idx}`,
            retailer: (retailer || 'amazon') as Retailer,
            category: category || 'fashion',
            price: Number(((Math.random() * 100) + 10).toFixed(2)),
            description: `Mock description for ${query} #${idx}`,
            url: `https://example.com/product/${idx}`,
            image: `https://via.placeholder.com/400x400?text=${encodeURIComponent(query)}+${idx}`,
        } as RetailProduct;
    });

    return { products: items, total, page, limit };
}
