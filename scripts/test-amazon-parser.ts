
import fs from 'fs';
import path from 'path';
import { parseAmazonCSV } from '../src/utils/amazonParser';

// Mock File object since we are in Node.js environment
class MockFile {
    name: string;
    content: string;

    constructor(name: string, content: string) {
        this.name = name;
        this.content = content;
    }

    text(): Promise<string> {
        return Promise.resolve(this.content);
    }

    // PapaParse in the browser uses the File object directly, but in Node with our mock, 
    // we might need to adjust how we call it or mock the File API better.
    // However, the amazonParser uses Papa.parse(file, ...). 
    // PapaParse supports strings, files, etc.
    // Let's see if we can just pass the content as a string if we modify the parser, 
    // OR we can try to mock the File object enough for PapaParse.
    // Actually, looking at amazonParser.ts, it takes "File".
    // In Node, we can't easily create a browser File object.
    // But we can read the file content and pass it if we adjust the parser to accept string,
    // OR we can use a polyfill.
}

// To avoid changing source code just for this test, let's try to read the file and 
// see if we can pass a stream or string if the type allows, or cast it.
// The amazonParser.ts takes "File".
// Let's read the CSV content.
const csvPath = path.join(process.cwd(), 'test_amazon_orders.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// We need to mock the File object because the function expects it.
// But PapaParse handles the "File" object.
// A simple workaround for testing logic is to modify the parser to accept string or File,
// but I shouldn't modify app code just for a test script if I can avoid it.
// 
// Instead, I will create a temporary "unit test" that imports the logic.
// Wait, PapaParse in Node works differently.
// 
// Let's try to use a slightly different approach: 
// I will just manually parse the CSV here using the SAME logic as the component 
// to verify the *logic* itself, copying the critical parts, 
// OR I can try to run this in a way that supports the File API.
//
// Better yet, I'll use `jsdom` to simulate the browser environment if available,
// or just mock the necessary parts.

// Let's try to mock the File object.
global.File = class File {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    private content: string;

    constructor(parts: string[], name: string, options?: any) {
        this.name = name;
        this.content = parts[0];
        this.type = options?.type || '';
        this.size = this.content.length;
        this.lastModified = Date.now();
    }

    // PapaParse checks for specific properties/methods.
    slice() { return this; } // Mock slice
} as any;

async function runTest() {
    console.log("Starting Amazon Parser Test...");

    try {
        // We need to mock the File object properly for PapaParse
        const file = new File([csvContent], "test_amazon_orders.csv", { type: "text/csv" });

        // Now call the parser
        const items = await parseAmazonCSV(file);

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
