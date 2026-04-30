import { BellRing, Check, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const res = await Notification.requestPermission();
    setPermission(res);
    return res;
  };

  const sendNotification = (title: string, body: string) => {
    if (typeof Notification !== 'undefined' && permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  return { permission, requestPermission, sendNotification };
}

export default function NotificationBanner() {
  const { permission, requestPermission } = useNotifications();

  if (permission === 'granted' || typeof Notification === 'undefined') return null;

  return (
    <div className="bg-brand-primary/10 border-b border-brand-primary/20 p-3 flex items-center justify-between animate-pulse">
      <div className="flex items-center space-x-2 text-xs font-bold text-brand-primary uppercase tracking-tight">
        <BellRing className="w-4 h-4" />
        <span>Enable reminders for your farm</span>
      </div>
      <button 
        onClick={requestPermission}
        className="bg-brand-primary text-white text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-sm active:scale-95 transition-all"
      >
        Allow
      </button>
    </div>
  );
}
