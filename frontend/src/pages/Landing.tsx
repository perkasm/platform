import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, TrendingUp, Zap, Shield, ChevronDown, Check,
  Star, ArrowRight, Sparkles, DollarSign, BarChart3, Gift, Menu, X,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const FadeUp = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// ─── Counter animation ───────────────────────────────────────────────────────
const useCounter = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  if (inView && count === 0 && target > 0) {
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 16);
  }

  return { ref, count: Math.round(count) };
};

// ─── Floating card component ─────────────────────────────────────────────────
const FloatingCard = ({
  gradient,
  rotate,
  x,
  y,
  delay,
  scale = 1,
}: {
  gradient: string;
  rotate: number;
  x: number;
  y: number;
  delay: number;
  scale?: number;
}) => (
  <motion.div
    className="absolute rounded-2xl shadow-2xl pointer-events-none select-none"
    style={{
      width: 280 * scale,
      height: 176 * scale,
      background: gradient,
      rotate,
      x,
      y,
      opacity: 0.85,
    }}
    animate={{
      y: [y, y - 18, y],
      rotate: [rotate, rotate + 3, rotate],
    }}
    transition={{
      duration: 6 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    <div
      className="absolute rounded-md"
      style={{
        top: 36 * scale,
        left: 28 * scale,
        width: 40 * scale,
        height: 30 * scale,
        background: "rgba(255,255,255,0.35)",
      }}
    />
    <div className="absolute flex gap-[-8px]" style={{ bottom: 24 * scale, right: 28 * scale }}>
      <div
        className="rounded-full"
        style={{ width: 28 * scale, height: 28 * scale, background: "rgba(255,255,255,0.5)" }}
      />
      <div
        className="rounded-full -ml-3"
        style={{ width: 28 * scale, height: 28 * scale, background: "rgba(255,255,255,0.35)" }}
      />
    </div>
    <div className="absolute flex gap-2" style={{ bottom: 28 * scale, left: 28 * scale }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="flex gap-1">
          {[0, 1, 2, 3].map((j) => (
            <span
              key={j}
              className="rounded-full"
              style={{ width: 4 * scale, height: 4 * scale, background: "rgba(255,255,255,0.6)", display: "inline-block", marginRight: 1 }}
            />
          ))}
        </span>
      ))}
    </div>
  </motion.div>
);

// ─── Navbar ──────────────────────────────────────────────────────────────────
const LandingNav = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const bg = useTransform(scrollY, [0, 80], ["rgba(5,13,31,0)", "rgba(5,13,31,0.94)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: bg, borderBottom: `1px solid rgba(59,130,246,${borderOpacity})` } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Perkasm</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["features", "pricing", "faq"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-blue-200 hover:text-white text-sm font-medium transition-colors capitalize"
            >
              {id}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
          >
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate("/auth")}
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white border border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/20 transition-all"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Sign In
          </motion.button>
          <motion.button
            onClick={() => navigate("/auth")}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.button>
          <button
            className="md:hidden text-white ml-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050d1f]/95 backdrop-blur-md border-t border-blue-900/40 px-6 pb-4"
          >
            {["features", "pricing", "faq", "contact"].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left py-3 text-blue-200 hover:text-white text-sm font-medium capitalize border-b border-blue-900/30 last:border-0"
              >
                {id}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ─── Hero ────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050d1f 0%, #071530 50%, #040d1c 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-700/10 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      <motion.div className="absolute inset-0 pointer-events-none" style={{ y, opacity }}>
        <FloatingCard
          gradient="linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
          rotate={-18}
          x={-520}
          y={80}
          delay={0}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #1e40af 0%, #3730a3 100%)"
          rotate={12}
          x={340}
          y={40}
          delay={1.2}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
          rotate={-8}
          x={-400}
          y={280}
          delay={2}
          scale={0.75}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
          rotate={22}
          x={420}
          y={260}
          delay={0.6}
          scale={0.8}
        />
      </motion.div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/40 bg-blue-500/10 mb-8">
            <Sparkles size={12} />
            AI-Powered Rewards Optimization
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Your rewards are{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent">
            worth more
          </span>{" "}
          than you think.
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Americans leave over{" "}
          <span className="text-white font-semibold">$300 billion</span> in credit card
          rewards unclaimed every year. Perkasm tracks all your cards, optimizes every
          swipe, and puts that money back in your pocket.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <motion.button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 transition-shadow"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Start maximizing for free
            <ArrowRight size={18} />
          </motion.button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 px-6 py-4 rounded-full text-base font-medium text-blue-300 hover:text-white transition-colors"
          >
            See how it works
            <ChevronDown size={16} />
          </button>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-6 justify-center items-center mt-14 text-sm text-blue-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {["No credit card required", "Free forever plan", "Connect in 60 seconds"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        <ChevronDown size={24} className="text-blue-500" />
      </motion.div>
    </section>
  );
};

// ─── Stats strip ─────────────────────────────────────────────────────────────
const StatItem = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const { ref, count } = useCounter(value);

  return (
    <div className="text-center">
      <div className="text-4xl font-black text-white mb-1">
        <span ref={ref}>{count}</span>
        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          {suffix}
        </span>
      </div>
      <p className="text-sm text-blue-300">{label}</p>
    </div>
  );
};

const StatsSection = () => (
  <section className="py-20 bg-[#071530] border-y border-blue-900/40">
    <div className="max-w-6xl mx-auto px-6">
      <FadeUp>
        <p className="text-center text-blue-400 text-sm font-semibold uppercase tracking-widest mb-12">
          The rewards gap is real
        </p>
      </FadeUp>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        {[
          { value: 300, suffix: "B+", label: "in unclaimed rewards annually" },
          { value: 74, suffix: "%", label: "of cardholders don't maximize rewards" },
          { value: 384, suffix: "%", label: "avg value boost with smart redemption" },
          { value: 38, suffix: " cards", label: "avg number of cards per American household" },
        ].map((s) => (
          <FadeUp key={s.label} delay={0.1}>
            <StatItem {...s} />
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);

// ─── Features ────────────────────────────────────────────────────────────────
const features = [
  {
    icon: CreditCard,
    title: "All your cards, one view",
    desc: "Connect every credit card you own. Perkasm syncs your balances, points, and earn rates in real time — no more logging into five different apps.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Best card at every swipe",
    desc: "Buying groceries? Flying to Tokyo? Our AI tells you exactly which card maximizes points for every purchase category, in real time.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Portfolio analytics",
    desc: "Track your total rewards portfolio value across all programs — cash back, airline miles, hotel points — in one unified dollar figure.",
    color: "from-blue-600 to-indigo-700",
  },
  {
    icon: Gift,
    title: "Smarter redemptions",
    desc: "Don't leave value on the table by cashing out for pennies. Perkasm surfaces the highest-value redemption options for your points.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "AI spending insights",
    desc: "Our AI analyzes your transaction history to surface missed opportunities, recommend new cards, and alert you before annual fees hit.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Bank-level security",
    desc: "Read-only connections, end-to-end encryption, and zero storage of your banking credentials. Your data never leaves you.",
    color: "from-blue-500 to-cyan-500",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-28 bg-gradient-to-b from-[#040d1c] to-[#050d1f]">
    <div className="max-w-7xl mx-auto px-6">
      <FadeUp className="text-center mb-20">
        <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest block mb-4">Features</span>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            win at rewards
          </span>
        </h2>
        <p className="text-blue-200/70 text-lg max-w-xl mx-auto">
          The average Perkasm user finds $47/month in missed rewards within their first week.
        </p>
      </FadeUp>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FadeUp key={f.title} delay={i * 0.08}>
            <motion.div
              className="group p-6 rounded-2xl border border-blue-900/40 bg-blue-950/20 hover:bg-blue-950/40 hover:border-blue-700/60 transition-all cursor-default"
              whileHover={{ y: -4 }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-blue-300/80 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);

// ─── How it works ─────────────────────────────────────────────────────────────
const HowItWorksSection = () => {
  const steps = [
    {
      num: "01",
      title: "Connect your cards",
      desc: "Link your credit cards securely in under 60 seconds. We support all major US issuers.",
      icon: CreditCard,
    },
    {
      num: "02",
      title: "We analyze everything",
      desc: "Our AI maps your spending patterns, earn rates, and reward program values automatically.",
      icon: Sparkles,
    },
    {
      num: "03",
      title: "Earn more, every day",
      desc: "Get real-time card recommendations, redemption alerts, and monthly optimization reports.",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-28 bg-[#050d1f]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-20">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest block mb-4">How It Works</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Up and running in{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              60 seconds
            </span>
          </h2>
        </FadeUp>

        <div className="relative">
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.15}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/30">
                    <step.icon size={26} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-500 tracking-widest mb-2 block">{step.num}</span>
                  <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-blue-300/70 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Pricing ─────────────────────────────────────────────────────────────────
const PricingSection = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for getting started with rewards optimization.",
      features: [
        "Up to 3 credit cards",
        "Basic portfolio summary",
        "Monthly optimization report",
        "Card recommendation engine",
      ],
      cta: "Get started free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      desc: "For serious rewards maximizers who want every dollar working harder.",
      features: [
        "Unlimited credit cards",
        "Real-time card recommendations",
        "AI spending insights",
        "Transfer partner optimization",
        "Annual fee tracker & alerts",
        "Priority support",
      ],
      cta: "Start Pro free for 14 days",
      highlight: true,
    },
    {
      name: "Family",
      price: "$19",
      period: "per month",
      desc: "Manage rewards for the whole household in one place.",
      features: [
        "Everything in Pro",
        "Up to 5 household members",
        "Combined portfolio view",
        "Shared redemption planning",
        "Family spending insights",
      ],
      cta: "Start Family free for 14 days",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-28 bg-gradient-to-b from-[#050d1f] to-[#071530]">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="text-center mb-20">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest block mb-4">Pricing</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Simple, honest pricing
          </h2>
          <p className="text-blue-200/70 text-lg">
            The average Pro user earns back their subscription cost in{" "}
            <span className="text-white font-semibold">the first day</span>.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1}>
              <div
                className={`relative rounded-3xl p-8 border transition-all ${
                  plan.highlight
                    ? "border-blue-500/60 bg-gradient-to-b from-blue-950/80 to-indigo-950/60 shadow-2xl shadow-blue-600/20 scale-105"
                    : "border-blue-900/40 bg-blue-950/20"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-blue-400 text-sm mb-1">/ {plan.period}</span>
                </div>
                <p className="text-blue-300/70 text-sm mb-7 leading-relaxed">{plan.desc}</p>
                <motion.button
                  onClick={() => navigate("/auth")}
                  className={`w-full py-3 rounded-full text-sm font-semibold transition-all mb-8 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
                      : "border border-blue-700/50 text-blue-300 hover:bg-blue-900/40 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-blue-200/80">
                      <Check size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "How does Perkasm connect to my credit cards?",
    a: "We use read-only bank connections via industry-standard OAuth. We never store your banking credentials and cannot initiate transactions. Think of it as a view-only window into your rewards data.",
  },
  {
    q: "Is my financial data safe?",
    a: "Absolutely. All data is encrypted in transit and at rest using AES-256. We are SOC 2 Type II compliant and undergo regular third-party security audits.",
  },
  {
    q: "Which credit cards are supported?",
    a: "We support all major US issuers including Chase, American Express, Citi, Capital One, Bank of America, Wells Fargo, and over 50 more. More issuers are added every month.",
  },
  {
    q: "How does the AI recommendation engine work?",
    a: "Our AI analyzes your transaction history and spending patterns against the full earn rates, bonus categories, and redemption values of every card in your wallet. It tells you which card to use for each purchase to maximize the value you earn.",
  },
  {
    q: "Can I cancel my Pro subscription at any time?",
    a: "Yes. You can cancel anytime from your account settings. Your Pro features remain active until the end of the billing period with no hidden fees.",
  },
  {
    q: "Does Perkasm work for business credit cards?",
    a: "Business card support is on our roadmap. Sign up with your email to be notified when it launches.",
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div className="border-b border-blue-900/40 last:border-0" initial={false}>
      <button
        className="w-full text-left py-5 flex items-center justify-between gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span className="text-white font-medium text-sm sm:text-base group-hover:text-blue-300 transition-colors">
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-blue-500 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-blue-300/80 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQSection = () => (
  <section id="faq" className="py-28 bg-[#071530]">
    <div className="max-w-3xl mx-auto px-6">
      <FadeUp className="text-center mb-16">
        <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest block mb-4">FAQ</span>
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
          Questions? We've got{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            answers
          </span>
        </h2>
      </FadeUp>
      <FadeUp>
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 px-6">
          {faqs.map((f) => (
            <FAQItem key={f.q} {...f} />
          ))}
        </div>
      </FadeUp>
    </div>
  </section>
);

// ─── CTA / Contact ────────────────────────────────────────────────────────────
const ContactSection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="contact" className="py-28 bg-gradient-to-b from-[#071530] to-[#050d1f]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeUp>
          <div
            className="relative rounded-3xl p-14 overflow-hidden border border-blue-700/30"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(29,78,216,0.15) 100%)" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-blue-600/20 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="flex -space-x-2">
                  {["bg-blue-400", "bg-indigo-500", "bg-blue-500", "bg-sky-500"].map((c, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-[#071530] flex items-center justify-center`}>
                      <Star size={14} className="text-white" fill="white" />
                    </div>
                  ))}
                </div>
                <span className="ml-3 text-blue-300 text-sm self-center">Join thousands of optimizers</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
                Stop leaving money
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  on the table
                </span>
              </h2>
              <p className="text-blue-200/70 text-lg mb-10 max-w-xl mx-auto">
                Start for free. No credit card required. Find your missed rewards in under 5 minutes.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-5 py-3 rounded-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-400 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                  <motion.button
                    type="submit"
                    className="px-7 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Get notified
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 py-3 px-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm inline-block"
                >
                  <Check size={14} className="inline mr-2" />
                  You're on the list — we'll be in touch!
                </motion.div>
              )}

              <motion.button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all mx-auto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign up with Google
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-[#030a18] border-t border-blue-900/30 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-white font-bold">Perkasm</span>
            </div>
            <p className="text-blue-400 text-sm leading-relaxed">
              AI-powered credit card rewards optimization for everyone.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              {[["features", "Features"], ["pricing", "Pricing"], ["faq", "FAQ"]].map(([id, label]) => (
                <li key={id}>
                  <button onClick={() => scrollTo(id)} className="text-blue-400 hover:text-white text-sm transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Press"].map((item) => (
                <li key={item}>
                  <span className="text-blue-400 text-sm cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Security", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <span className="text-blue-400 text-sm cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-900/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-blue-500 text-xs">© 2026 Perkasm, Inc. All rights reserved.</p>
          <p className="text-blue-500 text-xs flex items-center gap-1">
            <DollarSign size={12} />
            Built for reward maximizers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

// ─── Main export ─────────────────────────────────────────────────────────────
const Landing = () => (
  <div className="overflow-x-hidden">
    <LandingNav />
    <HeroSection />
    <StatsSection />
    <FeaturesSection />
    <HowItWorksSection />
    <PricingSection />
    <FAQSection />
    <ContactSection />
    <Footer />
  </div>
);

export default Landing;
