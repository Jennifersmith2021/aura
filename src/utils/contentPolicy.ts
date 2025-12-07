// Minimal content policy helpers for adult content consent
export const ADULT_CONSENT_KEY = "aura_adult_consent";

export function hasAdultConsent(): boolean {
    try {
        if (typeof window === "undefined") return false;
        const v = localStorage.getItem(ADULT_CONSENT_KEY);
        return v === "true";
    } catch {
        return false;
    }
}

export function setAdultConsent(value: boolean) {
    try {
        if (typeof window === "undefined") return;
        localStorage.setItem(ADULT_CONSENT_KEY, value ? "true" : "false");
    } catch {
        // noop
    }
}

export function isAdultCategory(cat: string | undefined | null): boolean {
    return !!cat && cat.toLowerCase() === "adult";
}
