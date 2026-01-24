import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/forms/select';
import { IncomeOptimizer } from './income-optimizer';
import { formatCurrency, MB_INCOME_LIMIT_PER_YEAR, MMA, VDU } from './utils';
import type { Income } from './utils';

const INCOME_STORAGE_KEY = 'tax-calculator-income';

export function IncomeConfigurationPanel({ income, setIncome }: IncomeConfigurationPanelProps) {
  React.useEffect(() => {
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(income));
  }, [income]);

  const mbIncomeLimit = MB_INCOME_LIMIT_PER_YEAR / 12;
  const mbIncomeExceedsLimit = (income.mbMonthly ?? 0) > mbIncomeLimit;

  return (
    <div className="flex md:flex-col md:border-r not-md:border-b">
      <div className="p-2 flex overflow-x-auto md:flex-col gap-2 md:overflow-y-auto md:max-h-[calc(100vh-93px)]">
        <div className="p-3 border rounded-sm min-w-42">
          <Label className="mb-2 block text-left font-bold">Mokestiniai metai:</Label>
          <Select
            value={income.year.toString()}
            onValueChange={value => setIncome(prev => ({ ...prev, year: Number(value) as 2026 }))}
            options={[{ label: '2026', value: '2026' }]}
            className="w-full"
          />
        </div>
        <div className="p-3 border rounded-sm min-w-60">
          <Label className="mb-2 block text-left font-bold">Mėnesio darbo santykių pajamos (prieš mokesčius):</Label>
          <Input
            type="number"
            value={income.monthly ?? ''}
            onChange={e =>
              setIncome(prev => ({ ...prev, monthly: e.target.value ? Number(e.target.value) : undefined }))
            }
            placeholder="Pajamos iš darbo santykių"
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="pensionAccumulation"
              checked={income.pensionAccumulation}
              onChange={e => setIncome(prev => ({ ...prev, pensionAccumulation: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="pensionAccumulation" className="text-xs font-medium cursor-pointer pl-1">
              Papildomai kaupiu 3% pensijai
            </Label>
          </div>
        </div>
        <div className="p-3 border rounded-sm min-w-72">
          <Label className="mb-2 block text-left font-bold">Mėnesio IV pagal pažymą pajamos (prieš mokesčius):</Label>
          <Input
            type="number"
            value={income.ivMonthly ?? ''}
            onChange={e =>
              setIncome(prev => ({ ...prev, ivMonthly: e.target.value ? Number(e.target.value) : undefined }))
            }
            placeholder="Pajamos iš individualios veiklos"
          />
          <p className="text-xs text-gray-500 mt-1.5 italic text-left not-md:text-xs">
            30% išlaidų atskaitymas įtrauktas automatiškai
          </p>
        </div>
        <div className={cn('p-3 border rounded-sm min-w-48', mbIncomeExceedsLimit ? 'text-red-500' : '')}>
          <Label className="mb-2 block text-left font-bold">Mėnesio MB pajamos (prieš mokesčius):</Label>
          <Input
            type="number"
            value={income.mbMonthly ?? ''}
            onChange={e =>
              setIncome(prev => ({ ...prev, mbMonthly: e.target.value ? Number(e.target.value) : undefined }))
            }
            placeholder="Pajamos iš MB"
          />
          {mbIncomeExceedsLimit ? (
            <p className="text-xs text-red-500 mt-1.5 italic text-left not-md:text-xs">
              *Pajamos iš MB išmokėtos pagal civilinę vadovavimo sutartį negali viršyti {formatCurrency(mbIncomeLimit)}{' '}
              per mėnesį (arba {formatCurrency(MB_INCOME_LIMIT_PER_YEAR)} per metus).
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1.5 italic text-left not-md:text-xs">
              Pajamos iš MB pagal civilinę vadovavimo sutartį.
            </p>
          )}
        </div>
        <div className="p-3 border rounded-sm min-w-48">
          <Label className="mb-2 block text-left font-bold">Mėnesio MB dividendų pajamos (prieš mokesčius):</Label>
          <Input
            type="number"
            value={income.mbDividendsMonthly ?? ''}
            onChange={e =>
              setIncome(prev => ({
                ...prev,
                mbDividendsMonthly: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            placeholder="Pajamos iš MB dividendų"
          />
          <p className="text-xs text-gray-500 mt-1.5 italic text-left not-md:text-xs">
            Pajamos dividendais išmokamos MB sumokėjus pelno mokestį.
          </p>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="mbLessThan12Months"
              checked={income.mbLessThan12Months}
              onChange={e => setIncome(prev => ({ ...prev, mbLessThan12Months: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="mbLessThan12Months" className="text-xs font-medium cursor-pointer pl-1">
              MB iki 12 mėnesių (0% pelno mokestis)
            </Label>
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="mbLessThan300kPerYear"
              checked={income.mbLessThan300kPerYear}
              onChange={e => setIncome(prev => ({ ...prev, mbLessThan300kPerYear: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="mbLessThan300kPerYear" className="text-xs font-medium cursor-pointer pl-1">
              Pajamos iki {formatCurrency(300000)} (6% pelno mokestis)
            </Label>
          </div>
        </div>
        <IncomeOptimizer income={income} setIncome={setIncome} />
      </div>
      <div className="flex flex-col justify-center h-12 border-t px-2 mt-auto not-md:hidden">
        <div className="text-xs text-gray-500">
          *VDU {income.year} m. = {formatCurrency(VDU[income.year])} €
        </div>
        <div className="text-xs text-gray-500">
          *MMA {income.year} m. = {formatCurrency(MMA[income.year])} €
        </div>
      </div>
    </div>
  );
}

interface IncomeConfigurationPanelProps {
  income: Income;
  setIncome: (income: React.SetStateAction<Income>) => void;
}
