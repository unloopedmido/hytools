import { Router } from "express";
import Chalk from "chalk";
import NBT from 'prismarine-nbt';
import type { Auction, AuctionCache } from "../types/auction";

const App = Router();

// Simplified cache structure
const cache = {
  raw: { data: [] as Auction[], timestamp: new Date(0) } as AuctionCache,
  parsed: { data: [] as Auction[], timestamp: new Date(0) } as AuctionCache
};

// Cache for already parsed item tags
const itemTagCache = new Map<string, string>();

interface HypixelResponse {
  totalAuctions: number;
  auctions: Auction[];
  totalPages: number;
}

// Fetch a single page of auctions
async function fetchPage(page: number): Promise<HypixelResponse> {
  const response = await fetch(
    `https://api.hypixel.net/skyblock/auctions?page=${page}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${page}: ${response.status}`);
  }

  return await response.json() as HypixelResponse;
}

// Fetch all auctions with caching
async function fetchAllAuctions(): Promise<Auction[]> {
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  const BACKGROUND_REFRESH_TTL = 5 * 60 * 1000; // 5 minutes

  const cacheAge = Date.now() - cache.raw.timestamp.getTime();

  // If cache is fresh, use it
  if (cache.raw.data.length > 0 && cacheAge <= CACHE_TTL) {
    console.log(Chalk.green(`[INFO]`), `Using cached auctions (${Math.round(cacheAge / 1000)}s old)`);

    // Start background refresh if cache is getting old
    if (cacheAge >= BACKGROUND_REFRESH_TTL) {
      console.log(Chalk.yellow(`[INFO]`), `Starting background refresh`);
      setTimeout(() => {
        fetchAllAuctionsFromAPI().catch(err => {
          console.error(Chalk.red(`[ERROR]`), `Background refresh failed:`, err);
        });
      }, 0);
    }

    return cache.raw.data;
  }

  return fetchAllAuctionsFromAPI();
}

// Internal function to fetch from API
async function fetchAllAuctionsFromAPI(): Promise<Auction[]> {
  console.log(Chalk.yellow(`[INFO]`), `Fetching fresh auctions...`);

  try {
    // Fetch first page to get total pages
    const { totalPages, auctions } = await fetchPage(0);
    const allAuctions = [...auctions];

    // Fetch remaining pages concurrently
    const pagePromises = Array.from(
      { length: totalPages - 1 },
      async (_, i) => {
        try {
          const { auctions } = await fetchPage(i + 1);
          console.log(Chalk.yellow(`[INFO]`), `Fetched page ${i + 1}`);
          return auctions;
        } catch (error) {
          console.error(Chalk.red(`[ERROR]`), `Failed to fetch page ${i + 1}:`, error);
          return [];
        }
      }
    );

    const results = await Promise.all(pagePromises);
    results.forEach(pageAuctions => allAuctions.push(...pageAuctions));

    console.log(Chalk.green(`[INFO]`), `Fetched ${allAuctions.length} auctions`);

    // Update cache
    cache.raw = {
      data: allAuctions,
      timestamp: new Date()
    };

    return allAuctions;
  } catch (error) {
    console.error(Chalk.red(`[ERROR]`), `Failed to fetch auctions:`, error);

    // Fall back to cached data if available
    if (cache.raw.data.length > 0) {
      console.log(Chalk.yellow(`[INFO]`), `Using expired cache due to fetch error`);
      return cache.raw.data;
    }

    throw error;
  }
}

// Parse NBT tag from base64 item data
async function parseTag(itemBytes: string): Promise<string | null> {
  // Check item tag cache first
  if (itemTagCache.has(itemBytes)) {
    return itemTagCache.get(itemBytes) || null;
  }

  try {
    const buffer = Buffer.from(itemBytes, "base64");
    const nbtData = await NBT.parse(buffer);

    // Extract the item ID from NBT data
    // @ts-expect-error TS doesn't know the structure of the parsed data
    const nbtValue = nbtData.parsed.value.i?.value?.value;
    const tag = nbtValue?.[0]?.tag?.value?.ExtraAttributes?.value?.id?.value;

    if (tag) {
      // Cache the result
      itemTagCache.set(itemBytes, tag);
      return tag;
    }

    return null;
  } catch (error) {
    console.error(Chalk.red(`[ERROR]`), `Failed to parse tag:`, error);
    return null;
  }
}

// Main endpoint
App.get("/", async (req, res) => {
  try {
    const PARSE_CACHE_TTL = 3 * 60 * 1000; // 3 minutes
    const parsedCacheAge = Date.now() - cache.parsed.timestamp.getTime();

    // Return cached parsed auctions if fresh
    if (cache.parsed.data.length > 0 && parsedCacheAge <= PARSE_CACHE_TTL) {
      console.log(Chalk.green(`[INFO]`), `Using cached parsed auctions (${Math.round(parsedCacheAge / 1000)}s old)`);
      res.json({
        totalAuctions: cache.parsed.data.length,
        auctions: cache.parsed.data
      });
    }

    console.time('fetching-and-parsing');

    // Get auctions (either from cache or fresh)
    const auctions = await fetchAllAuctions();
    console.log(Chalk.blue(`[INFO]`), `Parsing ${auctions.length} auction tags...`);

    // Clone to avoid modifying the cache
    const clonedAuctions: Auction[] = JSON.parse(JSON.stringify(auctions));

    // Process in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < clonedAuctions.length; i += BATCH_SIZE) {
      const batch = clonedAuctions.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (auction: Auction) => {
          if (!auction.item_tag && auction.item_bytes) {
            auction.item_tag = await parseTag(auction.item_bytes);
          }
        })
      );

      // Log progress
      if (i % 1000 === 0 && i > 0) {
        console.log(Chalk.blue(`[INFO]`), `Parsed ${i}/${clonedAuctions.length} auctions...`);
      }
    }

    // Update parsed cache
    cache.parsed = {
      data: clonedAuctions,
      timestamp: new Date()
    };

    console.timeEnd('fetching-and-parsing');

    res.json({
      totalAuctions: clonedAuctions.length,
      auctions: clonedAuctions
    });
  } catch (error) {
    console.error(Chalk.red(`[ERROR]`), `Error processing request:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default App;
