import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 80): Promise<number> {
  // Para porta 80, tentar apenas essa porta (não tentar outras)
  if (startPort === 80) {
    if (await isPortAvailable(80)) {
      return 80;
    }
    // Se porta 80 não estiver disponível, tentar 3000 como fallback
    console.warn("⚠️  Port 80 is not available, trying port 3000...");
    if (await isPortAvailable(3000)) {
      return 3000;
    }
    throw new Error("Port 80 and 3000 are both unavailable");
  }
  
  // Para outras portas, tentar portas consecutivas
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Endpoint para servir arquivos do banco de dados (BLOB)
  app.get("/api/documentos/:id/download", async (req, res) => {
    try {
      const documentoId = parseInt(req.params.id);
      if (isNaN(documentoId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const documento = await db.getDocumentoById(documentoId, true);
      if (!documento) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      // Se não tem conteúdo no banco, verificar se tem URL externa
      if (!documento.arquivoConteudo) {
        if (documento.arquivoUrl) {
          // Redirecionar para URL externa se existir
          return res.redirect(documento.arquivoUrl);
        }
        return res.status(404).json({ error: "Arquivo não encontrado no banco de dados" });
      }

      // Converter o BLOB para Buffer
      // SQL Server retorna VARBINARY(MAX) como Buffer diretamente no mssql
      let buffer: Buffer;
      try {
        if (Buffer.isBuffer(documento.arquivoConteudo)) {
          buffer = documento.arquivoConteudo;
        } else if (documento.arquivoConteudo instanceof Uint8Array) {
          buffer = Buffer.from(documento.arquivoConteudo);
        } else if (typeof documento.arquivoConteudo === 'string') {
          // Se for string, pode ser base64 ou hex
          try {
            buffer = Buffer.from(documento.arquivoConteudo, 'base64');
          } catch {
            buffer = Buffer.from(documento.arquivoConteudo, 'hex');
          }
        } else {
          // Tentar converter de qualquer forma
          const blobData = documento.arquivoConteudo as any;
          if (blobData && blobData.data && Buffer.isBuffer(blobData.data)) {
            buffer = blobData.data;
          } else if (blobData && typeof blobData === 'object' && 'length' in blobData) {
            // Array-like object
            buffer = Buffer.from(Array.from(blobData as any));
          } else {
            // Última tentativa: converter diretamente
            buffer = Buffer.from(blobData as any);
          }
        }
        
        if (!buffer || buffer.length === 0) {
          console.error("[Documentos] Buffer vazio ou inválido");
          return res.status(500).json({ error: "Arquivo vazio ou inválido" });
        }
      } catch (e) {
        console.error("[Documentos] Erro ao converter BLOB:", e);
        console.error("[Documentos] Tipo do arquivoConteudo:", typeof documento.arquivoConteudo);
        console.error("[Documentos] arquivoConteudo:", documento.arquivoConteudo);
        return res.status(500).json({ error: "Erro ao processar arquivo" });
      }

      const contentType = documento.arquivoTipo || "application/octet-stream";
      const fileName = documento.arquivoNome || "documento";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.send(buffer);
    } catch (error) {
      console.error("[Documentos] Erro ao servir arquivo:", error);
      res.status(500).json({ error: "Erro ao servir arquivo" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Proxy para buscar cálculos do SGSB-WEB (evita problemas de CORS)
  app.get("/api/sgsb-web/calculos-automaticos", async (req, res) => {
    try {
      const barragemId = req.query.barragemId;
      if (!barragemId) {
        return res.status(400).json({ error: "barragemId é obrigatório" });
      }

      const { ENV } = await import("./env");
      const hidroApiUrl = ENV.hidroApiUrl;
      
      // Debug detalhado
      console.log("[Proxy] === DEBUG HIDRO_API_URL ===");
      console.log("[Proxy] process.env.HIDRO_API_URL (raw):", process.env.HIDRO_API_URL);
      console.log("[Proxy] hidroApiUrl (from ENV.hidroApiUrl):", hidroApiUrl);
      console.log("[Proxy] hidroApiUrl.trim():", hidroApiUrl?.trim());
      console.log("[Proxy] isEmpty:", !hidroApiUrl || hidroApiUrl.trim() === "");
      
      if (!hidroApiUrl || hidroApiUrl.trim() === "") {
        console.error("[Proxy] ❌ HIDRO_API_URL não configurada ou vazia");
        console.error("[Proxy] process.env.HIDRO_API_URL:", process.env.HIDRO_API_URL);
        console.error("[Proxy] ENV.hidroApiUrl:", ENV.hidroApiUrl);
        console.error("[Proxy] Verifique se a variável está no arquivo .env e se o servidor foi reiniciado");
        return res.status(500).json({ 
          error: "HIDRO_API_URL não configurada",
          debug: process.env.NODE_ENV === "development" ? {
            raw: process.env.HIDRO_API_URL,
            processed: hidroApiUrl,
            fromENV: ENV.hidroApiUrl
          } : undefined
        });
      }
      
      console.log("[Proxy] ✓ HIDRO_API_URL configurada:", hidroApiUrl);

      // URL já está normalizada no env.ts, mas garantir
      let normalizedUrl = hidroApiUrl.trim().replace(/\/$/, "");

      const url = `${normalizedUrl}/API/BuscarCalculosAutomaticosPorBarragem?barragemId=${barragemId}`;
      console.log(`[Proxy] Buscando cálculos de: ${url}`);
      console.log(`[Proxy] HIDRO_API_URL original: ${hidroApiUrl}`);

      const startTime = Date.now();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000), // 30 segundos de timeout
      });

      const duration = Date.now() - startTime;
      console.log(`[Proxy] Resposta recebida em ${duration}ms - Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Proxy] Erro HTTP ${response.status}: ${errorText}`);
        console.error(`[Proxy] URL tentada: ${url}`);
        return res.status(response.status).json({ 
          error: `Erro ao buscar cálculos: ${response.status}`,
          details: errorText.substring(0, 200),
          url: url
        });
      }

      const data = await response.json();
      console.log(`[Proxy] ✓ Cálculos recebidos com sucesso para barragem ${barragemId} (${duration}ms)`);
      res.json(data);
    } catch (error: any) {
      console.error("[Proxy] ❌ Erro ao buscar cálculos:", error);
      console.error("[Proxy] Tipo do erro:", error.name);
      console.error("[Proxy] Mensagem:", error.message);
      console.error("[Proxy] Stack:", error.stack);
      
      let mensagemErro = "Erro desconhecido ao buscar cálculos";
      let tipoErro = error.name || "UnknownError";
      
      if (error.name === "AbortError") {
        mensagemErro = "Timeout: O servidor SGSB-WEB demorou muito para responder (30s)";
      } else if (error.code === "ECONNREFUSED") {
        mensagemErro = "Conexão recusada: A API não está acessível no endereço configurado";
      } else if (error.code === "ENOTFOUND") {
        mensagemErro = "Host não encontrado: Verifique se a URL da API está correta";
      } else if (error.code === "ETIMEDOUT") {
        mensagemErro = "Timeout de conexão: A API não respondeu a tempo";
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      res.status(500).json({ 
        error: mensagemErro,
        type: tipoErro,
        code: error.code || null,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  });

  // Endpoint REST para integração com SGSB-WEB - Níveis de Risco
  // IMPORTANTE: Deve estar ANTES do tRPC e do roteamento do frontend
  app.get("/api/barragens/risco", async (_req, res) => {
    try {
      // Permitir CORS para o SGSB-WEB
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      
      const barragens = await db.getAllBarragens();
      const barragensComRisco = barragens.map((b: any) => ({
        id: b.id,
        codigo: b.codigo,
        nome: b.nome,
        categoriaRisco: b.categoriaRisco || null,
        danoPotencialAssociado: b.danoPotencialAssociado || null,
        status: b.status || null,
        municipio: b.municipio || null,
        estado: b.estado || null,
        rio: b.rio || null,
        bacia: b.bacia || null
      }));
      res.json(barragensComRisco);
    } catch (error: any) {
      console.error("[API Risco] Erro ao buscar barragens:", error);
      res.status(500).json({ error: "Erro ao buscar dados de risco" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: (opts: { error: any; path?: string; type?: string }) => {
        const { error, path } = opts;
        console.error(`[tRPC] Erro em ${path ?? "unknown"}:`, error);
        if (error.code === "NOT_FOUND") {
          console.error(`[tRPC] Procedimento não encontrado: ${path}`);
        }
      },
    })
  );
  
  // Handler para requisições GET em /api/trpc (retorna informação útil)
  app.get("/api/trpc", (_req, res) => {
    res.status(400).json({
      error: "tRPC endpoint requires POST requests",
      message: "Use the tRPC client or make POST requests to specific procedures",
      example: "POST /api/trpc/barragens.list",
      availableRouters: [
        "barragens",
        "instrumentos",
        "checklists",
        "questionarios",
        "leituras",
        "ocorrencias",
        "hidrometria",
        "documentos",
        "manutencoes",
        "alertas",
        "dashboard",
        "users",
        "auth",
      ],
    });
  });

  // Interface interativa para testar a API tRPC (similar ao Swagger)
  app.get("/api/panel", (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>tRPC API Panel - SGSB_INSP</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      color: #60a5fa;
      margin-bottom: 10px;
      font-size: 2rem;
    }
    .subtitle {
      color: #94a3b8;
      margin-bottom: 30px;
    }
    .grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      height: calc(100vh - 150px);
    }
    .sidebar {
      background: #1e293b;
      border-radius: 8px;
      padding: 20px;
      overflow-y: auto;
    }
    .router-group {
      margin-bottom: 20px;
    }
    .router-name {
      color: #60a5fa;
      font-weight: 600;
      margin-bottom: 10px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .router-name:hover {
      background: #334155;
    }
    .procedure {
      padding: 6px 8px 6px 20px;
      color: #cbd5e1;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .procedure:hover {
      background: #334155;
    }
    .procedure.active {
      background: #3b82f6;
      color: white;
    }
    .main-panel {
      background: #1e293b;
      border-radius: 8px;
      padding: 30px;
      overflow-y: auto;
    }
    .endpoint-info {
      margin-bottom: 30px;
    }
    .endpoint-path {
      background: #0f172a;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      color: #60a5fa;
      margin: 10px 0;
      word-break: break-all;
    }
    .method-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-right: 10px;
    }
    .method-get { background: #3b82f6; color: white; }
    .method-post { background: #10b981; color: white; }
    textarea {
      width: 100%;
      min-height: 200px;
      background: #0f172a;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      resize: vertical;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 15px;
      transition: background 0.2s;
    }
    button:hover {
      background: #2563eb;
    }
    button:disabled {
      background: #475569;
      cursor: not-allowed;
    }
    .response {
      margin-top: 20px;
      padding: 15px;
      background: #0f172a;
      border-radius: 6px;
      border: 1px solid #334155;
    }
    .response pre {
      color: #10b981;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .error {
      color: #ef4444;
    }
    .loading {
      color: #fbbf24;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔌 tRPC API Panel</h1>
    <p class="subtitle">Interface interativa para testar a API tRPC do SGSB_INSP</p>
    
    <div class="grid">
      <div class="sidebar">
        <div id="routers-list"></div>
      </div>
      
      <div class="main-panel">
        <div id="endpoint-view">
          <p style="color: #94a3b8;">Selecione um endpoint no menu lateral para começar</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const routers = {
      auth: { me: 'query', logout: 'mutation' },
      users: { list: 'query', updateRole: 'mutation', toggleStatus: 'mutation' },
      barragens: { list: 'query', getById: 'query', create: 'mutation', update: 'mutation', delete: 'mutation' },
      instrumentos: { list: 'query', getById: 'query', getByCodigo: 'query', create: 'mutation', update: 'mutation', delete: 'mutation', leituras: 'query', createLeitura: 'mutation', deleteLeitura: 'mutation' },
      checklists: { list: 'query', listByBarragem: 'query', getById: 'query', create: 'mutation', update: 'mutation', delete: 'mutation', listPerguntas: 'query', createPergunta: 'mutation', createResposta: 'mutation', getCaracterizacao: 'query', createCaracterizacao: 'mutation', updateCaracterizacao: 'mutation' },
      questionarios: { list: 'query', listByBarragem: 'query', getById: 'query', create: 'mutation', update: 'mutation', delete: 'mutation' },
      leituras: { listByInstrumento: 'query', listByBarragem: 'query', countByBarragem: 'query', getUltima: 'query', listInconsistencias: 'query', create: 'mutation', delete: 'mutation' },
      ocorrencias: { listByBarragem: 'query', getById: 'query', create: 'mutation', update: 'mutation', delete: 'mutation' },
      hidrometria: { listByBarragem: 'query', getUltima: 'query', create: 'mutation', update: 'mutation', delete: 'mutation' },
      documentos: { listByBarragem: 'query', getById: 'query', create: 'mutation', update: 'mutation', delete: 'mutation', upload: 'mutation' },
      manutencoes: { listByBarragem: 'query', create: 'mutation', update: 'mutation', delete: 'mutation' },
      alertas: { listByBarragem: 'query', marcarLido: 'mutation' },
      dashboard: { getData: 'query' }
    };

    function renderSidebar() {
      const container = document.getElementById('routers-list');
      container.innerHTML = '';
      
      Object.keys(routers).forEach(routerName => {
        const routerDiv = document.createElement('div');
        routerDiv.className = 'router-group';
        
        const routerTitle = document.createElement('div');
        routerTitle.className = 'router-name';
        routerTitle.textContent = routerName;
        routerTitle.onclick = () => {
          document.querySelectorAll('.procedure').forEach(p => p.classList.remove('active'));
        };
        routerDiv.appendChild(routerTitle);
        
        Object.keys(routers[routerName]).forEach(procedure => {
          const procDiv = document.createElement('div');
          procDiv.className = 'procedure';
          procDiv.textContent = procedure;
          procDiv.onclick = () => {
            document.querySelectorAll('.procedure').forEach(p => p.classList.remove('active'));
            procDiv.classList.add('active');
            showEndpoint(routerName, procedure, routers[routerName][procedure]);
          };
          routerDiv.appendChild(procDiv);
        });
        
        container.appendChild(routerDiv);
      });
    }

    function showEndpoint(router, procedure, type) {
      const endpoint = \`\${router}.\${procedure}\`;
      const method = type === 'query' ? 'GET' : 'POST';
      const url = \`/api/trpc/\${endpoint}\`;
      
      const view = document.getElementById('endpoint-view');
      view.innerHTML = \`
        <div class="endpoint-info">
          <h2>\${endpoint}</h2>
          <div>
            <span class="method-badge method-\${type === 'query' ? 'get' : 'post'}">\${method}</span>
            <span style="color: #94a3b8;">\${type === 'query' ? 'Query (busca dados)' : 'Mutation (modifica dados)'}</span>
          </div>
          <div class="endpoint-path">\${url}</div>
        </div>
        
        <div>
          <h3 style="margin-bottom: 10px;">Input (JSON):</h3>
          <textarea id="input-data" placeholder='{}'>\${getDefaultInput(router, procedure)}</textarea>
        </div>
        
        <button onclick="executeRequest('\${router}', '\${procedure}', '\${type}')">▶ Executar Requisição</button>
        
        <div id="response" class="response" style="display: none;"></div>
      \`;
    }

    function getDefaultInput(router, procedure) {
      const defaults = {
        'barragens.getById': '{"id": 1}',
        'barragens.listByBarragem': '{"barragemId": 1}',
        'instrumentos.getById': '{"id": 1}',
        'checklists.getById': '{"id": 1}',
        'questionarios.getById': '{"id": 1}',
        'leituras.listByBarragem': '{"barragemId": 1}',
      };
      return defaults[\`\${router}.\${procedure}\`] || '{}';
    }

    async function executeRequest(router, procedure, type) {
      const inputData = document.getElementById('input-data').value;
      const responseDiv = document.getElementById('response');
      responseDiv.style.display = 'block';
      responseDiv.innerHTML = '<pre class="loading">⏳ Enviando requisição...</pre>';
      
      try {
        const input = inputData.trim() ? JSON.parse(inputData) : {};
        const endpoint = \`/api/trpc/\${router}.\${procedure}\`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(input)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          responseDiv.innerHTML = \`
            <h3 style="margin-bottom: 10px; color: #10b981;">✓ Resposta (Status: \${response.status}):</h3>
            <pre>\${JSON.stringify(data, null, 2)}</pre>
          \`;
        } else {
          responseDiv.innerHTML = \`
            <h3 style="margin-bottom: 10px; color: #ef4444;">✗ Erro (Status: \${response.status}):</h3>
            <pre class="error">\${JSON.stringify(data, null, 2)}</pre>
          \`;
        }
      } catch (error) {
        responseDiv.innerHTML = \`
          <h3 style="margin-bottom: 10px; color: #ef4444;">✗ Erro:</h3>
          <pre class="error">\${error.message}</pre>
        \`;
      }
    }

    // Expor função globalmente
    window.executeRequest = executeRequest;
    
    // Inicializar
    renderSidebar();
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "80");
  const port = await findAvailablePort(preferredPort);
  const host = process.env.HOST || "0.0.0.0"; // Aceita conexões de qualquer IP
  const publicIp = process.env.PUBLIC_IP || "72.62.12.84";

  if (port !== preferredPort) {
    console.log(`⚠️  Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use!`);
      console.error(`💡 Solutions:`);
      console.error(`   1. Stop the process using port ${port}:`);
      console.error(`      Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force`);
      console.error(`   2. Or change PORT in .env file to another port (e.g., PORT=3001)`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, host, () => {
    console.log(`🚀 Server running on http://${host}:${port}/`);
    console.log(`📱 Local access: http://localhost:${port}/`);
    console.log(`🌐 Public access: http://${publicIp}:${port}/`);
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(`🌐 Railway URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
    if (process.env.RENDER_EXTERNAL_URL) {
      console.log(`🌐 Render URL: ${process.env.RENDER_EXTERNAL_URL}`);
    }
  });
}

startServer().catch(console.error);
