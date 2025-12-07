import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env" });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

async function run() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        fs.writeFileSync("available_models.json", JSON.stringify(data, null, 2));
        console.log("Models written to available_models.json");
    } catch (error) {
        console.error("Network error:", error);
    }
}

run();
