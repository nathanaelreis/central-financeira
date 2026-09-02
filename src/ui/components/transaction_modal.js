import { CATEGORY_RULES } from "../../core/categorizer.js";

export function renderTransactionModal(state, onSave, onClose) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "tx-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const today = new Date().toISOString().split("T")[0];

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">💳</span>
          <h3 class="text-base font-bold text-white">Novo Lançamento Financeiro</h3>
        </div>
        <button id="btn-close-tx" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form Content -->
      <form id="form-new-tx" class="p-6 space-y-4 text-xs text-slate-200">
        <div>
          <label class="block font-semibold mb-1 text-slate-300">Descrição do Lançamento</label>
          <input id="tx-desc" type="text" required placeholder="Ex: Supermercado Angeloni, iFood, Posto..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Valor (R$)</label>
            <input id="tx-amount" type="number" step="0.01" min="0.01" required placeholder="0,00" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Data</label>
            <input id="tx-date" type="date" value="${today}" required class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Tipo de Fluxo</label>
            <select id="tx-type" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
              <option value="EXPENSE_ESSENTIAL">Despesa Essencial (Viver)</option>
              <option value="EXPENSE_VARIABLE">Despesa Variável (Estilo)</option>
              <option value="INVESTMENT_DEPOSIT">Investimento / Aporte</option>
              <option value="INCOME">Receita / Salário</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Categoria</label>
            <select id="tx-cat" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
              ${CATEGORY_RULES.map((c) => `<option value="${c.category}">${c.category}</option>`).join("")}
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Conta / Cartão de Origem</label>
          <select id="tx-account" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
            <optgroup label="Contas">
              ${state.accounts.map((a) => `<option value="${a.id}">${a.name} (${a.institution})</option>`).join("")}
            </optgroup>
            <optgroup label="Cartões de Crédito">
              ${state.creditCards.map((c) => `<option value="${c.id}">${c.name} (${c.institution})</option>`).join("")}
            </optgroup>
          </select>
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button type="button" id="btn-cancel-tx" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
          <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
            Registrar Lançamento
          </button>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-tx")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-tx")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  modalContainer.querySelector("#form-new-tx")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const desc = document.getElementById("tx-desc").value;
    const amount = parseFloat(document.getElementById("tx-amount").value);
    const date = document.getElementById("tx-date").value;
    const type = document.getElementById("tx-type").value;
    const category = document.getElementById("tx-cat").value;
    const account = document.getElementById("tx-account").value;

    const newTx = {
      id: `tx_${Date.now()}`,
      date,
      description: desc,
      amount,
      type,
      category,
      account,
      status: "COMPLETED",
    };

    onSave(newTx);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
