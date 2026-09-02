import { formatBRL } from "../../core/constants.js";

export function renderCardModal(cardToEdit, onSave, onDelete, onClose) {
  const isEditing = !!cardToEdit;
  const modalContainer = document.createElement("div");
  modalContainer.id = "card-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const defaultCard = cardToEdit || {
    id: `card_${Date.now()}`,
    institution: "",
    name: "",
    limit: 2000.00,
    currentBill: 0.00,
    closingDay: 5,
    dueDay: 12,
    brand: "Mastercard",
  };

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">💳</span>
          <h3 class="text-base font-bold text-white">${isEditing ? 'Editar Cartão de Crédito' : 'Adicionar Cartão de Crédito'}</h3>
        </div>
        <button id="btn-close-card" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form -->
      <form id="form-card" class="p-6 space-y-4 text-xs text-slate-200">
        <div>
          <label class="block font-semibold mb-1 text-slate-300">Apelido / Nome do Cartão</label>
          <input id="card-name" type="text" required value="${defaultCard.name}" placeholder="Ex: Nubank Platinum, BB Ourocard..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Banco / Emissor</label>
            <input id="card-inst" type="text" required value="${defaultCard.institution}" placeholder="Ex: Nubank, Inter, BB..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Bandeira</label>
            <select id="card-brand" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500">
              <option value="Mastercard" ${defaultCard.brand === 'Mastercard' ? 'selected' : ''}>Mastercard</option>
              <option value="Visa" ${defaultCard.brand === 'Visa' ? 'selected' : ''}>Visa</option>
              <option value="Elo" ${defaultCard.brand === 'Elo' ? 'selected' : ''}>Elo</option>
              <option value="American Express" ${defaultCard.brand === 'American Express' ? 'selected' : ''}>American Express</option>
              <option value="Outra" ${defaultCard.brand === 'Outra' ? 'selected' : ''}>Outra</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Limite Total (R$)</label>
            <input id="card-limit" type="number" step="0.01" min="0" required value="${defaultCard.limit}" placeholder="0,00" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-purple-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Fatura Atual (R$)</label>
            <input id="card-bill" type="number" step="0.01" min="0" required value="${defaultCard.currentBill}" placeholder="0,00" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-purple-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Dia de Fechamento</label>
            <input id="card-closing" type="number" min="1" max="31" required value="${defaultCard.closingDay}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Dia de Vencimento</label>
            <input id="card-due" type="number" min="1" max="31" required value="${defaultCard.dueDay}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500">
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          ${isEditing ? `
            <button type="button" id="btn-delete-card" class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition">
              Excluir Cartão
            </button>
          ` : '<div></div>'}
          <div class="flex gap-2">
            <button type="button" id="btn-cancel-card" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
            <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-purple-500 hover:bg-purple-400 text-white transition">
              ${isEditing ? 'Salvar Cartão' : 'Adicionar Cartão'}
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-card")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-card")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  if (isEditing) {
    modalContainer.querySelector("#btn-delete-card")?.addEventListener("click", () => {
      if (confirm(`Deseja realmente excluir o cartão "${defaultCard.name}"?`)) {
        onDelete(defaultCard.id);
        modalContainer.remove();
      }
    });
  }

  modalContainer.querySelector("#form-card")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      ...defaultCard,
      name: document.getElementById("card-name").value,
      institution: document.getElementById("card-inst").value,
      brand: document.getElementById("card-brand").value,
      limit: parseFloat(document.getElementById("card-limit").value) || 0,
      currentBill: parseFloat(document.getElementById("card-bill").value) || 0,
      closingDay: parseInt(document.getElementById("card-closing").value) || 1,
      dueDay: parseInt(document.getElementById("card-due").value) || 10,
    };
    onSave(updated);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
