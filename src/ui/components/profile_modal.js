import { formatBRL } from "../../core/constants.js";

export function renderProfileModal(profile, onSave, onClose) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "profile-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const p = JSON.parse(JSON.stringify(profile));

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">👤</span>
          <div>
            <h3 class="text-base font-bold text-white">Editar Perfil e Parâmetros Financeiros</h3>
            <p class="text-xs text-slate-400">Atualize sua renda, patrimônio estrutural e premissas</p>
          </div>
        </div>
        <button id="btn-close-prof" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form -->
      <form id="form-prof" class="p-6 overflow-y-auto space-y-4 text-xs text-slate-200 flex-1">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Seu Nome</label>
            <input id="prof-name" type="text" value="${p.name || ''}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Localização</label>
            <input id="prof-loc" type="text" value="${p.location || 'Santa Catarina, Brasil'}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Salário Líquido Mensal (R$)</label>
            <input id="prof-net" type="number" step="0.01" value="${p.netSalary || 0}" required class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Salário Bruto (R$)</label>
            <input id="prof-gross" type="number" step="0.01" value="${p.grossSalary || 0}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Renda Extra Média (R$)</label>
            <input id="prof-extra" type="number" step="0.01" value="${p.extraIncome || 0}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Saldo Total de FGTS (R$)</label>
            <input id="prof-fgts" type="number" step="0.01" value="${p.fgtsBalance || 0}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Valor FIPE Veículo/Biz (R$)</label>
            <input id="prof-biz" type="number" step="0.01" value="${p.bizFipeValue || 0}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Modelo do Veículo</label>
            <input id="prof-biz-model" type="text" value="${p.bizModel || 'Honda Biz 125'}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Aporte Mensal Alvo (R$)</label>
            <input id="prof-aporte" type="number" step="0.01" value="${p.monthlyInvestmentPlanned || 0}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Score de Crédito (0 a 1000)</label>
            <input id="prof-score" type="number" min="0" max="1000" value="${p.creditScore || 700}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button type="button" id="btn-cancel-prof" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
          <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
            Salvar Perfil
          </button>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-prof")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-prof")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  modalContainer.querySelector("#form-prof")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      ...p,
      name: document.getElementById("prof-name").value,
      location: document.getElementById("prof-loc").value,
      netSalary: parseFloat(document.getElementById("prof-net").value) || 0,
      grossSalary: parseFloat(document.getElementById("prof-gross").value) || 0,
      extraIncome: parseFloat(document.getElementById("prof-extra").value) || 0,
      fgtsBalance: parseFloat(document.getElementById("prof-fgts").value) || 0,
      bizFipeValue: parseFloat(document.getElementById("prof-biz").value) || 0,
      bizModel: document.getElementById("prof-biz-model").value,
      monthlyInvestmentPlanned: parseFloat(document.getElementById("prof-aporte").value) || 0,
      creditScore: parseInt(document.getElementById("prof-score").value) || 700,
    };
    onSave(updated);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
