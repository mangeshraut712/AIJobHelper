"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
}

export function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
    const sizes = {
        sm: { ring: "w-5 h-5", dot: "w-1 h-1" },
        md: { ring: "w-8 h-8", dot: "w-1.5 h-1.5" },
        lg: { ring: "w-12 h-12", dot: "w-2 h-2" },
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className="relative">
                {/* Outer ring */}
                <motion.div
                    className={`${sizes[size].ring} rounded-full border-2 border-primary/20`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <motion.div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                </motion.div>

                {/* Animated gradient ring */}
                <motion.div
                    className={`absolute inset-0 ${sizes[size].ring} rounded-full border-2 border-transparent`}
                    style={{
                        borderTopColor: "var(--primary)",
                        borderRightColor: "transparent",
                        borderBottomColor: "transparent",
                        borderLeftColor: "transparent",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}

// Full page loading overlay
export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-lg font-medium">{text}</p>
            </div>
        </motion.div>
    );
}

// Inline loading dots
export function LoadingDots({ className = "" }: { className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-current"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </span>
    );
}
