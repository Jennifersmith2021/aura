import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        // Add a User-Agent to avoid being blocked by some sites
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Cache-Control": "max-age=0",
                "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "Referer": "https://www.google.com/"
            },
        });

        if (!response.ok) {
            console.error(`Fetch failed: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: "Failed to fetch URL" },
                { status: response.status }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Check for CAPTCHA
        const pageTitle = $("title").text().trim();
        if (pageTitle.includes("Robot Check") || pageTitle.includes("CAPTCHA")) {
            console.warn("Amazon CAPTCHA detected");
            return NextResponse.json({
                title: "Amazon Item (Verification Required)",
                image: "",
                description: "Please copy details manually - Amazon is blocking automated preview.",
                price: "",
                url,
                isBlocked: true
            });
        }

        // Specific selectors for Amazon
        const amazonTitle = $("#productTitle").text().trim() || $("#title").text().trim();
        const amazonImage =
            $("#landingImage").attr("src") ||
            $("#imgBlkFront").attr("src") ||
            $("#landingImage").attr("data-old-hires") ||
            $(".a-dynamic-image").first().attr("src");

        // Price allows for ranges and different blocks
        const amazonPrice =
            $(".a-price .a-offscreen").first().text().trim() ||
            $("#priceblock_ourprice").text().trim() ||
            $("#priceblock_dealprice").text().trim();

        const title =
            amazonTitle ||
            $('meta[property="og:title"]').attr("content") ||
            pageTitle ||
            "Unknown Item";

        const image =
            amazonImage ||
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            "";

        const description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="description"]').attr("content") ||
            "";

        return NextResponse.json({
            title: title.trim(),
            image,
            description: description.trim(),
            price: amazonPrice,
            url,
        });
    } catch (error) {
        console.error("Preview Error:", error);
        return NextResponse.json(
            { error: "Failed to parse URL" },
            { status: 500 }
        );
    }
}
