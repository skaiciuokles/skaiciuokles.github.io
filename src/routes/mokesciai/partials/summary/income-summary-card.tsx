import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '../utils';
import { cn } from '@/lib/utils';

export function IncomeSummaryCard({
  title,
  value,
  valueInfo,
  extras,
  valueClassName,
  className,
  ...rest
}: IncomeSummaryCardProps) {
  return (
    <Card className={cn('py-3 shadow-sm border-stone-200', className)} {...rest}>
      <CardContent className="px-4">
        <div className="flex lg:flex-col not-lg:items-center justify-between gap-1 flex-wrap">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{title}</div>
          <div className="flex items-center gap-1">
            <div className={cn('text-xl font-bold text-stone-900 leading-none', valueClassName)}>
              {formatCurrency(value)}
            </div>
            <div className="text-xs font-medium text-muted-foreground">{valueInfo}</div>
          </div>
        </div>
        {extras && (
          <div className="mt-1.5 pt-1 border-t border-stone-100 text-xs text-muted-foreground flex justify-between col-span-full">
            {extras.map((extra, index) => (
              <div key={index}>
                <div className="flex items-center gap-1 text-nowrap">{extra.label}</div>
                <div className="font-semibold text-stone-700">{formatCurrency(extra.value)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface IncomeSummaryCardProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  value: number;
  title: React.ReactNode;
  valueInfo: React.ReactNode;
  extras?: { label: React.ReactNode; value: number }[];
  valueClassName?: string;
}
