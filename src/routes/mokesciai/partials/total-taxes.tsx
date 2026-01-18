import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from '@/components/layouts/tooltip';
import { formatCurrency, formatPercent, MMA, TAX_CALCULATION_EVENT, yearlyTaxRates } from './utils';
import type { IncomeTotalTaxes, TaxCalculationEventDetail, Year } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
} from './tax-summary-table-wrapper';

const headers = [
  'GPM, EUR (%)',
  'VSD, EUR (%)',
  'PSD, EUR (%)',
  'Pajamos į rankas, EUR',
  'Prieš mokesčius, EUR',
  'Viso mokesčių, EUR (%)',
];

export function TotalTaxes({ year, className }: TotalTaxesProps) {
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

  const { totals, psdRemainder } = React.useMemo(() => {
    const taxRates = yearlyTaxRates[year];
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

    // Minimum annual PSD contribution: MMA × 12 × smallest PSD rate
    const minimumAnnualPsd = Number((MMA[year] * 12 * taxRates.psd[0].rate).toFixed(2));
    let psdRemainder = 0;

    result.gpm.amount = Number(result.gpm.amount.toFixed(2));
    result.psd.amount = Number(result.psd.amount.toFixed(2));
    result.vsd.amount = Number(result.vsd.amount.toFixed(2));

    // If calculated PSD is less than minimum, add the remainder
    if (result.psd.amount < minimumAnnualPsd) {
      psdRemainder = minimumAnnualPsd - result.psd.amount;
      result.psd.amount = minimumAnnualPsd;
      result.total.amount += psdRemainder;
      result.salaryAfterTaxes -= psdRemainder;
    }

    const totalAnnual = result.salaryBeforeTaxes;
    result.total.percentage = totalAnnual > 0 ? (result.total.amount * 100) / totalAnnual : 0;
    result.gpm.percentage = totalAnnual > 0 ? (result.gpm.amount * 100) / totalAnnual : 0;
    result.vsd.percentage = totalAnnual > 0 ? (result.vsd.amount * 100) / totalAnnual : 0;
    result.psd.percentage = totalAnnual > 0 ? (result.psd.amount * 100) / totalAnnual : 0;
    result.total.percentage = totalAnnual > 0 ? (result.total.amount * 100) / totalAnnual : 0;

    return { totals: result, psdRemainder };
  }, [taxData, year]);

  return (
    <TaxSummaryTableWrapper
      label="Bendra metinė mokesčių suvestinė"
      tableHeader={headers.map((header, index) => (
        <TaxSummaryTableHeaderColumn key={index}>{header}</TaxSummaryTableHeaderColumn>
      ))}
      className={className}
      year={year}
    >
      <TaxSummaryTableBodyRow className="font-bold">
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.gpm.amount)} ({formatPercent(totals.gpm.percentage)})
        </TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.vsd.amount)} ({formatPercent(totals.vsd.percentage)})
        </TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          <div className="flex items-center justify-center gap-1">
            {formatCurrency(totals.psd.amount)} ({formatPercent(totals.psd.percentage)})
            {psdRemainder > 0 && (
              <Tooltip
                label={
                  <div className="max-w-xs text-center">
                    Pridėta papildomai {formatCurrency(psdRemainder)} iki minimalių PSD įmokų. Skaičiavimai paremti{' '}
                    <a
                      href="https://sodra.lt/imoku-tarifai/imoku-tarifai-savarankiskai-privalomuoju-sveikatos-draudimu-besidraudziantiems-asmenims"
                      className="text-blue-500 underline hover:text-blue-600"
                      target="_blank"
                    >
                      Sodros pateikta informacija
                    </a>
                    .
                  </div>
                }
              >
                <InfoIcon className="size-4" />
              </Tooltip>
            )}
          </div>
        </TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryAfterTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryBeforeTaxes)}</TaxSummaryTableBodyColumn>
        <TaxSummaryTableBodyColumn>
          {formatCurrency(totals.total.amount)} ({formatPercent(totals.total.percentage)})
        </TaxSummaryTableBodyColumn>
      </TaxSummaryTableBodyRow>
    </TaxSummaryTableWrapper>
  );
}

interface TotalTaxesProps {
  year: Year;
  className?: string;
}
