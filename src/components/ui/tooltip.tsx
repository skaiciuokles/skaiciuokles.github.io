import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

export function TooltipProvider({ delayDuration = 0, ...rest }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...rest} />;
}
type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider>;

export function TooltipRoot(props: TooltipRootProps) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}
type TooltipRootProps = React.ComponentProps<typeof TooltipPrimitive.Root>;

export function TooltipBase(props: TooltipBaseProps) {
  return (
    <TooltipProvider>
      <TooltipRoot {...props} />
    </TooltipProvider>
  );
}
export type TooltipBaseProps = TooltipRootProps;

export function TooltipError({ className, ...rest }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-2 py-1 rounded-md bg-destructive-light text-destructive-light-foreground border border-destructive/50',
        className,
      )}
      {...rest}
    />
  );
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
type TooltipTriggerProps = React.ComponentProps<typeof TooltipPrimitive.Trigger>;

export function TooltipContent({ className, sideOffset = 0, children, ...rest }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-foreground border border-primary-foreground/30 animate-in rounded-md px-3 py-1.5 text-xs fade-in-0 zoom-in-95',
          'text-balance text-background',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin)',
          className,
        )}
        {...rest}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground border-b border-r border-primary-foreground/30 fill-foreground z-50 size-2.5 -translate-y-1/2 rotate-45 rounded-xs" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content>;
