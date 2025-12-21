"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, FileText, Mail, LayoutDashboard, User } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Resumes", href: "/resumes", icon: FileText },
  { name: "Communication", href: "/communication", icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-full px-6 py-3 flex items-center gap-8 subtle-shadow"
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">CP</span>
          </div>
          <span className="hidden md:block tracking-tight">CareerAgentPro</span>
        </Link>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1 px-2"
            >
              <item.icon size={18} />
              <span className="hidden sm:block">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </Link>
          );
        })}

        <div className="w-px h-6 bg-border mx-2" />

        <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <User size={18} />
          <span className="hidden sm:block">Profile</span>
        </Link>
      </motion.div>
    </nav>
  );
}
