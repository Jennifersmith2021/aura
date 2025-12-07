
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

// We need to replicate the logic from amazonParser.ts since we can't easily import TS in JS without compilation
// and the original file imports types.
// So I will copy the core logic here for verification.

const parseAmazonCSV = (fileContent) => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;
                const items = [];

                rows.forEach((row) => {
                    // Basic validation to ensure it's a valid row
                    if (!row["Title"] || !row["Order Date"]) return;

                    const title = row["Title"];
                    const priceStr = row["Item Total"]?.replace(/[^0-9.]/g, "") || "0";
                    const price = parseFloat(priceStr);
                    const dateStr = row["Order Date"];
                    const dateAdded = new Date(dateStr).getTime();

                    // Simple heuristic for categorization
                    let type = "clothing"; // Default
                    let category = "other";

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
                            // Maybe too restrictive. Let's include all for now and let user filter?
                            // No, Amazon history has EVERYTHING (batteries, books, etc).
                            // We should probably be strict.
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

async function runTest() {
    console.log("Starting Amazon Parser Test (JS)...");

    try {
        const csvPath = path.join(process.cwd(), 'test_amazon_orders.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // Now call the parser with string content directly (since we modified it to accept string for this test)
        const items = await parseAmazonCSV(csvContent);

        console.log(`Parsed ${items.length} items.`);

        // Assertions
        const makeup = items.find(i => i.category === 'eye' || i.type === 'makeup');
        const clothing = items.find(i => i.type === 'clothing');

        if (makeup && makeup.name.includes("Mascara")) {
            console.log("SUCCESS: Found Mascara (Makeup)");
        } else {
            console.error("FAILURE: Did not find Mascara");
        }

        if (clothing && clothing.name.includes("T-Shirt")) {
            console.log("SUCCESS: Found T-Shirt (Clothing)");
        } else {
            console.error("FAILURE: Did not find T-Shirt");
        }

        if (items.length >= 2) {
            console.log("SUCCESS: Parsed expected number of items.");
        } else {
            console.error(`FAILURE: Expected at least 2 items, got ${items.length}`);
        }

    } catch (error) {
        console.error("Test Failed with error:", error);
    }
}

runTest();
