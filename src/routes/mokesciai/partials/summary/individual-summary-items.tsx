import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '../utils';

export function IndividualSummaryItems({
  className,
  title,
  salaryAfterTaxes,
  salaryBeforeTaxes,
  taxAmount,
  taxPercentage,
  ...rest
}: IndividualSummaryItemsProps) {
  return (
    <div className={cn('space-y-2', className)} {...rest}>
      <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{title}</span>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="block text-[10px] text-muted-foreground uppercase">Į rankas</div>
          <div className="text-sm font-bold text-stone-900">{formatCurrency(salaryAfterTaxes)}</div>
        </div>
        <div>
          <div className="block text-[10px] text-muted-foreground uppercase">Ant popieriaus</div>
          <div className="text-sm font-semibold text-stone-700">{formatCurrency(salaryBeforeTaxes)}</div>
        </div>
        <div>
          <div className="block text-[10px] text-muted-foreground uppercase">Mokesčiai</div>
          <div className="text-xs font-bold text-rose-600">
            {formatCurrency(taxAmount)} ({formatPercent(taxPercentage)})
          </div>
        </div>
      </div>
    </div>
  );
}

interface IndividualSummaryItemsProps extends React.ComponentProps<'div'> {
  title: string;
  salaryAfterTaxes: number;
  salaryBeforeTaxes: number;
  taxAmount: number;
  taxPercentage: number;
}
