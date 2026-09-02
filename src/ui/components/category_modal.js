import { formatBRL } from "../../core/constants.js";

export function renderCategoryModal(catToEdit, onSave, onDelete, onClose) {
  const isEditing = !!catToEdit;
  const modalContainer = document.createElement("div");
  modalContainer.id = "category-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const defaultCat = catToEdit || {
    id: `cat_${Date.now()}`,
    name: "",
    bucket: "LIVING_ESSENTIAL",
    monthlyLimit: 500.00,
  };

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🏷️</span>
          <h3 class="text-base font-bold text-white">${isEditing ? 'Editar Categoria / Teto' : 'Nova Categoria Orçamentária'}</h3>
        </div>
        <button id="btn-close-cat" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form -->
      <form id="form-cat" class="p-6 space-y-4 text-xs text-slate-200">
        <div>
          <label class="block font-semibold mb-1 text-slate-300">Nome da Categoria</label>
          <input id="cat-name" type="text" required value="${defaultCat.name}" placeholder="Ex: Farmácia & Saúde, Academia, Cursos..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Balde Fundamental (Finalidade)</label>
          <select id="cat-bucket" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
            <option value="LIVING_ESSENTIAL" ${defaultCat.bucket === 'LIVING_ESSENTIAL' ? 'selected' : ''}>1. Dinheiro para Viver (Essencial ~50%)</option>
            <option value="LIVING_VARIABLE" ${defaultCat.bucket === 'LIVING_VARIABLE' ? 'selected' : ''}>2. Dinheiro para Viver (Estilo de Vida ~25%)</option>
            <option value="SECURITY" ${defaultCat.bucket === 'SECURITY' ? 'selected' : ''}>3. Dinheiro para Segurança (~10%)</option>
            <option value="GOALS" ${defaultCat.bucket === 'GOALS' ? 'selected' : ''}>4. Dinheiro para Objetivos (~10%)</option>
            <option value="GROWTH" ${defaultCat.bucket === 'GROWTH' ? 'selected' : ''}>5. Dinheiro para Crescimento (~5%)</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-1 text-slate-300">Teto Mensal de Gastos / Orçamento (R$)</label>
          <input id="cat-limit" type="number" step="0.01" min="0" required value="${defaultCat.monthlyLimit}" placeholder="0,00" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-emerald-500">
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          ${isEditing ? `
            <button type="button" id="btn-delete-cat" class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition">
              Excluir
            </button>
          ` : '<div></div>'}
          <div class="flex gap-2">
            <button type="button" id="btn-cancel-cat" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
            <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
              ${isEditing ? 'Salvar Categoria' : 'Criar Categoria'}
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-cat")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-cat")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  if (isEditing) {
    modalContainer.querySelector("#btn-delete-cat")?.addEventListener("click", () => {
      if (confirm(`Deseja excluir a categoria "${defaultCat.name}"?`)) {
        onDelete(defaultCat.id);
        modalContainer.remove();
      }
    });
  }

  modalContainer.querySelector("#form-cat")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      ...defaultCat,
      name: document.getElementById("cat-name").value,
      bucket: document.getElementById("cat-bucket").value,
      monthlyLimit: parseFloat(document.getElementById("cat-limit").value) || 0,
    };
    onSave(updated);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
