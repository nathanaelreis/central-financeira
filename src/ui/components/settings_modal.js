import { storageService } from "../../data/storage_service.js";

export function renderSettingsModal(state, onRestartOnboarding, onOpenProfile, onStateChange, onClose) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "settings-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">⚙️</span>
          <div>
            <h3 class="text-base font-bold text-white">Configurações, Perfis e Dados</h3>
            <p class="text-xs text-slate-400">Gerencie seus dados, inicie do zero ou faça backups</p>
          </div>
        </div>
        <button id="btn-close-settings" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Options -->
      <div class="p-6 space-y-4 text-xs text-slate-200">
        <!-- Iniciar do Zero / Modo Limpo -->
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <strong class="text-sm font-bold text-amber-300 block">✨ Iniciar do Zero (Modo Limpo)</strong>
            <span class="text-slate-300">Zera todas as contas, cartões e investimentos para você construir sua central personalizada.</span>
          </div>
          <button id="btn-clean-slate" class="px-3.5 py-2 font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
            Zerar Tudo
          </button>
        </div>

        <!-- Edit Profile -->
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
          <div>
            <strong class="text-sm font-bold text-white block">Editar Salário e Premissas</strong>
            <span class="text-slate-400">Altere salário líquido, FGTS, FIPE do veículo e aportes mensais.</span>
          </div>
          <button id="btn-edit-profile" class="px-3.5 py-2 font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
            Editar Perfil
          </button>
        </div>

        <!-- Re-run Diagnostic Wizard -->
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
          <div>
            <strong class="text-sm font-bold text-white block">Assistente de Diagnóstico (Wizard)</strong>
            <span class="text-slate-400">Reabrir o passo a passo guiado em 6 etapas.</span>
          </div>
          <button id="btn-trigger-onboarding" class="px-3.5 py-2 font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition">
            Reabrir Wizard
          </button>
        </div>

        <!-- Export Backup -->
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
          <div>
            <strong class="text-sm font-bold text-white block">Exportar Backup JSON</strong>
            <span class="text-slate-400">Baixe um arquivo seguro com todos os seus lançamentos e metas.</span>
          </div>
          <button id="btn-export-backup" class="px-3.5 py-2 font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">
            Exportar
          </button>
        </div>

        <!-- Import Backup -->
        <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
          <div>
            <strong class="text-sm font-bold text-white block">Restaurar Backup JSON</strong>
            <span class="text-slate-400">Carregue um arquivo JSON gerado anteriormente.</span>
          </div>
          <label class="px-3.5 py-2 font-bold rounded-lg bg-purple-500 hover:bg-purple-400 text-white cursor-pointer transition">
            Importar
            <input id="input-restore-file" type="file" accept=".json" class="hidden">
          </label>
        </div>

        <!-- Reset to Demo Template -->
        <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <strong class="text-sm font-bold text-blue-300 block">Carregar Modelo Demonstrativo</strong>
            <span class="text-slate-400">Restaura os valores conhecidos do perfil inicial (R$ 3.269, Viacred R$ 4k, Biz, etc.).</span>
          </div>
          <button id="btn-reset-default" class="px-3.5 py-2 font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition">
            Restaurar Modelo
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 bg-slate-800/60 border-t border-slate-700 flex justify-end">
        <button id="btn-finish-settings" class="px-5 py-2 text-xs font-bold rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition">
          Fechar
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelector("#btn-close-settings")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-finish-settings")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  modalContainer.querySelector("#btn-clean-slate")?.addEventListener("click", () => {
    if (confirm("Deseja iniciar do zero? Todos os lançamentos, contas e cartões serão limpos para você personalizar.")) {
      const blank = storageService.clearStateToBlank();
      modalContainer.remove();
      if (onStateChange) onStateChange(blank);
    }
  });

  modalContainer.querySelector("#btn-edit-profile")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onOpenProfile) onOpenProfile();
  });

  modalContainer.querySelector("#btn-trigger-onboarding")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onRestartOnboarding) onRestartOnboarding();
  });

  modalContainer.querySelector("#btn-export-backup")?.addEventListener("click", () => {
    storageService.exportJSON(state);
  });

  modalContainer.querySelector("#input-restore-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = storageService.importJSON(event.target.result);
        if (res.success) {
          alert("Backup restaurado com sucesso!");
          modalContainer.remove();
          if (onStateChange) onStateChange(res.data);
        } else {
          alert("Erro: " + res.error);
        }
      };
      reader.readAsText(file);
    }
  });

  modalContainer.querySelector("#btn-reset-default")?.addEventListener("click", () => {
    if (confirm("Deseja carregar os dados do modelo demonstrativo inicial?")) {
      const fresh = storageService.resetToInitialTemplate();
      modalContainer.remove();
      if (onStateChange) onStateChange(fresh);
    }
  });

  document.body.appendChild(modalContainer);
}
