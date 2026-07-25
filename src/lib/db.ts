import fs from 'fs/promises';
import path from 'path';
import { UTMParameters } from './utmUtils';

export interface SavedLink extends UTMParameters {
  id: string;
  fullUrl: string;
  createdAt: string;
  shortId: string;
  clicks: number;
}

const dataFilePath = path.join(process.cwd(), 'data.json');

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify([]));
  }
}

export async function getLinks(): Promise<SavedLink[]> {
  await ensureDataFile();
  const data = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(data) as SavedLink[];
}

export async function saveLink(linkData: Omit<SavedLink, 'id' | 'createdAt' | 'shortId' | 'clicks'>): Promise<SavedLink> {
  const links = await getLinks();
  // Generate a random 6-character string for the short ID
  const shortId = Math.random().toString(36).substring(2, 8);
  const newLink: SavedLink = {
    ...linkData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    shortId,
    clicks: 0,
  };
  links.unshift(newLink); // add to top
  await fs.writeFile(dataFilePath, JSON.stringify(links, null, 2));
  return newLink;
}

export async function incrementClick(shortId: string): Promise<string | null> {
  const links = await getLinks();
  const linkIndex = links.findIndex(l => l.shortId === shortId);
  
  if (linkIndex === -1) return null;
  
  links[linkIndex].clicks += 1;
  await fs.writeFile(dataFilePath, JSON.stringify(links, null, 2));
  
  return links[linkIndex].fullUrl;
}
