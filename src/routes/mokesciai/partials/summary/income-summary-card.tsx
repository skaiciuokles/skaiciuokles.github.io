import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '../utils';
import { cn } from '@/lib/utils';

export function IncomeSummaryCard({ title, value, valueInfo, extras, valueClassName }: IncomeSummaryCardProps) {
  return (
    <Card className="py-3 shadow-sm border-stone-200">
      <CardContent className="flex flex-col gap-0.5 px-4">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{title}</span>
        <div className="flex justify-between items-center gap-1 not-md:flex-col">
          <span className={cn('text-xl font-bold text-stone-900', valueClassName)}>{formatCurrency(value)}</span>
          <span className="text-xs font-medium text-muted-foreground">{valueInfo}</span>
        </div>
        {extras && (
          <div className="mt-0.5 pt-1 border-t border-stone-100 text-xs text-muted-foreground flex justify-between">
            {extras.map((extra, index) => (
              <div key={index}>
                <div className="flex items-center gap-1 text-nowrap">{extra.label}:</div>
                <div className="font-semibold text-stone-700">{formatCurrency(extra.value)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface IncomeSummaryCardProps {
  value: number;
  title: React.ReactNode;
  valueInfo: React.ReactNode;
  extras?: { label: React.ReactNode; value: number }[];
  valueClassName?: string;
}
