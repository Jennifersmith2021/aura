import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Item as ClientItem } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prisma } = await import("@/lib/prisma");

        const body = await request.json();
        const items: ClientItem[] = body.items || [];
        // ... (rest is same, but I need to include it in replacement or careful range)

        const results: Array<Record<string, unknown>> = [];
        const userId = session.user.id;

        for (const it of items) {
            const existing = await prisma.item.findUnique({ where: { id: it.id } });
            if (existing && existing.userId && existing.userId !== userId) {
                // Skip items that belong to another user to avoid collisions
                continue;
            }
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
                    userId,
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
                    userId,
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
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prisma } = await import("@/lib/prisma");
        const items = await prisma.item.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ items });
    } catch (err) {
        console.error("Sync GET error:", err);
        // If DB is not reachable, return 500 but don't break build
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }
}

