import { useEffect, useState } from 'react';

export default function Clock() {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        }).format(now);
        setTimeStr(`TIRUNELVELI, IN_${formatted}`);
      } catch {
        const now = new Date();
        setTimeStr(`TIRUNELVELI, IN_${now.toTimeString().slice(0, 8)}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="blend mono corner corner--bl fixed z-40 select-none tracking-widest hidden md:block">
      {timeStr || 'TIRUNELVELI, IN_00:00:00'}
    </div>
  );
}
