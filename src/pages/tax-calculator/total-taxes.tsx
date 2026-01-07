import React from 'react';
import { formatCurrency, formatPercent, TAX_CALCULATION_EVENT } from './utils';
import type { IncomeTotalTaxes, TaxCalculationEventDetail } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

const headers = ['GPM, EUR', 'VSD, EUR', 'PSD, EUR', 'Prieš mokesčius, EUR', 'Į rankas, EUR', 'Viso mokesčių, EUR (%)'];

export function TotalTaxes({ className }: { className?: string }) {
  const [taxData, setTaxData] = React.useState<Map<string, IncomeTotalTaxes>>(new Map());

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
    const result: IncomeTotalTaxes = {
      gpm: { amount: 0, percentage: 0 },
      vsd: { amount: 0, percentage: 0 },
      psd: { amount: 0, percentage: 0 },
      total: { amount: 0, percentage: 0 },
      salaryBeforeTaxes: 0,
      salaryAfterTaxes: 0,
    };

    for (const data of taxData.values()) {
      result.gpm.amount += data.gpm.amount;
      result.vsd.amount += data.vsd.amount;
      result.psd.amount += data.psd.amount;
      result.total.amount += data.total.amount;
      result.salaryBeforeTaxes += data.salaryBeforeTaxes;
      result.salaryAfterTaxes += data.salaryAfterTaxes;
    }

    result.total.percentage = result.salaryBeforeTaxes > 0 ? (result.total.amount * 100) / result.salaryBeforeTaxes : 0;

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
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.gpm.amount)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.vsd.amount)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.psd.amount)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryBeforeTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryAfterTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.total.amount)} ({formatPercent(totals.total.percentage)})
        </TaxSummaryTableBodyColumn>
      </TaxSummaryTableBodyRow>
    </TaxSummaryTableWrapper>
  );
}
