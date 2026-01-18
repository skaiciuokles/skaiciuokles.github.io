import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/forms/select';
import { TaxSummaryTable } from './tax-summary-table';
import { EmploymentTariffDrawer, IVTariffDrawer, MBTariffDrawer } from './tariff-info';
import { TotalTaxes } from './total-taxes';
import { IncomeOptimizer } from './income-optimizer';
import { calculateIVGpm, formatCurrency, ivYearlyTaxRates, mbYearlyTaxRates, MMA, yearlyTaxRates, VDU } from './utils';
import type { Income } from './utils';

const INCOME_STORAGE_KEY = 'tax-calculator-income';

export function TaxCalculatorPage() {
  const [income, setIncome] = React.useState<Income>(() => {
    const savedIncome = localStorage.getItem(INCOME_STORAGE_KEY);
    let parsed: Partial<Income> = {};
    if (savedIncome) {
      try {
        parsed = JSON.parse(savedIncome) as Partial<Income>;
      } catch (error) {
        console.error('Error parsing income from localStorage', error);
      }
    }

    return { year: 2026, pensionAccumulation: true, ...parsed };
  });

  React.useEffect(() => {
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(income));
  }, [income]);

  const taxRates = yearlyTaxRates[income.year];
  const mbTaxRates = mbYearlyTaxRates[income.year];
  const ivTaxRates = ivYearlyTaxRates[income.year];

  const ivGpmOverride = React.useMemo(() => {
    if (!income.ivMonthly) return undefined;
    // Taxable income = 70% of total income (30% expense deduction)
    const annualTaxableIncome = income.ivMonthly * 12 * ivTaxRates.gpmBase;

    // A tax credit is available for IV income if the annual taxable income is less than 42,500 EUR
    if (annualTaxableIncome <= 42500) {
      const result = calculateIVGpm(annualTaxableIncome);
      return { amount: result.amount / 12, percentage: result.percentage };
    }
  }, [income.ivMonthly, ivTaxRates]);

  const mbIncomeLimitPerYear = 100000;
  const mbIncomeLimit = mbIncomeLimitPerYear / 12;
  const mbIncomeExceedsLimit = (income.mbMonthly ?? 0) > mbIncomeLimit;

  return (
    <div className="flex flex-col h-full">
      <div className="md:grid md:grid-cols-[325px_auto] md:overflow-hidden md:h-full not-md:overflow-y-auto">
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
              <Label className="mb-2 block text-left font-bold">
                Mėnesio darbo santykių pajamos (prieš mokesčius):
              </Label>
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
              <Label className="mb-2 block text-left font-bold">
                Mėnesio IV pagal pažymą pajamos (prieš mokesčius):
              </Label>
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
              {mbIncomeExceedsLimit && (
                <p className="text-xs text-red-500 mt-1.5 italic text-left not-md:text-xs">
                  *Pajamos iš MB išmokėtos pagal civilinę vadovavimo sutartį negali viršyti{' '}
                  {formatCurrency(mbIncomeLimit)} per mėnesį (arba {formatCurrency(mbIncomeLimitPerYear)} per metus).
                </p>
              )}
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

        <div className="md:overflow-y-auto">
          <TotalTaxes className="p-3 border-b" year={income.year} />

          <TaxSummaryTable
            label="Metinė darbo santykių mokesčių suvestinė"
            monthlySalary={income.monthly ?? 0}
            additionalForGPM={
              (income.mbMonthly ?? 0) * mbTaxRates.gpmBase * 12 + (income.ivMonthly ?? 0) * ivTaxRates.gpmBase * 12
            }
            additionalForSodra={(income.ivMonthly ?? 0) * ivTaxRates.sodraBase * 12}
            className="border-b p-3"
            taxRates={taxRates}
            pensionAccumulation={income.pensionAccumulation}
            InfoDrawer={EmploymentTariffDrawer}
            year={income.year}
            withSodra
          />

          <TaxSummaryTable
            label="Metinė IV pagal pažymą mokesčių suvestinė"
            monthlySalary={income.ivMonthly ?? 0}
            className="p-3 border-b"
            taxRates={ivTaxRates}
            additionalForGPM={!income.monthly ? (income.mbMonthly ?? 0) * mbTaxRates.gpmBase * 12 : 0}
            gpmOverride={ivGpmOverride}
            InfoDrawer={IVTariffDrawer}
            year={income.year}
            withSodra
          />

          <TaxSummaryTable
            label="Metinė MB mokesčių suvestinė"
            monthlySalary={income.mbMonthly ?? 0}
            className="p-3"
            taxRates={mbTaxRates}
            InfoDrawer={MBTariffDrawer}
            year={income.year}
          />

          <div className="text-sm text-gray-600 px-3 py-1 min-h-12 leading-none flex items-center justify-center border-t">
            <span>
              Skaičiuoklė paremta{' '}
              <a
                href="https://www.vmi.lt/evmi/5725"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                VMI pateikta informacija.
              </a>{' '}
              Rezultatai yra apytiksliai ir gali skirtis nuo galutinių VMI apskaičiavimų.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
