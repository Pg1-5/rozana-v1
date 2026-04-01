import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import ScreenNav from '@/components/ScreenNav';

interface Props {
  onComplete: (reflection: string, shared?: boolean) => void;
  onBack?: () => void;
}

const options = [
  { id: 'on_track', label: 'On track', emoji: '\u2728', response: 'Good rhythm. This is how change builds.' },
  { id: 'almost', label: 'Almost there', emoji: '\uD83C\uDF31', response: 'Close enough. Every small step counts.' },
  { id: 'not_today', label: 'Not today', emoji: '\uD83C\uDF19', response: "That's alright. Consistency isn't perfection. Tomorrow is a fresh start." },
];

const SHARE_MESSAGES: Record<string, string[]> = {
  on_track: [
    'Ate clean, moved well - feeling great today!',
    'Finished all meals within target. Small wins matter!',
    'Hit my step goal and stuck to the meal plan!',
  ],
  almost: [
    'Almost hit my target today - getting closer each day!',
    'Not perfect but I showed up and that counts!',
  ],
  not_today: [
    'Rest day today - listening to my body. Back at it tomorrow!',
    'Not my best day, but progress is not perfection.',
  ],
};

export default function EveningReflection({ onComplete, onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  const selectedOption = options.find((o) => o.id === selected);

  const handleContinue = () => {
    if (!selected) return;
    setShowSharePrompt(true);
  };

  const handleShare = (share: boolean) => {
    onComplete(selected!, share);
  };

  return (
    <div className="min-h-screen bg-background vitale-gradient flex items-center justify-center px-6">
      <div className="w-full max-w-[520px]">
        <ScreenNav onBack={onBack} title="Reflection" />

        <AnimatePresence mode="wait">
          {!showSharePrompt ? (
            <motion.div key="reflection" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                  onClick={handleContinue}
                  className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Continue
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="w-6 h-6 text-primary" />
                <h2 className="font-heading text-2xl font-semibold">Share with the community?</h2>
              </div>
              <p className="text-muted-foreground font-body text-sm mb-6">
                Let others see your progress and cheer you on. Every share inspires someone!
              </p>

              {/* Preview card */}
              <div className="card-surface p-5 rounded-lg mb-8">
                <p className="font-body text-foreground text-sm leading-relaxed italic">
                  "{SHARE_MESSAGES[selected!][Math.floor(Math.random() * SHARE_MESSAGES[selected!].length)]}"
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleShare(true)}
                  className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share & Continue
                </button>
                <button
                  onClick={() => handleShare(false)}
                  className="w-full py-3 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
