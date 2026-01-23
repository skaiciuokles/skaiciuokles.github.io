import { cn } from '@/lib/utils';
import { mbYearlyTaxRates, VDU, formatCurrency, MMA, formatPercent } from '../utils';
import { TariffDrawer, type TariffInfoComponentProps, type TariffBracket } from './tariff-drawer';
import { getBaseBrackets } from './constants';

export function MBTariffDrawer({ year, ...rest }: TariffInfoComponentProps) {
  const taxRates = mbYearlyTaxRates[year];
  const vdu = VDU[year];

  const baseBrackets = getBaseBrackets(year, {
    initialLabel: '12 - 36 VDU',
    initialIncome: `${formatCurrency(vdu * 12)} - ${formatCurrency(vdu * 36)}`,
    vsd: formatPercent(0),
    psd: formatPercent(0),
  });
  const brackets: TariffBracket[] = [
    {
      label: 'iki 12 VDU',
      sublabel: 'Lengvatinis tarifas',
      income: `0 - ${formatCurrency(vdu * 12)}`,
      gpm: formatPercent(15),
      vsd: formatPercent(0),
      psd: formatPercent(0),
      className: cn('border-emerald-200 bg-emerald-50'),
    },
    ...baseBrackets,
  ];

  return (
    <TariffDrawer
      brackets={brackets}
      title="MB mokesčiai"
      description={`Metinės pajamos ${year} m. išmokėtos pagal civilinę vadovavimo sutartį (iki ${formatCurrency(100000)})`}
      {...rest}
    >
      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
        <div className="text-xs text-emerald-800">
          <strong>VSD ir PSD:</strong> Mažosios bendrijos vadovas nemoka. Atkreipkite dėmesį, kad visiems gyventojams
          yra minimalus privalomas PSD mokestis (2026 m. - {formatCurrency(MMA[year] * taxRates.psd[0].rate)} / mėn.),
          kuris turi būti sumokėtas asmeniškai arba mokant su IV ar darbo santykiais susijusius mokesčius.
        </div>
      </div>
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
        <div className="text-xs text-amber-800">
          <strong>Svarbu:</strong> MB pelno paskirstymas apmokestinamas GPM. Rekomenduojama konsultuotis su buhalteriu
          dėl optimalaus pelno paskirstymo ir išmokėjimo dividendų forma.
        </div>
      </div>
    </TariffDrawer>
  );
}
