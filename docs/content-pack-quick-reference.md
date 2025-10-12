# Content Pack Quick Reference

Quick reference for working with content packs in the AI Cofounder Startup Adventure.

## Load a Content Pack

```typescript
import { loadContentPack } from '@/lib/content-loader';

const pack = await loadContentPack('ai-cofounder-v1');
```

## Validate Content

```typescript
import { validateContentPack, formatValidationErrors } from '@/lib/content-validator';

const result = validateContentPack(packData);
if (!result.valid) {
  console.error(formatValidationErrors(result));
}
```

## Use Content in Components

```typescript
import { useContentPack } from '@/contexts/GameContext';

function MyComponent() {
  const contentPack = useContentPack();

  if (!contentPack) return <div>Loading...</div>;

  return <div>{contentPack.title}</div>;
}
```

## Load Assets

```typescript
import { loadAsset } from '@/lib/asset-loader';

const asset = await loadAsset('/content/image.png', {
  stepId: 1,
  choice: 'A'
});
```

## Display Assets with Fallback

```tsx
import { AssetPreview } from '@/components/AssetPreview';

<AssetPreview
  url="/content/video.mp4"
  context={{ stepId: 1, choice: 'A' }}
  className="w-full h-64"
  showRetry={true}
/>
```

## Content Pack Schema

```typescript
{
  id: string,              // "my-pack"
  version: string,         // "1.0.0"
  title: string,           // "My Content Pack"
  steps: [                 // Exactly 5 steps
    {
      id: number,          // 1-5
      title: string,       // "Step Title"
      scenario: string,    // "Step description"
      optionA: {
        label: string,     // ≤200 chars
        body: string,      // ≤1000 chars
        delta: {
          R: number,       // [-10, +15]
          U: number,       // [-10, +15]
          S: number,       // [-10, +15]
          C: number,       // [-10, +15]
          I: number,       // [-10, +15]
        }
      },
      optionB: { /* same as optionA */ },
      assets?: string[]    // Optional URLs
    },
    // ... 4 more steps
  ]
}
```

## URL Parameters

```
?pack=my-pack              # Load specific pack
?operator=true             # Enable operator controls
?pack=my-pack&operator=true  # Load pack + show operator panel
```

## Testing

```bash
# Build and check for errors
npm run build

# Load pack in browser
http://localhost:3000?pack=my-pack

# Test with operator controls
http://localhost:3000?pack=my-pack&operator=true&forceUnluck=true
```

## Delta Guidelines

- **Revenue (R)**: Monetization, pricing, conversions
- **Users (U)**: Growth, acquisition, activation
- **System (S)**: Infrastructure, scalability, reliability
- **Customers (C)**: Satisfaction, retention, NPS
- **Investors (I)**: Confidence, fundraising, metrics

**Balance tradeoffs:**
- Most choices should have both positive and negative deltas
- Early steps: ±2-8 magnitude
- Later steps: ±5-15 magnitude

## File Locations

- **Content packs:** `public/content/{pack-id}.json`
- **Assets:** `public/content/assets/` (or any public URL)
- **Spec:** `public/content/README.md`
- **Validator:** `src/lib/content-validator.ts`
- **Loader:** `src/lib/content-loader.ts`
- **Asset loader:** `src/lib/asset-loader.ts`

## Common Errors

### "Content pack not found"
- Check file exists in `public/content/`
- Verify filename matches pack ID
- Try .json, .yaml, or .yml extension

### "Dimension X is out of range"
- Delta values must be in [-10, +15]
- Check all 5 dimensions (R, U, S, C, I)

### "Must have exactly 5 steps"
- Content pack needs exactly 5 steps
- Check array length

### "Invalid semantic version"
- Version must follow "X.Y.Z" format
- Example: "1.0.0", "2.1.3"

## Need More Info?

- Full spec: `public/content/README.md`
- Implementation: `src/lib/content-loader.ts`, `src/lib/content-validator.ts`
- Types: `src/types/game.ts`
- Examples: `public/content/ai-cofounder-v1.json`
