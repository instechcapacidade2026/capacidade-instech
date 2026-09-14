import { useState } from "react";
import { LogIn } from "lucide-react";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro("");
    if (!email || !senha) return;
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) setErro("E-mail ou senha inválidos.");
  };

  return (
    <div className="cpd">
      <div className="login-wrap">
        <div className="login-card">
          <img className="login-logo" src={logo} alt="Instech" />
          <p className="login-title">Painel de Capacidade Produtiva</p>
          {erro && <div className="login-error">{erro}</div>}
          <form onSubmit={entrar}>
            <div className="form-row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <span className="form-label">E-mail</span>
                <input className="cpd-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="form-row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <span className="form-label">Senha</span>
                <input className="cpd-input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>
            <button className="btn login-btn" type="submit" disabled={carregando}>
              <LogIn size={14} />{carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="login-footer">Acesso restrito. Para criar um novo usuário, peça ao administrador do sistema.</p>
        </div>
      </div>
    </div>
  );
}
