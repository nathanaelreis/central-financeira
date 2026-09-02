import { formatBRL } from "../../core/constants.js";

export function renderInvestmentModal(invToEdit, onSave, onDelete, onClose) {
  const isEditing = !!invToEdit;
  const modalContainer = document.createElement("div");
  modalContainer.id = "investment-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const defaultInv = invToEdit || {
    id: `inv_${Date.now()}`,
    institution: "",
    productName: "",
    assetType: "CDB",
    bucket: "SECURITY",
    investedAmount: 1000.00,
    currentBalance: 1000.00,
    benchmarkRate: "100% CDI",
    annualRatePct: 10.40,
    liquidity: "Imediata (D+0)",
    maturityDate: null,
    isFlaggedForMigration: false,
  };

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">📈</span>
          <h3 class="text-base font-bold text-white">${isEditing ? 'Editar Investimento' : 'Adicionar Novo Investimento'}</h3>
        </div>
        <button id="btn-close-inv" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">✕</button>
      </div>

      <!-- Form -->
      <form id="form-inv" class="p-6 space-y-4 text-xs text-slate-200">
        <div>
          <label class="block font-semibold mb-1 text-slate-300">Nome do Produto / Ativo</label>
          <input id="inv-name" type="text" required value="${defaultInv.productName}" placeholder="Ex: Tesouro Selic 2029, CDB 100% CDI Nubank, FII HGLG11..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Instituição / Corretora</label>
            <input id="inv-inst" type="text" required value="${defaultInv.institution}" placeholder="Ex: Nubank, XP, Banco do Brasil, Rico..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Classe de Ativo</label>
            <select id="inv-type" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500">
              <option value="CDB" ${defaultInv.assetType === 'CDB' ? 'selected' : ''}>CDB (Certificado de Depósito Bancário)</option>
              <option value="TREASURY_SELIC" ${defaultInv.assetType === 'TREASURY_SELIC' ? 'selected' : ''}>Tesouro Selic</option>
              <option value="TREASURY_IPCA" ${defaultInv.assetType === 'TREASURY_IPCA' ? 'selected' : ''}>Tesouro IPCA+ (Inflação)</option>
              <option value="LCI_LCA" ${defaultInv.assetType === 'LCI_LCA' ? 'selected' : ''}>LCI / LCA (Isento de IR)</option>
              <option value="FII" ${defaultInv.assetType === 'FII' ? 'selected' : ''}>FII (Fundo Imobiliário)</option>
              <option value="EQUITY" ${defaultInv.assetType === 'EQUITY' ? 'selected' : ''}>Ações / ETFs</option>
              <option value="PENSION_PGBL_VGBL" ${defaultInv.assetType === 'PENSION_PGBL_VGBL' ? 'selected' : ''}>Previdência Privada (PGBL/VGBL)</option>
              <option value="COOPERATIVE_QUOTA" ${defaultInv.assetType === 'COOPERATIVE_QUOTA' ? 'selected' : ''}>Cota / Capital Cooperativa</option>
              <option value="OTHER" ${defaultInv.assetType === 'OTHER' ? 'selected' : ''}>Outro Investimento</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Balde / Propósito</label>
            <select id="inv-bucket" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500">
              <option value="SECURITY" ${defaultInv.bucket === 'SECURITY' ? 'selected' : ''}>🛡 Segurança (Reserva de Emergência)</option>
              <option value="GOALS" ${defaultInv.bucket === 'GOALS' ? 'selected' : ''}>🎯 Metas (Casa / Carro / Projetos)</option>
              <option value="GROWTH" ${defaultInv.bucket === 'GROWTH' ? 'selected' : ''}>⚡ Crescimento (Renda Passiva / Futuro)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Liquidez</label>
            <input id="inv-liquidity" type="text" value="${defaultInv.liquidity}" placeholder="Ex: Diária (D+0), D+1, No Vencimento..." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Valor Inicial Aportado (R$)</label>
            <input id="inv-initial" type="number" step="0.01" min="0" required value="${defaultInv.investedAmount}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Saldo Atual (R$)</label>
            <input id="inv-current" type="number" step="0.01" min="0" required value="${defaultInv.currentBalance}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Rentabilidade Pactuada</label>
            <input id="inv-rate-str" type="text" value="${defaultInv.benchmarkRate}" placeholder="Ex: 100% CDI, 110% CDI, 12% a.a." class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500">
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-300">Taxa Anual Estimada (% a.a.)</label>
            <input id="inv-rate-num" type="number" step="0.01" value="${defaultInv.annualRatePct}" placeholder="10.40" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500">
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          ${isEditing ? `
            <button type="button" id="btn-delete-inv" class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition">
              Excluir Ativo
            </button>
          ` : '<div></div>'}
          <div class="flex gap-2">
            <button type="button" id="btn-cancel-inv" class="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
            <button type="submit" class="px-5 py-2 font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition">
              ${isEditing ? 'Salvar Investimento' : 'Adicionar Investimento'}
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  modalContainer.querySelector("#btn-close-inv")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });
  modalContainer.querySelector("#btn-cancel-inv")?.addEventListener("click", () => {
    modalContainer.remove();
    if (onClose) onClose();
  });

  if (isEditing) {
    modalContainer.querySelector("#btn-delete-inv")?.addEventListener("click", () => {
      if (confirm(`Deseja realmente excluir o investimento "${defaultInv.productName}"?`)) {
        onDelete(defaultInv.id);
        modalContainer.remove();
      }
    });
  }

  modalContainer.querySelector("#form-inv")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      ...defaultInv,
      productName: document.getElementById("inv-name").value,
      institution: document.getElementById("inv-inst").value,
      assetType: document.getElementById("inv-type").value,
      bucket: document.getElementById("inv-bucket").value,
      liquidity: document.getElementById("inv-liquidity").value,
      investedAmount: parseFloat(document.getElementById("inv-initial").value) || 0,
      currentBalance: parseFloat(document.getElementById("inv-current").value) || 0,
      benchmarkRate: document.getElementById("inv-rate-str").value,
      annualRatePct: parseFloat(document.getElementById("inv-rate-num").value) || 10.40,
    };
    onSave(updated);
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}
