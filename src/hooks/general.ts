'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * This hook does not cause re-renders and provides a ref that indicates whether the component is mounted.
 * If you need to trigger re-renders based on mount status, consider using `useIsMounted` instead.
 */
export function useIsMountedRef() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => {
      cancelAnimationFrame(frame);
      setIsMounted(false);
    };
  }, []);

  return isMounted;
}

export function usePreviousRef<T>(value: T) {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

export function useIsOpen(initialOpeningDelay?: number, initiallyOpen = false) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const isMounted = useIsMountedRef();

  useEffect(() => {
    if (initialOpeningDelay !== undefined) {
      const timeout = setTimeout(() => {
        if (isMounted.current) {
          setIsOpen(true);
        }
      }, initialOpeningDelay);
      return () => clearTimeout(timeout);
    }
  }, [initialOpeningDelay, isMounted]);

  return [
    isOpen,
    useMemo(
      () => ({
        open: () => {
          if (isMounted.current) {
            setIsOpen(true);
          }
        },
        close: () => {
          if (isMounted.current) {
            setIsOpen(false);
          }
        },
        toggle: () => {
          if (isMounted.current) {
            setIsOpen(old => !old);
          }
        },
        onOpenChange: (isOpen: boolean) => {
          if (isMounted.current) {
            setIsOpen(isOpen);
          }
        },
      }),
      [isMounted],
    ),
  ] as const;
}

export type UseIsOpenActions = ReturnType<typeof useIsOpen>[1];

export function useDrawerData<DataType>() {
  const [data, setData] = useState<DataType | undefined>();
  const lastCloseTimeout = useRef<NodeJS.Timeout>(undefined);
  const isMounted = useIsMountedRef();
  const actions = useMemo(
    () => ({
      set: (newData?: DataType) => {
        clearTimeout(lastCloseTimeout.current);
        if (isMounted.current) {
          setData(newData);
        }
      },
      reset: () => {
        clearTimeout(lastCloseTimeout.current);
        lastCloseTimeout.current = setTimeout(() => {
          if (isMounted.current) {
            setData(undefined);
          }
        }, 200);
      },
    }),
    [isMounted],
  );

  return [data, actions] as const;
}

export function useDrawer<DataType>() {
  const isMountedRef = useIsMountedRef();
  const [isOpen, setIsOpen] = useState(false);
  const [data, dataActions] = useDrawerData<DataType | undefined>();
  const actions = useMemo(
    () => ({
      open: (newData?: DataType) => {
        if (isMountedRef.current) {
          dataActions.set(newData);
          setIsOpen(true);
        }
      },
      setData: dataActions.set,
      openEmpty: () => setIsOpen(true),
      close: () => {
        if (isMountedRef.current) {
          dataActions.reset();
          setIsOpen(false);
        }
      },
      onOpenChange: (isOpen: boolean) => {
        if (isMountedRef.current) {
          if (!isOpen) dataActions.reset();
          setIsOpen(isOpen);
        }
      },
    }),
    [isMountedRef, dataActions],
  );

  return [isOpen, actions, data] as const;
}

export type UseDrawerActions<DataType> = ReturnType<typeof useDrawer<DataType>>[1];
