import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: (reflection: string) => void;
}

const options = [
  { id: 'on_track', label: 'On track', emoji: '✨', response: 'Good rhythm. This is how change builds.' },
  { id: 'almost', label: 'Almost there', emoji: '🌱', response: 'Close enough. Every small step counts.' },
  { id: 'not_today', label: 'Not today', emoji: '🌙', response: "That's alright. Consistency isn't perfection. Tomorrow is a fresh start." },
];

export default function EveningReflection({ onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedOption = options.find((o) => o.id === selected);

  return (
    <div className="min-h-screen bg-background vitale-gradient flex items-center justify-center px-6">
      <div className="w-full max-w-[520px]">
        <motion.h1
          className="font-heading text-3xl font-semibold mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          How did today go?
        </motion.h1>

        <div className="space-y-4 mb-10">
          {options.map((opt, i) => (
            <motion.button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full p-5 rounded-lg text-left transition-all ${
                selected === opt.id ? 'card-surface-selected' : 'card-surface hover:bg-card-hover'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-body text-lg">{opt.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              className="rounded-lg p-5 mb-10"
              style={{ background: 'hsl(76 86% 67% / 0.08)', border: '1px solid hsl(76 86% 67% / 0.15)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-body text-foreground leading-relaxed">{selectedOption.response}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {selected && (
          <motion.button
            onClick={() => onComplete(selected)}
            className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            See you tomorrow
          </motion.button>
        )}
      </div>
    </div>
  );
}
