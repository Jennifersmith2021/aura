import { NextResponse } from "next/server";
import { Item as ClientItem } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { prisma } = await import("@/lib/prisma");

        const body = await request.json();
        const items: ClientItem[] = body.items || [];
        // ... (rest is same, but I need to include it in replacement or careful range)

        const results: Array<Record<string, unknown>> = [];

        for (const it of items) {
            // Map client Item -> Prisma Item model fields
            const upsert = await prisma.item.upsert({
                where: { id: it.id },
                update: {
                    name: it.name,
                    category: it.category || "other",
                    brand: it.brand || null,
                    price: it.price || null,
                    image: it.image || null,
                    notes: it.notes || null,
                    updatedAt: new Date(),
                },
                create: {
                    id: it.id,
                    name: it.name,
                    category: it.category || "other",
                    brand: it.brand || null,
                    price: it.price || null,
                    image: it.image || null,
                    notes: it.notes || null,
                    tags: [],
                },
            });
            results.push(upsert);
        }

        return NextResponse.json({ synced: results.length, results });
    } catch (err) {
        console.error("Sync API error:", err);
        return NextResponse.json({ error: "Failed to sync items" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { prisma } = await import("@/lib/prisma");
        const items = await prisma.item.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json({ items });
    } catch (err) {
        console.error("Sync GET error:", err);
        // If DB is not reachable, return 500 but don't break build
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }
}

