'use client';

import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  cn(
    'py-1 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all shrink-0 outline-none leading-none',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    'not-disabled:not-aria-[disabled]:cursor-pointer disabled:opacity-50 aria-[disabled]:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary text-primary-foreground shadow-xs',
          'not-disabled:not-aria-[disabled]:hover:bg-primary/90',
        ),
        destructive: cn(
          'bg-destructive text-white shadow-xs',
          'not-disabled:not-aria-[disabled]:hover:bg-destructive/90',
          'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          'dark:bg-destructive/60',
        ),
        outline: cn(
          'border bg-background shadow-xs dark:bg-input/30 dark:border-input',
          'not-disabled:not-aria-[disabled]:hover:bg-accent/30 not-disabled:not-aria-[disabled]:dark:hover:bg-accent/70',
        ),
        'destructive-outline': cn(
          'border border-destructive bg-destructive/5 text-destructive shadow-xs',
          'not-disabled:not-aria-[disabled]:hover:bg-destructive/10',
        ),
        secondary: cn(
          'bg-secondary text-secondary-foreground shadow-xs',
          'not-disabled:not-aria-[disabled]:hover:bg-secondary/80',
        ),
        ghost: cn(
          'not-disabled:not-aria-[disabled]:hover:bg-accent not-disabled:not-aria-[disabled]:hover:text-accent-foreground not-disabled:not-aria-[disabled]:dark:hover:bg-accent/50',
        ),
        link: 'text-primary underline-offset-4 not-disabled:not-aria-[disabled]:hover:underline',
        text: 'text-inherit font-inherit',
      },
      size: {
        default: 'min-h-9 px-4',
        sm: 'min-h-8 rounded-md gap-1.5 px-3',
        lg: 'min-h-10 rounded-md px-6',
        xl: 'min-h-12 rounded-md px-8',
        icon: 'p-0 size-9',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
