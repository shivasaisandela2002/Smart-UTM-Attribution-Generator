import { PrismaClient } from '@prisma/client';
import { UTMParameters } from './utmUtils';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface SavedLink extends UTMParameters {
  id: string;
  fullUrl: string;
  createdAt: string;
  shortId: string;
  clicks: number;
}

export async function getLinks(): Promise<SavedLink[]> {
  const links = await prisma.savedLink.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return links.map(link => ({
    ...link,
    createdAt: link.createdAt.toISOString()
  }));
}

export async function saveLink(linkData: Omit<SavedLink, 'id' | 'createdAt' | 'shortId' | 'clicks'>): Promise<SavedLink> {
  const shortId = Math.random().toString(36).substring(2, 8);
  
  const link = await prisma.savedLink.create({
    data: {
      baseUrl: linkData.baseUrl,
      source: linkData.source || null,
      medium: linkData.medium || null,
      campaign: linkData.campaign || null,
      term: linkData.term || null,
      content: linkData.content || null,
      fullUrl: linkData.fullUrl,
      shortId: shortId,
      clicks: 0
    }
  });

  return {
    ...link,
    createdAt: link.createdAt.toISOString()
  } as SavedLink;
}

export async function incrementClick(shortId: string): Promise<string | null> {
  try {
    const link = await prisma.savedLink.update({
      where: { shortId },
      data: { clicks: { increment: 1 } }
    });
    return link.fullUrl;
  } catch (error) {
    console.error("Error incrementing click:", error);
    return null;
  }
}

