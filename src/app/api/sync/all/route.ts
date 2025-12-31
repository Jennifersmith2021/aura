import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

/**
 * Universal data sync endpoint
 * Syncs all user data (items, measurements, goals, etc.) to database
 * Used by SessionSync component on login
 */

type SyncPayload = Record<string, any>;

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prisma } = await import("@/lib/prisma");
        const userId = session.user.id;

        const body = await request.json() as SyncPayload;

        // For now, we sync all items. In the future, expand to sync other data types
        const items = body.items || [];

        const results: Array<Record<string, unknown>> = [];

        for (const it of items) {
            const existing = await prisma.item.findUnique({ where: { id: it.id } });
            if (existing && existing.userId && existing.userId !== userId) {
                continue; // Skip items belonging to other users
            }

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

        return NextResponse.json({ 
            synced: results.length, 
            results,
            timestamp: new Date().toISOString() 
        });
    } catch (err) {
        console.error("Sync API error:", err);
        return NextResponse.json({ error: "Failed to sync data" }, { status: 500 });
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

        return NextResponse.json({ 
            items,
            timestamp: new Date().toISOString(),
            count: items.length 
        });
    } catch (err) {
        console.error("Sync GET error:", err);
        return NextResponse.json({ 
            items: [],
            error: "Could not retrieve items",
            timestamp: new Date().toISOString() 
        });
    }
}
