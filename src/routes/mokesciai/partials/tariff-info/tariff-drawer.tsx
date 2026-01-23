import { Drawer, type DrawerProps } from '@/components/layouts/drawer';
import { type Income, type Year } from '../utils';
import { cn } from '@/lib/utils';

export function TariffDrawer({ brackets, children, extra, ...rest }: TariffInfoProps) {
  return (
    <Drawer {...rest}>
      <div className="space-y-3">
        {extra}
        {brackets.map((bracket, i) => (
          <div key={i} className={cn('rounded-lg border p-3 bg-gray-50/50', bracket.className)}>
            <div className="flex flex-wrap items-center mb-2">
              <span className="font-medium text-gray-900">{bracket.label}</span>
              <span className="ml-2 text-xs text-gray-500">{bracket.sublabel}</span>
              <span className="text-xs text-gray-500 ml-auto">{bracket.income}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">GPM</div>
                <div className="font-semibold text-blue-700">{bracket.gpm}</div>
                <div className="text-[10px] text-gray-400">{bracket.gpmNote}</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-xs text-gray-500 mb-0.5">VSD</div>
                <div className="font-semibold text-emerald-700">{bracket.vsd}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">PSD</div>
                <div className="font-semibold text-violet-700">{bracket.psd}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">{children}</div>
    </Drawer>
  );
}

export type TariffInfoComponentProps = DrawerProps & {
  incomeRef: React.RefObject<Income>;
  year: Year;
};

export type TariffInfoProps = Omit<TariffInfoComponentProps, 'incomeRef' | 'year' | 'fadeFromIndex'> & {
  brackets: TariffBracket[];
  extra?: React.ReactNode;
};

export interface TariffBracket {
  label: string;
  sublabel?: string;
  income: string;
  gpm: string;
  gpmNote?: string;
  vsd: string;
  psd: string;
  className?: string;
}
