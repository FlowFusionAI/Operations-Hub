import type { Variants, Transition } from "framer-motion"

/**
 * Animation presets for Operations Hub.
 * Import from here — never define inline animation configs.
 *
 * Aesthetic: Linear / Vercel / Raycast — subtle, professional, performant.
 */

// ─── Transitions ────────────────────────────────────────

export const transitions = {
  /** Most UI interactions */
  smooth: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } satisfies Transition,

  /** Quick feedback — buttons, toggles */
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 35,
  } satisfies Transition,

  /** Page transitions, large elements */
  gentle: {
    type: "spring",
    stiffness: 200,
    damping: 28,
  } satisfies Transition,

  /** Tween for complex orchestrations */
  tween: {
    duration: 0.4,
    ease: [0.25, 0.46, 0.45, 0.94],
  } satisfies Transition,
}

// ─── Page Transitions ───────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.gentle,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
}

// ─── Card / Component Entrance ──────────────────────────

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.smooth,
  },
}

// ─── Staggered Lists ────────────────────────────────────

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.smooth,
  },
}

// ─── Micro-interactions ─────────────────────────────────

export const buttonHover = {
  scale: 1.02,
  transition: transitions.snappy,
}

export const buttonTap = {
  scale: 0.98,
  transition: transitions.snappy,
}

// ─── Background Animations ──────────────────────────────

export const floatingOrbVariants = (delay: number = 0): Variants => ({
  animate: {
    x: [0, 30, -20, 0],
    y: [0, -40, 20, 0],
    scale: [1, 1.08, 0.95, 1],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    },
  },
})

// ─── Slide In ───────────────────────────────────────────

export const slideInVariants: Variants = {
  hidden: {
    x: -20,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
}

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

// ─── Modal / Dialog ─────────────────────────────────────

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
}

// ─── Toast / Notification ───────────────────────────────

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

// ─── Loading States ─────────────────────────────────────

export const pulseVariants: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}
