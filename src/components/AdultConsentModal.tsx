"use client";

import { setAdultConsent } from "@/utils/contentPolicy";

interface AdultConsentModalProps {
    open: boolean;
    onClose: () => void;
}

export function AdultConsentModal({ open, onClose }: AdultConsentModalProps) {
    const handleAccept = () => {
        setAdultConsent(true);
        onClose();
    };

    const handleDecline = () => {
        setAdultConsent(false);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-2">Age Confirmation & Content Consent</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    This category contains adult products. You must be 18+ to view adult items. By continuing you confirm you are at least 18 years old and consent to view adult content.
                </p>
                <div className="flex gap-2 justify-end">
                    <button onClick={handleDecline} className="px-4 py-2 rounded bg-muted">
                        Decline
                    </button>
                    <button onClick={handleAccept} className="px-4 py-2 rounded bg-rose-500 text-white">
                        I am 18+ — Show content
                    </button>
                </div>
            </div>
        </div>
    );
}
