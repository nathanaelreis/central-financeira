import { formatBRL, formatPct, BUCKETS } from "../../core/constants.js";

export function renderDashboardView(state, healthScoreData, nextBestActions, onNavigate, onOpenModal, onEditAccount) {
  const container = document.createElement("div");
  container.className = "space-y-6 animate-fade-in";

  // 1. Calculo de Balancos e Totais
  let liquidCash = 0;
  let totalInvestments = 0;
  let totalAssets = 0;
  let totalLiabilities = 0;

  state.accounts.forEach((acc) => {
    if (acc.type === "CHECKING" || acc.type === "CASH" || acc.type === "SAVINGS") {
      liquidCash += acc.balance;
    }
  });

  state.investments.forEach((inv) => {
    totalInvestments += inv.currentBalance;
  });

  // Outros bens (Biz e FGTS)
  const fgts = state.profile.fgtsBalance || 0;
  const bizValue = state.profile.bizFipeValue || 0;

  totalAssets = liquidCash + totalInvestments + fgts + bizValue;

  // Passivos (Faturas em aberto + Dividas)
  let cardDebt = 0;
  state.creditCards.forEach((c) => (cardDebt += c.currentBill));
  let loansDebt = 0;
  state.debts.forEach((d) => (loansDebt += d.totalBalanceDue));
  totalLiabilities = cardDebt + loansDebt;

  const netWorth = totalAssets - totalLiabilities;

  // Calculo de Fluxo do Mes Atual
  const netIncome = state.profile.netSalary || 0;
  let realizedExpensesEssential = 0;
  let realizedExpensesVariable = 0;
  let realizedInvestments = 0;

  state.transactions.forEach((tx) => {
    if (tx.type === "EXPENSE_ESSENTIAL") realizedExpensesEssential += tx.amount;
    if (tx.type === "EXPENSE_VARIABLE") realizedExpensesVariable += tx.amount;
    if (tx.type === "INVESTMENT_DEPOSIT") realizedInvestments += tx.amount;
  });

  const totalSpent = realizedExpensesEssential + realizedExpensesVariable;
  const currentMonthLeft = netIncome - totalSpent - realizedInvestments;

  // Metas Principais
  const emergencyGoal = state.goals.find((g) => g.type === "EMERGENCY_RESERVE");
  const houseGoal = state.goals.find((g) => g.type === "REAL_ESTATE_HOME");
  const carGoal = state.goals.find((g) => g.type === "VEHICLE_PURCHASE");

  const emergencyMonths = realizedExpensesEssential > 0
    ? (totalInvestments / (realizedExpensesEssential * (30 / Math.max(1, new Date().getDate())) || 1630)).toFixed(1)
    : (netIncome > 0 ? (totalInvestments / (netIncome * 0.5)).toFixed(1) : "0.0");

  const houseProgressPct = houseGoal && houseGoal.targetAmount > 0
    ? Math.min(100, Math.round(((houseGoal.currentAmount + fgts) / houseGoal.targetAmount) * 100))
    : 0;

  // Renda Passiva Estimada (~0.75% a.m. do capital investido liquido)
  const passiveIncomeMonthly = totalInvestments * 0.0075;

  container.innerHTML = `
    <!-- Top Action Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div class="flex items-center gap-2">
        <span class="text-lg">⚡</span>
        <span class="text-xs font-bold text-white uppercase tracking-wider">Gestão Rápida:</span>
      </div>
      <div class="flex items-center flex-wrap gap-2">
        <button id="btn-dash-edit-salary" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
          ✏️ Renda: <strong class="text-emerald-400 font-bold">${formatBRL(netIncome)}</strong>
        </button>
        <button id="btn-dash-add-acc" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition">
          + Nova Conta
        </button>
        <button id="btn-dash-add-inv" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition">
          + Novo Investimento
        </button>
        <button id="btn-dash-add-goal" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition">
          + Nova Meta
        </button>
      </div>
    </div>

    <!-- Top Executive Cockpit Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Patrimonio Liquido -->
      <div class="p-4 lg:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Patrimônio Líquido</span>
          <span class="text-lg">💰</span>
        </div>
        <div class="text-xl lg:text-2xl font-black text-white tracking-tight">
          ${formatBRL(netWorth)}
        </div>
        <div class="flex items-center gap-2 mt-2 text-xs">
          <span class="text-emerald-400 font-bold">▲ Ativos: ${formatBRL(totalAssets)}</span>
          <span class="text-slate-500">•</span>
          <span class="text-rose-400">Passivos: ${formatBRL(totalLiabilities)}</span>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      </div>

      <!-- Card 2: Saldo Disponivel & Investimentos -->
      <div class="p-4 lg:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Investimentos & Caixas</span>
          <span class="text-lg">📈</span>
        </div>
        <div class="text-xl lg:text-2xl font-black text-cyan-400 tracking-tight">
          ${formatBRL(totalInvestments)}
        </div>
        <div class="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <span>Saldo em Contas: <strong class="text-white">${formatBRL(liquidCash)}</strong></span>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
      </div>

      <!-- Card 3: Reserva de Emergencia -->
      <div class="p-4 lg:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Reserva de Segurança</span>
          <span class="text-lg">🛡</span>
        </div>
        <div class="text-xl lg:text-2xl font-black text-emerald-400 tracking-tight flex items-baseline gap-1.5">
          <span>${emergencyMonths}</span>
          <span class="text-xs font-normal text-slate-400">meses cobertos</span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          Meta: <strong>6 meses</strong> (${formatBRL(netIncome * 3 || 9780)})
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
      </div>

      <!-- Card 4: Renda Passiva Estimada -->
      <div class="p-4 lg:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Renda Passiva</span>
          <span class="text-lg">⚡</span>
        </div>
        <div class="text-xl lg:text-2xl font-black text-purple-400 tracking-tight">
          ${formatBRL(passiveIncomeMonthly)}<span class="text-xs text-slate-400 font-normal">/mês</span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          Degrau 1 (R$ 100/mês): <strong class="text-purple-300">${Math.min(100, Math.round((passiveIncomeMonthly / 100) * 100))}%</strong>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </div>
    </div>

    <!-- Contas Cadastradas & Carteiras -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-base">🏦</span>
          <h3 class="text-sm font-bold text-white">Minhas Contas e Carteiras</h3>
          <span class="text-xs text-slate-400">(${state.accounts.length} cadastradas)</span>
        </div>
        <button id="btn-add-account-list" class="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
          + Adicionar Conta
        </button>
      </div>

      ${state.accounts.length === 0 ? `
        <div class="text-center py-6 border border-dashed border-slate-800 rounded-xl">
          <p class="text-xs text-slate-400 mb-3">Nenhuma conta cadastrada ainda.</p>
          <button id="btn-add-account-empty" class="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950">
            Adicionar Minha Primeira Conta
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${state.accounts.map((acc) => `
            <div class="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl flex items-center justify-between hover:border-slate-600 transition group">
              <div>
                <strong class="text-xs font-bold text-white block">${acc.name}</strong>
                <span class="text-[11px] text-slate-400">${acc.institution}</span>
                <div class="text-sm font-black text-emerald-400 mt-1">${formatBRL(acc.balance)}</div>
              </div>
              <button data-acc-id="${acc.id}" class="btn-edit-account opacity-70 group-hover:opacity-100 p-1.5 text-xs text-slate-400 hover:text-white bg-slate-700 rounded-lg transition" title="Editar Saldo/Nome">
                ✏️
              </button>
            </div>
          `).join("")}
        </div>
      `}
    </div>

    <!-- MAIN DIFFERENTIATOR: O Que Eu Devo Fazer Agora? -->
    <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800/80 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
            🚀
          </div>
          <div>
            <h2 class="text-lg font-bold text-white tracking-tight">O QUE EU DEVO FAZER AGORA?</h2>
            <p class="text-xs text-slate-400">Ações prioritárias de maior impacto patrimonial baseadas no seu momento</p>
          </div>
        </div>
        <span class="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 self-start sm:self-auto">
          Recomendações Ativas
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        ${nextBestActions.map((action, idx) => `
          <div class="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between hover:border-slate-600 transition group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-${action.badgeColor}-500/20 text-${action.badgeColor}-400 border border-${action.badgeColor}-500/30">
                  Prioridade #${idx + 1} • ${action.badge}
                </span>
              </div>
              <h3 class="text-sm font-bold text-white group-hover:text-emerald-400 transition leading-snug mb-2">
                ${action.title}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed mb-3">
                ${action.description}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-700/50 space-y-2">
              <div class="text-[11px] p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                <strong>Impacto:</strong> ${action.impact}
              </div>
              <button data-target-tab="${action.targetTab}" class="btn-action-jump w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-1.5 transition">
                <span>${action.actionLabel}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Visual 4-Bucket Financial Architecture Flow -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 class="text-base font-bold text-white">Arquitetura de Fluxo Financeiro (Os 4 Baldes)</h3>
          <p class="text-xs text-slate-400">Renda Líquida Mensal: <strong class="text-white">${formatBRL(netIncome)}</strong></p>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1 text-slate-300"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Essencial</span>
          <span class="flex items-center gap-1 text-slate-300"><span class="w-2 h-2 rounded-full bg-purple-500"></span> Estilo de Vida</span>
          <span class="flex items-center gap-1 text-slate-300"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Segurança</span>
          <span class="flex items-center gap-1 text-slate-300"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Metas</span>
        </div>
      </div>

      <!-- Flow Bar Breakdown -->
      <div class="w-full h-7 rounded-xl bg-slate-800 p-1 flex gap-1 overflow-hidden">
        <div style="width: ${netIncome > 0 ? (realizedExpensesEssential / netIncome) * 100 : 0}%" title="Essencial: ${formatBRL(realizedExpensesEssential)}" class="bg-blue-500 rounded-lg transition-all"></div>
        <div style="width: ${netIncome > 0 ? (realizedExpensesVariable / netIncome) * 100 : 0}%" title="Variável: ${formatBRL(realizedExpensesVariable)}" class="bg-purple-500 rounded-lg transition-all"></div>
        <div style="width: ${netIncome > 0 ? (realizedInvestments / netIncome) * 100 : 0}%" title="Investimentos: ${formatBRL(realizedInvestments)}" class="bg-emerald-500 rounded-lg transition-all"></div>
        <div style="width: ${netIncome > 0 ? Math.max(0, (currentMonthLeft / netIncome) * 100) : 0}%" title="Sobra Livre: ${formatBRL(currentMonthLeft)}" class="bg-teal-500/40 rounded-lg transition-all border border-dashed border-teal-400/40"></div>
      </div>

      <!-- Flow Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
        <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <span class="text-blue-400 block font-semibold">1. Viver (Essencial)</span>
          <strong class="text-sm font-bold text-white block mt-0.5">${formatBRL(realizedExpensesEssential)}</strong>
          <span class="text-[11px] text-slate-400">${netIncome > 0 ? ((realizedExpensesEssential / netIncome) * 100).toFixed(0) : 0}% da renda</span>
        </div>
        <div class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span class="text-purple-400 block font-semibold">2. Viver (Estilo de Vida)</span>
          <strong class="text-sm font-bold text-white block mt-0.5">${formatBRL(realizedExpensesVariable)}</strong>
          <span class="text-[11px] text-slate-400">${netIncome > 0 ? ((realizedExpensesVariable / netIncome) * 100).toFixed(0) : 0}% da renda</span>
        </div>
        <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span class="text-emerald-400 block font-semibold">3. Segurança & Metas</span>
          <strong class="text-sm font-bold text-white block mt-0.5">${formatBRL(realizedInvestments)}</strong>
          <span class="text-[11px] text-slate-400">${netIncome > 0 ? ((realizedInvestments / netIncome) * 100).toFixed(0) : 0}% da renda</span>
        </div>
        <div class="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <span class="text-teal-400 block font-semibold">4. Saldo Projetado / Sobra</span>
          <strong class="text-sm font-bold ${currentMonthLeft >= 0 ? 'text-teal-300' : 'text-rose-400'} block mt-0.5">
            ${formatBRL(currentMonthLeft)}
          </strong>
          <span class="text-[11px] text-slate-400">${currentMonthLeft >= 0 ? 'Disponível para reforço' : 'Déficit orçamentário'}</span>
        </div>
      </div>
    </div>
  `;

  // Bind tab switching
  container.querySelectorAll(".btn-action-jump").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target-tab");
      if (target && onNavigate) onNavigate(target);
    });
  });

  // Toolbar Actions
  container.querySelector("#btn-dash-edit-salary")?.addEventListener("click", () => onOpenModal("profile"));
  container.querySelector("#btn-dash-add-acc")?.addEventListener("click", () => onOpenModal("new_account"));
  container.querySelector("#btn-add-account-list")?.addEventListener("click", () => onOpenModal("new_account"));
  container.querySelector("#btn-add-account-empty")?.addEventListener("click", () => onOpenModal("new_account"));
  container.querySelector("#btn-dash-add-inv")?.addEventListener("click", () => onOpenModal("new_investment"));
  container.querySelector("#btn-dash-add-goal")?.addEventListener("click", () => onOpenModal("new_goal"));

  // Edit Account triggers
  container.querySelectorAll(".btn-edit-account").forEach((btn) => {
    btn.addEventListener("click", () => {
      const accId = btn.getAttribute("data-acc-id");
      const acc = state.accounts.find((a) => a.id === accId);
      if (acc && onEditAccount) onEditAccount(acc);
    });
  });

  return container;
}
