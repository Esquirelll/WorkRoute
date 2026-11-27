import { useId, useState, type ComponentProps } from 'react';
import { FormField } from './FormField';

type Props = Omit<ComponentProps<typeof FormField>, 'type' | 'endSlot'>;

/**
 * Password field with a visible Show / Hide button.
 * Letting people SEE what they typed prevents typos, which is why there is no
 * "confirm password" box. The button's text is on screen (not just an icon), and its
 * accessible name starts with that same word, so voice-control users can say "click Show".
 */
export function PasswordField({ id: idProp, ...props }: Props) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      {...props}
      id={id}
      type={visible ? 'text' : 'password'}
      endSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={id}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="min-h-11 min-w-11 rounded-control px-2 text-sm font-bold text-brand-700 underline underline-offset-4 hover:bg-brand-50"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      }
    />
  );
}
