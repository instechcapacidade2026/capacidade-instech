export const ROLES = [
  "Auxiliar de Montagem", "Auxiliar de Pintor Jatista", "Caldeireiro", "Jatista",
  "Mecânico Montador", "Meio Oficial Montador", "Operador de Plasma CNC", "Pintor Jatista",
  "Soldador", "Supervisor de Montagem", "Técnico de Segurança do Trabalho", "Torneiro",
  "Operador de Caminhão Munck",
];

export const STAGES = [
  "Corte de Matéria-Prima", "Dobra / Usinagem", "Montagem",
  "Traçagem / Gabarito", "Limpeza", "Jateamento", "Pintura",
];

export const FAMILIES = ["Tanques e Vasos", "Estruturas Metálicas", "Tubulação"];

export const DEFAULT_FAMILY_PCT = {
  "Tanques e Vasos":      [0.15, 0.20, 0.35, 0.05, 0.05, 0.08, 0.12],
  "Estruturas Metálicas": [0.20, 0.15, 0.40, 0.05, 0.05, 0.06, 0.09],
  "Tubulação":            [0.25, 0.25, 0.30, 0.03, 0.04, 0.05, 0.08],
};

export const DEFAULT_ROLE_PCT = {
  "Auxiliar de Montagem":             [0.20, 0.20, 0.15, 0.00, 0.60, 0.00, 0.00],
  "Auxiliar de Pintor Jatista":       [0.00, 0.00, 0.00, 0.00, 0.20, 0.20, 0.30],
  "Caldeireiro":                      [0.00, 0.00, 0.30, 0.50, 0.00, 0.00, 0.00],
  "Jatista":                          [0.00, 0.00, 0.00, 0.00, 0.20, 0.80, 0.00],
  "Mecânico Montador":                [0.30, 0.40, 0.10, 0.50, 0.00, 0.00, 0.00],
  "Meio Oficial Montador":            [0.00, 0.00, 0.20, 0.00, 0.00, 0.00, 0.00],
  "Operador de Plasma CNC":           [0.50, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
  "Pintor Jatista":                   [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.70],
  "Soldador":                         [0.00, 0.00, 0.25, 0.00, 0.00, 0.00, 0.00],
  "Supervisor de Montagem":           [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
  "Técnico de Segurança do Trabalho": [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
  "Torneiro":                         [0.00, 0.40, 0.00, 0.00, 0.00, 0.00, 0.00],
  "Operador de Caminhão Munck":       [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
};

export const DEFAULT_CONFIG = {
  familyPct: DEFAULT_FAMILY_PCT,
  rolePct: DEFAULT_ROLE_PCT,
  diasUteis: 22,
  horasDia: 9,
};

export const PROJECT_PALETTE = ["#ff7a30", "#5fd4e0", "#ffc23c", "#9d8dff", "#3fd08c", "#ff5f5a", "#7ec8ff"];
