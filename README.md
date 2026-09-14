# Painel de Capacidade Produtiva — Instech

Aplicação web para controlar projetos, desenhos (peças), equipe, linha do tempo de
alocação e capacidade produtiva x demanda. Login por usuário e senha, banco de
dados real, link fixo publicado na internet.

Stack: **React + Vite** (interface) · **Supabase** (banco de dados Postgres + login) ·
**Vercel** (hospedagem/publicação).

---

## Passo 1 — Criar o banco de dados (Supabase)

1. Crie uma conta gratuita em **https://supabase.com** e clique em "New project".
2. Escolha um nome (ex: `instech-capacidade`) e uma senha para o banco (guarde-a).
3. Aguarde o projeto ser criado (~2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase/schema.sql` deste projeto, copie todo o conteúdo, cole
   no editor e clique em **Run**. Isso cria as tabelas, a segurança de acesso e já
   carrega os dados de exemplo (sua equipe e projetos de demonstração).
6. No menu lateral, vá em **Project Settings → API**. Copie:
   - **Project URL**
   - **anon public key**
   (você vai usar os dois no Passo 3).

### Criar os usuários que vão acessar o sistema
No menu lateral, vá em **Authentication → Users → Add user**. Cadastre o e-mail e
a senha de cada pessoa que vai usar o painel (você, seu diretor, etc). Não é
necessário nenhum cadastro público — só o administrador (você) cria os acessos
por aqui.

---

## Passo 2 — Subir o código para o GitHub

1. Crie uma conta gratuita em **https://github.com** (se ainda não tiver).
2. Crie um repositório novo (pode ser privado), ex: `capacidade-instech`.
3. Envie os arquivos desta pasta para o repositório (pelo site do GitHub você pode
   arrastar e soltar os arquivos em "uploading an existing file", ou usar `git`
   se preferir).

---

## Passo 3 — Publicar (Vercel)

1. Crie uma conta gratuita em **https://vercel.com** (pode entrar direto com o GitHub).
2. Clique em **Add New → Project** e selecione o repositório que você criou.
3. A Vercel detecta automaticamente que é um projeto Vite — não precisa mudar nada
   na configuração de build.
4. Antes de clicar em "Deploy", abra **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL` → cole a Project URL do Passo 1
   - `VITE_SUPABASE_ANON_KEY` → cole a anon public key do Passo 1
5. Clique em **Deploy**. Em ~1 minuto você recebe um link do tipo
   `https://capacidade-instech.vercel.app` — esse é o link fixo do painel.

Pronto: a partir de agora, sempre que o código for atualizado no GitHub, a Vercel
publica a nova versão automaticamente nesse mesmo link.

---

## Testando localmente (opcional, antes de publicar)

```bash
npm install
cp .env.example .env      # preencha com a URL e a chave do Supabase
npm run dev
```

Abre em `http://localhost:5173`.

---

## Como o modelo de dados funciona

- **projects** — os projetos fechados (peso, índice HS/TN, tipo, prazo, status).
- **desenhos** — as peças/conjuntos (filhos) de cada projeto: nome, peso próprio e
  link do desenho em outro sistema. Quando um projeto tem desenhos cadastrados, o
  peso total do projeto passa a ser a soma automática dos pesos dos desenhos.
- **employees** — a equipe, com a função de cada colaborador.
- **allocations** — quem está alocado em qual projeto e em que período. O sistema
  bloqueia a alocação se o colaborador já estiver em outro projeto nas mesmas datas.
- **config** — as duas matrizes de percentual (etapa por tipo de projeto, função por
  etapa) e os parâmetros gerais (horas/dia, dias úteis).

## Próximos passos combinados

Como vamos continuar evoluindo esse painel juntos, o mais prático daqui pra
frente é usar o **Claude Code** apontando para este mesmo repositório: assim eu
edito o código diretamente, você revisa e aprova, e a Vercel publica a versão
nova sozinha. Se preferir, também dá pra continuar me mandando os pedidos de
alteração por aqui e eu te devolvo os arquivos atualizados para subir manualmente.
