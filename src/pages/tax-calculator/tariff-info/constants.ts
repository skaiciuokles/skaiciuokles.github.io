import { cn } from '@/lib/utils';
import type { TariffBracket } from './tariff-drawer';
import { formatCurrency, VDU, yearlyTaxRates, type Year } from '../utils';

export function getBaseBrackets(year: Year, options: GetBaseBracketsOptions = {}): TariffBracket[] {
  const taxRates = yearlyTaxRates[year];
  const vdu = VDU[year];
  return [
    {
      label: options.initialLabel ?? 'iki 36 VDU',
      sublabel: 'Standartinis tarifas',
      income: options.initialIncome ?? `0 - ${formatCurrency(vdu * 36)}`,
      gpm: `${(taxRates.gpm[0].rate * 100).toFixed(0)}%`,
      vsd: options.vsd ?? `${(taxRates.vsd[0].rate * 100).toFixed(2)}%`,
      psd: options.psd ?? `${(taxRates.psd[0].rate * 100).toFixed(2)}%`,
    },
    {
      label: '36 - 60 VDU',
      sublabel: 'Pereinamasis tarifas',
      income: `${formatCurrency(vdu * 36)} - ${formatCurrency(vdu * 60)}`,
      gpm: `${(taxRates.gpm[1].rate * 100).toFixed(0)}%`,
      vsd: options.vsd ?? `${(taxRates.vsd[0].rate * 100).toFixed(2)}%`,
      psd: options.psd ?? `${(taxRates.psd[0].rate * 100).toFixed(2)}%`,
    },
    {
      label: 'virš 60 VDU',
      sublabel: 'Maksimalus tarifas',
      income: `nuo ${formatCurrency(vdu * 60)}`,
      gpm: `${(taxRates.gpm[2].rate * 100).toFixed(0)}%`,
      vsd: options.vsd ?? '0%',
      psd: options.psd ?? `${(taxRates.psd[0].rate * 100).toFixed(2)}%`,
      className: cn('border-rose-200 bg-rose-50'),
    },
  ];
}

interface GetBaseBracketsOptions {
  initialLabel?: string;
  initialIncome?: string;
  vsd?: string;
  psd?: string;
}
