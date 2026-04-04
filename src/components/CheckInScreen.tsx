import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckInData, DietPreference, getGreeting } from '@/lib/vitale-engine';
import ScreenNav from '@/components/ScreenNav';
import VoiceMicButton from '@/components/VoiceMicButton';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { useToast } from '@/hooks/use-toast';

interface Props {
  name: string;
  onComplete: (data: CheckInData) => void;
  onBack?: () => void;
}

type PillOption<T extends string> = { value: T; label: string; emoji?: string };

const energyOptions: PillOption<'low' | 'balanced' | 'high'>[] = [
  { value: 'low', label: 'Low' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'high', label: 'Energetic' },
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

// Map spoken words to option values
function matchEnergy(text: string): 'low' | 'balanced' | 'high' | null {
  const t = text.toLowerCase();
  if (t.includes('low') || t.includes('tired') || t.includes('exhausted') || t.includes('no energy')) return 'low';
  if (t.includes('high') || t.includes('great') || t.includes('energetic') || t.includes('full energy')) return 'high';
  if (t.includes('balanced') || t.includes('okay') || t.includes('normal') || t.includes('fine') || t.includes('good')) return 'balanced';
  return null;
}

function matchSleep(text: string): 'poor' | 'okay' | 'rested' | null {
  const t = text.toLowerCase();
  if (t.includes('poor') || t.includes('bad') || t.includes('terrible') || t.includes('not well') || t.includes('barely')) return 'poor';
  if (t.includes('rested') || t.includes('great') || t.includes('well') || t.includes('amazing') || t.includes('good sleep')) return 'rested';
  if (t.includes('okay') || t.includes('fine') || t.includes('ok') || t.includes('decent') || t.includes('average')) return 'okay';
  return null;
}

function matchMind(text: string): 'heavy' | 'neutral' | 'clear' | null {
  const t = text.toLowerCase();
  if (t.includes('heavy') || t.includes('stressed') || t.includes('anxious') || t.includes('overwhelm') || t.includes('foggy')) return 'heavy';
  if (t.includes('clear') || t.includes('fresh') || t.includes('sharp') || t.includes('focused')) return 'clear';
  if (t.includes('neutral') || t.includes('okay') || t.includes('normal') || t.includes('fine')) return 'neutral';
  return null;
}

function matchDiet(text: string): DietPreference[] {
  const t = text.toLowerCase();
  const results: DietPreference[] = [];
  if (t.includes('veg') && !t.includes('non')) results.push('vegetarian');
  if (t.includes('non-veg') || t.includes('non veg') || t.includes('nonveg') || t.includes('meat') || t.includes('chicken') || t.includes('fish')) results.push('non_vegetarian');
  if (t.includes('egg')) results.push('eggitarian');
  return results;
}

export default function CheckInScreen({ name, onComplete, onBack }: Props) {
  const [energy, setEnergy] = useState<CheckInData['energy'] | null>(null);
  const [sleep, setSleep] = useState<CheckInData['sleep'] | null>(null);
  const [mind, setMind] = useState<CheckInData['mind'] | null>(null);
  const [dietSelections, setDietSelections] = useState<DietPreference[]>([]);
  const [kitchenInput, setKitchenInput] = useState('');
  const { toast } = useToast();

  const canProceed = energy && sleep && mind && dietSelections.length > 0;

  const toggleDiet = (value: DietPreference) => {
    setDietSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const showVoiceFeedback = useCallback((message: string, success: boolean) => {
    toast({ description: message, duration: 2000 });
  }, [toast]);

  // Voice inputs for each field
  const energyVoice = useVoiceInput({
    onResult: (text) => {
      const match = matchEnergy(text);
      if (match) { setEnergy(match); showVoiceFeedback(`Energy: ${match}`, true); }
      else showVoiceFeedback(`Heard "${text}" — say low, balanced, or energetic`, false);
    },
    onError: (e) => showVoiceFeedback(e, false),
  });

  const sleepVoice = useVoiceInput({
    onResult: (text) => {
      const match = matchSleep(text);
      if (match) { setSleep(match); showVoiceFeedback(`Sleep: ${match}`, true); }
      else showVoiceFeedback(`Heard "${text}" — say poor, okay, or rested`, false);
    },
    onError: (e) => showVoiceFeedback(e, false),
  });

  const mindVoice = useVoiceInput({
    onResult: (text) => {
      const match = matchMind(text);
      if (match) { setMind(match); showVoiceFeedback(`Mind: ${match}`, true); }
      else showVoiceFeedback(`Heard "${text}" — say heavy, neutral, or clear`, false);
    },
    onError: (e) => showVoiceFeedback(e, false),
  });

  const dietVoice = useVoiceInput({
    onResult: (text) => {
      const matches = matchDiet(text);
      if (matches.length > 0) {
        setDietSelections(matches);
        showVoiceFeedback(`Diet: ${matches.join(', ')}`, true);
      } else showVoiceFeedback(`Heard "${text}" — say vegetarian, non-veg, or eggitarian`, false);
    },
    onError: (e) => showVoiceFeedback(e, false),
  });

  const kitchenVoice = useVoiceInput({
    onResult: (text) => {
      setKitchenInput((prev) => prev ? `${prev}, ${text}` : text);
      showVoiceFeedback(`Added: ${text}`, true);
    },
    onError: (e) => showVoiceFeedback(e, false),
  });

  return (
    <div className="min-h-screen bg-background vitale-gradient px-6 py-12">
      <div className="w-full max-w-[520px] mx-auto">
        <ScreenNav onBack={onBack} title="Check-in" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl font-semibold mb-2">{getGreeting(name)}</h1>
          <p className="text-muted-foreground font-body text-lg mb-10">How are you feeling today?</p>
        </motion.div>

        <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PillSelectorWithVoice label="Energy" options={energyOptions} selected={energy} onSelect={(v) => setEnergy(v)} isListening={energyVoice.isListening} onVoiceToggle={energyVoice.toggle} />
          <PillSelectorWithVoice label="Sleep" options={sleepOptions} selected={sleep} onSelect={(v) => setSleep(v)} isListening={sleepVoice.isListening} onVoiceToggle={sleepVoice.toggle} />
          <PillSelectorWithVoice label="Mind" options={mindOptions} selected={mind} onSelect={(v) => setMind(v)} isListening={mindVoice.isListening} onVoiceToggle={mindVoice.toggle} />
        </motion.div>

        {/* Diet preference */}
        <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-body">What do you eat?</p>
            <VoiceMicButton isListening={dietVoice.isListening} onToggle={dietVoice.toggle} />
          </div>
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

        {/* Kitchen input */}
        <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-body">What's available at home? <span className="text-xs opacity-60">(optional)</span></p>
            <VoiceMicButton isListening={kitchenVoice.isListening} onToggle={kitchenVoice.toggle} />
          </div>
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

function PillSelectorWithVoice<T extends string>({
  label,
  options,
  selected,
  onSelect,
  isListening,
  onVoiceToggle,
}: {
  label: string;
  options: PillOption<T>[];
  selected: T | null;
  onSelect: (v: T) => void;
  isListening: boolean;
  onVoiceToggle: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground font-body">{label}</p>
        <VoiceMicButton isListening={isListening} onToggle={onVoiceToggle} />
      </div>
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
