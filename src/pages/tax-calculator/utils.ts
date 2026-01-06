export const VDU = 2312.15; // Vidutinis darbo užmokestis Lietuvoje 2026 m.
function getGpmRates<InitialThreshold extends number>(initialThreshold: InitialThreshold) {
  return [
    { threshold: initialThreshold, rate: 0.2 },
    { threshold: VDU * 36, rate: 0.25 },
    { threshold: VDU * 60, rate: 0.32 },
  ] as const;
}

export const taxRates = {
  gpmBase: 1,
  sodraBase: 1,
  // Gyventojų pajamų mokestis
  gpm: getGpmRates(0),
  // Valstybinio socialinio draudimo įmokos
  vsd: [
    { threshold: 0, rate: 0.1252 },
    { threshold: VDU * 60, rate: 0 },
  ],
  // Privalomojo sveikatos draudimo įmokos
  psd: [{ threshold: 0, rate: 0.0698 }],
} as const;

export const ivTaxRates = {
  ...taxRates,
  // GPM is calculated on taxable income (70% of total income - 30% expense deduction)
  // VSD/PSD is calculated on 90% of taxable income
  // Source: https://sodra.lt/imoku-tarifai/imoku-tarifai-taikomi-savarankiskai-dirbantiems-asmenims
  gpmBase: 0.7,
  sodraBase: 0.7 * 0.9,
} as const;

export const mbTaxRates = {
  ...taxRates,
  // There's an extra tax bracket for MB income (15% for income up to 12 VDU)
  gpm: [{ threshold: 0, rate: 0.15 }, ...getGpmRates(VDU * 12)],
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
  monthly?: number; // Pajamos iš darbo santykių
  mbMonthly?: number; // Pajamos iš Mažosios Bedrijos
  ivMonthly?: number; // Individuali veikla pagal pažymą
}

/**
 * GPM calculation for "individuali veikla pagal pažymą".
 * Based on VMI sections 8,9,10,16,17: https://www.vmi.lt/evmi/5725.
 * When annual income exceeds 42,500 EUR, no credit applies - use `calculateProgressiveTax` instead
 */
export function calculateIVGpm(annualIncome: number): { amount: number; percentage: number } {
  if (annualIncome > 42500) {
    throw new Error('Annual income exceeds 42,500 EUR');
  }

  if (annualIncome <= 0) {
    return { amount: 0, percentage: 0 };
  }

  // For income up to 42,500 EUR, apply credit formula
  const baseTax = annualIncome * 0.2;

  if (annualIncome <= 20000) {
    // When income ≤ 20,000: credit = income × 0.15, effective rate = 5%
    const credit = annualIncome * 0.15;
    const tax = baseTax - credit;
    return { amount: tax, percentage: 5 };
  }

  // When 20,000 < income ≤ 42,500:
  // Credit = income × (0.15 – 2/300,000 × (income – 20,000))
  const creditRate = 0.15 - (2 / 300000) * (annualIncome - 20000);
  const credit = annualIncome * creditRate;
  const tax = baseTax - credit;
  const percentage = (tax / annualIncome) * 100;

  return { amount: tax, percentage };
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

type KeysOfArrayTypes<T> = {
  [K in keyof T]: T[K] extends any[] ? K : T[K] extends readonly any[] ? K : never;
}[keyof T];

export type TaxRates = typeof taxRates | typeof mbTaxRates | typeof ivTaxRates;

// Helper function to calculate progressive tax for a monthly salary
export function calculateProgressiveTax(
  totalAnnual: number,
  monthlySalary: number,
  brackets: TaxRates[KeysOfArrayTypes<TaxRates>],
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
