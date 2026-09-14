-- =====================================================================
-- Painel de Capacidade Produtiva — Instech
-- Rode este script inteiro no Supabase: Project -> SQL Editor -> New query
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- TABELAS ----------

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  role text not null,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null,
  peso numeric not null default 0,        -- usado apenas se não houver desenhos cadastrados
  indice numeric not null default 0,      -- HS por TN
  inicio date,
  prazo integer,                          -- dias
  status text not null default 'Ativo',
  created_at timestamptz default now()
);

create table if not exists desenhos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  nome text not null,
  peso numeric not null default 0,        -- TN
  link_desenho text,
  status text not null default 'Pendente', -- Pendente | Em Andamento | Concluído
  created_at timestamptz default now()
);

create table if not exists allocations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  inicio date not null,
  fim date not null,
  created_at timestamptz default now()
);

create table if not exists config (
  id integer primary key default 1,
  dias_uteis integer not null default 22,
  horas_dia numeric not null default 9,
  family_pct jsonb not null,
  role_pct jsonb not null
);

-- ---------- SEGURANÇA (RLS) ----------
-- Qualquer usuário autenticado (login feito) pode ler/escrever.
-- Sem login, ninguém acessa nada.

alter table employees enable row level security;
alter table projects enable row level security;
alter table desenhos enable row level security;
alter table allocations enable row level security;
alter table config enable row level security;

create policy "auth_all_employees" on employees for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all_projects" on projects for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all_desenhos" on desenhos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all_allocations" on allocations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_all_config" on config for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed: colaboradores
insert into employees (id, nome, role) values
  ('10000000-0000-0000-0000-000000000001', 'Carlos Eduardo Machado Bernardes Gunha', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000002', 'Eloi Alves Pires Junior', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000003', 'Jorge Joseh Perez Martinez', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000004', 'Bruno Henrique Pacheco Reyes Silva', 'Auxiliar de Pintor Jatista'),
  ('10000000-0000-0000-0000-000000000005', 'Michel Costa Cordeiro', 'Caldeireiro'),
  ('10000000-0000-0000-0000-000000000006', 'Robson Szprada Filadelfo', 'Caldeireiro'),
  ('10000000-0000-0000-0000-000000000007', 'Luciano da Luz', 'Caldeireiro'),
  ('10000000-0000-0000-0000-000000000008', 'Wilsiomar de Souza Severino', 'Caldeireiro'),
  ('10000000-0000-0000-0000-000000000009', 'Fabio de Oliveira Rocha', 'Caldeireiro'),
  ('10000000-0000-0000-0000-000000000010', 'Wagner Bento da Silva', 'Jatista'),
  ('10000000-0000-0000-0000-000000000011', 'Flavio Amancio Ribeiro', 'Mecânico Montador'),
  ('10000000-0000-0000-0000-000000000012', 'Ana Paula do Nascimento Macedo', 'Meio Oficial Montador'),
  ('10000000-0000-0000-0000-000000000013', 'Luiz Carlos Carvalho', 'Meio Oficial Montador'),
  ('10000000-0000-0000-0000-000000000014', 'Matheus Barbosa Baiak', 'Operador de Plasma CNC'),
  ('10000000-0000-0000-0000-000000000015', 'Claudio Manoel Ferreira', 'Pintor Jatista'),
  ('10000000-0000-0000-0000-000000000016', 'Thiago Esteves Bastos', 'Pintor Jatista'),
  ('10000000-0000-0000-0000-000000000017', 'Marcelo Dias Pereira', 'Soldador'),
  ('10000000-0000-0000-0000-000000000018', 'Wesley Danrley Santos Silva', 'Soldador'),
  ('10000000-0000-0000-0000-000000000019', 'Jose Adjailson Santos Ribeiro', 'Soldador'),
  ('10000000-0000-0000-0000-000000000020', 'Tiago Miguel da Cruz Nascimento', 'Supervisor de Montagem'),
  ('10000000-0000-0000-0000-000000000021', 'Marcos Aurelio dos Santos', 'Técnico de Segurança do Trabalho'),
  ('10000000-0000-0000-0000-000000000022', 'Evandro L. S. Vopi', 'Torneiro'),
  ('10000000-0000-0000-0000-000000000023', 'Richard Gabriel Ferreira dos Santos', 'Caldeireiro'),
  ('10000000-0000-0000-0000-000000000024', 'Diego Belo Eduvirges', 'Soldador'),
  ('10000000-0000-0000-0000-000000000025', 'Eloino da Silva Tibirica', 'Operador de Caminhão Munck'),
  ('10000000-0000-0000-0000-000000000026', 'Edson Barbosa Maseika', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000027', 'Vinicius Domingues', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000028', 'Altair Bernardo Machado', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000029', 'Andre Luis Fernandes de Souza Nascimento', 'Mecânico Montador'),
  ('10000000-0000-0000-0000-000000000030', 'Murilo Henrique Celestino de Santana', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000031', 'Felipe do Espirito Santo', 'Auxiliar de Montagem'),
  ('10000000-0000-0000-0000-000000000032', 'Renan Cardoso de Santana', 'Auxiliar de Montagem');

-- Seed: projetos
insert into projects (id, nome, tipo, peso, indice, inicio, prazo, status) values
  ('20000000-0000-0000-0000-000000000001', 'Tanque de Lastro — Estaleiro Atlântico', 'Tanques e Vasos', 0, 62.76, '2026-08-31', 45, 'Ativo'),
  ('20000000-0000-0000-0000-000000000002', 'Estrutura Metálica — Galpão Norte', 'Estruturas Metálicas', 12.4, 48, '2026-09-10', 60, 'Ativo'),
  ('20000000-0000-0000-0000-000000000003', 'Rede de Tubulação — Planta Industrial Sul', 'Tubulação', 8.1, 55, '2026-07-01', 40, 'Concluído'),
  ('20000000-0000-0000-0000-000000000004', 'Vaso de Pressão — Cliente Rio Verde', 'Tanques e Vasos', 3.2, 70, '2026-10-05', 30, 'Ativo');

-- Seed: desenhos (filhos do projeto 1, a titulo de exemplo)
insert into desenhos (id, project_id, nome, peso, link_desenho, status) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Costado — chapa 01', 2.1, '', 'Concluído'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Fundo do tanque', 1.9, '', 'Em Andamento'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Tampa e bocais', 1.8, '', 'Pendente');

-- Seed: alocacoes
insert into allocations (id, employee_id, project_id, inicio, fim) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '2026-08-31', '2026-09-20'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '2026-08-31', '2026-09-25'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000001', '2026-09-05', '2026-09-30'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000001', '2026-09-05', '2026-09-30'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-09-01', '2026-10-10'),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '2026-09-01', '2026-10-10'),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000001', '2026-10-05', '2026-10-14'),
  ('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '2026-10-01', '2026-10-14'),
  ('40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', '2026-09-10', '2026-10-20'),
  ('40000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '2026-09-10', '2026-10-20'),
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', '2026-09-15', '2026-10-25'),
  ('40000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000029', '20000000-0000-0000-0000-000000000002', '2026-09-15', '2026-10-25'),
  ('40000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000002', '2026-09-20', '2026-11-05'),
  ('40000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000002', '2026-09-20', '2026-11-05'),
  ('40000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '2026-09-10', '2026-10-05'),
  ('40000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000002', '2026-09-10', '2026-10-05'),
  ('40000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', '2026-07-01', '2026-07-25'),
  ('40000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000003', '2026-07-01', '2026-08-05'),
  ('40000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000004', '2026-10-05', '2026-10-28'),
  ('40000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000004', '2026-10-20', '2026-11-02');

-- Seed: configuracao (linha unica id=1)
insert into config (id, dias_uteis, horas_dia, family_pct, role_pct) values
  (1, 22, 9, '{"Tanques e Vasos": [0.15, 0.2, 0.35, 0.05, 0.05, 0.08, 0.12], "Estruturas Metálicas": [0.2, 0.15, 0.4, 0.05, 0.05, 0.06, 0.09], "Tubulação": [0.25, 0.25, 0.3, 0.03, 0.04, 0.05, 0.08]}'::jsonb, '{"Auxiliar de Montagem": [0.2, 0.2, 0.15, 0.0, 0.6, 0.0, 0.0], "Auxiliar de Pintor Jatista": [0.0, 0.0, 0.0, 0.0, 0.2, 0.2, 0.3], "Caldeireiro": [0.0, 0.0, 0.3, 0.5, 0.0, 0.0, 0.0], "Jatista": [0.0, 0.0, 0.0, 0.0, 0.2, 0.8, 0.0], "Mecânico Montador": [0.3, 0.4, 0.1, 0.5, 0.0, 0.0, 0.0], "Meio Oficial Montador": [0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0], "Operador de Plasma CNC": [0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "Pintor Jatista": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7], "Soldador": [0.0, 0.0, 0.25, 0.0, 0.0, 0.0, 0.0], "Supervisor de Montagem": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "Técnico de Segurança do Trabalho": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "Torneiro": [0.0, 0.4, 0.0, 0.0, 0.0, 0.0, 0.0], "Operador de Caminhão Munck": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}'::jsonb);
