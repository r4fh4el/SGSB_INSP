export const COOKIE_NAME = "session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Informações da aplicação
// Detecta se está rodando no servidor (Node.js) ou cliente (browser)
const isServer = typeof window === 'undefined';
const env = isServer ? process.env : (import.meta as any).env;

export const APP_TITLE = env?.VITE_APP_TITLE || "SGSB - Sistema de Gestão e Segurança de Barragem";
export const APP_LOGO = env?.VITE_APP_LOGO || "/logo.svg";

// URL de login OAuth
export function getLoginUrl() {
  const appId = env?.VITE_APP_ID || "";
  const portalUrl = env?.VITE_OAUTH_PORTAL_URL || "https://auth.manus.im";
  const redirectUri = isServer ? "" : `${window.location.origin}/api/oauth/callback`;
  return `${portalUrl}/oauth/authorize?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// Roles do sistema
export const ROLES = {
  ADMIN: "admin",
  GESTOR: "gestor",
  CONSULTOR: "consultor",
  INSPETOR: "inspetor",
  LEITURISTA: "leiturista",
  VISUALIZADOR: "visualizador",
} as const;

export const ROLE_LABELS = {
  admin: "Administrador",
  gestor: "Gestor",
  consultor: "Consultor",
  inspetor: "Inspetor",
  leiturista: "Leiturista",
  visualizador: "Visualizador",
} as const;

// Status e constantes do sistema
export const BARRAGEM_STATUS_LABELS = {
  ativa: "Ativa",
  inativa: "Inativa",
  em_construcao: "Em Construção",
} as const;

export const CHECKLIST_STATUS_LABELS = {
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  aprovado: "Aprovado",
} as const;

export const CHECKLIST_RESPOSTAS_LABELS = {
  NO: "Não Observado",
  PV: "Primeira Vez",
  PC: "Permaneceu Constante",
  AM: "Aumentou",
  DM: "Diminuiu",
  DS: "Desapareceu",
} as const;

export const OCORRENCIA_STATUS_LABELS = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  em_acao: "Em Ação",
  concluida: "Concluída",
  cancelada: "Cancelada",
} as const;

export const OCORRENCIA_SEVERIDADE_LABELS = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
} as const;

export const ALERTA_SEVERIDADE_LABELS = {
  info: "Informação",
  aviso: "Aviso",
  alerta: "Alerta",
  critico: "Crítico",
} as const;
