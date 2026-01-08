# Requisitos e Ferramentas para Rodar o Sistema Online

## 🗄️ Bancos de Dados

### 1. **SQL Server** (Obrigatório)
- **Uso**: Banco de dados principal para armazenar dados de inspeção
- **Variáveis de ambiente necessárias**:
  - `SQLSERVER_SERVER` - Servidor SQL (ex: `localhost` ou `servidor\SQLEXPRESS`)
  - `SQLSERVER_DATABASE` - Nome do banco (padrão: `sgsb`)
  - `SQLSERVER_USER` - Usuário (opcional se usar autenticação Windows)
  - `SQLSERVER_PASSWORD` - Senha (opcional se usar autenticação Windows)
  - `SQLSERVER_TRUSTED_CONNECTION` - `true` para autenticação Windows (padrão)
  - `SQLSERVER_ODBC_DRIVER` - Driver ODBC (padrão: `ODBC Driver 17 for SQL Server`)

### 2. **Prisma Database** (Opcional - para dados auxiliares)
- **Uso**: Banco de dados secundário (provavelmente PostgreSQL/MySQL via Prisma)
- **Variável de ambiente**:
  - `DATABASE_URL` - String de conexão do Prisma

## 🔐 Autenticação e Autorização

### 3. **Servidor OAuth** (Obrigatório para autenticação)
- **Uso**: Sistema de autenticação de usuários
- **Variáveis de ambiente necessárias**:
  - `OAUTH_SERVER_URL` - URL do servidor OAuth
  - `VITE_APP_ID` - ID da aplicação no sistema OAuth
  - `JWT_SECRET` - Chave secreta para assinar tokens JWT de sessão
  - `OWNER_OPEN_ID` - ID do proprietário/admin do sistema

**Nota**: O sistema suporta autenticação via:
- Email
- Google
- Apple
- Microsoft/Azure
- GitHub

## ☁️ Serviços de API e Storage

### 4. **Forge API / Manus API** (Obrigatório)
- **Uso**: Serviço central que fornece múltiplas funcionalidades:
  - **Storage de arquivos** (substitui S3 direto)
  - **Geração de imagens** (IA)
  - **LLM/IA** (Gemini 2.5 Flash)
  - **Transcrição de voz** (Speech-to-Text)
  - **Data API** (chamadas de API externas)

- **Variáveis de ambiente necessárias**:
  - `BUILT_IN_FORGE_API_URL` - URL base da API Forge
  - `BUILT_IN_FORGE_API_KEY` - Chave de autenticação (Bearer token)

**Endpoints utilizados**:
- `v1/storage/upload` - Upload de arquivos
- `v1/storage/downloadUrl` - Download de arquivos
- `images.v1.ImageService/GenerateImage` - Geração de imagens
- `webdevtoken.v1.WebDevService/CallApi` - Chamadas de API
- `webdev.v1.WebDevAuthPublicService/*` - Autenticação OAuth

## 🖥️ Infraestrutura de Servidor

### 5. **Node.js Runtime** (Obrigatório)
- **Versão**: Node.js 18+ (recomendado)
- **Uso**: Executar o servidor Express/TypeScript (backend)
- **Por quê?**: 
  - **Backend**: É um servidor Express (Node.js) que processa requisições, conecta ao SQL Server, faz autenticação OAuth, etc. **PRECISA do Node.js para rodar.**
  - **Frontend**: Em produção são arquivos estáticos (HTML/CSS/JS compilados) que podem ser servidos por qualquer servidor web, mas em desenvolvimento também precisa do Node.js para o Vite.

### Arquitetura do Sistema:

```
┌─────────────────────────────────────────┐
│         CLIENTE (Navegador/App)         │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/HTTPS
               │
┌──────────────▼──────────────────────────┐
│      FRONTEND (Arquivos Estáticos)      │
│  - HTML, CSS, JavaScript compilado      │
│  - Pode ser servido por:                │
│    • Express (Node.js)                  │
│    • Nginx/Apache                       │
│    • IIS                                │
└──────────────┬──────────────────────────┘
               │
               │ API Calls (/api/trpc)
               │
┌──────────────▼──────────────────────────┐
│      BACKEND (Node.js + Express)        │
│  - Servidor de API (tRPC)               │
│  - Autenticação OAuth                   │
│  - Conexão SQL Server                   │
│  - Integração Forge API                 │
│  ⚠️ OBRIGATÓRIO: Node.js                │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ SQL Server  │  │ Forge API   │
│             │  │ OAuth Server │
└─────────────┘  └─────────────┘
```

### 6. **Servidor Web/Proxy Reverso** (Recomendado para produção)
- **Opções**:
  - **Nginx** - Proxy reverso e servidor de arquivos estáticos (recomendado)
  - **Apache** - Alternativa ao Nginx
  - **IIS** - Se estiver em ambiente Windows Server
  - **Express** - Pode servir tudo, mas não é recomendado para produção de alta carga

**Nota**: Você pode rodar sem Nginx/Apache, usando apenas o Express para servir tudo, mas para produção é recomendado usar um proxy reverso.

### 7. **Process Manager** (Recomendado para produção)
- **Opções**:
  - **PM2** - Gerenciador de processos Node.js
  - **systemd** - Para Linux
  - **Windows Service** - Para Windows Server

## 📦 Dependências de Build

### 8. **Build Tools** (Já incluídas no projeto)
- **Vite** - Build do frontend
- **esbuild** - Build do backend
- **TypeScript** - Compilação
- **Gradle** - Build do Android (se necessário)

## 🌐 Variáveis de Ambiente Completas

### Obrigatórias:
```env
# SQL Server
SQLSERVER_SERVER=SGSB\SQLEXPRESS
SQLSERVER_DATABASE=sgsb
SQLSERVER_TRUSTED_CONNECTION=true

# OAuth
OAUTH_SERVER_URL=https://seu-servidor-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=sua-chave-secreta-jwt
OWNER_OPEN_ID=id-do-proprietario

# Forge API
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key
```

### Opcionais:
```env
# Prisma (se usar)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Servidor
PORT=3000
NODE_ENV=production

# SQL Server (autenticação SQL)
SQLSERVER_USER=usuario
SQLSERVER_PASSWORD=senha
SQLSERVER_DOMAIN=dominio
```

## 📋 Checklist de Deploy

- [ ] SQL Server instalado e configurado
- [ ] Banco de dados `sgsb` criado
- [ ] Scripts de inicialização executados (`sqlserver/init.sql`)
- [ ] Servidor OAuth configurado e acessível
- [ ] Forge API configurada com todas as permissões necessárias
- [ ] Variáveis de ambiente configuradas
- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Build do frontend executado (`npm run build`)
- [ ] Servidor de produção configurado (Nginx/Apache)
- [ ] Process manager configurado (PM2/systemd)
- [ ] SSL/HTTPS configurado (certificado)
- [ ] Firewall configurado (portas 80, 443, 3000)
- [ ] Backup automático configurado

## 🔒 Segurança

- **HTTPS obrigatório** em produção
- **JWT_SECRET** deve ser uma string aleatória forte
- **Firewall** configurado para permitir apenas portas necessárias
- **Backup regular** do SQL Server
- **Logs** configurados para monitoramento

## 💰 Custos Estimados (Serviços Externos)

1. **Forge API / Manus API**: Depende do plano (pode ser pago por uso)
2. **Servidor OAuth**: Pode ser self-hosted ou serviço terceirizado
3. **SQL Server**: Licença (se não usar Express/Developer)
4. **Hosting**: Servidor VPS/Cloud (AWS, Azure, DigitalOcean, etc.)
5. **Storage**: Incluído no Forge API ou S3 separado

## 🚀 Alternativas para Reduzir Dependências

Se quiser reduzir dependências externas:

1. **Storage**: Substituir Forge Storage por AWS S3 direto
2. **OAuth**: Implementar autenticação própria (mais complexo)
3. **IA/LLM**: Remover funcionalidades que dependem de IA (se não forem essenciais)
4. **Transcrição**: Usar serviço alternativo ou remover funcionalidade

