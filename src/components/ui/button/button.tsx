'use client';

import React, { type ButtonHTMLAttributes } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { useIsMountedRef } from '@/hooks/general';
import { cn } from '@/lib/utils';
import { type BaseUnavailableProps, Unavailable } from '../unavailable';
import { CircularSpinner } from '../loading';
import { buttonVariants } from './variants';

export function Button({
  className,
  variant,
  size = variant === 'text' ? 'none' : 'default',
  loading,
  children,
  disabled,
  unavailable,
  unavailableTitle,
  unavailableContentClassName,
  onClick,
  async,
  ref,
  ...rest
}: ButtonProps) {
  const [internalLoading, setIsLoading] = React.useState(false);
  const isMountedRef = useIsMountedRef();
  const isLoading = loading || internalLoading;

  const buttonDisabled = disabled || unavailable || isLoading;
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (onClick) {
      try {
        if (async) {
          setIsLoading(true);
        }
        await onClick(event);
      } finally {
        if (async && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }
  };

  const content = (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      disabled={buttonDisabled}
      data-slot="button"
      ref={ref}
      {...rest}
      // Overriding the original to not add `false` value to `aria-disabled` attribute
      aria-disabled={rest['aria-disabled'] === true || rest['aria-disabled'] === 'true' ? true : undefined}
    >
      {isLoading && <CircularSpinner className="mr-1" size="sm" />}
      {children}
    </button>
  );

  if (unavailable) {
    return (
      <Unavailable unavailableTitle={unavailableTitle} unavailableContentClassName={unavailableContentClassName}>
        {content}
      </Unavailable>
    );
  }

  return content;
}

type BaseButtonProps = React.ComponentProps<'button'>;
export interface ButtonProps extends BaseButtonProps, VariantProps<typeof buttonVariants>, BaseUnavailableProps {
  loading?: boolean;
  async?: boolean;
  /**
   * If true, the button will be appear disabled but will still be clickable.
   */
  'aria-disabled'?: ButtonHTMLAttributes<HTMLButtonElement>['aria-disabled'];
}

Button.displayName = 'Button';
