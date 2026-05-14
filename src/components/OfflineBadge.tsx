import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isOnline ? 'bg-emerald-50 text-mint' : 'bg-coral/10 text-coral'
      }`}
    >
      {isOnline ? (
        <Wifi aria-hidden="true" className="h-3.5 w-3.5" />
      ) : (
        <WifiOff aria-hidden="true" className="h-3.5 w-3.5" />
      )}
      {isOnline ? 'Có mạng' : 'Mất mạng'}
    </span>
  );
}
