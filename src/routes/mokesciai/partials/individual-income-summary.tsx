import React from 'react';
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TariffInfoComponentProps } from './tariff-info/tariff-drawer';
import { IndividualSummaryItems } from './summary/individual-summary-items';
import type { Year } from './utils';

export const IndividualIncomeSummary = React.memo(
  ({
    label,
    totals,
    className,
    onToggleDetails,
    isDetailsOpen,
    InfoDrawer,
    incomeRef,
    year,
    id,
  }: IndividualIncomeSummaryProps) => {
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
      <div className={cn('bg-white p-3 border rounded-lg shadow-sm border-stone-200', className)}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-sm font-bold text-stone-800 flex items-center">
              {label}
              {infoDrawer}
            </h3>
            <Button variant="outline" size="sm" onClick={() => onToggleDetails(id)} className="h-7 w-48">
              {isDetailsOpen ? 'Slėpti detales' : 'Detalūs skaičiavimai'}
              {isDetailsOpen ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <IndividualSummaryItems
              title="Vidurkis per mėnesį"
              salaryAfterTaxes={monthlyAfter}
              salaryBeforeTaxes={monthlyBefore}
              taxAmount={monthlyTaxes}
              taxPercentage={totals.total.percentage}
            />
            <IndividualSummaryItems
              title="Iš viso per metus"
              salaryAfterTaxes={totals.salaryAfterTaxes}
              salaryBeforeTaxes={totals.salaryBeforeTaxes}
              taxAmount={totals.total.amount}
              taxPercentage={totals.total.percentage}
            />
          </div>
        </div>
      </div>
    );
  },
);

interface IndividualIncomeSummaryProps {
  label: string;
  totals: {
    salaryBeforeTaxes: number;
    salaryAfterTaxes: number;
    total: { amount: number; percentage: number };
  };
  className?: string;
  onToggleDetails: (name: string) => void;
  isDetailsOpen: boolean;
  year?: Year;
  incomeRef?: TariffInfoComponentProps['incomeRef'];
  InfoDrawer?: React.FC<TariffInfoComponentProps & { trigger?: React.ReactNode }>;
  id: string;
}
