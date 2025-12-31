"use client";

import EnhancedWishlist from "@/components/EnhancedWishlist";
import { PageTransition } from "@/components/PageTransition";

export default function WishlistPage() {
    return (
        <PageTransition className="pb-24 pt-8 px-6">
            <EnhancedWishlist />
        </PageTransition>
    );
}
