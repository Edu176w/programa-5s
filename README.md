# Programa 5S — Usina Serra Grande

Plataforma web para acompanhar o Programa 5S: painel com notas por área,
planos de ação (PAD) por área com fotos de antes/depois, plano mestre de
implantação, cronograma e comitê. Substitui o antigo gerenciador em
planilha.

Este projeto roda **fora do Claude** — é uma aplicação comum (React +
Node + Postgres) que você hospeda onde quiser. Este README cobre rodar
localmente no VS Code e publicar no Render a partir do GitHub.

## Estrutura

```
programa-5s/
├── render.yaml         # deploy automático no Render (serviço web)
├── backend/             # API Node/Express + Postgres
│   ├── server.js         # rotas da API e serve o frontend compilado
│   ├── db.js              # conexão com o Postgres e criação da tabela
│   ├── .env.example
│   └── package.json
└── frontend/             # app React (Vite)
    ├── src/
    │   ├── App.jsx          # toda a interface e a lógica do programa
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

Os dados reais do 3º Ciclo (as 25 áreas/líderes, os 353 itens de plano de
ação, as 151 ações do plano mestre, o cronograma etc.) já vêm embutidos em
`frontend/src/App.jsx` como dado inicial (as constantes `SEED_AREAS`,
`SEED_MASTERPLAN`...). Na primeira vez que alguém abre o app com o banco
vazio, esses dados são gravados automaticamente no Postgres — não precisa
importar nada à mão.

## Como funciona o armazenamento

Não existe login nesta versão — é um quadro de gestão à vista: um único
banco Postgres com uma tabela `storage` (chave → JSON), e todo mundo que
acessa a URL do app lê e grava nas mesmas 5 chaves (`g5s:areas`,
`g5s:masterplan`, `g5s:committee`, `g5s:cronograma`, `g5s:settings`). Cada
salvamento sobrescreve a coleção inteira; se duas pessoas editarem a
**mesma área** ao mesmo tempo, quem salvar por último prevalece (sem
mesclagem automática). Para o uso normal (um líder por área, uma auditoria
de cada vez) isso não costuma ser problema.

## Banco de dados (Neon)

O banco fica no [Neon](https://neon.tech) em vez de no Render — o plano
gratuito do Neon não tem prazo de expiração (tem limite de uso: 0,5 GB de
armazenamento e 100h de computação/mês, bem folgado para este projeto).
O Render hospeda só o site/API; o Postgres em si vive no Neon.

1. Crie uma conta em [neon.tech](https://neon.tech) e um novo projeto
   (escolha uma região perto de onde o Render vai rodar — ao criar o
   serviço web no Render, a região padrão costuma ser Oregon/US, então
   "US East" ou "US West" no Neon tende a ficar mais perto).
2. No dashboard do projeto, clique em **Connect**.
3. Copie a connection string com **pooled connection** marcado (o nome do
   host tem um `-pooler` no meio) — é essa que a aplicação usa em tempo de
   execução. Vai ser algo assim:
   ```
   postgresql://usuario:senha@ep-algo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Guarde essa string — é o valor que você vai usar como `DATABASE_URL`
   tanto localmente (`.env`) quanto no Render (veja abaixo).

Esse mesmo banco pode ser reaproveitado tanto para rodar localmente
quanto para o deploy em produção — ou você pode criar dois projetos
separados no Neon (um para testar localmente, outro para produção), como
preferir.

## Rodando localmente

Pré-requisito: Node 20 ou mais novo, e o `DATABASE_URL` do Neon (passo
anterior) em mãos.

**1. Backend:**

```bash
cd backend
cp .env.example .env      # cole o DATABASE_URL do Neon aqui
npm install
npm run dev                # sobe em http://localhost:3001
```

**2. Frontend** (em outro terminal):

```bash
cd frontend
npm install
npm run dev                # sobe em http://localhost:5173
```

**3.** Abra `http://localhost:5173`. O Vite encaminha as chamadas `/api/*`
para o backend automaticamente (configurado em `vite.config.js`) — não
precisa mexer em CORS nem em URLs.

## Publicando no GitHub

```bash
cd programa-5s
git init
git add .
git commit -m "Programa 5S — versão inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/programa-5s.git
git push -u origin main
```

## Deploy no Render

### Caminho rápido: Blueprint (`render.yaml`)

1. Tenha em mãos a connection string do Neon (seção acima).
2. Suba o repositório no GitHub (passo acima).
3. No [dashboard do Render](https://dashboard.render.com): **New → Blueprint**.
4. Selecione o repositório. O Render lê o `render.yaml` da raiz e mostra o
   serviço web `programa-5s` que vai criar.
5. Antes de confirmar, o Render pede o valor de `DATABASE_URL` (ele
   aparece marcado como "secret" porque está com `sync: false` no
   arquivo) — cole a connection string do Neon aí.
6. Clique em **Deploy Blueprint** e aguarde o build (instala as duas
   pastas e compila o frontend).
7. Pronto — o serviço fica acessível em algo como
   `https://programa-5s.onrender.com`.

### Caminho manual (se preferir configurar na mão)

1. **New → Web Service** → conecte o repositório.
   - Build Command: `npm install --prefix frontend && npm run build --prefix frontend && npm install --prefix backend`
   - Start Command: `npm start --prefix backend`
   - Em Environment, adicione a variável `DATABASE_URL` com a connection
     string do Neon.
2. Deploy.

## Limitações dos planos gratuitos (leia antes de confiar dados reais)

- **Neon (banco):** o plano gratuito não expira, mas tem um teto de uso —
  0,5 GB de armazenamento e 100h de computação por mês. Para o volume
  deste programa (algumas dezenas de pessoas, texto e fotos comprimidas)
  isso deve durar bastante tempo. O compute do Neon também "hiberna" após
  alguns minutos sem uso e leva menos de 1 segundo para acordar — na
  prática, imperceptível.
- **Render (serviço web):** o plano Free "dorme" após 15 minutos sem
  acesso e leva cerca de 1 minuto para acordar na visita seguinte. Se isso
  incomodar a equipe no dia a dia, dá para fazer upgrade do plano do
  serviço web no dashboard do Render — nada no código muda.
- Se algum dos dois te incomodar, o upgrade em qualquer um deles é só
  trocar o plano no respectivo dashboard.

## Fazendo alterações depois

Qualquer ajuste (campo novo, tela nova, mudança visual, nova regra) é só
editar `frontend/src/App.jsx` (ou os arquivos do backend, se for mudança
de API/banco) e dar `git push`. Se o repositório estiver conectado ao
Render, o deploy acontece sozinho a cada push na branch principal.
