import { taxRates, VDU, formatCurrency } from '../tax-calculator/utils';

export function TaxTariffLegend() {
  return (
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
  );
}
