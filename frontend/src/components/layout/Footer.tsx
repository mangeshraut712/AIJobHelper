"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-border bg-background/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">CareerAgentPro</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your AI-powered career co-pilot. Automate your job search and land your dream role.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com/mangeshraut712" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="https://linkedin.com/in/mangeshraut71298" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="mailto:mbr63drexel@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                            <li><Link href="/resumes" className="hover:text-foreground transition-colors">Resume Studio</Link></li>
                            <li><Link href="/jobs" className="hover:text-foreground transition-colors">Job Analysis</Link></li>
                            <li><Link href="/communication" className="hover:text-foreground transition-colors">Outreach Studio</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="https://github.com/mangeshraut712/AIJobHelper" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                            <li><a href="https://github.com/mangeshraut712/AIJobHelper#-api-endpoints" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">API Docs</a></li>
                            <li><a href="https://github.com/mangeshraut712/AIJobHelper/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contributing</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                            <li><a href="https://github.com/mangeshraut712/AIJobHelper/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">MIT License</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        © {currentYear} CareerAgentPro. Built with <Heart size={14} className="text-red-500" /> by Mangesh Raut
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Powered by Next.js, FastAPI & Gemini AI
                    </p>
                </div>
            </div>
        </footer>
    );
}
