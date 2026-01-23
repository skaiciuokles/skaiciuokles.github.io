import { cn } from '@/lib/utils';
import { ivYearlyTaxRates, formatCurrency, VDU, VSD_BASE_RATE, formatPercent, PSD_BASE_RATE } from '../utils';
import { TariffDrawer, type TariffInfoComponentProps, type TariffBracket } from './tariff-drawer';
import { getBaseBrackets } from './constants';

export function IVTariffDrawer({ year, ...rest }: TariffInfoComponentProps) {
  const taxRates = ivYearlyTaxRates[year];

  // IV specific: income thresholds are based on taxable income (70% of gross)
  const lowThreshold = 20000 / taxRates.gpmBase; // ~28,571 EUR gross
  const highThreshold = 42500 / taxRates.gpmBase; // ~60,714 EUR gross
  const vdu = VDU[year];
  const baseBrackets = getBaseBrackets(year, {
    initialLabel: '~26 - 36 VDU',
    initialIncome: `${formatCurrency(highThreshold)} - ${formatCurrency(vdu * 36)}`,
  });

  const brackets: TariffBracket[] = [
    {
      label: 'iki ~12 VDU',
      sublabel: 'Lengvatinis tarifas',
      income: `0 - ${formatCurrency(lowThreshold)}`,
      gpm: formatPercent(5),
      gpmNote: 'su mokesčio kreditu',
      vsd: formatPercent(VSD_BASE_RATE * 100),
      psd: formatPercent(PSD_BASE_RATE * 100),
      className: cn('border-emerald-200 bg-emerald-50'),
    },
    {
      label: '~12 - ~26 VDU',
      sublabel: 'Lengvatinis tarifas',
      income: `${formatCurrency(lowThreshold)} - ${formatCurrency(highThreshold)}`,
      gpm: formatPercent(5) + ' → ' + formatPercent(20),
      gpmNote: 'mažėjantis kreditas',
      vsd: formatPercent(VSD_BASE_RATE * 100),
      psd: formatPercent(PSD_BASE_RATE * 100),
      className: cn('border-emerald-200 bg-emerald-50'),
    },
    baseBrackets[0],
    {
      label: '36 - 43 VDU',
      sublabel: 'Pereinamasis tarifas',
      income: `${formatCurrency(vdu * 36)} - ${formatCurrency(vdu * 43)}`,
      gpm: formatPercent(25),
      vsd: formatPercent(VSD_BASE_RATE * 100),
      psd: formatPercent(PSD_BASE_RATE * 100),
      className: cn('border-amber-200 bg-amber-50'),
    },
    {
      label: '43 - 60 VDU',
      sublabel: 'Pereinamasis tarifas',
      income: `${formatCurrency(vdu * 43)} - ${formatCurrency(vdu * 60)}`,
      gpm: formatPercent(25),
      vsd: formatPercent(0),
      psd: formatPercent(PSD_BASE_RATE * 100),
      className: cn('border-amber-200 bg-amber-50'),
    },
    baseBrackets[2],
  ];

  return (
    <TariffDrawer
      brackets={brackets}
      title="IV pagal pažymą mokesčiai"
      description={`Metinės pajamos ${year} m. (prieš 30% išlaidų atskaitymą)`}
      {...rest}
    >
      <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
        <div className="text-xs text-sky-800">
          <strong>30% išlaidų atskaitymas:</strong> Apmokestinama suma = 70% pajamų. Sodra skaičiuojama nuo 90%
          apmokestinamos sumos.
        </div>
      </div>
      <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
        <div className="text-xs text-violet-800">
          <strong>GPM kreditas:</strong> Pajamoms iki 20 000 € (apmokestinamos) taikomas 15% kreditas, mažėjantis kol
          pasiekiama 42 500 € pajamų riba.
        </div>
      </div>
      <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
        <div className="text-xs text-indigo-800">
          <strong>Valstybinio socialinio draudimo įmokos ({formatPercent(VSD_BASE_RATE * 100)})</strong> mokamos už
          apmokestinamas pajamas iki 43 VDU ({formatCurrency(vdu * 43)}).
        </div>
      </div>
    </TariffDrawer>
  );
}
