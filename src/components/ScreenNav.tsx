import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onBack?: () => void;
  onForward?: () => void;
  title?: string;
}

export default function ScreenNav({ onBack, onForward, title }: Props) {
  return (
    <motion.div
      className="flex items-center justify-between mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full card-surface hover:bg-card-hover flex items-center justify-center transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      ) : (
        <div className="w-10" />
      )}
      {title && (
        <p className="text-xs text-muted-foreground font-body uppercase tracking-widest">{title}</p>
      )}
      {onForward ? (
        <button
          onClick={onForward}
          className="w-10 h-10 rounded-full card-surface hover:bg-card-hover flex items-center justify-center transition-colors"
          aria-label="Go forward"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      ) : (
        <div className="w-10" />
      )}
    </motion.div>
  );
}
