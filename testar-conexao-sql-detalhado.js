// Script Node.js para testar conexao com SQL Server
import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env
dotenv.config({ path: resolve(__dirname, ".env") });

const serverInput = process.env.SQLSERVER_SERVER ?? "localhost";
const portInput = process.env.SQLSERVER_PORT;
const database = process.env.SQLSERVER_DATABASE ?? "sgsb";
const user = process.env.SQLSERVER_USER;
const password = process.env.SQLSERVER_PASSWORD;
const driver = process.env.SQLSERVER_DRIVER ?? "msnodesqlv8";
const odbcDriver = process.env.SQLSERVER_ODBC_DRIVER ?? "ODBC Driver 17 for SQL Server";

console.log("========================================");
console.log("  TESTE DE CONEXAO SQL SERVER DETALHADO");
console.log("========================================");
console.log("");
console.log("Configuracoes:");
console.log(`  Servidor: ${serverInput}`);
console.log(`  Porta: ${portInput}`);
console.log(`  Banco: ${database}`);
console.log(`  Usuario: ${user}`);
console.log(`  Driver: ${driver}`);
console.log(`  ODBC Driver: ${odbcDriver}`);
console.log("");

// Detectar formato IP,porta
const isIpPortFormat = serverInput.includes(",") && !serverInput.includes("\\");
let hostPart, port, rawServer;

if (isIpPortFormat) {
  const [ip, portFromInput] = serverInput.split(",", 2);
  hostPart = ip ?? serverInput;
  port = portInput ?? portFromInput;
  rawServer = port ? `${hostPart},${port}` : hostPart;
} else {
  const [inputHost, inputInstance] = serverInput.split("\\", 2);
  hostPart = inputHost ?? serverInput;
  port = portInput;
  rawServer = `${hostPart}\\${inputInstance ?? "SQLEXPRESS"}`;
}

// Construir connection string
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

console.log("Connection String (sem senha):");
console.log(connectionString.replace(/Pwd=[^;]+/, "Pwd=***"));
console.log("");

// Tentar conectar
console.log("Tentando conectar...");
const config = {
  connectionString,
  options: {},
};

try {
  const pool = new sql.ConnectionPool(config);
  
  console.log("Criando pool de conexao...");
  
  const startTime = Date.now();
  
  await pool.connect();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ CONEXAO BEM-SUCEDIDA! (${duration}ms)`);
  console.log(`   Servidor: ${rawServer}`);
  console.log(`   Banco: ${database}`);
  console.log("");
  
  // Testar uma query simples
  console.log("Testando query simples...");
  const request = pool.request();
  const result = await request.query("SELECT @@VERSION AS Version, DB_NAME() AS CurrentDatabase");
  
  if (result.recordset && result.recordset.length > 0) {
    console.log("✅ Query executada com sucesso!");
    console.log(`   Versao SQL Server: ${result.recordset[0].Version?.substring(0, 50)}...`);
    console.log(`   Banco atual: ${result.recordset[0].CurrentDatabase}`);
  }
  
  // Verificar se o banco de dados existe
  console.log("");
  console.log("Verificando se o banco de dados existe...");
  const dbCheck = await request.query(`
    SELECT name FROM sys.databases WHERE name = '${database}'
  `);
  
  if (dbCheck.recordset && dbCheck.recordset.length > 0) {
    console.log(`✅ Banco de dados '${database}' encontrado!`);
  } else {
    console.log(`⚠️  Banco de dados '${database}' NAO encontrado!`);
    console.log("   Bancos disponiveis:");
    const allDbs = await request.query("SELECT name FROM sys.databases ORDER BY name");
    allDbs.recordset.forEach(db => {
      console.log(`      - ${db.name}`);
    });
  }
  
  // Verificar tabelas
  console.log("");
  console.log("Verificando tabelas no banco...");
  const tables = await request.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);
  
  if (tables.recordset && tables.recordset.length > 0) {
    console.log(`✅ ${tables.recordset.length} tabela(s) encontrada(s):`);
    tables.recordset.slice(0, 10).forEach(table => {
      console.log(`      - ${table.TABLE_NAME}`);
    });
    if (tables.recordset.length > 10) {
      console.log(`      ... e mais ${tables.recordset.length - 10} tabela(s)`);
    }
  } else {
    console.log("⚠️  Nenhuma tabela encontrada no banco de dados");
  }
  
  await pool.close();
  console.log("");
  console.log("✅ Conexao fechada com sucesso");
  
  process.exit(0);
  
} catch (error) {
  console.error("");
  console.error("❌ ERRO AO CONECTAR:");
  console.error("");
  
  if (error instanceof Error) {
    console.error("Mensagem:", error.message);
    console.error("Nome:", error.name);
    
    if (error.code) {
      console.error("Codigo:", error.code);
    }
    
    if (error.originalError) {
      console.error("");
      console.error("Erro original:");
      const origError = error.originalError;
      if (origError.message) {
        console.error("  Mensagem:", origError.message);
      }
      if (origError.code) {
        console.error("  Codigo:", origError.code);
      }
      if (origError.sqlState) {
        console.error("  SQL State:", origError.sqlState);
      }
    }
    
    // Erros comuns e solucoes
    console.error("");
    console.error("Possiveis causas:");
    
    if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
      console.error("  - Timeout: Servidor nao esta respondendo ou porta esta bloqueada");
      console.error("  - Verifique se o servidor SQL esta online");
      console.error("  - Verifique se a porta esta aberta no firewall");
    }
    
    if (error.message.includes("Login failed") || error.message.includes("authentication")) {
      console.error("  - Autenticacao falhou: Usuario ou senha incorretos");
      console.error("  - Verifique as credenciais no arquivo .env");
    }
    
    if (error.message.includes("Cannot open database") || error.message.includes("database")) {
      console.error("  - Banco de dados nao encontrado");
      console.error("  - Verifique se o banco de dados existe");
      console.error("  - Verifique se o usuario tem permissao para acessar o banco");
    }
    
    if (error.message.includes("driver") || error.message.includes("ODBC")) {
      console.error("  - Problema com o driver ODBC");
      console.error("  - Verifique se o ODBC Driver 17 for SQL Server esta instalado");
    }
    
    if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("  - Servidor nao encontrado: IP ou hostname invalido");
      console.error("  - Verifique o endereco do servidor no arquivo .env");
    }
  } else {
    console.error("Erro desconhecido:", error);
  }
  
  console.error("");
  process.exit(1);
}

