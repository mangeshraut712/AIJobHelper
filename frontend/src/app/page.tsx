"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Link2,
  MessageSquare,
  Zap,
  Shield,
  CheckCircle2,
  Target,
  Upload,
  Star,
  LayoutDashboard,
  ClipboardCheck,
  PenTool,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Analyze Any Job Posting",
    description: "Paste any job URL and our AI instantly extracts requirements, skills, and company details.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Target,
    title: "Smart Resume Scoring",
    description: "Get a REAL match score based on your skills vs job requirements. No fake numbers.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: FileText,
    title: "Resume Enhancement",
    description: "AI suggestions to tailor your resume for each specific job application.",
    gradient: "from-orange-500 to-red-400",
  },
  {
    icon: MessageSquare,
    title: "Cover Letters & Messages",
    description: "Generate personalized cover letters, LinkedIn messages, and follow-up emails.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: LayoutDashboard,
    title: "Application Tracker",
    description: "Track all the jobs you're applying to in one place with status updates.",
    gradient: "from-indigo-500 to-violet-400",
  },
  {
    icon: ClipboardCheck,
    title: "Skills Gap Analysis",
    description: "See which skills you have and which ones you need to develop for each role.",
    gradient: "from-pink-500 to-rose-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Paste Job URL",
    description: "Copy any job posting URL from LinkedIn, Indeed, Greenhouse, or any job board.",
    icon: Link2,
  },
  {
    step: "02",
    title: "AI Analyzes",
    description: "Our AI extracts requirements, skills needed, company details, and more.",
    icon: Target,
  },
  {
    step: "03",
    title: "Enhance & Apply",
    description: "Get a tailored resume, cover letter, and messages ready to send.",
    icon: PenTool,
  },
];

const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
    animate={{
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />

        {/* Floating Orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-primary/40 -top-40 -left-40" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-purple-500/30 -bottom-20 -right-20" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bg-cyan-500/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={4} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,113,227,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,113,227,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-medium backdrop-blur-sm">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent font-semibold">
                  Job Application Helper
                </span>
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.95]"
            >
              Apply smarter,
              <br />
              <GradientText>not harder</GradientText>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Paste any job URL → Get AI-analyzed requirements →
              <span className="text-foreground font-medium"> Tailored resume & cover letter in seconds</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-16"
            >
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,113,227,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-lg shadow-lg shadow-primary/25 overflow-hidden"
                >
                  <span className="relative z-10">Analyze a Job</span>
                  <Link2 size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </Link>
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 font-semibold text-lg hover:bg-secondary transition-colors"
                >
                  <span>Upload Resume</span>
                  <Upload size={18} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-8"
            >
              {[
                { icon: Zap, text: "Works with any job board" },
                { icon: Shield, text: "Your data stays private" },
                { icon: Star, text: "Real match scores, no BS" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <item.icon size={16} className="text-primary" />
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 rounded-full bg-muted-foreground/50"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <FloatingOrb className="w-[500px] h-[500px] bg-primary/20 top-20 -right-40" delay={1} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
              <CheckCircle2 size={14} />
              Dead Simple
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From job URL to application-ready in 3 steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/50 to-primary/10" />
                )}

                <div className="relative text-center">
                  {/* Step Number */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative inline-flex"
                  >
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/30">
                      <item.icon className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary">
                      {item.step}
                    </div>
                  </motion.div>

                  <h3 className="text-2xl font-bold mt-8 mb-4">{item.title}</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap size={14} />
              Everything You Need
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Tools that actually
              <br />
              <GradientText>help you get hired</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No fluff, no fake scores. Just practical tools to make your job applications better.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative h-full p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 overflow-hidden transition-colors"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-purple-600" />
        <FloatingOrb className="w-[600px] h-[600px] bg-white/10 -top-40 -left-40" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-purple-300/10 -bottom-20 -right-20" delay={2} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-8"
            >
              <Link2 className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
              Ready to apply smarter?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Paste your first job URL and see the magic. No signup required.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-primary font-semibold text-lg shadow-xl hover:bg-white/95 transition-colors"
                >
                  Analyze a Job Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  View Dashboard
                </motion.button>
              </Link>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              {[
                { icon: Zap, text: "Works Instantly" },
                { icon: Shield, text: "100% Private" },
                { icon: Star, text: "Free to Use" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80">
                  <item.icon size={18} />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
