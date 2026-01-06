'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'size-4 border-2',
  sm: 'size-6 border-2',
  md: 'size-10 border-4',
  lg: 'size-14 border-4',
  xl: 'size-18 border-4',
};

// Basic circular spinner
export function CircularSpinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn('animate-spin rounded-full border-gray-300 border-t-chart-1', sizeClasses[size], className)} />
  );
}

// Bouncing dots spinner
export function BouncingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1 ', className)}>
      <div className="w-2 h-2 bg-chart-1 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-chart-1 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-chart-1 rounded-full animate-bounce"></div>
    </div>
  );
}

export function LoadingOverlay({ type = 'circular', className, iconClassName, ...rest }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-20 flex items-center justify-center bg-background/50 rounded-[inherit]',
        className,
      )}
    >
      {type === 'circular' ? (
        <CircularSpinner {...rest} className={iconClassName} />
      ) : (
        <BouncingDots className={iconClassName} />
      )}
    </div>
  );
}

interface LoadingOverlayProps extends SpinnerProps {
  type?: 'circular' | 'bouncing';
  iconClassName?: string;
}
