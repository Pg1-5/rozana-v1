import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isListening: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
  label?: string;
}

export default function VoiceMicButton({ isListening, onToggle, size = 'sm', label }: Props) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
        isListening
          ? 'bg-primary text-primary-foreground'
          : 'card-surface hover:bg-card-hover text-muted-foreground hover:text-foreground'
      }`}
      animate={isListening ? { scale: [1, 1.15, 1] } : {}}
      transition={isListening ? { repeat: Infinity, duration: 1 } : {}}
      title={label || (isListening ? 'Stop listening' : 'Speak')}
    >
      {isListening ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
    </motion.button>
  );
}
