'use client';

import { createPortal } from 'react-dom';
import { cloneElement, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useElementResizeObserver, useOnClickOutside } from '@/hooks';
import { cn } from '@/lib/utils';
import React from 'react';

const CollapsibleContext = createContext<ICollapsibleContext | undefined>(undefined);
const TRANSITION_DURATION = 150;

export function Collapsible({
  id,
  direction = 'horizontal',
  trigger,
  children,
  className,
  asChild,
  style,
  renderBefore,
  renderAfter,
  initialOpen = false,
  collapseOnClickOutside = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isRendered, setIsRendered] = useState(initialOpen);
  const [element, size] = useElementResizeObserver(entry => {
    const [boxSize] = entry.borderBoxSize;
    return {
      width: boxSize?.inlineSize || entry.contentRect.width,
      height: boxSize?.blockSize || entry.contentRect.height,
    };
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setIsRendered(false), TRANSITION_DURATION);
  }, []);

  const actions = useMemo(
    () => ({
      open: () => {
        setIsRendered(true);
        requestAnimationFrame(() => setIsOpen(true));
      },
      close,
      toggle: () => {
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

  const internalId = React.useId();
  const collapsibleId = `collapsible-trigger-${id || internalId}`;
  const shouldIgnore = useCallback((target: HTMLElement) => target.dataset.slot === collapsibleId, [collapsibleId]);
  const content = (
    <div
      style={{
        ...(direction === 'horizontal' ? { height: isOpen ? size?.height : 0 } : { width: isOpen ? size?.width : 0 }),
        transitionDuration: `${TRANSITION_DURATION}ms`,
        ...style,
      }}
      className={cn('overflow-hidden transition-[width,height]', className)}
      ref={useOnClickOutside(actions.close, undefined, { shouldIgnore, disabled: !collapseOnClickOutside })}
    >
      {cloneElement(children, { ref: element })}
    </div>
  );

  const context = useMemo(() => ({ isOpen, actions, id: collapsibleId }), [isOpen, actions, collapsibleId]);
  return (
    <CollapsibleContext.Provider value={context}>
      {trigger && <CollapsibleTrigger>{trigger}</CollapsibleTrigger>}
      {renderBefore?.(context)}
      {isRendered && (asChild ? content : createPortal(content, document.body))}
      {renderAfter?.(context)}
    </CollapsibleContext.Provider>
  );
}

type TriggerElement = React.ReactElement<{ onClick?: () => void; 'data-slot'?: string }>;

export interface CollapsibleProps {
  id?: string;
  direction?: 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  trigger?: TriggerElement;
  asChild?: boolean;
  children: React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;
  initialOpen?: boolean;
  collapseOnClickOutside?: boolean;
  renderBefore?: (context: ICollapsibleContext) => React.ReactNode;
  renderAfter?: (context: ICollapsibleContext) => React.ReactNode;
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
