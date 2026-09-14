import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { ROLES, STAGES } from "../lib/constants";
import { stageHoursOf, scopeDemand, fmtNum, pesoEfetivo } from "../lib/calc";
import { Sheet, DecisionPill } from "./Shared";
import GanttChart from "./GanttChart";

const PIE_COLORS = ["#ff7a30", "#5fd4e0", "#ffc23c", "#9d8dff", "#3fd08c", "#ff5f5a", "#7ec8ff"];

export default function DashboardTab({ employees, projects, desenhos, allocations, config, scopeId }) {
  const roleHeadcount = useMemo(() => {
    const m = {}; ROLES.forEach((r) => (m[r] = 0));
    employees.forEach((e) => { if (m[e.role] !== undefined) m[e.role]++; });
    return m;
  }, [employees]);

  const demand = useMemo(() => scopeDemand(projects, desenhos, config, scopeId), [projects, desenhos, config, scopeId]);

  const roleRows = useMemo(() => ROLES.map((role) => {
    const disponivel = roleHeadcount[role] || 0;
    const necessario = demand.periodDays > 0 ? demand.roleHours[role] / (config.horasDia * demand.periodDays) : 0;
    const gap = necessario - disponivel;
    const capacidadeHoras = disponivel * config.horasDia * demand.periodDays;
    const utilizacao = capacidadeHoras > 0 ? demand.roleHours[role] / capacidadeHoras : 0;
    return { role, disponivel, necessario, gap, utilizacao };
  }), [demand, roleHeadcount, config]);

  const selectedProject = scopeId !== "all" ? projects.find((p) => p.id === scopeId) : null;

  const stagePieData = useMemo(() => {
    if (selectedProject) return stageHoursOf(selectedProject, desenhos, config).map((h, i) => ({ name: STAGES[i], value: +h.toFixed(1) }));
    const sums = STAGES.map(() => 0);
    demand.list.forEach((p) => stageHoursOf(p, desenhos, config).forEach((h, i) => (sums[i] += h)));
    return STAGES.map((s, i) => ({ name: s, value: +sums[i].toFixed(1) }));
  }, [selectedProject, demand, desenhos, config]);

  const sCurveData = useMemo(() => {
    if (!selectedProject) return [];
    const dias = Number(selectedProject.prazo) || 1;
    const peso = pesoEfetivo(selectedProject, desenhos);
    const pts = [];
    const step = Math.max(1, Math.round(dias / 20));
    for (let d = 0; d <= dias; d += step) {
      const t = d / dias;
      const smooth = 3 * t * t - 2 * t * t * t;
      pts.push({ dia: d, planejado: +(peso * smooth).toFixed(2) });
    }
    if (pts[pts.length - 1].dia !== dias) pts.push({ dia: dias, planejado: +peso.toFixed(2) });
    return pts;
  }, [selectedProject, desenhos]);

  const totalHSAtivos = demand.list.reduce((s, p) => s + pesoEfetivo(p, desenhos) * (Number(p.indice) || 0), 0);
  const utilMedia = roleRows.reduce((s, r) => s + r.utilizacao, 0) / (roleRows.length || 1);
  const gapCount = roleRows.filter((r) => r.gap > 0).length;

  return (
    <>
      <div className="cpd-kpis">
        <div className="cpd-kpi">
          <div className="cpd-kpi-label">Colaboradores na fábrica</div>
          <div className="cpd-kpi-value mono">{employees.length}</div>
          <div className="cpd-kpi-sub">{ROLES.length} funções cadastradas</div>
        </div>
        <div className="cpd-kpi">
          <div className="cpd-kpi-label">Projetos ativos</div>
          <div className="cpd-kpi-value mono">{projects.filter((p) => p.status === "Ativo").length}</div>
          <div className="cpd-kpi-sub">de {projects.length} cadastrados</div>
        </div>
        <div className="cpd-kpi">
          <div className="cpd-kpi-label">{selectedProject ? "HS totais do projeto" : "HS totais (ativos)"}</div>
          <div className="cpd-kpi-value mono">{fmtNum(selectedProject ? pesoEfetivo(selectedProject, desenhos) * (Number(selectedProject.indice) || 0) : totalHSAtivos, 0)}</div>
          <div className="cpd-kpi-sub">horas de mão de obra</div>
        </div>
        <div className="cpd-kpi">
          <div className="cpd-kpi-label">Utilização média de capacidade</div>
          <div className="cpd-kpi-value mono" style={{ color: utilMedia > 1 ? "var(--red)" : utilMedia > 0.85 ? "var(--amber)" : "var(--green)" }}>
            {fmtNum(utilMedia * 100, 0)}%
          </div>
          <div className="cpd-kpi-sub">{gapCount > 0 ? `${gapCount} função(ões) em déficit` : "todas as funções cobertas"}</div>
        </div>
      </div>

      <div className="cpd-grid2">
        <Sheet title="Capacidade instalada x necessária por função"
          sub={selectedProject ? `Projeto: ${selectedProject.nome} · prazo de ${selectedProject.prazo} dias` : `Agregado dos projetos ativos · período de ${config.diasUteis} dias úteis`}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={roleRows} margin={{ top: 6, right: 10, left: -14, bottom: 60 }}>
              <CartesianGrid stroke="var(--line-soft)" vertical={false} />
              <XAxis dataKey="role" stroke="var(--text-dim)" fontSize={10} angle={-40} textAnchor="end" interval={0} height={90} />
              <YAxis stroke="var(--text-dim)" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0e2a42", border: "1px solid #3e6d95", fontSize: 12 }} formatter={(v) => fmtNum(v, 1)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="disponivel" name="Disponível" fill="#5fd4e0" radius={[3, 3, 0, 0]} />
              <Bar dataKey="necessario" name="Necessário" fill="#ff7a30" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Sheet>

        <Sheet title="Distribuição de horas por etapa" sub={selectedProject ? selectedProject.nome : "Agregado dos projetos ativos"}>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie data={stagePieData} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius={110} innerRadius={56} paddingAngle={2}>
                {stagePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0e2a42", border: "1px solid #3e6d95", fontSize: 12 }} formatter={(v) => `${fmtNum(v, 1)} h`} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </Sheet>
      </div>

      <div className="cpd-grid2">
        {selectedProject ? (
          <Sheet title="Curva de produção planejada (S-curve)" sub={`Peso total: ${fmtNum(pesoEfetivo(selectedProject, desenhos), 2)} TN em ${selectedProject.prazo} dias`}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sCurveData} margin={{ top: 6, right: 14, left: -10, bottom: 4 }}>
                <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                <XAxis dataKey="dia" stroke="var(--text-dim)" fontSize={11} label={{ value: "dia", position: "insideBottomRight", offset: -2, fill: "var(--text-dim)", fontSize: 10 }} />
                <YAxis stroke="var(--text-dim)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0e2a42", border: "1px solid #3e6d95", fontSize: 12 }} formatter={(v) => `${fmtNum(v, 2)} TN`} labelFormatter={(l) => `Dia ${l}`} />
                <Area type="monotone" dataKey="planejado" name="Produção acumulada" stroke="#ff7a30" fill="#ff7a30" fillOpacity={0.22} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Sheet>
        ) : (
          <Sheet title="Selecione um projeto" sub="Escolha um projeto no topo da página para ver a curva de produção planejada e o detalhamento individual.">
            <div className="cpd-empty">Nenhum projeto selecionado — exibindo apenas dados agregados.</div>
          </Sheet>
        )}
        <Sheet title="Linha do tempo da equipe" sub={selectedProject ? `Alocações destacadas: ${selectedProject.nome}` : "Todas as alocações"}>
          <GanttChart employees={employees} allocations={allocations} projects={projects} highlightProjectId={scopeId} />
        </Sheet>
      </div>

      <Sheet title="Detalhe por função" sub="Base do cálculo de contratar, terceirizar ou manter a equipe atual">
        <table className="cpd-table">
          <thead><tr><th>Função</th><th>Disponível</th><th>Necessário</th><th>Gap</th><th>Utilização</th><th>Decisão</th></tr></thead>
          <tbody>
            {roleRows.map((r) => (
              <tr key={r.role}>
                <td>{r.role}</td>
                <td className="mono">{r.disponivel}</td>
                <td className="mono">{fmtNum(r.necessario, 2)}</td>
                <td className="mono" style={{ color: r.gap > 0 ? "var(--red)" : "var(--green)" }}>{r.gap > 0 ? "+" : ""}{fmtNum(r.gap, 2)}</td>
                <td className="mono">{fmtNum(r.utilizacao * 100, 0)}%</td>
                <td><DecisionPill gap={r.gap} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>
    </>
  );
}
