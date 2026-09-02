import { formatBRL } from "../../core/constants.js";

export function renderAccountModal(accountToEdit, onSave, onDelete, onClose) {
  const isEditing = !!accountToEdit;
  const modalContainer = document.createElement("div");
  modalContainer.id = "account-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const defaultAcc = accountToEdit || {
    id: `acc_${Date.now()}`,
    name: "",
    institution: "",
    type: "CHECKING",
    balance: 0.00,
    color: "emerald",
    notice: "",
  };

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🏦</span>
          <h3 class="text-base font-bold text-white">${isEditing ? 'Editar Conta / Carteira' : 'Adicionar Nova Conta / Carteira'}</h3>
        </div>
        <button id="btn-close-acc" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form -->
      <form id="form-acc" class="p-6 space-y-4 text-xs text-slate-200">
        <div>
          <label class="block font-semibold mb-1 text-slate-300">Nome / Identificação da Conta</label>
          <input id="acc-name" type="text" required value="${defaultAcc.name}" placeholder="Ex: Nubank Principal, BB Corrente, Carteira..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Instituição / Banco</label>
            <input id="acc-institution" type="text" required value="${defaultAcc.institution}" placeholder="Ex: Nubank, BB, Viacred..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Tipo de Conta</label>
            <select id="acc-type" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
              <option value="CHECKING" ${defaultAcc.type === 'CHECKING' ? 'selected' : ''}>Conta Corrente</option>
              <option value="SAVINGS" ${defaultAcc.type === 'SAVINGS' ? 'selected' : ''}>Poupança</option>
              <option value="CASH" ${defaultAcc.type === 'CASH' ? 'selected' : ''}>Dinheiro em Espécie</option>
              <option value="INVESTMENT_BROKER" ${defaultAcc.type === 'INVESTMENT_BROKER' ? 'selected' : ''}>Corretora</option>
              <option value="COOPERATIVE_CAPITAL" ${defaultAcc.type === 'COOPERATIVE_CAPITAL' ? 'selected' : ''}>Capital Cooperativa</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Saldo Atual Disponível (R$)</label>
          <input id="acc-balance" type="number" step="0.01" required value="${defaultAcc.balance}" placeholder="0,00" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-emerald-500">
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Observações / Detalhes (Opcional)</label>
          <input id="acc-notice" type="text" value="${defaultAcc.notice || ''}" placeholder="Ex: Conta conjunta, carência para resgate..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          ${isEditing ? `
            <button type="button" id="btn-delete-acc" class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition">
              Excluir Conta
            </button>
          ` : '<div></div>'}
          <div class="flex gap-2">
            <button type="button" id="btn-cancel-acc" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
            <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
              ${isEditing ? 'Salvar Alterações' : 'Adicionar Conta'}
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-acc")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-acc")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  if (isEditing) {
    modalContainer.querySelector("#btn-delete-acc")?.addEventListener("click", () => {
      if (confirm(`Deseja realmente excluir a conta "${defaultAcc.name}"?`)) {
        onDelete(defaultAcc.id);
        modalContainer.remove();
      }
    });
  }

  modalContainer.querySelector("#form-acc")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      ...defaultAcc,
      name: document.getElementById("acc-name").value,
      institution: document.getElementById("acc-institution").value,
      type: document.getElementById("acc-type").value,
      balance: parseFloat(document.getElementById("acc-balance").value) || 0,
      notice: document.getElementById("acc-notice").value,
    };
    onSave(updated);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
