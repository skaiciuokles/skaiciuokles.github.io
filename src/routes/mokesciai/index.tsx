import { createFileRoute } from '@tanstack/react-router';
import { TaxCalculatorPage } from '@/pages/tax-calculator';

export const Route = createFileRoute('/mokesciai/')({
  component: TaxCalculatorPage,
  head: () => ({
    meta: [
      {
        title: 'Skaičiuoklės | Mokesčių skaičiuoklė',
      },
    ],
  }),
});
