export const QUOTES = [
    "Beauty begins the moment you decide to be yourself.",
    "You are allowed to take up space. You are allowed to shine.",
    "The most beautiful thing you can wear is confidence.",
    "Your journey is valid, your progress is real.",
    "Bloom where you are planted, but don't be afraid to transplant yourself to better soil.",
    "Self-care is how you take your power back.",
    "You are a work of art in progress.",
    "Every step forward is a victory, no matter how small.",
    "Your authenticity is your magic.",
    "There is no wrong way to be a woman.",
    "Celebrate every version of yourself.",
    "You deserve to feel comfortable in your own skin.",
    "Radiate kindness, starting with yourself.",
    "Today is a perfect day to love who you are becoming.",
    "Style is a way to say who you are without having to speak.",
    // MTF & Love Inspirations
    "The woman you are becoming is already within you, waiting to be loved.",
    "Your femininity is a gift, not something you need to earn.",
    "True love sees the soul first, and your soul is beautiful.",
    "Patience is the path to the love you deserve. Don't settle.",
    "You are worthy of a love that celebrates every part of your journey.",
    "The right man will cherish the woman you are and the woman you are becoming.",
    "Your softness is your strength.",
    "Every step towards your true self is a step towards true love.",
    "Beauty is not just what you see, it's who you are.",
    "You are a masterpiece in motion.",
    "Let your heart remain open; the right love is seeking you too.",
    "Grace is found in the courage to be yourself.",
    "You don't need to change to be loved; you need to be loved for who you are.",
    "Your existence is valid, your beauty is real, and your love is destined.",
    "Walk with your head high; you are royalty in your own story.",
    "The right partner will love your transition as much as you do.",
    "Blossoming takes time, and so does finding the perfect gardener.",
    "Your heart knows the way; trust it to lead you to him.",
    "You are deserving of flowers, romance, and a love that stays.",
];

export function getDailyQuote(): string {
    const date = new Date();
    // Use the day of the year to select a quote so it rotates daily
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return QUOTES[dayOfYear % QUOTES.length];
}
