// Access status with an icon AND words (never colour alone).
import { Check, Contrast, CircleHelp } from 'lucide-react';
import type { AccessStatus } from '../../../../shared/types';
import { useT } from '../../strings';
import '../../styles/places.css';

export const STATUS_ICON = { full: Check, partial: Contrast, unknown: CircleHelp } as const;

export function StatusBadge({ status }: { status: AccessStatus }) {
  const t = useT();
  const Icon = STATUS_ICON[status];
  return (
    <span className={`status-badge status-${status}`}>
      <Icon size={16} aria-hidden="true" strokeWidth={2.4} />
      <span>{t(`status.${status}`)}</span>
    </span>
  );
}
