import { storageService } from "../data/storage_service.js";
import { calculateFinancialHealth } from "../core/financial_health.js";
import { generateNextBestActions } from "../core/next_best_actions.js";

// Views
import { renderNavbar } from "./components/navbar.js";
import { renderDashboardView } from "./components/dashboard_view.js";
import { renderMonthView } from "./components/month_view.js";
import { renderCreditView } from "./components/credit_view.js";
import { renderInvestmentsView } from "./components/investments_view.js";
import { renderGoalsView } from "./components/goals_view.js";
import { renderScenariosView } from "./components/scenarios_view.js";
import { renderReportsView } from "./components/reports_view.js";

// Modals
import { renderOnboardingModal } from "./components/onboarding_modal.js";
import { renderDecisionModal } from "./components/decision_modal.js";
import { renderImporterModal } from "./components/importer_modal.js";
import { renderTransactionModal } from "./components/transaction_modal.js";
import { renderHealthModal } from "./components/health_modal.js";
import { renderSettingsModal } from "./components/settings_modal.js";
import { renderAccountModal } from "./components/account_modal.js";
import { renderCardModal } from "./components/card_modal.js";
import { renderInvestmentModal } from "./components/investment_modal.js";
import { renderGoalModal } from "./components/goal_modal.js";
import { renderCategoryModal } from "./components/category_modal.js";
import { renderProfileModal } from "./components/profile_modal.js";

export class CentralFinanceiraApp {
  constructor(rootElement) {
    this.root = rootElement;
    this.state = storageService.loadState();
    this.currentTab = "dashboard";

    // Inscreve para mudancas de estado
    storageService.subscribe((newState) => {
      this.state = newState;
      this.render();
    });

    this.render();
  }

  computeMetrics() {
    let essentialSpent = 0;
    this.state.transactions.forEach((t) => {
      if (t.type === "EXPENSE_ESSENTIAL") essentialSpent += t.amount;
    });

    let emergencyFund = 0;
    this.state.investments.forEach((i) => {
      if (i.bucket === "SECURITY") emergencyFund += i.currentBalance;
    });

    let totalBills = 0;
    let totalLimit = 0;
    this.state.creditCards.forEach((c) => {
      totalBills += c.currentBill;
      totalLimit += c.limit;
    });

    const netIncome = this.state.profile.netSalary || 0;

    const healthData = calculateFinancialHealth({
      netIncome: netIncome,
      monthlyInvestments: this.state.profile.monthlyInvestmentPlanned || 0,
      emergencyFundBalance: emergencyFund,
      essentialMonthlyExpenses: essentialSpent || (netIncome * 0.5) || 1000,
      totalMonthlyDebtInstallments: 0,
      totalCreditCardBills: totalBills,
      totalCreditLimit: totalLimit,
      goalsOnTrackCount: Math.max(1, this.state.goals.length),
      totalGoalsCount: Math.max(1, this.state.goals.length),
      netWorthGrowthConsecutiveMonths: 3,
    });

    const nextActions = generateNextBestActions({
      profile: this.state.profile,
      accounts: this.state.accounts,
      creditCards: this.state.creditCards,
      debts: this.state.debts,
      goals: this.state.goals,
      investments: this.state.investments,
      healthScore: healthData.totalScore,
    });

    return { healthData, nextActions };
  }

  setTab(tabId) {
    this.currentTab = tabId;
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  openModal(type, data = null) {
    if (type === "onboarding") {
      renderOnboardingModal(
        this.state,
        (updatedProfile) => {
          this.state.profile = updatedProfile;
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "profile") {
      renderProfileModal(
        this.state.profile,
        (updated) => {
          this.state.profile = updated;
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "decision") {
      renderDecisionModal(this.state, null);
    } else if (type === "importer") {
      renderImporterModal(
        this.state,
        (batch) => {
          this.state.transactions = [...batch, ...this.state.transactions];
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "new_transaction") {
      renderTransactionModal(
        this.state,
        (newTx) => {
          this.state.transactions.unshift(newTx);
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "health_details") {
      const { healthData } = this.computeMetrics();
      renderHealthModal(healthData, null);
    } else if (type === "settings") {
      renderSettingsModal(
        this.state,
        () => this.openModal("onboarding"),
        () => this.openModal("profile"),
        (newState) => {
          this.state = newState;
          this.render();
        },
        null
      );
    } else if (type === "new_account" || type === "edit_account") {
      renderAccountModal(
        data,
        (saved) => {
          const idx = this.state.accounts.findIndex((a) => a.id === saved.id);
          if (idx >= 0) {
            this.state.accounts[idx] = saved;
          } else {
            this.state.accounts.push(saved);
          }
          storageService.saveState(this.state);
        },
        (delId) => {
          this.state.accounts = this.state.accounts.filter((a) => a.id !== delId);
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "new_card" || type === "edit_card") {
      renderCardModal(
        data,
        (saved) => {
          const idx = this.state.creditCards.findIndex((c) => c.id === saved.id);
          if (idx >= 0) {
            this.state.creditCards[idx] = saved;
          } else {
            this.state.creditCards.push(saved);
          }
          storageService.saveState(this.state);
        },
        (delId) => {
          this.state.creditCards = this.state.creditCards.filter((c) => c.id !== delId);
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "new_investment" || type === "edit_investment") {
      renderInvestmentModal(
        data,
        (saved) => {
          const idx = this.state.investments.findIndex((i) => i.id === saved.id);
          if (idx >= 0) {
            this.state.investments[idx] = saved;
          } else {
            this.state.investments.push(saved);
          }
          storageService.saveState(this.state);
        },
        (delId) => {
          this.state.investments = this.state.investments.filter((i) => i.id !== delId);
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "new_goal" || type === "edit_goal") {
      renderGoalModal(
        data,
        (saved) => {
          const idx = this.state.goals.findIndex((g) => g.id === saved.id);
          if (idx >= 0) {
            this.state.goals[idx] = saved;
          } else {
            this.state.goals.push(saved);
          }
          storageService.saveState(this.state);
        },
        (delId) => {
          this.state.goals = this.state.goals.filter((g) => g.id !== delId);
          storageService.saveState(this.state);
        },
        null
      );
    } else if (type === "new_category" || type === "edit_category") {
      renderCategoryModal(
        data,
        (saved) => {
          const idx = this.state.categories.findIndex((c) => c.id === saved.id);
          if (idx >= 0) {
            this.state.categories[idx] = saved;
          } else {
            this.state.categories.push(saved);
          }
          storageService.saveState(this.state);
        },
        (delId) => {
          this.state.categories = this.state.categories.filter((c) => c.id !== delId);
          storageService.saveState(this.state);
        },
        null
      );
    }
  }

  render() {
    this.root.innerHTML = "";
    const { healthData, nextActions } = this.computeMetrics();

    // 1. Navbar
    const navbar = renderNavbar(
      this.state,
      healthData,
      (tab) => this.setTab(tab),
      (modalType) => this.openModal(modalType)
    );
    this.root.appendChild(navbar);

    // 2. Main Wrapper
    const mainWrapper = document.createElement("div");
    mainWrapper.className = "max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6";

    // 3. Tab Navigation Bar
    const tabsNav = document.createElement("div");
    tabsNav.className =
      "flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none text-xs font-semibold";

    const tabsList = [
      { id: "dashboard", label: "📊 Cockpit Executivo" },
      { id: "month", label: "📅 Visão do Mês & Gastos" },
      { id: "credit", label: "💳 Cartões & Score" },
      { id: "investments", label: "📈 Investimentos & Renda" },
      { id: "goals", label: "🎯 Metas & TCO Biz/Carro" },
      { id: "scenarios", label: "🔮 Simulador 'E Se?'" },
      { id: "reports", label: "📄 Relatórios & Evolução" },
    ];

    tabsNav.innerHTML = tabsList
      .map(
        (t) => `
      <button data-tab="${t.id}" class="tab-btn px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
          this.currentTab === t.id
            ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-md font-bold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
        }">
        ${t.label}
      </button>
    `
      )
      .join("");

    tabsNav.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        if (tab) this.setTab(tab);
      });
    });

    mainWrapper.appendChild(tabsNav);

    // 4. Active Tab Content
    const tabContentArea = document.createElement("main");
    tabContentArea.id = "tab-content-area";

    if (this.currentTab === "dashboard") {
      tabContentArea.appendChild(
        renderDashboardView(
          this.state,
          healthData,
          nextActions,
          (tab) => this.setTab(tab),
          (modalType) => this.openModal(modalType),
          (acc) => this.openModal("edit_account", acc)
        )
      );
    } else if (this.currentTab === "month") {
      tabContentArea.appendChild(
        renderMonthView(
          this.state,
          (tx) => {
            this.state.transactions.unshift(tx);
            storageService.saveState(this.state);
          },
          (txId) => {
            this.state.transactions = this.state.transactions.filter(
              (t) => t.id !== txId
            );
            storageService.saveState(this.state);
          },
          (modalType) => this.openModal(modalType),
          (cat) => this.openModal("edit_category", cat)
        )
      );
    } else if (this.currentTab === "credit") {
      tabContentArea.appendChild(
        renderCreditView(
          this.state,
          (modalType) => this.openModal(modalType),
          (card) => this.openModal("edit_card", card)
        )
      );
    } else if (this.currentTab === "investments") {
      tabContentArea.appendChild(
        renderInvestmentsView(
          this.state,
          (modalType) => this.openModal(modalType),
          (inv) => this.openModal("edit_investment", inv)
        )
      );
    } else if (this.currentTab === "goals") {
      tabContentArea.appendChild(
        renderGoalsView(
          this.state,
          (modalType) => this.openModal(modalType),
          (goal) => this.openModal("edit_goal", goal)
        )
      );
    } else if (this.currentTab === "scenarios") {
      tabContentArea.appendChild(renderScenariosView(this.state));
    } else if (this.currentTab === "reports") {
      tabContentArea.appendChild(renderReportsView(this.state));
    }

    mainWrapper.appendChild(tabContentArea);
    this.root.appendChild(mainWrapper);
  }
}
