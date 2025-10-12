/**
 * Junie Console Scripts - Simulated code generation logs for each step/choice
 */

import type { ConsoleScript, LogEntry } from "@/types/game";

/**
 * Console scripts database
 * Each step/choice combination has a unique script showing Junie's work
 */
const CONSOLE_SCRIPTS: Record<number, Record<"A" | "B", ConsoleScript>> = {
  // ========================================================================
  // Step 1: Early Maturity
  // ========================================================================
  1: {
    A: {
      // Step 1A: Subscription billing
      logs: [
        { type: "info", text: "🤖 Junie: Analyzing subscription billing requirements..." },
        { type: "info", text: "📦 Installing @stripe/stripe-js..." },
        { type: "success", text: "✓ Stripe SDK installed successfully" },
        { type: "info", text: "🔧 Generating subscription models..." },
        { 
          type: "info", 
          text: "📝 Creating billing tiers: Free, Pro ($29/mo), Enterprise ($99/mo)",
          codeDiff: `+ export const BILLING_TIERS = {
+   free: { price: 0, features: ['basic'] },
+   pro: { price: 29, features: ['basic', 'advanced'] },
+   enterprise: { price: 99, features: ['all'] }
+ };`
        },
        { type: "info", text: "🔐 Setting up webhook handlers for subscription events..." },
        { type: "success", text: "✓ Created /api/webhooks/stripe endpoint" },
        { type: "info", text: "💳 Implementing payment form component..." },
        { type: "success", text: "✓ Subscription system ready!" },
        { type: "success", text: "🎉 Revenue tracking now active. First paid customer possible!" },
      ],
      totalDuration: 3500,
    },
    B: {
      // Step 1B: Investor dashboard
      logs: [
        { type: "info", text: "🤖 Junie: Building investor metrics dashboard..." },
        { type: "info", text: "📊 Installing chart.js and analytics libraries..." },
        { type: "success", text: "✓ Visualization dependencies installed" },
        { type: "info", text: "🔧 Creating KPI tracking system..." },
        { 
          type: "info", 
          text: "📈 Tracking metrics: MRR, CAC, LTV, Churn Rate, Growth %",
          codeDiff: `+ export interface InvestorMetrics {
+   mrr: number;
+   cac: number;
+   ltv: number;
+   churnRate: number;
+   growthPercent: number;
+ }`
        },
        { type: "info", text: "🎨 Generating dashboard UI components..." },
        { type: "success", text: "✓ Created /dashboard/investors route" },
        { type: "info", text: "📧 Setting up automated weekly investor reports..." },
        { type: "success", text: "✓ Investor dashboard live!" },
        { type: "success", text: "🎯 Investors now have real-time visibility into your metrics" },
      ],
      totalDuration: 3200,
    },
  },

  // ========================================================================
  // Step 2: First Customers
  // ========================================================================
  2: {
    A: {
      // Step 2A: Landing page
      logs: [
        { type: "info", text: "🤖 Junie: Designing high-converting landing page..." },
        { type: "info", text: "🎨 Analyzing top SaaS landing pages for patterns..." },
        { type: "success", text: "✓ Generated hero section with clear value prop" },
        { type: "info", text: "✨ Adding animated product demo..." },
        { 
          type: "info", 
          text: "🎬 Embedding product walkthrough video",
          codeDiff: `+ <section className="hero">
+   <h1>AI Cofounder that actually ships code</h1>
+   <video src="/demo.mp4" autoPlay loop />
+   <button>Start Free Trial</button>
+ </section>`
        },
        { type: "info", text: "📱 Optimizing for mobile (50% of traffic)..." },
        { type: "success", text: "✓ Responsive design complete" },
        { type: "info", text: "🚀 Deploying to CDN..." },
        { type: "success", text: "✓ Landing page live at yoursite.com!" },
        { type: "success", text: "📊 Ready to capture signups. SEO optimized!" },
      ],
      totalDuration: 2800,
    },
    B: {
      // Step 2B: Onboarding emails
      logs: [
        { type: "info", text: "🤖 Junie: Creating onboarding email sequence..." },
        { type: "info", text: "📧 Integrating with SendGrid..." },
        { type: "success", text: "✓ Email service connected" },
        { type: "info", text: "✍️ Writing email copy..." },
        { 
          type: "info", 
          text: "📝 Created 5-email drip campaign",
          codeDiff: `+ const onboardingSequence = [
+   { day: 0, subject: 'Welcome to AI Cofounder!' },
+   { day: 1, subject: 'Your first AI-generated code' },
+   { day: 3, subject: 'Pro tips from power users' },
+   { day: 7, subject: 'Upgrade for advanced features' },
+   { day: 14, subject: 'We miss you! Come back' }
+ ];`
        },
        { type: "info", text: "🎨 Designing HTML email templates..." },
        { type: "success", text: "✓ Templates render perfectly on all clients" },
        { type: "info", text: "🔗 Adding personalization tokens ({{firstName}}, etc.)..." },
        { type: "success", text: "✓ Onboarding emails scheduled!" },
        { type: "success", text: "💌 New users will receive guidance automatically" },
      ],
      totalDuration: 2600,
    },
  },

  // ========================================================================
  // Step 3: Growth Stage
  // ========================================================================
  3: {
    A: {
      // Step 3A: Collaboration features
      logs: [
        { type: "info", text: "🤖 Junie: Implementing real-time collaboration..." },
        { type: "info", text: "🔌 Installing WebSocket server (Socket.io)..." },
        { type: "success", text: "✓ Real-time infrastructure ready" },
        { type: "info", text: "👥 Creating team workspace system..." },
        { 
          type: "info", 
          text: "🔐 Adding role-based permissions",
          codeDiff: `+ enum Role { Owner, Admin, Member, Viewer }
+ 
+ export const permissions = {
+   [Role.Owner]: ['all'],
+   [Role.Admin]: ['read', 'write', 'invite'],
+   [Role.Member]: ['read', 'write'],
+   [Role.Viewer]: ['read']
+ };`
        },
        { type: "info", text: "✨ Adding live cursors and presence indicators..." },
        { type: "success", text: "✓ Users can see teammates' activity in real-time" },
        { type: "info", text: "💬 Implementing in-app commenting..." },
        { type: "warning", text: "⚠️  Database load increased - may need scaling soon" },
        { type: "success", text: "✓ Collaboration features shipped!" },
        { type: "success", text: "🎉 Teams can now work together seamlessly" },
      ],
      totalDuration: 4000,
    },
    B: {
      // Step 3B: Analytics dashboard
      logs: [
        { type: "info", text: "🤖 Junie: Building customer analytics dashboard..." },
        { type: "info", text: "📊 Installing data visualization libraries..." },
        { type: "success", text: "✓ Recharts and D3.js ready" },
        { type: "info", text: "🔍 Creating event tracking system..." },
        { 
          type: "info", 
          text: "📈 Tracking: Page views, Feature usage, Conversion funnels",
          codeDiff: `+ export const trackEvent = (event: string, properties: any) => {
+   analytics.track({
+     event,
+     properties,
+     timestamp: Date.now(),
+     userId: getCurrentUser().id
+   });
+ };`
        },
        { type: "info", text: "🎨 Generating interactive charts..." },
        { type: "success", text: "✓ Created beautiful dashboard with 12 charts" },
        { type: "info", text: "📊 Adding cohort analysis and retention metrics..." },
        { type: "success", text: "✓ Analytics dashboard complete!" },
        { type: "success", text: "📈 Customers can now see their usage patterns and ROI" },
      ],
      totalDuration: 3600,
    },
  },

  // ========================================================================
  // Step 4: Viral Spike
  // ========================================================================
  4: {
    A: {
      // Step 4A: Auto-scaling infrastructure
      logs: [
        { type: "info", text: "🤖 Junie: Setting up auto-scaling infrastructure..." },
        { type: "info", text: "☸️  Configuring Kubernetes cluster..." },
        { type: "success", text: "✓ K8s cluster initialized with 3 nodes" },
        { type: "info", text: "📈 Creating horizontal pod autoscaler..." },
        { 
          type: "info", 
          text: "⚙️  Auto-scaling rules configured",
          codeDiff: `+ apiVersion: autoscaling/v2
+ kind: HorizontalPodAutoscaler
+ spec:
+   minReplicas: 3
+   maxReplicas: 50
+   metrics:
+   - type: Resource
+     resource:
+       name: cpu
+       target:
+         averageUtilization: 70`
        },
        { type: "info", text: "🔍 Setting up monitoring (Prometheus + Grafana)..." },
        { type: "success", text: "✓ Real-time metrics and alerts configured" },
        { type: "info", text: "💾 Implementing database connection pooling..." },
        { type: "success", text: "✓ System can now handle 100x traffic!" },
        { type: "success", text: "🚀 Ready for viral growth. Bring on the users!" },
      ],
      totalDuration: 4200,
    },
    B: {
      // Step 4B: AI support chatbot
      logs: [
        { type: "info", text: "🤖 Junie: Implementing AI customer support chatbot..." },
        { type: "info", text: "🧠 Connecting to OpenAI GPT-4..." },
        { type: "success", text: "✓ AI model connected" },
        { type: "info", text: "📚 Training on your documentation and FAQs..." },
        { 
          type: "info", 
          text: "💬 Creating chat interface",
          codeDiff: `+ export const AIChatbot = () => {
+   const handleMessage = async (msg: string) => {
+     const response = await openai.chat.completions.create({
+       model: 'gpt-4',
+       messages: [
+         { role: 'system', content: 'You are a helpful support agent.' },
+         { role: 'user', content: msg }
+       ]
+     });
+     return response.choices[0].message.content;
+   };
+ };`
        },
        { type: "info", text: "🎨 Adding chat widget to all pages..." },
        { type: "success", text: "✓ Chatbot now available 24/7" },
        { type: "warning", text: "⚠️  AI responses need human review initially" },
        { type: "info", text: "🔄 Setting up escalation to human support..." },
        { type: "success", text: "✓ AI support chatbot live!" },
        { type: "success", text: "💬 Customers can get instant help anytime" },
      ],
      totalDuration: 3800,
    },
  },

  // ========================================================================
  // Step 5: Global Expansion
  // ========================================================================
  5: {
    A: {
      // Step 5A: Multilingual support
      logs: [
        { type: "info", text: "🤖 Junie: Implementing internationalization..." },
        { type: "info", text: "🌍 Installing i18n libraries (next-i18next)..." },
        { type: "success", text: "✓ i18n framework configured" },
        { type: "info", text: "📝 Extracting all text strings for translation..." },
        { 
          type: "info", 
          text: "🗣️  Supporting 8 languages: EN, ES, FR, DE, JA, ZH, PT, KO",
          codeDiff: `+ export const locales = [
+   'en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ko'
+ ];
+ 
+ export const translations = {
+   en: { welcome: 'Welcome!' },
+   es: { welcome: '¡Bienvenido!' },
+   // ... more languages
+ };`
        },
        { type: "info", text: "🤖 Using AI to generate high-quality translations..." },
        { type: "success", text: "✓ All strings translated and verified" },
        { type: "info", text: "📱 Adding language selector to UI..." },
        { type: "success", text: "✓ Multilingual support complete!" },
        { type: "success", text: "🌏 Now accessible to billions of users worldwide!" },
      ],
      totalDuration: 3400,
    },
    B: {
      // Step 5B: International payments
      logs: [
        { type: "info", text: "🤖 Junie: Setting up international payment processing..." },
        { type: "info", text: "💳 Integrating multiple payment providers..." },
        { type: "success", text: "✓ Stripe (Global), PayPal, Alipay, WeChat Pay connected" },
        { type: "info", text: "💱 Implementing multi-currency support..." },
        { 
          type: "info", 
          text: "💰 Supporting 25 currencies with real-time exchange rates",
          codeDiff: `+ export const SUPPORTED_CURRENCIES = [
+   'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR',
+   'BRL', 'KRW', 'AUD', 'CAD', 'MXN', 'CHF',
+   // ... 13 more
+ ];
+ 
+ export const convertCurrency = async (amount, from, to) => {
+   const rate = await getExchangeRate(from, to);
+   return amount * rate;
+ };`
        },
        { type: "info", text: "🏦 Configuring local payment methods (iDEAL, SEPA, etc.)..." },
        { type: "success", text: "✓ Local payment methods enabled for 15 countries" },
        { type: "info", text: "📊 Setting up international tax compliance (VAT, GST)..." },
        { type: "success", text: "✓ International payments ready!" },
        { type: "success", text: "💰 Can now accept money from anywhere in the world!" },
      ],
      totalDuration: 3900,
    },
  },
};

/**
 * Get console script for a specific step/choice combination
 * @param stepId - Step ID (1-5)
 * @param choice - Choice made ("A" or "B")
 * @returns Console script with logs and timing
 */
export function getConsoleScript(stepId: number, choice: "A" | "B"): ConsoleScript {
  const script = CONSOLE_SCRIPTS[stepId]?.[choice];
  
  if (!script) {
    // Fallback script if not found
    return {
      logs: [
        { type: "info", text: "🤖 Junie: Working on your request..." },
        { type: "success", text: "✓ Done!" },
      ],
      totalDuration: 1000,
    };
  }

  return script;
}

/**
 * Calculate delay between log entries for streaming effect
 * @param totalDuration - Total duration for all logs in milliseconds
 * @param logCount - Number of log entries
 * @returns Array of delays (one per log entry)
 */
export function calculateLogDelays(totalDuration: number, logCount: number): number[] {
  if (logCount === 0) return [];
  if (logCount === 1) return [0];

  // Distribute delays with slight randomness for natural feel
  const baseDelay = totalDuration / logCount;
  const delays: number[] = [0]; // First log appears immediately

  for (let i = 1; i < logCount; i++) {
    // Add ±20% variance to each delay for natural timing
    const variance = baseDelay * 0.2;
    const delay = baseDelay + (Math.random() * variance * 2 - variance);
    delays.push(Math.max(100, Math.floor(delay))); // Min 100ms between logs
  }

  return delays;
}

