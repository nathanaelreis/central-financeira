export const BLANK_FINANCIAL_STATE = {
  profile: {
    name: "Meu Perfil",
    location: "Brasil",
    netSalary: 0.00,
    grossSalary: 0.00,
    extraIncome: 0.00,
    thirteenthSalary: 0.00,
    vacationBonus: 0.00,
    fgtsBalance: 0.00,
    bizFipeValue: 0.00,
    bizModel: "",
    creditScore: 700,
    monthlyInvestmentPlanned: 0.00,
    emergencyFundMonthsTarget: 6,
    hasCompletedDiagnostic: false,
  },
  accounts: [],
  creditCards: [],
  debts: [],
  investments: [],
  goals: [],
  categories: [
    { id: "cat_moradia", name: "Moradia & Contas", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_mercado", name: "Supermercado & Alimentacao", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_transporte", name: "Transporte", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_saude", name: "Saude & Farmacia", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_lazer", name: "Lazer & Restaurantes", bucket: "LIVING_VARIABLE", monthlyLimit: 0.00 },
    { id: "cat_assinaturas", name: "Assinaturas & Servicos", bucket: "LIVING_VARIABLE", monthlyLimit: 0.00 },
    { id: "cat_compras", name: "Compras Pessoais", bucket: "LIVING_VARIABLE", monthlyLimit: 0.00 },
    { id: "cat_reserva", name: "Aporte Reserva / Metas", bucket: "SECURITY", monthlyLimit: 0.00 },
    { id: "cat_invest", name: "Investimentos Longo Prazo", bucket: "GROWTH", monthlyLimit: 0.00 },
  ],
  transactions: [],
  monthlySnapshots: [],
};

export const INITIAL_FINANCIAL_STATE = {
  profile: {
    name: "",
    location: "",
    netSalary: 0.00,
    grossSalary: 0.00,
    extraIncome: 0.00,
    thirteenthSalary: 0.00,
    vacationBonus: 0.00,
    fgtsBalance: 0.00,
    bizFipeValue: 0.00,
    bizModel: "",
    creditScore: 0,
    monthlyInvestmentPlanned: 0.00,
    emergencyFundMonthsTarget: 6,
    hasCompletedDiagnostic: false,
  },

  accounts: [],

  creditCards: [],

  debts: [],

  investments: [],

  goals: [],

  categories: [
    { id: "cat_moradia", name: "Moradia & Contas", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_mercado", name: "Supermercado & Alimentacao", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_transporte", name: "Transporte", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_saude", name: "Saude & Farmacia", bucket: "LIVING_ESSENTIAL", monthlyLimit: 0.00 },
    { id: "cat_lazer", name: "Lazer & Restaurantes", bucket: "LIVING_VARIABLE", monthlyLimit: 0.00 },
    { id: "cat_assinaturas", name: "Assinaturas & Servicos", bucket: "LIVING_VARIABLE", monthlyLimit: 0.00 },
    { id: "cat_compras", name: "Compras Pessoais", bucket: "LIVING_VARIABLE", monthlyLimit: 0.00 },
    { id: "cat_reserva", name: "Aporte Reserva / Metas", bucket: "SECURITY", monthlyLimit: 0.00 },
    { id: "cat_invest", name: "Investimentos Longo Prazo", bucket: "GROWTH", monthlyLimit: 0.00 },
  ],

  transactions: [],

  monthlySnapshots: [],
};
