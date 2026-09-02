import { IR_REGRESSIVE_RATES, MARKET_BENCHMARKS } from "./constants.js";

/**
 * Retorna a aliquota de IR com base no prazo em dias
 */
export function getTaxRate(days) {
  for (const bracket of IR_REGRESSIVE_RATES) {
    if (days <= bracket.maxDays) {
      return bracket.rate;
    }
  }
  return 0.15;
}

/**
 * Calcula a evolucao mes a mes e ano a ano de juros compostos
 */
export function calculateCompoundInterest({
  initialAmount = 0,
  monthlyContribution = 0,
  annualRatePct = MARKET_BENCHMARKS.CDI_ANNUAL,
  years = 5,
  isTaxExempt = false,
  inflationAnnualPct = MARKET_BENCHMARKS.IPCA_ANNUAL,
}) {
  const totalMonths = Math.round(years * 12);
  const monthlyRate = Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + inflationAnnualPct / 100, 1 / 12) - 1;

  let currentBalance = initialAmount;
  let totalInvested = initialAmount;
  let totalInterestGross = 0;

  const monthlyHistory = [];
  const yearlyHistory = [];
  let inflectionMonth = null;

  for (let m = 1; m <= totalMonths; m++) {
    const interestThisMonth = currentBalance * monthlyRate;
    totalInterestGross += interestThisMonth;
    currentBalance += interestThisMonth + monthlyContribution;
    totalInvested += monthlyContribution;

    const days = m * 30;
    const taxRate = isTaxExempt ? 0 : getTaxRate(days);
    const taxDue = totalInterestGross * taxRate;
    const netBalance = currentBalance - taxDue;

    // Ajuste pela inflacao para poder de compra real
    const inflationFactor = Math.pow(1 + monthlyInflation, m);
    const realNetBalance = netBalance / inflationFactor;

    // Detecta ponto de inflexao: quando os juros mensais superam o aporte mensal
    if (monthlyContribution > 0 && interestThisMonth >= monthlyContribution && inflectionMonth === null) {
      inflectionMonth = m;
    }

    const monthData = {
      month: m,
      year: +(m / 12).toFixed(1),
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalInterestGross: Math.round(totalInterestGross * 100) / 100,
      taxDue: Math.round(taxDue * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      realNetBalance: Math.round(realNetBalance * 100) / 100,
      monthlyInterest: Math.round(interestThisMonth * 100) / 100,
      taxRatePct: +(taxRate * 100).toFixed(1),
    };

    monthlyHistory.push(monthData);

    if (m % 12 === 0 || m === totalMonths) {
      yearlyHistory.push({
        year: m / 12,
        ...monthData,
      });
    }
  }

  const finalData = monthlyHistory[monthlyHistory.length - 1];

  return {
    totalMonths,
    years,
    annualRatePct,
    initialAmount,
    monthlyContribution,
    finalInvested: finalData.totalInvested,
    finalGrossInterest: finalData.totalInterestGross,
    finalTax: finalData.taxDue,
    finalNetBalance: finalData.netBalance,
    finalRealNetBalance: finalData.realNetBalance,
    effectiveNetYieldPct: +(((finalData.netBalance / finalData.totalInvested) - 1) * 100).toFixed(2),
    inflectionMonth,
    inflectionYears: inflectionMonth ? +(inflectionMonth / 12).toFixed(1) : null,
    monthlyHistory,
    yearlyHistory,
  };
}

/**
 * Compara produtos financeiros padrao (CDB 100% CDI, CDB 110% CDI, Tesouro Selic, LCI/LCA 90% CDI, Poupanca)
 */
export function compareInvestmentProducts({
  initialAmount = 4000,
  monthlyContribution = 200,
  years = 5,
  cdiRate = MARKET_BENCHMARKS.CDI_ANNUAL,
  selicRate = MARKET_BENCHMARKS.SELIC_ANNUAL,
  savingsRate = MARKET_BENCHMARKS.SAVINGS_ANNUAL,
}) {
  const products = [
    {
      id: "cdb_100_cdi",
      name: "CDB 100% CDI (ex: Nubank Caixinhas)",
      type: "CDB",
      grossAnnualRate: cdiRate * 1.0,
      isTaxExempt: false,
      liquidity: "Diaria",
      fringeBenefit: "Garantia FGC ate R$ 250 mil",
    },
    {
      id: "cdb_110_cdi",
      name: "CDB 110% CDI (ex: Promocional Banco Medio)",
      type: "CDB",
      grossAnnualRate: cdiRate * 1.1,
      isTaxExempt: false,
      liquidity: "Diaria / 1 ano",
      fringeBenefit: "Garantia FGC ate R$ 250 mil",
    },
    {
      id: "tesouro_selic",
      name: "Tesouro Selic (Tesouro Direto)",
      type: "Titulo Publico",
      grossAnnualRate: selicRate + 0.05,
      isTaxExempt: false,
      liquidity: "D+1 (Soberana)",
      fringeBenefit: "Risco Soberano do Tesouro Nacional",
    },
    {
      id: "lci_lca_90",
      name: "LCI / LCA 90% do CDI (Isenta de IR)",
      type: "LCI/LCA",
      grossAnnualRate: cdiRate * 0.9,
      isTaxExempt: true,
      liquidity: "9 meses / 1 ano",
      fringeBenefit: "100% Isento de IR + FGC",
    },
    {
      id: "poupanca",
      name: "Poupanca Tradicional (Referencia)",
      type: "Poupanca",
      grossAnnualRate: savingsRate,
      isTaxExempt: true,
      liquidity: "Mensal (Aniversario)",
      fringeBenefit: "Baixa Rentabilidade Historica",
    },
  ];

  const results = products.map((prod) => {
    const sim = calculateCompoundInterest({
      initialAmount,
      monthlyContribution,
      annualRatePct: prod.grossAnnualRate,
      years,
      isTaxExempt: prod.isTaxExempt,
    });

    return {
      product: prod,
      simulation: sim,
      finalNet: sim.finalNetBalance,
      netGain: sim.finalNetBalance - sim.finalInvested,
    };
  });

  // Ordena por maior valor liquido final
  results.sort((a, b) => b.finalNet - a.finalNet);

  const bestOption = results[0];
  const benchmarkPoupanca = results.find((r) => r.product.id === "poupanca");
  const differenceVsPoupanca = benchmarkPoupanca
    ? bestOption.finalNet - benchmarkPoupanca.finalNet
    : 0;

  return {
    initialAmount,
    monthlyContribution,
    years,
    bestOption,
    differenceVsPoupanca,
    results,
  };
}
