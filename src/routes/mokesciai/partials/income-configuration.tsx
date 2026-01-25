import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/forms/input';
import { Checkbox } from '@/components/forms/checkbox';
import { Select, type SelectOption } from '@/components/forms/select';
import { IncomeOptimizer } from './income-optimizer';
import { formatCurrency, formatPercent, MB_INCOME_LIMIT_PER_YEAR, MMA, PROFIT_TAX_RATES, VDU } from './utils';
import type { Income, Year } from './utils';

const yearOptions: SelectOption<Year>[] = [
  // { label: '2025', value: 2025 },
  { label: '2026', value: 2026 },
];

export function IncomeConfigurationPanel({ income, setIncome }: IncomeConfigurationPanelProps) {
  const mbIncomeLimit = MB_INCOME_LIMIT_PER_YEAR / 12;
  const mbIncomeExceedsLimit = (income.mbMonthly ?? 0) > mbIncomeLimit;
  const profitTaxRates = PROFIT_TAX_RATES[income.year];
  const handleYearChange = useCallback((year: Year) => setIncome(prev => ({ ...prev, year })), [setIncome]);
  const handleIncomeChange = useCallback(
    (value: number | undefined, e: React.ChangeEvent<HTMLInputElement>) =>
      setIncome(prev => ({ ...prev, [e.target.name]: value })),
    [setIncome],
  );
  const handleCheckboxChange = useCallback(
    (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) =>
      setIncome(prev => ({ ...prev, [e.target.name]: checked })),
    [setIncome],
  );

  return (
    <div className="flex md:flex-col md:border-r not-md:border-b">
      <div className="p-2 flex overflow-x-auto md:flex-col gap-2 md:overflow-y-auto md:max-h-[calc(100vh-93px)]">
        <div className="p-3 border rounded-sm not-md:min-w-42">
          <Select
            value={income.year}
            label="Mokestiniai metai:"
            onChange={handleYearChange}
            options={yearOptions}
            className="w-full"
          />
        </div>
        <div className="p-3 border rounded-sm not-md:min-w-60 space-y-2">
          <Input
            label="Mėnesio darbo santykių pajamos (prieš mokesčius):"
            type="number"
            value={income.monthly}
            onChange={handleIncomeChange}
            placeholder="Pajamos iš darbo santykių"
            name="monthly"
          />
          <Checkbox
            label="Papildomai kaupiu 3% pensijai"
            name="pensionAccumulation"
            checked={income.pensionAccumulation}
            onChange={handleCheckboxChange}
            className="text-xs"
          />
        </div>
        <div className="p-3 border rounded-sm not-md:min-w-72">
          <Input
            label="Mėnesio IV pagal pažymą pajamos (prieš mokesčius):"
            type="number"
            value={income.ivMonthly}
            onChange={handleIncomeChange}
            placeholder="Pajamos iš individualios veiklos"
            name="ivMonthly"
          />
          <p className="text-xs text-gray-500 mt-1.5 italic text-left not-md:text-xs">
            30% išlaidų atskaitymas įtrauktas automatiškai
          </p>
        </div>
        <div className={cn('p-3 border rounded-sm not-md:min-w-48', mbIncomeExceedsLimit ? 'text-red-500' : '')}>
          <Input
            label="Mėnesio MB pajamos (prieš mokesčius):"
            type="number"
            value={income.mbMonthly}
            onChange={handleIncomeChange}
            placeholder="Pajamos iš MB"
            name="mbMonthly"
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
        <div className="p-3 border rounded-sm not-md:min-w-80 space-y-2">
          <Input
            label="Mėnesio MB pelno suma dividendams (prieš pelno mokestį):"
            type="number"
            value={income.mbDividendsMonthly}
            onChange={handleIncomeChange}
            placeholder="Pajamos iš MB dividendų"
            name="mbDividendsMonthly"
          />
          <p className="text-xs text-gray-500 italic text-left not-md:text-xs">
            Pajamos dividendais išmokamos MB sumokėjus pelno mokestį.
          </p>
          <Checkbox
            label={`MB iki ${profitTaxRates.gracePeriod} mėnesių (0% pelno mokestis)`}
            name="mbNoProfitTax"
            checked={income.mbNoProfitTax}
            onChange={handleCheckboxChange}
            className="text-xs"
          />
          <Checkbox
            label={`Pajamos iki ${formatCurrency(profitTaxRates.limitPerYear)} (${formatPercent(profitTaxRates.reducedRate * 100)} pelno mokestis)`}
            name="mbUseReducedProfitTaxRate"
            checked={income.mbUseReducedProfitTaxRate}
            onChange={handleCheckboxChange}
            className="text-xs"
          />
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
