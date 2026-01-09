import { yearlyTaxRates, formatCurrency } from '../utils';
import { TariffDrawer, type TariffInfoComponentProps } from './tariff-drawer';
import { getBaseBrackets } from './constants';

export function EmploymentTariffDrawer({ year, ...rest }: TariffInfoComponentProps) {
  const taxRates = yearlyTaxRates[year];
  const brackets = getBaseBrackets(year);

  return (
    <TariffDrawer
      brackets={brackets}
      title="Darbo santykių mokesčiai"
      description={`Metinės pajamos ${year} m.`}
      {...rest}
    >
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
        <div className="text-xs text-blue-800">
          <strong>NPD (Neapmokestinamas pajamų dydis):</strong> Iki {formatCurrency(taxRates.npdBase)} mėnesiui,
          mažėjantis didėjant pajamoms virš MMA.
        </div>
      </div>
    </TariffDrawer>
  );
}
