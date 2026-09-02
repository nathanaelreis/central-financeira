import { formatBRL } from "../../core/constants.js";

export function renderCreditView(state, onOpenModal, onEditCard) {
  const container = document.createElement("div");
  container.className = "space-y-6 animate-fade-in";

  let totalLimit = 0;
  let totalCurrentBill = 0;

  state.creditCards.forEach((c) => {
    totalLimit += c.limit;
    totalCurrentBill += c.currentBill;
  });

  const totalAvailable = Math.max(0, totalLimit - totalCurrentBill);
  const utilizationPct = totalLimit > 0 ? (totalCurrentBill / totalLimit) * 100 : 0;
  const isAboveThreshold = utilizationPct > 30;

  const score = state.profile.creditScore || 700;

  container.innerHTML = `
    <!-- Top Bar with Add Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Cartões de Crédito & Monitor de Score</h2>
        <p class="text-xs text-slate-400">Controle de limites, faturas e proteção de risco bancário</p>
      </div>
      <button id="btn-add-card-top" class="px-4 py-2 text-xs font-bold rounded-xl bg-purple-500 hover:bg-purple-400 text-white transition shadow-md shadow-purple-500/20">
        + Adicionar Cartão
      </button>
    </div>

    <!-- Top Credit Limit Aggregate Meters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Limite Total de Crédito</span>
        <strong class="text-2xl font-black text-white">${formatBRL(totalLimit)}</strong>
        <span class="text-xs text-slate-400 block mt-1">${state.creditCards.length} cartões cadastrados</span>
      </div>
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Faturas Atuais Utilizadas</span>
        <strong class="text-2xl font-black ${isAboveThreshold ? 'text-amber-400' : 'text-emerald-400'}">${formatBRL(totalCurrentBill)}</strong>
        <span class="text-xs text-slate-400 block mt-1">${utilizationPct.toFixed(1)}% do limite total</span>
      </div>
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Limite Disponível Livre</span>
        <strong class="text-2xl font-black text-cyan-400">${formatBRL(totalAvailable)}</strong>
        <span class="text-xs text-slate-400 block mt-1">${(100 - utilizationPct).toFixed(1)}% livre</span>
      </div>
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Score de Crédito</span>
        <div class="flex items-baseline gap-2">
          <strong class="text-2xl font-black text-purple-400">${score}</strong>
          <span class="text-xs text-slate-400">/ 1000</span>
        </div>
        <span class="text-xs text-emerald-400 block mt-1">${score >= 700 ? 'Perfil excelente para financiamento' : 'Em construção de pontuação'}</span>
      </div>
    </div>

    <!-- Cards Detailed List -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white">Meus Cartões (${state.creditCards.length})</h3>
      </div>

      ${state.creditCards.length === 0 ? `
        <div class="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <p class="text-xs text-slate-400 mb-3">Nenhum cartão cadastrado ainda.</p>
          <button id="btn-add-card-empty" class="px-4 py-2 text-xs font-bold rounded-xl bg-purple-500 text-white">
            Cadastrar Primeiro Cartão
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          ${state.creditCards.map((card) => {
            const cardPct = card.limit > 0 ? (card.currentBill / card.limit) * 100 : 0;
            const available = Math.max(0, card.limit - card.currentBill);
            return `
              <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold text-base">
                      💳
                    </div>
                    <div>
                      <h4 class="text-base font-bold text-white">${card.name}</h4>
                      <span class="text-xs text-slate-400">${card.institution} • ${card.brand}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Fecha dia ${card.closingDay} • Vence dia ${card.dueDay}
                    </span>
                    <button data-card-id="${card.id}" class="btn-edit-card px-2 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition">
                      ✏️ Editar
                    </button>
                  </div>
                </div>

                <!-- Meter -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Fatura Atual: <strong class="text-white">${formatBRL(card.currentBill)}</strong></span>
                    <span class="font-bold ${cardPct > 50 ? 'text-rose-400' : cardPct > 30 ? 'text-amber-400' : 'text-emerald-400'}">
                      ${cardPct.toFixed(1)}% do limite
                    </span>
                  </div>
                  <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div class="h-2.5 rounded-full transition-all ${cardPct > 50 ? 'bg-rose-500' : cardPct > 30 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${Math.min(100, cardPct)}%"></div>
                  </div>
                  <div class="flex justify-between text-[11px] text-slate-500">
                    <span>Limite Total: ${formatBRL(card.limit)}</span>
                    <span>Disponível: ${formatBRL(available)}</span>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>
  `;

  // Bind Add
  container.querySelector("#btn-add-card-top")?.addEventListener("click", () => onOpenModal("new_card"));
  container.querySelector("#btn-add-card-empty")?.addEventListener("click", () => onOpenModal("new_card"));

  // Bind Edit
  container.querySelectorAll(".btn-edit-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cId = btn.getAttribute("data-card-id");
      const card = state.creditCards.find((c) => c.id === cId);
      if (card && onEditCard) onEditCard(card);
    });
  });

  return container;
}
