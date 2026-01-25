import React from 'react';
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsOpen } from '@/hooks/general';
import { Collapsible } from '@/components/layouts/collapsible';
import type { TariffInfoComponentProps } from '../tariff-info/tariff-drawer';
import { IndividualSummaryItems } from './individual-summary-items';
import { TaxSummaryTable } from './tax-summary-table';
import type { Year } from '../utils';

function getExpandedStateKey(id: string) {
  return `tax-summary-expanded-${id}`;
}

export const IndividualIncomeSummary = React.memo(
  ({ label, totals, className, InfoDrawer, incomeRef, year, id, ...taxTableProps }: IndividualIncomeSummaryProps) => {
    const [isExpanded, actions] = useIsOpen(undefined, () => {
      const saved = localStorage.getItem(getExpandedStateKey(id));
      return saved === 'true';
    });

    React.useEffect(() => {
      localStorage.setItem(getExpandedStateKey(id), String(isExpanded));
    }, [isExpanded, id]);

    const monthlyBefore = totals.salaryBeforeTaxes / 12;
    const monthlyAfter = totals.salaryAfterTaxes / 12;
    const monthlyTaxes = totals.total.amount / 12;

    const infoDrawer = React.useMemo(
      () =>
        InfoDrawer &&
        year &&
        incomeRef && (
          <InfoDrawer
            year={year}
            incomeRef={incomeRef}
            trigger={
              <button className="p-2 inline-flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
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
            <Button variant="outline" size="sm" onClick={actions.toggle} className="h-7 lg:w-48">
              {isExpanded ? 'Slėpti detales' : 'Detalūs skaičiavimai'}
              {isExpanded ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
            </Button>
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
        <Collapsible open={isExpanded} asChild>
          <TaxSummaryTable {...taxTableProps} />
        </Collapsible>
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
