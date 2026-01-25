import React from 'react';
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TariffInfoComponentProps } from './tariff-info/tariff-drawer';
import { formatCurrency, formatPercent } from './utils';
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
              <button className="ml-2 inline-flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleDetails(id)}
              className="text-blue-600 border-blue-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 h-7 px-2"
            >
              {isDetailsOpen ? 'Slėpti detales' : 'Detalūs skaičiavimai'}
              {isDetailsOpen ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Monthly side */}
            <div className="space-y-2 border-r border-stone-100 pr-4">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                Vidurkis per mėnesį
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase">Į rankas</span>
                  <span className="text-sm font-bold text-stone-900">{formatCurrency(monthlyAfter)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase">Ant popieriaus</span>
                  <span className="text-sm font-semibold text-stone-700">{formatCurrency(monthlyBefore)}</span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase">Mokesčiai</span>
                <span className="text-xs font-bold text-rose-600">
                  {formatCurrency(monthlyTaxes)} ({formatPercent(totals.total.percentage)})
                </span>
              </div>
            </div>

            {/* Yearly side */}
            <div className="space-y-2">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                Iš viso per metus
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase">Į rankas</span>
                  <span className="text-sm font-bold text-stone-900">{formatCurrency(totals.salaryAfterTaxes)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase">Ant popieriaus</span>
                  <span className="text-sm font-semibold text-stone-700">
                    {formatCurrency(totals.salaryBeforeTaxes)}
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase">Mokesčiai</span>
                <span className="text-xs font-bold text-rose-600">
                  {formatCurrency(totals.total.amount)} ({formatPercent(totals.total.percentage)})
                </span>
              </div>
            </div>
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
