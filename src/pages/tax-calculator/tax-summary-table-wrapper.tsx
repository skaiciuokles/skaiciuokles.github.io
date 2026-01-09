import React from 'react';
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import { Collapsible, CollapsibleTrigger } from '@/components/layouts/collapsible';
import { Tooltip } from '@/components/layouts/tooltip';
import { Drawer } from '@/components/layouts/drawer';
import { cn } from '@/lib/utils';
import type { Year } from './utils';

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
  return <td className={cn('border border-stone-300 px-2 py-1 text-center text-nowrap', className)} {...rest} />;
}

export function TaxSummaryTableWrapper({
  year,
  label,
  tableHeader,
  children,
  className,
  InfoComponent,
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
              {InfoComponent && (
                <Drawer
                  direction="right"
                  trigger={
                    <span className="ml-auto" onClick={e => e.stopPropagation()}>
                      <Tooltip label="Mokesčių tarifai">
                        <InfoIcon className="size-5 text-muted-foreground" />
                      </Tooltip>
                    </span>
                  }
                >
                  <InfoComponent year={year} />
                </Drawer>
              )}
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

export interface TaxSummaryTableWrapperProps extends React.ComponentProps<'div'> {
  year: Year;
  label: React.ReactNode;
  children: React.ReactNode;
  tableHeader: React.ReactNode;
  InfoComponent?: React.FC<{ year: Year }>;
}
