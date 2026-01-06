import { cn } from '@/lib/utils';
import { Tooltip, type TooltipProps } from '../layouts/tooltip';

export function Unavailable({ unavailableTitle, children, unavailableContentClassName, ...rest }: UnavailableProps) {
  return (
    <Tooltip
      trigger={children}
      contentClassName={cn('pointer-events-none text-center text-wrap', unavailableContentClassName)}
      label={unavailableTitle || 'Coming soon...'}
      {...rest}
    />
  );
}

export interface BaseUnavailableProps {
  unavailable?: boolean;
  unavailableTitle?: string;
  unavailableContentClassName?: string;
}

type AcceptedTooltipProps = Omit<TooltipProps, 'label' | 'trigger' | 'contentClassName'>;
export interface UnavailableProps extends AcceptedTooltipProps, BaseUnavailableProps {
  children: React.ReactElement;
}
