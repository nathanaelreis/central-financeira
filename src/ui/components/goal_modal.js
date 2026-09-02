import { formatBRL } from "../../core/constants.js";

export function renderGoalModal(goalToEdit, onSave, onDelete, onClose) {
  const isEditing = !!goalToEdit;
  const modalContainer = document.createElement("div");
  modalContainer.id = "goal-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const defaultGoal = goalToEdit || {
    id: `goal_${Date.now()}`,
    title: "",
    type: "CUSTOM",
    targetAmount: 10000.00,
    currentAmount: 0.00,
    priority: 2,
    targetDate: "2027-12-31",
    notes: "",
  };

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🎯</span>
          <h3 class="text-base font-bold text-white">${isEditing ? 'Editar Meta Financeira' : 'Adicionar Nova Meta Financeira'}</h3>
        </div>
        <button id="btn-close-goal" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form -->
      <form id="form-goal" class="p-6 space-y-4 text-xs text-slate-200">
        <div>
          <label class="block font-semibold mb-1 text-slate-300">Título / Nome do Objetivo</label>
          <input id="goal-title" type="text" required value="${defaultGoal.title}" placeholder="Ex: Entrada da Casa Própria, Troca do Carro, Viagem..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Tipo de Meta</label>
            <select id="goal-type" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500">
              <option value="REAL_ESTATE_HOME" ${defaultGoal.type === 'REAL_ESTATE_HOME' ? 'selected' : ''}>🏠 Casa Própria / Imóvel</option>
              <option value="VEHICLE_PURCHASE" ${defaultGoal.type === 'VEHICLE_PURCHASE' ? 'selected' : ''}>🚗 Compra / Troca de Veículo</option>
              <option value="EMERGENCY_RESERVE" ${defaultGoal.type === 'EMERGENCY_RESERVE' ? 'selected' : ''}>🛡 Reserva de Emergência</option>
              <option value="PASSIVE_INCOME" ${defaultGoal.type === 'PASSIVE_INCOME' ? 'selected' : ''}>⚡ Renda Passiva / Liberdade</option>
              <option value="TRAVEL" ${defaultGoal.type === 'TRAVEL' ? 'selected' : ''}>✈️ Viagem / Férias</option>
              <option value="CUSTOM" ${defaultGoal.type === 'CUSTOM' ? 'selected' : ''}>🎯 Outro Objetivo Personalizado</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Prioridade (1 = Máxima)</label>
            <select id="goal-priority" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500">
              <option value="1" ${defaultGoal.priority === 1 ? 'selected' : ''}>1 - Altíssima Prioridade</option>
              <option value="2" ${defaultGoal.priority === 2 ? 'selected' : ''}>2 - Alta Prioridade</option>
              <option value="3" ${defaultGoal.priority === 3 ? 'selected' : ''}>3 - Média Prioridade</option>
              <option value="4" ${defaultGoal.priority === 4 ? 'selected' : ''}>4 - Longo Prazo</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Valor Alvo (R$)</label>
            <input id="goal-target" type="number" step="0.01" min="1" required value="${defaultGoal.targetAmount}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Valor Já Acumulado (R$)</label>
            <input id="goal-current" type="number" step="0.01" min="0" required value="${defaultGoal.currentAmount}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500">
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Data Alvo Prevista</label>
          <input id="goal-date" type="date" value="${defaultGoal.targetDate || ''}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500">
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Observações Estratégicas</label>
          <input id="goal-notes" type="text" value="${defaultGoal.notes || ''}" placeholder="Ex: Entrada 20% com amortização SAC..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500">
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          ${isEditing ? `
            <button type="button" id="btn-delete-goal" class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition">
              Excluir Meta
            </button>
          ` : '<div></div>'}
          <div class="flex gap-2">
            <button type="button" id="btn-cancel-goal" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
            <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
              ${isEditing ? 'Salvar Meta' : 'Adicionar Meta'}
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-goal")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-goal")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  if (isEditing) {
    modalContainer.querySelector("#btn-delete-goal")?.addEventListener("click", () => {
      if (confirm(`Deseja realmente excluir a meta "${defaultGoal.title}"?`)) {
        onDelete(defaultGoal.id);
        modalContainer.remove();
      }
    });
  }

  modalContainer.querySelector("#form-goal")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      ...defaultGoal,
      title: document.getElementById("goal-title").value,
      type: document.getElementById("goal-type").value,
      priority: parseInt(document.getElementById("goal-priority").value) || 2,
      targetAmount: parseFloat(document.getElementById("goal-target").value) || 0,
      currentAmount: parseFloat(document.getElementById("goal-current").value) || 0,
      targetDate: document.getElementById("goal-date").value,
      notes: document.getElementById("goal-notes").value,
    };
    onSave(updated);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
