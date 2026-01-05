import React from 'react';

import { calculateProgressiveTax, formatCurrency, formatPercent, months, taxRates, VDU } from './utils';
import type { IncomeTotals, MonthlyIncomeCalculations } from './utils';

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
      <tr className="bg-stone-50">
        <td className="border border-stone-300 px-3 py-2 font-medium bg-stone-100">{label}</td>
        {calculations.map((calc, index) => (
          <td key={index} className="border border-stone-300 px-3 py-2 text-center">
            {render(calc)}
          </td>
        ))}
        <td className="border border-stone-300 px-3 py-2 text-center font-bold">{total}</td>
      </tr>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <h2 className="text-lg font-bold mb-2 text-left">{label}</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-stone-200">
              {[null, ...months, 'Viso'].map((month, index) => (
                <th key={index} className="border border-stone-300 px-3 py-2 text-center">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
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
            <tr className="bg-stone-200">
              <td className="border border-stone-300 px-3 py-2 font-bold" colSpan={14}>
                Mokesčiai {formatCurrency(totals.gpm + totals.vsd + totals.psd)} ({formatPercent(averages.taxPercent)})
              </td>
            </tr>
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
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-center">Metiniai mokesčių tarifai</h2>
        <div className="max-w-3xl mx-auto">
          <table className="w-full border-collapse text-sm [&_th,td]:border [&_th,td]:border-stone-300 [&_th,td]:px-4 [&_th,td]:py-2">
            <thead>
              <tr className="bg-stone-200">
                <th>Metiniai rėžiai</th>
                <th>Metinės pajamos</th>
                <th>GPM tarifas</th>
                <th>VSD tarifas</th>
                <th>PSD tarifas</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:bg-stone-50">
              <tr>
                <td>iki 12 VDU (tik pajamoms iš MB)</td>
                <td>0 - {formatCurrency(VDU * 12)}</td>
                <td>15%</td>
                <td>0%</td>
                <td>0%</td>
              </tr>
              <tr>
                <td>iki 36 VDU</td>
                <td>0 - {formatCurrency(VDU * 36)}</td>
                <td>{(taxRates.gpm[0].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>nuo 36 iki 60 VDU</td>
                <td>
                  {formatCurrency(VDU * 36)} - {formatCurrency(VDU * 60)}
                </td>
                <td>{(taxRates.gpm[1].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>nuo 60 VDU</td>
                <td>virš {formatCurrency(VDU * 60)}</td>
                <td>{(taxRates.gpm[2].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[1].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-sm text-gray-600">
            <p>*Numatytas VDU 2026 metams yra {formatCurrency(VDU)} EUR</p>
          </div>
        </div>
      </div>
    </>
  );
}

type TaxSummaryTableProps = {
  label: React.ReactNode;
  monthlySalary: number;
  additionalIncome?: number;
  withSodra?: boolean;
};
