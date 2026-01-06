import { cn } from '@/lib/utils';
import { taxRates, VDU, formatCurrency } from '../tax-calculator/utils';

interface TaxBracket {
  label: string;
  income: string;
  gpm: string;
  vsd: string;
  psd: string;
}

const taxBrackets: Record<number, TaxBracket[]> = {
  2026: [
    {
      label: 'iki 12 VDU (tik MB)',
      income: `0 - ${formatCurrency(VDU * 12)}`,
      gpm: '15%',
      vsd: '0%',
      psd: '0%',
    },
    {
      label: 'iki 36 VDU',
      income: `0 - ${formatCurrency(VDU * 36)}`,
      gpm: `${(taxRates.gpm[0].rate * 100).toFixed(0)}%`,
      vsd: `${(taxRates.vsd[0].rate * 100).toFixed(2)}%`,
      psd: `${(taxRates.psd[0].rate * 100).toFixed(2)}%`,
    },
    {
      label: 'nuo 36 iki 60 VDU',
      income: `${formatCurrency(VDU * 36)} - ${formatCurrency(VDU * 60)}`,
      gpm: `${(taxRates.gpm[1].rate * 100).toFixed(0)}%`,
      vsd: `${(taxRates.vsd[0].rate * 100).toFixed(2)}%`,
      psd: `${(taxRates.psd[0].rate * 100).toFixed(2)}%`,
    },
    {
      label: 'nuo 60 VDU',
      income: `virš ${formatCurrency(VDU * 60)}`,
      gpm: `${(taxRates.gpm[2].rate * 100).toFixed(0)}%`,
      vsd: `${(taxRates.vsd[1].rate * 100).toFixed(0)}%`,
      psd: `${(taxRates.psd[0].rate * 100).toFixed(2)}%`,
    },
  ],
};

export function TaxTariffLegend({ year, className, ...rest }: TaxTariffLegendProps) {
  return (
    <div className={cn('text-xs', className)} {...rest}>
      <div className="font-semibold text-sm mb-1.5">Mokesčių tarifai 2026 m.</div>
      <div className="space-y-1">
        {taxBrackets[year]?.map((bracket, i) => (
          <div key={i} className="border rounded px-2 py-1.5 bg-gray-50">
            <div className="font-medium text-gray-900">
              {bracket.label} <span className="font-normal text-gray-600">({bracket.income})</span>
            </div>
            <div className="flex text-gray-700 justify-center">
              <span className="pr-1 mr-1 border-r border-gray-300">GPM: {bracket.gpm}</span>
              <span className="pr-1 mr-1 border-r border-gray-300">VSD: {bracket.vsd}</span>
              <span className="pr-1 mr-1 border-r border-gray-300">PSD: {bracket.psd}</span>
              <span>PSD: {bracket.psd}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaxTariffLegendProps extends React.ComponentProps<'div'> {
  year: number;
}
