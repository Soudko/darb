import { Send } from 'lucide-react';
import { useT } from '../../strings';

export const MAX_LEN = 500;

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
}

export function Composer({ value, onChange, onSubmit, busy }: Props) {
  const t = useT();
  const near = value.length >= 400;
  return (
    <form
      className="glass-strong as-composer"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="as-composer-row">
        <input
          className="field as-input"
          type="text"
          value={value}
          maxLength={MAX_LEN}
          placeholder={t('assistant.placeholder')}
          aria-label={t('assistant.input_label')}
          enterKeyHint="send"
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="submit" className="btn btn-primary as-ask" disabled={busy || !value.trim()}>
          <Send size={20} aria-hidden="true" className="as-send-icon" />
          {t('assistant.ask')}
        </button>
      </div>
      {near && (
        <p className="small as-count" aria-live="off">
          {value.length} / {MAX_LEN} {t('assistant.chars')}
        </p>
      )}
    </form>
  );
}
