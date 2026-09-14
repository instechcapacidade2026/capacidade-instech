import { ROLES, STAGES, FAMILIES } from "../lib/constants";
import { fmtNum } from "../lib/calc";
import { Sheet } from "./Shared";

export default function ConfigTab({ config, onUpdateConfig }) {
  const setFamilyPct = (fam, i, val) => {
    const next = { ...config.familyPct, [fam]: [...config.familyPct[fam]] };
    next[fam][i] = Math.max(0, Math.min(100, Number(val))) / 100;
    onUpdateConfig({ familyPct: next });
  };
  const setRolePct = (role, i, val) => {
    const next = { ...config.rolePct, [role]: [...config.rolePct[role]] };
    next[role][i] = Math.max(0, Math.min(100, Number(val))) / 100;
    onUpdateConfig({ rolePct: next });
  };
  const familySum = (fam) => config.familyPct[fam].reduce((s, v) => s + v, 0);
  const stageSum = (i) => ROLES.reduce((s, r) => s + (config.rolePct[r][i] || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Sheet title="Parâmetros gerais">
        <div className="form-row" style={{ gridTemplateColumns: "220px 220px" }}>
          <div><span className="form-label">Horas por dia (padrão)</span><input className="cpd-input" type="number" value={config.horasDia} onChange={(e) => onUpdateConfig({ horasDia: Number(e.target.value) })} /></div>
          <div><span className="form-label">Dias úteis no período de análise (agregado)</span><input className="cpd-input" type="number" value={config.diasUteis} onChange={(e) => onUpdateConfig({ diasUteis: Number(e.target.value) })} /></div>
        </div>
      </Sheet>

      <Sheet title="% de horas totais por etapa, conforme o tipo de projeto" sub="Cada coluna (tipo) deve somar 100%">
        <table className="cpd-table matrix-table">
          <thead><tr><th>Etapa</th>{FAMILIES.map((f) => <th key={f}>{f}</th>)}</tr></thead>
          <tbody>
            {STAGES.map((stage, i) => (
              <tr key={stage}>
                <td>{stage}</td>
                {FAMILIES.map((fam) => (
                  <td key={fam}><input className="cpd-input" type="number" value={Math.round(config.familyPct[fam][i] * 1000) / 10} onChange={(e) => setFamilyPct(fam, i, e.target.value)} />%</td>
                ))}
              </tr>
            ))}
            <tr>
              <td>Verificação</td>
              {FAMILIES.map((fam) => {
                const s = familySum(fam) * 100;
                return <td key={fam} className={Math.abs(s - 100) < 0.5 ? "check-good" : "check-bad"}>{fmtNum(s, 0)}%</td>;
              })}
            </tr>
          </tbody>
        </table>
      </Sheet>

      <Sheet title="% de horas de cada etapa executado por função" sub="Cada coluna (etapa) deve somar 100%">
        <div style={{ overflowX: "auto" }}>
          <table className="cpd-table matrix-table">
            <thead><tr><th>Função</th>{STAGES.map((s) => <th key={s}>{s}</th>)}</tr></thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role}>
                  <td style={{ whiteSpace: "nowrap" }}>{role}</td>
                  {STAGES.map((_, i) => (
                    <td key={i}><input className="cpd-input" type="number" value={Math.round(config.rolePct[role][i] * 1000) / 10} onChange={(e) => setRolePct(role, i, e.target.value)} />%</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td>Verificação</td>
                {STAGES.map((_, i) => {
                  const s = stageSum(i) * 100;
                  return <td key={i} className={Math.abs(s - 100) < 0.5 ? "check-good" : "check-bad"}>{fmtNum(s, 0)}%</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Sheet>
    </div>
  );
}
