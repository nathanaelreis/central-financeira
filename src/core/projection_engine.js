import { MARKET_BENCHMARKS } from "./constants.js";

/**
 * Motor de Projecao Multidimensional de Fluxo de Caixa e Patrimonio (6, 12, 24, 36 e 60 meses)
 */
export function generateProjections({
  initialNetWorth = 18450,
  initialInvestments = 4850,
  monthlyNetSalary = 3269,
  monthlyEssentialExpenses = 1630,
  monthlyVariableExpenses = 817,
  monthlyPlannedInvestment = 200,
  annualInvestmentYieldPct = MARKET_BENCHMARKS.CDI_ANNUAL,
  annualInflationPct = MARKET_BENCHMARKS.IPCA_ANNUAL,

  // Variaveis de Cenario ("E Se?")
  scenarioSalaryIncrease = 0,
  scenarioExpenseCut = 0,
  scenarioOverrideAporte = null,
  scenarioYieldDeltaPct = 0,
  scenarioOneTimeExpense = 0,
  scenarioOneTimeExpenseMonth = 0,
  scenarioPauseInvestmentMonths = 0,
}) {
  const effectiveAporteBase = scenarioOverrideAporte !== null
    ? scenarioOverrideAporte
    : monthlyPlannedInvestment;

  const effectiveSalary = monthlyNetSalary + scenarioSalaryIncrease;
  const effectiveEssential = monthlyEssentialExpenses;
  const effectiveVariable = Math.max(0, monthlyVariableExpenses - scenarioExpenseCut);
  const effectiveYield = (annualInvestmentYieldPct + scenarioYieldDeltaPct) * 0.85; // Liquido de IR aprox.
  const monthlyYieldRate = Math.pow(1 + effectiveYield / 100, 1 / 12) - 1;

  let currentInvested = initialInvestments;
  let currentNetWorth = initialNetWorth;

  const months = [];
  const checkpoints = { m6: null, m12: null, m24: null, m36: null, m60: null };

  for (let m = 1; m <= 60; m++) {
    // Verifica se aporte esta pausado no cenario
    const isPaused = m <= scenarioPauseInvestmentMonths;
    const aporteThisMonth = isPaused ? 0 : effectiveAporteBase;

    // Rendimento dos investimentos
    const investmentReturn = currentInvested * monthlyYieldRate;
    currentInvested += investmentReturn + aporteThisMonth;

    // Fluxo do mes
    const totalExpenses = effectiveEssential + effectiveVariable;
    const freeCash = effectiveSalary - totalExpenses - aporteThisMonth;

    // Evento unico
    let oneTimeImpact = 0;
    if (scenarioOneTimeExpense > 0 && m === scenarioOneTimeExpenseMonth) {
      oneTimeImpact = scenarioOneTimeExpense;
      currentInvested = Math.max(0, currentInvested - oneTimeImpact);
    }

    currentNetWorth = (currentNetWorth - initialInvestments) + currentInvested + freeCash;

    // Renda passiva mensal gerada pela carteira
    const monthlyPassiveIncome = currentInvested * monthlyYieldRate;

    const record = {
      month: m,
      year: +(m / 12).toFixed(1),
      income: effectiveSalary,
      essentialExpenses: effectiveEssential,
      variableExpenses: effectiveVariable,
      totalExpenses,
      investedThisMonth: aporteThisMonth,
      investmentReturn: Math.round(investmentReturn),
      freeCash: Math.round(freeCash),
      totalInvestedAccumulated: Math.round(currentInvested),
      totalNetWorth: Math.round(currentNetWorth),
      monthlyPassiveIncome: Math.round(monthlyPassiveIncome),
      oneTimeImpact,
    };

    months.push(record);

    if (m === 6) checkpoints.m6 = record;
    if (m === 12) checkpoints.m12 = record;
    if (m === 24) checkpoints.m24 = record;
    if (m === 36) checkpoints.m36 = record;
    if (m === 60) checkpoints.m60 = record;
  }

  return {
    params: {
      effectiveSalary,
      effectiveEssential,
      effectiveVariable,
      effectiveAporteBase,
      effectiveYield,
    },
    checkpoints,
    months,
  };
}
