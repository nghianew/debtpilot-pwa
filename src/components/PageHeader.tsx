import type { ReactNode } from 'react';
import { OfflineBadge } from './OfflineBadge';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow = 'DebtPilot', title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-mint">{eyebrow}</p>
            <OfflineBadge />
          </div>
          <h1 className="text-3xl font-black text-ink">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
