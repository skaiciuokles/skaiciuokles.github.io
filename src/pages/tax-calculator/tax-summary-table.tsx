import React from 'react';
import { calculateProgressiveTax, formatCurrency, formatPercent, months, taxRates } from './utils';
import type { IncomeTotals, MonthlyIncomeCalculations } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableHeaderRow,
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

  function renderLine(
    label: string,
    render: (calculation: MonthlyIncomeCalculations) => React.ReactNode,
    total: React.ReactNode,
  ) {
    return (
      <TaxSummaryTableBodyRow>
        <TaxSummaryTableBodyColumn className="font-medium bg-stone-100">{label}</TaxSummaryTableBodyColumn>
        {calculations.map((calc, index) => (
          <TaxSummaryTableBodyColumn key={index}>{render(calc)}</TaxSummaryTableBodyColumn>
        ))}
        <TaxSummaryTableBodyColumn className="font-bold">{total}</TaxSummaryTableBodyColumn>
      </TaxSummaryTableBodyRow>
    );
  }

  return (
    <TaxSummaryTableWrapper
      label={label}
      tableHeader={[null, ...months, 'Viso'].map((month, index) => (
        <TaxSummaryTableHeaderColumn key={index}>{month}</TaxSummaryTableHeaderColumn>
      ))}
    >
      {renderLine(
        'Atlyginimas į rankas',
        it => formatCurrency(it.totalMonthlyAfterTaxes),
        formatCurrency(totals.salaryAfterTaxes),
      )}
      {renderLine(
        'Metinės bruto pajamos',
        it => formatCurrency(it.totalAnnualBeforeTaxes),
        formatCurrency(totals.salaryBeforeTaxes),
      )}
      {/* Mokesčiai header */}
      <TaxSummaryTableHeaderRow>
        <TaxSummaryTableHeaderColumn colSpan={14}>
          Mokesčiai {formatCurrency(totals.gpm + totals.vsd + totals.psd)} ({formatPercent(averages.taxPercent)})
        </TaxSummaryTableHeaderColumn>
      </TaxSummaryTableHeaderRow>
      {renderLine('GPM, %', it => formatPercent(it.taxes.gpm.percentage), formatPercent(averages.gpmPercent))}
      {renderLine('GPM, EUR', it => formatCurrency(it.taxes.gpm.amount), `${formatCurrency(totals.gpm)}`)}
      {withSodra && (
        <>
          {renderLine('VSD, %', it => formatPercent(it.taxes.vsd.percentage), formatPercent(averages.vsdPercent))}
          {renderLine('VSD, EUR', it => formatCurrency(it.taxes.vsd.amount), `${formatCurrency(totals.vsd)}`)}
          {renderLine('PSD, %', it => formatPercent(it.taxes.psd.percentage), formatPercent(averages.psdPercent))}
          {renderLine('PSD, EUR', it => formatCurrency(it.taxes.psd.amount), `${formatCurrency(totals.psd)}`)}
        </>
      )}
    </TaxSummaryTableWrapper>
  );
}

type TaxSummaryTableProps = {
  label: React.ReactNode;
  monthlySalary: number;
  additionalIncome?: number;
  withSodra?: boolean;
};
