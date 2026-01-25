import React from 'react';
import { ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import { Tooltip } from '@/components/layouts/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent, calculateAllTaxes } from './utils';
import type { Income, Year } from './utils';
import { cn } from '@/lib/utils';
import type { TariffInfoComponentProps } from './tariff-info/tariff-drawer';

function IncomeSummaryCard({ title, value, valueInfo, extras, valueClassName }: IncomeSummaryCardProps) {
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

export const IncomeSummary = ({ income, className }: IncomeSummaryProps) => {
  const { totals, psdRemainder } = React.useMemo(() => calculateAllTaxes(income), [income]);

  const monthlyAverageBefore = totals.salaryBeforeTaxes / 12;
  const monthlyAverageAfter = totals.salaryAfterTaxes / 12;

  return (
    <div className={cn('grid grid-cols-[1fr] md:grid-cols-[1fr_1fr_1.4fr] gap-3', className)}>
      <IncomeSummaryCard
        title="Mėnesio vidurkis"
        value={monthlyAverageAfter}
        valueInfo="į rankas"
        extras={[{ label: 'Ant popieriaus', value: monthlyAverageBefore }]}
      />
      <IncomeSummaryCard
        title="Metinės pajamos"
        value={totals.salaryAfterTaxes}
        valueInfo="į rankas"
        extras={[{ label: 'Ant popieriaus', value: totals.salaryBeforeTaxes }]}
      />
      <IncomeSummaryCard
        title="Mokesčiai"
        value={totals.total.amount}
        valueClassName="text-rose-600"
        valueInfo={`iš viso (${formatPercent(totals.total.percentage)})`}
        extras={[
          {
            label: `GPM (${formatPercent(totals.gpm.percentage)})`,
            value: totals.gpm.amount,
          },
          {
            label: `VSD (${formatPercent(totals.vsd.percentage)})`,
            value: totals.vsd.amount,
          },
          {
            label: (
              <div className="flex items-center gap-1">
                PSD ({formatPercent(totals.psd.percentage)}):
                {psdRemainder > 0 && (
                  <Tooltip
                    label={
                      <div className="max-w-xs">
                        Pridėta papildomai {formatCurrency(psdRemainder)} iki minimalių PSD įmokų.
                      </div>
                    }
                  >
                    <InfoIcon className="size-3 text-stone-400" />
                  </Tooltip>
                )}
              </div>
            ),
            value: totals.psd.amount,
          },
        ]}
      />
    </div>
  );
};

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

interface IncomeSummaryProps {
  income: Income;
  className?: string;
}
