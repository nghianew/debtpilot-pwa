import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  accent?: string;
  detail?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, accent = 'bg-mint', detail, icon }: StatCardProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
        </div>
        {icon ? (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-md text-white ${accent}`}>
            {icon}
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-sm text-ink/60">{detail}</p> : null}
    </section>
  );
}
