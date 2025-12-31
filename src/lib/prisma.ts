import * as PrismaPkg from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrismaClient = (PrismaPkg as unknown as any).PrismaClient as new (...args: any[]) => any;

const prismaClientSingleton = () => {
    return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
