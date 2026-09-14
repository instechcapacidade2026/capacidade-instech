import { ROLES, STAGES } from "./constants";

export const uid = (p) => p + Math.random().toString(36).slice(2, 9);
export const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—");
export const fmtNum = (n, dec = 1) => (isFinite(n) ? n.toFixed(dec).replace(".", ",") : "—");

/** Peso do projeto = soma dos desenhos cadastrados; se não houver nenhum, usa o peso manual do projeto. */
export function pesoEfetivo(project, desenhos) {
  const filhos = (desenhos || []).filter((d) => d.project_id === project.id);
  if (filhos.length > 0) return filhos.reduce((s, d) => s + (Number(d.peso) || 0), 0);
  return Number(project.peso) || 0;
}

export function stageHoursOf(project, desenhos, config) {
  const pct = config.familyPct[project.tipo] || STAGES.map(() => 0);
  const total = pesoEfetivo(project, desenhos) * (Number(project.indice) || 0);
  return STAGES.map((_, i) => total * (pct[i] || 0));
}

export function roleHoursOf(project, desenhos, config) {
  const sh = stageHoursOf(project, desenhos, config);
  const out = {};
  ROLES.forEach((role) => {
    const pct = config.rolePct[role] || STAGES.map(() => 0);
    out[role] = sh.reduce((sum, h, i) => sum + h * (pct[i] || 0), 0);
  });
  return out;
}

export function scopeDemand(projects, desenhos, config, scopeId) {
  const list = scopeId === "all" ? projects.filter((p) => p.status === "Ativo") : projects.filter((p) => p.id === scopeId);
  const roleHours = {};
  ROLES.forEach((r) => (roleHours[r] = 0));
  list.forEach((p) => {
    const rh = roleHoursOf(p, desenhos, config);
    ROLES.forEach((r) => (roleHours[r] += rh[r]));
  });
  const periodDays = scopeId !== "all" && list[0] ? Number(list[0].prazo) || 1 : config.diasUteis;
  return { roleHours, periodDays, list };
}

/** Retorna a alocação existente do colaborador que colide com o período informado (ou undefined). */
export function findOverlap(employeeId, inicio, fim, allocations, excludeId) {
  const s1 = new Date(inicio), e1 = new Date(fim);
  return allocations.find(
    (a) => a.employee_id === employeeId && a.id !== excludeId && new Date(a.inicio) <= e1 && s1 <= new Date(a.fim)
  );
}
