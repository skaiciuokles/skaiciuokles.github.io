import React from 'react';
import { TaxSummaryTable } from './tax-summary-table';
import { EmploymentTariffDrawer, IVTariffDrawer, MBTariffDrawer } from './tariff-info';
import { calculateIVGpm, ivYearlyTaxRates, mbYearlyTaxRates, yearlyTaxRates } from './utils';
import { IncomeConfigurationPanel } from './income-configuration';
import { TotalTaxes } from './total-taxes';
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

    return { year: 2026, pensionAccumulation: true, mbLessThan12Months: false, mbLessThan300kPerYear: true, ...parsed };
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

  return (
    <div className="flex flex-col h-full">
      <div className="md:grid md:grid-cols-[325px_auto] md:overflow-hidden md:h-full not-md:overflow-y-auto">
        <IncomeConfigurationPanel income={income} setIncome={setIncome} />

        <div className="md:overflow-y-auto">
          <TotalTaxes className="p-3 border-b" year={income.year} />

          <TaxSummaryTable
            label="Metinė darbo santykių mokesčių suvestinė"
            monthlySalary={income.monthly ?? 0}
            additionalForGPM={
              (income.mbMonthly ?? 0) * mbTaxRates.gpmBase * 12 + (income.ivMonthly ?? 0) * ivTaxRates.gpmBase * 12
            }
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
