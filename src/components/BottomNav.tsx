import { Calculator, HandCoins, LayoutDashboard, Settings2 } from 'lucide-react';
import type { AppView } from '../types/navigation';

interface BottomNavProps {
  activeView: AppView;
  onChange: (view: AppView) => void;
}

const navItems = [
  { view: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { view: 'cards', label: 'Khoản nợ', icon: HandCoins },
  { view: 'simulator', label: 'Dự báo', icon: Calculator },
  { view: 'settings', label: 'Cài đặt', icon: Settings2 }
] satisfies Array<{
  view: AppView;
  label: string;
  icon: typeof LayoutDashboard;
}>;

export function BottomNav({ activeView, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onChange(item.view)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-md px-2 text-[0.72rem] font-semibold transition ${
                isActive
                  ? 'bg-mint text-white shadow-soft'
                  : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
              }`}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
            >
              <Icon aria-hidden="true" className="mb-1 h-5 w-5" strokeWidth={2.2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
