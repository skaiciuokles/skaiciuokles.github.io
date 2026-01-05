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
  const bracket = sortedBrackets.find(b => totalAnnual >= b.threshold) ?? brackets[0];

  return { amount: monthlySalary * bracket.rate, percentage: bracket.rate };
}

export function TaxCalculatorPage() {
  const [income, setIncome] = React.useState<Income>({
    monthly: undefined,
    additionalAnnual: undefined,
  });

  const calculations = React.useMemo(() => {
    const results: MonthlyIncomeCalculations[] = [];

    if (income.monthly !== undefined) {
      const monthlySalary = income.monthly;
      let totalAnnual = income.additionalAnnual ?? 0;

      for (let month = 1; month <= 12; month++) {
        totalAnnual = totalAnnual + monthlySalary;

        const gpmTax = calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.gpm);
        const vsdTax = calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.vsd);
        const psdTax = calculateProgressiveTax(totalAnnual, monthlySalary, taxRates.psd);

        const totalTaxes = gpmTax.amount + vsdTax.amount + psdTax.amount;
        const afterTaxes = monthlySalary - totalTaxes;

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

    return results;
  }, [income]);

  const renderLine = (label: string, render: (calculation: MonthlyIncomeCalculations) => React.ReactNode) => {
    return (
      <tr className="bg-stone-50">
        <td className="border border-stone-300 px-3 py-2 font-medium bg-stone-100">{label}</td>
        {calculations.map((calc, index) => (
          <td key={index} className="border border-stone-300 px-3 py-2 text-center">
            {render(calc)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black flex items-center justify-center gap-2">
        <Calculator className="size-8" />
        Sveiki atvykę į Mokesčių Skaičiuoklę
      </h1>
      <div className="flex gap-4 mx-auto">
        <div className="p-4 border rounded-sm">
          <Label className="mb-2 block text-left font-bold">Mėnesinis atlyginimas prieš mokesčius:</Label>
          <Input
            type="number"
            value={income.monthly}
            onChange={e => setIncome(prev => ({ ...prev, monthly: Number(e.target.value) }))}
            placeholder="Įveskite mėnesinį atlyginimą"
          />
        </div>
        <div className="p-4 border rounded-sm">
          <Label className="mb-2 block text-left font-bold">Papildomos pajamos iš MB prieš mokesčius:</Label>
          <Input
            type="number"
            value={income.additionalAnnual}
            onChange={e => setIncome(prev => ({ ...prev, additionalAnnual: Number(e.target.value) }))}
            placeholder="Įveskite papildomas MB pajamas"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-stone-200">
              {[null, ...months].map((month, index) => (
                <th key={index} className="border border-stone-300 px-3 py-2 text-center">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderLine('Atlyginimas į rankas', calc => calc.totalMonthlyAfterTaxes.toFixed(2))}
            {renderLine('Metinės bruto pajamos', calc => calc.totalAnnualBeforeTaxes.toFixed(2))}
            {/* Mokesčiai header */}
            <tr className="bg-stone-200">
              <td className="border border-stone-300 px-3 py-2 font-bold" colSpan={13}>
                Mokesčiai
              </td>
            </tr>
            {renderLine('GPM, %', calc => `${calc.taxes.gpm.percentage.toFixed(0)}%`)}
            {renderLine('GPM, EUR', calc => calc.taxes.gpm.amount.toFixed(2))}
            {renderLine('VSD, %', calc => `${calc.taxes.vsd.percentage.toFixed(2)}%`)}
            {renderLine('VSD, EUR', calc => calc.taxes.vsd.amount.toFixed(2))}
            {renderLine('PSD, %', calc => `${calc.taxes.psd.percentage.toFixed(2)}%`)}
            {renderLine('PSD, EUR', calc => calc.taxes.psd.amount.toFixed(2))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-center">Metiniai rėžiai</h2>
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
                <td>0 - {(vdu * 36).toFixed(0)}</td>
                <td>{(taxRates.gpm[0].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>nuo 36 iki 60 VDU</td>
                <td>
                  {(vdu * 36).toFixed(0)} - {(vdu * 60).toFixed(0)}
                </td>
                <td>{(taxRates.gpm[1].rate * 100).toFixed(0)}%</td>
                <td>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</td>
                <td>{(taxRates.psd[0].rate * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>nuo 60 VDU</td>
                <td>virš {(vdu * 60).toFixed(0)}</td>
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
