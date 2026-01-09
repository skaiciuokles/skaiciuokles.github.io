import { cloneElement } from 'react';
import { InfoIcon } from 'lucide-react';
import { useIsOpen } from '@/hooks/general';
import { cn } from '@/lib/utils';
import { TooltipBase, type TooltipBaseProps, TooltipContent, TooltipTrigger } from '../../ui/tooltip';

export function Tooltip({ label, trigger, children, iconClassName, contentClassName, ...rest }: TooltipProps) {
  const [open, actions] = useIsOpen();
  const triggerElement = cloneElement(trigger ?? children ?? <InfoIcon className={cn('size-4', iconClassName)} />, {
    onClick: actions.open,
  });

  return (
    <TooltipBase open={open} onOpenChange={actions.onOpenChange} {...rest}>
      <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
      <TooltipContent className={contentClassName}>{label}</TooltipContent>
    </TooltipBase>
  );
}

export interface TooltipProps extends TooltipBaseProps {
  label: React.ReactNode;
  trigger?: React.ReactElement;
  children?: React.ReactElement;
  iconClassName?: string;
  contentClassName?: string;
}
