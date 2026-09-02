import { MARKET_BENCHMARKS } from "./constants.js";

/**
 * Simulador de Financiamento Habitacional e Planejamento da Casa Propria (SAC vs PRICE)
 */
export function simulateMortgage({
  propertyValue = 220000,
  minimumDownPaymentPct = 20, // 20% regra padrao Caixa / Bancos
  fgtsBalance = 12000,
  currentCashReserved = 8000,
  monthlySavingsForDownPayment = 300,
  yieldAnnualForSavings = MARKET_BENCHMARKS.CDI_ANNUAL,
  termYears = 30, // 360 meses
  annualMortgageInterestPct = MARKET_BENCHMARKS.DEFAULT_MORTGAGE_RATE_ANNUAL,
  monthlyNetIncome = 3269,
  maxIncomeCommitmentPct = 30, // Regra bancaria maxima de 30% da renda liquida
}) {
  const totalMonths = termYears * 12;
  const downPaymentNeeded = propertyValue * (minimumDownPaymentPct / 100);
  const totalCurrentDownPayment = fgtsBalance + currentCashReserved;
  const remainingDownPaymentToSave = Math.max(0, downPaymentNeeded - totalCurrentDownPayment);

  // Tempo para atingir a entrada necessaria considerando rendimento
  let monthsToDownPayment = 0;
  let simulatedSavings = currentCashReserved;
  const monthlySavingsYield = Math.pow(1 + (yieldAnnualForSavings * 0.85) / 100, 1 / 12) - 1;

  if (remainingDownPaymentToSave > 0 && monthlySavingsForDownPayment > 0) {
    while (simulatedSavings + fgtsBalance < downPaymentNeeded && monthsToDownPayment < 360) {
      simulatedSavings = (simulatedSavings * (1 + monthlySavingsYield)) + monthlySavingsForDownPayment;
      monthsToDownPayment++;
    }
  }

  const financedAmount = Math.max(0, propertyValue - downPaymentNeeded);
  const monthlyInterestRate = Math.pow(1 + annualMortgageInterestPct / 100, 1 / 12) - 1;

  // 1. Tabela SAC (Amortizacao Constante, Parcelas Decrescentes)
  const monthlyAmortizationSAC = financedAmount / totalMonths;
  const initialInstallmentSAC = monthlyAmortizationSAC + (financedAmount * monthlyInterestRate);
  const finalInstallmentSAC = monthlyAmortizationSAC + (monthlyAmortizationSAC * monthlyInterestRate);
  const totalInterestPaidSAC = ((initialInstallmentSAC + finalInstallmentSAC) / 2 * totalMonths) - financedAmount;
  const totalPaidSAC = financedAmount + totalInterestPaidSAC + downPaymentNeeded;

  // 2. Tabela PRICE (Parcelas Fixas)
  const i = monthlyInterestRate;
  const n = totalMonths;
  const fixedInstallmentPRICE = (financedAmount * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
  const totalInterestPaidPRICE = (fixedInstallmentPRICE * totalMonths) - financedAmount;
  const totalPaidPRICE = financedAmount + totalInterestPaidPRICE + downPaymentNeeded;

  // 3. Avaliacao de Capacidade de Pagamento
  const maxAllowedInstallment = monthlyNetIncome * (maxIncomeCommitmentPct / 100);
  const isSACViable = initialInstallmentSAC <= maxAllowedInstallment;
  const isPRICEViable = fixedInstallmentPRICE <= maxAllowedInstallment;

  return {
    propertyValue,
    minimumDownPaymentPct,
    downPaymentNeeded,
    fgtsBalance,
    currentCashReserved,
    totalCurrentDownPayment,
    remainingDownPaymentToSave,
    downPaymentProgressPct: +((totalCurrentDownPayment / downPaymentNeeded) * 100).toFixed(1),
    monthsToDownPayment,
    yearsToDownPayment: +(monthsToDownPayment / 12).toFixed(1),
    financedAmount,
    maxAllowedInstallment: Math.round(maxAllowedInstallment),
    sac: {
      initialInstallment: Math.round(initialInstallmentSAC),
      finalInstallment: Math.round(finalInstallmentSAC),
      totalInterestPaid: Math.round(totalInterestPaidSAC),
      totalPaid: Math.round(totalPaidSAC),
      isViable: isSACViable,
      incomeCommitmentInitialPct: +((initialInstallmentSAC / monthlyNetIncome) * 100).toFixed(1),
    },
    price: {
      fixedInstallment: Math.round(fixedInstallmentPRICE),
      totalInterestPaid: Math.round(totalInterestPaidPRICE),
      totalPaid: Math.round(totalPaidPRICE),
      isViable: isPRICEViable,
      incomeCommitmentPct: +((fixedInstallmentPRICE / monthlyNetIncome) * 100).toFixed(1),
    },
    sacSavingsVsPrice: Math.round(totalInterestPaidPRICE - totalInterestPaidSAC),
  };
}
