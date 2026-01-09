import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

function DrawerBase({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

const drawerContentVariants = cva(cn('group/drawer-content bg-background fixed z-50 flex h-auto flex-col p-4'), {
  variants: {
    direction: {
      top: 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b',
      bottom: 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t',
      right: 'inset-y-0 right-0 w-3/4 border-l',
      left: 'inset-y-0 left-0 w-3/4 border-r',
    },
    size: {
      sm: 'data-[direction=vertical]:max-w-sm',
      md: 'data-[direction=vertical]:max-w-md',
      lg: 'data-[direction=vertical]:max-w-lg',
    },
  },
  defaultVariants: {
    direction: 'right',
    size: 'md',
  },
});

function DrawerContent({ className, size, direction, children, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay onClick={e => e.stopPropagation()} />
      <DrawerPrimitive.Content
        onClick={e => e.stopPropagation()}
        data-slot="drawer-content"
        className={cn(drawerContentVariants({ size, direction, className }))}
        data-direction={direction && ['top', 'bottom'].includes(direction) ? 'horizontal' : 'vertical'}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        <div className="overflow-y-auto">{children}</div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> &
  VariantProps<typeof drawerContentVariants>;

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 mb-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left',
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  DrawerBase,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
