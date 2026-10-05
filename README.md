# Portal de Solicitações Internas — Backend

API REST em NestJS para cadastro e autenticação de usuários, gerenciamento de solicitações, categorias extensíveis e indicadores do dashboard. A aplicação usa PostgreSQL, Prisma, JWT e uma organização modular inspirada em MVC e arquitetura em camadas.

## Arquitetura

O fluxo principal é:

```text
HTTP → Controller → Application Service → Domain Policy → Prisma → PostgreSQL
```

- **Controllers:** traduzem HTTP, validam DTOs e encaminham o usuário autenticado.
- **Application services:** coordenam casos de uso e persistência.
- **Domain:** concentra regras de autorização e transição de status.
- **Infrastructure:** Prisma, PostgreSQL, JWT, hashing e configuração.
- **Modules:** `auth`, `categories`, `requests`, `dashboard` e `health`.

O projeto é um monólito modular e stateless. Essa escolha reduz a complexidade do MVP sem impedir escala horizontal.

## Regras implementadas

- perfis `SOLICITANTE` e `ATENDENTE`;
- cadastro com e-mail único e senha armazenada como hash bcrypt com salt;
- toda solicitação começa em `ABERTO`;
- solicitante lista e consulta somente as próprias solicitações;
- atendente visualiza todas as solicitações;
- somente o autor edita ou exclui a solicitação;
- somente atendentes alteram o status;
- sequência obrigatória `ABERTO → EM_ATENDIMENTO → CONCLUIDO`;
- categorias são extensíveis e criadas explicitamente ou junto da solicitação;
- dashboard respeita a visibilidade do perfil;
- filtros, busca e paginação são executados no banco.

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 17, ou Docker

## Configuração local

```bash
npm install
cp .env.example .env
npm run prisma:generate
```

No Windows PowerShell, use `Copy-Item .env.example .env`.

Suba somente o banco:

```bash
docker compose up -d postgres
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

A API fica em `http://localhost:3000/api` e o Swagger em `http://localhost:3000/api/docs`.

Para executar a solução completa (PostgreSQL, migrations, API e frontend), mantenha
`ticket-creator-backend` e `ticket-creator-frontend` no mesmo diretório e execute, a partir
do backend:

```bash
docker compose up --build -d
```

A aplicação fica disponível em `http://localhost:8080`. O frontend usa o Nginx como
proxy para a API, portanto não é necessário expor o PostgreSQL nem configurar uma URL
separada no navegador. As migrations são aplicadas automaticamente antes da API iniciar.

Use `docker compose logs -f` para acompanhar os serviços e `docker compose down` para
encerrá-los. Os dados permanecem no volume `postgres_data`. Para mudar porta, credenciais
ou segredo JWT, copie `.env.example` para `.env` e ajuste `APP_PORT`, `POSTGRES_*` e
`JWT_SECRET`.

## Contas do seed

| Perfil      | E-mail               | Senha    |
| ----------- | -------------------- | -------- |
| Solicitante | `marina@empresa.com` | `123456` |
| Atendente   | `tiago@empresa.com`  | `123456` |

O seed também cria TI, RH, Compras, Financeiro e Infraestrutura e uma solicitação inicial.

## Endpoints

### Autenticação

| Método | Rota                 | Descrição                       |
| ------ | -------------------- | ------------------------------- |
| `POST` | `/api/auth/register` | Cadastra e autentica um usuário |
| `POST` | `/api/auth/login`    | Retorna `accessToken` e usuário |
| `GET`  | `/api/auth/me`       | Retorna o usuário autenticado   |
| `POST` | `/api/auth/logout`   | Encerra a sessão no cliente     |

Como a API é stateless, o logout exige que o cliente descarte o token. Uma denylist pode ser adicionada no futuro caso seja necessária revogação imediata.

### Solicitações

| Método   | Rota                       | Descrição                           |
| -------- | -------------------------- | ----------------------------------- |
| `POST`   | `/api/requests`            | Cria uma solicitação                |
| `GET`    | `/api/requests`            | Lista conforme o perfil             |
| `GET`    | `/api/requests/:id`        | Consulta uma solicitação autorizada |
| `PUT`    | `/api/requests/:id`        | Edita uma solicitação do autor      |
| `DELETE` | `/api/requests/:id`        | Exclui uma solicitação do autor     |
| `PATCH`  | `/api/requests/:id/status` | Executa a próxima transição válida  |

Filtros disponíveis: `q`, `status`, `category`, `from`, `to`, `page` e `size`.

### Outros recursos

| Método | Rota                     | Descrição                                           |
| ------ | ------------------------ | --------------------------------------------------- |
| `GET`  | `/api/categories`        | Lista categorias                                    |
| `POST` | `/api/categories`        | Cria categoria                                      |
| `GET`  | `/api/dashboard/summary` | Retorna `total`, `open`, `inProgress` e `completed` |
| `GET`  | `/api/health`            | Verifica API e conexão com o banco                  |

Rotas protegidas usam `Authorization: Bearer <token>`.

## TDD e qualidade

Os testes foram escritos em duas camadas:

- domínio: propriedade, visibilidade e máquina de estados;
- aplicação: vínculo do autor, categorias extensíveis e escopo da listagem.

Comandos:

```bash
npm test
npm run test:cov
npm run lint
npm run build
npm audit --omit=dev
```

## Banco de dados

As migrations ficam em `prisma/migrations`. Os principais índices cobrem autor, status, categoria e data de criação. O schema contém:

- `users`;
- `categories`;
- `requests`;
- enums `UserRole` e `RequestStatus`.

Use `npm run prisma:migrate` para criar novas migrations durante o desenvolvimento e `npm run prisma:deploy` em ambientes publicados.

## Alterações realizadas

- projeto NestJS configurado do zero;
- persistência PostgreSQL com Prisma, migration inicial e seed;
- autenticação JWT e hashing bcrypt;
- validação global, CORS, Helmet e Swagger;
- autorização por perfil e propriedade no domínio;
- CRUD, filtros, paginação e transições sequenciais de status;
- categorias extensíveis e dashboard por perfil;
- health check dependente do banco;
- testes unitários orientados por TDD;
- Dockerfile, Docker Compose e variáveis de ambiente documentadas;
- dependências auditadas sem vulnerabilidades conhecidas de produção.

## Diagramas

- [Arquitetura do backend](./arquitetura_backend_portal_solicitacoes.excalidraw.md)
- [Arquitetura geral](./arquitetura_portal_solicitacoes.excalidraw.md)
