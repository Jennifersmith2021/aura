import { Item } from "@/types";

const SHELF_LIFE_DAYS: Record<string, number> = {
    face: 365, // Foundation/Powder: 1 year
    eye: 90,   // Mascara/Liner: 3 months
    lip: 365,  // Lipstick: 1 year
    cheek: 365 * 2, // Blush: 2 years
    tool: 365 * 5, // Brushes: 5 years
    other: 365,
};

export function getExpirationStatus(item: Item): "good" | "warning" | "expired" {
    if (item.type !== "makeup" || !item.dateOpened) return "good";

    const shelfLife = (SHELF_LIFE_DAYS[item.category] || 365) * 24 * 60 * 60 * 1000;
    const age = Date.now() - item.dateOpened;
    const remaining = shelfLife - age;

    if (remaining < 0) return "expired";
    if (remaining < 1000 * 60 * 60 * 24 * 30) return "warning"; // Less than 30 days left
    return "good";
}

export function getDaysRemaining(item: Item): number {
    if (item.type !== "makeup" || !item.dateOpened) return 365;
    const shelfLife = (SHELF_LIFE_DAYS[item.category] || 365) * 24 * 60 * 60 * 1000;
    const age = Date.now() - item.dateOpened;
    return Math.ceil((shelfLife - age) / (1000 * 60 * 60 * 24));
}
