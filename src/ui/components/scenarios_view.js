import { formatBRL, formatPct, MARKET_BENCHMARKS } from "../../core/constants.js";
import { generateProjections } from "../../core/projection_engine.js";

export function renderScenariosView(state) {
  const container = document.createElement("div");
  container.className = "space-y-6 animate-fade-in";

  // Estado interno dos controles do simulador
  let scenarioSalaryIncrease = 0;
  let scenarioExpenseCut = 0;
  let scenarioAporte = state.profile.monthlyInvestmentPlanned || 200;
  let scenarioYieldDelta = 0;
  let scenarioBuyCar = false;
  let scenarioExtraInitial = 0;
  let scenarioPauseMonths = 0;

  function updateSimulation() {
    let initialInvested = 0;
    state.investments.forEach((i) => (initialInvested += i.currentBalance));
    initialInvested += scenarioExtraInitial;

    // Cenário Base (Atual)
    const baseProj = generateProjections({
      initialNetWorth: 18620,
      initialInvestments: initialInvested,
      monthlyNetSalary: state.profile.netSalary || 3269,
      monthlyEssentialExpenses: 1630,
      monthlyVariableExpenses: 817,
      monthlyPlannedInvestment: state.profile.monthlyInvestmentPlanned || 200,
      annualInvestmentYieldPct: MARKET_BENCHMARKS.CDI_ANNUAL,
    });

    // Cenário Simulado
    const simulatedProj = generateProjections({
      initialNetWorth: 18620,
      initialInvestments: initialInvested,
      monthlyNetSalary: state.profile.netSalary || 3269,
      monthlyEssentialExpenses: 1630 + (scenarioBuyCar ? 480 : 0),
      monthlyVariableExpenses: 817,
      monthlyPlannedInvestment: scenarioAporte,
      annualInvestmentYieldPct: MARKET_BENCHMARKS.CDI_ANNUAL,
      scenarioSalaryIncrease,
      scenarioExpenseCut,
      scenarioYieldDeltaPct: scenarioYieldDelta,
      scenarioPauseInvestmentMonths: scenarioPauseMonths,
    });

    container.innerHTML = `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔮</span>
            <h2 class="text-xl font-bold text-white tracking-tight">Simulador de Cenários — "E SE?"</h2>
          </div>
          <p class="text-xs text-slate-400">Projete o impacto de decisões no seu patrimônio em 6, 12, 24, 36 e 60 meses</p>
        </div>
      </div>

      <!-- Controls Playground Grid -->
      <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Ajuste as Premissas em Tempo Real:</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Slider: Aporte Mensal -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="font-medium text-slate-300">Aporte Mensal Alvo:</span>
              <strong class="text-cyan-400 font-bold">${formatBRL(scenarioAporte)}</strong>
            </div>
            <input id="slider-aporte" type="range" min="100" max="1500" step="50" value="${scenarioAporte}" class="w-full accent-cyan-400 cursor-pointer">
            <div class="flex justify-between text-[10px] text-slate-500">
              <span>R$ 100</span>
              <span>R$ 500</span>
              <span>R$ 1.500</span>
            </div>
          </div>

          <!-- Slider: Aumento Salarial -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="font-medium text-slate-300">Aumento de Renda / Extra:</span>
              <strong class="text-emerald-400 font-bold">+${formatBRL(scenarioSalaryIncrease)}</strong>
            </div>
            <input id="slider-salary" type="range" min="0" max="2000" step="100" value="${scenarioSalaryIncrease}" class="w-full accent-emerald-400 cursor-pointer">
            <div class="flex justify-between text-[10px] text-slate-500">
              <span>R$ 0</span>
              <span>+R$ 1.000</span>
              <span>+R$ 2.000</span>
            </div>
          </div>

          <!-- Slider: Corte de Gastos -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="font-medium text-slate-300">Corte de Gastos Variáveis:</span>
              <strong class="text-purple-400 font-bold">-${formatBRL(scenarioExpenseCut)}</strong>
            </div>
            <input id="slider-cut" type="range" min="0" max="500" step="50" value="${scenarioExpenseCut}" class="w-full accent-purple-400 cursor-pointer">
            <div class="flex justify-between text-[10px] text-slate-500">
              <span>R$ 0</span>
              <span>-R$ 250</span>
              <span>-R$ 500</span>
            </div>
          </div>

          <!-- Slider: Variacao da Selic/CDI -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="font-medium text-slate-300">Variação da Taxa Selic:</span>
              <strong class="${scenarioYieldDelta >= 0 ? 'text-teal-300' : 'text-rose-400'} font-bold">
                ${scenarioYieldDelta >= 0 ? '+' : ''}${scenarioYieldDelta}% a.a.
              </strong>
            </div>
            <input id="slider-yield" type="range" min="-4" max="4" step="0.5" value="${scenarioYieldDelta}" class="w-full accent-teal-400 cursor-pointer">
            <div class="flex justify-between text-[10px] text-slate-500">
              <span>-4% (Selic cai)</span>
              <span>Base (10.5%)</span>
              <span>+4% (Selic sobe)</span>
            </div>
          </div>

          <!-- Toggle: Compra de Carro Financiado -->
          <div class="p-3 bg-slate-800/60 border border-slate-700 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-white block">Comprar Carro Financiado</span>
              <span class="text-[11px] text-slate-400">+R$ 480/mês de TCO veicular</span>
            </div>
            <input id="toggle-car" type="checkbox" ${scenarioBuyCar ? 'checked' : ''} class="w-5 h-5 accent-purple-500 cursor-pointer">
          </div>

          <!-- Toggle: Pausar Aportes por 6 Meses -->
          <div class="p-3 bg-slate-800/60 border border-slate-700 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-white block">Pausar Aportes por 6 Meses</span>
              <span class="text-[11px] text-slate-400">Simula imprevisto ou pausa</span>
            </div>
            <input id="toggle-pause" type="checkbox" ${scenarioPauseMonths > 0 ? 'checked' : ''} class="w-5 h-5 accent-amber-500 cursor-pointer">
          </div>
        </div>
      </div>

      <!-- 5 Horizons Comparison Grid -->
      <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <h3 class="text-base font-bold text-white">Evolução Patrimonial por Horizonte Temporal</h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          ${[
            { key: "m6", label: "6 Meses" },
            { key: "m12", label: "12 Meses (1 Ano)" },
            { key: "m24", label: "24 Meses (2 Anos)" },
            { key: "m36", label: "36 Meses (3 Anos)" },
            { key: "m60", label: "60 Meses (5 Anos)" },
          ].map((h) => {
            const baseVal = baseProj.checkpoints[h.key]?.totalNetWorth || 0;
            const simVal = simulatedProj.checkpoints[h.key]?.totalNetWorth || 0;
            const diff = simVal - baseVal;
            const passiveSim = simulatedProj.checkpoints[h.key]?.monthlyPassiveIncome || 0;

            return `
              <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">${h.label}</span>
                  <div class="text-lg font-black text-white">${formatBRL(simVal)}</div>
                  <div class="text-[11px] text-slate-400 mt-1">
                    Base: ${formatBRL(baseVal)}
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-700/60 space-y-1">
                  <div class="text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                    ${diff >= 0 ? '▲ +' : '▼ '}${formatBRL(diff)}
                  </div>
                  <span class="text-[10px] text-slate-400 block">
                    Renda Passiva: <strong class="text-purple-300">${formatBRL(passiveSim)}/mês</strong>
                  </span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Bind slider events
    container.querySelector("#slider-aporte")?.addEventListener("input", (e) => {
      scenarioAporte = parseFloat(e.target.value);
      updateSimulation();
    });
    container.querySelector("#slider-salary")?.addEventListener("input", (e) => {
      scenarioSalaryIncrease = parseFloat(e.target.value);
      updateSimulation();
    });
    container.querySelector("#slider-cut")?.addEventListener("input", (e) => {
      scenarioExpenseCut = parseFloat(e.target.value);
      updateSimulation();
    });
    container.querySelector("#slider-yield")?.addEventListener("input", (e) => {
      scenarioYieldDelta = parseFloat(e.target.value);
      updateSimulation();
    });
    container.querySelector("#toggle-car")?.addEventListener("change", (e) => {
      scenarioBuyCar = e.target.checked;
      updateSimulation();
    });
    container.querySelector("#toggle-pause")?.addEventListener("change", (e) => {
      scenarioPauseMonths = e.target.checked ? 6 : 0;
      updateSimulation();
    });
  }

  updateSimulation();
  return container;
}
