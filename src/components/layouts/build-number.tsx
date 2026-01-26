import React from 'react';
import { env } from '@/lib/env';
import { useIsOpen } from '@/hooks/general';

const BUILD_NUMBER_STORAGE_KEY = 'build-number-open';

export function BuildNumber() {
  const [isOpen, setIsOpen] = useIsOpen(undefined, localStorage.getItem(BUILD_NUMBER_STORAGE_KEY) === 'true');

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' && (event.altKey || event.metaKey)) {
        event.preventDefault();
        setIsOpen.setState(old => {
          localStorage.setItem(BUILD_NUMBER_STORAGE_KEY, String(!old));
          return !old;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 text-xs text-foreground/70 p-2 border-l border-t rounded-tl-md bg-background">
      Build: {env.buildNumber}
    </div>
  );
}
