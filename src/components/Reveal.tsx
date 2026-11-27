import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { panelVariants } from '../motion/motion';

/** Fades and eases a panel or message into the page (a confirmation question, a notice). Same motion everywhere. */
export function Reveal({ children, className, ...aria }: { children: ReactNode; className?: string; role?: string; 'aria-labelledby'?: string }) {
  return (
    <motion.div variants={panelVariants} initial="hidden" animate="visible" className={className} {...aria}>
      {children}
    </motion.div>
  );
}
