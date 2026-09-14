import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, FolderKanban, CalendarRange, Settings2, ChevronDown, LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { DEFAULT_CONFIG } from "./lib/constants";
import LoginPage from "./components/LoginPage";
import DashboardTab from "./components/DashboardTab";
import ProjetosTab from "./components/ProjetosTab";
import EquipeTab from "./components/EquipeTab";
import AlocacoesTab from "./components/AlocacoesTab";
import ConfigTab from "./components/ConfigTab";
import logo from "./assets/logo.js";

function configFromRow(row) {
  if (!row) return DEFAULT_CONFIG;
  return {
    familyPct: row.family_pct || DEFAULT_CONFIG.familyPct,
    rolePct: row.role_pct || DEFAULT_CONFIG.rolePct,
    diasUteis: row.dias_uteis ?? DEFAULT_CONFIG.diasUteis,
    horasDia: row.horas_dia ?? DEFAULT_CONFIG.horasDia,
  };
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = carregando, null = deslogado
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [scopeId, setScopeId] = useState("all");

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [desenhos, setDesenhos] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    const [e, p, d, a, c] = await Promise.all([
      supabase.from("employees").select("*").order("nome"),
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("desenhos").select("*").order("created_at"),
      supabase.from("allocations").select("*").order("inicio"),
      supabase.from("config").select("*").eq("id", 1).maybeSingle(),
    ]);
    setEmployees(e.data || []);
    setProjects(p.data || []);
    setDesenhos(d.data || []);
    setAllocations(a.data || []);
    setConfig(configFromRow(c.data));
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (session) loadAll();
  }, [session, loadAll]);

  if (session === undefined) return <div className="cpd app-loading">Carregando…</div>;
  if (!session) return <LoginPage />;

  /* ---------------- CRUD: employees ---------------- */
  const addEmployee = async (nome, role) => {
    const { data } = await supabase.from("employees").insert({ nome, role }).select().single();
    if (data) setEmployees((v) => [...v, data]);
  };
  const removeEmployee = async (id) => {
    await supabase.from("employees").delete().eq("id", id);
    setEmployees((v) => v.filter((e) => e.id !== id));
  };
  const updateEmployee = async (id, patch) => {
    setEmployees((v) => v.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    await supabase.from("employees").update(patch).eq("id", id);
  };

  /* ---------------- CRUD: projects ---------------- */
  const addProject = async (proj) => {
    const { data } = await supabase.from("projects").insert(proj).select().single();
    if (data) setProjects((v) => [...v, data]);
  };
  const removeProject = async (id) => {
    await supabase.from("projects").delete().eq("id", id); // desenhos/allocations em cascata (FK on delete cascade)
    setProjects((v) => v.filter((p) => p.id !== id));
    setDesenhos((v) => v.filter((d) => d.project_id !== id));
    setAllocations((v) => v.filter((a) => a.project_id !== id));
    if (scopeId === id) setScopeId("all");
  };
  const updateProject = async (id, patch) => {
    setProjects((v) => v.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await supabase.from("projects").update(patch).eq("id", id);
  };

  /* ---------------- CRUD: desenhos (filhos do projeto) ---------------- */
  const addDesenho = async (projectId, payload) => {
    const { data } = await supabase.from("desenhos").insert({ project_id: projectId, ...payload }).select().single();
    if (data) setDesenhos((v) => [...v, data]);
  };
  const updateDesenho = async (id, patch) => {
    setDesenhos((v) => v.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    await supabase.from("desenhos").update(patch).eq("id", id);
  };
  const removeDesenho = async (id) => {
    await supabase.from("desenhos").delete().eq("id", id);
    setDesenhos((v) => v.filter((d) => d.id !== id));
  };

  /* ---------------- CRUD: allocations ---------------- */
  const addAllocation = async (payload) => {
    const { data } = await supabase.from("allocations").insert(payload).select().single();
    if (data) setAllocations((v) => [...v, data]);
  };
  const removeAllocation = async (id) => {
    await supabase.from("allocations").delete().eq("id", id);
    setAllocations((v) => v.filter((a) => a.id !== id));
  };

  /* ---------------- config ---------------- */
  const updateConfig = async (patch) => {
    const next = { ...config, ...patch };
    setConfig(next);
    await supabase.from("config").upsert({
      id: 1,
      dias_uteis: next.diasUteis,
      horas_dia: next.horasDia,
      family_pct: next.familyPct,
      role_pct: next.rolePct,
    });
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <div className="cpd">
      <div className="cpd-shell">
        <div className="cpd-topbar">
          <div className="cpd-brand">
            <img className="cpd-logo" src={logo} alt="Instech" />
            <div className="cpd-brand-divider" />
            <div>
              <h1>Painel de Capacidade Produtiva</h1>
              <span>Indústria Metalmecânica · Montagem Industrial</span>
            </div>
          </div>
          <div className="cpd-select-wrap">
            <select className="cpd-select" value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              <option value="all">Todos os projetos ativos</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
          <button className="topbar-signout" onClick={signOut}><LogOut size={13} />Sair</button>
        </div>

        <div className="cpd-tabs">
          {[
            ["dashboard", "Dashboard", LayoutDashboard],
            ["projetos", "Projetos", FolderKanban],
            ["equipe", "Equipe", Users],
            ["alocacoes", "Linha do Tempo", CalendarRange],
            ["config", "Configurações", Settings2],
          ].map(([id, label, Icon]) => (
            <button key={id} className={`cpd-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div className="cpd-main">
          {loadingData ? (
            <div className="cpd-empty">Carregando dados…</div>
          ) : (
            <>
              {tab === "dashboard" && (
                <DashboardTab employees={employees} projects={projects} desenhos={desenhos} allocations={allocations} config={config} scopeId={scopeId} />
              )}
              {tab === "projetos" && (
                <ProjetosTab projects={projects} desenhos={desenhos} scopeId={scopeId}
                  onAddProject={addProject} onRemoveProject={removeProject} onUpdateProject={updateProject} onSelect={setScopeId}
                  onAddDesenho={addDesenho} onUpdateDesenho={updateDesenho} onRemoveDesenho={removeDesenho} />
              )}
              {tab === "equipe" && (
                <EquipeTab employees={employees} onAddEmployee={addEmployee} onRemoveEmployee={removeEmployee} onUpdateEmployee={updateEmployee} />
              )}
              {tab === "alocacoes" && (
                <AlocacoesTab employees={employees} projects={projects} allocations={allocations} onAdd={addAllocation} onRemove={removeAllocation} scopeId={scopeId} />
              )}
              {tab === "config" && (
                <ConfigTab config={config} onUpdateConfig={updateConfig} />
              )}
            </>
          )}
        </div>
        <div className="cpd-footer-note">Dados salvos no banco de dados do projeto · Instech · todas as alterações ficam disponíveis para toda a equipe autorizada.</div>
      </div>
    </div>
  );
}
