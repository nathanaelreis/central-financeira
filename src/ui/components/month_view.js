import { formatBRL, formatDateBR } from "../../core/constants.js";

export function renderMonthView(state, onAddTransaction, onDeleteTransaction, onOpenModal, onEditCategory) {
  const container = document.createElement("div");
  container.className = "space-y-6 animate-fade-in";

  const netIncome = state.profile.netSalary || 0;
  let totalIncomeRealized = 0;
  let totalExpensesEssential = 0;
  let totalExpensesVariable = 0;
  let totalInvested = 0;

  // Mapa de gastos por categoria
  const catSpentMap = {};
  state.categories.forEach((c) => (catSpentMap[c.id] = 0));

  state.transactions.forEach((tx) => {
    if (tx.type === "INCOME") totalIncomeRealized += tx.amount;
    if (tx.type === "EXPENSE_ESSENTIAL") totalExpensesEssential += tx.amount;
    if (tx.type === "EXPENSE_VARIABLE") totalExpensesVariable += tx.amount;
    if (tx.type === "INVESTMENT_DEPOSIT") totalInvested += tx.amount;

    // Busca categoria
    const foundCat = state.categories.find((c) => c.name === tx.category || c.id === tx.category);
    if (foundCat) {
      catSpentMap[foundCat.id] = (catSpentMap[foundCat.id] || 0) + tx.amount;
    }
  });

  const totalSpent = totalExpensesEssential + totalExpensesVariable;
  const currentBalanceRemaining = (totalIncomeRealized || netIncome) - totalSpent - totalInvested;

  // Calculo de Previsao de Fechamento do Mes
  const now = new Date();
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);

  const dailyExpensePace = totalSpent / dayOfMonth;
  const projectedTotalExpenses = Math.round(totalSpent + dailyExpensePace * daysRemaining);
  const projectedMonthClosure = Math.round(netIncome - projectedTotalExpenses - totalInvested);
  const standardBudgetExpenses = netIncome * 0.75;
  const varianceVsStandard = projectedTotalExpenses - standardBudgetExpenses;

  // Taxa de Poupanca
  const savingsRate = netIncome > 0 ? ((totalInvested / netIncome) * 100).toFixed(1) : "0,0";

  container.innerHTML = `
    <!-- Top Metrics Overview Table -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Renda Prevista</span>
        <strong class="text-sm font-bold text-white">${formatBRL(netIncome)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Renda Recebida</span>
        <strong class="text-sm font-bold text-emerald-400">${formatBRL(totalIncomeRealized || netIncome)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Gastos Previstos</span>
        <strong class="text-sm font-bold text-slate-300">${formatBRL(standardBudgetExpenses)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Gastos Realizados</span>
        <strong class="text-sm font-bold text-rose-400">${formatBRL(totalSpent)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Investimentos</span>
        <strong class="text-sm font-bold text-cyan-400">${formatBRL(totalInvested)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Saldo Atual</span>
        <strong class="text-sm font-bold ${currentBalanceRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${formatBRL(currentBalanceRemaining)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Saldo Projetado</span>
        <strong class="text-sm font-bold ${projectedMonthClosure >= 0 ? 'text-teal-300' : 'text-amber-400'}">${formatBRL(projectedMonthClosure)}</strong>
      </div>
      <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <span class="text-[11px] text-slate-400 block font-medium">Taxa Poupança</span>
        <strong class="text-sm font-bold text-purple-400">${savingsRate}%</strong>
      </div>
    </div>

    <!-- Grid: Category Budgets + Recent Transactions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Category Budget Progress (1 Col) -->
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 class="text-sm font-bold text-white">Categorias & Orçamentos</h3>
            <span class="text-xs text-slate-400">Clique para editar tetos</span>
          </div>
          <button id="btn-add-cat" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
            + Categoria
          </button>
        </div>

        <div class="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
          ${state.categories.map((cat) => {
            const spent = catSpentMap[cat.id] || 0;
            const limit = cat.monthlyLimit || 1;
            const pct = Math.min(150, Math.round((spent / limit) * 100));
            const isOver = spent > limit && limit > 0;
            return `
              <div data-cat-id="${cat.id}" class="btn-edit-category p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-200">${cat.name} ✏️</span>
                  <span class="${isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}">
                    ${formatBRL(spent)} / ${formatBRL(limit)}
                  </span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="h-2 rounded-full transition-all ${isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${limit > 0 ? Math.min(100, pct) : 0}%"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Transactions List & Table (2 Cols) -->
      <div class="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-white">Lançamentos do Mês</h3>
              <p class="text-xs text-slate-400">${state.transactions.length} movimentações registradas</p>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-month-new-tx" class="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20">
                + Novo Lançamento
              </button>
            </div>
          </div>

          <!-- Transactions Table -->
          <div class="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th class="p-2.5 rounded-l-lg">Data</th>
                  <th class="p-2.5">Descrição</th>
                  <th class="p-2.5">Categoria</th>
                  <th class="p-2.5 text-right">Valor</th>
                  <th class="p-2.5 text-center rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${state.transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  const isInvest = tx.type === "INVESTMENT_DEPOSIT";
                  return `
                    <tr class="hover:bg-slate-800/40 transition">
                      <td class="p-2.5 text-slate-400 whitespace-nowrap">${formatDateBR(tx.date)}</td>
                      <td class="p-2.5 font-medium text-white">${tx.description}</td>
                      <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          ${tx.category}
                        </span>
                      </td>
                      <td class="p-2.5 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-400' : isInvest ? 'text-cyan-400' : 'text-rose-400'}">
                        ${isIncome ? '+' : '-'}${formatBRL(tx.amount)}
                      </td>
                      <td class="p-2.5 text-center">
                        <button data-tx-id="${tx.id}" class="btn-delete-tx text-slate-500 hover:text-rose-400 p-1 transition" title="Excluir">
                          ✕
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind new transaction button
  container.querySelector("#btn-month-new-tx")?.addEventListener("click", () => {
    if (onOpenModal) onOpenModal("new_transaction");
  });

  // Bind add category
  container.querySelector("#btn-add-cat")?.addEventListener("click", () => {
    if (onOpenModal) onOpenModal("new_category");
  });

  // Bind edit category
  container.querySelectorAll(".btn-edit-category").forEach((btn) => {
    btn.addEventListener("click", () => {
      const catId = btn.getAttribute("data-cat-id");
      const cat = state.categories.find((c) => c.id === catId);
      if (cat && onEditCategory) onEditCategory(cat);
    });
  });

  // Bind delete transactions
  container.querySelectorAll(".btn-delete-tx").forEach((btn) => {
    btn.addEventListener("click", () => {
      const txId = btn.getAttribute("data-tx-id");
      if (txId && onDeleteTransaction) {
        onDeleteTransaction(txId);
      }
    });
  });

  return container;
}
