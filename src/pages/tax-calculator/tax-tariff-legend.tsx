import { taxRates, VDU, formatCurrency } from '../tax-calculator/utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

export function TaxTariffLegend() {
  return (
    <>
      <TaxSummaryTableWrapper
        className="mt-8"
        label="Metiniai 2026 metais nustatyti mokesčių tarifai"
        tableHeader={
          <>
            <TaxSummaryTableHeaderColumn>Metiniai rėžiai</TaxSummaryTableHeaderColumn>
            <TaxSummaryTableHeaderColumn>Metinės pajamos</TaxSummaryTableHeaderColumn>
            <TaxSummaryTableHeaderColumn>GPM tarifas</TaxSummaryTableHeaderColumn>
            <TaxSummaryTableHeaderColumn>VSD tarifas</TaxSummaryTableHeaderColumn>
            <TaxSummaryTableHeaderColumn>PSD tarifas</TaxSummaryTableHeaderColumn>
          </>
        }
      >
        <TaxSummaryTableBodyRow>
          <TaxSummaryTableBodyColumn>iki 12 VDU (tik pajamoms iš MB)</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>0 - {formatCurrency(VDU * 12)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>15%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>0%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>0%</TaxSummaryTableBodyColumn>
        </TaxSummaryTableBodyRow>
        <TaxSummaryTableBodyRow>
          <TaxSummaryTableBodyColumn>iki 36 VDU</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>0 - {formatCurrency(VDU * 36)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.gpm[0].rate * 100).toFixed(0)}%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.psd[0].rate * 100).toFixed(2)}%</TaxSummaryTableBodyColumn>
        </TaxSummaryTableBodyRow>
        <TaxSummaryTableBodyRow>
          <TaxSummaryTableBodyColumn>nuo 36 iki 60 VDU</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>
            {formatCurrency(VDU * 36)} - {formatCurrency(VDU * 60)}
          </TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.gpm[1].rate * 100).toFixed(0)}%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.vsd[0].rate * 100).toFixed(2)}%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.psd[0].rate * 100).toFixed(2)}%</TaxSummaryTableBodyColumn>
        </TaxSummaryTableBodyRow>
        <TaxSummaryTableBodyRow>
          <TaxSummaryTableBodyColumn>nuo 60 VDU</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>virš {formatCurrency(VDU * 60)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.gpm[2].rate * 100).toFixed(0)}%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.vsd[1].rate * 100).toFixed(0)}%</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{(taxRates.psd[0].rate * 100).toFixed(2)}%</TaxSummaryTableBodyColumn>
        </TaxSummaryTableBodyRow>
      </TaxSummaryTableWrapper>
      <div className="text-sm text-gray-600">
        <p>*Numatytas VDU 2026 metams yra {formatCurrency(VDU)} EUR</p>
      </div>
    </>
  );
}
