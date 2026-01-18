// Vidutinis darbo užmokestis Lietuvoje 2026 m.
export const VDU = {
  2025: 2108.88,
  2026: 2312.15,
};

// Minimali mėnesinės alga Lietuvoje
export const MMA = {
  2025: 1038,
  2026: 1153,
};

export const MB_INCOME_LIMIT_PER_YEAR = 100000;

export type Year = keyof typeof MMA;

function getGpmRates<InitialThreshold extends number>(year: Year, initialThreshold: InitialThreshold) {
  const gpmRates = {
    2025: [
      { threshold: initialThreshold, rate: 0.2 },
      // This is just to keep the same number of items in the array as in 2026 and make types easier to work with
      { threshold: VDU[year] * 60, rate: 0.32 },
      { threshold: VDU[year] * 60, rate: 0.32 },
    ],
    2026: [
      { threshold: initialThreshold, rate: 0.2 },
      { threshold: VDU[year] * 36, rate: 0.25 },
      { threshold: VDU[year] * 60, rate: 0.32 },
    ],
  } as const satisfies Record<Year, TaxBracket>;
  return gpmRates[year];
}

export const yearlyTaxRates = {
  2025: {
    gpmBase: 1,
    sodraBase: 1,
    // Gyventojų pajamų mokestis
    gpm: getGpmRates(2025, 0),
    // Valstybinio socialinio draudimo įmokos
    vsd: [
      { threshold: 0, rate: 0.1252 },
      { threshold: VDU[2025] * 60, rate: 0 },
    ],
    // Privalomojo sveikatos draudimo įmokos
    psd: [{ threshold: 0, rate: 0.0698 }],
    // Neapmokestinamas pajamų dydis
    npdBase: 747,
    getNpd(monthlyIncome: number) {
      if (monthlyIncome <= MMA[2025]) {
        return this.npdBase;
      }
      if (monthlyIncome < 2387.29) {
        return Math.max(0, this.npdBase - 0.49 * (monthlyIncome - MMA[2025]));
      }
      if (monthlyIncome < 2864.22) {
        return Math.max(0, 400 - 0.18 * (monthlyIncome - 642));
      }
      return 0;
    },
  },
  2026: {
    gpmBase: 1,
    sodraBase: 1,
    // Gyventojų pajamų mokestis
    gpm: getGpmRates(2026, 0),
    // Valstybinio socialinio draudimo įmokos
    vsd: [
      { threshold: 0, rate: 0.1252 },
      { threshold: VDU[2026] * 60, rate: 0 },
    ],
    // Privalomojo sveikatos draudimo įmokos
    psd: [{ threshold: 0, rate: 0.0698 }],
    // Neapmokestinamas pajamų dydis.
    npdBase: 747,
    getNpd(monthlyIncome: number) {
      if (monthlyIncome <= MMA[2026]) {
        return this.npdBase;
      }
      if (monthlyIncome < 2677.49) {
        return Math.max(0, this.npdBase - 0.49 * (monthlyIncome - MMA[2026]));
      }
      return 0;
    },
  },
} as const satisfies Record<Year, TaxRateShape>;

export const ivYearlyTaxRates = {
  2025: {
    ...yearlyTaxRates[2025],
    npdBase: 0,
    // GPM is calculated on taxable income (70% of total income - 30% expense deduction)
    // VSD/PSD is calculated on 90% of taxable income
    // Source: https://sodra.lt/imoku-tarifai/imoku-tarifai-taikomi-savarankiskai-dirbantiems-asmenims
    gpmBase: 0.7,
    sodraBase: 0.7 * 0.9,
  },
  2026: {
    ...yearlyTaxRates[2026],
    npdBase: 0,
    // GPM is calculated on taxable income (70% of total income - 30% expense deduction)
    // VSD/PSD is calculated on 90% of taxable income
    // Source: https://sodra.lt/imoku-tarifai/imoku-tarifai-taikomi-savarankiskai-dirbantiems-asmenims
    gpmBase: 0.7,
    sodraBase: 0.7 * 0.9,
  },
} as const satisfies Record<Year, TaxRateShape>;

export const mbYearlyTaxRates = {
  2025: {
    ...yearlyTaxRates[2025],
    npdBase: 0,
    gpm: [{ threshold: 0, rate: 0.15 }, ...getGpmRates(2025, VDU[2025] * 12)],
  },
  2026: {
    ...yearlyTaxRates[2026],
    npdBase: 0,
    gpm: [{ threshold: 0, rate: 0.15 }, ...getGpmRates(2026, VDU[2026] * 12)],
  },
} as const satisfies Record<Year, TaxRateShape>;

export type TaxRates =
  | (typeof yearlyTaxRates)[Year]
  | (typeof mbYearlyTaxRates)[Year]
  | (typeof ivYearlyTaxRates)[Year];

type TaxBracket = { threshold: number; rate: number }[];
type TaxRateShape = {
  gpmBase: number;
  sodraBase: number;
  gpm: TaxBracket;
  vsd: TaxBracket;
  psd: TaxBracket;
  npdBase: number;
  getNpd(monthlyIncome: number): number;
};

interface Tax {
  amount: number;
  percentage: number;
}

export interface MonthlyIncomeCalculations {
  totalAnnualBeforeTaxes: number;
  totalMonthlyAfterTaxes: number;
  taxes: { gpm: Tax; vsd: Tax; psd: Tax; total: Tax };
  npd: number;
}

export interface IncomeTotalTaxes {
  gpm: Tax;
  vsd: Tax;
  psd: Tax;
  total: Tax;
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
  pensionAccumulation: boolean; // Papildomas kaupimas pensijai 3%
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

// Helper function to calculate progressive tax for a monthly salary
export function calculateProgressiveTax(totalAnnual: number, monthlySalary: number, brackets: TaxBracket) {
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

export function calculateSourceTaxes({ monthlySalary, taxRates, withSodra, ...opts }: CalculateSourceTaxesOptions) {
  const results: MonthlyIncomeCalculations[] = [];
  const totals: IncomeTotalTaxes = {
    gpm: { amount: 0, percentage: 0 },
    vsd: { amount: 0, percentage: 0 },
    psd: { amount: 0, percentage: 0 },
    total: { amount: 0, percentage: 0 },
    salaryBeforeTaxes: 0,
    salaryAfterTaxes: 0,
  };
  let totalAnnual = 0;
  let totalAnnualTaxable = 0;
  let totalSodraTaxable = 0;

  for (let month = 1; month <= 12; month++) {
    const npd = taxRates.getNpd(monthlySalary);
    const monthlyTaxableIncome = Math.max(0, monthlySalary * taxRates.gpmBase - npd);
    totalAnnual = totalAnnual + monthlySalary;
    totalAnnualTaxable = totalAnnualTaxable + monthlyTaxableIncome;

    const totalAnnualForGPM = totalAnnualTaxable + (opts.additionalForGPM ?? 0);
    const gpmTax = opts.gpmOverride ?? calculateProgressiveTax(totalAnnualForGPM, monthlyTaxableIncome, taxRates.gpm);

    const sodraTaxableIncome = monthlySalary * taxRates.sodraBase;
    totalSodraTaxable = totalSodraTaxable + sodraTaxableIncome;

    const totalAnnualForSodra = totalSodraTaxable + (opts.additionalForSodra ?? 0);
    const vsdTax = withSodra
      ? calculateProgressiveTax(totalAnnualForSodra, sodraTaxableIncome, taxRates.vsd)
      : { amount: 0, percentage: 0 };

    if (withSodra && opts.pensionAccumulation) {
      const extraPensionAmount = sodraTaxableIncome * 0.03;
      vsdTax.amount += extraPensionAmount;
      if (sodraTaxableIncome > 0) {
        vsdTax.percentage = (vsdTax.amount / sodraTaxableIncome) * 100;
      }
    }

    const psdTax = withSodra
      ? calculateProgressiveTax(totalAnnualForSodra, sodraTaxableIncome, taxRates.psd)
      : { amount: 0, percentage: 0 };

    const totalMonthlyTaxes = gpmTax.amount + vsdTax.amount + psdTax.amount;
    const afterTaxes = monthlySalary - totalMonthlyTaxes;

    totals.gpm.amount += gpmTax.amount;
    totals.vsd.amount += vsdTax.amount;
    totals.psd.amount += psdTax.amount;
    totals.salaryAfterTaxes += afterTaxes;
    totals.total.amount += totalMonthlyTaxes;

    results.push({
      totalAnnualBeforeTaxes: totalAnnual,
      totalMonthlyAfterTaxes: afterTaxes,
      npd,
      taxes: {
        gpm: gpmTax,
        vsd: vsdTax,
        psd: psdTax,
        total: {
          amount: totalMonthlyTaxes,
          percentage: monthlySalary ? (totalMonthlyTaxes / monthlySalary) * 100 : 0,
        },
      },
    });
  }

  totals.salaryBeforeTaxes = totalAnnual;
  totals.total.percentage = totalAnnual > 0 ? (totals.total.amount * 100) / totalAnnual : 0;
  totals.gpm.percentage = totalAnnualTaxable > 0 ? (totals.gpm.amount * 100) / totalAnnualTaxable : 0;
  totals.vsd.percentage = totalSodraTaxable > 0 ? (totals.vsd.amount * 100) / totalSodraTaxable : 0;
  totals.psd.percentage = totalSodraTaxable > 0 ? (totals.psd.amount * 100) / totalSodraTaxable : 0;

  return { results, totals };
}

interface CalculateSourceTaxesOptions {
  monthlySalary: number;
  taxRates: TaxRates;
  additionalForGPM?: number;
  additionalForSodra?: number;
  gpmOverride?: { amount: number; percentage: number };
  withSodra?: boolean;
  pensionAccumulation?: boolean;
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString('lt-LT', { style: 'currency', currency: 'EUR' });
}

export function formatPercent(amount: number) {
  return (amount / 100).toLocaleString('lt-LT', { style: 'percent', minimumFractionDigits: 2 });
}

// Custom event for tax calculations completed
export const TAX_CALCULATION_EVENT = 'tax-calculation-complete';

export interface TaxCalculationEventDetail {
  id: string;
  totals: IncomeTotalTaxes;
}

declare global {
  interface DocumentEventMap {
    [TAX_CALCULATION_EVENT]: CustomEvent<TaxCalculationEventDetail>;
  }
}
