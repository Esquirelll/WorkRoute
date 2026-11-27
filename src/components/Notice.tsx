import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { StatusIcon } from './StatusIcon';

/**
 * A short message box.
 *  - "prototype": dashed border. Across WorkRoute, dashed = "made up / prototype only".
 *  - "info": ordinary information.
 *  - "success": something worked (icon + text, not color alone).
 */
export function Notice({ tone = 'info', children }: { tone?: 'prototype' | 'info' | 'success'; children: ReactNode }) {
  const style = {
    prototype: 'border-dashed border-line-strong bg-surface',
    info: 'border-brand-600 bg-brand-50',
    success: 'border-ok bg-ok-bg',
  }[tone];
  return (
    <div className={`flex items-start gap-2.5 rounded-card border-2 px-3.5 py-3 text-sm ${style}`}>
      <span className="mt-0.5 shrink-0">
        {tone === 'success' ? <StatusIcon status="confirmed" className="size-5" /> : <Icon name="method" className="size-5 text-brand-700" />}
      </span>
      <div className="font-bold text-ink">{children}</div>
    </div>
  );
}
