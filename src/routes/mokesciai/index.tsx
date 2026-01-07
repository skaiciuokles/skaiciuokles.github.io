import { createFileRoute } from '@tanstack/react-router';
import { TaxCalculatorPage } from '@/pages/tax-calculator';

export const Route = createFileRoute('/mokesciai/')({
  component: TaxCalculatorPage,
});
