import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, MessageCircle } from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { CheckInData, DietPreference } from '@/lib/vitale-engine';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  userName: string;
  onCheckInComplete: (data: CheckInData) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type RoziLang = 'en' | 'hi';

const LANG_STORAGE_KEY = 'rozi-language';

function getSavedLang(): RoziLang {
  return (localStorage.getItem(LANG_STORAGE_KEY) as RoziLang) || 'en';
}

function saveLang(lang: RoziLang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

function pickVoice(lang: string, preferred: string[]): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Helper: detect female voice from name
  const isFemale = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    const femaleMarkers = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'tessa', 'moira', 'fiona', 'veena', 'lekha', 'piya', 'hazel', 'serena', 'kate', 'laura', 'alice', 'matilda', 'jessica', 'lily', 'sarah', 'zira', 'lesya', 'martha', 'catherine'];
    return femaleMarkers.some(m => n.includes(m));
  };

  // Exact lang match first
  const exact = voices.filter(v => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
  for (const v of exact) {
    if (preferred.some(k => v.name.toLowerCase().includes(k))) return v;
  }
  const exactFemale = exact.find(isFemale);
  if (exactFemale) return exactFemale;

  // Broader match
  const prefix = lang.split('-')[0];
  const broad = voices.filter(v => v.lang.startsWith(prefix));
  for (const v of broad) {
    if (preferred.some(k => v.name.toLowerCase().includes(k))) return v;
  }
  const broadFemale = broad.find(isFemale);
  if (broadFemale) return broadFemale;

  // Last resort: any female voice on the system
  const anyFemale = voices.find(isFemale);
  if (anyFemale) return anyFemale;

  return null;
}

function stripEmojis(text: string): string {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').replace(/\s{2,}/g, ' ').trim();
}

function speak(text: string, lang: RoziLang): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const cleanText = stripEmojis(text);
    if (!cleanText) { resolve(); return; }
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const speechLang = lang === 'hi' ? 'hi-IN' : 'en-GB';
    utterance.lang = speechLang;
    utterance.rate = 0.9;
    utterance.pitch = 1.15;

    if (lang === 'hi') {
      const voice = pickVoice('hi-IN', ['female', 'priya', 'aditi', 'lekha', 'google']);
      if (voice) utterance.voice = voice;
    } else {
      const voice = pickVoice('en-GB', ['female', 'google uk', 'hazel', 'kate', 'serena', 'martha']);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function parseCheckInData(text: string): CheckInData | null {
  const match = text.match(/\[CHECKIN_DATA\](.*?)\[\/CHECKIN_DATA\]/s);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    if (data.energy && data.sleep && data.mind && data.diet?.length > 0) {
      return {
        energy: data.energy,
        sleep: data.sleep,
        mind: data.mind,
        dietPreferences: data.diet as DietPreference[],
        kitchenInput: data.kitchen || undefined,
      };
    }
  } catch { /* ignore */ }
  return null;
}

function cleanDisplayText(text: string): string {
  return text.replace(/\[CHECKIN_DATA\].*?\[\/CHECKIN_DATA\]/s, '').trim();
}

export default function RoziVoiceCoach({ userName, onCheckInComplete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [langChosen, setLangChosen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState<RoziLang>(getSavedLang);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Preload voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', handler);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', handler);
  }, []);

  const handleLangSwitch = (newLang: RoziLang) => {
    setLang(newLang);
    saveLang(newLang);
  };

  const handleLangSelect = (selectedLang: RoziLang) => {
    setLang(selectedLang);
    saveLang(selectedLang);
    setLangChosen(true);
    // Greeting will fire via the useEffect watching langChosen
  };

  const sendToRozi = useCallback(async (userText: string) => {
    const userMsg: Message = { role: 'user', content: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsThinking(true);

    try {
      const { data, error } = await supabase.functions.invoke('rozi-chat', {
        body: { messages: updated, lang },
      });

      if (error) throw error;

      const reply = data?.reply || (lang === 'hi' ? 'Maaf kijiye, dobara try karein?' : "Sorry, I couldn't process that. Try again?");
      const assistantMsg: Message = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMsg]);

      const displayText = cleanDisplayText(reply);
      if (displayText) {
        setIsSpeaking(true);
        await speak(displayText, lang);
        setIsSpeaking(false);
      }

      const checkInData = parseCheckInData(reply);
      if (checkInData) {
        // Small pause after speech ends so transition feels natural
        setTimeout(() => onCheckInComplete(checkInData), 1500);
      }
    } catch (e) {
      console.error('Rozi chat error:', e);
      const fallback = lang === 'hi'
        ? 'Kuch gadbad ho gayi. Chaliye dobara try karte hain — aap kaisi feel kar rahi hain?'
        : "Something went wrong. Let's try again — how are you feeling?";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, onCheckInComplete, lang]);

  const voiceInput = useVoiceInput({
    onResult: (text) => sendToRozi(text),
    onError: (e) => console.error('Voice error:', e),
    lang: lang === 'hi' ? 'hi-IN' : 'en-GB',
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (isOpen && langChosen && messages.length === 0) {
      const greeting = lang === 'hi'
        ? `Namaste ${userName}! Main Rozi hoon, tumhari health buddy. Batao, aaj kaisa feel ho raha hai?`
        : `Hey ${userName}! I'm Rozi, your health buddy. So tell me, how are you feeling today?`;
      setMessages([{ role: 'assistant', content: greeting }]);
      setIsSpeaking(true);
      speak(greeting, lang).then(() => setIsSpeaking(false));
    }
  }, [isOpen, langChosen, userName, lang]);

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => { setIsOpen(true); setLangChosen(false); setMessages([]); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        title="Talk to Rozi"
      >
        <MessageCircle size={24} />
      </motion.button>
    );
  }

  // Language selection screen
  if (!langChosen) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <button
            onClick={() => { window.speechSynthesis?.cancel(); setIsOpen(false); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full card-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading text-2xl font-semibold text-foreground">🎙️ Rozi</h2>
            <p className="text-muted-foreground font-body text-sm">Choose your language / अपनी भाषा चुनें</p>
            <div className="flex gap-4">
              <motion.button
                onClick={() => handleLangSelect('en')}
                className="px-8 py-4 rounded-2xl card-surface text-foreground font-body font-medium text-lg hover:bg-card-hover transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🇬🇧 English
              </motion.button>
              <motion.button
                onClick={() => handleLangSelect('hi')}
                className="px-8 py-4 rounded-2xl card-surface text-foreground font-body font-medium text-lg hover:bg-card-hover transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🇮🇳 हिंदी
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">🎙️ Rozi</h2>
              <p className="text-xs text-muted-foreground font-body">
                {lang === 'hi' ? 'Aapki AI health coach' : 'Your AI health coach'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex rounded-full border border-border overflow-hidden text-xs font-body">
              <button
                onClick={() => handleLangSwitch('en')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleLangSwitch('hi')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'hi'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                HI
              </button>
            </div>
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsOpen(false);
              }}
              className="w-8 h-8 rounded-full card-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-body ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'card-surface text-foreground rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? cleanDisplayText(msg.content) : msg.content}
              </div>
            </motion.div>
          ))}
          {isThinking && (
            <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card-surface rounded-2xl rounded-bl-sm px-4 py-3 text-sm font-body text-muted-foreground">
                {lang === 'hi' ? 'Rozi soch rahi hai...' : 'Rozi is thinking...'}
              </div>
            </motion.div>
          )}
        </div>

        {/* Mic controls */}
        <div className="px-6 py-6 border-t border-border flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground font-body">
            {voiceInput.isListening
              ? (lang === 'hi' ? '🔴 Sun rahi hoon...' : '🔴 Listening...')
              : isSpeaking
                ? (lang === 'hi' ? '🗣️ Rozi bol rahi hai...' : '🗣️ Rozi is speaking...')
                : (lang === 'hi' ? 'Mic tap karein bolne ke liye' : 'Tap the mic to speak')
            }
          </p>
          <motion.button
            onClick={voiceInput.toggle}
            disabled={isThinking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              voiceInput.isListening
                ? 'bg-primary text-primary-foreground'
                : 'card-surface text-foreground hover:bg-card-hover'
            } disabled:opacity-30`}
            animate={voiceInput.isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={voiceInput.isListening ? { repeat: Infinity, duration: 1 } : {}}
          >
            {voiceInput.isListening ? <MicOff size={28} /> : <Mic size={28} />}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
