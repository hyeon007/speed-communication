'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

type MotionStaggerProps = {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  stagger?: number;
};

type MotionItemProps = {
  children: ReactNode;
  className?: string;
};

type MotionHoverCardProps = {
  children: ReactNode;
  className?: string;
  hoverY?: number;
};

type MotionImageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

export function MotionSection({ children, className, delay = 0 }: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, ease: easeOut, delay }}
    >
      {children}
    </motion.section>
  );
}

export function MotionStagger({
  children,
  className,
  delayChildren = 0,
  stagger = 0.08,
}: MotionStaggerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className }: MotionItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.55,
            ease: easeOut,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionHoverCard({ children, className, hoverY = -4 }: MotionHoverCardProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: hoverY }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.35, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function MotionImageReveal({ children, className, delay = 0 }: MotionImageRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, clipPath: 'inset(6% 0% 6% 0%)' }}
      whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.75, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
