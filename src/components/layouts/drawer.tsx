'use client';

import React from 'react';
import {
  DrawerBase,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  type DrawerContentProps,
} from '../ui/drawer';

export function Drawer({ trigger, children, title, description, footer, size, ...rest }: DrawerProps) {
  return (
    <DrawerBase {...rest}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent size={size}>
        {title && description && (
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
        )}
        {children}
        <DrawerFooter>{footer}</DrawerFooter>
      </DrawerContent>
    </DrawerBase>
  );
}

export type DrawerProps = React.ComponentProps<typeof DrawerBase> &
  Pick<DrawerContentProps, 'size'> & {
    trigger: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
  };
