/**
 * Content Pack Manager
 * Manages multiple content packs with hot-swapping capabilities
 */

import type { ContentPack } from "@/types/game";
import {
  loadContentPackFromUrl,
  loadContentPackFromString,
  loadContentPack,
  getDefaultContentPack,
} from "./content-loader";

/**
 * Load history entry for debugging
 */
export interface LoadHistoryEntry {
  packId: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

/**
 * Content Pack Manager (Singleton)
 */
class PackManager {
  private static instance: PackManager | null = null;
  
  private loadedPacks: Map<string, ContentPack> = new Map();
  private activePack: ContentPack | null = null;
  private loadHistory: LoadHistoryEntry[] = [];
  private devMode: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PackManager {
    if (!PackManager.instance) {
      PackManager.instance = new PackManager();
    }
    return PackManager.instance;
  }

  /**
   * Load pack from URL
   * @param url - URL to content pack
   * @returns Loaded content pack
   */
  async loadPackFromUrl(url: string): Promise<ContentPack> {
    const startTime = new Date().toISOString();
    
    try {
      const pack = await loadContentPackFromUrl(url);
      
      this.loadedPacks.set(pack.id, pack);
      this.activePack = pack;
      
      this.loadHistory.push({
        packId: pack.id,
        timestamp: startTime,
        success: true,
      });
      
      return pack;
    } catch (error) {
      this.loadHistory.push({
        packId: url,
        timestamp: startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  /**
   * Load pack from string data
   * @param data - String content (JSON or YAML)
   * @param format - Data format
   * @returns Loaded content pack
   */
  loadPackFromString(data: string, format: "json" | "yaml" = "json"): ContentPack {
    const startTime = new Date().toISOString();
    
    try {
      const pack = loadContentPackFromString(data, format);
      
      this.loadedPacks.set(pack.id, pack);
      this.activePack = pack;
      
      this.loadHistory.push({
        packId: pack.id,
        timestamp: startTime,
        success: true,
      });
      
      return pack;
    } catch (error) {
      this.loadHistory.push({
        packId: "string-data",
        timestamp: startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  /**
   * Switch to a different pack (must be already loaded)
   * @param packId - ID of pack to switch to
   * @returns The switched-to pack
   */
  async switchToPack(packId: string): Promise<ContentPack> {
    // Check if pack is already loaded
    if (this.loadedPacks.has(packId)) {
      this.activePack = this.loadedPacks.get(packId)!;
      return this.activePack;
    }

    // Try to load the pack
    try {
      const pack = await loadContentPack(packId);
      this.loadedPacks.set(pack.id, pack);
      this.activePack = pack;
      return pack;
    } catch (error) {
      throw new Error(`Failed to switch to pack "${packId}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get currently active pack
   * @returns Active pack or null if none loaded
   */
  getActivePack(): ContentPack | null {
    return this.activePack;
  }

  /**
   * Get active pack or load default
   * @returns Active or default pack
   */
  async getActivePackOrDefault(): Promise<ContentPack> {
    if (this.activePack) {
      return this.activePack;
    }

    const defaultPack = await getDefaultContentPack();
    this.activePack = defaultPack;
    this.loadedPacks.set(defaultPack.id, defaultPack);
    
    return defaultPack;
  }

  /**
   * List all loaded pack IDs
   * @returns Array of pack IDs
   */
  listLoadedPacks(): string[] {
    return Array.from(this.loadedPacks.keys());
  }

  /**
   * Get load history for debugging
   * @returns Array of load history entries
   */
  getLoadHistory(): LoadHistoryEntry[] {
    return [...this.loadHistory];
  }

  /**
   * Get specific loaded pack
   * @param packId - Pack ID to retrieve
   * @returns Pack or undefined
   */
  getLoadedPack(packId: string): ContentPack | undefined {
    return this.loadedPacks.get(packId);
  }

  /**
   * Load pack with version support
   * Parses ?pack=ai-cofounder&version=1.2.0 format
   * @param packId - Pack ID
   * @param version - Optional version
   * @returns Loaded pack
   */
  async loadPackWithVersion(packId: string, version?: string): Promise<ContentPack> {
    const fullId = version ? `${packId}-v${version}` : packId;
    return this.switchToPack(fullId);
  }

  /**
   * Parse pack parameters from URL
   * @param searchParams - URL search params
   * @returns Pack ID and version (if specified)
   */
  parsePackParams(searchParams: URLSearchParams): {
    packId?: string;
    version?: string;
  } {
    const packId = searchParams.get("pack") || undefined;
    const version = searchParams.get("version") || undefined;
    
    return { packId, version };
  }

  /**
   * Enable/disable dev mode
   * Dev mode enables additional debugging features
   * @param enabled - Whether to enable dev mode
   */
  enableDevMode(enabled: boolean): void {
    this.devMode = enabled;
    
    if (enabled) {
      console.log("[PackManager] Dev mode enabled");
      console.log("[PackManager] Loaded packs:", this.listLoadedPacks());
      console.log("[PackManager] Active pack:", this.activePack?.id);
    }
  }

  /**
   * Check if dev mode is enabled
   * @returns True if dev mode is active
   */
  isDevMode(): boolean {
    return this.devMode;
  }

  /**
   * Clear all loaded packs (except active)
   */
  clearCache(): void {
    const activePackId = this.activePack?.id;
    
    this.loadedPacks.clear();
    
    // Re-add active pack if it exists
    if (this.activePack && activePackId) {
      this.loadedPacks.set(activePackId, this.activePack);
    }
  }

  /**
   * Reset manager to initial state
   */
  reset(): void {
    this.loadedPacks.clear();
    this.activePack = null;
    this.loadHistory = [];
    this.devMode = false;
  }
}

/**
 * Get singleton pack manager instance
 */
export function getPackManager(): PackManager {
  return PackManager.getInstance();
}

/**
 * Convenience function to load and set active pack
 * @param packIdOrUrl - Pack ID or URL
 * @returns Loaded pack
 */
export async function loadAndActivatePack(packIdOrUrl: string): Promise<ContentPack> {
  const manager = getPackManager();
  
  if (packIdOrUrl.startsWith("http://") || packIdOrUrl.startsWith("https://")) {
    return manager.loadPackFromUrl(packIdOrUrl);
  }
  
  return manager.switchToPack(packIdOrUrl);
}

