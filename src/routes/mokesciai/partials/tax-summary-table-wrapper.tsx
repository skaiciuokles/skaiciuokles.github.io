import React from 'react';
import { cn } from '@/lib/utils';

export function TaxSummaryTableHeaderRow({ className, ...rest }: React.ComponentProps<'tr'>) {
  return <tr className={cn('bg-stone-200', className)} {...rest} />;
}
export function TaxSummaryTableHeaderColumn({ className, ...rest }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn('border-b border-r last:border-r-0 border-stone-300 px-2 py-1 text-center', className)}
      {...rest}
    />
  );
}

export function TaxSummaryTableBodyRow({ className, ...rest }: React.ComponentProps<'tr'>) {
  return <tr className={cn('bg-stone-50 last:[&_td]:border-b-0', className)} {...rest} />;
}
export function TaxSummaryTableBodyColumn({ className, ...rest }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'border-b border-r last:border-r-0 border-stone-300 px-2 py-0.5 text-center text-nowrap',
        className,
      )}
      {...rest}
    />
  );
}
