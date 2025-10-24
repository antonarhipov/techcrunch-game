# Choose Your Own Startup Adventure 🚀

An interactive narrative game where you build an AI Cofounder SaaS from scratch. Make critical decisions, watch your AI assistant "Junie" code in real-time, and see if you can reach unicorn status!

## 🎮 About the Game

**Choose Your Own Startup Adventure** is a decision-driven simulation game that puts you in the founder's seat of an AI startup. Through 5 critical decision points, you'll navigate the challenges of:

- 💰 Revenue generation
- 👥 User growth
- ⚙️ System architecture
- 🤝 Customer satisfaction
- 💼 Investor relations

Each choice impacts your company's scaling meter (0-100%), with **32 possible paths** leading to **6 unique endings** ranging from startup crash to unicorn breakthrough.

### Key Features

- **Dark Theme UI**: Modern, professional interface with KotlinConf-inspired purple-orange gradients
- **Junie Console**: Watch your AI cofounder code in real-time with animated logs
- **Dynamic Meter Engine**: Sophisticated scoring system with hidden state mechanics
- **Bad luck Events**: Random setbacks including rare "Perfect Storm" scenarios
- **Journey Breakdown**: Detailed analytics showing how each decision impacted your score
- **Content Pack System**: Extensible JSON-based content architecture
- **Replay Hints**: Smart suggestions for exploring alternate paths

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd techcrunch-game

# Install dependencies
npm install
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

#### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

#### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

#### Linting

```bash
# Check code quality
npm run lint
```

## 📁 Project Structure

```
techcrunch-game/
├── docs/                      # Documentation
│   ├── requirements.md        # Project requirements and acceptance criteria
│   ├── plan.md               # Implementation plan and milestones
│   ├── tasks.md              # Technical task list
│   ├── spec.md               # Game design specification
│   ├── content-packs.md      # Content pack system documentation
│   ├── meter-engine-quick-reference.md
│   ├── unluck.md             # Unluck mechanics explanation
│   └── game-levels.md        # Level and tier system
│
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── layout.tsx        # Root layout with error boundary
│   │   ├── page.tsx          # Main game orchestration
│   │   └── globals.css       # Global styles and animations
│   │
│   ├── components/           # React components
│   │   ├── StartScreen.tsx   # Game entry screen
│   │   ├── GameLayout.tsx    # Three-panel game layout
│   │   ├── ScenarioPanel.tsx # Choice presentation
│   │   ├── JunieConsole.tsx  # AI coding console
│   │   ├── ScalingMeter.tsx  # Progress visualization
│   │   ├── EndingScreen.tsx  # Results and analytics
│   │   ├── JourneyBreakdown.tsx  # Detailed score breakdown
│   │   └── ...               # Supporting components
│   │
│   ├── contexts/             # React contexts
│   │   ├── GameContext.tsx   # Game state management
│   │   └── ToastContext.tsx  # Notifications
│   │
│   ├── lib/                  # Core game logic
│   │   ├── meter-engine.ts   # Scoring calculation engine
│   │   ├── game-flow.ts      # Game state transitions
│   │   ├── unluck.ts         # Random event system
│   │   ├── tiers.ts          # Tier/level definitions
│   │   ├── endings.ts        # Ending calculation
│   │   ├── content-loader.ts # Content pack loading
│   │   ├── pack-manager.ts   # Content pack management
│   │   ├── insights.ts       # Dynamic tip generation
│   │   ├── replay.ts         # Alternate path hints
│   │   └── storage.ts        # LocalStorage utilities
│   │
│   └── types/
│       └── game.ts           # TypeScript type definitions
│
├── public/
│   ├── content/              # Content packs (JSON)
│   │   └── ai-cofounder-v1.json
│   ├── video/                # Video assets
│   └── junie.svg             # Junie logo
│
└── __tests__/                # Test files
    ├── integration/          # Integration tests
    └── unit tests colocated with source files
```

## 🎯 Main Resources

### Game Content

- **Content Pack**: `public/content/ai-cofounder-v1.json`
  - 5 story steps with choices and outcomes
  - Delta values for each choice
  - Step-specific assets and media

### Core Documentation

1. **`docs/requirements.md`** - Full game requirements and acceptance criteria
2. **`docs/plan.md`** - Development milestones and implementation phases
3. **`docs/tasks.md`** - Detailed technical task checklist
4. **`docs/spec.md`** - Game design specification
5. **`docs/simulation.md`** - Simulation page usage and seed reproducibility

### Key Systems

#### Meter Engine (`src/lib/meter-engine.ts`)
- Hidden RUSCI state (Revenue, Users, System, Customers, Investors)
- Weighted scoring algorithm
- Sigmoid normalization
- Diminishing returns
- Momentum and rubber-band effects

#### Content Pack System (`src/lib/content-loader.ts`)
- JSON-based content architecture
- Runtime validation
- Schema enforcement
- Easy extensibility for new scenarios

#### Game Flow (`src/lib/game-flow.ts`)
- State management
- Choice processing
- Unluck event triggering
- Step transitions

## 🎨 Design System

### Colors (KotlinConf-inspired)

- **Primary Gradient**: `purple-600 → orange-500`
- **Backgrounds**: `gray-950, gray-900, gray-800`
- **Text**: `white, gray-300, gray-400`
- **Accents**: Purple for interactions, Orange for warnings

### Animations

- **Junie Logo**: Rotates when console is streaming
- **Console Logs**: Fade-in with staggered delays
- **Meter**: Smooth transitions on value changes
- **Confetti**: Celebration animation for high scores

## 🧪 Testing

The project includes comprehensive tests:

- **Unit Tests**: Core game logic (`meter-engine`, `unluck`, `tiers`, etc.)
- **Integration Tests**: Full game flow scenarios
- **Component Tests**: React component behavior

Run tests with coverage:
```bash
npm test -- --coverage
```

## 🔧 Configuration

### Feature Flags (`src/lib/feature-flags.ts`)

Developer mode flags for testing:
- `forceUnluck` - Trigger unluck on every step
- `forcePerfectStorm` - Trigger Perfect Storm events
- `showHiddenState` - Display RUSCI values
- `skipAnimations` - Disable animations for testing
- `fixedSeed` - Deterministic RNG

Access via URL: `?operator=true`

### Environment

Create `.env.local` for custom configuration:
```env
# Add environment-specific settings here
```

## 📊 Game Mechanics

### Tier System

| Tier | Score Range | Label |
|------|-------------|-------|
| 🚧 | 0-29 | Crash |
| 🌱 | 30-49 | Finding Fit |
| ⚡ | 50-69 | Gaining Steam |
| 🚀 | 70-84 | Scaling Up |
| 🦄 | 85-100 | Breakout |

### Unluck System

- **15% chance** per positive step
- Reduces gains by 40-70%
- **Perfect Storm**: Multiple unluck hits (Step 4B only)

## 🚢 Deployment

Built with Next.js for easy deployment to:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- Any Node.js hosting platform

```bash
npm run build
npm start
```

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

---

Built with [Next.js](https://nextjs.org), TypeScript, and Tailwind CSS.
