import React from 'react';
import { ChartNoAxesCombinedIcon } from 'lucide-react';
import { siGithub } from 'simple-icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/forms/select';
import { SimpleIcon } from '@/components/ui/simple-icon';
import { TaxSummaryTable } from './tax-summary-table';
import { TaxTariffLegend } from './tax-tariff-legend';
import { calculateIVGpm, formatCurrency, ivTaxRates, mbTaxRates, taxRates, VDU, type Income } from './utils';

const INCOME_STORAGE_KEY = 'tax-calculator-income';

export function TaxCalculatorPage() {
  const [income, setIncome] = React.useState<Income>(() => {
    const savedIncome = localStorage.getItem(INCOME_STORAGE_KEY);
    let parsed: Partial<Income> = {};
    if (savedIncome) {
      try {
        parsed = JSON.parse(savedIncome);
      } catch (error) {
        console.error('Error parsing income from localStorage', error);
      }
    }

    return { year: 2026, ...parsed };
  });

  React.useEffect(() => {
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(income));
  }, [income]);

  const ivGpmOverride = React.useMemo(() => {
    if (!income.ivMonthly) return undefined;
    // Taxable income = 70% of total income (30% expense deduction)
    const annualTaxableIncome = income.ivMonthly * 12 * ivTaxRates.gpmBase;

    // A tax credit is available for IV income if the annual taxable income is less than 42,500 EUR
    if (annualTaxableIncome <= 42500) {
      const result = calculateIVGpm(annualTaxableIncome);
      return { amount: result.amount / 12, percentage: result.percentage * ivTaxRates.gpmBase };
    }
  }, [income.ivMonthly]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-3 py-2 border-b">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <ChartNoAxesCombinedIcon className="size-6" />
          Mokesčių Skaičiuoklė
        </h1>
        <a
          href="https://github.com/skaiciuokles/skaiciuokles.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <SimpleIcon icon={siGithub} className="size-6" />
        </a>
      </header>

      <div className="grid grid-cols-[325px_auto] overflow-hidden h-full">
        <div className="flex flex-col gap-4 p-3 border-r overflow-y-auto">
          <div className="p-3 border rounded-sm">
            <Label className="mb-2 block text-left font-bold">Mokestiniai metai:</Label>
            <Select
              value={income.year.toString()}
              onValueChange={value => setIncome(prev => ({ ...prev, year: Number(value) as 2026 }))}
              options={[{ label: '2026', value: '2026' }]}
              className="w-full"
            />
          </div>
          <div className="p-3 border rounded-sm">
            <Label className="mb-2 block text-left font-bold">Mėnesio darbo santykių pajamos (prieš mokesčius):</Label>
            <Input
              type="number"
              value={income.monthly}
              onChange={e =>
                setIncome(prev => ({ ...prev, monthly: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="Pajamos iš darbo santykių"
            />
          </div>
          <div className="p-3 border rounded-sm">
            <Label className="mb-2 block text-left font-bold">Mėnesio IV pagal pažymą pajamos (prieš mokesčius):</Label>
            <Input
              type="number"
              value={income.ivMonthly}
              onChange={e =>
                setIncome(prev => ({ ...prev, ivMonthly: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="Pajamos iš individualios veiklos"
            />
            <p className="text-xs text-gray-500 mt-1.5 italic text-left">
              30% išlaidų atskaitymas įtrauktas automatiškai
            </p>
          </div>
          <div className="p-3 border rounded-sm">
            <Label className="mb-2 block text-left font-bold">Mėnesio MB pajamos (prieš mokesčius):</Label>
            <Input
              type="number"
              value={income.mbMonthly}
              onChange={e =>
                setIncome(prev => ({ ...prev, mbMonthly: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="Pajamos iš MB"
            />
          </div>
          <div className="border-t pt-3 space-y-3 -mx-3 px-3 mt-auto">
            <TaxTariffLegend year={income.year} />
            <div className="text-xs text-gray-500">
              *VDU {income.year} m. = {formatCurrency(VDU)} €
            </div>
          </div>
        </div>

        <div className="overflow-y-auto">
          <TaxSummaryTable
            label="Metinė darbo santykių mokesčių suvestinė"
            monthlySalary={income.monthly ?? 0}
            additionalForGPM={
              (income.mbMonthly ?? 0) * mbTaxRates.gpmBase * 12 + (income.ivMonthly ?? 0) * ivTaxRates.gpmBase * 12
            }
            additionalForSodra={(income.ivMonthly ?? 0) * ivTaxRates.sodraBase * 12}
            className="border-b p-3"
            taxRates={taxRates}
            withSodra
          />

          <TaxSummaryTable
            label="Metinė IV pagal pažymą mokesčių suvestinė"
            monthlySalary={income.ivMonthly ?? 0}
            className="p-3 border-b"
            taxRates={ivTaxRates}
            gpmOverride={ivGpmOverride}
            withSodra
          />

          <TaxSummaryTable
            label="Metinė MB mokesčių suvestinė"
            monthlySalary={income.mbMonthly ?? 0}
            className="p-3 border-b"
            taxRates={mbTaxRates}
          />

          <div className="text-sm text-gray-600 p-3">
            Skaičiuoklė paremta{' '}
            <a
              href="https://www.vmi.lt/evmi/5725"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline hover:text-blue-900"
            >
              VMI pateikta informacija.
            </a>{' '}
            Rezultatai yra apytiksliai ir gali skirtis nuo galutinių VMI apskaičiavimų, todėl už jų tikslumą neatsakome.
          </div>
        </div>
      </div>
    </div>
  );
}
