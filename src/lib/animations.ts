export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
};

export const staggerChildren = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const parallaxReveal = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0 },
};

export const beadRipple = {
  initial: { scale: 0, opacity: 0.6 },
  animate: { scale: 1, opacity: 0 },
  transition: { duration: 0.9, ease: "easeOut" },
};
