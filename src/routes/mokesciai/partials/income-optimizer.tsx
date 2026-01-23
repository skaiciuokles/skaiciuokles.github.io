import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer } from '@/components/layouts/drawer';
import {
  calculateIVGpm,
  calculateSourceTaxes,
  ivYearlyTaxRates,
  MB_INCOME_LIMIT_PER_YEAR,
  mbYearlyTaxRates,
  MMA,
  yearlyTaxRates,
} from './utils';
import type { Income } from './utils';

interface IncomeOptimizerProps {
  income: Income;
  setIncome: React.Dispatch<React.SetStateAction<Income>>;
}

export function IncomeOptimizer({ income, setIncome }: IncomeOptimizerProps) {
  const [isOptimizeOpen, setIsOptimizeOpen] = React.useState(false);
  const [extraIncome, setExtraIncome] = React.useState<number>();

  const taxRates = yearlyTaxRates[income.year];
  const mbTaxRates = mbYearlyTaxRates[income.year];
  const ivTaxRates = ivYearlyTaxRates[income.year];

  const calculateTotalTaxes = (ivMonthly: number, mbMonthly: number) => {
    const mbTaxableMonthly = mbMonthly * mbTaxRates.gpmBase;
    const ivTaxableMonthly = ivMonthly * ivTaxRates.gpmBase;

    const { totals: mbTotals } = calculateSourceTaxes({
      monthlySalary: mbMonthly,
      taxRates: mbTaxRates,
      withSodra: false,
    });

    const ivAnnualTaxable = ivMonthly * 12 * ivTaxRates.gpmBase;
    const ivGpmResult = ivMonthly && ivAnnualTaxable <= 42500 ? calculateIVGpm(ivAnnualTaxable) : undefined;
    const { totals: ivTotals } = calculateSourceTaxes({
      monthlySalary: ivMonthly,
      taxRates: ivTaxRates,
      additionalForGPM: !income.monthly ? mbTaxableMonthly * 12 : 0,
      gpmOverride: ivGpmResult ? { amount: ivGpmResult.amount / 12, percentage: ivGpmResult.percentage } : undefined,
      withSodra: true,
      pensionAccumulation: income.pensionAccumulation,
    });

    const { totals: duTotals } = calculateSourceTaxes({
      monthlySalary: income.monthly ?? 0,
      taxRates: taxRates,
      additionalForGPM: (mbTaxableMonthly + ivTaxableMonthly) * 12,
      withSodra: true,
      pensionAccumulation: income.pensionAccumulation,
    });

    let totalTaxesAmount = mbTotals.total.amount + ivTotals.total.amount + duTotals.total.amount;

    const minimumAnnualPsd = Number((MMA[income.year] * 12 * taxRates.psd[0].rate).toFixed(2));
    const totalPsd = mbTotals.psd.amount + ivTotals.psd.amount + duTotals.psd.amount;
    if (totalPsd < minimumAnnualPsd) {
      totalTaxesAmount += minimumAnnualPsd - totalPsd;
    }

    return totalTaxesAmount;
  };

  const handleOptimize = () => {
    if (extraIncome === undefined) return;

    let bestIV = extraIncome;
    let bestMB = 0;
    let minTaxes = Infinity;

    const mbMonthlyLimit = MB_INCOME_LIMIT_PER_YEAR / 12;

    // Split total extraIncome between IV and MB
    for (let totalIV = 0; totalIV <= extraIncome; totalIV += 10) {
      const totalMB = extraIncome - totalIV;

      if (totalMB > mbMonthlyLimit) continue;

      const taxes = calculateTotalTaxes(totalIV, totalMB);

      if (taxes < minTaxes) {
        minTaxes = taxes;
        bestIV = totalIV;
        bestMB = totalMB;
      }
    }

    // Final check for the exact extraIncome value
    const lastTaxes = calculateTotalTaxes(extraIncome, 0);
    if (lastTaxes < minTaxes) {
      bestIV = extraIncome;
      bestMB = 0;
    }

    setIncome(prev => ({ ...prev, ivMonthly: bestIV, mbMonthly: bestMB }));
    setIsOptimizeOpen(false);
  };

  return (
    <Drawer
      open={isOptimizeOpen}
      onOpenChange={open => {
        setIsOptimizeOpen(open);
        if (open) {
          setExtraIncome((income.ivMonthly ?? 0) + (income.mbMonthly ?? 0));
        }
      }}
      trigger={
        <Button size="lg" className="md:w-full">
          Optimizuoti papildomas pajamas
        </Button>
      }
      title="Optimizuoti papildomas pajamas"
      description="Įveskite papildomų pajamų sumą, kurią norite paskirstyti tarp IV ir MB taip, kad mokėtumėte mažiausiai mokesčių."
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setIsOptimizeOpen(false)}>
            Atšaukti
          </Button>
          <Button onClick={handleOptimize} disabled={!extraIncome}>
            Optimizuoti
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="extra-income">Papildomos pajamos (per mėnesį):</Label>
        <Input
          id="extra-income"
          type="number"
          value={extraIncome ?? ''}
          onChange={e => setExtraIncome(e.target.value ? Number(e.target.value) : undefined)}
          onEnterPress={handleOptimize}
          placeholder="Pvz. 1000"
        />
      </div>
    </Drawer>
  );
}
