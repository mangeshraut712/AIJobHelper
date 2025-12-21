import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const appleTransition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1] as const, // Cubic bezier for Apple-like smoothness
}

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}
