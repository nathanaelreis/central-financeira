import { formatBRL } from "../../core/constants.js";

export function renderDecisionModal(state, onClose) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "decision-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  const questions = [
    { id: "q1", text: "1. Tenho dinheiro disponível sem entrar no cheque especial ou rotativo?", weight: 15 },
    { id: "q2", text: "2. Minha Reserva de Emergência permanece 100% intacta após a compra?", weight: 15 },
    { id: "q3", text: "3. Essa compra NÃO compromete a entrada da minha Casa Própria?", weight: 15 },
    { id: "q4", text: "4. Pesquisei e comparei preços ou alternativas mais eficientes?", weight: 10 },
    { id: "q5", text: "5. Se for parcelar, o valor cabe nos 25% de gastos variáveis sem sufoco?", weight: 10 },
    { id: "q6", text: "6. Avaliei o custo de oportunidade (quanto esse dinheiro renderia investido)?", weight: 10 },
    { id: "q7", text: "7. Avaliei os custos recorrentes gerados por essa compra (manutenção, seguro, energia)?", weight: 10 },
    { id: "q8", text: "8. Essa decisão é uma necessidade real ou um impulso passageiro?", weight: 5 },
    { id: "q9", text: "9. Se eu esperar 7 dias, a compra continuará fazendo sentido?", weight: 5 },
    { id: "q10", text: "10. Essa compra agrega valor real à minha qualidade de vida de longo prazo?", weight: 5 },
  ];

  const answers = {};
  questions.forEach((q) => (answers[q.id] = false));

  function updateModal() {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id]) score += q.weight;
    });

    let verdict = "Compra Desaconselhada 🔴";
    let verdictColor = "text-rose-400";
    let verdictBg = "bg-rose-500/10 border-rose-500/30";
    let verdictText = "Essa compra apresenta alto risco de comprometer suas metas estratégicas (Casa Própria / Reserva). Aguarde ou reavalie.";

    if (score >= 80) {
      verdict = "Compra Liberada e Segura 🟢";
      verdictColor = "text-emerald-400";
      verdictBg = "bg-emerald-500/10 border-emerald-500/30";
      verdictText = "Sua decisão atende aos critérios de segurança financeira e não prejudica seu planejamento de longo prazo.";
    } else if (score >= 50) {
      verdict = "Atenção & Cautela 🟡";
      verdictColor = "text-amber-400";
      verdictBg = "bg-amber-500/10 border-amber-500/30";
      verdictText = "A compra pode causar pressão no seu orçamento mensal. Avalie parcelamento sem juros ou espere 7 dias.";
    }

    modalContainer.innerHTML = `
      <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🧠</span>
            <div>
              <h3 class="text-base font-bold text-white">Regras de Decisão — "Devo Comprar?"</h3>
              <p class="text-xs text-slate-400">Checklist anti-impulso e cálculo de custo de oportunidade</p>
            </div>
          </div>
          <button id="btn-close-decision" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition">
            ✕
          </button>
        </div>

        <!-- Verdict Header Box -->
        <div class="p-4 mx-5 mt-5 rounded-xl border ${verdictBg} flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-300 block">Índice de Viabilidade:</span>
            <strong class="text-base font-black ${verdictColor}">${verdict} (${score}/100 pts)</strong>
            <p class="text-xs text-slate-300 mt-1">${verdictText}</p>
          </div>
        </div>

        <!-- Checklist List -->
        <div class="p-5 overflow-y-auto space-y-3 flex-1">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Responda com sinceridade antes de gastar:</span>
          ${questions.map((q) => `
            <label class="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 flex items-center justify-between cursor-pointer transition">
              <span class="text-xs text-slate-200 pr-4">${q.text}</span>
              <input type="checkbox" data-qid="${q.id}" ${answers[q.id] ? 'checked' : ''} class="w-5 h-5 accent-emerald-500 cursor-pointer rounded">
            </label>
          `).join("")}
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-800/60 border-t border-slate-700 flex justify-end">
          <button id="btn-finish-decision" class="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
            Concluir Análise
          </button>
        </div>
      </div>
    `;

    modalContainer.querySelector("#btn-close-decision")?.addEventListener("click", () => {
      modalContainer.remove();
      if (onClose) onClose();
    });
    modalContainer.querySelector("#btn-finish-decision")?.addEventListener("click", () => {
      modalContainer.remove();
      if (onClose) onClose();
    });

    modalContainer.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const qid = cb.getAttribute("data-qid");
        if (qid) answers[qid] = cb.checked;
        updateModal();
      });
    });
  }

  updateModal();
  document.body.appendChild(modalContainer);
}
