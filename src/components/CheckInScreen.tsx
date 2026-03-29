import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckInData, getGreeting } from '@/lib/vitale-engine';
import ScreenNav from '@/components/ScreenNav';

interface Props {
  name: string;
  onComplete: (data: CheckInData) => void;
  onBack?: () => void;
}

type PillOption<T extends string> = { value: T; label: string };

const energyOptions: PillOption<'low' | 'balanced' | 'high'>[] = [
  { value: 'low', label: 'Low' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'high', label: 'High' },
];

const sleepOptions: PillOption<'poor' | 'okay' | 'rested'>[] = [
  { value: 'poor', label: 'Poor' },
  { value: 'okay', label: 'Okay' },
  { value: 'rested', label: 'Rested' },
];

const mindOptions: PillOption<'heavy' | 'neutral' | 'clear'>[] = [
  { value: 'heavy', label: 'Heavy' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'clear', label: 'Clear' },
];

export default function CheckInScreen({ name, onComplete, onBack }: Props) {
  const [energy, setEnergy] = useState<CheckInData['energy'] | null>(null);
  const [sleep, setSleep] = useState<CheckInData['sleep'] | null>(null);
  const [mind, setMind] = useState<CheckInData['mind'] | null>(null);
  const [kitchenInput, setKitchenInput] = useState('');
  const [showKitchen, setShowKitchen] = useState(false);

  const canProceed = energy && sleep && mind;

  return (
    <div className="min-h-screen bg-background vitale-gradient flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[520px]">
        <ScreenNav onBack={onBack} title="Check-in" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl font-semibold mb-2">{getGreeting(name)}</h1>
          <p className="text-muted-foreground font-body text-lg mb-10">How are you feeling today?</p>
        </motion.div>

        <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PillSelector label="Energy" options={energyOptions} selected={energy} onSelect={(v: 'low' | 'balanced' | 'high') => setEnergy(v)} />
          <PillSelector label="Sleep" options={sleepOptions} selected={sleep} onSelect={(v: 'poor' | 'okay' | 'rested') => setSleep(v)} />
          <PillSelector label="Mind" options={mindOptions} selected={mind} onSelect={(v: 'heavy' | 'neutral' | 'clear') => setMind(v)} />
        </motion.div>

        {/* Kitchen input */}
        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button
            onClick={() => setShowKitchen(!showKitchen)}
            className="text-sm text-muted-foreground font-body hover:text-foreground transition-colors"
          >
            {showKitchen ? '▾' : '▸'} What's available in your kitchen today?
          </button>
          {showKitchen && (
            <motion.textarea
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full mt-3 bg-card border border-border rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="e.g. eggs, onion, tomato, rice, dal..."
              rows={3}
              value={kitchenInput}
              onChange={(e) => setKitchenInput(e.target.value)}
            />
          )}
        </motion.div>

        <motion.button
          onClick={() => canProceed && onComplete({ energy: energy!, sleep: sleep!, mind: mind!, kitchenInput: kitchenInput || undefined })}
          disabled={!canProceed}
          className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-90 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Shape My Day
        </motion.button>
      </div>
    </div>
  );
}

function PillSelector<T extends string>({ label, options, selected, onSelect }: {
  label: string;
  options: PillOption<T>[];
  selected: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground font-body mb-3">{label}</p>
      <div className="flex gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`flex-1 py-3 rounded-lg font-body text-sm transition-all ${
              selected === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'card-surface hover:bg-card-hover text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
