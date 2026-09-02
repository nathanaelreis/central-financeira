import { formatBRL } from "../../core/constants.js";

export function renderReportsView(state) {
  const container = document.createElement("div");
  container.className = "space-y-6 animate-fade-in";

  const snapshots = state.monthlySnapshots || [];

  container.innerHTML = `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Relatórios Mensais & Auditoria de Evolução</h2>
        <p class="text-xs text-slate-400">Histórico de fechamento, diagnóstico comportamental e plano para o próximo mês</p>
      </div>
      <button id="btn-print-report" class="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition">
        <span>🖨️</span>
        <span>Imprimir / Exportar Relatório</span>
      </button>
    </div>

    <!-- Monthly Evolution Table -->
    <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <h3 class="text-base font-bold text-white">Evolução Mês a Mês</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th class="p-3 rounded-l-lg">Mês</th>
              <th class="p-3">Renda Realizada</th>
              <th class="p-3">Gastos Totais</th>
              <th class="p-3">Aportes Investidos</th>
              <th class="p-3">Taxa de Poupança</th>
              <th class="p-3">Patrimônio Líquido</th>
              <th class="p-3 text-center rounded-r-lg">Saúde Financeira</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${snapshots.map((s) => `
              <tr class="hover:bg-slate-800/40 transition">
                <td class="p-3 font-bold text-white">${s.yearMonth}</td>
                <td class="p-3 text-emerald-400">${formatBRL(s.income)}</td>
                <td class="p-3 text-rose-400">${formatBRL(s.expenses)}</td>
                <td class="p-3 text-cyan-400">${formatBRL(s.invested)}</td>
                <td class="p-3 font-semibold text-purple-400">${s.savingsRatePct}%</td>
                <td class="p-3 font-bold text-white">${formatBRL(s.netWorth)}</td>
                <td class="p-3 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ${s.healthScore}/100 🟢
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Monthly Diagnostic & Intelligence Insights -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Diagnostico de Acertos e Problemas -->
      <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>🔍</span>
          <span>Diagnóstico Comportamental do Mês</span>
        </h3>
        <div class="space-y-3 text-xs">
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300">
            <strong class="text-emerald-400 block mb-1">✓ Principais Acertos:</strong>
            <p>Aumento da taxa de poupança para 9,2% da renda e disciplina nos custos fixos de transporte com a Honda Biz.</p>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300">
            <strong class="text-amber-400 block mb-1">⚠️ Pontos de Atenção:</strong>
            <p>Gastos com delivery e lazer concentrados no fim de semana representaram 22% dos desembolsos totais.</p>
          </div>
          <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-300">
            <strong class="text-rose-400 block mb-1">⚡ Riscos Identificados:</strong>
            <p>Capital na ViaCred com rentabilidade abaixo do CDI acumulando custo de oportunidade.</p>
          </div>
        </div>
      </div>

      <!-- Plano Tatico para o Proximo Mes -->
      <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>Plano Tático para o Próximo Mês</span>
        </h3>
        <div class="space-y-3 text-xs text-slate-300">
          <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
            <span class="text-cyan-400 font-bold block">1. Meta de Aporte Recomendado</span>
            <p>Manter ou elevar o aporte para <strong>R$ 300,00</strong> direcionado integralmente para a Reserva de Emergência.</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
            <span class="text-purple-400 font-bold block">2. Teto de Lazer & Delivery</span>
            <p>Limitar os gastos flexíveis a <strong>R$ 450,00</strong> no mês, liberando R$ 100 adicionais para a meta da Casa Própria.</p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
            <span class="text-emerald-400 font-bold block">3. Iniciar Protocolo de Migração Viacred</span>
            <p>Solicitar informações formais de resgate para realocar os R$ 4.000 em CDB 100% CDI com liquidez imediata.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector("#btn-print-report")?.addEventListener("click", () => {
    window.print();
  });

  return container;
}
