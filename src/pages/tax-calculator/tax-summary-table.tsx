import React from 'react';
import { calculateProgressiveTax, formatCurrency, formatPercent, months, taxRates } from './utils';
import type { IncomeTotals, MonthlyIncomeCalculations } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

export function TaxSummaryTable({ label, monthlySalary, additionalIncome, withSodra, ...rest }: TaxSummaryTableProps) {
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

    for (let month = 1; month <= 12; month++) {
      totalAnnual = totalAnnual + monthlySalary;
      const totalAnnualForGPM = totalAnnual + (additionalIncome ?? 0);

      const gpmTax = calculateProgressiveTax(
        totalAnnualForGPM,
        monthlySalary,
        withSodra ? taxRates.gpm : taxRates.mbGpm,
      );
      const vsdTax = withSodra
        ? calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.vsd)
        : { amount: 0, percentage: 0 };
      const psdTax = withSodra
        ? calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.psd)
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
        gpmPercent: totalAnnual > 0 ? (totals.gpm * 100) / totalAnnual : 0,
        vsdPercent: totalAnnual > 0 ? (totals.vsd * 100) / totalAnnual : 0,
        psdPercent: totalAnnual > 0 ? (totals.psd * 100) / totalAnnual : 0,
        taxPercent: totalAnnual > 0 ? ((totals.gpm + totals.vsd + totals.psd) * 100) / totalAnnual : 0,
      },
    };
  }, [monthlySalary, additionalIncome, withSodra]);

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
          <TaxSummaryTableBodyColumn>{formatCurrency(calc.totalAnnualBeforeTaxes)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{formatPercent(calc.taxes.gpm.percentage)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.gpm.amount)}</TaxSummaryTableBodyColumn>
          {withSodra && (
            <>
              <TaxSummaryTableBodyColumn>{formatPercent(calc.taxes.vsd.percentage)}</TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.vsd.amount)}</TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>{formatPercent(calc.taxes.psd.percentage)}</TaxSummaryTableBodyColumn>
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
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryBeforeTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatPercent(averages.gpmPercent)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.gpm)}</TaxSummaryTableBodyColumn>
        {withSodra && (
          <>
            <TaxSummaryTableBodyColumn>{formatPercent(averages.vsdPercent)}</TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatCurrency(totals.vsd)}</TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatPercent(averages.psdPercent)}</TaxSummaryTableBodyColumn>
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
  additionalIncome?: number;
  withSodra?: boolean;
}
