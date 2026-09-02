import { formatBRL } from "../../core/constants.js";

export function renderOnboardingModal(state, onSave, onClose) {
  let currentStep = 1;
  const formData = JSON.parse(JSON.stringify(state.profile));

  const modalContainer = document.createElement("div");
  modalContainer.id = "onboarding-modal";
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in";

  function updateStepView() {
    modalContainer.innerHTML = `
      <div class="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-6 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Assistente de Configuração
              </span>
              <span class="text-xs text-slate-400">Passo ${currentStep} de 6</span>
            </div>
            <h2 class="text-xl font-bold text-white mt-1">Diagnóstico Financeiro Completo</h2>
          </div>
          <button id="btn-close-onboarding" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 h-1.5">
          <div class="bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-400 h-1.5 transition-all duration-300" style="width: ${(currentStep / 6) * 100}%"></div>
        </div>

        <!-- Content Area -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          ${renderStepContent(currentStep, formData, state)}
        </div>

        <!-- Footer -->
        <div class="p-5 bg-slate-800/60 border-t border-slate-700/60 flex items-center justify-between">
          <button id="btn-prev-step" class="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-800 border border-slate-700 transition ${currentStep === 1 ? 'opacity-40 pointer-events-none' : ''}">
            Voltar
          </button>
          <div class="flex items-center gap-3">
            <button id="btn-skip-onboarding" class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition">
              Preencher depois
            </button>
            <button id="btn-next-step" class="px-6 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition">
              ${currentStep === 6 ? 'Finalizar e Gerar Diagnóstico' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind events
    modalContainer.querySelector("#btn-close-onboarding")?.addEventListener("click", () => {
      modalContainer.remove();
      if (onClose) onClose();
    });

    modalContainer.querySelector("#btn-skip-onboarding")?.addEventListener("click", () => {
      modalContainer.remove();
      if (onClose) onClose();
    });

    modalContainer.querySelector("#btn-prev-step")?.addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepView();
      }
    });

    modalContainer.querySelector("#btn-next-step")?.addEventListener("click", () => {
      saveCurrentStepInputs(currentStep, formData);
      if (currentStep < 6) {
        currentStep++;
        updateStepView();
      } else {
        // Final save
        formData.hasCompletedDiagnostic = true;
        onSave(formData);
        modalContainer.remove();
      }
    });
  }

  updateStepView();
  document.body.appendChild(modalContainer);
}

function renderStepContent(step, data, fullState) {
  switch (step) {
    case 1:
      return `
        <div>
          <h3 class="text-lg font-semibold text-white mb-1">1. Renda e Entradas Mensais</h3>
          <p class="text-sm text-slate-400 mb-4">Atualize suas fontes de receita recorrentes e sazonais.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Salário Líquido Mensal (em conta)</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                <input id="input-net-salary" type="number" step="0.01" value="${data.netSalary || 3269}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500">
              </div>
              <span class="text-[11px] text-slate-400">Ponto de partida atual: R$ 3.269,00</span>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Salário Bruto (carteira/holerite)</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                <input id="input-gross-salary" type="number" step="0.01" value="${data.grossSalary || 4100}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500">
              </div>
              <span class="text-[11px] text-slate-400">Usado para cálculo de FGTS e capacidade de financiamento</span>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Renda Extra Média Mensal</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                <input id="input-extra-income" type="number" step="0.01" value="${data.extraIncome || 0}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500">
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Saldo Total Acumulado no FGTS</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                <input id="input-fgts" type="number" step="0.01" value="${data.fgtsBalance || 12500}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500">
              </div>
              <span class="text-[11px] text-slate-400">Recurso chave para amortização e entrada da Casa Própria</span>
            </div>
          </div>
        </div>
      `;
    case 2:
      return `
        <div>
          <h3 class="text-lg font-semibold text-white mb-1">2. Alocação nos 4 Baldes Fundamentais</h3>
          <p class="text-sm text-slate-400 mb-4">Defina quanto da sua renda é direcionado para cada pilar.</p>
          <div class="space-y-3">
            <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
              <div>
                <span class="text-sm font-semibold text-blue-400">1. Dinheiro para Viver (Essencial ~50%)</span>
                <p class="text-xs text-slate-400">Moradia, Contas, Supermercado, Transporte Biz, Farmácia</p>
              </div>
              <span class="text-sm font-bold text-white">~R$ 1.630,00</span>
            </div>
            <div class="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div>
                <span class="text-sm font-semibold text-purple-400">2. Dinheiro para Viver (Estilo de Vida ~25%)</span>
                <p class="text-xs text-slate-400">Lazer, Restaurantes, Delivery (iFood), Assinaturas, Compras</p>
              </div>
              <span class="text-sm font-bold text-white">~R$ 817,00</span>
            </div>
            <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span class="text-sm font-semibold text-emerald-400">3. Dinheiro para Segurança (~10%)</span>
                <p class="text-xs text-slate-400">Reserva de Emergência em liquidez diária (100% CDI)</p>
              </div>
              <span class="text-sm font-bold text-white">~R$ 326,00</span>
            </div>
            <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span class="text-sm font-semibold text-amber-400">4. Dinheiro para Objetivos & Crescimento (~15%)</span>
                <p class="text-xs text-slate-400">Entrada da Casa Própria, Troca da Biz por Carro, Renda Passiva</p>
              </div>
              <span class="text-sm font-bold text-white">~R$ 490,00</span>
            </div>
          </div>
        </div>
      `;
    case 3:
      return `
        <div>
          <h3 class="text-lg font-semibold text-white mb-1">3. Patrimônio Atual e Situação da ViaCred</h3>
          <p class="text-sm text-slate-400 mb-4">Confirmar recursos disponíveis e ativos sob custódia.</p>
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div class="flex items-start gap-3">
                <span class="text-xl">⚠️</span>
                <div>
                  <h4 class="text-sm font-bold text-amber-300">Recurso na ViaCred / Veracredit (~R$ 4.000+)</h4>
                  <p class="text-xs text-slate-300 mt-1">
                    Atualmente com baixa rentabilidade (~3% a.a.) e carência de resgate por encerramento de conta. O sistema criará um plano automático para transferir esse capital para CDB 100% CDI ou Tesouro Selic com liquidez imediata.
                  </p>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Valor da Honda Biz (Tabela FIPE)</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                  <input id="input-biz-fipe" type="number" step="0.01" value="${data.bizFipeValue || 8500}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500">
                </div>
                <span class="text-[11px] text-slate-400">Ativo para entrada na troca de veículo</span>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Meta de Aporte Mensal Inicial</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                  <input id="input-monthly-investment" type="number" step="0.01" value="${data.monthlyInvestmentPlanned || 200}" class="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500">
                </div>
                <span class="text-[11px] text-slate-400">Ponto de partida: R$ 200,00/mês</span>
              </div>
            </div>
          </div>
        </div>
      `;
    case 4:
      return `
        <div>
          <h3 class="text-lg font-semibold text-white mb-1">4. Cartões de Crédito e Perfil de Score</h3>
          <p class="text-sm text-slate-400 mb-4">Monitore a utilização para proteger sua capacidade de crédito.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-purple-400 text-sm">Nubank Mastercard</span>
                <span class="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Vence dia 10</span>
              </div>
              <div class="text-xs text-slate-400 space-y-1">
                <p>Limite Total: <strong class="text-white">R$ 2.500,00</strong></p>
                <p>Fatura Atual Média: <strong class="text-white">R$ 680,00</strong> (27% do limite)</p>
              </div>
            </div>
            <div class="p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-amber-400 text-sm">BB Ourocard Visa</span>
                <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Vence dia 15</span>
              </div>
              <div class="text-xs text-slate-400 space-y-1">
                <p>Limite Total: <strong class="text-white">R$ 1.800,00</strong></p>
                <p>Fatura Atual Média: <strong class="text-white">R$ 320,00</strong> (18% do limite)</p>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-xs font-medium text-slate-300 mb-1">Pontuação de Score Atual (Aproximada)</label>
            <input id="input-credit-score" type="number" min="0" max="1000" value="${data.creditScore || 780}" class="w-48 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
            <span class="text-[11px] text-slate-400 block mt-1">Score acima de 700 facilita aprovação de taxas reduzidas para imóvel.</span>
          </div>
        </div>
      `;
    case 5:
      return `
        <div>
          <h3 class="text-lg font-semibold text-white mb-1">5. Metas e Objetivos Principais</h3>
          <p class="text-sm text-slate-400 mb-4">Priorização estratégica para os próximos 1 a 5 anos.</p>
          <div class="space-y-3">
            <div class="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🛡</span>
                <div>
                  <h4 class="text-sm font-semibold text-white">Reserva de Emergência</h4>
                  <p class="text-xs text-slate-400">Meta: 6 meses de custos essenciais (~R$ 9.780)</p>
                </div>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Prioridade 1</span>
            </div>
            <div class="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏠</span>
                <div>
                  <h4 class="text-sm font-semibold text-white">Casa Própria (Entrada + FGTS)</h4>
                  <p class="text-xs text-slate-400">Meta: R$ 35.000 para entrada e custos de cartório</p>
                </div>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">Prioridade 2</span>
            </div>
            <div class="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🚗</span>
                <div>
                  <h4 class="text-sm font-semibold text-white">Troca da Biz por Carro</h4>
                  <p class="text-xs text-slate-400">Condicionada à análise de TCO e manutenção do fluxo livre</p>
                </div>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">Prioridade 3</span>
            </div>
          </div>
        </div>
      `;
    case 6:
      return `
        <div class="text-center py-4">
          <div class="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 animate-bounce">
            ✓
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Diagnóstico Pronto para Execução!</h3>
          <p class="text-sm text-slate-300 max-w-lg mx-auto mb-6">
            Todos os seus parâmetros foram calibrados. O sistema agora calculará seu <strong>Índice de Saúde Financeira</strong>, ativará as recomendações do motor <strong>"O Que Eu Devo Fazer Agora?"</strong> e projetará seus próximos 60 meses.
          </p>
          <div class="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
            <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span class="text-[11px] text-slate-400 block">Renda Líquida</span>
              <strong class="text-sm text-emerald-400 font-bold">${formatBRL(data.netSalary || 3269)}</strong>
            </div>
            <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span class="text-[11px] text-slate-400 block">Aporte Mensal</span>
              <strong class="text-sm text-cyan-400 font-bold">${formatBRL(data.monthlyInvestmentPlanned || 200)}</strong>
            </div>
            <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span class="text-[11px] text-slate-400 block">Localização</span>
              <strong class="text-xs text-white font-medium">Santa Catarina</strong>
            </div>
          </div>
        </div>
      `;
  }
}

function saveCurrentStepInputs(step, data) {
  if (step === 1) {
    const net = document.getElementById("input-net-salary");
    const gross = document.getElementById("input-gross-salary");
    const extra = document.getElementById("input-extra-income");
    const fgts = document.getElementById("input-fgts");
    if (net) data.netSalary = parseFloat(net.value) || 3269;
    if (gross) data.grossSalary = parseFloat(gross.value) || 4100;
    if (extra) data.extraIncome = parseFloat(extra.value) || 0;
    if (fgts) data.fgtsBalance = parseFloat(fgts.value) || 12500;
  } else if (step === 3) {
    const biz = document.getElementById("input-biz-fipe");
    const aporte = document.getElementById("input-monthly-investment");
    if (biz) data.bizFipeValue = parseFloat(biz.value) || 8500;
    if (aporte) data.monthlyInvestmentPlanned = parseFloat(aporte.value) || 200;
  } else if (step === 4) {
    const score = document.getElementById("input-credit-score");
    if (score) data.creditScore = parseInt(score.value) || 780;
  }
}
