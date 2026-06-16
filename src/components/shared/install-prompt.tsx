'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 bg-card border text-card-foreground p-4 rounded-lg shadow-xl max-w-sm">
      <div className="flex-1">
        <p className="font-semibold text-sm">Install App</p>
        <p className="text-xs text-muted-foreground">Add to home screen for offline access.</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowPrompt(false)}>
          Later
        </Button>
        <Button size="sm" onClick={handleInstall} className="gap-2">
          <Download className="h-4 w-4" /> Install
        </Button>
      </div>
    </div>
  );
}
