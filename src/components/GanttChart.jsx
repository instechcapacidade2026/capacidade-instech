import { PROJECT_PALETTE } from "../lib/constants";
import { fmtDate } from "../lib/calc";

export default function GanttChart({ employees, allocations, projects, highlightProjectId }) {
  if (!allocations.length) return <div className="cpd-empty">Nenhuma alocação cadastrada ainda.</div>;

  const empIds = Array.from(new Set(allocations.map((a) => a.employee_id)));
  const rows = employees.filter((e) => empIds.includes(e.id));
  if (!rows.length) return <div className="cpd-empty">Nenhuma alocação cadastrada ainda.</div>;

  const dates = allocations.flatMap((a) => [new Date(a.inicio), new Date(a.fim)]);
  const minD = new Date(Math.min(...dates));
  const maxD = new Date(Math.max(...dates));
  const totalMs = Math.max(1, maxD - minD);

  const months = [];
  let cur = new Date(minD.getFullYear(), minD.getMonth(), 1);
  while (cur <= maxD) {
    months.push({ label: cur.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), left: ((cur - minD) / totalMs) * 100 });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  const projColor = (pid) => PROJECT_PALETTE[projects.findIndex((p) => p.id === pid) % PROJECT_PALETTE.length];

  return (
    <div>
      <div className="gantt-wrap">
        <div className="gantt-months">
          {months.map((m, i) => (
            <div key={i} className="gantt-month-label" style={{ left: `${m.left}%` }}>{m.label}</div>
          ))}
        </div>
        {rows.map((emp) => {
          const empAllocs = allocations.filter((a) => a.employee_id === emp.id);
          return (
            <div className="gantt-row" key={emp.id}>
              <div className="gantt-name">{emp.nome}<span className="role">{emp.role}</span></div>
              <div className="gantt-track">
                {empAllocs.map((a) => {
                  const s = new Date(a.inicio), e = new Date(a.fim);
                  const left = ((s - minD) / totalMs) * 100;
                  const width = Math.max(0.6, ((e - s) / totalMs) * 100);
                  const proj = projects.find((p) => p.id === a.project_id);
                  const dim = highlightProjectId !== "all" && a.project_id !== highlightProjectId;
                  return (
                    <div key={a.id} className={`gantt-bar${dim ? " dim" : ""}`}
                      style={{ left: `${left}%`, width: `${width}%`, background: projColor(a.project_id) }}
                      title={`${proj ? proj.nome : "?"} — ${fmtDate(a.inicio)} a ${fmtDate(a.fim)}`}>
                      {width > 8 ? (proj ? proj.nome.split(" ")[0] : "") : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "14px" }}>
        {projects.map((p, i) => (
          <div key={p.id} style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", alignItems: "center" }}>
            <span className="legend-dot" style={{ background: PROJECT_PALETTE[i % PROJECT_PALETTE.length] }} />{p.nome}
          </div>
        ))}
      </div>
    </div>
  );
}
