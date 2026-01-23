import { cn } from '@/lib/utils';
import type { TariffBracket } from './tariff-drawer';
import { formatCurrency, formatPercent, VDU, yearlyTaxRates, type Year } from '../utils';

export function getBaseBrackets(year: Year, options: GetBaseBracketsOptions = {}) {
  const taxRates = yearlyTaxRates[year];
  const vdu = VDU[year];
  return [
    {
      label: options.initialLabel ?? 'iki 36 VDU',
      sublabel: 'Standartinis tarifas',
      income: options.initialIncome ?? `0 - ${formatCurrency(vdu * 36)}`,
      gpm: formatPercent(taxRates.gpm[0].rate * 100),
      vsd: options.vsd ?? formatPercent(taxRates.vsd[0].rate * 100),
      psd: options.psd ?? formatPercent(taxRates.psd[0].rate * 100),
    },
    {
      label: '36 - 60 VDU',
      sublabel: 'Pereinamasis tarifas',
      income: `${formatCurrency(vdu * 36)} - ${formatCurrency(vdu * 60)}`,
      gpm: formatPercent(taxRates.gpm[1].rate * 100),
      vsd: options.vsd ?? formatPercent(taxRates.vsd[0].rate * 100),
      psd: options.psd ?? formatPercent(taxRates.psd[0].rate * 100),
      className: cn('border-amber-200 bg-amber-50'),
    },
    {
      label: 'virš 60 VDU',
      sublabel: 'Maksimalus tarifas',
      income: `nuo ${formatCurrency(vdu * 60)}`,
      gpm: formatPercent(taxRates.gpm[2].rate * 100),
      vsd: options.vsd ?? formatPercent(0),
      psd: options.psd ?? formatPercent(taxRates.psd[0].rate * 100),
      className: cn('border-rose-200 bg-rose-50'),
    },
  ] as const satisfies TariffBracket[];
}

interface GetBaseBracketsOptions {
  initialLabel?: string;
  initialIncome?: string;
  vsd?: string;
  psd?: string;
}
