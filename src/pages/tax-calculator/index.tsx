import React from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TaxSummaryTable } from './tax-summary-table';
import { TaxTariffLegend } from './tax-tariff-legend';
import type { Income } from './utils';

const INCOME_STORAGE_KEY = 'tax-calculator-income';

export function TaxCalculatorPage() {
  const [income, setIncome] = React.useState<Income>(() => {
    const savedIncome = localStorage.getItem(INCOME_STORAGE_KEY);
    if (savedIncome) {
      try {
        return JSON.parse(savedIncome);
      } catch (error) {
        console.error('Error parsing income from localStorage', error);
      }
    }

    return { monthly: 0, additionalMonthly: 0 };
  });

  React.useEffect(() => {
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(income));
  }, [income]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className="text-2xl font-black flex items-center justify-center gap-2">
        <Calculator className="size-8" />
        2026 Metų Mokesčių Skaičiuoklė
      </h1>

      <div className="grid grid-cols-[300px_auto] overflow-hidden">
        <div className="space-y-4 mr-3 pr-3 border-r">
          <div className="p-4 border rounded-sm">
            <Label className="mb-2 block text-left font-bold">Mėnesio darbo santykių pajamos (prieš mokesčius):</Label>
            <Input
              type="number"
              value={income.monthly}
              onChange={e => setIncome(prev => ({ ...prev, monthly: Number(e.target.value) }))}
            />
          </div>
          <div className="p-4 border rounded-sm">
            <Label className="mb-2 block text-left font-bold">
              Papildomos mėnesio pajamos iš MB (prieš mokesčius):
            </Label>
            <Input
              type="number"
              value={income.additionalMonthly}
              onChange={e => setIncome(prev => ({ ...prev, additionalMonthly: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="overflow-y-auto space-y-4">
          <TaxSummaryTable
            label="Metinė darbo santykių mokesčių suvestinė"
            monthlySalary={income.monthly ?? 0}
            additionalIncome={(income.additionalMonthly ?? 0) * 12}
            withSodra
          />

          <TaxSummaryTable label="Metinė MB mokesčių suvestinė" monthlySalary={income.additionalMonthly ?? 0} />

          <TaxTariffLegend />
        </div>
      </div>
    </div>
  );
}
