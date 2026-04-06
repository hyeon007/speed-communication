'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { SupportPromoNote } from '@/components/support-promo-note';

export function HeroShowcase() {
  const reduceMotion = useReducedMotion();
  const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

  return (
    <section className="relative">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={reduceMotion ? undefined : { duration: 1, delay: 0.2 }}
        className="text-xs tracking-[0.3em] uppercase text-[#c17f59]"
      >
        SMARTPHONE CONSULTING EXPERIENCE
      </motion.p>

      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 1.2, delay: 0.3, ease: easeOut }}
        className="mt-8 max-w-3xl font-serif text-4xl font-normal leading-[1.15] text-[#1a1a1a] md:text-6xl md:leading-[1.1]"
      >
        새 휴대폰, 가장 유리한 조건으로
        <span className="block mt-2 text-[#c17f59]">전문가가 직접 상담합니다.</span>
      </motion.h1>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={reduceMotion ? undefined : { duration: 1, delay: 0.5 }}
        className="mt-8 max-w-2xl text-sm leading-7 text-[#5a5a5a] md:text-base md:leading-8"
      >
        온라인 결제 없이, 문의만 남기면 상담원이 맞춤 요금제·기기 혜택을 빠르게 안내해드립니다.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={reduceMotion ? undefined : { duration: 1, delay: 0.6 }}
      >
        <SupportPromoNote variant="banner" className="max-w-3xl" />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={reduceMotion ? undefined : { duration: 1, delay: 0.7 }}
        className="mt-12 flex flex-wrap gap-4"
      >
        {['당일 콜백', '요금제 최적화', '가족결합 설계', '조건부 최대 50만원'].map((text, index) => (
          <motion.span
            key={text}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.8 + index * 0.1, ease: easeOut }}
            className="border border-[#e5e0d8] px-5 py-3 text-xs tracking-[0.15em] uppercase text-[#5a5a5a] transition-colors duration-300 hover:border-[#d6b6a3] hover:text-[#3a3a3a]"
          >
            {text}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}
