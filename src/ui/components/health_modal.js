import { formatBRL } from "../../core/constants.js";

export function renderHealthModal(healthData, onClose) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "health-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎯</span>
          <div>
            <h3 class="text-base font-bold text-white">Índice de Saúde Financeira</h3>
            <p class="text-xs text-slate-400">Decomposição transparente dos 6 pilares de avaliação</p>
          </div>
        </div>
        <button id="btn-close-health" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Score Header -->
      <div class="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-800 text-center space-y-2">
        <div class="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl border ${healthData.ratingBg}">
          <span class="text-3xl font-black ${healthData.ratingColor}">${healthData.totalScore}/100</span>
          <span class="text-sm font-bold text-white uppercase tracking-wider">Classificação: ${healthData.rating}</span>
        </div>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          Sua nota reflete a capacidade de poupança, reserva de emergência, controle de endividamento, uso prudente de cartão e consistência patrimonial.
        </p>
      </div>

      <!-- 6 Pillars Breakdown -->
      <div class="p-6 overflow-y-auto space-y-4 flex-1">
        ${Object.values(healthData.breakdown).map((p) => `
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white">${p.title}</span>
              <span class="text-xs font-black ${p.score >= (p.max * 0.8) ? 'text-emerald-400' : p.score >= (p.max * 0.5) ? 'text-amber-400' : 'text-rose-400'}">
                ${p.score} / ${p.max} pts
              </span>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="h-2 rounded-full transition-all ${p.score >= (p.max * 0.8) ? 'bg-emerald-500' : p.score >= (p.max * 0.5) ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${(p.score / p.max) * 100}%"></div>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-slate-400">Status Atual: <strong class="text-slate-200">${p.value}</strong></span>
              <span class="text-slate-300 italic">${p.feedback}</span>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Footer -->
      <div class="p-4 bg-slate-800/60 border-t border-slate-700 flex justify-end">
        <button id="btn-done-health" class="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
          Fechar
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelector("#btn-close-health")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-done-health")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  document.body.appendChild(modalContainer);
}
