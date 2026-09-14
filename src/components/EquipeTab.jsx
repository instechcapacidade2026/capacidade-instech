import { useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { ROLES } from "../lib/constants";
import { Sheet } from "./Shared";

export default function EquipeTab({ employees, onAddEmployee, onRemoveEmployee, onUpdateEmployee }) {
  const [nome, setNome] = useState("");
  const [role, setRole] = useState(ROLES[0]);

  const roleHeadcount = useMemo(() => {
    const m = {}; ROLES.forEach((r) => (m[r] = 0));
    employees.forEach((e) => { if (m[e.role] !== undefined) m[e.role]++; });
    return m;
  }, [employees]);
  const chartData = ROLES.map((r) => ({ role: r, qtd: roleHeadcount[r] || 0 }));

  return (
    <div className="cpd-grid2">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Sheet title="Adicionar colaborador">
          <div className="form-row" style={{ gridTemplateColumns: "2fr 1.6fr auto" }}>
            <div><span className="form-label">Nome</span><input className="cpd-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" /></div>
            <div><span className="form-label">Função</span><select className="cpd-form-select" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn" onClick={() => { if (nome) { onAddEmployee(nome, role); setNome(""); } }}><Plus size={14} />Adicionar</button>
            </div>
          </div>
        </Sheet>
        <Sheet title={`Equipe (${employees.length} colaboradores)`}>
          <div style={{ maxHeight: 460, overflowY: "auto" }}>
            <table className="cpd-table">
              <thead><tr><th>Nome</th><th>Função</th><th></th></tr></thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td>{e.nome}</td>
                    <td><select className="cpd-form-select" value={e.role} onChange={(ev) => onUpdateEmployee(e.id, { role: ev.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td>
                    <td><button className="btn icon" onClick={() => onRemoveEmployee(e.id)}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sheet>
      </div>
      <Sheet title="Efetivo por função" sub="Capacidade instalada atual">
        <ResponsiveContainer width="100%" height={520}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid stroke="var(--line-soft)" horizontal={false} />
            <XAxis type="number" stroke="var(--text-dim)" fontSize={11} allowDecimals={false} />
            <YAxis type="category" dataKey="role" stroke="var(--text-dim)" fontSize={10.5} width={170} />
            <Tooltip contentStyle={{ background: "#0e2a42", border: "1px solid #3e6d95", fontSize: 12 }} />
            <Bar dataKey="qtd" name="Colaboradores" fill="#5fd4e0" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Sheet>
    </div>
  );
}
