import React from 'react';
import { cn } from '@/lib/utils';
import { formatPercent, calculateMBProfitTaxRate, type Income } from '../utils';
import { TariffDrawer, type TariffInfoComponentProps, type TariffBracket } from './tariff-drawer';
import { Label } from '@/components/ui/label';

export function MBDividendsTariffDrawer({ year, incomeRef, ...rest }: TariffInfoComponentProps) {
  const [income, setIncome] = React.useState<Income>({
    year,
    mbLessThan12Months: true,
    mbLessThan300kPerYear: true,
    pensionAccumulation: false,
  });
  // We need to simulate an income object to get the profit tax rate
  const profitTaxRate = calculateMBProfitTaxRate(income);
  const effectiveGpmRate = (1 - profitTaxRate) * 0.15 + profitTaxRate;
  const brackets: TariffBracket[] = [
    {
      label: 'Dividendai',
      sublabel: 'Standartinis tarifas',
      income: 'Bet kokia suma',
      gpm: formatPercent(effectiveGpmRate * 100),
      vsd: formatPercent(0),
      psd: formatPercent(0),
      className: cn('border-emerald-200 bg-emerald-50'),
    },
  ];

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        setIncome(oldIncome => ({ ...oldIncome, ...incomeRef.current }));
      }
    },
    [incomeRef],
  );

  return (
    <TariffDrawer
      onOpenChange={handleOpenChange}
      brackets={brackets}
      title="MB dividendų mokesčiai"
      size="lg"
      description={`Pelno paskirstymas (dividendai) ${year} m,`}
      extra={
        <div className="mt-2 border-y py-2 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="mbLessThan12Months_legend"
              type="checkbox"
              checked={income.mbLessThan12Months}
              onChange={e => setIncome({ ...income, mbLessThan12Months: e.target.checked })}
              className="cursor-pointer"
            />
            <Label htmlFor="mbLessThan12Months_legend" className="cursor-pointer">
              MB naujai susikurta (netaikomas pelno mokestis)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="mbLessThan300kPerYear_legend"
              type="checkbox"
              checked={income.mbLessThan300kPerYear}
              onChange={e => setIncome({ ...income, mbLessThan300kPerYear: e.target.checked })}
              className="cursor-pointer"
            />
            <Label htmlFor="mbLessThan300kPerYear_legend" className="cursor-pointer">
              MB pajamos neviršija 300 000 eurų (taikomas mažesnis pelno mokestis)
            </Label>
          </div>
        </div>
      }
      {...rest}
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="text-xs text-emerald-800 space-y-2">
            <p>
              <strong>Kaip skaičiuojama:</strong> Pirmiausia MB sumoka pelno mokestį nuo uždirbto pelno. Likusi dalis
              paskirstoma nariams kaip dividendai, nuo kurių mokamas 15% GPM.
            </p>
            <p>
              <strong>Dabartiniai tarifai:</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Pelno mokestis: {formatPercent(profitTaxRate * 100)}</li>
              <li>GPM nuo dividendų: 15%</li>
              <li>
                Efektyvus bendras tarifas: <strong>{formatPercent(effectiveGpmRate * 100)}</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="text-xs text-blue-800">
            <strong>Sodra:</strong> Dividendai nėra apmokestinami VSD ir PSD įmokomis, todėl tai dažnai yra pati
            pigiausia išsiėmimo forma, jei sukauptas pakankamas pelnas.
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div className="text-xs text-amber-800">
            <strong>Svarbu:</strong> Pelno mokestis gali skirtis priklausomai nuo MB apyvartos ir darbuotojų skaičiaus
            (0%, 6% arba 16%). Skaičiuoklėje galite keisti šiuos nustatymus kairėje pusėje.
          </div>
        </div>

        <div className="text-muted-foreground text-xs mt-1">
          Daugiau informacijos galite rasti{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-700"
            href="https://www.vmi.lt/evmi/pelno-mokestis2"
          >
            VMI pateiktoje informacijoje
          </a>
          .
        </div>
      </div>
    </TariffDrawer>
  );
}
