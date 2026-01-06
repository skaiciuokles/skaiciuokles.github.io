import React from 'react';
import { cn } from '@/lib/utils';

export function TaxSummaryTableHeaderRow({ className, ...rest }: React.ComponentProps<'tr'>) {
  return <tr className={cn('bg-stone-200', className)} {...rest} />;
}
export function TaxSummaryTableHeaderColumn({ className, ...rest }: React.ComponentProps<'th'>) {
  return <th className={cn('border border-stone-300 px-2 py-1.5 text-center', className)} {...rest} />;
}

export function TaxSummaryTableBodyRow({ className, ...rest }: React.ComponentProps<'tr'>) {
  return <tr className={cn('bg-stone-50', className)} {...rest} />;
}
export function TaxSummaryTableBodyColumn({ className, ...rest }: React.ComponentProps<'th'>) {
  return <td className={cn('border border-stone-300 px-2 py-1.5 text-center', className)} {...rest} />;
}

export function TaxSummaryTableWrapper({ label, tableHeader, children }: TaxSummaryTableWrapperProps) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-left flex items-center gap-2">{label}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <TaxSummaryTableHeaderRow>{tableHeader}</TaxSummaryTableHeaderRow>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

type TaxSummaryTableWrapperProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  tableHeader: React.ReactNode;
};
