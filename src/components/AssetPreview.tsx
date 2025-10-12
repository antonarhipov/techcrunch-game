"use client";

/**
 * AssetPreview Component - Display assets with loading states and fallbacks
 */

import { useState, useEffect } from "react";
import {
  loadAsset,
  getFallbackPlaceholder,
  type AssetContext,
  type AssetData,
} from "@/lib/asset-loader";

export interface AssetPreviewProps {
  /** Asset URL */
  url: string;
  /** Loading context */
  context: AssetContext;
  /** Show retry button on error */
  showRetry?: boolean;
  /** Alt text for images */
  alt?: string;
  /** CSS class name */
  className?: string;
}

/**
 * AssetPreview Component
 * Handles loading, errors, and fallbacks for game assets
 */
export function AssetPreview({
  url,
  context,
  showRetry = false,
  alt = "Game asset",
  className = "",
}: AssetPreviewProps) {
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const data = await loadAsset(url, context);
        if (isMounted) {
          setAssetData(data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [url, context, retryKey]);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-purple-500" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!assetData || !assetData.loaded || assetData.error) {
    const fallbackSrc = getFallbackPlaceholder(assetData?.type || "image");
    
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 p-6 ${className}`}>
        {fallbackSrc && assetData?.type === "image" ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className="mb-4 max-h-48 w-auto"
          />
        ) : (
          <div className="mb-4 text-6xl">📦</div>
        )}
        
        <p className="mb-2 text-sm text-gray-300">
          {assetData?.error || "Asset unavailable"}
        </p>
        
        {showRetry && (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded bg-purple-500 px-4 py-2 text-sm text-white transition hover:bg-purple-600"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Success state - render based on type
  if (assetData.type === "image") {
    return (
      <img
        src={assetData.url}
        alt={alt}
        className={`max-w-full ${className}`}
        loading="lazy"
      />
    );
  }

  if (assetData.type === "video") {
    return (
      <video
        src={assetData.url}
        controls
        className={`max-w-full ${className}`}
        preload="metadata"
      >
        <track kind="captions" />
        Your browser does not support video playback.
      </video>
    );
  }

  // Unknown type fallback
  return (
    <div className={`flex items-center justify-center bg-gray-100 p-6 ${className}`}>
      <div className="text-center">
        <div className="mb-2 text-4xl">📄</div>
        <p className="text-sm text-gray-300">Asset loaded</p>
        <a
          href={assetData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-purple-500 underline"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}

