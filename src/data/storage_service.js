import { INITIAL_FINANCIAL_STATE, BLANK_FINANCIAL_STATE } from "./initial_state.js";

const STORAGE_KEY = "central_financeira_state_v1";

class StorageService {
  constructor() {
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...BLANK_FINANCIAL_STATE,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn("Erro ao carregar estado do LocalStorage:", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_FINANCIAL_STATE));
  }

  saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.notify(state);
      return true;
    } catch (e) {
      console.error("Erro ao salvar estado:", e);
      return false;
    }
  }

  resetState() {
    return this.resetToInitialTemplate();
  }

  resetToInitialTemplate() {
    try {
      const initial = JSON.parse(JSON.stringify(INITIAL_FINANCIAL_STATE));
      this.saveState(initial);
      return initial;
    } catch (e) {
      console.error("Erro ao resetar estado:", e);
      return INITIAL_FINANCIAL_STATE;
    }
  }

  clearStateToBlank() {
    try {
      const blank = JSON.parse(JSON.stringify(BLANK_FINANCIAL_STATE));
      this.saveState(blank);
      return blank;
    } catch (e) {
      console.error("Erro ao limpar estado para branco:", e);
      return BLANK_FINANCIAL_STATE;
    }
  }

  exportJSON(state) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadAnchor.setAttribute("download", `backup_central_financeira_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) {
        this.saveState(parsed);
        return { success: true, data: parsed };
      }
      return { success: false, error: "Arquivo JSON inválido para a Central Financeira." };
    } catch (e) {
      return { success: false, error: "Falha ao decodificar arquivo JSON." };
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(state) {
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (e) {
        console.error("Erro no listener de estado:", e);
      }
    }
  }
}

export const storageService = new StorageService();
