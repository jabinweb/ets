import { Variants } from "framer-motion"

// Animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

export const slideInFromLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export const slideInFromRight: Variants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

// Floating animation
export const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    ease: "easeInOut",
    repeat: Infinity,
  },
}

// Glow animation
export const glowAnimation = {
  boxShadow: [
    "0 0 20px hsl(var(--primary) / 0.3)",
    "0 0 30px hsl(var(--primary) / 0.6)",
    "0 0 20px hsl(var(--primary) / 0.3)",
  ],
  transition: {
    duration: 2,
    ease: "easeInOut",
    repeat: Infinity,
  },
}

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: "easeInOut",
  },
}

export const hoverGlow = {
  boxShadow: "0 10px 30px hsl(var(--primary) / 0.3)",
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
}
