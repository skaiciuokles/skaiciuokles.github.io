import React from 'react';
import { calculateProgressiveTax, formatCurrency, formatPercent, months, TAX_CALCULATION_EVENT } from './utils';
import type { IncomeTotals, MonthlyIncomeCalculations, TaxCalculationEventDetail, TaxRates } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

export function TaxSummaryTable({
  label,
  monthlySalary,
  additionalForGPM,
  additionalForSodra,
  gpmOverride,
  withSodra,
  taxRates,
  ...rest
}: TaxSummaryTableProps) {
  const id = React.useId();
  const { calculations, totals, averages } = React.useMemo(() => {
    const results: MonthlyIncomeCalculations[] = [];
    const totals: IncomeTotals = {
      gpm: 0,
      vsd: 0,
      psd: 0,
      totalTaxes: 0,
      totalTaxesPercentage: 0,
      salaryBeforeTaxes: 0,
      salaryAfterTaxes: 0,
    };
    let totalAnnual = 0;
    let totalAnnualTaxable = 0;
    let totalSodraTaxable = 0;

    for (let month = 1; month <= 12; month++) {
      const monthlyTaxableIncome = monthlySalary * taxRates.gpmBase;
      totalAnnual = totalAnnual + monthlySalary;
      totalAnnualTaxable = totalAnnualTaxable + monthlyTaxableIncome;

      const totalAnnualForGPM = totalAnnualTaxable + (additionalForGPM ?? 0);
      const gpmTax = gpmOverride ?? calculateProgressiveTax(totalAnnualForGPM, monthlyTaxableIncome, taxRates.gpm);

      const sodraTaxableIncome = monthlySalary * taxRates.sodraBase;
      totalSodraTaxable = totalSodraTaxable + sodraTaxableIncome;

      const totalAnnualForSodra = totalSodraTaxable + (additionalForSodra ?? 0);
      const vsdTax = withSodra
        ? calculateProgressiveTax(totalAnnualForSodra, sodraTaxableIncome, taxRates.vsd)
        : { amount: 0, percentage: 0 };
      const psdTax = withSodra
        ? calculateProgressiveTax(totalAnnualForSodra, sodraTaxableIncome, taxRates.psd)
        : { amount: 0, percentage: 0 };

      const totalMonthlyTaxes = gpmTax.amount + vsdTax.amount + psdTax.amount;
      const afterTaxes = monthlySalary - totalMonthlyTaxes;

      totals.gpm += gpmTax.amount;
      totals.vsd += vsdTax.amount;
      totals.psd += psdTax.amount;
      totals.salaryAfterTaxes += afterTaxes;
      totals.totalTaxes += totalMonthlyTaxes;

      results.push({
        totalAnnualBeforeTaxes: totalAnnual,
        totalMonthlyAfterTaxes: afterTaxes,
        taxes: {
          gpm: gpmTax,
          vsd: vsdTax,
          psd: psdTax,
          total: {
            amount: totalMonthlyTaxes,
            percentage: monthlySalary ? (totalMonthlyTaxes / monthlySalary) * 100 : 0,
          },
        },
      });
    }

    totals.salaryBeforeTaxes = totalAnnual;
    totals.totalTaxesPercentage = totalAnnual > 0 ? (totals.totalTaxes * 100) / totalAnnual : 0;

    return {
      calculations: results,
      totals,
      averages: {
        gpmPercent: totalAnnualTaxable > 0 ? (totals.gpm * 100) / totalAnnualTaxable : 0,
        vsdPercent: totalSodraTaxable > 0 ? (totals.vsd * 100) / totalSodraTaxable : 0,
        psdPercent: totalSodraTaxable > 0 ? (totals.psd * 100) / totalSodraTaxable : 0,
        taxPercent: totalAnnualTaxable > 0 ? ((totals.gpm + totals.vsd + totals.psd) * 100) / totalAnnualTaxable : 0,
      },
    };
  }, [monthlySalary, additionalForGPM, additionalForSodra, withSodra, taxRates, gpmOverride]);

  // Emit custom event when calculations complete
  React.useEffect(() => {
    const event = new CustomEvent<TaxCalculationEventDetail>(TAX_CALCULATION_EVENT, { detail: { id, totals } });
    document.dispatchEvent(event);
  }, [id, totals]);

  const headers = [
    'Mėnuo',
    'Pajamos į rankas',
    'Metinės pajamos',
    'GPM, %',
    'GPM, EUR',
    ...(withSodra ? ['VSD, %', 'VSD, EUR', 'PSD, %', 'PSD, EUR'] : []),
    'Viso mokesčių, EUR (%)',
  ];

  return (
    <TaxSummaryTableWrapper
      label={label}
      tableHeader={headers.map((header, index) => (
        <TaxSummaryTableHeaderColumn key={index}>{header}</TaxSummaryTableHeaderColumn>
      ))}
      {...rest}
    >
      {calculations.map((calc, index) => (
        <TaxSummaryTableBodyRow key={index}>
          <TaxSummaryTableBodyColumn className="font-medium bg-stone-100">{months[index]}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{formatCurrency(calc.totalMonthlyAfterTaxes)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>
            {formatCurrency(calc.totalAnnualBeforeTaxes)}
            {taxRates.gpmBase < 1 && <small> ({formatCurrency(calc.totalAnnualBeforeTaxes * taxRates.gpmBase)})</small>}
          </TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>
            {formatPercent(calc.taxes.gpm.percentage * taxRates.gpmBase)}
            {taxRates.gpmBase < 1 && <small> ({formatPercent(calc.taxes.gpm.percentage)})</small>}
          </TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.gpm.amount)}</TaxSummaryTableBodyColumn>
          {withSodra && (
            <>
              <TaxSummaryTableBodyColumn>
                {formatPercent(calc.taxes.vsd.percentage * taxRates.sodraBase)}
                {taxRates.sodraBase < 1 && <small> ({formatPercent(calc.taxes.vsd.percentage)})</small>}
              </TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.vsd.amount)}</TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>
                {formatPercent(calc.taxes.psd.percentage * taxRates.sodraBase)}
                {taxRates.sodraBase < 1 && <small> ({formatPercent(calc.taxes.psd.percentage)})</small>}
              </TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.psd.amount)}</TaxSummaryTableBodyColumn>
            </>
          )}
          <TaxSummaryTableBodyColumn>
            <div className="text-nowrap">
              {formatCurrency(calc.taxes.total.amount)} ({formatPercent(calc.taxes.total.percentage)})
            </div>
          </TaxSummaryTableBodyColumn>
        </TaxSummaryTableBodyRow>
      ))}
      {/* Totals row */}
      <TaxSummaryTableBodyRow className="bg-stone-200 font-bold">
        <TaxSummaryTableBodyColumn>Viso</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryAfterTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.salaryBeforeTaxes)}
          {taxRates.gpmBase < 1 && <small> ({formatCurrency(totals.salaryBeforeTaxes * taxRates.gpmBase)})</small>}
        </TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          {formatPercent(averages.gpmPercent * taxRates.gpmBase)}
          {taxRates.gpmBase < 1 && <small> ({formatPercent(averages.gpmPercent)})</small>}
        </TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.gpm)}</TaxSummaryTableBodyColumn>
        {withSodra && (
          <>
            <TaxSummaryTableBodyColumn>
              {formatPercent(averages.vsdPercent * taxRates.sodraBase)}
              {taxRates.sodraBase < 1 && <small> ({formatPercent(averages.vsdPercent)})</small>}
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatCurrency(totals.vsd)}</TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>
              {formatPercent(averages.psdPercent * taxRates.sodraBase)}
              {taxRates.sodraBase < 1 && <small> ({formatPercent(averages.psdPercent)})</small>}
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatCurrency(totals.psd)}</TaxSummaryTableBodyColumn>
          </>
        )}
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.totalTaxes)} ({formatPercent(totals.totalTaxesPercentage)})
        </TaxSummaryTableBodyColumn>
      </TaxSummaryTableBodyRow>
    </TaxSummaryTableWrapper>
  );
}

interface TaxSummaryTableProps extends React.ComponentProps<'div'> {
  label: React.ReactNode;
  monthlySalary: number;
  taxRates: TaxRates;
  additionalForGPM?: number;
  additionalForSodra?: number;
  gpmOverride?: { amount: number; percentage: number };
  withSodra?: boolean;
}
