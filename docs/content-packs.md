# Content Packs Guide

This guide explains how to create and use content packs for the AI Cofounder startup simulation game.

## Overview

Content packs define the game scenarios, choices, and scaling meter impacts. Each pack contains exactly 5 steps representing different stages of a startup journey, with each step offering two choices (A and B) that affect the 5-dimensional scaling meter.

## Content Pack Structure

### Schema Overview

```typescript
interface ContentPack {
  id: string;                    // Unique identifier
  version: string;               // Semantic version (e.g., "1.0.0")
  title: string;                 // Display title
  description?: string;          // Optional description
  author?: string;               // Optional author
  steps: Step[5];               // Exactly 5 steps
  metadata?: {
    created?: string;            // ISO datetime
    updated?: string;            // ISO datetime
    tags?: string[];             // Optional tags
  };
}
```

### Step Structure

Each step represents a stage in the startup journey:

```typescript
interface Step {
  id: number;                    // Step number (1-5)
  title: string;                 // Step title
  subtitle?: string;             // Optional subtitle
  scenario: string;              // Scenario description/context
  optionA: Choice;              // First choice option
  optionB: Choice;              // Second choice option
  assets?: string[];            // Optional asset URLs
}
```

### Choice Structure

Each choice represents an action the player can take:

```typescript
interface Choice {
  label: string;                 // Short description (≤200 chars)
  body: string;                  // Detailed description (≤1000 chars)
  delta: Delta;                  // Impact on scaling meter
}
```

### Delta System

The delta system affects the 5-dimensional scaling meter:

```typescript
interface Delta {
  R: number;  // Revenue Momentum (-10 to +15)
  U: number;  // User Growth / Activation (-10 to +15)
  S: number;  // System Reliability / Scalability (-10 to +15)
  C: number;  // Customer Love (NPS / retention) (-10 to +15)
  I: number;  // Investor Confidence / Story (-10 to +15)
}
```

## Creating a Content Pack

### 1. JSON Format Example

```json
{
  "id": "my-startup-pack",
  "version": "1.0.0",
  "title": "My Startup Journey",
  "description": "A custom startup simulation focusing on SaaS growth",
  "author": "Your Name",
  "steps": [
    {
      "id": 1,
      "title": "MVP Launch",
      "subtitle": "Getting Started",
      "scenario": "You've built your MVP and are ready to launch. What's your first priority?",
      "optionA": {
        "label": "Focus on user acquisition",
        "body": "Launch a marketing campaign to drive signups and get early users.",
        "delta": {
          "R": 3,
          "U": 8,
          "S": 0,
          "C": -2,
          "I": 2
        }
      },
      "optionB": {
        "label": "Perfect the product",
        "body": "Spend time fixing bugs and improving the user experience.",
        "delta": {
          "R": -1,
          "U": 2,
          "S": 6,
          "C": 5,
          "I": 0
        }
      }
    }
    // ... 4 more steps required
  ],
  "metadata": {
    "created": "2025-09-24T11:00:00Z",
    "tags": ["saas", "b2b", "startup"]
  }
}
```

### 2. YAML Format Example

```yaml
id: my-startup-pack
version: 1.0.0
title: My Startup Journey
description: A custom startup simulation focusing on SaaS growth
author: Your Name

steps:
  - id: 1
    title: MVP Launch
    subtitle: Getting Started
    scenario: You've built your MVP and are ready to launch. What's your first priority?
    optionA:
      label: Focus on user acquisition
      body: Launch a marketing campaign to drive signups and get early users.
      delta:
        R: 3
        U: 8
        S: 0
        C: -2
        I: 2
    optionB:
      label: Perfect the product
      body: Spend time fixing bugs and improving the user experience.
      delta:
        R: -1
        U: 2
        S: 6
        C: 5
        I: 0
  # ... 4 more steps required

metadata:
  created: 2025-09-24T11:00:00Z
  tags:
    - saas
    - b2b
    - startup
```

## Delta Balancing Guidelines

### Dimension Meanings

- **R (Revenue)**: Direct impact on monetization, subscriptions, pricing
- **U (Users)**: User acquisition, activation, growth metrics
- **S (System)**: Technical scalability, reliability, infrastructure
- **C (Customer)**: User satisfaction, retention, support quality
- **I (Investor)**: Fundraising appeal, metrics visibility, story

### Balancing Tips

1. **Keep deltas meaningful but not extreme**: Range of -6 to +12 works well
2. **Create tradeoffs**: Most choices should have both positive and negative impacts
3. **Consider realistic scenarios**: Deltas should reflect real startup decisions
4. **Test different paths**: Ensure multiple strategies can lead to success
5. **Progressive difficulty**: Later steps can have higher stakes/impacts

### Example Delta Patterns

```typescript
// Revenue-focused choice (with tradeoffs)
{ R: 10, U: 3, S: -2, C: 0, I: 1 }

// User growth choice (with infrastructure cost)
{ R: 0, U: 8, S: -3, C: 2, I: 0 }

// Technical investment (delayed gratification)
{ R: -2, U: 0, S: 10, C: 3, I: -1 }

// Customer focus (sustainable growth)
{ R: 2, U: 4, S: 0, C: 8, I: 2 }
```

## Using Content Packs

### 1. URL Parameters

Load a pack via URL parameter:
```
https://yourapp.com/?pack=my-pack-id
https://yourapp.com/?packUrl=https://example.com/pack.json
```

### 2. Dev Mode

Enable dev mode for pack switching:
```
https://yourapp.com/?dev=true
```

### 3. Programmatic Loading

```typescript
import { getPackManager } from './lib/pack-manager';

const manager = getPackManager();

// Load from URL
await manager.loadPackFromUrl('https://example.com/pack.json');

// Load from string
const packData = '{ "id": "test", ... }';
manager.loadPackFromString(packData, 'json');

// Switch to loaded pack
await manager.switchToPack('my-pack-id');
```

## Validation

All content packs are automatically validated against the schema. Common validation errors:

- **Missing required fields**: id, version, title, steps
- **Invalid step count**: Must have exactly 5 steps
- **Invalid delta ranges**: Values must be between -10 and +15
- **Invalid URLs**: Asset URLs must be valid HTTP/HTTPS URLs
- **Invalid version format**: Must follow semantic versioning (x.y.z)

## File Organization

Recommended file structure:
```
/public/packs/
  ├── default.json          # Default pack (backup)
  ├── ai-cofounder.json     # Main AI Cofounder pack
  ├── saas-startup.yaml     # SaaS-focused pack
  └── hardware-startup.json # Hardware startup pack
```

## Testing Your Pack

1. **Validate schema**: Use the validation functions in `src/lib/content-pack.ts`
2. **Test loading**: Verify your pack loads without errors
3. **Balance testing**: Play through different choice combinations
4. **Asset verification**: Ensure all asset URLs are accessible

```typescript
import { validateContentPackSafe } from './lib/content-loader';

const result = validateContentPackSafe(yourPackData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Best Practices

1. **Clear scenarios**: Write engaging, realistic startup scenarios
2. **Meaningful choices**: Each option should feel like a real business decision
3. **Balanced outcomes**: Avoid choices that are obviously better/worse
4. **Progressive complexity**: Later steps should have higher stakes
5. **Consistent tone**: Maintain voice and style throughout the pack
6. **Test thoroughly**: Verify all paths lead to reasonable outcomes
7. **Version control**: Use semantic versioning for pack updates
8. **Asset optimization**: Keep asset files small and accessible

## Troubleshooting

### Common Issues

1. **Pack won't load**: Check JSON/YAML syntax and schema validation
2. **Deltas out of range**: Ensure all delta values are between -10 and +15
3. **Missing steps**: Must have exactly 5 steps with sequential IDs (1-5)
4. **Asset errors**: Verify all URLs are accessible and use HTTPS
5. **Version conflicts**: Use unique pack IDs and proper semantic versioning

### Debug Mode

Enable debug logging:
```typescript
const manager = getPackManager({ enableDevMode: true });
console.log(manager.getLoadHistory()); // View loading attempts
```

## Examples

See the default pack implementation in `src/lib/default-pack.ts` for a complete example following all best practices.