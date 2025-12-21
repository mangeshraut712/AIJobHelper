"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Globe, FileText, Brain, CheckCircle2, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [currentScore, setCurrentScore] = useState(0);
  const animationStarted = useRef(false);

  useEffect(() => {
    if (animationStarted.current) return;
    animationStarted.current = true;
    // Animate the score
    const timer = setInterval(() => {
      setCurrentScore((prev) => {
        if (prev >= 92) {
          clearInterval(timer);
          return 92;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-24 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[120px] -z-10 rounded-full" />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-8 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-xs font-bold text-blue-400"
        >
          <Sparkles size={14} className="text-yellow-500" />
          <span>Powered by Google Gemini 2.0 Flash AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]"
        >
          <span className="text-gradient-primary">Your AI Career</span> <br />
          <span className="text-foreground">Architecture.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-[600px] text-lg text-muted-foreground leading-relaxed"
        >
          An all-in-one AI ecosystem that analyzes job postings, optimizes your resume,
          generates personalized outreach, and helps you land your dream role.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-blue-500/25">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <Link href="#features" className="px-8 py-4 bg-secondary text-foreground rounded-full font-semibold hover:bg-secondary/80 transition-colors">
            View Features
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 mt-8 text-center"
        >
          <StatItem icon={<FileText size={20} />} value="500+" label="Resumes Enhanced" />
          <StatItem icon={<TrendingUp size={20} />} value="92%" label="Avg Match Score" />
          <StatItem icon={<Users size={20} />} value="1000+" label="Jobs Analyzed" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
        id="features"
      >
        <FeatureCard
          icon={<Brain size={24} />}
          title="AI Job Analyst"
          description="Paste any job URL and instantly extract requirements, salary, and key responsibilities."
          href="/jobs"
          color="blue"
        />
        <FeatureCard
          icon={<Zap size={24} />}
          title="Resume Studio"
          description="AI-powered resume optimization with ATS scoring and keyword matching."
          href="/resumes"
          color="purple"
        />
        <FeatureCard
          icon={<Globe size={24} />}
          title="Outreach Studio"
          description="Generate personalized LinkedIn messages, emails, and follow-ups instantly."
          href="/communication"
          color="green"
        />
        <FeatureCard
          icon={<Shield size={24} />}
          title="Smart Profile"
          description="Upload your resume once and let AI extract and organize your career data."
          href="/profile"
          color="orange"
        />
      </motion.section>

      {/* Interactive Demo Section */}
      <section className="flex justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-5xl glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="japanese-dot-grid absolute inset-0 opacity-20" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                <CheckCircle2 size={14} />
                Live AI Demo
              </div>
              <h2 className="text-4xl font-bold">Resume Match Scoring</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our AI analyzes your resume against job descriptions in real-time,
                providing actionable feedback and a compatibility score.
              </p>
              <ul className="space-y-3">
                <CheckItem text="Keyword density analysis" />
                <CheckItem text="Skills gap identification" />
                <CheckItem text="ATS compatibility check" />
                <CheckItem text="Personalized improvement tips" />
              </ul>
              <Link
                href="/resumes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Try Resume Studio
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right: Interactive Score Demo */}
            <div className="flex justify-center">
              <div className="w-72 h-72 rounded-3xl bg-secondary/50 border border-border flex flex-col items-center justify-center gap-4 relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    className="text-secondary"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="60"
                    cx="80"
                    cy="80"
                  />
                  <motion.circle
                    initial={{ strokeDasharray: "0 377" }}
                    animate={{ strokeDasharray: `${(currentScore / 100) * 377} 377` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-green-500"
                    strokeWidth="12"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="60"
                    cx="80"
                    cy="80"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{currentScore}</span>
                  <span className="text-sm text-muted-foreground font-medium">Match Score</span>
                </div>
                <div className="absolute bottom-6 flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">ATS Ready</span>
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold">Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to supercharge your job search</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard number={1} title="Upload Resume" description="Upload your resume or paste your LinkedIn profile to get started." />
          <StepCard number={2} title="Paste Job URL" description="Paste any job posting URL and our AI will analyze the requirements." />
          <StepCard number={3} title="Get Optimized" description="Receive a tailored resume, cover letter, and personalized outreach messages." />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of professionals using AI to accelerate their career journey.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
          >
            Start Free Today
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-secondary text-muted-foreground">{icon}</div>
      <div className="text-left">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, href, color }: { icon: React.ReactNode, title: string, description: string, href: string, color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-600 to-blue-400",
    purple: "from-purple-600 to-purple-400",
    green: "from-green-600 to-green-400",
    orange: "from-orange-600 to-orange-400",
  };

  return (
    <Link href={href}>
      <div className="p-6 rounded-3xl bg-secondary/30 border border-border flex flex-col gap-4 text-left group hover:bg-secondary/50 hover:border-foreground/20 transition-all cursor-pointer h-full">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        <div className="mt-auto flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Explore <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 size={18} className="text-green-500" />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="text-center p-6 rounded-3xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
