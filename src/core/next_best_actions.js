import { formatBRL, MARKET_BENCHMARKS } from "./constants.js";

/**
 * Motor de Decisao Prescritivo: "O Que Eu Devo Fazer Agora?"
 * Gera de 3 a 5 acoes de maior impacto patrimonial e seguranca.
 */
export function generateNextBestActions({
  profile = {},
  accounts = [],
  creditCards = [],
  debts = [],
  goals = [],
  investments = [],
  healthScore = 75,
  monthlySummary = {},
}) {
  const actions = [];

  const netIncome = profile.netSalary || 3269;
  const emergencyGoal = goals.find((g) => g.type === "EMERGENCY_RESERVE");
  const houseGoal = goals.find((g) => g.type === "REAL_ESTATE_HOME");
  const carGoal = goals.find((g) => g.type === "VEHICLE_PURCHASE");

  // 1. Otimizacao dos Recursos Viacred (R$ 4.000 com baixa rentabilidade)
  const viacredAcc = accounts.find((a) => a.name.toLowerCase().includes("viacred") || a.name.toLowerCase().includes("veracredit"));
  const viacredBalance = viacredAcc ? viacredAcc.balance : (profile.viacredAmount || 4000);

  if (viacredBalance > 0) {
    const cdiYield = viacredBalance * (MARKET_BENCHMARKS.CDI_ANNUAL / 100) * 0.825; // Liq. IR
    const lowYield = viacredBalance * 0.03; // estimativa de retorno baixo atual
    const annualDifference = cdiYield - lowYield;

    actions.push({
      id: "action_viacred_migration",
      category: "INVESTMENT_OPTIMIZATION",
      priority: 1,
      urgency: "HIGH",
      badge: "Rentabilidade & Liquidez",
      badgeColor: "amber",
      title: `Migrar os ${formatBRL(viacredBalance)} da ViaCred/Veracredit para 100% CDI`,
      description: `Seu dinheiro esta com baixa rentabilidade e preso. Ao solicitar o resgate/encerramento e realocar em Tesouro Selic ou CDB 100% CDI com liquidez diaria, voce ganha seguranca imediata e maior retorno.`,
      impact: `+${formatBRL(annualDifference)} de ganho liquido estimado por ano com liquidez diaria imediata.`,
      consequenceOfInaction: `Perda de poder de compra contra a inflacao e indisponibilidade rapida do dinheiro em imprevistos.`,
      actionLabel: "Ver Comparador de Investimentos",
      targetTab: "investments",
    });
  }

  // 2. Fortalecimento da Reserva de Emergencia
  const emergencyCurrent = emergencyGoal ? emergencyGoal.currentAmount : 4000;
  const emergencyTarget = emergencyGoal ? emergencyGoal.targetAmount : 9780;
  const emergencyPct = emergencyTarget > 0 ? (emergencyCurrent / emergencyTarget) * 100 : 0;

  if (emergencyPct < 100) {
    const remaining = emergencyTarget - emergencyCurrent;
    const monthlyContribution = profile.monthlyInvestmentPlanned || 200;
    const monthsToComplete = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : 0;

    actions.push({
      id: "action_emergency_reserve",
      category: "SECURITY",
      priority: 2,
      urgency: emergencyPct < 50 ? "CRITICAL" : "MEDIUM",
      badge: "Blindagem Financeira",
      badgeColor: "emerald",
      title: `Aportar ${formatBRL(monthlyContribution)}/mes com foco em completar a Reserva de Seguranca`,
      description: `Sua reserva cobre atualmente ${(emergencyCurrent / (netIncome * 0.5)).toFixed(1)} meses de custos essenciais. O patamar ideal de tranquilidade para quem planeja financiar um imovel e de 6 meses.`,
      impact: `Faltam ${formatBRL(remaining)} para a blindagem total (${monthsToComplete} meses mantendo aporte de ${formatBRL(monthlyContribution)}).`,
      consequenceOfInaction: `Qualquer imprevisto com saude, veiculo ou trabalho forcara o uso de cartao de credito ou emprestimos com juros altos.`,
      actionLabel: "Acompanhar Meta de Seguranca",
      targetTab: "goals",
    });
  }

  // 3. Controle da Utilizacao de Limite de Cartao para Preservar Score Bancario
  let totalLimit = 0;
  let totalBill = 0;
  creditCards.forEach((c) => {
    totalLimit += c.limit;
    totalBill += c.currentBill;
  });

  const cardUsagePct = totalLimit > 0 ? (totalBill / totalLimit) * 100 : 0;
  if (cardUsagePct > 30) {
    actions.push({
      id: "action_card_limit_control",
      category: "CREDIT_SCORE",
      priority: 3,
      urgency: "HIGH",
      badge: "Protecao de Score",
      badgeColor: "rose",
      title: `Manter a fatura total abaixo de ${formatBRL(totalLimit * 0.3)} (30% do limite)`,
      description: `Atualmente o uso de cartao esta em ${cardUsagePct.toFixed(1)}% do limite. O algoritmo do Serasa e dos bancos (BB/Nubank) penaliza a pontuacao de score quando a utilizacao ultrapassa 30%.`,
      impact: `Evita queda de score e maximiza a probabilidade de aprovacao das melhores taxas de financiamento da Casa Propria.`,
      consequenceOfInaction: `Risco de juros maiores ou negativa na analise de credito habitacional.`,
      actionLabel: "Ver Limites de Cartao",
      targetTab: "credit",
    });
  } else {
    actions.push({
      id: "action_score_builder",
      category: "CREDIT_SCORE",
      priority: 4,
      urgency: "LOW",
      badge: "Construcao de Credito",
      badgeColor: "blue",
      title: `Manter pagamentos 100% em dia e relacionamento com BB e Nubank`,
      description: `Seu uso de credito esta controlado (${cardUsagePct.toFixed(1)}%). Continue concentrando contas em debito automatico e movimentando a conta para aumentar seu limite e score.`,
      impact: `Prepara seu perfil bancario para obter condicoes subsidiadas no financiamento da Casa Propria.`,
      consequenceOfInaction: `Falta de historico de credito robusto na hora de pleitear taxas reduzidas.`,
      actionLabel: "Ver Painel de Credito",
      targetTab: "credit",
    });
  }

  // 4. Simulacao de Aporte Acelerador para a Casa Propria
  if (houseGoal) {
    const currentAporte = profile.monthlyInvestmentPlanned || 200;
    const suggestedAporte = currentAporte + 100;
    actions.push({
      id: "action_boost_house_goal",
      category: "GOAL_ACCELERATION",
      priority: 3,
      urgency: "MEDIUM",
      badge: "Acelerador da Casa Propria",
      badgeColor: "cyan",
      title: `Aumentar aporte mensal de ${formatBRL(currentAporte)} para ${formatBRL(suggestedAporte)} (+R$ 100)`,
      description: `Identificamos que uma pequena economia em gastos variaveis ou delivery permite subir o aporte em R$ 100 mensais.`,
      impact: `Antecipa o atingimento da entrada da Casa Propria em aproximadamente 14 a 22 meses.`,
      consequenceOfInaction: `Adiamento do sonho da casa propria e maior gasto acumulado com aluguel.`,
      actionLabel: "Simular no 'E Se?'",
      targetTab: "scenarios",
    });
  }

  // 5. Alerta de Decisao: Troca da Biz por Carro (Custo de Oportunidade)
  if (carGoal) {
    actions.push({
      id: "action_vehicle_tco_alert",
      category: "DECISION_ALERT",
      priority: 5,
      urgency: "MEDIUM",
      badge: "Analise de Custo Real",
      badgeColor: "purple",
      title: `Avaliar o Custo Total de Propriedade (TCO) antes de trocar a Biz pelo Carro`,
      description: `Um automovel gera em media +R$ 500 a R$ 850/mes de custos fixos adicionais (combustivel, IPVA, seguro, manutencao), alem da parcela.`,
      impact: `Simular com clareza como esse custo adicional afeta sua capacidade de poupar para a Casa Propria.`,
      consequenceOfInaction: `Comprometimento do orcamento mensal com custos invisiveis do automovel.`,
      actionLabel: "Simular TCO Biz vs Carro",
      targetTab: "goals",
    });
  }

  // Ordena por prioridade
  actions.sort((a, b) => a.priority - b.priority);

  return actions.slice(0, 5);
}
