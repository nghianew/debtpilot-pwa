import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-white p-6 text-center">
      <p className="text-lg font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/60">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
