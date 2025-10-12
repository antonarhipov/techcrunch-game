/**
 * Content Pack Loader
 * Handles loading, parsing, and caching of content packs
 */

import type { ContentPack } from "@/types/game";
import { validateContentPack, formatValidationErrors } from "./content-validator";

// In-memory cache for loaded packs
const packCache = new Map<string, ContentPack>();

/**
 * Load content pack from URL
 * @param url - Full URL to content pack JSON
 * @returns Parsed and validated content pack
 */
export async function loadContentPackFromUrl(url: string): Promise<ContentPack> {
  // Check cache first
  if (packCache.has(url)) {
    return packCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pack: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate the pack
    const validationResult = validateContentPack(data);
    
    if (!validationResult.valid) {
      throw new Error(formatValidationErrors(validationResult));
    }

    // Cache the pack
    packCache.set(url, data);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to load content pack from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load content pack from file path
 * In browser context, this loads from the public folder
 * @param packId - Pack identifier (e.g., "ai-cofounder-v1")
 * @returns Parsed and validated content pack
 */
export async function loadContentPackFromFile(packId: string): Promise<ContentPack> {
  const cacheKey = `file:${packId}`;
  
  // Check cache first
  if (packCache.has(cacheKey)) {
    return packCache.get(cacheKey)!;
  }

  // Try different extensions in order
  const extensions = [".json", ".yaml", ".yml"];
  
  for (const ext of extensions) {
    const url = `/content/${packId}${ext}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        continue; // Try next extension
      }

      let data: any;
      
      if (ext === ".json") {
        data = await response.json();
      } else {
        // YAML support would require js-yaml library
        // For now, throw error if YAML is encountered
        throw new Error("YAML support not yet implemented. Use JSON format.");
      }

      // Validate the pack
      const validationResult = validateContentPack(data);
      
      if (!validationResult.valid) {
        throw new Error(formatValidationErrors(validationResult));
      }

      // Cache the pack
      packCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes("YAML")) {
        throw error; // Re-throw YAML errors
      }
      // Continue trying other extensions
    }
  }

  throw new Error(`Failed to load content pack "${packId}" - no valid file found`);
}

/**
 * Load content pack from string data
 * @param data - String content (JSON or YAML)
 * @param format - Data format
 * @returns Parsed and validated content pack
 */
export function loadContentPackFromString(
  data: string,
  format: "json" | "yaml"
): ContentPack {
  try {
    let parsed: any;

    if (format === "json") {
      parsed = JSON.parse(data);
    } else {
      throw new Error("YAML support not yet implemented. Use JSON format.");
    }

    // Validate the pack
    const validationResult = validateContentPack(parsed);
    
    if (!validationResult.valid) {
      throw new Error(formatValidationErrors(validationResult));
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse content pack: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load content pack (auto-detect source)
 * @param packIdOrUrl - Pack ID or full URL
 * @returns Parsed and validated content pack
 */
export async function loadContentPack(packIdOrUrl: string): Promise<ContentPack> {
  // Detect if it's a URL
  if (packIdOrUrl.startsWith("http://") || packIdOrUrl.startsWith("https://")) {
    return loadContentPackFromUrl(packIdOrUrl);
  }

  // Otherwise treat as pack ID
  return loadContentPackFromFile(packIdOrUrl);
}

/**
 * Get default content pack
 * This is a fallback when no pack is specified or loading fails
 */
export async function getDefaultContentPack(): Promise<ContentPack> {
  try {
    return await loadContentPackFromFile("ai-cofounder-v1");
  } catch (error) {
    console.error("Failed to load default content pack:", error);
    
    // Last resort: return inline default pack
    return getInlineDefaultPack();
  }
}

/**
 * Load content pack with fallback to default
 * @param packIdOrUrl - Pack ID or URL to load
 * @returns Content pack (default if load fails)
 */
export async function loadContentPackWithFallback(
  packIdOrUrl?: string
): Promise<ContentPack> {
  if (!packIdOrUrl) {
    return getDefaultContentPack();
  }

  try {
    return await loadContentPack(packIdOrUrl);
  } catch (error) {
    console.error(`Failed to load pack "${packIdOrUrl}", falling back to default:`, error);
    return getDefaultContentPack();
  }
}

/**
 * Clear pack cache
 */
export function clearPackCache(): void {
  packCache.clear();
}

/**
 * Get cached pack IDs
 */
export function getCachedPackIds(): string[] {
  return Array.from(packCache.keys());
}

/**
 * Inline default pack (used as last resort fallback)
 */
export function getInlineDefaultPack(): ContentPack {
  // Import the default pack from default-pack.ts
  // Dynamic import not needed here as it's synchronous fallback
  const { DEFAULT_CONTENT_PACK } = require("./default-pack");
  return DEFAULT_CONTENT_PACK;
}

