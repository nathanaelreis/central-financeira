// Constantes e Parametros Economicos do Mercado Brasileiro
export const MARKET_BENCHMARKS = {
  SELIC_ANNUAL: 10.50, // % a.a.
  CDI_ANNUAL: 10.40,   // % a.a.
  IPCA_ANNUAL: 4.00,   // % a.a. (Inflacao estimada)
  SAVINGS_ANNUAL: 6.17, // % a.a. (Poupanca tradicional)
  DEFAULT_MORTGAGE_RATE_ANNUAL: 9.99, // % a.a. (Financiamento habitacional SFH/MCMV)
  DEFAULT_VEHICLE_FINANCING_MONTHLY: 1.89, // % a.m. (Taxa media financiamento auto)
};

// Aliquotas de Imposto de Renda Regressivo (Renda Fixa / CDB / Tesouro)
export const IR_REGRESSIVE_RATES = [
  { maxDays: 180, rate: 0.225, label: "22,5% (ate 180 dias)" },
  { maxDays: 360, rate: 0.200, label: "20,0% (181 a 360 dias)" },
  { maxDays: 720, rate: 0.175, label: "17,5% (361 a 720 dias)" },
  { maxDays: Infinity, rate: 0.150, label: "15,0% (acima de 720 dias)" },
];

// Definicao dos 4 Baldes Fundamentais
export const BUCKETS = {
  LIVING_ESSENTIAL: {
    id: "LIVING_ESSENTIAL",
    name: "Dinheiro para Viver (Essencial)",
    shortName: "Essencial",
    color: "#3b82f6",
    bgLight: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    description: "Moradia, alimentacao, contas basicas, transporte necessario e saude.",
    recommendedPct: 50,
  },
  LIVING_VARIABLE: {
    id: "LIVING_VARIABLE",
    name: "Dinheiro para Viver (Estilo de Vida)",
    shortName: "Variavel / Lazer",
    color: "#a855f7",
    bgLight: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    description: "Lazer, restaurantes, delivery, assinaturas, compras pessoais e hobbies.",
    recommendedPct: 25,
  },
  SECURITY: {
    id: "SECURITY",
    name: "Dinheiro para Seguranca",
    shortName: "Reserva de Emergencia",
    color: "#10b981",
    bgLight: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    description: "Reserva de emergencia com liquidez diaria e risco zero (3 a 6 meses de custos fixos).",
    recommendedPct: 10,
  },
  GOALS: {
    id: "GOALS",
    name: "Dinheiro para Objetivos",
    shortName: "Metas (Casa / Carro)",
    color: "#f59e0b",
    bgLight: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    description: "Entrada da casa propria, troca da Biz pelo carro e compras planejadas de medio prazo.",
    recommendedPct: 10,
  },
  GROWTH: {
    id: "GROWTH",
    name: "Dinheiro para Crescimento",
    shortName: "Renda Passiva / Futuro",
    color: "#06b6d4",
    bgLight: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    description: "Investimentos de longo prazo para independencia financeira e geracao de renda passiva.",
    recommendedPct: 5,
  },
};

// Utilitarios de Formatacao
export function formatBRL(value) {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCompactBRL(value) {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0";
  if (Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1).replace(".", ",")}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return formatBRL(value);
}

export function formatPct(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return "0,0%";
  return `${Number(value).toFixed(decimals).replace(".", ",")}%`;
}

export function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
