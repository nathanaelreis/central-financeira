import { parseRawStatementText, CATEGORY_RULES } from "../../core/categorizer.js";
import { formatBRL } from "../../core/constants.js";

export function renderImporterModal(state, onBatchImport, onClose) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "importer-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  let parsedTransactions = [];

  function updateView() {
    modalContainer.innerHTML = `
      <div class="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📥</span>
            <div>
              <h3 class="text-base font-bold text-white">Importador Inteligente de Extratos e Faturas</h3>
              <p class="text-xs text-slate-400">Cole linhas de texto, CSV ou extrato bancário (Nubank, BB, Viacred)</p>
            </div>
          </div>
          <button id="btn-close-importer" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">
            ✕
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <!-- Textarea -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              Cole o texto do extrato ou faturas (Ex: "15/08 Posto Shell R$ 50,00" ou "20/08;iFood;45.90"):
            </label>
            <textarea id="txt-statement-input" rows="4" placeholder="10/08 - Supermercado Angeloni - R$ 250,00&#10;12/08 - Posto Ipiranga - R$ 45,00&#10;15/08 - Netflix - R$ 55,90" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"></textarea>
            <div class="flex justify-between items-center mt-2">
              <span class="text-[11px] text-slate-400">O sistema identificará automaticamente a categoria e o balde correspondente.</span>
              <button id="btn-process-text" class="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition">
                Processar e Classificar
              </button>
            </div>
          </div>

          <!-- Preview Table -->
          ${parsedTransactions.length > 0 ? `
            <div class="pt-4 border-t border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-white">${parsedTransactions.length} Lançamentos Identificados</h4>
                <span class="text-xs text-slate-400">Revise as categorias antes de confirmar</span>
              </div>

              <div class="overflow-x-auto max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th class="p-2.5">Data</th>
                      <th class="p-2.5">Descrição</th>
                      <th class="p-2.5">Categoria Sugerida</th>
                      <th class="p-2.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800">
                    ${parsedTransactions.map((tx, idx) => `
                      <tr class="hover:bg-slate-800/50">
                        <td class="p-2.5 text-slate-400 whitespace-nowrap">${tx.date}</td>
                        <td class="p-2.5 font-medium text-white">${tx.description}</td>
                        <td class="p-2.5">
                          <select data-idx="${idx}" class="sel-cat bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1">
                            ${CATEGORY_RULES.map((r) => `
                              <option value="${r.category}" ${r.category === tx.category ? 'selected' : ''}>
                                ${r.category}
                              </option>
                            `).join("")}
                          </select>
                        </td>
                        <td class="p-2.5 text-right font-bold text-rose-400 whitespace-nowrap">
                          ${formatBRL(tx.amount)}
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-800/60 border-t border-slate-700 flex justify-between items-center">
          <span class="text-xs text-slate-400">Privacidade 100% local — nenhuma senha ou credencial bancária é solicitada.</span>
          <div class="flex items-center gap-2">
            <button id="btn-cancel-import" class="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white transition">
              Cancelar
            </button>
            <button id="btn-confirm-import" class="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition ${parsedTransactions.length === 0 ? 'opacity-40 pointer-events-none' : ''}">
              Importar ${parsedTransactions.length} Lançamentos
            </button>
          </div>
        </div>
      </div>
    `;

    // Events
    modalContainer.querySelector("#btn-close-importer")?.addEventListener("click", () => {
      modalContainer.remove();
      if (onClose) onClose();
    });
    modalContainer.querySelector("#btn-cancel-import")?.addEventListener("click", () => {
      modalContainer.remove();
      if (onClose) onClose();
    });

    modalContainer.querySelector("#btn-process-text")?.addEventListener("click", () => {
      const txt = modalContainer.querySelector("#txt-statement-input")?.value;
      if (txt) {
        parsedTransactions = parseRawStatementText(txt);
        updateView();
      }
    });

    modalContainer.querySelectorAll(".sel-cat").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(sel.getAttribute("data-idx"));
        if (parsedTransactions[idx]) {
          parsedTransactions[idx].category = e.target.value;
        }
      });
    });

    modalContainer.querySelector("#btn-confirm-import")?.addEventListener("click", () => {
      if (parsedTransactions.length > 0 && onBatchImport) {
        onBatchImport(parsedTransactions);
        modalContainer.remove();
      }
    });
  }

  updateView();
  document.body.appendChild(modalContainer);
}
