/**
 * Calculador do Indice de Saude Financeira (0 a 100 pontos)
 * Avalia de forma transparente 6 pilares cruciais.
 */
export function calculateFinancialHealth({
  netIncome = 3269,
  monthlyInvestments = 200,
  emergencyFundBalance = 4000,
  essentialMonthlyExpenses = 1630,
  totalMonthlyDebtInstallments = 0,
  totalCreditCardBills = 1000,
  totalCreditLimit = 4300,
  goalsOnTrackCount = 2,
  totalGoalsCount = 3,
  netWorthGrowthConsecutiveMonths = 3,
}) {
  const breakdown = {};

  // 1. Capacidade de Poupanca / Aporte (Max: 25 pts)
  // Alvo: >= 20% da renda liquida (25 pts), 10% (15 pts), 5% (7 pts), < 5% (0 pts)
  const savingsRatePct = netIncome > 0 ? (monthlyInvestments / netIncome) * 100 : 0;
  let savingsScore = 0;
  if (savingsRatePct >= 20) {
    savingsScore = 25;
  } else if (savingsRatePct >= 10) {
    savingsScore = 15 + ((savingsRatePct - 10) / 10) * 10;
  } else if (savingsRatePct >= 5) {
    savingsScore = 7 + ((savingsRatePct - 5) / 5) * 8;
  } else {
    savingsScore = (savingsRatePct / 5) * 7;
  }
  breakdown.savings = {
    score: Math.round(savingsScore),
    max: 25,
    title: "Capacidade de Poupanca / Investimento",
    value: `${savingsRatePct.toFixed(1)}% da renda liquida`,
    status: savingsScore >= 20 ? "excelente" : savingsScore >= 12 ? "moderado" : "alerta",
    feedback: savingsRatePct >= 15
      ? "Excelente disciplina de aportes mensais."
      : "Aumentar seu aporte para 15-20% acelerara drasticamente suas metas.",
  };

  // 2. Reserva de Emergencia (Max: 25 pts)
  // Alvo: >= 6 meses de despesas essenciais (25 pts), 3 meses (15 pts), 1 mes (5 pts)
  const monthsCovered = essentialMonthlyExpenses > 0
    ? emergencyFundBalance / essentialMonthlyExpenses
    : 0;
  let emergencyScore = 0;
  if (monthsCovered >= 6) {
    emergencyScore = 25;
  } else if (monthsCovered >= 3) {
    emergencyScore = 15 + ((monthsCovered - 3) / 3) * 10;
  } else if (monthsCovered >= 1) {
    emergencyScore = 5 + ((monthsCovered - 1) / 2) * 10;
  } else {
    emergencyScore = monthsCovered * 5;
  }
  breakdown.emergency = {
    score: Math.round(emergencyScore),
    max: 25,
    title: "Reserva de Seguranca / Emergencia",
    value: `${monthsCovered.toFixed(1)} meses de custos essenciais`,
    status: emergencyScore >= 20 ? "excelente" : emergencyScore >= 12 ? "moderado" : "alerta",
    feedback: monthsCovered >= 6
      ? "Reserva blindada com 6+ meses de cobertura."
      : `Voce possui ${monthsCovered.toFixed(1)} meses. Alvo recomendado: 6 meses (R$ ${(essentialMonthlyExpenses * 6).toFixed(0)}).`,
  };

  // 3. Nivel de Endividamento (Max: 20 pts)
  // Alvo: <= 10% da renda em parcelas (20 pts), 10-30% (10 pts), > 30% (0 pts)
  const debtRatioPct = netIncome > 0 ? (totalMonthlyDebtInstallments / netIncome) * 100 : 0;
  let debtScore = 0;
  if (debtRatioPct === 0) {
    debtScore = 20;
  } else if (debtRatioPct <= 10) {
    debtScore = 20 - (debtRatioPct / 10) * 5;
  } else if (debtRatioPct <= 30) {
    debtScore = 15 - ((debtRatioPct - 10) / 20) * 15;
  } else {
    debtScore = 0;
  }
  breakdown.debts = {
    score: Math.round(debtScore),
    max: 20,
    title: "Comprometimento com Dividas / Financiamentos",
    value: `${debtRatioPct.toFixed(1)}% da renda gasta em parcelas`,
    status: debtScore >= 15 ? "excelente" : debtScore >= 8 ? "moderado" : "alerta",
    feedback: debtRatioPct === 0
      ? "Zero dividas ativas. Maxima capacidade de direcionamento de renda."
      : `Parcelas consom ${debtRatioPct.toFixed(1)}% da renda. Manter abaixo de 20% para viabilizar financiamento imobiliario.`,
  };

  // 4. Utilizacao de Cartao de Credito (Max: 10 pts)
  // Alvo: <= 30% do limite total (10 pts), 30-50% (7 pts), 50-80% (3 pts), > 80% (0 pts)
  const cardUtilizationPct = totalCreditLimit > 0 ? (totalCreditCardBills / totalCreditLimit) * 100 : 0;
  let cardScore = 0;
  if (cardUtilizationPct <= 30) {
    cardScore = 10;
  } else if (cardUtilizationPct <= 50) {
    cardScore = 7;
  } else if (cardUtilizationPct <= 80) {
    cardScore = 3;
  } else {
    cardScore = 0;
  }
  breakdown.credit = {
    score: Math.round(cardScore),
    max: 10,
    title: "Uso do Limite de Cartao e Score",
    value: `${cardUtilizationPct.toFixed(1)}% do limite total utilizado`,
    status: cardScore >= 8 ? "excelente" : cardScore >= 5 ? "moderado" : "alerta",
    feedback: cardUtilizationPct <= 30
      ? "Utilizacao ideal (<30%), fator excelente para pontuacao de score bancario."
      : "Uso de cartao elevado (>30%). Pode impactar a avaliacao de risco de credito.",
  };

  // 5. Progresso das Metas (Max: 10 pts)
  const goalsRatio = totalGoalsCount > 0 ? goalsOnTrackCount / totalGoalsCount : 1;
  const goalsScore = Math.round(goalsRatio * 10);
  breakdown.goals = {
    score: goalsScore,
    max: 10,
    title: "Aderencia e Progresso das Metas",
    value: `${goalsOnTrackCount} de ${totalGoalsCount} metas em dia`,
    status: goalsScore >= 8 ? "excelente" : goalsScore >= 5 ? "moderado" : "alerta",
    feedback: goalsRatio >= 0.8
      ? "Suas metas principais estao recebendo aportes consistentes."
      : "Ha metas com aportes atrasados ou sem cronograma definido.",
  };

  // 6. Crescimento Patrimonial Recente (Max: 10 pts)
  const growthScore = Math.min(10, Math.max(0, netWorthGrowthConsecutiveMonths * 3.33));
  breakdown.growth = {
    score: Math.round(growthScore),
    max: 10,
    title: "Consistencia de Crescimento Patrimonial",
    value: `${netWorthGrowthConsecutiveMonths} meses consecutivos de alta`,
    status: growthScore >= 8 ? "excelente" : growthScore >= 5 ? "moderado" : "alerta",
    feedback: netWorthGrowthConsecutiveMonths >= 3
      ? "Tendencia patrimonial claramente ascendente."
      : "Construindo historico de evolucao patrimonial positiva.",
  };

  // Pontuacao Total
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      breakdown.savings.score +
      breakdown.emergency.score +
      breakdown.debts.score +
      breakdown.credit.score +
      breakdown.goals.score +
      breakdown.growth.score
    )
  );

  let rating = "Excelente";
  let ratingColor = "text-emerald-400";
  let ratingBg = "bg-emerald-500/10 border-emerald-500/30";

  if (totalScore < 50) {
    rating = "Critica";
    ratingColor = "text-rose-400";
    ratingBg = "bg-rose-500/10 border-rose-500/30";
  } else if (totalScore < 70) {
    rating = "Atencao";
    ratingColor = "text-amber-400";
    ratingBg = "bg-amber-500/10 border-amber-500/30";
  } else if (totalScore < 85) {
    rating = "Boa";
    ratingColor = "text-blue-400";
    ratingBg = "bg-blue-500/10 border-blue-500/30";
  }

  return {
    totalScore,
    rating,
    ratingColor,
    ratingBg,
    breakdown,
    monthsCovered: +monthsCovered.toFixed(1),
    savingsRatePct: +savingsRatePct.toFixed(1),
    cardUtilizationPct: +cardUtilizationPct.toFixed(1),
    debtRatioPct: +debtRatioPct.toFixed(1),
  };
}
