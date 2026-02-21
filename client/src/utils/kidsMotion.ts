import type { Transition, Variants } from "framer-motion";

const KIDS_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const KIDS_DURATION = {
  fast: 0.2,
  base: 0.28,
  slow: 0.34,
} as const;

const withReducedDuration = (reduced: boolean, duration: number) => (reduced ? 0 : duration);

export const kidsMotion = {
  easing: KIDS_EASE,
  duration: KIDS_DURATION,
  transition: (reduced: boolean, duration: number = KIDS_DURATION.base): Transition => ({
    duration: withReducedDuration(reduced, duration),
    ease: KIDS_EASE,
  }),
  pageVariants: (reduced: boolean): Variants => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -10 },
  }),
  listStaggerVariants: (reduced: boolean): Variants => ({
    initial: {},
    animate: {
      transition: {
        staggerChildren: reduced ? 0 : 0.055,
        delayChildren: reduced ? 0 : 0.03,
      },
    },
  }),
  listItemVariants: (reduced: boolean): Variants => ({
    initial: { opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.985 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: withReducedDuration(reduced, KIDS_DURATION.base),
        ease: KIDS_EASE,
      },
    },
  }),
  pageFlipNext: {
    initial: {
      opacity: 0,
      x: 38,
      rotateY: 14,
      boxShadow: "0px 4px 10px rgba(0,0,0,0.10)",
    },
    animate: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      boxShadow: "0px 0px 0px rgba(0,0,0,0.00)",
      transition: {
        duration: KIDS_DURATION.base,
        ease: KIDS_EASE,
      },
    },
    exit: {
      opacity: 0,
      x: -36,
      rotateY: -13,
      boxShadow: "0px 8px 18px rgba(0,0,0,0.18)",
      transition: {
        duration: KIDS_DURATION.base,
        ease: KIDS_EASE,
      },
    },
  } as Variants,
  pageFlipPrev: {
    initial: {
      opacity: 0,
      x: -38,
      rotateY: -14,
      boxShadow: "0px 4px 10px rgba(0,0,0,0.10)",
    },
    animate: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      boxShadow: "0px 0px 0px rgba(0,0,0,0.00)",
      transition: {
        duration: KIDS_DURATION.base,
        ease: KIDS_EASE,
      },
    },
    exit: {
      opacity: 0,
      x: 36,
      rotateY: 13,
      boxShadow: "0px 8px 18px rgba(0,0,0,0.18)",
      transition: {
        duration: KIDS_DURATION.base,
        ease: KIDS_EASE,
      },
    },
  } as Variants,
  pageFlipReduced: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: KIDS_EASE,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: KIDS_EASE,
      },
    },
  } as Variants,
  fadeScaleVariants: (reduced: boolean): Variants => ({
    initial: { opacity: 0, scale: reduced ? 1 : 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: withReducedDuration(reduced, KIDS_DURATION.base),
        ease: KIDS_EASE,
      },
    },
    exit: {
      opacity: 0,
      scale: reduced ? 1 : 0.98,
      transition: {
        duration: withReducedDuration(reduced, KIDS_DURATION.fast),
        ease: KIDS_EASE,
      },
    },
  }),
  buttonMotion: (reduced: boolean) =>
    reduced
      ? {}
      : {
          whileHover: { scale: 1.03 },
          whileTap: { scale: 0.96 },
          transition: {
            duration: KIDS_DURATION.fast,
            ease: KIDS_EASE,
          },
        },
} as const;
