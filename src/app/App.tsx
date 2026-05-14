import { AlertTriangle } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useDebtTracker } from '../hooks/useDebtTracker';
import { CardsPage } from '../pages/CardsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SettingsPage } from '../pages/SettingsPage';
import { SimulatorPage } from '../pages/SimulatorPage';
import type { AppView } from '../types/navigation';
import { useState } from 'react';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const {
    debts,
    payments,
    isLoading,
    error,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    markDuePaid,
    seedDemoData,
    clearAllData
  } = useDebtTracker();

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <main className="mx-auto w-full max-w-5xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6">
        {error ? (
          <div className="mb-4 mt-4 flex gap-2 rounded-md border border-coral/25 bg-coral/10 p-3 text-sm font-semibold text-coral">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {activeView === 'dashboard' ? (
          <DashboardPage
            debts={debts}
            payments={payments}
            isLoading={isLoading}
            onNavigate={setActiveView}
            onSeedDemoData={seedDemoData}
            onAddPayment={addPayment}
            onMarkDuePaid={markDuePaid}
          />
        ) : null}
        {activeView === 'cards' ? (
          <CardsPage
            debts={debts}
            payments={payments}
            onAddDebt={addDebt}
            onUpdateDebt={updateDebt}
            onDeleteDebt={deleteDebt}
          />
        ) : null}
        {activeView === 'simulator' ? (
          <SimulatorPage debts={debts} onNavigate={setActiveView} />
        ) : null}
        {activeView === 'settings' ? (
          <SettingsPage
            debts={debts}
            payments={payments}
            onSeedDemoData={seedDemoData}
            onClearAllData={clearAllData}
          />
        ) : null}
      </main>

      <BottomNav activeView={activeView} onChange={setActiveView} />
    </div>
  );
}
