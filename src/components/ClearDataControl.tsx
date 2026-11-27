import { useEffect, useRef, useState } from 'react';
import { clearMyData } from '../services/privacy';
import { Button } from './Button';
import { Reveal } from './Reveal';

/**
 * "Clear my data" with a confirmation step. Used on the Needs page and the Account page.
 * Keyboard focus goes to Cancel (the safe choice) when the question opens, and comes back to the
 * "Clear my data" button when it closes. The result is announced to screen readers.
 */
export function ClearDataControl({ userId, onCleared }: { userId: string; onCleared?: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [returnFocus, setReturnFocus] = useState(0);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  // The button is removed while the question is open, so it can only be focused AFTER it is back.
  useEffect(() => {
    if (returnFocus > 0) buttonRef.current?.focus();
  }, [returnFocus]);

  function confirm() {
    clearMyData(userId);
    setConfirming(false);
    setMessage('Your saved needs, saved jobs and employer profile were cleared from this browser.');
    setReturnFocus((n) => n + 1);
    onCleared?.();
  }

  function cancel() {
    setConfirming(false);
    setReturnFocus((n) => n + 1);
  }

  return (
    <div>
      {!confirming ? (
        <Button ref={buttonRef} variant="secondary" onClick={() => setConfirming(true)}>
          Clear my data
        </Button>
      ) : (
        <Reveal role="group" aria-labelledby={`clear-title-${userId}`} className="rounded-card border-2 border-no bg-no-bg p-3">
          <p id={`clear-title-${userId}`} className="font-bold">
            Remove your saved needs, saved jobs and employer profile from this browser?
          </p>
          <p className="mt-1 text-sm">This cannot be undone. Your account stays, so you can still log in.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button ref={cancelRef} variant="secondary" onClick={cancel}>
              Cancel
            </Button>
            <Button onClick={confirm}>Yes, clear my data</Button>
          </div>
        </Reveal>
      )}
      <p role="status" className="mt-2 min-h-6 text-sm font-bold text-ok">
        {message}
      </p>
    </div>
  );
}
