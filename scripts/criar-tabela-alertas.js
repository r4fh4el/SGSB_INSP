// Script para criar a tabela de alertas no banco de dados
import sqlServer from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, "../.env") });

// Configuração do banco de dados
const serverInput = process.env.SQLSERVER_SERVER ?? "localhost";
const database = process.env.SQLSERVER_DATABASE ?? "sgsb";
const user = process.env.SQLSERVER_USER;
const password = process.env.SQLSERVER_PASSWORD;
const port = process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : undefined;

// Parse do servidor (mesmo formato do sqlserver.ts)
const isIpPortFormat = serverInput.includes(",") && !serverInput.includes("\\");
let hostPart;
let instancePart;
let portPart;
let rawServer;

if (isIpPortFormat) {
  // Formato IP,porta (ex: 108.181.193.92,15000)
  const [ip, portFromInput] = serverInput.split(",", 2);
  hostPart = ip?.trim() ?? serverInput;
  portPart = port || portFromInput?.trim();
  instancePart = undefined;
  rawServer = portPart ? `${hostPart},${portPart}` : hostPart;
} else {
  // Formato tradicional host\instance
  const [inputHost, inputInstance] = serverInput.split("\\", 2);
  hostPart = inputHost?.trim() ?? serverInput;
  instancePart = inputInstance?.trim() ?? "SQLEXPRESS";
  portPart = port;
  rawServer = `${hostPart}\\${instancePart}`;
}

const trustedConnection = (process.env.SQLSERVER_TRUSTED_CONNECTION ?? "false") === "true";
const odbcDriver = process.env.SQLSERVER_ODBC_DRIVER ?? "ODBC Driver 17 for SQL Server";

// Construir connection string (mesmo formato do sqlserver.ts)
let serverPart = rawServer;
if (portPart && !isIpPortFormat) {
  serverPart = `${hostPart},${portPart}`;
}

const connectionString =
  `Server=${serverPart};` +
  `Database=${database};` +
  `Driver={${odbcDriver}};` +
  "Encrypt=Yes;TrustServerCertificate=Yes;" +
  (trustedConnection
    ? "Trusted_Connection=Yes;"
    : user && password
    ? `Uid=${user};Pwd=${password};`
    : "");

console.log("🔄 Conectando ao banco de dados...");
console.log(`   Servidor: ${rawServer}`);
console.log(`   Database: ${database}`);
console.log(`   Usuário: ${user || "Windows Authentication"}`);
console.log("");

const config = {
  connectionString: connectionString,
  options: {},
};

// SQL para criar a tabela de alertas
const sqlCreateAlertas = `
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'alertas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  PRINT '📋 Criando tabela alertas...';
  
  CREATE TABLE dbo.alertas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    tipo NVARCHAR(100) NOT NULL,
    severidade NVARCHAR(16) NOT NULL,
    titulo NVARCHAR(255) NOT NULL,
    mensagem NVARCHAR(MAX) NOT NULL,
    instrumentoId INT NULL,
    leituraId INT NULL,
    ocorrenciaId INT NULL,
    destinatarios NVARCHAR(MAX) NULL,
    lido BIT NOT NULL CONSTRAINT DF_alertas_lido DEFAULT 0,
    dataLeitura DATETIME2 NULL,
    acaoTomada NVARCHAR(MAX) NULL,
    dataAcao DATETIME2 NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_alertas_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_alertas_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_alertas_instrumentos FOREIGN KEY (instrumentoId) REFERENCES dbo.instrumentos(id) ON DELETE NO ACTION,
    CONSTRAINT FK_alertas_leituras FOREIGN KEY (leituraId) REFERENCES dbo.leituras(id) ON DELETE NO ACTION,
    CONSTRAINT FK_alertas_ocorrencias FOREIGN KEY (ocorrenciaId) REFERENCES dbo.ocorrencias(id) ON DELETE NO ACTION
  );

  CREATE INDEX IX_alertas_barragemId ON dbo.alertas(barragemId, lido, createdAt DESC);
  
  PRINT '✅ Tabela alertas criada com sucesso!';
END
ELSE
BEGIN
  PRINT 'ℹ️  Tabela alertas já existe.';
END
GO
`;

async function criarTabelaAlertas() {
  let pool;
  try {
    // Conectar ao banco
    pool = await sqlServer.connect(config);
    console.log("✅ Conectado ao banco de dados!");
    console.log("");

    // Executar script SQL
    console.log("🔄 Executando script SQL...");
    const request = pool.request();
    
    // Dividir o script em partes (remover GO statements)
    const statements = sqlCreateAlertas
      .split("GO")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await request.query(statement);
      }
    }

    // Verificar se a tabela existe
    console.log("");
    console.log("🔍 Verificando tabela alertas...");
    const checkResult = await request.query(`
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM sys.tables WHERE name = 'alertas' AND schema_id = SCHEMA_ID('dbo'))
          THEN '✅ Tabela alertas existe'
          ELSE '❌ Tabela alertas NÃO existe'
        END AS status,
        COUNT(*) AS colunas
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'alertas'
    `);

    if (checkResult.recordset.length > 0) {
      console.log(`   ${checkResult.recordset[0].status}`);
      console.log(`   Colunas: ${checkResult.recordset[0].colunas}`);
    }

    // Verificar Foreign Keys
    console.log("");
    console.log("🔗 Verificando Foreign Keys...");
    const fkResult = await request.query(`
      SELECT 
        fk.name AS FK_Name,
        OBJECT_NAME(fk.parent_object_id) AS Tabela,
        OBJECT_NAME(fk.referenced_object_id) AS TabelaReferenciada
      FROM sys.foreign_keys AS fk
      WHERE OBJECT_NAME(fk.parent_object_id) = 'alertas'
    `);

    if (fkResult.recordset.length > 0) {
      console.log(`   ✅ ${fkResult.recordset.length} Foreign Key(s) encontrada(s):`);
      fkResult.recordset.forEach((fk) => {
        console.log(`      - ${fk.FK_Name}: ${fk.Tabela} → ${fk.TabelaReferenciada}`);
      });
    } else {
      console.log("   ⚠️  Nenhuma Foreign Key encontrada");
    }

    // Contar alertas existentes
    console.log("");
    console.log("📊 Alertas existentes:");
    try {
      const countResult = await request.query(`
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN lido = 0 THEN 1 ELSE 0 END) AS nao_lidos,
          SUM(CASE WHEN lido = 1 THEN 1 ELSE 0 END) AS lidos
        FROM dbo.alertas
      `);
      if (countResult.recordset.length > 0) {
        const stats = countResult.recordset[0];
        console.log(`   Total: ${stats.total}`);
        console.log(`   Não Lidos: ${stats.nao_lidos}`);
        console.log(`   Lidos: ${stats.lidos}`);
      }
    } catch (error) {
      console.log("   Nenhum alerta encontrado (tabela vazia)");
    }

    console.log("");
    console.log("✅ Processo concluído com sucesso!");

  } catch (error) {
    console.error("");
    console.error("❌ Erro ao executar script:");
    console.error(error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log("");
      console.log("🔌 Conexão fechada.");
    }
  }
}

// Executar
criarTabelaAlertas().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});

