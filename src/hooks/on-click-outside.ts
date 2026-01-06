'use client';

import { useState, useEffect } from 'react';

export function useOnClickOutside(callback: (node: HTMLElement) => void, deps?: React.DependencyList) {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const dataSlot = target?.dataset.slot;
      const dataSlotParent = target?.parentElement?.dataset.slot;

      if (
        target &&
        element &&
        !element.contains(target) &&
        // Select element trigger will emit a click event on the body/document even when inside the element
        target !== document.body &&
        target !== document.documentElement &&
        // Select content will emit a click event on a data-slot="select-content" that's outside of the element even when Select is inside the element
        dataSlotParent !== 'select-content' &&
        // Dialog overlay will emit a click event on the data-slot="dialog-overlay" even when inside the element
        dataSlot !== 'dialog-overlay'
      ) {
        callback(target);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
    // We intentionally disable exhaustive-deps here because the dependency list can be
    // customized via the `deps` argument, and including `callback` directly may cause
    // unnecessary re-registrations of the event listener if the callback is re-created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, ...(deps || [callback])]);

  return setElement;
}
