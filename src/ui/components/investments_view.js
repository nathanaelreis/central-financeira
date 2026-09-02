import { formatBRL, formatPct, MARKET_BENCHMARKS } from "../../core/constants.js";
import { calculateCompoundInterest, compareInvestmentProducts } from "../../core/compound_interest.js";

export function renderInvestmentsView(state, onOpenModal, onEditInvestment) {
  const container = document.createElement("div");
  container.className = "space-y-6 animate-fade-in";

  let totalInvested = 0;
  state.investments.forEach((inv) => (totalInvested += inv.currentBalance));

  const monthlyContributionPlanned = state.profile.monthlyInvestmentPlanned || 200;
  const initialCapital = totalInvested || 4000;

  // Comparacao de Produtos
  const compResult = compareInvestmentProducts({
    initialAmount: Math.max(100, initialCapital),
    monthlyContribution: monthlyContributionPlanned,
    years: 5,
  });

  // Simulacao de Juros Compostos a 10 anos
  const sim10Years = calculateCompoundInterest({
    initialAmount: Math.max(100, initialCapital),
    monthlyContribution: monthlyContributionPlanned,
    annualRatePct: MARKET_BENCHMARKS.CDI_ANNUAL,
    years: 10,
  });

  // Metas de Renda Passiva
  const passiveTiers = [
    { targetMonthly: 100, label: "R$ 100 / mês" },
    { targetMonthly: 500, label: "R$ 500 / mês" },
    { targetMonthly: 1000, label: "R$ 1.000 / mês" },
    { targetMonthly: 2000, label: "R$ 2.000 / mês" },
    { targetMonthly: 5000, label: "R$ 5.000 / mês" },
  ];

  const currentPassiveMonthly = totalInvested * 0.0075;

  container.innerHTML = `
    <!-- Top Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Patrimônio Investido</span>
        <strong class="text-2xl font-black text-white">${formatBRL(totalInvested)}</strong>
        <span class="text-xs text-slate-400 block mt-1">Distribuído em ${state.investments.length} posições</span>
      </div>
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Aporte Mensal Alvo</span>
        <strong class="text-2xl font-black text-cyan-400">${formatBRL(monthlyContributionPlanned)}</strong>
        <span class="text-xs text-slate-400 block mt-1">${state.profile.netSalary > 0 ? ((monthlyContributionPlanned / state.profile.netSalary) * 100).toFixed(1) : 0}% da renda</span>
      </div>
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Renda Passiva Atual</span>
        <strong class="text-2xl font-black text-purple-400">${formatBRL(currentPassiveMonthly)}/mês</strong>
        <span class="text-xs text-slate-400 block mt-1">Rendimento líquido estimado</span>
      </div>
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Ponto de Inflexão</span>
        <strong class="text-2xl font-black text-emerald-400">${sim10Years.inflectionYears ? `${sim10Years.inflectionYears} anos` : 'Em cálculo'}</strong>
        <span class="text-xs text-slate-400 block mt-1">Quando juros > aportes</span>
      </div>
    </div>

    <!-- Current Investment Positions Table -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white">Minha Carteira de Investimentos</h3>
          <p class="text-xs text-slate-400">Ativos sob custódia, rentabilidade e liquidez</p>
        </div>
        <button id="btn-add-investment" class="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20">
          + Novo Investimento
        </button>
      </div>

      ${state.investments.length === 0 ? `
        <div class="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <p class="text-xs text-slate-400 mb-3">Nenhum investimento registrado ainda.</p>
          <button id="btn-add-investment-empty" class="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950">
            Cadastrar Primeiro Investimento
          </button>
        </div>
      ` : `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="p-3 rounded-l-lg">Produto / Instituição</th>
                <th class="p-3">Classe / Balde</th>
                <th class="p-3">Rentabilidade</th>
                <th class="p-3">Liquidez</th>
                <th class="p-3 text-right">Saldo Atual</th>
                <th class="p-3 text-center rounded-r-lg">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${state.investments.map((inv) => {
                const isMigrate = inv.isFlaggedForMigration;
                return `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-3">
                      <strong class="text-white block">${inv.productName}</strong>
                      <span class="text-[11px] text-slate-400">${inv.institution}</span>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                        ${inv.assetType} • ${inv.bucket}
                      </span>
                    </td>
                    <td class="p-3 font-semibold text-emerald-400">${inv.benchmarkRate}</td>
                    <td class="p-3 text-slate-400">${inv.liquidity}</td>
                    <td class="p-3 text-right font-bold text-white">${formatBRL(inv.currentBalance)}</td>
                    <td class="p-3 text-center">
                      <button data-inv-id="${inv.id}" class="btn-edit-inv px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition" title="Editar Investimento">
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Product Comparator: CDB 100% vs 110% vs Tesouro vs LCI vs Poupanca -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white">Comparador de Produtos Financeiros</h3>
          <p class="text-xs text-slate-400">
            Simulação para: <strong>${formatBRL(initialCapital)} iniciais + ${formatBRL(monthlyContributionPlanned)}/mês</strong> em <strong>5 anos</strong> (CDI: ${MARKET_BENCHMARKS.CDI_ANNUAL}% a.a.)
          </p>
        </div>
        <div class="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold self-start sm:self-auto">
          Diferença vs Poupança: +${formatBRL(compResult.differenceVsPoupanca)} líquidos
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${compResult.results.map((r, i) => {
          const isBest = i === 0;
          return `
            <div class="p-4 rounded-xl ${isBest ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'bg-slate-800/60 border border-slate-700/80'} flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isBest ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}">
                    ${isBest ? '★ Melhor Opção' : r.product.type}
                  </span>
                  <span class="text-xs font-semibold text-slate-400">${r.product.liquidity}</span>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">${r.product.name}</h4>
                <p class="text-[11px] text-slate-400 mb-3">${r.product.fringeBenefit}</p>

                <div class="space-y-1.5 text-xs">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Total Investido:</span>
                    <strong class="text-white">${formatBRL(r.simulation.finalInvested)}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Rendimento Bruto:</span>
                    <strong class="text-slate-200">${formatBRL(r.simulation.finalGrossInterest)}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Imposto de Renda:</span>
                    <strong class="text-rose-400">-${formatBRL(r.simulation.finalTax)}</strong>
                  </div>
                </div>
              </div>

              <div class="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-300">Valor Líquido:</span>
                <strong class="text-base font-black ${isBest ? 'text-emerald-400' : 'text-cyan-400'}">
                  ${formatBRL(r.finalNet)}
                </strong>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Passive Income Staircase Goals -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 class="text-base font-bold text-white">Escada da Independência & Renda Passiva</h3>
          <p class="text-xs text-slate-400">Patrimônio necessário para cada degrau de renda mensal líquida (~0.75% a.m.)</p>
        </div>
      </div>

      <div class="space-y-4">
        ${passiveTiers.map((tier) => {
          const capitalNeeded = (tier.targetMonthly / 0.0075);
          const progress = Math.min(100, Math.round((totalInvested / capitalNeeded) * 100));
          return `
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">${tier.label}</span>
                  <span class="text-slate-400">requer patrimônio de <strong>${formatBRL(capitalNeeded)}</strong></span>
                </div>
                <span class="font-bold ${progress >= 100 ? 'text-emerald-400' : 'text-purple-400'}">${progress}% concluído</span>
              </div>
              <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all" style="width: ${progress}%"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  // Bind Add
  container.querySelector("#btn-add-investment")?.addEventListener("click", () => onOpenModal("new_investment"));
  container.querySelector("#btn-add-investment-empty")?.addEventListener("click", () => onOpenModal("new_investment"));

  // Bind Edit
  container.querySelectorAll(".btn-edit-inv").forEach((btn) => {
    btn.addEventListener("click", () => {
      const invId = btn.getAttribute("data-inv-id");
      const inv = state.investments.find((i) => i.id === invId);
      if (inv && onEditInvestment) onEditInvestment(inv);
    });
  });

  return container;
}
