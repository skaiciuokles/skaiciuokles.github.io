import { createFileRoute } from '@tanstack/react-router';
import { TaxCalculatorPage } from '@/pages/tax-calculator';

export const Route = createFileRoute('/mokesciai/')({
  component: TaxCalculatorPage,
  head: () => ({
    meta: [
      {
        title: 'Mokesčių skaičiuoklė 2026 | GPM, Sodra, PSD, VSD | Lietuvos mokesčiai',
      },
    ],
  }),
});
