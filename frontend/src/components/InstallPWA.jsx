import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const LS_KEY = 'hq_install_dismissed';

export default function InstallPWA() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(LS_KEY)) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    }
    setShow(false);
    localStorage.setItem(LS_KEY, '1');
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(LS_KEY, '1');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 rounded-2xl border border-slate-200
                    bg-white shadow-xl p-3 flex items-start gap-3 sm:left-auto sm:right-4 sm:w-80">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500
                      text-white flex items-center justify-center flex-shrink-0">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">Install HamariBaari</div>
        <div className="text-xs text-slate-500 mt-0.5">
          Add to your home screen for one-tap access.
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={install} className="pq-tap rounded-lg bg-slate-900 text-white
                                               px-3 py-1.5 text-xs font-medium">
            Install
          </button>
          <button onClick={dismiss} className="pq-tap rounded-lg text-slate-500 px-3 py-1.5 text-xs">
            Later
          </button>
        </div>
      </div>
      <button onClick={dismiss} className="pq-tap p-1 text-slate-400">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}