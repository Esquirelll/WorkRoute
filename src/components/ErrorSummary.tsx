import { motion } from 'framer-motion';
import type { Ref } from 'react';
import { panelVariants } from '../motion/motion';

export type SummaryItem = { fieldId: string; message: string };

/**
 * "There is a problem" box shown at the top of a form after a failed submit.
 * The page moves keyboard focus to it, so screen readers read it straight away, and
 * each message is a button that jumps to the field it is about.
 *
 * BEGINNER TRAP: do not use <a href="#email"> for these. With HashRouter the part after
 * "#" is the ROUTE, so that link would navigate away. We focus the field with code instead.
 */
export function ErrorSummary({ items, summaryRef }: { items: SummaryItem[]; summaryRef: Ref<HTMLDivElement> }) {
  if (items.length === 0) return null;
  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      ref={summaryRef}
      tabIndex={-1}
      aria-labelledby="error-summary-title"
      className="rounded-card border-2 border-no bg-no-bg p-4 outline-none focus-visible:ring-4 focus-visible:ring-no/30"
    >
      <h2 id="error-summary-title" className="text-lg text-no">
        There {items.length === 1 ? 'is 1 problem' : `are ${items.length} problems`} with the form
      </h2>
      <ul className="mt-2 flex flex-col">
        {items.map((item) => (
          <li key={item.fieldId}>
            <button
              type="button"
              onClick={() => document.getElementById(item.fieldId)?.focus()}
              className="min-h-11 text-left text-base font-bold text-no underline underline-offset-4"
            >
              {item.message}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
