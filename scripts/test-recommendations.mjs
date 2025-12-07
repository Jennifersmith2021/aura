import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Mock inventory
const mockInventory = [
    { name: "Black Silk Slip Dress", type: "clothing", category: "dress" },
    { name: "Oversized Denim Jacket", type: "clothing", category: "outerwear" },
    { name: "Red Matte Lipstick", type: "makeup", category: "lip" },
    { name: "White Tennis Shoes", type: "clothing", category: "shoe" }
];

async function testEndpoint() {
    console.log("Testing Shopping Recommendations API...");

    // Note: This requires the Next.js server to be running on localhost:3000
    // If not running, we can't test the route directly from a script without mocking Request/Response objects,
    // which is complex. Instead, we'll try to fetch against localhost.

    try {
        const response = await fetch("http://localhost:3000/api/gemini", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Passing key if needed, though route should have it env
            },
            body: JSON.stringify({
                type: "json",
                context: mockInventory
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        console.log("--- SUCCESS ---");
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("--- FAILED ---");
        console.error(error.message);
        console.log("Ensure the Next.js server is running (npm run dev)");
    }
}

testEndpoint();
