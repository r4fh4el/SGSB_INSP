// Teste simples de conexao SQL Server
import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

const serverInput = process.env.SQLSERVER_SERVER ?? "localhost";
const portInput = process.env.SQLSERVER_PORT;
const database = process.env.SQLSERVER_DATABASE ?? "sgsb";
const user = process.env.SQLSERVER_USER;
const password = process.env.SQLSERVER_PASSWORD;
const odbcDriver = process.env.SQLSERVER_ODBC_DRIVER ?? "ODBC Driver 17 for SQL Server";

console.log("Testando conexao SQL Server...");
console.log(`Servidor: ${serverInput}`);
console.log(`Porta: ${portInput}`);
console.log(`Banco: ${database}`);
console.log(`Usuario: ${user}`);
console.log("");

const isIpPortFormat = serverInput.includes(",") && !serverInput.includes("\\");
let hostPart, port, rawServer;

if (isIpPortFormat) {
  const [ip, portFromInput] = serverInput.split(",", 2);
  hostPart = ip ?? serverInput;
  port = portInput ?? portFromInput;
  rawServer = port ? `${hostPart},${port}` : hostPart;
} else {
  const [inputHost] = serverInput.split("\\", 2);
  hostPart = inputHost ?? serverInput;
  port = portInput;
  rawServer = hostPart;
}

let serverPart = rawServer;
if (port && !isIpPortFormat) {
  serverPart = `${hostPart},${port}`;
}

const connectionString =
  `Server=${serverPart};` +
  `Database=${database};` +
  `Driver={${odbcDriver}};` +
  "Encrypt=Yes;TrustServerCertificate=Yes;" +
  (user && password ? `Uid=${user};Pwd=${password};` : "Trusted_Connection=Yes;");

console.log("Tentando conectar (timeout: 5s)...");

const config = {
  connectionString,
  options: {
    connectTimeout: 5000,
    requestTimeout: 10000,
  },
};

const startTime = Date.now();

try {
  const pool = new sql.ConnectionPool(config);
  
  // Timeout manual de 5 segundos
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("TIMEOUT: Conexao demorou mais de 5 segundos"));
    }, 5000);
  });
  
  const connectPromise = pool.connect();
  
  await Promise.race([connectPromise, timeoutPromise]);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`\n✅ SUCESSO! Conectado em ${duration}ms`);
  console.log(`   Servidor: ${rawServer}`);
  console.log(`   Banco: ${database}`);
  
  // Testar query
  const request = pool.request();
  const result = await request.query("SELECT @@VERSION AS Version, DB_NAME() AS CurrentDatabase, GETDATE() AS ServerTime");
  
  if (result.recordset && result.recordset.length > 0) {
    console.log("\n✅ Query executada com sucesso!");
    console.log(`   Versao: ${result.recordset[0].Version?.substring(0, 60)}...`);
    console.log(`   Banco atual: ${result.recordset[0].CurrentDatabase}`);
    console.log(`   Hora do servidor: ${result.recordset[0].ServerTime}`);
  }
  
  // Verificar banco
  const dbCheck = await request.query(`SELECT name FROM sys.databases WHERE name = '${database}'`);
  if (dbCheck.recordset && dbCheck.recordset.length > 0) {
    console.log(`\n✅ Banco de dados '${database}' existe!`);
  } else {
    console.log(`\n⚠️  Banco de dados '${database}' NAO encontrado`);
  }
  
  await pool.close();
  console.log("\n✅ Teste concluido com sucesso!");
  process.exit(0);
  
} catch (error) {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.error(`\n❌ ERRO APOS ${duration}ms:`);
  console.error("");
  
  if (error instanceof Error) {
    console.error("Mensagem:", error.message);
    
    if (error.message.includes("TIMEOUT") || error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
      console.error("\n⚠️  TIMEOUT - Servidor nao esta respondendo");
      console.error("   Possiveis causas:");
      console.error("   1. Servidor SQL nao esta online");
      console.error("   2. Porta esta bloqueada pelo firewall");
      console.error("   3. IP/hostname incorreto");
      console.error("   4. Servidor SQL nao esta escutando na porta especificada");
    } else if (error.message.includes("Login failed") || error.message.includes("authentication")) {
      console.error("\n⚠️  ERRO DE AUTENTICACAO");
      console.error("   Verifique usuario e senha no arquivo .env");
    } else if (error.message.includes("Cannot open database") || error.message.includes("database")) {
      console.error("\n⚠️  BANCO DE DADOS NAO ENCONTRADO");
      console.error(`   O banco '${database}' nao existe ou usuario nao tem permissao`);
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("\n⚠️  SERVIDOR NAO ENCONTRADO");
      console.error(`   Nao foi possivel resolver o endereco: ${rawServer}`);
    } else {
      console.error("\nErro completo:", error);
    }
  } else {
    console.error("Erro:", error);
  }
  
  process.exit(1);
}

