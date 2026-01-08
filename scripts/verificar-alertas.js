// Script para verificar alertas existentes no banco de dados
import sqlServer from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, "../.env") });

// Configuração do banco de dados (mesma do sistema)
const serverInput = process.env.SQLSERVER_SERVER ?? "localhost";
const database = process.env.SQLSERVER_DATABASE ?? "sgsb";
const user = process.env.SQLSERVER_USER;
const password = process.env.SQLSERVER_PASSWORD;
const port = process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : undefined;
const trustedConnection = (process.env.SQLSERVER_TRUSTED_CONNECTION ?? "false") === "true";
const odbcDriver = process.env.SQLSERVER_ODBC_DRIVER ?? "ODBC Driver 17 for SQL Server";

// Parse do servidor
const isIpPortFormat = serverInput.includes(",") && !serverInput.includes("\\");
let hostPart;
let instancePart;
let portPart;
let rawServer;

if (isIpPortFormat) {
  const [ip, portFromInput] = serverInput.split(",", 2);
  hostPart = ip?.trim() ?? serverInput;
  portPart = port || portFromInput?.trim();
  instancePart = undefined;
  rawServer = portPart ? `${hostPart},${portPart}` : hostPart;
} else {
  const [inputHost, inputInstance] = serverInput.split("\\", 2);
  hostPart = inputHost?.trim() ?? serverInput;
  instancePart = inputInstance?.trim() ?? "SQLEXPRESS";
  portPart = port;
  rawServer = `${hostPart}\\${instancePart}`;
}

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

const config = {
  connectionString: connectionString,
  options: {},
};

async function verificarAlertas() {
  let pool;
  try {
    console.log("🔄 Conectando ao banco de dados...");
    console.log(`   Servidor: ${rawServer}`);
    console.log(`   Database: ${database}`);
    console.log("");

    pool = await sqlServer.connect(config);
    console.log("✅ Conectado ao banco de dados!");
    console.log("");

    const request = pool.request();

    // 1. Verificar se a tabela existe
    console.log("📋 Verificando tabela alertas...");
    const tableCheck = await request.query(`
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM sys.tables WHERE name = 'alertas' AND schema_id = SCHEMA_ID('dbo'))
          THEN 'SIM'
          ELSE 'NÃO'
        END AS existe
    `);
    console.log(`   Tabela existe: ${tableCheck.recordset[0]?.existe}`);
    console.log("");

    // 2. Contar alertas
    console.log("📊 Contando alertas...");
    const countResult = await request.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN lido = 0 THEN 1 ELSE 0 END) AS nao_lidos,
        SUM(CASE WHEN lido = 1 THEN 1 ELSE 0 END) AS lidos
      FROM dbo.alertas
    `);
    
    if (countResult.recordset.length > 0) {
      const stats = countResult.recordset[0];
      console.log(`   Total de alertas: ${stats.total || 0}`);
      console.log(`   Não lidos: ${stats.nao_lidos || 0}`);
      console.log(`   Lidos: ${stats.lidos || 0}`);
    }
    console.log("");

    // 3. Listar todos os alertas
    console.log("📋 Listando todos os alertas...");
    console.log("");
    const alertasResult = await request.query(`
      SELECT TOP 50
        id,
        barragemId,
        tipo,
        severidade,
        titulo,
        LEFT(mensagem, 100) as mensagem_preview,
        instrumentoId,
        leituraId,
        lido,
        createdAt,
        FORMAT(createdAt, 'dd/MM/yyyy HH:mm:ss') as data_formatada
      FROM dbo.alertas
      ORDER BY createdAt DESC
    `);

    if (alertasResult.recordset.length === 0) {
      console.log("   ⚠️  NENHUM ALERTA ENCONTRADO NA TABELA!");
      console.log("");
      console.log("   Isso significa que:");
      console.log("   - Nenhum alerta foi criado ainda, OU");
      console.log("   - As leituras não ultrapassaram os limites configurados");
    } else {
      console.log(`   ✅ Encontrados ${alertasResult.recordset.length} alerta(s):`);
      console.log("");
      
      alertasResult.recordset.forEach((alerta, index) => {
        console.log(`   ${index + 1}. ID: ${alerta.id}`);
        console.log(`      Tipo: ${alerta.tipo}`);
        console.log(`      Severidade: ${alerta.severidade.toUpperCase()}`);
        console.log(`      Título: ${alerta.titulo}`);
        console.log(`      Mensagem: ${alerta.mensagem_preview}...`);
        console.log(`      Barragem ID: ${alerta.barragemId}`);
        console.log(`      Instrumento ID: ${alerta.instrumentoId || 'N/A'}`);
        console.log(`      Leitura ID: ${alerta.leituraId || 'N/A'}`);
        console.log(`      Lido: ${alerta.lido ? 'SIM' : 'NÃO'}`);
        console.log(`      Criado em: ${alerta.data_formatada}`);
        console.log("");
      });
    }

    // 4. Verificar última leitura registrada
    console.log("🔍 Verificando última leitura registrada...");
    const ultimaLeitura = await request.query(`
      SELECT TOP 1
        l.id,
        l.instrumentoId,
        l.valor,
        l.inconsistencia,
        l.tipoInconsistencia,
        l.dataHora,
        i.codigo as instrumento_codigo,
        i.limiteSuperior,
        i.nivelCritico,
        FORMAT(l.dataHora, 'dd/MM/yyyy HH:mm:ss') as data_formatada
      FROM dbo.leituras l
      LEFT JOIN dbo.instrumentos i ON l.instrumentoId = i.id
      ORDER BY l.dataHora DESC
    `);

    if (ultimaLeitura.recordset.length > 0) {
      const leitura = ultimaLeitura.recordset[0];
      console.log(`   ID: ${leitura.id}`);
      console.log(`   Instrumento: ${leitura.instrumento_codigo} (ID: ${leitura.instrumentoId})`);
      console.log(`   Valor: ${leitura.valor}`);
      console.log(`   Inconsistência: ${leitura.inconsistencia ? 'SIM' : 'NÃO'}`);
      console.log(`   Tipo Inconsistência: ${leitura.tipoInconsistencia || 'N/A'}`);
      console.log(`   Limite Superior: ${leitura.limiteSuperior || 'N/A'}`);
      console.log(`   Nível Crítico: ${leitura.nivelCritico || 'N/A'}`);
      console.log(`   Data/Hora: ${leitura.data_formatada}`);
      
      if (leitura.inconsistencia) {
        console.log("");
        console.log("   ⚠️  Esta leitura marcou inconsistência!");
        console.log(`   Mas ${alertasResult.recordset.length === 0 ? 'NENHUM alerta foi criado' : 'um alerta foi criado'}`);
      }
    } else {
      console.log("   Nenhuma leitura encontrada");
    }

    console.log("");
    console.log("✅ Verificação concluída!");

  } catch (error) {
    console.error("");
    console.error("❌ Erro ao executar script:");
    console.error(error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
    }
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
verificarAlertas().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});

