'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import debounce from 'lodash/debounce';

import { useIsMountedRef } from './general';

type ResizeHandlerInstance = {
  fired: boolean;
  handler: ResizeHandler;
  instantHandler: ResizeHandler;
};

// single instance ResizeObserver with ability to notify resize changes even for elements with
// overflow:hidden style by utilizing MutationObserver
const globalObserver = (() => {
  const resizeHandlers = new Map<Element, ResizeHandlerInstance[]>();
  const observer =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(entries => {
          entries.forEach(entry => {
            const cachedEntry = resizeHandlers.get(entry.target);
            if (cachedEntry) {
              cachedEntry.forEach(it => {
                if (!it.fired) {
                  it.instantHandler(entry);
                } else {
                  it.handler(entry);
                }
                it.fired = true;
              });
            }
          });
        })
      : null;

  return {
    register: (node: Element, handler: ResizeHandler, instantHandler: ResizeHandler) => {
      // Not adding polyfills unless we see a need for it - ResizeObserver should be well supported by now
      if (!observer) {
        // TODO: Send analytics event for observability
        console.error('ResizeObserver is not supported in this browser');
        return;
      }

      const cachedEntry = resizeHandlers.get(node);
      if (cachedEntry) {
        cachedEntry.push({ fired: false, handler, instantHandler });
        return;
      }

      resizeHandlers.set(node, [{ fired: false, handler, instantHandler }]);
      observer.observe(node);
    },
    unregister: (node: Element) => {
      observer?.unobserve(node);
      resizeHandlers.delete(node);
    },
  };
})();

export function useElementResizeObserver<T>(
  callback: ResizeHandler<T>,
  deps?: React.DependencyList,
): [SetNode, T | undefined] {
  const [entry, setEntry] = useState<T | undefined>();
  const [node, setNode] = useState<Element | null>(null);
  const isMounted = useIsMountedRef();

  useEffect(() => {
    if (node) {
      const action = (e: PartialResizeObserverEntry) => {
        if (isMounted.current) {
          setEntry(callback(e));
        }
      };
      globalObserver.register(node, debounce(action, 25), action);

      return () => globalObserver.unregister(node);
    }
    // We intentionally disable exhaustive-deps here because the dependency list can be
    // customized via the `deps` argument, and including `callback` directly may cause
    // unnecessary re-registrations of the event listener if the callback is re-created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, node, ...(deps || [callback])]);

  return [setNode, entry];
}

export function useWindowResizeObserver(callback: () => any, deps?: React.DependencyList) {
  useEffect(() => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
    // We intentionally disable exhaustive-deps here because the dependency list can be
    // customized via the `deps` argument, and including `callback` directly may cause
    // unnecessary re-registrations of the event listener if the callback is re-created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || [callback])]);
}

export type PartialResizeObserverEntry = Pick<ResizeObserverEntry, 'contentRect' | 'borderBoxSize' | 'target'>;
export type ResizeHandler<T = any> = (entry: PartialResizeObserverEntry) => T;
export type SetNode = Dispatch<SetStateAction<Element | null>>;
