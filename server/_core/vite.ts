import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Substituir variáveis de ambiente no HTML (caso ainda existam)
      const appTitle = process.env.VITE_APP_TITLE || "SGSB - Sistema de Gestão e Segurança de Barragem";
      const appLogo = process.env.VITE_APP_LOGO || "/favicon.png";
      template = template.replace(/%VITE_APP_TITLE%/g, appTitle);
      template = template.replace(/%VITE_APP_LOGO%/g, appLogo);
      
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Tentar múltiplos caminhos possíveis para encontrar dist/public
  // Isso garante que funcione independente de onde o servidor é iniciado
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const possiblePaths = [
    // Caminho relativo ao diretório de trabalho atual (mais comum)
    path.resolve(process.cwd(), "dist", "public"),
    // Se o servidor está rodando de dist/index.js, public está no mesmo nível
    path.resolve(__dirname, "public"),
    // Caminho relativo ao diretório pai (se executado de dentro de dist/)
    path.resolve(process.cwd(), "..", "dist", "public"),
    // Caminho alternativo se executado da raiz do projeto
    path.resolve(process.cwd(), "SGSB", "dist", "public"),
  ];
  
  let distPath: string | null = null;
  
  console.log(`[Static] Current working directory: ${process.cwd()}`);
  console.log(`[Static] Executable file location: ${__dirname}`);
  console.log(`[Static] Searching for dist/public in the following locations:`);
  
  // Procurar o primeiro caminho que existe
  for (let i = 0; i < possiblePaths.length; i++) {
    const possiblePath = possiblePaths[i];
    const exists = fs.existsSync(possiblePath);
    console.log(`   ${i + 1}. ${possiblePath} ${exists ? '✅ FOUND' : '❌'}`);
    
    if (exists && !distPath) {
      distPath = possiblePath;
    }
  }
  
  // Se nenhum caminho foi encontrado, usar o primeiro como padrão e mostrar erro
  if (!distPath) {
    distPath = possiblePaths[0];
    console.error(`\n❌ Could not find the build directory in any of the locations above`);
    console.error(`💡 Make sure to run 'npm run build' before starting in production mode`);
    console.error(`💡 The build should create: dist/public/index.html`);
  } else {
    console.log(`\n✅ Using build directory: ${distPath}`);
    
    // Verificar se index.html existe
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error(`❌ index.html not found at: ${indexPath}`);
      if (fs.existsSync(distPath)) {
        console.error(`💡 Available files in ${distPath}:`, fs.readdirSync(distPath).join(', '));
      }
    } else {
      console.log(`✅ Found index.html at: ${indexPath}`);
    }
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (SPA routing)
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath!, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`❌ index.html not found at: ${indexPath}`);
      if (fs.existsSync(distPath!)) {
        console.error(`💡 Available files in ${distPath}:`, fs.readdirSync(distPath!).join(', '));
      }
      res.status(404).send("Build not found. Please run 'npm run build' first.");
    }
  });
}
