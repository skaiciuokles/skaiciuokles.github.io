import React from 'react';
import { Tooltip } from '@/components/layouts/tooltip';
import { ExternalLink } from '@/components/ui/external-link';
import { calculateSourceTaxes, formatCurrency, formatPercent, months, TAX_CALCULATION_EVENT } from './utils';
import type { TaxCalculationEventDetail, TaxRates } from './utils';
import {
  TaxSummaryTableBodyColumn,
  TaxSummaryTableBodyRow,
  TaxSummaryTableHeaderColumn,
  TaxSummaryTableWrapper,
  type TaxSummaryTableWrapperBaseProps,
} from './tax-summary-table-wrapper';

export const TaxSummaryTable = React.memo(
  ({
    label,
    monthlySalary,
    additionalForGPM,
    gpmOverride,
    gpmTooltip,
    withSodra,
    taxRates,
    pensionAccumulation,
    ...rest
  }: TaxSummaryTableProps) => {
    const id = React.useId();
    const { results: calculations, totals } = React.useMemo(
      () =>
        calculateSourceTaxes({
          monthlySalary,
          additionalForGPM,
          gpmOverride,
          withSodra,
          taxRates,
          pensionAccumulation,
        }),
      [monthlySalary, additionalForGPM, withSodra, taxRates, gpmOverride, pensionAccumulation],
    );

    // Emit custom event when calculations complete
    React.useEffect(() => {
      const event = new CustomEvent<TaxCalculationEventDetail>(TAX_CALCULATION_EVENT, { detail: { id, totals } });
      document.dispatchEvent(event);
    }, [id, totals]);

    const headers = [
      'Mėnuo',
      'Pajamos į rankas',
      'Metinės pajamos',
      'GPM, %',
      'GPM, EUR',
      ...(withSodra ? ['VSD, %', 'VSD, EUR', 'PSD, %', 'PSD, EUR'] : []),
      'Viso mokesčių, EUR (%)',
    ];

    return (
      <TaxSummaryTableWrapper
        label={label}
        tableHeader={headers.map((header, index) => (
          <TaxSummaryTableHeaderColumn key={index}>{header}</TaxSummaryTableHeaderColumn>
        ))}
        {...rest}
      >
        {calculations.map((calc, index) => (
          <TaxSummaryTableBodyRow key={index}>
            <TaxSummaryTableBodyColumn className="font-medium bg-stone-100">{months[index]}</TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>
              <div className="flex items-center justify-center gap-1">
                {formatCurrency(calc.totalMonthlyAfterTaxes)}
                {calc.npd > 0 && (
                  <Tooltip
                    label={
                      <div className="max-w-sm">
                        Pritaikytas NPD: <strong>{formatCurrency(calc.npd)}</strong>
                        <div className="text-gray-300 text-xs">
                          Neapmokestinamas pajamų dydis mažina mokestinių pajamų bazę. Skaičiavimai paremti{' '}
                          <ExternalLink
                            href="https://www.vmi.lt/evmi/documents/20142/391008/NPD+dyd%C5%BEiai.pdf/8ddb3f8e-4628-1e17-9711-40d377742105?t=1734335445883"
                            color="lightBlue"
                          >
                            VMI pateikta informacija.
                          </ExternalLink>
                        </div>
                      </div>
                    }
                    iconClassName="inline ml-1 size-3 text-muted-foreground"
                  />
                )}
              </div>
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>
              {taxRates.gpmBase < 1 ? (
                <Tooltip
                  label={
                    <div className="max-w-sm">
                      Metinės pajamos: {formatCurrency(calc.totalAnnualBeforeTaxes)}
                      <br />
                      Apmokestinamos pajamos (70%): {formatCurrency(calc.totalAnnualBeforeTaxes * taxRates.gpmBase)}
                    </div>
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    {formatCurrency(calc.totalAnnualBeforeTaxes)}
                    <small> ({formatCurrency(calc.totalAnnualBeforeTaxes * taxRates.gpmBase)})</small>
                  </div>
                </Tooltip>
              ) : (
                formatCurrency(calc.totalAnnualBeforeTaxes)
              )}
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>
              <div className="flex items-center justify-center gap-1">
                {taxRates.gpmBase < 1 ? (
                  <Tooltip
                    label={
                      <div className="max-w-sm">
                        Efektyvus GPM tarifas: {formatPercent(calc.taxes.gpm.percentage * taxRates.gpmBase)}
                        <br />
                        GPM tarifas nuo apmokestinamų pajamų: {formatPercent(calc.taxes.gpm.percentage)}
                      </div>
                    }
                  >
                    <span>
                      {formatPercent(calc.taxes.gpm.percentage * taxRates.gpmBase)}
                      <small> ({formatPercent(calc.taxes.gpm.percentage)})</small>
                    </span>
                  </Tooltip>
                ) : (
                  formatPercent(calc.taxes.gpm.percentage)
                )}
                {gpmTooltip && <Tooltip label={gpmTooltip} iconClassName="ml-1 size-3 text-muted-foreground" />}
              </div>
            </TaxSummaryTableBodyColumn>
            <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.gpm.amount)}</TaxSummaryTableBodyColumn>
            {withSodra && (
              <>
                <TaxSummaryTableBodyColumn>
                  {taxRates.sodraBase < 1 ? (
                    <Tooltip
                      label={
                        <div className="max-w-sm">
                          Efektyvus VSD tarifas: {formatPercent(calc.taxes.vsd.percentage * taxRates.sodraBase)}
                          <br />
                          VSD tarifas nuo apmokestinamų pajamų: {formatPercent(calc.taxes.vsd.percentage)}
                        </div>
                      }
                    >
                      <div className="flex items-center justify-center gap-1">
                        {formatPercent(calc.taxes.vsd.percentage * taxRates.sodraBase)}
                        <small> ({formatPercent(calc.taxes.vsd.percentage)})</small>
                      </div>
                    </Tooltip>
                  ) : (
                    formatPercent(calc.taxes.vsd.percentage)
                  )}
                </TaxSummaryTableBodyColumn>
                <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.vsd.amount)}</TaxSummaryTableBodyColumn>
                <TaxSummaryTableBodyColumn>
                  {taxRates.sodraBase < 1 ? (
                    <Tooltip
                      label={
                        <div className="max-w-sm">
                          Efektyvus PSD tarifas: {formatPercent(calc.taxes.psd.percentage * taxRates.sodraBase)}
                          <br />
                          PSD tarifas nuo apmokestinamų pajamų: {formatPercent(calc.taxes.psd.percentage)}
                        </div>
                      }
                    >
                      <div className="flex items-center justify-center gap-1">
                        {formatPercent(calc.taxes.psd.percentage * taxRates.sodraBase)}
                        <small> ({formatPercent(calc.taxes.psd.percentage)})</small>
                      </div>
                    </Tooltip>
                  ) : (
                    formatPercent(calc.taxes.psd.percentage)
                  )}
                </TaxSummaryTableBodyColumn>
                <TaxSummaryTableBodyColumn>{formatCurrency(calc.taxes.psd.amount)}</TaxSummaryTableBodyColumn>
              </>
            )}
            <TaxSummaryTableBodyColumn>
              <div className="text-nowrap">
                {formatCurrency(calc.taxes.total.amount)} ({formatPercent(calc.taxes.total.percentage)})
              </div>
            </TaxSummaryTableBodyColumn>
          </TaxSummaryTableBodyRow>
        ))}
        {/* Totals row */}
        <TaxSummaryTableBodyRow className="bg-stone-200 font-bold">
          <TaxSummaryTableBodyColumn>Viso</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{formatCurrency(totals.salaryAfterTaxes)}</TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>
            {taxRates.gpmBase < 1 ? (
              <Tooltip
                label={
                  <div className="max-w-sm">
                    Metinės pajamos: {formatCurrency(totals.salaryBeforeTaxes)}
                    <br />
                    Pajamos mokesčių skaičiavimams (70%): {formatCurrency(totals.salaryBeforeTaxes * taxRates.gpmBase)}
                  </div>
                }
              >
                <div className="flex items-center justify-center gap-1">
                  {formatCurrency(totals.salaryBeforeTaxes)}
                  <small> ({formatCurrency(totals.salaryBeforeTaxes * taxRates.gpmBase)})</small>
                </div>
              </Tooltip>
            ) : (
              formatCurrency(totals.salaryBeforeTaxes)
            )}
          </TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>
            <div className="flex items-center justify-center gap-1">
              {taxRates.gpmBase < 1 ? (
                <Tooltip
                  label={
                    <div className="max-w-sm">
                      Efektyvus GPM tarifas: {formatPercent(totals.gpm.percentage * taxRates.gpmBase)}
                      <br />
                      GPM tarifas nuo apmokestinamų pajamų: {formatPercent(totals.gpm.percentage)}
                    </div>
                  }
                >
                  <span>
                    {formatPercent(totals.gpm.percentage * taxRates.gpmBase)}
                    <small> ({formatPercent(totals.gpm.percentage)})</small>
                  </span>
                </Tooltip>
              ) : (
                formatPercent(totals.gpm.percentage)
              )}
              {gpmTooltip && <Tooltip label={gpmTooltip} iconClassName="ml-1 size-3 text-muted-foreground" />}
            </div>
          </TaxSummaryTableBodyColumn>
          <TaxSummaryTableBodyColumn>{formatCurrency(totals.gpm.amount)}</TaxSummaryTableBodyColumn>
          {withSodra && (
            <>
              <TaxSummaryTableBodyColumn>
                {taxRates.sodraBase < 1 ? (
                  <Tooltip
                    label={
                      <div className="max-w-sm">
                        Efektyvus VSD tarifas: {formatPercent(totals.vsd.percentage * taxRates.sodraBase)}
                        <br />
                        VSD tarifas nuo apmokestinamų pajamų: {formatPercent(totals.vsd.percentage)}
                      </div>
                    }
                  >
                    <div className="flex items-center justify-center gap-1">
                      {formatPercent(totals.vsd.percentage * taxRates.sodraBase)}
                      <small> ({formatPercent(totals.vsd.percentage)})</small>
                    </div>
                  </Tooltip>
                ) : (
                  formatPercent(totals.vsd.percentage)
                )}
              </TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>{formatCurrency(totals.vsd.amount)}</TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>
                {taxRates.sodraBase < 1 ? (
                  <Tooltip
                    label={
                      <div className="max-w-sm">
                        Efektyvus PSD tarifas: {formatPercent(totals.psd.percentage * taxRates.sodraBase)}
                        <br />
                        PSD tarifas nuo apmokestinamų pajamų: {formatPercent(totals.psd.percentage)}
                      </div>
                    }
                  >
                    <div className="flex items-center justify-center gap-1">
                      {formatPercent(totals.psd.percentage * taxRates.sodraBase)}
                      <small> ({formatPercent(totals.psd.percentage)})</small>
                    </div>
                  </Tooltip>
                ) : (
                  formatPercent(totals.psd.percentage)
                )}
              </TaxSummaryTableBodyColumn>
              <TaxSummaryTableBodyColumn>{formatCurrency(totals.psd.amount)}</TaxSummaryTableBodyColumn>
            </>
          )}
          <TaxSummaryTableBodyColumn>
            {formatCurrency(totals.total.amount)} ({formatPercent(totals.total.percentage)})
          </TaxSummaryTableBodyColumn>
        </TaxSummaryTableBodyRow>
      </TaxSummaryTableWrapper>
    );
  },
);

type TaxSummaryTableProps = TaxSummaryTableWrapperBaseProps & {
  monthlySalary: number;
  taxRates: TaxRates;
  additionalForGPM?: number;
  gpmOverride?: { amount: number; percentage: number };
  gpmTooltip?: React.ReactNode;
  withSodra?: boolean;
  pensionAccumulation?: boolean;
};
