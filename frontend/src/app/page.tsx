"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Target,
  MessageSquare,
  Zap,
  Shield,
  Users,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Bot,
  Wand2,
  Upload,
  Star,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description: "AI-powered resume optimization that gets you noticed by recruiters and passes ATS systems.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Target,
    title: "Intelligent Job Matching",
    description: "Find perfect job matches with skill-based analysis and compatibility scoring.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: MessageSquare,
    title: "AI Cover Letters",
    description: "Generate personalized, compelling cover letters tailored to each position.",
    gradient: "from-orange-500 to-red-400",
  },
  {
    icon: Bot,
    title: "Auto-Fill Applications",
    description: "Let AI handle the tedious form filling. One click to apply anywhere.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Career Analytics",
    description: "Track your applications, get insights, and optimize your job search strategy.",
    gradient: "from-indigo-500 to-violet-400",
  },
  {
    icon: Wand2,
    title: "Resume Enhancement",
    description: "AI suggestions to improve your resume for specific job requirements.",
    gradient: "from-pink-500 to-rose-400",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "85%", label: "Success Rate" },
  { value: "10x", label: "Faster Applications" },
  { value: "500+", label: "Companies Trust Us" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content: "CareerAgentPro helped me land my dream job at Google. The AI-optimized resume got me 3x more interviews!",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "Product Manager at Meta",
    content: "The auto-fill feature saved me hours every day. I could focus on preparing for interviews instead of copying data.",
    avatar: "MR",
  },
  {
    name: "Emily Johnson",
    role: "Data Scientist at Netflix",
    content: "The job matching algorithm is incredible. Every suggestion was spot-on for my skills and career goals.",
    avatar: "EJ",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description: "Simply upload your existing resume or start fresh. Our AI extracts and organizes your information instantly.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Discover Opportunities",
    description: "Browse AI-curated job recommendations perfectly matched to your skills, experience, and preferences.",
    icon: Briefcase,
  },
  {
    step: "03",
    title: "Apply with Confidence",
    description: "Generate tailored resumes and cover letters for each application with one click.",
    icon: CheckCircle2,
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
                  AI-Powered Career Platform
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">New</span>
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.95]"
            >
              Your career journey,
              <br />
              <GradientText>supercharged by AI</GradientText>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Stop spending hours on applications. Let AI optimize your resume,
              find perfect matches, and land your dream job <span className="text-foreground font-medium">10x faster</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-16"
            >
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,113,227,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-lg shadow-lg shadow-primary/25 overflow-hidden"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 font-semibold text-lg hover:bg-secondary transition-colors"
                >
                  <span>Watch Demo</span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowRight size={14} className="text-primary" />
                  </div>
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
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
              Powerful Features
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Everything you need to
              <br />
              <GradientText>land your dream job</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed to streamline your job search and maximize your success rate.
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
              Simple Process
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Get started in
              <br />
              <GradientText>three simple steps</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From upload to offer, we&apos;ve streamlined the entire job search journey.
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

      {/* Testimonials */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium mb-6">
              <Star size={14} />
              Success Stories
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Loved by professionals
              <br />
              <GradientText>worldwide</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their job search with CareerAgentPro.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/20 transition-colors"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-lg mb-8 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
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
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
              Ready to accelerate
              <br />
              your career?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Join over 50,000 professionals who have already transformed their job search.
              Start for free, no credit card required.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-primary font-semibold text-lg shadow-xl hover:bg-white/95 transition-colors"
                >
                  Start Free Today
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Browse Jobs
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
                { icon: Zap, text: "Instant Setup" },
                { icon: Shield, text: "Enterprise Security" },
                { icon: Users, text: "24/7 Support" },
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
