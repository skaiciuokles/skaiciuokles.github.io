import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/forms/input';
import { Checkbox } from '@/components/forms/checkbox';
import { Select, type SelectOption } from '@/components/forms/select';
import { useIsMobile } from '@/hooks';
import { Collapsible } from '@/components/layouts/collapsible';
import { HEADER_HEIGHT } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { IncomeOptimizer } from './income-optimizer';
import { formatCurrency, formatPercent, MB_INCOME_LIMIT_PER_YEAR, MMA, PROFIT_TAX_RATES, VDU } from './utils';
import type { Income, Year } from './utils';

const yearOptions: SelectOption<Year>[] = [
  // { label: '2025', value: 2025 },
  { label: '2026', value: 2026 },
];

function IncomeBlock({ className, children, hasError, ...rest }: React.ComponentProps<'div'> & { hasError?: boolean }) {
  return (
    <Card className={cn(hasError && 'text-red-500 [&_p]:text-red-500', className)} {...rest}>
      {children}
    </Card>
  );
}

function IncomeInfo({ className, children, ...rest }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-xs text-gray-500 italic', className)} {...rest}>
      {children}
    </p>
  );
}

export function IncomeConfigurationPanel({ income, setIncome }: IncomeConfigurationPanelProps) {
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    const handleScroll = () => {
      const { bottom } = container.getBoundingClientRect();
      setIsSticky(bottom < HEADER_HEIGHT);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const mbIncomeLimit = MB_INCOME_LIMIT_PER_YEAR / 12;
  const mbIncomeExceedsLimit = (income.mbMonthly ?? 0) > mbIncomeLimit;
  const profitTaxRates = PROFIT_TAX_RATES[income.year];
  const handleYearChange = useCallback((year: Year) => setIncome(prev => ({ ...prev, year })), [setIncome]);
  const handleIncomeChange = useCallback(
    (value: number | undefined, e: React.ChangeEvent<HTMLInputElement>) =>
      setIncome(prev => ({ ...prev, [e.target.name]: value })),
    [setIncome],
  );
  const handleCheckboxChange = useCallback(
    (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) =>
      setIncome(prev => ({ ...prev, [e.target.name]: checked })),
    [setIncome],
  );

  const content = (
    <div className="p-2 flex overflow-x-auto md:flex-col gap-2 md:overflow-y-auto md:max-h-[calc(100vh-93px)]">
      <IncomeBlock className="not-md:min-w-72">
        <Select
          value={income.year}
          label="Mokestiniai metai:"
          onChange={handleYearChange}
          options={yearOptions}
          className="w-full"
        />
        <IncomeOptimizer income={income} setIncome={setIncome} />
      </IncomeBlock>
      <IncomeBlock className="not-md:min-w-60">
        <Input
          label="Mėnesio darbo santykių pajamos (prieš mokesčius):"
          type="number"
          value={income.monthly}
          onChange={handleIncomeChange}
          placeholder="Pajamos iš darbo santykių"
          name="monthly"
        />
        <Checkbox
          label="Papildomai kaupiu 3% pensijai"
          name="pensionAccumulation"
          checked={income.pensionAccumulation}
          onChange={handleCheckboxChange}
          className="text-xs"
        />
      </IncomeBlock>
      <IncomeBlock className="not-md:min-w-72">
        <Input
          label="Mėnesio IV pagal pažymą pajamos (prieš mokesčius):"
          type="number"
          value={income.ivMonthly}
          onChange={handleIncomeChange}
          placeholder="Pajamos iš individualios veiklos"
          name="ivMonthly"
        />
        <IncomeInfo>30% išlaidų atskaitymas įtrauktas automatiškai</IncomeInfo>
      </IncomeBlock>
      <IncomeBlock className="not-md:min-w-48" hasError={mbIncomeExceedsLimit}>
        <Input
          label="Mėnesio MB pajamos (prieš mokesčius):"
          type="number"
          value={income.mbMonthly}
          onChange={handleIncomeChange}
          placeholder="Pajamos iš MB"
          name="mbMonthly"
        />
        {mbIncomeExceedsLimit ? (
          <IncomeInfo>
            *Pajamos iš MB išmokėtos pagal civilinę vadovavimo sutartį negali viršyti {formatCurrency(mbIncomeLimit)}{' '}
            per mėnesį (arba {formatCurrency(MB_INCOME_LIMIT_PER_YEAR)} per metus).
          </IncomeInfo>
        ) : (
          <IncomeInfo>Pajamos iš MB pagal civilinę vadovavimo sutartį.</IncomeInfo>
        )}
      </IncomeBlock>
      <IncomeBlock className="not-md:min-w-80">
        <Input
          label="Mėnesio MB pelno suma dividendams (prieš pelno mokestį):"
          type="number"
          value={income.mbDividendsMonthly}
          onChange={handleIncomeChange}
          placeholder="Pajamos iš MB dividendų"
          name="mbDividendsMonthly"
        />
        <IncomeInfo>Pajamos dividendais išmokamos MB sumokėjus pelno mokestį.</IncomeInfo>
        <Checkbox
          label={`MB iki ${profitTaxRates.gracePeriod} mėnesių (0% pelno mokestis)`}
          name="mbNoProfitTax"
          checked={income.mbNoProfitTax}
          onChange={handleCheckboxChange}
          className="text-xs"
        />
        <Checkbox
          label={`Pajamos iki ${formatCurrency(profitTaxRates.limitPerYear)} (${formatPercent(profitTaxRates.reducedRate * 100)} pelno mokestis)`}
          name="mbUseReducedProfitTaxRate"
          checked={income.mbUseReducedProfitTaxRate}
          onChange={handleCheckboxChange}
          className="text-xs"
        />
      </IncomeBlock>
    </div>
  );

  return (
    <>
      <div ref={containerRef} className="flex md:flex-col md:border-r not-md:border-b">
        {content}
        <div className="flex flex-col justify-center text-center h-12 border-t px-2 mt-auto not-md:hidden text-xs text-muted-foreground">
          *VDU {income.year} m. = {formatCurrency(VDU[income.year])} €
          <br />
          *MMA {income.year} m. = {formatCurrency(MMA[income.year])} €
        </div>
      </div>

      {/* Sticky income entry for mobile */}
      {isMobile && (
        <div
          aria-hidden={!isSticky}
          style={{ top: HEADER_HEIGHT }}
          className={cn(
            'fixed left-0 right-0 z-50 transition-all ease-in-out transform border-b bg-background',
            isSticky ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <Collapsible
            className="w-full"
            direction="horizontal"
            asChild
            trigger={context => (
              <Button variant="ghost" className="w-full h-full border-b rounded-none">
                {context.isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                {context.isOpen ? 'Slėpti' : 'Koreguoti'} Pajamas
                {context.isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            )}
          >
            {content}
          </Collapsible>
        </div>
      )}
    </>
  );
}

interface IncomeConfigurationPanelProps {
  income: Income;
  setIncome: (income: React.SetStateAction<Income>) => void;
}
