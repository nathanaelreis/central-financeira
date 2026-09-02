/**
 * Classificador Inteligente de Extratos e Transacoes
 */
export const CATEGORY_RULES = [
  // 1. Moradia & Contas Essenciais
  {
    category: "Moradia & Contas",
    bucket: "LIVING_ESSENTIAL",
    type: "EXPENSE_ESSENTIAL",
    keywords: [
      "aluguel", "condominio", "celesc", "casan", "enel", "sabesp", "copel", "cpfl",
      "luz", "energia", "agua", "gas", "internet", "claro", "vivo", "tim", "oi fibra"
    ],
  },
  // 2. Alimentacao Basica
  {
    category: "Supermercado & Alimentacao",
    bucket: "LIVING_ESSENTIAL",
    type: "EXPENSE_ESSENTIAL",
    keywords: [
      "supermercado", "mercado", "giassi", "angeloni", "bistek", "fort atacadista",
      "komprao", "atacadao", "carrefour", "pao de acucar", "acougue", "padaria", "hortifruti", "sacolao"
    ],
  },
  // 3. Transporte & Combustivel
  {
    category: "Transporte & Biz",
    bucket: "LIVING_ESSENTIAL",
    type: "EXPENSE_ESSENTIAL",
    keywords: [
      "posto", "ipiranga", "shell", "petrobras", "combustivel", "gasolina", "etanol",
      "mecanica", "oficina", "moto", "honda", "pneu", "oleo", "ipva", "licenciamento", "pedagio"
    ],
  },
  // 4. Saude & Farmacia
  {
    category: "Saude & Cuidados",
    bucket: "LIVING_ESSENTIAL",
    type: "EXPENSE_ESSENTIAL",
    keywords: [
      "farmacia", "droga raia", "drogasil", "panvel", "sao joao", "pague menos",
      "laboratorio", "clinica", "medico", "dentista", "consulta", "exame", "unimed"
    ],
  },
  // 5. Lazer & Restaurantes
  {
    category: "Lazer & Restaurantes",
    bucket: "LIVING_VARIABLE",
    type: "EXPENSE_VARIABLE",
    keywords: [
      "ifood", "uber eats", "rappi", "restaurante", "pizzaria", "churrascaria", "bar",
      "hamburgueria", "burger", "boteco", "cervejaria", "cinema", "cinemark", "ingresso", "festa"
    ],
  },
  // 6. Assinaturas & Streaming
  {
    category: "Assinaturas & Servicos",
    bucket: "LIVING_VARIABLE",
    type: "EXPENSE_VARIABLE",
    keywords: [
      "netflix", "spotify", "amazon prime", "disney", "max", "hbo", "youtube", "globo",
      "apple.com", "google storage", "chatgpt", "midjourney", "game pass", "playstation", "steam"
    ],
  },
  // 7. Compras & Vestuario
  {
    category: "Compras Pessoais",
    bucket: "LIVING_VARIABLE",
    type: "EXPENSE_VARIABLE",
    keywords: [
      "mercado livre", "amazon", "shopee", "shein", "aliexpress", "zara", "renner",
      "riachuelo", "c&a", "centauro", "calcados", "roupa", "magazine luiza", "kabum"
    ],
  },
  // 8. Investimentos & Aportes
  {
    category: "Aportes & Investimentos",
    bucket: "GROWTH",
    type: "INVESTMENT_DEPOSIT",
    keywords: [
      "cdb", "tesouro", "caixinha", "investimento", "nu invest", "rico", "xp", "btg",
      "inter cdb", "aplicacao", "poupanca", "reserva"
    ],
  },
  // 9. Renda / Salario
  {
    category: "Salario & Renda",
    bucket: "LIVING_ESSENTIAL",
    type: "INCOME",
    keywords: [
      "salario", "folha", "pagamento recebido", "pix recebido", "ted recebida", "transferencia recebida",
      "pro-labore", "13o", "ferias", "remuneracao", "deposito recebido"
    ],
  },
];

/**
 * Classifica uma descricao de transacao com base em palavras-chave
 */
export function categorizeTransactionDescription(description = "") {
  const clean = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (clean.includes(kw)) {
        return {
          category: rule.category,
          bucket: rule.bucket,
          type: rule.type,
          confidence: "HIGH",
        };
      }
    }
  }

  // Fallback padrao
  return {
    category: "Outros Gastos",
    bucket: "LIVING_VARIABLE",
    type: "EXPENSE_VARIABLE",
    confidence: "LOW",
  };
}

/**
 * Parser de texto livre ou CSV de extrato bancario
 */
export function parseRawStatementText(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const parsed = [];

  for (const line of lines) {
    // Tenta padrao CSV: Data;Descricao;Valor ou Data,Descricao,Valor
    const csvParts = line.split(/[;,|\t]/);
    if (csvParts.length >= 3) {
      const datePart = csvParts[0].trim();
      const descPart = csvParts[1].trim();
      const rawVal = csvParts[2].trim().replace("R$", "").replace(/\s/g, "").replace(".", "").replace(",", ".");
      const amount = parseFloat(rawVal);

      if (!isNaN(amount) && descPart.length > 0) {
        const cat = categorizeTransactionDescription(descPart);
        parsed.push({
          id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          date: datePart.includes("/") ? formatDateFromBR(datePart) : datePart,
          description: descPart,
          amount: Math.abs(amount),
          type: amount < 0 ? cat.type : (cat.type === "INCOME" ? "INCOME" : "EXPENSE_VARIABLE"),
          category: cat.category,
          bucket: cat.bucket,
          confidence: cat.confidence,
        });
        continue;
      }
    }

    // Tenta regex para extratos em texto colado (ex: "15/08 Posto Ipiranga R$ 50,00" ou "20/08 - Ifood - 42.50")
    const match = line.match(/(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)\s+[-–]?\s*(.+?)\s+[-–]?\s*R?\$?\s*([-\d\.,]+)$/i);
    if (match) {
      const datePart = match[1];
      const descPart = match[2].trim();
      const rawVal = match[3].replace(/\./g, "").replace(",", ".");
      const amount = parseFloat(rawVal);

      if (!isNaN(amount)) {
        const cat = categorizeTransactionDescription(descPart);
        parsed.push({
          id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          date: formatDateFromBR(datePart),
          description: descPart,
          amount: Math.abs(amount),
          type: amount < 0 ? cat.type : (cat.type === "INCOME" ? "INCOME" : "EXPENSE_VARIABLE"),
          category: cat.category,
          bucket: cat.bucket,
          confidence: cat.confidence,
        });
      }
    }
  }

  return parsed;
}

function formatDateFromBR(dateStr) {
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 2) {
    const year = new Date().getFullYear();
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    let year = parts[2];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split("T")[0];
}
