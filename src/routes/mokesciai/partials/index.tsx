import React from 'react';
import { TaxSummaryTable } from './tax-summary-table';
import { ExternalLink } from '@/components/ui/external-link';
import { EmploymentTariffDrawer, IVTariffDrawer, MBDividendsTariffDrawer, MBTariffDrawer } from './tariff-info';
import {
  calculateIVGpm,
  calculateMBProfitTaxRate,
  formatPercent,
  ivYearlyTaxRates,
  mbYearlyTaxRates,
  yearlyTaxRates,
} from './utils';
import { IncomeConfigurationPanel } from './income-configuration';
import { MBDividendsSources } from './tariff-info/mb-dividends-tariff-info';
import { IncomeSummary, IndividualIncomeSummary } from './income-summary';
import { calculateAllTaxes } from './utils';
import type { Income } from './utils';

const INCOME_STORAGE_KEY = 'tax-calculator-income';

export function TaxCalculatorPage() {
  const [showDetails, setShowDetails] = React.useState<Record<string, boolean>>({});
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

    return {
      year: parsed.year ?? 2026,
      pensionAccumulation: parsed.pensionAccumulation ?? true,
      mbNoProfitTax: parsed.mbNoProfitTax ?? false,
      mbUseReducedProfitTaxRate: parsed.mbUseReducedProfitTaxRate ?? true,
      ivMonthly: parsed.ivMonthly ?? 0,
      mbMonthly: parsed.mbMonthly ?? 0,
      mbDividendsMonthly: parsed.mbDividendsMonthly ?? 0,
      monthly: parsed.monthly ?? 0,
    };
  });
  const incomeRef = React.useRef<Income>(income);
  React.useEffect(() => {
    incomeRef.current = income;
  }, [income]);

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

  const mbProfitTaxRate = React.useMemo(() => calculateMBProfitTaxRate(income), [income]);
  const { mbDividendsGpmOverride, gpmTooltip } = React.useMemo(() => {
    if (!income.mbDividendsMonthly)
      return {
        mbDividendsGpmOverride: undefined,
        gpmTooltip: null,
      };

    const monthlyBeforeTax = income.mbDividendsMonthly;
    const profitTax = monthlyBeforeTax * mbProfitTaxRate;
    const afterProfitTax = monthlyBeforeTax - profitTax;
    const gpm = afterProfitTax * 0.15;
    const totalTax = profitTax + gpm;
    const percentage = (totalTax / monthlyBeforeTax) * 100;

    return {
      mbDividendsGpmOverride: {
        amount: totalTax,
        percentage,
      },
      gpmTooltip: (
        <div className="max-w-sm">
          Efektyvus GPM tarifas: {formatPercent(percentage)}
          <div className="text-gray-300 text-xs mt-1">
            Pajamos iš dividendų apmokestinamos 15 % GPM tarifu. Prieš tai MB sumoka pelno mokestį (
            {formatPercent(mbProfitTaxRate * 100)}), kuris yra įtrauktas į šį skaičiavimą.
            <MBDividendsSources linkColor="lightBlue" year={income.year} />
          </div>
        </div>
      ),
    };
  }, [income.mbDividendsMonthly, mbProfitTaxRate, income.year]);

  const allTaxes = React.useMemo(() => calculateAllTaxes(income), [income]);

  const toggleDetails = React.useCallback((id: string) => setShowDetails(prev => ({ ...prev, [id]: !prev[id] })), []);

  return (
    <div className="flex flex-col h-full">
      <div className="md:grid md:grid-cols-[340px_auto] md:overflow-hidden md:h-full not-md:overflow-y-auto">
        <IncomeConfigurationPanel income={income} setIncome={setIncome} />

        <div className="md:overflow-y-auto">
          <div className="p-3 border-b bg-stone-50/50">
            <IncomeSummary income={income} />
          </div>

          <div className="p-3 space-y-4">
            <div className="space-y-2">
              <IndividualIncomeSummary
                id="employment"
                label="Darbo santykiai"
                totals={allTaxes.employmentTotals}
                isDetailsOpen={!!showDetails.employment}
                onToggleDetails={toggleDetails}
                InfoDrawer={EmploymentTariffDrawer}
                incomeRef={incomeRef}
                year={income.year}
              />
              <TaxSummaryTable
                label="Metinė darbo santykių mokesčių suvestinė"
                monthlySalary={income.monthly ?? 0}
                additionalForGPM={
                  (income.mbMonthly ?? 0) * mbTaxRates.gpmBase * 12 + (income.ivMonthly ?? 0) * ivTaxRates.gpmBase * 12
                }
                open={showDetails.employment}
                taxRates={taxRates}
                pensionAccumulation={income.pensionAccumulation}
                year={income.year}
                withSodra
              />
            </div>

            <div className="space-y-2">
              <IndividualIncomeSummary
                id="iv"
                label="Individuali veikla"
                totals={allTaxes.ivTotals}
                isDetailsOpen={!!showDetails.iv}
                onToggleDetails={toggleDetails}
                InfoDrawer={IVTariffDrawer}
                incomeRef={incomeRef}
                year={income.year}
              />
              <TaxSummaryTable
                label="Metinė IV pagal pažymą mokesčių suvestinė"
                monthlySalary={income.ivMonthly ?? 0}
                open={showDetails.iv}
                taxRates={ivTaxRates}
                additionalForGPM={!income.monthly ? (income.mbMonthly ?? 0) * mbTaxRates.gpmBase * 12 : 0}
                gpmOverride={ivGpmOverride}
                year={income.year}
                withSodra
              />
            </div>

            <div className="space-y-2">
              <IndividualIncomeSummary
                id="mb"
                label="MB pajamos (civilinė sutartis)"
                totals={allTaxes.mbTotals}
                isDetailsOpen={!!showDetails.mb}
                onToggleDetails={toggleDetails}
                InfoDrawer={MBTariffDrawer}
                incomeRef={incomeRef}
                year={income.year}
              />
              <TaxSummaryTable
                label="Metinė MB mokesčių suvestinė"
                monthlySalary={income.mbMonthly ?? 0}
                open={showDetails.mb}
                taxRates={mbTaxRates}
                year={income.year}
              />
            </div>

            <div className="space-y-2">
              <IndividualIncomeSummary
                id="mbDividends"
                label="MB dividendai"
                totals={allTaxes.mbDividendsTotals}
                isDetailsOpen={!!showDetails.mbDividends}
                onToggleDetails={toggleDetails}
                InfoDrawer={MBDividendsTariffDrawer}
                incomeRef={incomeRef}
                year={income.year}
              />
              <TaxSummaryTable
                label="Metinė MB dividendų mokesčių suvestinė"
                monthlySalary={income.mbDividendsMonthly ?? 0}
                open={showDetails.mbDividends}
                taxRates={mbTaxRates}
                gpmOverride={mbDividendsGpmOverride}
                gpmTooltip={gpmTooltip}
                year={income.year}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 px-3 py-1 min-h-12 leading-none flex items-center justify-center border-t">
            <span>
              Skaičiuoklė paremta{' '}
              <ExternalLink href="https://www.vmi.lt/evmi/5725">VMI pateikta informacija.</ExternalLink> Rezultatai yra
              apytiksliai ir gali skirtis nuo galutinių VMI apskaičiavimų.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
