import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckInData, DietPreference, getGreeting } from '@/lib/vitale-engine';
import ScreenNav from '@/components/ScreenNav';

interface Props {
  name: string;
  onComplete: (data: CheckInData) => void;
  onBack?: () => void;
}

type PillOption<T extends string> = { value: T; label: string; emoji?: string };

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

const dietOptions: PillOption<DietPreference>[] = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { value: 'non_vegetarian', label: 'Non-Veg', emoji: '🍗' },
  { value: 'eggitarian', label: 'Eggitarian', emoji: '🥚' },
];

export default function CheckInScreen({ name, onComplete, onBack }: Props) {
  const [energy, setEnergy] = useState<CheckInData['energy'] | null>(null);
  const [sleep, setSleep] = useState<CheckInData['sleep'] | null>(null);
  const [mind, setMind] = useState<CheckInData['mind'] | null>(null);
  const [dietSelections, setDietSelections] = useState<DietPreference[]>([]);
  const [kitchenInput, setKitchenInput] = useState('');

  const canProceed = energy && sleep && mind && dietSelections.length > 0;

  const toggleDiet = (value: DietPreference) => {
    setDietSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="min-h-screen bg-background vitale-gradient px-6 py-12">
      <div className="w-full max-w-[520px] mx-auto">
        <ScreenNav onBack={onBack} title="Check-in" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl font-semibold mb-2">{getGreeting(name)}</h1>
          <p className="text-muted-foreground font-body text-lg mb-10">How are you feeling today?</p>
        </motion.div>

        <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PillSelector label="Energy" options={energyOptions} selected={energy} onSelect={(v) => setEnergy(v)} />
          <PillSelector label="Sleep" options={sleepOptions} selected={sleep} onSelect={(v) => setSleep(v)} />
          <PillSelector label="Mind" options={mindOptions} selected={mind} onSelect={(v) => setMind(v)} />
        </motion.div>

        {/* Diet preference */}
        <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <p className="text-sm text-muted-foreground font-body mb-3">What do you eat?</p>
          <div className="flex gap-3">
            {dietOptions.map((opt) => {
              const isSelected = dietSelections.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleDiet(opt.value)}
                  className={`flex-1 py-3 rounded-lg font-body text-sm transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'card-surface hover:bg-card-hover text-foreground'
                  }`}
                >
                  {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
                  {opt.label}
                </button>
              );
            })}
          </div>
          {dietSelections.length > 1 && (
            <p className="text-xs text-muted-foreground font-body mt-2 italic">
              Meals from {dietSelections.length} preferences will be mixed
            </p>
          )}
        </motion.div>

        {/* Kitchen input — always visible */}
        <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <p className="text-sm text-muted-foreground font-body mb-3">What's available at home? <span className="text-xs opacity-60">(optional)</span></p>
          <textarea
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="e.g. paneer, eggs, cucumber, brown bread, rice, dal, chicken..."
            rows={3}
            value={kitchenInput}
            onChange={(e) => setKitchenInput(e.target.value)}
          />
        </motion.div>

        <motion.button
          onClick={() =>
            canProceed &&
            onComplete({
              energy: energy!,
              sleep: sleep!,
              mind: mind!,
              dietPreferences: dietSelections,
              kitchenInput: kitchenInput || undefined,
            })
          }
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

function PillSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
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
