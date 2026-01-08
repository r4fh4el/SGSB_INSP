// Script Node.js para criar a tabela caracterizacaoBarragem
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sql from "mssql/msnodesqlv8";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function criarTabela() {
  try {
    // Ler configurações do .env
    const serverInput = process.env.SQLSERVER_SERVER;
    const database = process.env.SQLSERVER_DATABASE || "sgsb";
    const user = process.env.SQLSERVER_USER;
    const password = process.env.SQLSERVER_PASSWORD;
    const trustedConnection = (process.env.SQLSERVER_TRUSTED_CONNECTION ?? "true") === "true";
    const odbcDriver = process.env.SQLSERVER_ODBC_DRIVER || "ODBC Driver 17 for SQL Server";

    if (!serverInput) {
      console.error("❌ Erro: SQLSERVER_SERVER deve estar configurado no .env");
      process.exit(1);
    }

    console.log("=== Criando Tabela caracterizacaoBarragem ===");
    console.log(`Servidor: ${serverInput}`);
    console.log(`Banco: ${database}`);
    console.log("");

    // Usar a mesma lógica do sistema para formatar o servidor
    const sanitizeHost = (value) => {
      const trimmed = value.trim();
      return /^\(local\)$/i.test(trimmed) ? "localhost" : trimmed;
    };

    const isIpPortFormat = serverInput.includes(",") && !serverInput.includes("\\");
    let hostPart;
    let port;
    let rawServer;

    if (isIpPortFormat) {
      // Formato IP,porta (ex: 108.181.193.92,15000)
      const [ip, portFromInput] = serverInput.split(",", 2);
      hostPart = sanitizeHost(ip ?? serverInput);
      port = portFromInput;
      rawServer = `${hostPart},${port}`;
    } else {
      // Formato tradicional host\instance
      const [inputHost, inputInstance] = serverInput.split("\\", 2);
      hostPart = sanitizeHost(inputHost ?? serverInput);
      const instancePart = inputInstance ?? "SQLEXPRESS";
      rawServer = `${hostPart}\\${instancePart}`;
    }

    // Construir connection string
    const connectionString =
      `Server=${rawServer};` +
      `Database=${database};` +
      `Driver={${odbcDriver}};` +
      "Encrypt=Yes;TrustServerCertificate=Yes;" +
      (trustedConnection
        ? "Trusted_Connection=Yes;"
        : user && password
        ? `Uid=${user};Pwd=${password};`
        : "");

    const config = {
      connectionString,
      options: {},
    };

    // Ler script SQL (usar versão simplificada sem foreign keys)
    const scriptPath = path.join(__dirname, "criar-tabela-caracterizacao-simples.sql");
    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ Erro: Script não encontrado em ${scriptPath}`);
      process.exit(1);
    }

    const script = fs.readFileSync(scriptPath, "utf8");

    // Conectar e executar
    console.log("Conectando ao SQL Server...");
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✅ Conectado!");

    console.log("Executando script SQL...");
    
    // Dividir o script em comandos (separados por GO)
    const commands = script
      .split(/\bGO\b/i)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    for (const command of commands) {
      if (command.trim()) {
        try {
          await pool.request().query(command);
        } catch (err) {
          // Ignorar erros de "já existe" mas mostrar outros
          if (!err.message.includes("already exists") && !err.message.includes("já existe")) {
            console.error(`Erro ao executar comando: ${err.message}`);
            throw err;
          }
        }
      }
    }

    console.log("✅ Script executado com sucesso!");
    console.log("");
    console.log("Verificando se a tabela foi criada...");

    // Verificar se a tabela foi criada
    const result = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'caracterizacaoBarragem'
    `);

    if (result.recordset.length > 0) {
      console.log("✅ Tabela 'caracterizacaoBarragem' criada com sucesso!");
      console.log("");
      console.log("Agora você pode usar a funcionalidade de caracterização!");
    } else {
      console.log("⚠️  Tabela não encontrada após execução do script.");
    }

    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar script:");
    console.error(error.message);
    if (error.code) {
      console.error(`Código: ${error.code}`);
    }
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

criarTabela();
