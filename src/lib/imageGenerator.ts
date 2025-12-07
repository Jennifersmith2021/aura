import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateImage(prompt: string, options?: { provider?: string; storeMetadata?: boolean }) {
    const provider = options?.provider || process.env.IMAGE_PROVIDER || 'google';
    const imageModel = process.env.GOOGLE_IMAGE_MODEL;
    const apiKey = process.env.GOOGLE_API_KEY;

    let imageUrl: string | null = null;

    // Attempt to generate image from configured provider
    if (provider === 'google' && apiKey && imageModel) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: imageModel });
            // The SDK might not expose typed image generation in this environment —
            // use `any` here but keep linting narrow.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (model as any).generateImage === "function") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await (model as any).generateImage(prompt);
                const response = await result.response;
                imageUrl = response?.image || response?.uri || null;
            }
        } catch (err) {
            console.warn("Google image generation attempt failed:", err);
        }
    }

    // Fallback placeholder if generation failed
    if (!imageUrl) {
        imageUrl = `https://placehold.co/600x800/e11d48/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`;
    }

    // Optionally store metadata in Prisma (if DATABASE_URL is configured)
    if (options?.storeMetadata && process.env.DATABASE_URL) {
        try {
            // Dynamic import to avoid hard dependency if DB not configured
            const prismaModule = await import('@prisma/client');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const PrismaClient = (prismaModule as any).PrismaClient;
            const prisma = new PrismaClient();
            await prisma.generatedImage.create({
                data: {
                    prompt,
                    imageUrl,
                    provider,
                },
            });
            await prisma.$disconnect();
        } catch (err) {
            console.warn("Could not store image metadata:", err);
        }
    }

    return { image: imageUrl };
}
