import React from 'react';
import { Tooltip } from '@/components/layouts/tooltip';
import { calculateProgressiveTax, formatCurrency, formatPercent, months, TAX_CALCULATION_EVENT } from './utils';
import type { IncomeTotalTaxes, MonthlyIncomeCalculations, TaxCalculationEventDetail, TaxRates } from './utils';
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
  const { calculations, totals } = React.useMemo(() => {
    const results: MonthlyIncomeCalculations[] = [];
    const totals: IncomeTotalTaxes = {
      gpm: { amount: 0, percentage: 0 },
      vsd: { amount: 0, percentage: 0 },
      psd: { amount: 0, percentage: 0 },
      total: { amount: 0, percentage: 0 },
      salaryBeforeTaxes: 0,
      salaryAfterTaxes: 0,
    };
    let totalAnnual = 0;
    let totalAnnualTaxable = 0;
    let totalSodraTaxable = 0;

    for (let month = 1; month <= 12; month++) {
      const npd = taxRates.getNpd(monthlySalary);
      const monthlyTaxableIncome = Math.max(0, monthlySalary * taxRates.gpmBase - npd);
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

      totals.gpm.amount += gpmTax.amount;
      totals.vsd.amount += vsdTax.amount;
      totals.psd.amount += psdTax.amount;
      totals.salaryAfterTaxes += afterTaxes;
      totals.total.amount += totalMonthlyTaxes;

      results.push({
        totalAnnualBeforeTaxes: totalAnnual,
        totalMonthlyAfterTaxes: afterTaxes,
        npd,
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
    totals.total.percentage = totalAnnual > 0 ? (totals.total.amount * 100) / totalAnnual : 0;
    totals.gpm.percentage = totalAnnualTaxable > 0 ? (totals.gpm.amount * 100) / totalAnnualTaxable : 0;
    totals.vsd.percentage = totalSodraTaxable > 0 ? (totals.vsd.amount * 100) / totalSodraTaxable : 0;
    totals.psd.percentage = totalSodraTaxable > 0 ? (totals.psd.amount * 100) / totalSodraTaxable : 0;

    return { calculations: results, totals };
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
          <TaxSummaryTableBodyColumn>
            <div className="flex items-center justify-center gap-1">
              {formatCurrency(calc.totalMonthlyAfterTaxes)}
              {calc.npd > 0 && (
                <Tooltip
                  label={
                    <div className="max-w-sm">
                      Pritaikytas NPD: <strong>{formatCurrency(calc.npd)}</strong>
                      <div className="text-muted-foreground text-xs">
                        Neapmokestinamas pajamų dydis mažina mokestinių pajamų bazę. Skaičiavimai paremti{' '}
                        <a
                          href="https://www.vmi.lt/evmi/documents/20142/391008/NPD+dyd%C5%BEiai.pdf/8ddb3f8e-4628-1e17-9711-40d377742105?t=1734335445883"
                          className="text-blue-500 underline hover:text-blue-600"
                          target="_blank"
                        >
                          VMI pateikta informacija.
                        </a>
                      </div>
                    </div>
                  }
                  iconClassName="inline ml-1 size-3 text-muted-foreground"
                />
              )}
            </div>
          </TaxSummaryTableBodyColumn>
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
          {formatPercent(totals.gpm.percentage * taxRates.gpmBase)}
          {taxRates.gpmBase < 1 && <small> ({formatPercent(totals.gpm.percentage)})</small>}
        </TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.gpm.amount)}</TaxSummaryTableBodyColumn>
        {withSodra && (
          <>
            <TaxSummaryTableBodyColumn>
              {formatPercent(totals.vsd.percentage * taxRates.sodraBase)}
              {taxRates.sodraBase < 1 && <small> ({formatPercent(totals.vsd.percentage)})</small>}
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatCurrency(totals.vsd.amount)}</TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>
              {formatPercent(totals.psd.percentage * taxRates.sodraBase)}
              {taxRates.sodraBase < 1 && <small> ({formatPercent(totals.psd.percentage)})</small>}
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatCurrency(totals.psd.amount)}</TaxSummaryTableBodyColumn>
          </>
        )}
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.total.amount)} ({formatPercent(totals.total.percentage)})
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
