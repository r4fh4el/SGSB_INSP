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
      const barragensComRisco = barragens.map(b => ({
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
    })
  );
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
