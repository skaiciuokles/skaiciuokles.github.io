import { formatCurrency, formatPercent } from '../utils';

export function IndividualSummaryItems({
  title,
  salaryAfterTaxes,
  salaryBeforeTaxes,
  taxAmount,
  taxPercentage,
}: IndividualSummaryItemsProps) {
  return (
    <div className="space-y-2">
      <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{title}</span>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[10px] text-muted-foreground uppercase">Į rankas</span>
          <span className="text-sm font-bold text-stone-900">{formatCurrency(salaryAfterTaxes)}</span>
        </div>
        <div>
          <span className="block text-[10px] text-muted-foreground uppercase">Ant popieriaus</span>
          <span className="text-sm font-semibold text-stone-700">{formatCurrency(salaryBeforeTaxes)}</span>
        </div>
      </div>
      <div>
        <span className="block text-[10px] text-muted-foreground uppercase">Mokesčiai</span>
        <span className="text-xs font-bold text-rose-600">
          {formatCurrency(taxAmount)} ({formatPercent(taxPercentage)})
        </span>
      </div>
    </div>
  );
}

interface IndividualSummaryItemsProps {
  title: string;
  salaryAfterTaxes: number;
  salaryBeforeTaxes: number;
  taxAmount: number;
  taxPercentage: number;
}
