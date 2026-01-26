import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/forms/input';
import { Label } from '@/components/ui/label';
import { Drawer } from '@/components/layouts/drawer';
import { LoadingOverlay } from '@/components/ui/loading';
import {
  calculateIVGpm,
  calculateMBProfitTaxRate,
  calculateSourceTaxes,
  ivYearlyTaxRates,
  MB_INCOME_LIMIT_PER_YEAR,
  mbYearlyTaxRates,
  MINIMUM_ANNUAL_PSD,
  yearlyTaxRates,
} from './utils';
import type { Income } from './utils';

interface IncomeOptimizerProps {
  income: Income;
  setIncome: React.Dispatch<React.SetStateAction<Income>>;
}

export function IncomeOptimizer({ income, setIncome }: IncomeOptimizerProps) {
  const [{ isOpen, isLoading }, setOptimizerState] = React.useState({ isOpen: false, isLoading: false });
  const [extraIncome, setExtraIncome] = React.useState<number>();

  const taxRates = yearlyTaxRates[income.year];
  const mbTaxRates = mbYearlyTaxRates[income.year];
  const ivTaxRates = ivYearlyTaxRates[income.year];

  const mbProfitTaxRate = React.useMemo(() => calculateMBProfitTaxRate(income), [income]);
  const calculateTotalTaxes = (ivMonthly: number, mbMonthly: number, mbDividendsMonthly: number) => {
    const mbTaxableMonthly = mbMonthly * mbTaxRates.gpmBase;
    const ivTaxableMonthly = ivMonthly * ivTaxRates.gpmBase;

    const { totals: mbTotals } = calculateSourceTaxes({
      monthlySalary: mbMonthly,
      taxRates: mbTaxRates,
      withSodra: false,
    });

    const profitTax = mbDividendsMonthly * 12 * mbProfitTaxRate;
    const mbDividendsGpm = (mbDividendsMonthly * 12 - profitTax) * 0.15;
    const mbDividendsTotTaxes = profitTax + mbDividendsGpm;

    const ivAnnualTaxable = ivMonthly * 12 * ivTaxRates.gpmBase;
    const ivGpmResult = ivMonthly && ivAnnualTaxable <= 42500 ? calculateIVGpm(ivAnnualTaxable) : undefined;
    const { totals: ivTotals } = calculateSourceTaxes({
      monthlySalary: ivMonthly,
      taxRates: ivTaxRates,
      additionalForGPM: !income.monthly ? mbTaxableMonthly * 12 : 0,
      gpmOverride: ivGpmResult ? { amount: ivGpmResult.amount / 12, percentage: ivGpmResult.percentage } : undefined,
      withSodra: true,
    });

    const { totals: duTotals } = calculateSourceTaxes({
      monthlySalary: income.monthly ?? 0,
      taxRates: taxRates,
      additionalForGPM: (mbTaxableMonthly + ivTaxableMonthly) * 12,
      pensionAccumulation: income.pensionAccumulation,
      withSodra: true,
    });

    let totalTaxesAmount = mbTotals.total.amount + ivTotals.total.amount + duTotals.total.amount + mbDividendsTotTaxes;

    const minimumAnnualPsd = MINIMUM_ANNUAL_PSD[income.year];
    const totalPsd = mbTotals.psd.amount + ivTotals.psd.amount + duTotals.psd.amount;
    if (totalPsd < minimumAnnualPsd) {
      totalTaxesAmount += minimumAnnualPsd - totalPsd;
    }

    return totalTaxesAmount;
  };

  const handleOptimize = () => {
    if (extraIncome === undefined) return;

    setOptimizerState(prev => ({ ...prev, isLoading: true }));

    // Allow the loading overlay to become visible (perform calculations in next event loop tick)
    setTimeout(() => {
      const totalToOptimize = extraIncome;
      let bestIV = 0;
      let bestMB = 0;
      let bestDividends = 0;
      let minTaxes = Infinity;

      const mbMonthlyLimit = MB_INCOME_LIMIT_PER_YEAR / 12;
      const maxMbAmount = Math.min(totalToOptimize, mbMonthlyLimit);
      // Using steps that scale with extra income to maintain performance. This will go up to ~80k iterations
      // as it reaches 4000 € extra income and stay at ~80k iterations even as income increases.
      const mbStep = Math.max(10, Math.ceil(maxMbAmount / 400));
      const ivStep = Math.max(10, Math.ceil(totalToOptimize / 400));

      for (let totalMB = 0; totalMB <= maxMbAmount; totalMB += mbStep) {
        for (let totalIV = 0; totalIV <= totalToOptimize - totalMB; totalIV += ivStep) {
          const totalDividends = totalToOptimize - totalMB - totalIV;
          const taxes = calculateTotalTaxes(totalIV, totalMB, totalDividends);

          if (taxes < minTaxes) {
            minTaxes = taxes;
            bestIV = totalIV;
            bestMB = totalMB;
            bestDividends = totalDividends;
          }
        }
      }

      // Final checks for edge cases to ensure we don't miss obvious 100% allocations due to steps
      const combinations: [number, number, number][] = [
        [totalToOptimize, 0, 0],
        [0, maxMbAmount, totalToOptimize - maxMbAmount],
        [0, 0, totalToOptimize],
      ];

      for (const [iv, mb, div] of combinations) {
        const taxes = calculateTotalTaxes(iv, mb, div);
        if (taxes < minTaxes) {
          minTaxes = taxes;
          bestIV = iv;
          bestMB = mb;
          bestDividends = div;
        }
      }

      // If the best MB is a tiny fraction of the best dividends, it's best to allocate everything
      // to dividends and set MB to 0 to simplify tax reporting at the end of the year.
      if (bestMB * 100 < bestDividends) {
        bestDividends = bestDividends + bestMB;
        bestMB = 0;
      }
      setIncome(prev => ({ ...prev, ivMonthly: bestIV, mbMonthly: bestMB, mbDividendsMonthly: bestDividends }));
      setOptimizerState({ isOpen: false, isLoading: false });
    }, 0);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={open => {
        setOptimizerState(prev => ({ ...prev, isOpen: open }));
        if (open) {
          setExtraIncome((income.ivMonthly ?? 0) + (income.mbMonthly ?? 0) + (income.mbDividendsMonthly ?? 0));
        }
      }}
      trigger={
        <Button size="lg" className="w-full">
          Optimizuoti papildomas pajamas
        </Button>
      }
      title="Optimizuoti papildomas pajamas"
      description="Įveskite papildomų pajamų sumą, kurią norite paskirstyti tarp IV, MB ir MB dividendų taip, kad mokėtumėte mažiausiai mokesčių."
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setOptimizerState(prev => ({ ...prev, isOpen: false }))}>
            Atšaukti
          </Button>
          <Button onClick={handleOptimize} disabled={extraIncome === undefined}>
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
          value={extraIncome}
          onChange={setExtraIncome}
          onEnterPress={handleOptimize}
          placeholder="Pvz. 1000"
        />
      </div>
      {isLoading && <LoadingOverlay />}
    </Drawer>
  );
}
