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
} from '../ui/drawer';

export function Drawer({ trigger, children, title, description, footer, ...rest }: DrawerProps) {
  return (
    <DrawerBase {...rest}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
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

type DrawerProps = React.ComponentProps<typeof DrawerBase> & {
  trigger: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
};
