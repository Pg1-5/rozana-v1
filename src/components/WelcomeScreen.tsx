import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onStart: () => void;
}

const APP_NAME = 'ROZANA';

export default function WelcomeScreen({ onStart }: Props) {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visibleLetters < APP_NAME.length) {
      const timer = setTimeout(() => setVisibleLetters((v) => v + 1), 180);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowContent(true), 400);
      return () => clearTimeout(timer);
    }
  }, [visibleLetters]);

  return (
    <div className="min-h-screen bg-background vitale-gradient flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[520px] text-center">
        {/* Typewriter title */}
        <div className="mb-4">
          <span className="text-muted-foreground font-body text-lg tracking-wide">Welcome to</span>
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-widest mb-8 min-h-[72px]">
          {APP_NAME.split('').map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={i < visibleLetters ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="inline-block text-primary"
            >
              {letter}
            </motion.span>
          ))}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block w-[3px] h-10 sm:h-12 bg-primary ml-1 align-middle"
          />
        </h1>

        {/* Description + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-10"
          style={{ visibility: showContent ? 'visible' : 'hidden' }}
        >
          <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-sm mx-auto">
            Your adaptive health companion that understands your day and helps you stay in rhythm with your health.
          </p>

          <button
            onClick={onStart}
            className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            Let's get started
          </button>
        </motion.div>
      </div>
    </div>
  );
}
