import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

/**
 * Universal data sync endpoint
 * Syncs all user data (items, measurements, goals, supplements, workouts, etc.) to database
 * Used by SessionSync component on login
 */

type SyncPayload = Record<string, any>;

const DATA_TYPES = [
    "items",
    "looks",
    "measurements",
    "timeline",
    "routines",
    "supplements",
    "workoutPlans",
    "workoutSessions",
    "affirmations",
    "progressPhotos",
    "challenges",
    "achievements",
    "chastitySessions",
    "corsetSessions",
    "arousalLogs",
    "toyCollection",
    "intimacyJournal",
    "skincareProducts"
];

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prisma } = await import("@/lib/prisma");
        const userId = session.user.id;

        const body = await request.json() as SyncPayload;

        const results: Record<string, any> = {};
        let totalSynced = 0;

        // Sync items (primary data type with database support)
        const items = body.items || [];
        results.items = 0;

        for (const it of items) {
            const existing = await prisma.item.findUnique({ where: { id: it.id } });
            if (existing && existing.userId && existing.userId !== userId) {
                continue; // Skip items belonging to other users
            }

            await prisma.item.upsert({
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
            results.items++;
            totalSynced++;
        }

        // For other data types, store as JSON in user's sync metadata
        // This allows syncing without needing full database schema for each type
        const metadataSync: Record<string, any> = {};

        for (const dataType of DATA_TYPES) {
            if (dataType === "items") continue; // Already handled

            const data = body[dataType];
            if (Array.isArray(data) && data.length > 0) {
                metadataSync[dataType] = data;
                results[dataType] = data.length;
                totalSynced += data.length;
            }
        }

        // Store metadata sync
        if (Object.keys(metadataSync).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    metadata: metadataSync
                }
            });
        }

        return NextResponse.json({
            synced: totalSynced,
            results,
            dataTypes: Object.keys(results),
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
        const userId = session.user.id;

        const items = await prisma.item.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        // Get user metadata with synced data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { metadata: true }
        });

        const response: Record<string, any> = {
            items,
            timestamp: new Date().toISOString(),
            count: items.length
        };

        // Include synced metadata
        if (user?.metadata) {
            Object.assign(response, user.metadata);
        }

        return NextResponse.json(response);
    } catch (err) {
        console.error("Sync GET error:", err);
        return NextResponse.json({
            items: [],
            error: "Could not retrieve data",
            timestamp: new Date().toISOString()
        });
    }
}
