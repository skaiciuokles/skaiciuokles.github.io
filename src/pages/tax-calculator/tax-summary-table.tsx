import React from 'react';
import { calculateProgressiveTax, formatCurrency, formatPercent, months, taxRates } from './utils';
import type { IncomeTotals, MonthlyIncomeCalculations } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

export function TaxSummaryTable({ label, monthlySalary, additionalIncome, withSodra }: TaxSummaryTableProps) {
  const { calculations, totals, averages } = React.useMemo(() => {
    const results: MonthlyIncomeCalculations[] = [];
    const totals: IncomeTotals = { gpm: 0, vsd: 0, psd: 0, salaryBeforeTaxes: 0, salaryAfterTaxes: 0 };
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

      results.push({
        totalAnnualBeforeTaxes: totalAnnual,
        totalMonthlyAfterTaxes: afterTaxes,
        taxes: {
          gpm: gpmTax,
          vsd: vsdTax,
          psd: psdTax,
        },
      });
    }

    totals.salaryBeforeTaxes = totalAnnual;

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
    'Atlyginimas į rankas',
    'Metinės bruto pajamos',
    'GPM, %',
    'GPM, EUR',
    ...(withSodra ? ['VSD, %', 'VSD, EUR', 'PSD, %', 'PSD, EUR'] : []),
  ];

  return (
    <TaxSummaryTableWrapper
      label={label}
      tableHeader={headers.map((header, index) => (
        <TaxSummaryTableHeaderColumn key={index}>{header}</TaxSummaryTableHeaderColumn>
      ))}
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
      </TaxSummaryTableBodyRow>
    </TaxSummaryTableWrapper>
  );
}

type TaxSummaryTableProps = {
  label: React.ReactNode;
  monthlySalary: number;
  additionalIncome?: number;
  withSodra?: boolean;
};
