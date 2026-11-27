import { motion } from 'framer-motion';
import { iconPopVariants } from '../motion/motion';
import { Icon } from './Icon';

/**
 * Save / unsave a job. A toggle button: `aria-pressed` tells screen readers whether it is on.
 * Visible words are "Save" / "Saved", and the accessible name begins with the same word, so
 * voice-control users can say "click Save". The job title is added for screen readers only,
 * because a page full of buttons that all just say "Save" is impossible to tell apart.
 */
export function SaveButton({ saved, title, onToggle }: { saved: boolean; title: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      className={`relative z-10 inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-control border-2 px-3 text-sm font-bold transition-colors ${
        saved ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line-strong bg-surface text-ink hover:border-brand-600 hover:bg-brand-50'
      }`}
    >
      <motion.span key={String(saved)} variants={iconPopVariants} initial="hidden" animate="visible" className="inline-flex">
        <Icon name="saved" className="size-5" filled={saved} />
      </motion.span>
      <span>{saved ? 'Saved' : 'Save'}</span>
      <span className="sr-only"> job: {title}</span>
    </button>
  );
}
