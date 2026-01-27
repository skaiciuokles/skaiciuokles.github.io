'use client';

import { createPortal } from 'react-dom';
import { cloneElement, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useElementResizeObserver, useOnClickOutside } from '@/hooks';
import { cn } from '@/lib/utils';
import React from 'react';

const CollapsibleContext = createContext<ICollapsibleContext | undefined>(undefined);
const getExpandedStateKey = (id: string) => `collapsible-${id}-open`;

export function Collapsible({
  id,
  direction = 'horizontal',
  duration = 150,
  trigger,
  children,
  className,
  asChild,
  style,
  renderBefore,
  renderAfter,
  initialOpen = false,
  collapseOnClickOutside = false,
  keepState = false,
  anchor,
  ...rest
}: CollapsibleProps) {
  const isInitialOpen = useMemo(
    () => (keepState && id ? localStorage.getItem(getExpandedStateKey(id)) === 'true' : initialOpen),
    [keepState, id, initialOpen],
  );
  const [isOpen, setIsOpen] = useState(isInitialOpen);
  const [isRendered, setIsRendered] = useState(isInitialOpen);
  const [element, size] = useElementResizeObserver(entry => {
    const [boxSize] = entry.borderBoxSize;
    const parent = entry.target.parentElement;
    const parentRect = parent && parent.getBoundingClientRect();
    const parentPadding = parentRect
      ? { x: parentRect.width - parent.clientWidth, y: parentRect.height - parent.clientHeight }
      : { x: 0, y: 0 };

    return {
      width: Math.ceil((boxSize?.inlineSize || entry.contentRect.width) + parentPadding.x),
      height: Math.ceil((boxSize?.blockSize || entry.contentRect.height) + parentPadding.y),
    };
  }, []);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const close = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsOpen(false);
    closeTimeoutRef.current = setTimeout(() => setIsRendered(false), duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const actions = useMemo(
    () => ({
      open: () => {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        setIsRendered(true);
        requestAnimationFrame(() => setIsOpen(true));
      },
      close,
      toggle: () => {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        setIsRendered(prev => {
          requestAnimationFrame(() => (!prev ? setIsOpen(true) : close()));
          // This always returns true, because we either immediately render and then open in the next frame or we
          // close in the next frame and then remove the element from DOM after the default transition duration
          return true;
        });
      },
    }),
    [close],
  );

  React.useEffect(() => {
    if (keepState && id) {
      localStorage.setItem(getExpandedStateKey(id), String(isOpen));
    }
  }, [isOpen, id, keepState]);

  const internalId = React.useId();
  const collapsibleId = `collapsible-trigger-${id || internalId}`;
  const shouldIgnore = useCallback((target: HTMLElement) => target.dataset.slot === collapsibleId, [collapsibleId]);
  const content = (
    <div
      style={{
        ...(direction === 'horizontal' ? { height: isOpen ? size?.height : 0 } : { width: isOpen ? size?.width : 0 }),
        transitionDuration: `${duration}ms`,
        ...style,
      }}
      className={cn(
        'transition-[width,height]',
        direction === 'vertical' ? 'overflow-x-hidden' : 'overflow-y-hidden',
        className,
      )}
      ref={useOnClickOutside(actions.close, undefined, { shouldIgnore, disabled: !collapseOnClickOutside })}
      {...rest}
    >
      {cloneElement(children, { ref: element })}
    </div>
  );

  const context = useMemo(() => ({ isOpen, actions, id: collapsibleId }), [isOpen, actions, collapsibleId]);
  // eslint-disable-next-line react-hooks/refs
  const triggerElement = trigger && (typeof trigger === 'function' ? trigger(context) : trigger);

  return (
    <CollapsibleContext.Provider value={context}>
      {triggerElement && <CollapsibleTrigger>{triggerElement}</CollapsibleTrigger>}
      {/* eslint-disable-next-line react-hooks/refs */}
      {renderBefore?.(context)}
      {isRendered && (asChild ? content : createPortal(content, anchor?.current ?? document.body))}
      {/* eslint-disable-next-line react-hooks/refs */}
      {renderAfter?.(context)}
    </CollapsibleContext.Provider>
  );
}

type TriggerElement = React.ReactElement<{ onClick?: () => void; 'data-slot'?: string }>;

export interface CollapsibleProps extends React.ComponentProps<'div'> {
  id?: string;
  direction?: 'vertical' | 'horizontal';
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
  trigger?: TriggerElement | ((context: ICollapsibleContext) => TriggerElement);
  asChild?: boolean;
  children: React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;
  initialOpen?: boolean;
  collapseOnClickOutside?: boolean;
  renderBefore?: (context: ICollapsibleContext) => React.ReactNode;
  renderAfter?: (context: ICollapsibleContext) => React.ReactNode;
  anchor?: React.RefObject<HTMLElement | null>;
  keepState?: boolean;
}

export function CollapsibleTrigger({ children }: { children: TriggerElement }) {
  const context = useContext(CollapsibleContext);
  if (!context) throw new Error('CollapsibleTrigger must be used within a Collapsible');
  return cloneElement(children, { onClick: context.actions.toggle, 'data-slot': context.id });
}

export interface ICollapsibleContext {
  id: string;
  isOpen: boolean;
  actions: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
}
