import { Database, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import type { DebtItem, Payment } from '../types/debt';

interface SettingsPageProps {
  debts: DebtItem[];
  payments: Payment[];
  onSeedDemoData: () => Promise<void>;
  onClearAllData: () => Promise<void>;
}

export function SettingsPage({ debts, payments, onSeedDemoData, onClearAllData }: SettingsPageProps) {
  const [isBusy, setIsBusy] = useState(false);

  async function runAction(action: () => Promise<void>) {
    setIsBusy(true);

    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  }

  async function clearAllData() {
    const confirmed = window.confirm('Xóa toàn bộ dữ liệu DebtPilot trên thiết bị này?');
    if (!confirmed) {
      return;
    }

    await runAction(onClearAllData);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt"
        description="Dữ liệu lưu cục bộ bằng VND, hoạt động offline và không cần đăng nhập."
      />

      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mint text-white">
            <Database aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">Dữ liệu cục bộ</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              {debts.length} khoản nợ và {payments.length} thanh toán được lưu trong IndexedDB.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void runAction(onSeedDemoData)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-3 text-sm font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Tải dữ liệu demo
          </button>
          <button
            type="button"
            disabled={isBusy || debts.length === 0}
            onClick={() => void clearAllData()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-coral/30 px-4 py-3 text-sm font-bold text-coral disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Xóa toàn bộ dữ liệu
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-black text-ink">PWA trên iPhone</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Mở bằng Safari, bấm Chia sẻ, chọn Thêm vào Màn hình chính. Bản build production có
          manifest và service worker để dùng offline.
        </p>
      </section>
    </div>
  );
}
