export const VDU = 2312.15; // Vidutinis darbo užmokestis Lietuvoje 2026 m.
function getGpmRates<InitialThreshold extends number>(initialThreshold: InitialThreshold) {
  return [
    { threshold: initialThreshold, rate: 0.2 },
    { threshold: VDU * 36, rate: 0.25 },
    { threshold: VDU * 60, rate: 0.32 },
  ] as const;
}

export const taxRates = {
  // Gyventojų pajamų mokestis
  gpm: getGpmRates(0),
  mbGpm: [{ threshold: 0, rate: 0.15 }, ...getGpmRates(VDU * 12)],
  // Valstybinio socialinio draudimo įmokos
  vsd: [
    { threshold: 0, rate: 0.1252 },
    { threshold: VDU * 60, rate: 0 },
  ],
  // Privalomojo sveikatos draudimo įmokos
  psd: [{ threshold: 0, rate: 0.0698 }],
} as const;

interface Tax {
  amount: number;
  percentage: number;
}

export interface MonthlyIncomeCalculations {
  totalAnnualBeforeTaxes: number;
  totalMonthlyAfterTaxes: number;
  taxes: { gpm: Tax; vsd: Tax; psd: Tax; total: Tax };
}

export interface IncomeTotals {
  gpm: number;
  vsd: number;
  psd: number;
  totalTaxes: number;
  totalTaxesPercentage: number;
  salaryBeforeTaxes: number;
  salaryAfterTaxes: number;
}

export interface IncomeAverages {
  gpmPercent: number;
  vsdPercent: number;
  psdPercent: number;
  taxPercent: number;
}

export interface Income {
  year: 2026;
  monthly?: number;
  additionalMonthly?: number;
}

export const months = [
  'Sausis',
  'Vasaris',
  'Kovas',
  'Balandis',
  'Gegužė',
  'Birželis',
  'Liepa',
  'Rugpjūtis',
  'Rugsėjis',
  'Spalis',
  'Lapkritis',
  'Gruodis',
];

// Helper function to calculate progressive tax for a monthly salary
export function calculateProgressiveTax(
  totalAnnual: number,
  monthlySalary: number,
  brackets: (typeof taxRates)[keyof typeof taxRates],
) {
  // Sort brackets from highest to lowest threshold
  const sortedBrackets = brackets.toSorted((a, b) => b.threshold - a.threshold);
  const bracketIndex = sortedBrackets.findIndex(b => totalAnnual >= b.threshold);
  const bracket = sortedBrackets[bracketIndex]! || sortedBrackets[0];
  const previousBracket = sortedBrackets[bracketIndex + 1];
  const isFullyInBracket = totalAnnual - monthlySalary >= bracket.threshold;

  if (!isFullyInBracket && previousBracket) {
    // Split the tax for the portion of the salary that falls within this and previous brackets
    const taxableInBracket = totalAnnual - bracket.threshold;
    const taxableInPreviousBracket = monthlySalary - taxableInBracket;
    const taxInBracket = taxableInBracket * bracket.rate;
    const taxInPreviousBracket = taxableInPreviousBracket * previousBracket.rate;

    return {
      amount: taxInBracket + taxInPreviousBracket,
      percentage: ((taxInBracket + taxInPreviousBracket) / monthlySalary) * 100,
    };
  }

  return { amount: monthlySalary * bracket.rate, percentage: bracket.rate * 100 };
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString('lt-LT', { style: 'currency', currency: 'EUR' });
}

export function formatPercent(amount: number) {
  return (amount / 100).toLocaleString('lt-LT', { style: 'percent', minimumFractionDigits: 2 });
}
