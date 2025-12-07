import Papa from "papaparse";
import { Item, Category } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface AmazonRow {
    "Order Date": string;
    "Order ID": string;
    "Title": string;
    "Category": string;
    "ASIN/ISBN": string;
    "UNSPSC Code": string;
    "Website": string;
    "Release Date": string;
    "Condition": string;
    "Seller": string;
    "Seller Credentials": string;
    "List Price Per Unit": string;
    "Purchase Price Per Unit": string;
    "Quantity": string;
    "Payment Instrument Type": string;
    "Purchase Order Number": string;
    "PO Line Number": string;
    "Ordering Customer Email": string;
    "Shipment Date": string;
    "Shipping Address Name": string;
    "Shipping Address Street 1": string;
    "Shipping Address Street 2": string;
    "Shipping Address City": string;
    "Shipping Address State": string;
    "Shipping Address Zip": string;
    "Order Status": string;
    "Carrier Name & Tracking Number": string;
    "Item Subtotal": string;
    "Item Subtotal Tax": string;
    "Item Total": string;
    "Tax Exemption Applied": string;
    "Tax Exemption Type": string;
    "Exemption Opt-Out": string;
    "Buyer Name": string;
    "Currency": string;
    "Group Name": string;
}

export const parseAmazonCSV = (file: File): Promise<Item[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as AmazonRow[];
                const items: Item[] = [];

                rows.forEach((row) => {
                    // Basic validation to ensure it's a valid row
                    if (!row["Title"] || !row["Order Date"]) return;

                    const title = row["Title"];
                    const priceStr = row["Item Total"]?.replace(/[^0-9.]/g, "") || "0";
                    const price = parseFloat(priceStr);
                    const dateStr = row["Order Date"];
                    const dateAdded = new Date(dateStr).getTime();

                        // Simple heuristic for categorization
                        let type: "clothing" | "makeup" = "clothing"; // Default
                        let category: Category = "other";
                        let confidence = 0.5;

                    const lowerTitle = title.toLowerCase();

                    // Makeup keywords
                    if (
                        lowerTitle.includes("lipstick") ||
                        lowerTitle.includes("mascara") ||
                        lowerTitle.includes("foundation") ||
                        lowerTitle.includes("eyeliner") ||
                        lowerTitle.includes("blush") ||
                        lowerTitle.includes("eyeshadow") ||
                        lowerTitle.includes("concealer") ||
                        lowerTitle.includes("powder") ||
                        lowerTitle.includes("makeup")
                    ) {
                        type = "makeup";
                        confidence = 0.95;
                        if (lowerTitle.includes("lipstick") || lowerTitle.includes("gloss")) category = "lip";
                        else if (lowerTitle.includes("mascara") || lowerTitle.includes("eyeliner") || lowerTitle.includes("shadow")) category = "eye";
                        else if (lowerTitle.includes("blush") || lowerTitle.includes("bronzer")) category = "cheek";
                        else if (lowerTitle.includes("foundation") || lowerTitle.includes("concealer")) category = "face";
                        else if (lowerTitle.includes("brush") || lowerTitle.includes("sponge")) category = "tool";
                    }
                    // Clothing keywords
                    else if (
                        lowerTitle.includes("dress") ||
                        lowerTitle.includes("skirt") ||
                        lowerTitle.includes("shirt") ||
                        lowerTitle.includes("top") ||
                        lowerTitle.includes("pants") ||
                        lowerTitle.includes("jeans") ||
                        lowerTitle.includes("coat") ||
                        lowerTitle.includes("jacket") ||
                        lowerTitle.includes("shoe") ||
                        lowerTitle.includes("boot") ||
                        lowerTitle.includes("sandal") ||
                        lowerTitle.includes("bra") ||
                        lowerTitle.includes("underwear")
                    ) {
                        type = "clothing";
                        confidence = 0.9;
                        if (lowerTitle.includes("dress")) category = "dress";
                        else if (lowerTitle.includes("skirt") || lowerTitle.includes("pants") || lowerTitle.includes("jeans")) category = "bottom";
                        else if (lowerTitle.includes("shirt") || lowerTitle.includes("top") || lowerTitle.includes("blouse")) category = "top";
                        else if (lowerTitle.includes("shoe") || lowerTitle.includes("boot") || lowerTitle.includes("sandal") || lowerTitle.includes("sneaker")) category = "shoe";
                        else if (lowerTitle.includes("coat") || lowerTitle.includes("jacket")) category = "outerwear";
                        else if (lowerTitle.includes("bra") || lowerTitle.includes("underwear") || lowerTitle.includes("sock")) category = "accessory";
                    } else {
                        // If it doesn't match known keywords, we might skip it or add as 'other'
                        // For now, let's add it as 'other' if it seems relevant, otherwise maybe skip?
                        // Let's include everything but mark as 'other' so user can decide.
                        // Actually, to avoid clutter, let's only include things that matched OR have generic keywords
                        if (!lowerTitle.includes("fashion") && !lowerTitle.includes("beauty")) {
                            return;
                        }
                    }

                    items.push({
                        id: uuidv4(),
                        name: title,
                        type,
                        category,
                        price,
                        dateAdded,
                        notes: `Imported from Amazon (Order: ${row["Order ID"]})`,
                        brand: row["Seller"] || "Amazon",
                        importMeta: { confidence },
                    });
                });

                resolve(items);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};
