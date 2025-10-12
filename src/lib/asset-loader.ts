/**
 * Asset Loader - Load and cache game assets with fallback handling
 */

/**
 * Context information for asset loading
 */
export interface AssetContext {
  stepId: number;
  choice: "A" | "B";
}

/**
 * Asset data with metadata
 */
export interface AssetData {
  url: string;
  type: "image" | "video" | "unknown";
  loaded: boolean;
  error: string | null;
  context: AssetContext;
}

/**
 * Asset cache to avoid re-loading
 */
const assetCache = new Map<string, AssetData>();

/**
 * Detect asset type from URL extension
 */
function detectAssetType(url: string): "image" | "video" | "unknown" {
  const extension = url.split(".").pop()?.toLowerCase();
  
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const videoExtensions = ["mp4", "webm", "ogg", "mov"];
  
  if (extension && imageExtensions.includes(extension)) {
    return "image";
  }
  if (extension && videoExtensions.includes(extension)) {
    return "video";
  }
  
  return "unknown";
}

/**
 * Load an asset with timeout and retry logic
 * @param url - Asset URL
 * @param context - Loading context
 * @param timeoutMs - Timeout in milliseconds (default 5000)
 * @param retryCount - Number of retries (default 1)
 * @returns Asset data
 */
export async function loadAsset(
  url: string,
  context: AssetContext,
  timeoutMs = 5000,
  retryCount = 1
): Promise<AssetData> {
  // Check cache first
  const cacheKey = `${url}-${context.stepId}-${context.choice}`;
  const cached = assetCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const assetType = detectAssetType(url);
  
  // Attempt to load with retries
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const assetData = await loadAssetWithTimeout(url, context, assetType, timeoutMs);
      
      // Cache successful load
      assetCache.set(cacheKey, assetData);
      return assetData;
    } catch (error) {
      // If this was the last attempt, return error
      if (attempt === retryCount) {
        const errorData: AssetData = {
          url,
          type: assetType,
          loaded: false,
          error: error instanceof Error ? error.message : "Failed to load asset",
          context,
        };
        
        // Cache error to avoid repeated failed attempts
        assetCache.set(cacheKey, errorData);
        return errorData;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  // Fallback (should never reach here)
  return {
    url,
    type: assetType,
    loaded: false,
    error: "Unknown error",
    context,
  };
}

/**
 * Load asset with timeout
 */
async function loadAssetWithTimeout(
  url: string,
  context: AssetContext,
  assetType: "image" | "video" | "unknown",
  timeoutMs: number
): Promise<AssetData> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Asset load timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    if (assetType === "image") {
      const img = new Image();
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({
          url,
          type: "image",
          loaded: true,
          error: null,
          context,
        });
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error("Image failed to load"));
      };
      
      img.src = url;
    } else if (assetType === "video") {
      // For video, we just check if it's accessible
      const video = document.createElement("video");
      
      video.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        resolve({
          url,
          type: "video",
          loaded: true,
          error: null,
          context,
        });
      };
      
      video.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error("Video failed to load"));
      };
      
      video.src = url;
      video.load();
    } else {
      // Unknown type - just try to fetch it
      fetch(url, { method: "HEAD" })
        .then(response => {
          clearTimeout(timeoutId);
          if (response.ok) {
            resolve({
              url,
              type: "unknown",
              loaded: true,
              error: null,
              context,
            });
          } else {
            reject(new Error(`HTTP ${response.status}`));
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    }
  });
}

/**
 * Preload assets for upcoming step (background fetch)
 * @param urls - Array of asset URLs
 * @param context - Loading context
 */
export async function preloadAssets(urls: string[], context: AssetContext): Promise<void> {
  // Load all assets in parallel, but don't wait for completion
  const promises = urls.map(url => loadAsset(url, context, 5000, 1));
  
  // Fire and forget - we don't await
  Promise.all(promises).catch(() => {
    // Ignore errors in background preload
  });
}

/**
 * Get fallback placeholder based on asset type
 */
export function getFallbackPlaceholder(assetType: "image" | "video" | "unknown"): string {
  if (assetType === "image") {
    // Return a data URL for a simple gray placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='18' fill='%239ca3af'%3EImage Unavailable%3C/text%3E%3C/svg%3E";
  }
  
  if (assetType === "video") {
    return ""; // Video fallback handled by component
  }
  
  return "";
}

/**
 * Clear asset cache (useful for testing or memory management)
 */
export function clearAssetCache(): void {
  assetCache.clear();
}

/**
 * Get cache statistics
 */
export function getAssetCacheStats() {
  return {
    size: assetCache.size,
    entries: Array.from(assetCache.entries()).map(([key, data]) => ({
      key,
      loaded: data.loaded,
      type: data.type,
      hasError: !!data.error,
    })),
  };
}

