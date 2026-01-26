import React from 'react';
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/layouts/collapsible';
import type { TariffInfoComponentProps } from '../tariff-info/tariff-drawer';
import { IndividualSummaryItems } from './individual-summary-items';
import { TaxSummaryTable } from './tax-summary-table';
import type { Year } from '../utils';

export const IndividualIncomeSummary = React.memo(
  ({ label, totals, className, InfoDrawer, incomeRef, year, id, ...taxTableProps }: IndividualIncomeSummaryProps) => {
    const monthlyBefore = totals.salaryBeforeTaxes / 12;
    const monthlyAfter = totals.salaryAfterTaxes / 12;
    const monthlyTaxes = totals.total.amount / 12;
    const moreInfoAnchorRef = React.useRef<HTMLDivElement>(null);
    const infoDrawer = React.useMemo(
      () =>
        InfoDrawer &&
        year &&
        incomeRef && (
          <InfoDrawer
            year={year}
            incomeRef={incomeRef}
            trigger={
              <button
                className="p-2 inline-flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                aria-label="Detali informacija apie mokesčius"
              >
                <InfoIcon className="size-4" />
              </button>
            }
          />
        ),
      [year, incomeRef, InfoDrawer],
    );

    return (
      <div className="space-y-2">
        <Card className={className}>
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-sm font-bold text-stone-800 flex items-center">
              {label}
              {infoDrawer}
            </h3>
            <Collapsible
              id={id}
              anchor={moreInfoAnchorRef}
              className="rounded shadow-sm"
              renderBefore={context => (
                <Button variant="outline" size="sm" onClick={context.actions.toggle} className="h-7 lg:w-48">
                  {context.isOpen ? 'Slėpti detales' : 'Detalūs skaičiavimai'}
                  {context.isOpen ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
                </Button>
              )}
              keepState
            >
              <TaxSummaryTable {...taxTableProps} />
            </Collapsible>
          </div>

          <div className="grid lg:grid-cols-2">
            <IndividualSummaryItems
              title="Vidurkis per mėnesį"
              salaryAfterTaxes={monthlyAfter}
              salaryBeforeTaxes={monthlyBefore}
              taxAmount={monthlyTaxes}
              taxPercentage={totals.total.percentage}
              className="not-lg:pb-2 not-lg:mb-2 not-lg:border-b lg:pr-4 lg:mr-4 lg:border-r border-stone-200"
            />
            <IndividualSummaryItems
              title="Iš viso per metus"
              salaryAfterTaxes={totals.salaryAfterTaxes}
              salaryBeforeTaxes={totals.salaryBeforeTaxes}
              taxAmount={totals.total.amount}
              taxPercentage={totals.total.percentage}
            />
          </div>
        </Card>
        <div ref={moreInfoAnchorRef} />
      </div>
    );
  },
);

interface IndividualIncomeSummaryProps extends React.ComponentProps<typeof TaxSummaryTable> {
  id: string;
  label: string;
  year: Year;
  totals: {
    salaryBeforeTaxes: number;
    salaryAfterTaxes: number;
    total: { amount: number; percentage: number };
  };
  className?: string;
  incomeRef?: TariffInfoComponentProps['incomeRef'];
  InfoDrawer?: React.FC<TariffInfoComponentProps & { trigger?: React.ReactNode }>;
}
