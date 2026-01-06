import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleTrigger } from '@/components/layouts/collapsible';
import { cn } from '@/lib/utils';

export function TaxSummaryTableHeaderRow({ className, ...rest }: React.ComponentProps<'tr'>) {
  return <tr className={cn('bg-stone-200', className)} {...rest} />;
}
export function TaxSummaryTableHeaderColumn({ className, ...rest }: React.ComponentProps<'th'>) {
  return <th className={cn('border border-stone-300 px-2 py-1 text-center', className)} {...rest} />;
}

export function TaxSummaryTableBodyRow({ className, ...rest }: React.ComponentProps<'tr'>) {
  return <tr className={cn('bg-stone-50', className)} {...rest} />;
}
export function TaxSummaryTableBodyColumn({ className, ...rest }: React.ComponentProps<'th'>) {
  return <td className={cn('border border-stone-300 px-2 py-1 text-center', className)} {...rest} />;
}

export function TaxSummaryTableWrapper({
  label,
  tableHeader,
  children,
  className,
  ...rest
}: TaxSummaryTableWrapperProps) {
  return (
    <div className={cn('overflow-x-auto', className)} {...rest}>
      <Collapsible
        renderBefore={({ isOpen }) => (
          <CollapsibleTrigger>
            <h2 className="text-lg font-bold text-left flex items-center gap-2 cursor-pointer">
              {label}
              {isOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
            </h2>
          </CollapsibleTrigger>
        )}
        initialOpen
        asChild
      >
        <div className="pt-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <TaxSummaryTableHeaderRow>{tableHeader}</TaxSummaryTableHeaderRow>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </Collapsible>
    </div>
  );
}

interface TaxSummaryTableWrapperProps extends React.ComponentProps<'div'> {
  label: React.ReactNode;
  children: React.ReactNode;
  tableHeader: React.ReactNode;
}
