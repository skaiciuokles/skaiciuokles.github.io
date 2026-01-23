import { createFileRoute } from '@tanstack/react-router';
import { TaxCalculatorPage } from './partials';

export const Route = createFileRoute('/mokesciai/')({
  component: TaxCalculatorPage,
  head: () => ({
    meta: [
      {
        title: 'Mokesčių skaičiuoklė ir optimizavimas 2026 | DU, IV, MB mokesčių skaičiavimas',
      },
    ],
  }),
});
