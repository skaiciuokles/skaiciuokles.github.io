import { InfoIcon } from 'lucide-react';
import { TooltipBase, type TooltipBaseProps, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { cn } from '@/lib/utils';

export function Tooltip({ label, trigger, children, iconClassName, contentClassName, ...rest }: TooltipProps) {
  return (
    <TooltipBase {...rest}>
      <TooltipTrigger asChild>
        {trigger ?? children ?? <InfoIcon className={cn('size-4', iconClassName)} />}
      </TooltipTrigger>
      <TooltipContent className={contentClassName}>{label}</TooltipContent>
    </TooltipBase>
  );
}

export interface TooltipProps extends TooltipBaseProps {
  label: React.ReactNode;
  trigger?: React.ReactNode;
  iconClassName?: string;
  contentClassName?: string;
}
