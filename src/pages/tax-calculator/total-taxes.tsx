import React from 'react';
import { formatCurrency, formatPercent, TAX_CALCULATION_EVENT } from './utils';
import type { IncomeTotals, TaxCalculationEventDetail } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

const headers = ['GPM, EUR', 'VSD, EUR', 'PSD, EUR', 'Prieš mokesčius, EUR', 'Į rankas, EUR', 'Viso mokesčių, EUR (%)'];

export function TotalTaxes({ className }: { className?: string }) {
  const [taxData, setTaxData] = React.useState<Map<string, IncomeTotals>>(new Map());

  React.useEffect(() => {
    const handleTaxCalculation = (event: CustomEvent<TaxCalculationEventDetail>) => {
      const { id, totals } = event.detail;
      setTaxData(prev => {
        const next = new Map(prev);
        next.set(id, totals);
        return next;
      });
    };

    document.addEventListener(TAX_CALCULATION_EVENT, handleTaxCalculation);
    return () => document.removeEventListener(TAX_CALCULATION_EVENT, handleTaxCalculation);
  }, []);

  const totals = React.useMemo(() => {
    const result: IncomeTotals = {
      gpm: 0,
      vsd: 0,
      psd: 0,
      totalTaxes: 0,
      totalTaxesPercentage: 0,
      salaryBeforeTaxes: 0,
      salaryAfterTaxes: 0,
    };

    for (const data of taxData.values()) {
      result.gpm += data.gpm;
      result.vsd += data.vsd;
      result.psd += data.psd;
      result.totalTaxes += data.totalTaxes;
      result.salaryBeforeTaxes += data.salaryBeforeTaxes;
      result.salaryAfterTaxes += data.salaryAfterTaxes;
    }

    result.totalTaxesPercentage =
      result.salaryBeforeTaxes > 0 ? (result.totalTaxes * 100) / result.salaryBeforeTaxes : 0;

    return result;
  }, [taxData]);

  return (
    <TaxSummaryTableWrapper
      label="Bendra metinė mokesčių suvestinė"
      tableHeader={headers.map((header, index) => (
        <TaxSummaryTableHeaderColumn key={index}>{header}</TaxSummaryTableHeaderColumn>
      ))}
      className={className}
    >
      <TaxSummaryTableBodyRow className="font-bold">
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.gpm)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.vsd)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.psd)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryBeforeTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryAfterTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.totalTaxes)} ({formatPercent(totals.totalTaxesPercentage)})
        </TaxSummaryTableBodyColumn>
      </TaxSummaryTableBodyRow>
    </TaxSummaryTableWrapper>
  );
}
