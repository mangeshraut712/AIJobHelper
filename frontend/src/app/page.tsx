"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

      <section className="flex flex-col items-center text-center gap-8 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground"
        >
          <Sparkles size={12} className="text-yellow-500" />
          <span>Next-Gen Job Application Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tight heading-gradient leading-[1.1]"
        >
          Your AI Career <br />
          <span className="text-foreground">Architecture.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-[600px] text-lg text-muted-foreground leading-relaxed"
        >
          An all-in-one ecosystem designed to automate your job search, enhance your resume,
          and land your dream role with precision engineering and AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          <Link href="/dashboard" className="px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link href="#features" className="px-8 py-4 bg-secondary text-foreground rounded-full font-semibold hover:bg-secondary/80 transition-colors">
            View Features
          </Link>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
        id="features"
      >
        <FeatureCard
          icon={<Zap size={24} />}
          title="Instant Enhancement"
          description="Automatically tailor your resume to any job description in seconds using advanced LLMs."
        />
        <FeatureCard
          icon={<Globe size={24} />}
          title="Global Autofill"
          description="Seamlessly integrate with Greenhouse, Lever, and other major ATS platforms for one-click applications."
        />
        <FeatureCard
          icon={<Shield size={24} />}
          title="Secure & Private"
          description="Your career data is encrypted and secure. We prioritize your privacy above everything else."
        />
      </motion.section>

      {/* Decorative Job Card Preview */}
      <section className="flex justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-4xl glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="japanese-dot-grid absolute inset-0 opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold">Resume Scoring</h2>
              <p className="text-muted-foreground">
                Get real-time feedback and a detailed compatibility score
                against any job description before you hit apply.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">92/100 Match</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">ATS Optimized</span>
              </div>
            </div>
            <div className="w-full md:w-80 h-48 bg-secondary/50 rounded-2xl flex items-center justify-center border border-border">
              <span className="text-muted-foreground italic">Interactive Preview Component</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-secondary/30 border border-border flex flex-col gap-4 text-left group hover:bg-secondary/50 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
