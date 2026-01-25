import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from '@/components/layouts/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent, calculateAllTaxes } from './utils';
import type { Income } from './utils';
import { cn } from '@/lib/utils';

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

export const IncomeSummary = React.memo(({ income, className }: IncomeSummaryProps) => {
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
});

interface IncomeSummaryProps {
  income: Income;
  className?: string;
}
