import { useState } from "react";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import { fmtDate, findOverlap } from "../lib/calc";
import { Sheet } from "./Shared";
import GanttChart from "./GanttChart";

export default function AlocacoesTab({ employees, projects, allocations, onAdd, onRemove, scopeId }) {
  const [form, setForm] = useState({ employeeId: employees[0]?.id || "", projectId: projects[0]?.id || "", inicio: "", fim: "" });
  const [conflict, setConflict] = useState(null);

  const submit = () => {
    setConflict(null);
    if (!form.employeeId || !form.projectId || !form.inicio || !form.fim) return;
    if (new Date(form.fim) < new Date(form.inicio)) { setConflict({ msg: "A data de fim não pode ser anterior à data de início." }); return; }
    const clash = findOverlap(form.employeeId, form.inicio, form.fim, allocations);
    if (clash) {
      const emp = employees.find((e) => e.id === form.employeeId);
      const proj = projects.find((p) => p.id === clash.project_id);
      setConflict({ msg: `${emp ? emp.nome : "Colaborador"} já está alocado em "${proj ? proj.nome : "outro projeto"}" de ${fmtDate(clash.inicio)} a ${fmtDate(clash.fim)}. Ajuste as datas ou remova a alocação existente.` });
      return;
    }
    onAdd({ employee_id: form.employeeId, project_id: form.projectId, inicio: form.inicio, fim: form.fim });
    setForm({ ...form, inicio: "", fim: "" });
  };

  const clearConflict = (patch) => { setForm({ ...form, ...patch }); setConflict(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Sheet title="Nova alocação" sub="Vincule um colaborador a um projeto em um período — datas sobrepostas para o mesmo colaborador são bloqueadas">
        <div className="form-row" style={{ gridTemplateColumns: "1.6fr 1.6fr 1fr 1fr auto" }}>
          <div><span className="form-label">Colaborador</span><select className="cpd-form-select" value={form.employeeId} onChange={(e) => clearConflict({ employeeId: e.target.value })}>{employees.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
          <div><span className="form-label">Projeto</span><select className="cpd-form-select" value={form.projectId} onChange={(e) => clearConflict({ projectId: e.target.value })}>{projects.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>
          <div><span className="form-label">Início</span><input className="cpd-input" type="date" value={form.inicio} onChange={(e) => clearConflict({ inicio: e.target.value })} /></div>
          <div><span className="form-label">Fim</span><input className="cpd-input" type="date" value={form.fim} onChange={(e) => clearConflict({ fim: e.target.value })} /></div>
          <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn" onClick={submit}><Plus size={14} />Adicionar</button></div>
        </div>
        {conflict && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(255,95,90,0.12)", border: "1px solid var(--red)", borderRadius: 5, padding: "9px 12px", fontSize: 12.5, color: "var(--red)" }}>
            <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{conflict.msg}</span>
          </div>
        )}
      </Sheet>

      <Sheet title="Linha do tempo" sub="Alocações de colaboradores por projeto">
        <GanttChart employees={employees} allocations={allocations} projects={projects} highlightProjectId={scopeId} />
      </Sheet>

      <Sheet title="Alocações cadastradas">
        <table className="cpd-table">
          <thead><tr><th>Colaborador</th><th>Projeto</th><th>Início</th><th>Fim</th><th></th></tr></thead>
          <tbody>
            {allocations.map((a) => {
              const emp = employees.find((e) => e.id === a.employee_id);
              const proj = projects.find((p) => p.id === a.project_id);
              return (
                <tr key={a.id}>
                  <td>{emp ? emp.nome : "—"}</td>
                  <td>{proj ? proj.nome : "—"}</td>
                  <td>{fmtDate(a.inicio)}</td>
                  <td>{fmtDate(a.fim)}</td>
                  <td><button className="btn icon" onClick={() => onRemove(a.id)}><Trash2 size={13} /></button></td>
                </tr>
              );
            })}
            {!allocations.length && <tr><td colSpan={5}><div className="cpd-empty">Nenhuma alocação cadastrada.</div></td></tr>}
          </tbody>
        </table>
      </Sheet>
    </div>
  );
}
