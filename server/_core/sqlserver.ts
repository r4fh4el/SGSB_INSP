import sql from "mssql/msnodesqlv8.js";
import type {
  config as SqlConfig,
  ConnectionPool,
  IResult as SqlResult,
  Request as SqlRequest,
  Transaction as SqlTransaction,
} from "mssql";

declare global {
  // eslint-disable-next-line no-var
  var __SQL_POOL__: ConnectionPool | undefined;
}

const sanitizeHost = (value: string): string => {
  const trimmed = value.trim();
  return /^\(local\)$/i.test(trimmed) ? "localhost" : trimmed;
};

const serverInput = process.env.SQLSERVER_SERVER ?? "localhost";
const instanceInput = process.env.SQLSERVER_INSTANCE;
const portInput = process.env.SQLSERVER_PORT;

// Detectar formato IP,porta (ex: 108.181.193.92,15000)
const isIpPortFormat = serverInput.includes(",") && !serverInput.includes("\\");
let hostPart: string;
let instancePart: string | undefined;
let port: string | undefined;
let rawServer: string;

if (isIpPortFormat) {
  // Formato IP,porta
  const [ip, portFromInput] = serverInput.split(",", 2);
  hostPart = sanitizeHost(ip ?? serverInput);
  port = portInput ?? portFromInput;
  instancePart = undefined;
  rawServer = port ? `${hostPart},${port}` : hostPart;
} else {
  // Formato tradicional host\instance
  const [inputHost, inputInstance] = serverInput.split("\\", 2);
  hostPart = sanitizeHost(inputHost ?? serverInput);
  instancePart = instanceInput ?? inputInstance ?? "SQLEXPRESS";
  port = portInput;
  rawServer = `${hostPart}\\${instancePart}`;
}

const database = process.env.SQLSERVER_DATABASE ?? "sgsb";
const trustedConnection = (process.env.SQLSERVER_TRUSTED_CONNECTION ?? "true") === "true";
const user = process.env.SQLSERVER_USER;
const password = process.env.SQLSERVER_PASSWORD;
const domain = process.env.SQLSERVER_DOMAIN;
const driver = process.env.SQLSERVER_DRIVER ?? "msnodesqlv8";
const odbcDriver =
  process.env.SQLSERVER_ODBC_DRIVER ?? "ODBC Driver 17 for SQL Server";

function formatSqlError(error: unknown) {
  if (error instanceof Error) {
    const rawMessage = (error as any).message;
    const formatted: Record<string, unknown> = {
      name: error.name,
      message:
        typeof rawMessage === "object" ? JSON.stringify(rawMessage) : rawMessage,
      code: (error as any).code,
    };

    const originalError = (error as any).originalError;
    if (originalError) {
      formatted.originalError =
        typeof originalError === "object"
          ? JSON.stringify(originalError)
          : originalError;
      if (originalError?.message) {
        formatted.originalMessage = originalError.message;
      }
    }

    return formatted;
  }

  if (typeof error === "object") {
    try {
      return JSON.stringify(error);
    } catch (_err) {
      return String(error);
    }
  }

  return error;
}

const baseOptions: SqlConfig["options"] = {
  trustServerCertificate: true,
};

let config: SqlConfig;

// Construir connection string com suporte a porta
let serverPart = rawServer;
if (port && !isIpPortFormat) {
  // Se tiver porta e não for formato IP,porta, adicionar porta ao host
  serverPart = `${hostPart},${port}`;
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

if (driver === "msnodesqlv8") {
  config = {
    connectionString,
    options: {},
  } as SqlConfig;
} else {
  config = {
    server: hostPart,
    database,
    driver,
    options: {
      ...baseOptions,
      encrypt: false,
      ...(instancePart ? { instanceName: instancePart } : {}),
      ...(port ? { port: parseInt(port, 10) } : {}),
    },
    ...(trustedConnection
      ? {
          authentication: {
            type: "ntlm",
            options: {
              domain: domain ?? "",
              userName: user ?? "",
              password: password ?? "",
            },
          },
        }
      : {
          user,
          password,
        }),
  };
}

function createPool() {
  const pool = new sql.ConnectionPool(config);
  const poolConnect = pool
    .connect()
    .then(() => {
      console.log(`[SQL Server] Connected to ${rawServer}/${database}`);
      return pool;
    })
    .catch((error: unknown) => {
      console.error("[SQL Server] Failed to connect", formatSqlError(error));
      console.error("[SQL Server] Raw error details:", error);
      throw error;
    });

  pool.on("error", (error: Error) => {
    console.error("[SQL Server] Connection pool error", error);
  });

  return poolConnect;
}

let poolPromise: Promise<ConnectionPool> | undefined;

export async function getSqlPool(): Promise<ConnectionPool> {
  if (!poolPromise) {
    if (process.env.NODE_ENV !== "production" && globalThis.__SQL_POOL__) {
      poolPromise = Promise.resolve(globalThis.__SQL_POOL__);
    } else {
      poolPromise = createPool();
      if (process.env.NODE_ENV !== "production") {
        poolPromise!.then((pool) => {
          globalThis.__SQL_POOL__ = pool;
        });
      }
    }
  }
  return poolPromise!;
}

export async function runQuery<T = unknown>(
  query: string,
  input?: (request: SqlRequest) => void
): Promise<SqlResult<T>> {
  const pool = await getSqlPool();
  const request = pool.request();
  if (input) {
    input(request);
  }
  return request.query(query) as SqlResult<T>;
}

export type { SqlRequest, SqlTransaction };

