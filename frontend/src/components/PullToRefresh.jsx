import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const tracking = useRef(false);

  const THRESHOLD = 70;

  useEffect(() => {
    const onStart = (e) => {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      tracking.current = true;
    };
    const onMove = (e) => {
      if (!tracking.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPull(Math.min(dy * 0.5, 100));
      }
    };
    const onEnd = async () => {
      if (!tracking.current) return;
      tracking.current = false;
      if (pull >= THRESHOLD) {
        setRefreshing(true);
        try { await onRefresh?.(); } finally {
          setRefreshing(false);
        }
      }
      setPull(0);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [pull, onRefresh]);

  return (
    <div>
      <div
        className="flex items-center justify-center overflow-hidden text-slate-400 transition-all"
        style={{ height: refreshing ? 48 : pull }}
      >
        {(refreshing || pull > 10) && (
          <Loader2 className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        )}
      </div>
      {children}
    </div>
  );
}