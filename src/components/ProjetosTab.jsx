import { useState } from "react";
import { Plus, Trash2, ExternalLink, Link2 } from "lucide-react";
import { FAMILIES } from "../lib/constants";
import { fmtDate, fmtNum, pesoEfetivo } from "../lib/calc";
import { Sheet } from "./Shared";

export default function ProjetosTab({
  projects, desenhos, scopeId, onAddProject, onRemoveProject, onUpdateProject, onSelect,
  onAddDesenho, onUpdateDesenho, onRemoveDesenho,
}) {
  const [form, setForm] = useState({ nome: "", tipo: FAMILIES[0], peso: "", indice: "", inicio: "", prazo: "", status: "Ativo" });
  const submit = () => {
    if (!form.nome || !form.indice || !form.inicio || !form.prazo) return;
    onAddProject({ ...form, peso: Number(form.peso) || 0, indice: Number(form.indice), prazo: Number(form.prazo) });
    setForm({ nome: "", tipo: FAMILIES[0], peso: "", indice: "", inicio: "", prazo: "", status: "Ativo" });
  };
  const selectedProject = projects.find((p) => p.id === scopeId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Sheet title="Novo projeto" sub="Cadastre um projeto fechado. O peso pode ficar em branco se você for cadastrar os desenhos (filhos) individualmente abaixo.">
        <div className="form-row" style={{ gridTemplateColumns: "1.8fr 1.2fr 1fr 1fr 1fr 0.8fr auto" }}>
          <div><span className="form-label">Descrição</span><input className="cpd-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Tanque de Lastro — Cliente X" /></div>
          <div><span className="form-label">Tipo</span><select className="cpd-form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>{FAMILIES.map((f) => <option key={f}>{f}</option>)}</select></div>
          <div><span className="form-label">Peso manual (TN)</span><input className="cpd-input" type="number" step="0.01" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} placeholder="opcional" /></div>
          <div><span className="form-label">Índice (HS/TN)</span><input className="cpd-input" type="number" step="0.01" value={form.indice} onChange={(e) => setForm({ ...form, indice: e.target.value })} /></div>
          <div><span className="form-label">Início</span><input className="cpd-input" type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} /></div>
          <div><span className="form-label">Prazo (dias)</span><input className="cpd-input" type="number" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} /></div>
          <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn" onClick={submit}><Plus size={14} />Adicionar</button></div>
        </div>
      </Sheet>

      <Sheet title="Projetos cadastrados" sub="Clique no nome para abrir no Dashboard e gerenciar os desenhos abaixo">
        <div style={{ overflowX: "auto" }}>
          <table className="cpd-table">
            <thead><tr><th>Descrição</th><th>Tipo</th><th>Peso (TN)</th><th>Índice</th><th>HS Total</th><th>Início</th><th>Prazo</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {projects.map((p) => {
                const peso = pesoEfetivo(p, desenhos);
                return (
                  <tr key={p.id} style={p.id === scopeId ? { background: "rgba(255,122,48,0.08)" } : undefined}>
                    <td><button className="btn secondary" style={{ padding: "4px 10px" }} onClick={() => onSelect(p.id)}>{p.nome}</button></td>
                    <td>{p.tipo}</td>
                    <td className="mono">{fmtNum(peso, 2)}</td>
                    <td className="mono">{fmtNum(p.indice, 2)}</td>
                    <td className="mono">{fmtNum(peso * (Number(p.indice) || 0), 0)}</td>
                    <td>{fmtDate(p.inicio)}</td>
                    <td className="mono">{p.prazo}d</td>
                    <td>
                      <select className="cpd-form-select" style={{ width: "auto" }} value={p.status} onChange={(e) => onUpdateProject(p.id, { status: e.target.value })}>
                        <option>Ativo</option><option>Concluído</option><option>Cancelado</option>
                      </select>
                    </td>
                    <td><button className="btn icon" onClick={() => onRemoveProject(p.id)}><Trash2 size={13} /></button></td>
                  </tr>
                );
              })}
              {!projects.length && <tr><td colSpan={9}><div className="cpd-empty">Nenhum projeto cadastrado.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </Sheet>

      <DesenhosPanel project={selectedProject} desenhos={desenhos} onAddDesenho={onAddDesenho} onUpdateDesenho={onUpdateDesenho} onRemoveDesenho={onRemoveDesenho} />
    </div>
  );
}

function DesenhosPanel({ project, desenhos, onAddDesenho, onUpdateDesenho, onRemoveDesenho }) {
  const [nome, setNome] = useState("");
  const [peso, setPeso] = useState("");
  const [link, setLink] = useState("");

  if (!project) {
    return (
      <Sheet title="Desenhos do projeto" sub="Selecione um projeto na tabela acima para cadastrar os desenhos (filhos) que o compõem">
        <div className="cpd-empty">Nenhum projeto selecionado.</div>
      </Sheet>
    );
  }
  const filhos = desenhos.filter((d) => d.project_id === project.id);
  const pesoTotal = filhos.reduce((s, d) => s + (Number(d.peso) || 0), 0);
  const concluidos = filhos.filter((d) => d.status === "Concluído").length;
  const pct = filhos.length ? Math.round((concluidos / filhos.length) * 100) : 0;

  const add = () => {
    if (!nome) return;
    onAddDesenho(project.id, { nome, peso: Number(peso) || 0, link_desenho: link, status: "Pendente" });
    setNome(""); setPeso(""); setLink("");
  };

  return (
    <Sheet title={`Desenhos — ${project.nome}`} sub="Cada desenho representa uma peça/conjunto do projeto pai, com seu próprio peso e link do desenho no sistema externo">
      {filhos.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-dim)", marginBottom: 5 }}>
            <span>Progresso · peso total dos desenhos: <span className="mono">{fmtNum(pesoTotal, 2)} TN</span></span>
            <span className="mono">{concluidos}/{filhos.length} · {pct}%</span>
          </div>
          <div style={{ height: 7, background: "var(--bg2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--orange)" }} />
          </div>
        </div>
      )}
      <table className="cpd-table">
        <thead><tr><th>Desenho</th><th>Peso (TN)</th><th>Status</th><th>Link</th><th></th></tr></thead>
        <tbody>
          {filhos.map((d) => (
            <tr key={d.id}>
              <td>{d.nome}</td>
              <td>
                <input className="cpd-input" type="number" step="0.01" style={{ width: 90 }} value={d.peso}
                  onChange={(e) => onUpdateDesenho(d.id, { peso: Number(e.target.value) || 0 })} />
              </td>
              <td>
                <select className="cpd-form-select" style={{ width: "auto" }} value={d.status} onChange={(e) => onUpdateDesenho(d.id, { status: e.target.value })}>
                  <option>Pendente</option><option>Em Andamento</option><option>Concluído</option>
                </select>
              </td>
              <td style={{ minWidth: 200 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input className="cpd-input" style={{ fontSize: 11.5 }} placeholder="colar link do desenho..." value={d.link_desenho || ""}
                    onChange={(e) => onUpdateDesenho(d.id, { link_desenho: e.target.value })} />
                  {d.link_desenho ? (
                    <a href={d.link_desenho} target="_blank" rel="noopener noreferrer" className="btn icon" style={{ color: "var(--cyan)", borderColor: "var(--cyan)" }} title="Abrir desenho">
                      <ExternalLink size={13} />
                    </a>
                  ) : <Link2 size={13} style={{ color: "var(--text-dim)", flexShrink: 0 }} />}
                </div>
              </td>
              <td><button className="btn icon" onClick={() => onRemoveDesenho(d.id)}><Trash2 size={13} /></button></td>
            </tr>
          ))}
          {!filhos.length && <tr><td colSpan={5}><div className="cpd-empty">Nenhum desenho cadastrado ainda — o peso do projeto usa o valor manual.</div></td></tr>}
        </tbody>
      </table>
      <div className="form-row" style={{ gridTemplateColumns: "1.6fr 0.8fr 1.6fr auto", marginTop: 14, marginBottom: 0 }}>
        <div><span className="form-label">Nome do desenho</span><input className="cpd-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Costado — chapa 01" /></div>
        <div><span className="form-label">Peso (TN)</span><input className="cpd-input" type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} /></div>
        <div><span className="form-label">Link do desenho</span><input className="cpd-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." /></div>
        <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn" onClick={add}><Plus size={14} />Adicionar</button></div>
      </div>
    </Sheet>
  );
}
