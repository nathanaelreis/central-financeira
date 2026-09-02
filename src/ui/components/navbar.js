import { formatBRL } from "../../core/constants.js";

export function renderNavbar(state, healthScoreData, onNavigate, onOpenModal) {
  const nav = document.createElement("header");
  nav.className = "sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all";

  nav.innerHTML = `
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Brand & Status -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
            CF
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-bold text-white tracking-tight">Central Financeira Pessoal</h1>
              <span class="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SC • Live
              </span>
            </div>
            <p class="text-xs text-slate-400">Monitoramento, Controle, Metas e Previsões</p>
          </div>
        </div>

        <!-- Mobile Health Pill -->
        <div class="md:hidden flex items-center">
          <button id="btn-health-pill-mobile" class="px-3 py-1.5 rounded-xl border flex items-center gap-2 ${healthScoreData.ratingBg}">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-bold ${healthScoreData.ratingColor}">Saúde: ${healthScoreData.totalScore}/100</span>
          </button>
        </div>
      </div>

      <!-- Action Buttons & Badges -->
      <div class="flex items-center flex-wrap gap-2.5">
        <!-- Desktop Health Score Badge -->
        <button id="btn-health-pill-desktop" title="Clique para ver detalhamento dos 6 pilares" class="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${healthScoreData.ratingBg} hover:opacity-90 transition shadow-sm">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs text-slate-300 font-medium">Saúde Financeira:</span>
          <strong class="text-xs font-extrabold ${healthScoreData.ratingColor}">${healthScoreData.totalScore}/100</strong>
          <span class="text-[11px] font-semibold text-slate-400">(${healthScoreData.rating})</span>
        </button>

        <!-- Quick Action: Antes de Comprar -->
        <button id="btn-open-decision" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 flex items-center gap-1.5 transition">
          <span>🧠</span>
          <span>Devo Comprar?</span>
        </button>

        <!-- Quick Action: Importar Extrato -->
        <button id="btn-open-importer" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition">
          <span>📥</span>
          <span>Importar</span>
        </button>

        <!-- Quick Action: Novo Lancamento -->
        <button id="btn-open-new-tx" class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition">
          <span>+</span>
          <span>Novo Lançamento</span>
        </button>

        <!-- Menu Dropdown: Ajustes / Backup -->
        <button id="btn-open-settings" title="Diagnóstico e Backups" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
      </div>
    </div>
  `;

  // Event Listeners
  nav.querySelector("#btn-open-decision")?.addEventListener("click", () => onOpenModal("decision"));
  nav.querySelector("#btn-open-importer")?.addEventListener("click", () => onOpenModal("importer"));
  nav.querySelector("#btn-open-new-tx")?.addEventListener("click", () => onOpenModal("new_transaction"));
  nav.querySelector("#btn-open-settings")?.addEventListener("click", () => onOpenModal("settings"));
  nav.querySelector("#btn-health-pill-desktop")?.addEventListener("click", () => onOpenModal("health_details"));
  nav.querySelector("#btn-health-pill-mobile")?.addEventListener("click", () => onOpenModal("health_details"));

  return nav;
}
