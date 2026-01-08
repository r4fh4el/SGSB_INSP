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
