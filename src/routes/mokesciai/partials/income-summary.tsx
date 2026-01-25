import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from '@/components/layouts/tooltip';
import { formatCurrency, formatPercent, calculateAllTaxes } from './utils';
import { IncomeSummaryCard } from './summary/income-summary-card';
import type { Income } from './utils';
import { cn } from '@/lib/utils';

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
