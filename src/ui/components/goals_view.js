import { formatBRL, formatPct, MARKET_BENCHMARKS } from "../../core/constants.js";
import { simulateMortgage } from "../../core/mortgage_simulator.js";
import { calculateVehicleTCO } from "../../core/vehicle_tco.js";

export function renderGoalsView(state, onOpenModal, onEditGoal) {
  const container = document.createElement("div");
  container.className = "space-y-8 animate-fade-in";

  const netIncome = state.profile.netSalary || 0;
  const fgts = state.profile.fgtsBalance || 0;
  const bizFipe = state.profile.bizFipeValue || 0;
  const aporteMensal = state.profile.monthlyInvestmentPlanned || 0;

  // 1. Simulacao Habitacional
  const mortgageSim = simulateMortgage({
    propertyValue: 220000,
    minimumDownPaymentPct: 20,
    fgtsBalance: fgts,
    currentCashReserved: 4000,
    monthlySavingsForDownPayment: aporteMensal || 200,
    monthlyNetIncome: netIncome || 3269,
  });

  // 2. Simulacao Veicular Biz vs Carro
  const vehicleTco = calculateVehicleTCO({
    bizFipeValue: bizFipe || 8500,
    carPrice: 38000,
    useBizAsDownPayment: true,
    extraCashDownPayment: 4000,
    financingInstallmentsCount: 48,
  });

  // 3. Reserva de Emergencia
  const emergencyTarget = (netIncome * 3) || 9780;
  let emergencyCurrent = 0;
  state.investments.forEach((i) => {
    if (i.bucket === "SECURITY") emergencyCurrent += i.currentBalance;
  });
  const emergencyPct = emergencyTarget > 0 ? Math.min(100, Math.round((emergencyCurrent / emergencyTarget) * 100)) : 0;

  container.innerHTML = `
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Metas Estratégicas & Simuladores de Decisão</h2>
        <p class="text-xs text-slate-400">Cadastre e personalize qualquer objetivo da sua vida financeira</p>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-add-goal-top" class="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-500/20">
          + Nova Meta
        </button>
      </div>
    </div>

    <!-- Lista de Metas Cadastradas -->
    <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 class="text-sm font-bold text-white">Minhas Metas em Andamento (${state.goals.length})</h3>
        <button id="btn-add-goal-sec" class="text-xs font-semibold text-amber-400 hover:text-amber-300">
          + Adicionar Objetivo
        </button>
      </div>

      ${state.goals.length === 0 ? `
        <div class="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <p class="text-xs text-slate-400 mb-3">Nenhuma meta cadastrada ainda.</p>
          <button id="btn-add-goal-empty" class="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950">
            Cadastrar Minha Primeira Meta
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${state.goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            return `
              <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="text-sm font-bold text-white">${g.title}</h4>
                    <span class="text-xs font-bold text-amber-400">${pct}%</span>
                  </div>
                  <p class="text-xs text-slate-400 mb-2">${g.notes || 'Meta personalizada'}</p>
                  
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                    <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style="width: ${pct}%"></div>
                  </div>
                  <div class="flex justify-between text-[11px] text-slate-400">
                    <span>Acumulado: <strong class="text-white">${formatBRL(g.currentAmount)}</strong></span>
                    <span>Alvo: <strong class="text-slate-300">${formatBRL(g.targetAmount)}</strong></span>
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span class="text-slate-500">${g.targetDate ? `Prazo: ${g.targetDate}` : ''}</span>
                  <button data-goal-id="${g.id}" class="btn-edit-goal px-2.5 py-1 font-semibold rounded bg-slate-700 hover:bg-slate-600 text-amber-300 transition">
                    ✏️ Editar Meta
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>

    <!-- META 1: CASA PRÓPRIA (Simulador SAC) -->
    <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl">
            🏠
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-white">Simulador — Aquisição da Casa Própria</h3>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                ${mortgageSim.downPaymentProgressPct}% da Entrada
              </span>
            </div>
            <p class="text-xs text-slate-400">Financiamento Caixa (SFH / Minha Casa Minha Vida) com amortização SAC</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400 block">Previsão com Aporte de ${formatBRL(aporteMensal || 200)}/mês:</span>
          <strong class="text-sm font-bold text-amber-400">${mortgageSim.yearsToDownPayment} anos (${mortgageSim.monthsToDownPayment} meses)</strong>
        </div>
      </div>

      <!-- Down Payment Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-xs">
          <span class="text-slate-300">
            Acumulado (FGTS + Reserva): <strong>${formatBRL(mortgageSim.totalCurrentDownPayment)}</strong>
          </span>
          <span class="text-amber-400 font-bold">
            Entrada Necessária (20%): ${formatBRL(mortgageSim.downPaymentNeeded)}
          </span>
        </div>
        <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-3 rounded-full transition-all" style="width: ${mortgageSim.downPaymentProgressPct}%"></div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-500">
          <span>FGTS disponível: ${formatBRL(fgts)}</span>
          <span>Faltam: ${formatBRL(mortgageSim.remainingDownPaymentToSave)}</span>
        </div>
      </div>

      <!-- SAC vs PRICE Detailed Table -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white">Tabela SAC (Recomendada)</h4>
            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Parcelas Decrescentes
            </span>
          </div>
          <div class="space-y-2 text-xs text-slate-300">
            <div class="flex justify-between">
              <span class="text-slate-400">1ª Parcela (Inicial):</span>
              <strong class="text-white font-bold">${formatBRL(mortgageSim.sac.initialInstallment)}/mês</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Última Parcela (Final):</span>
              <strong class="text-emerald-400 font-bold">${formatBRL(mortgageSim.sac.finalInstallment)}/mês</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total de Juros Pagos:</span>
              <strong class="text-slate-200">${formatBRL(mortgageSim.sac.totalInterestPaid)}</strong>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-700/60">
              <span class="text-slate-400">Comprometimento de Renda:</span>
              <strong class="${mortgageSim.sac.isViable ? 'text-emerald-400' : 'text-amber-400'}">
                ${mortgageSim.sac.incomeCommitmentInitialPct}% (Teto bancário: 30%)
              </strong>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white">Tabela PRICE</h4>
            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              Parcelas Fixas
            </span>
          </div>
          <div class="space-y-2 text-xs text-slate-300">
            <div class="flex justify-between">
              <span class="text-slate-400">Parcela Mensal Fixa:</span>
              <strong class="text-white font-bold">${formatBRL(mortgageSim.price.fixedInstallment)}/mês</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total de Juros Pagos:</span>
              <strong class="text-rose-400">${formatBRL(mortgageSim.price.totalInterestPaid)}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Economia escolhendo SAC:</span>
              <strong class="text-emerald-400 font-bold">+${formatBRL(mortgageSim.sacSavingsVsPrice)}</strong>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-700/60">
              <span class="text-slate-400">Comprometimento de Renda:</span>
              <strong class="${mortgageSim.price.isViable ? 'text-emerald-400' : 'text-amber-400'}">
                ${mortgageSim.price.incomeCommitmentPct}% (Teto bancário: 30%)
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- META 2: TROCA DE VEÍCULO COM TCO -->
    <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-2xl">
            🚗
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Simulador — Custo Total de Propriedade (TCO) Veicular</h3>
            <p class="text-xs text-slate-400">Combustível, IPVA 2% SC, Seguro, Manutenção e Parcela</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400 block">Diferença Mensal Real:</span>
          <strong class="text-sm font-bold text-purple-400">+${formatBRL(vehicleTco.comparison.monthlyDifference)}/mês</strong>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white">Situação Atual: Moto / Biz</h4>
            <span class="text-xs font-bold text-emerald-400">FIPE: ${formatBRL(bizFipe)}</span>
          </div>
          <div class="space-y-1.5 text-xs text-slate-300">
            <div class="flex justify-between">
              <span class="text-slate-400">Combustível (45 km/L):</span>
              <span>${formatBRL(vehicleTco.biz.monthlyFuel)}/mês</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">IPVA / Licenciamento SC:</span>
              <span>${formatBRL(vehicleTco.biz.monthlyIpva)}/mês</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Seguro / Proteção:</span>
              <span>${formatBRL(vehicleTco.biz.monthlyInsurance)}/mês</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Manutenção Média:</span>
              <span>${formatBRL(vehicleTco.biz.monthlyMaintenance)}/mês</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-700/60 font-bold text-sm">
              <span class="text-white">Custo Total Mensal:</span>
              <strong class="text-emerald-400">${formatBRL(vehicleTco.biz.totalMonthlyCost)}/mês</strong>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white">Carro Pretendido (~R$ 38.000)</h4>
            <span class="text-xs font-bold text-purple-400">Entrada (Biz + R$ 4k)</span>
          </div>
          <div class="space-y-1.5 text-xs text-slate-300">
            <div class="flex justify-between">
              <span class="text-slate-400">Parcela Financiamento (48x):</span>
              <strong class="text-purple-300">${formatBRL(vehicleTco.car.financingInstallment)}/mês</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Combustível (11.5 km/L):</span>
              <span>${formatBRL(vehicleTco.car.monthlyFuel)}/mês</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">IPVA 2% SC + Licenciamento:</span>
              <span>${formatBRL(vehicleTco.car.monthlyIpva)}/mês</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Seguro Anual (~R$ 2.200):</span>
              <span>${formatBRL(vehicleTco.car.monthlyInsurance)}/mês</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Manutenção / Pneus:</span>
              <span>${formatBRL(vehicleTco.car.monthlyMaintenance)}/mês</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-700/60 font-bold text-sm">
              <span class="text-white">Custo Total com Parcela:</span>
              <strong class="text-rose-400">${formatBRL(vehicleTco.car.totalMonthlyCostWithFinancing)}/mês</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Add
  container.querySelector("#btn-add-goal-top")?.addEventListener("click", () => onOpenModal("new_goal"));
  container.querySelector("#btn-add-goal-sec")?.addEventListener("click", () => onOpenModal("new_goal"));
  container.querySelector("#btn-add-goal-empty")?.addEventListener("click", () => onOpenModal("new_goal"));

  // Bind Edit
  container.querySelectorAll(".btn-edit-goal").forEach((btn) => {
    btn.addEventListener("click", () => {
      const gId = btn.getAttribute("data-goal-id");
      const g = state.goals.find((item) => item.id === gId);
      if (g && onEditGoal) onEditGoal(g);
    });
  });

  return container;
}
