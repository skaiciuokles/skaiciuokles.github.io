import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import React from 'react';

const vdu = 2312.15; // Vidutinis darbo užmokestis Lietuvoje 2026 m.
const taxRates = {
  // Gyventojų pajamų mokestis
  gpm: [
    { threshold: 0, rate: 0.2 },
    { threshold: vdu * 36, rate: 0.25 },
    { threshold: vdu * 60, rate: 0.32 },
  ],
  // Valstybinio socialinio draudimo įmokos
  vsd: [
    { threshold: 0, rate: 0.1252 },
    { threshold: vdu * 60, rate: 0 },
  ],
  // Privalomojo sveikatos draudimo įmokos
  psd: [{ threshold: 0, rate: 0.0698 }],
} as const;

interface Tax {
  amount: number;
  percentage: number;
}

interface MonthlyIncomeCalculations {
  totalAnnualBeforeTaxes: number;
  totalMonthlyAfterTaxes: number;
  taxes: {
    gpm: Tax;
    vsd: Tax;
    psd: Tax;
  };
}

interface Income {
  monthly?: number;
  additionalAnnual?: number;
}

const months = [
  'Sausis',
  'Vasaris',
  'Kovas',
  'Balandis',
  'Gegužė',
  'Birželis',
  'Liepa',
  'Rugpjūtis',
  'Rugsėjis',
  'Spalis',
  'Lapkritis',
  'Gruodis',
];

// Helper function to calculate progressive tax for a monthly salary
function calculateProgressiveTax(
  totalAnnual: number,
  monthlySalary: number,
  brackets: (typeof taxRates)[keyof typeof taxRates],
) {
  // Sort brackets from highest to lowest threshold
  const sortedBrackets = brackets.toSorted((a, b) => b.threshold - a.threshold);
  const bracketIndex = sortedBrackets.findIndex(b => totalAnnual >= b.threshold);
  const bracket = sortedBrackets[bracketIndex]! || sortedBrackets[0];
  const previousBracket = sortedBrackets[bracketIndex + 1];
  const isFullyInBracket = totalAnnual - monthlySalary >= bracket.threshold;

  if (!isFullyInBracket && previousBracket) {
    // Split the tax for the portion of the salary that falls within this and previous brackets
    const taxableInBracket = totalAnnual - bracket.threshold;
    const taxableInPreviousBracket = monthlySalary - taxableInBracket;
    const taxInBracket = taxableInBracket * bracket.rate;
    const taxInPreviousBracket = taxableInPreviousBracket * previousBracket.rate;

    return {
      amount: taxInBracket + taxInPreviousBracket,
      percentage: ((taxInBracket + taxInPreviousBracket) / monthlySalary) * 100,
    };
  }

  return { amount: monthlySalary * bracket.rate, percentage: bracket.rate * 100 };
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('lt-LT', { style: 'currency', currency: 'EUR' });
}

function formatPercent(amount: number) {
  return (amount / 100).toLocaleString('lt-LT', { style: 'percent', minimumFractionDigits: 2 });
}

export function TaxCalculatorPage() {
  const [income, setIncome] = React.useState<Income>({
    monthly: 15000,
    additionalAnnual: 0,
  });

  const { calculations, totals, averages } = React.useMemo(() => {
    const results: MonthlyIncomeCalculations[] = [];
    const totals = { gpm: 0, vsd: 0, psd: 0, salaryBeforeTaxes: 0, salaryAfterTaxes: 0 };

    if (income.monthly !== undefined) {
      const monthlySalary = income.monthly;
      let totalAnnual = 0;

      for (let month = 1; month <= 12; month++) {
        totalAnnual = totalAnnual + monthlySalary;
        const totalAnnualForGPM = totalAnnual + (income.additionalAnnual ?? 0);

        const gpmTax = calculateProgressiveTax(totalAnnualForGPM, monthlySalary, taxRates.gpm);
        const vsdTax = calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.vsd);
        const psdTax = calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.psd);

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
    } else {
      for (let month = 1; month <= 12; month++) {
        results.push({
          totalAnnualBeforeTaxes: 0,
          totalMonthlyAfterTaxes: 0,
          taxes: {
            gpm: { amount: 0, percentage: 0 },
            vsd: { amount: 0, percentage: 0 },
            psd: { amount: 0, percentage: 0 },
          },
        });
      }
    }

    return {
      calculations: results,
      totals,
      averages: {
        gpmPercent: (totals.gpm * 100) / totals.salaryBeforeTaxes,
        vsdPercent: (totals.vsd * 100) / totals.salaryBeforeTaxes,
        psdPercent: (totals.psd * 100) / totals.salaryBeforeTaxes,
        taxPercent: ((totals.gpm + totals.vsd + totals.psd) * 100) / totals.salaryBeforeTaxes,
      },
    };
  }, [income]);

  const renderLine = (
    label: string,
    render: (calculation: MonthlyIncomeCalculations) => React.ReactNode,
    total: React.ReactNode,
  ) => {
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
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black flex items-center justify-center gap-2">
        <Calculator className="size-8" />
        2026 Metų Mokesčių Skaičiuoklė
      </h1>
      <div className="flex gap-4 mx-auto">
        <div className="p-4 border rounded-sm">
          <Label className="mb-2 block text-left font-bold">Mėnesinis atlyginimas prieš mokesčius:</Label>
          <Input
            type="number"
            value={income.monthly}
            onChange={e => setIncome(prev => ({ ...prev, monthly: Number(e.target.value) }))}
          />
        </div>
        <div className="p-4 border rounded-sm">
          <Label className="mb-2 block text-left font-bold">Papildomos pajamos iš MB prieš mokesčius:</Label>
          <Input
            type="number"
            value={income.additionalAnnual}
            onChange={e => setIncome(prev => ({ ...prev, additionalAnnual: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
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
              calc => formatCurrency(calc.totalMonthlyAfterTaxes),
              formatCurrency(totals.salaryAfterTaxes),
            )}
            {renderLine(
              'Metinės bruto pajamos',
              calc => formatCurrency(calc.totalAnnualBeforeTaxes),
              formatCurrency(totals.salaryBeforeTaxes),
            )}
            {/* Mokesčiai header */}
            <tr className="bg-stone-200">
              <td className="border border-stone-300 px-3 py-2 font-bold" colSpan={14}>
                Mokesčiai {formatCurrency(totals.gpm + totals.vsd + totals.psd)} ({formatPercent(averages.taxPercent)})
              </td>
            </tr>
            {renderLine('GPM, %', calc => formatPercent(calc.taxes.gpm.percentage), formatPercent(averages.gpmPercent))}
            {renderLine('GPM, EUR', calc => formatCurrency(calc.taxes.gpm.amount), `${formatCurrency(totals.gpm)}`)}
            {renderLine('VSD, %', calc => formatPercent(calc.taxes.vsd.percentage), formatPercent(averages.vsdPercent))}
            {renderLine('VSD, EUR', calc => formatCurrency(calc.taxes.vsd.amount), `${formatCurrency(totals.vsd)}`)}
            {renderLine('PSD, %', calc => formatPercent(calc.taxes.psd.percentage), formatPercent(averages.psdPercent))}
            {renderLine('PSD, EUR', calc => formatCurrency(calc.taxes.psd.amount), `${formatCurrency(totals.psd)}`)}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-center">Metiniai mokesčių tarifai</h2>
        <div className="max-w-2xl mx-auto">
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
                <td>iki 36 VDU</td>
                <td>0 - {formatCurrency(vdu * 36)}</td>
                <td>{(taxRates.gpm[0].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>nuo 36 iki 60 VDU</td>
                <td>
                  {formatCurrency(vdu * 36)} - {formatCurrency(vdu * 60)}
                </td>
                <td>{(taxRates.gpm[1].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>nuo 60 VDU</td>
                <td>virš {formatCurrency(vdu * 60)}</td>
                <td>{(taxRates.gpm[2].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[1].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-sm text-gray-600">
            <p>*Numatytas VDU 2026 metams yra {vdu.toFixed(2)} EUR</p>
          </div>
        </div>
      </div>
    </div>
  );
}
