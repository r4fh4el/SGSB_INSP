import sqlServer from "mssql/msnodesqlv8.js";
import { ENV } from "./_core/env";
import { runQuery, type SqlRequest } from "./_core/sqlserver";
import type {
  InsertAlerta,
  InsertAuditoria,
  InsertBarragem,
  InsertCaracterizacaoBarragem,
  InsertChecklist,
  InsertDocumento,
  InsertEstrutura,
  InsertHidrometria,
  InsertInstrumento,
  InsertLeitura,
  InsertManutencao,
  InsertOcorrencia,
  InsertPerguntaChecklist,
  InsertRespostaChecklist,
  InsertUser,
} from "@shared/dbTypes";

type SqlFieldConfig = {
  column?: string;
  type: any;
  transform?: (value: unknown) => unknown;
};

function buildUpdateFragments(
  data: Record<string, unknown>,
  config: Record<string, SqlFieldConfig>
) {
  const updates: string[] = [];
  const setters: Array<(request: SqlRequest) => void> = [];

  for (const [key, fieldConfig] of Object.entries(config)) {
    const value = data[key];
    if (value !== undefined) {
      const column = fieldConfig.column ?? key;
      updates.push(`${column} = @${column}`);
      setters.push((request) => {
        const transformed =
          value === null
            ? null
            : fieldConfig.transform
            ? fieldConfig.transform(value)
            : value;
        request.input(column, fieldConfig.type, transformed);
      });
    }
  }

  return {
    updates,
    apply: (request: SqlRequest) => setters.forEach((setter) => setter(request)),
  };
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseJsonColumn<T>(value: string | null | undefined): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("[SQL Server] Failed to parse JSON column", error);
    return null;
  }
}

// Função para garantir serialização segura de valores
function serializeValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Tipos primitivos
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  // Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Verificar se é um objeto Date do SQL Server (tem métodos de Date mas não é instanceof Date)
  if (value && typeof value === 'object' && 'getTime' in value && typeof value.getTime === 'function') {
    try {
      return new Date(value).toISOString();
    } catch {
      return null;
    }
  }
  
  // Outros objetos - converter para string ou null
  try {
    // Tentar detectar se é um objeto Date não padrão
    const str = String(value);
    if (str.includes('Date') || str.match(/\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    return str;
  } catch {
    return null;
  }
}

// ============================================================================
// USUÁRIOS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const now = new Date();

  await runQuery(
    `MERGE dbo.users AS target
     USING (SELECT @id AS id) AS source
     ON target.id = source.id
     WHEN MATCHED THEN
       UPDATE SET
         name = @name,
         email = @email,
         loginMethod = @loginMethod,
         role = COALESCE(@role, target.role),
         ativo = COALESCE(@ativo, target.ativo),
         lastSignedIn = COALESCE(@lastSignedIn, target.lastSignedIn)
     WHEN NOT MATCHED THEN
       INSERT (id, name, email, loginMethod, role, ativo, createdAt, lastSignedIn)
       VALUES (
         @id,
         @name,
         @email,
         @loginMethod,
         COALESCE(@role, 'visualizador'),
         COALESCE(@ativo, 1),
         COALESCE(@createdAt, SYSDATETIME()),
         COALESCE(@lastSignedIn, SYSDATETIME())
       );`,
    (request) => {
      request.input("id", sqlServer.NVarChar(64), user.id);
      request.input("name", sqlServer.NVarChar(255), user.name ?? null);
      request.input("email", sqlServer.NVarChar(320), user.email ?? null);
      request.input("loginMethod", sqlServer.NVarChar(64), user.loginMethod ?? null);
      request.input(
        "role",
        sqlServer.NVarChar(32),
        user.role ?? (user.id === ENV.ownerId ? "admin" : null)
      );
      request.input("ativo", sqlServer.Bit, user.ativo ?? null);
      request.input("createdAt", sqlServer.DateTime2, user.createdAt ?? now);
      request.input("lastSignedIn", sqlServer.DateTime2, user.lastSignedIn ?? now);
    }
  );
}

export async function getUser(id: string) {
  const result = await runQuery<InsertUser>(
    "SELECT TOP 1 * FROM dbo.users WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.NVarChar(64), id);
    }
  );

  return result.recordset[0];
}

export async function getAllUsers() {
  const result = await runQuery<InsertUser>(
    "SELECT * FROM dbo.users ORDER BY name"
  );
  return result.recordset;
}

export async function updateUserRole(userId: string, role: string) {
  await runQuery(
    "UPDATE dbo.users SET role = @role WHERE id = @id",
    (request) => {
      request.input("role", sqlServer.NVarChar(32), role);
      request.input("id", sqlServer.NVarChar(64), userId);
    }
  );
}

export async function toggleUserStatus(userId: string) {
  const user = await getUser(userId);
  if (!user) return;

  await runQuery(
    "UPDATE dbo.users SET ativo = @ativo WHERE id = @id",
    (request) => {
      request.input("ativo", sqlServer.Bit, user.ativo ? 0 : 1);
      request.input("id", sqlServer.NVarChar(64), userId);
    }
  );
}

// ============================================================================
// BARRAGENS
// ============================================================================

export async function createBarragem(data: InsertBarragem) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.barragens (
      codigo,
      nome,
      rio,
      bacia,
      municipio,
      estado,
      latitude,
      longitude,
      tipo,
      finalidade,
      altura,
      comprimento,
      volumeReservatorio,
      areaReservatorio,
      nivelMaximoNormal,
      nivelMaximoMaximorum,
      nivelMinimo,
      proprietario,
      operador,
      anoInicioConstrucao,
      anoInicioOperacao,
      categoriaRisco,
      danoPotencialAssociado,
      status,
      observacoes
    ) OUTPUT INSERTED.id VALUES (
      @codigo,
      @nome,
      @rio,
      @bacia,
      @municipio,
      @estado,
      @latitude,
      @longitude,
      @tipo,
      @finalidade,
      @altura,
      @comprimento,
      @volumeReservatorio,
      @areaReservatorio,
      @nivelMaximoNormal,
      @nivelMaximoMaximorum,
      @nivelMinimo,
      @proprietario,
      @operador,
      @anoInicioConstrucao,
      @anoInicioOperacao,
      @categoriaRisco,
      @danoPotencialAssociado,
      @status,
      @observacoes
    );`,
    (request) => {
      request.input("codigo", sqlServer.NVarChar(50), data.codigo);
      request.input("nome", sqlServer.NVarChar(255), data.nome);
      request.input("rio", sqlServer.NVarChar(255), data.rio ?? null);
      request.input("bacia", sqlServer.NVarChar(255), data.bacia ?? null);
      request.input("municipio", sqlServer.NVarChar(255), data.municipio ?? null);
      request.input("estado", sqlServer.NVarChar(2), data.estado ?? null);
      request.input("latitude", sqlServer.NVarChar(50), data.latitude ?? null);
      request.input("longitude", sqlServer.NVarChar(50), data.longitude ?? null);
      request.input("tipo", sqlServer.NVarChar(100), data.tipo ?? null);
      request.input("finalidade", sqlServer.NVarChar(255), data.finalidade ?? null);
      request.input("altura", sqlServer.NVarChar(50), data.altura ?? null);
      request.input("comprimento", sqlServer.NVarChar(50), data.comprimento ?? null);
      request.input("volumeReservatorio", sqlServer.NVarChar(50), data.volumeReservatorio ?? null);
      request.input("areaReservatorio", sqlServer.NVarChar(50), data.areaReservatorio ?? null);
      request.input("nivelMaximoNormal", sqlServer.NVarChar(50), data.nivelMaximoNormal ?? null);
      request.input("nivelMaximoMaximorum", sqlServer.NVarChar(50), data.nivelMaximoMaximorum ?? null);
      request.input("nivelMinimo", sqlServer.NVarChar(50), data.nivelMinimo ?? null);
      request.input("proprietario", sqlServer.NVarChar(255), data.proprietario ?? null);
      request.input("operador", sqlServer.NVarChar(255), data.operador ?? null);
      request.input("anoInicioConstrucao", sqlServer.Int, data.anoInicioConstrucao ?? null);
      request.input("anoInicioOperacao", sqlServer.Int, data.anoInicioOperacao ?? null);
      request.input("categoriaRisco", sqlServer.NVarChar(8), data.categoriaRisco ?? null);
      request.input("danoPotencialAssociado", sqlServer.NVarChar(16), data.danoPotencialAssociado ?? null);
      request.input("status", sqlServer.NVarChar(32), data.status ?? "ativa");
      request.input("observacoes", sqlServer.NVarChar(sqlServer.MAX), data.observacoes ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getAllBarragens() {
  const result = await runQuery<InsertBarragem & { id: number }>(
    "SELECT * FROM dbo.barragens ORDER BY nome"
  );
  return result.recordset;
}

export async function getBarragemById(id: number) {
  const result = await runQuery<InsertBarragem & { id: number }>(
    "SELECT TOP 1 * FROM dbo.barragens WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
  return result.recordset[0];
}

export async function updateBarragem(id: number, data: Partial<InsertBarragem>) {
  const updates: string[] = [];
  const paramSetters: Array<(request: SqlRequest) => void> = [];

  const addField = (
    column: string,
    value: unknown,
    setter: (request: SqlRequest) => void
  ) => {
    if (value !== undefined) {
      updates.push(`${column} = @${column}`);
      paramSetters.push(setter);
    }
  };

  addField("codigo", data.codigo, (request) =>
    request.input("codigo", sqlServer.NVarChar(50), data.codigo ?? null)
  );
  addField("nome", data.nome, (request) =>
    request.input("nome", sqlServer.NVarChar(255), data.nome ?? null)
  );
  addField("rio", data.rio, (request) =>
    request.input("rio", sqlServer.NVarChar(255), data.rio ?? null)
  );
  addField("bacia", data.bacia, (request) =>
    request.input("bacia", sqlServer.NVarChar(255), data.bacia ?? null)
  );
  addField("municipio", data.municipio, (request) =>
    request.input("municipio", sqlServer.NVarChar(255), data.municipio ?? null)
  );
  addField("estado", data.estado, (request) =>
    request.input("estado", sqlServer.NVarChar(2), data.estado ?? null)
  );
  addField("latitude", data.latitude, (request) =>
    request.input("latitude", sqlServer.NVarChar(50), data.latitude ?? null)
  );
  addField("longitude", data.longitude, (request) =>
    request.input("longitude", sqlServer.NVarChar(50), data.longitude ?? null)
  );
  addField("tipo", data.tipo, (request) =>
    request.input("tipo", sqlServer.NVarChar(100), data.tipo ?? null)
  );
  addField("finalidade", data.finalidade, (request) =>
    request.input("finalidade", sqlServer.NVarChar(255), data.finalidade ?? null)
  );
  addField("altura", data.altura, (request) =>
    request.input("altura", sqlServer.NVarChar(50), data.altura ?? null)
  );
  addField("comprimento", data.comprimento, (request) =>
    request.input("comprimento", sqlServer.NVarChar(50), data.comprimento ?? null)
  );
  addField("volumeReservatorio", data.volumeReservatorio, (request) =>
    request.input(
      "volumeReservatorio",
      sqlServer.NVarChar(50),
      data.volumeReservatorio ?? null
    )
  );
  addField("areaReservatorio", data.areaReservatorio, (request) =>
    request.input(
      "areaReservatorio",
      sqlServer.NVarChar(50),
      data.areaReservatorio ?? null
    )
  );
  addField("nivelMaximoNormal", data.nivelMaximoNormal, (request) =>
    request.input(
      "nivelMaximoNormal",
      sqlServer.NVarChar(50),
      data.nivelMaximoNormal ?? null
    )
  );
  addField("nivelMaximoMaximorum", data.nivelMaximoMaximorum, (request) =>
    request.input(
      "nivelMaximoMaximorum",
      sqlServer.NVarChar(50),
      data.nivelMaximoMaximorum ?? null
    )
  );
  addField("nivelMinimo", data.nivelMinimo, (request) =>
    request.input("nivelMinimo", sqlServer.NVarChar(50), data.nivelMinimo ?? null)
  );
  addField("proprietario", data.proprietario, (request) =>
    request.input("proprietario", sqlServer.NVarChar(255), data.proprietario ?? null)
  );
  addField("operador", data.operador, (request) =>
    request.input("operador", sqlServer.NVarChar(255), data.operador ?? null)
  );
  addField("anoInicioConstrucao", data.anoInicioConstrucao, (request) =>
    request.input(
      "anoInicioConstrucao",
      sqlServer.Int,
      data.anoInicioConstrucao ?? null
    )
  );
  addField("anoInicioOperacao", data.anoInicioOperacao, (request) =>
    request.input("anoInicioOperacao", sqlServer.Int, data.anoInicioOperacao ?? null)
  );
  addField("categoriaRisco", data.categoriaRisco, (request) =>
    request.input(
      "categoriaRisco",
      sqlServer.NVarChar(8),
      data.categoriaRisco ?? null
    )
  );
  addField("danoPotencialAssociado", data.danoPotencialAssociado, (request) =>
    request.input(
      "danoPotencialAssociado",
      sqlServer.NVarChar(16),
      data.danoPotencialAssociado ?? null
    )
  );
  addField("status", data.status, (request) =>
    request.input("status", sqlServer.NVarChar(32), data.status ?? null)
  );
  addField("observacoes", data.observacoes, (request) =>
    request.input(
      "observacoes",
      sqlServer.NVarChar(sqlServer.MAX),
      data.observacoes ?? null
    )
  );

  if (updates.length === 0) return;

  updates.push("updatedAt = SYSDATETIME()");

  await runQuery(
    `UPDATE dbo.barragens SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      paramSetters.forEach((setter) => setter(request));
    }
  );
}

export async function deleteBarragem(id: number) {
  await runQuery(
    "DELETE FROM dbo.barragens WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// ESTRUTURAS
// ============================================================================

export async function createEstrutura(data: InsertEstrutura) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.estruturas (
      barragemId,
      codigo,
      nome,
      tipo,
      descricao,
      localizacao,
      coordenadas,
      ativo
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @codigo,
      @nome,
      @tipo,
      @descricao,
      @localizacao,
      @coordenadas,
      COALESCE(@ativo, 1)
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("codigo", sqlServer.NVarChar(50), data.codigo);
      request.input("nome", sqlServer.NVarChar(255), data.nome);
      request.input("tipo", sqlServer.NVarChar(100), data.tipo);
      request.input("descricao", sqlServer.NVarChar(sqlServer.MAX), data.descricao ?? null);
      request.input("localizacao", sqlServer.NVarChar(255), data.localizacao ?? null);
      request.input("coordenadas", sqlServer.NVarChar(100), data.coordenadas ?? null);
      request.input("ativo", sqlServer.Bit, data.ativo ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getEstruturasByBarragem(barragemId: number) {
  const result = await runQuery<InsertEstrutura & { id: number }>(
    `SELECT * FROM dbo.estruturas WHERE barragemId = @barragemId ORDER BY nome`,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset;
}

export async function updateEstrutura(id: number, data: Partial<InsertEstrutura>) {
  const { updates, apply } = buildUpdateFragments(data as Record<string, unknown>, {
    barragemId: { type: sqlServer.Int },
    codigo: { type: sqlServer.NVarChar(50) },
    nome: { type: sqlServer.NVarChar(255) },
    tipo: { type: sqlServer.NVarChar(100) },
    descricao: { type: sqlServer.NVarChar(sqlServer.MAX) },
    localizacao: { type: sqlServer.NVarChar(255) },
    coordenadas: { type: sqlServer.NVarChar(100) },
    ativo: { type: sqlServer.Bit },
  });

  if (updates.length === 0) return;

  await runQuery(
    `UPDATE dbo.estruturas SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      apply(request);
    }
  );
}

export async function deleteEstrutura(id: number) {
  await runQuery(
    "DELETE FROM dbo.estruturas WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// INSTRUMENTOS
// ============================================================================

export async function createInstrumento(data: InsertInstrumento) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.instrumentos (
      barragemId,
      estruturaId,
      codigo,
      tipo,
      localizacao,
      estaca,
      cota,
      coordenadas,
      dataInstalacao,
      fabricante,
      modelo,
      numeroSerie,
      nivelNormal,
      nivelAlerta,
      nivelCritico,
      formula,
      unidadeMedida,
      limiteInferior,
      limiteSuperior,
      frequenciaLeitura,
      responsavel,
      qrCode,
      codigoBarras,
      status,
      observacoes,
      ativo
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @estruturaId,
      @codigo,
      @tipo,
      @localizacao,
      @estaca,
      @cota,
      @coordenadas,
      @dataInstalacao,
      @fabricante,
      @modelo,
      @numeroSerie,
      @nivelNormal,
      @nivelAlerta,
      @nivelCritico,
      @formula,
      @unidadeMedida,
      @limiteInferior,
      @limiteSuperior,
      @frequenciaLeitura,
      @responsavel,
      @qrCode,
      @codigoBarras,
      COALESCE(@status, 'ativo'),
      @observacoes,
      COALESCE(@ativo, 1)
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("estruturaId", sqlServer.Int, data.estruturaId ?? null);
      request.input("codigo", sqlServer.NVarChar(50), data.codigo);
      request.input("tipo", sqlServer.NVarChar(100), data.tipo);
      request.input("localizacao", sqlServer.NVarChar(255), data.localizacao ?? null);
      request.input("estaca", sqlServer.NVarChar(50), data.estaca ?? null);
      request.input("cota", sqlServer.NVarChar(50), data.cota ?? null);
      request.input("coordenadas", sqlServer.NVarChar(100), data.coordenadas ?? null);
      request.input("dataInstalacao", sqlServer.DateTime2, toDate(data.dataInstalacao));
      request.input("fabricante", sqlServer.NVarChar(255), data.fabricante ?? null);
      request.input("modelo", sqlServer.NVarChar(255), data.modelo ?? null);
      request.input("numeroSerie", sqlServer.NVarChar(100), data.numeroSerie ?? null);
      request.input("nivelNormal", sqlServer.NVarChar(50), data.nivelNormal ?? null);
      request.input("nivelAlerta", sqlServer.NVarChar(50), data.nivelAlerta ?? null);
      request.input("nivelCritico", sqlServer.NVarChar(50), data.nivelCritico ?? null);
      request.input("formula", sqlServer.NVarChar(sqlServer.MAX), data.formula ?? null);
      request.input("unidadeMedida", sqlServer.NVarChar(50), data.unidadeMedida ?? null);
      request.input("limiteInferior", sqlServer.NVarChar(50), data.limiteInferior ?? null);
      request.input("limiteSuperior", sqlServer.NVarChar(50), data.limiteSuperior ?? null);
      request.input("frequenciaLeitura", sqlServer.NVarChar(100), data.frequenciaLeitura ?? null);
      request.input("responsavel", sqlServer.NVarChar(255), data.responsavel ?? null);
      request.input("qrCode", sqlServer.NVarChar(255), data.qrCode ?? null);
      request.input("codigoBarras", sqlServer.NVarChar(255), data.codigoBarras ?? null);
      request.input("status", sqlServer.NVarChar(32), data.status ?? null);
      request.input("observacoes", sqlServer.NVarChar(sqlServer.MAX), data.observacoes ?? null);
      request.input("ativo", sqlServer.Bit, data.ativo ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getAllInstrumentos(barragemId?: number) {
  const query = barragemId
    ? `SELECT * FROM dbo.instrumentos WHERE barragemId = @barragemId ORDER BY codigo`
    : `SELECT * FROM dbo.instrumentos ORDER BY codigo`;

  const result = await runQuery<InsertInstrumento & { id: number }>(
    query,
    (request) => {
      if (barragemId !== undefined) {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    }
  );

  return result.recordset;
}

export async function getInstrumentoById(id: number) {
  const result = await runQuery<InsertInstrumento & { id: number }>(
    `SELECT TOP 1 * FROM dbo.instrumentos WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );

  return result.recordset[0];
}

export async function getInstrumentoByCodigo(codigo: string) {
  const result = await runQuery<InsertInstrumento & { id: number }>(
    `SELECT TOP 1 * FROM dbo.instrumentos WHERE codigo = @codigo`,
    (request) => {
      request.input("codigo", sqlServer.NVarChar(50), codigo);
    }
  );

  return result.recordset[0];
}

export async function updateInstrumento(id: number, data: Partial<InsertInstrumento>) {
  const { updates, apply } = buildUpdateFragments(data as Record<string, unknown>, {
    barragemId: { type: sqlServer.Int },
    estruturaId: { type: sqlServer.Int },
    codigo: { type: sqlServer.NVarChar(50) },
    tipo: { type: sqlServer.NVarChar(100) },
    localizacao: { type: sqlServer.NVarChar(255) },
    estaca: { type: sqlServer.NVarChar(50) },
    cota: { type: sqlServer.NVarChar(50) },
    coordenadas: { type: sqlServer.NVarChar(100) },
    dataInstalacao: { type: sqlServer.DateTime2, transform: toDate },
    fabricante: { type: sqlServer.NVarChar(255) },
    modelo: { type: sqlServer.NVarChar(255) },
    numeroSerie: { type: sqlServer.NVarChar(100) },
    nivelNormal: { type: sqlServer.NVarChar(50) },
    nivelAlerta: { type: sqlServer.NVarChar(50) },
    nivelCritico: { type: sqlServer.NVarChar(50) },
    formula: { type: sqlServer.NVarChar(sqlServer.MAX) },
    unidadeMedida: { type: sqlServer.NVarChar(50) },
    limiteInferior: { type: sqlServer.NVarChar(50) },
    limiteSuperior: { type: sqlServer.NVarChar(50) },
    frequenciaLeitura: { type: sqlServer.NVarChar(100) },
    responsavel: { type: sqlServer.NVarChar(255) },
    qrCode: { type: sqlServer.NVarChar(255) },
    codigoBarras: { type: sqlServer.NVarChar(255) },
    status: { type: sqlServer.NVarChar(32) },
    observacoes: { type: sqlServer.NVarChar(sqlServer.MAX) },
    ativo: { type: sqlServer.Bit },
  });

  if (updates.length === 0) return;

  updates.push("updatedAt = SYSDATETIME()");

  await runQuery(
    `UPDATE dbo.instrumentos SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      apply(request);
    }
  );
}

export async function deleteInstrumento(id: number) {
  await runQuery(
    "DELETE FROM dbo.instrumentos WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// LEITURAS
// ============================================================================

/**
 * Calcula a severidade do alerta baseado nos limites do instrumento
 * Retorna: { severidade, tipoInconsistencia, deveAlertar }
 */
function calcularSeveridadeAlerta(
  valor: number,
  instrumento: {
    limiteInferior: string | null;
    limiteSuperior: string | null;
    nivelNormal: string | null;
    nivelAlerta: string | null;
    nivelCritico: string | null;
    tipo: string;
  }
): {
  severidade: "info" | "aviso" | "alerta" | "critico";
  tipoInconsistencia: string;
  deveAlertar: boolean;
} {
  // Valores padrão
  let severidade: "info" | "aviso" | "alerta" | "critico" = "info";
  let tipoInconsistencia = "";
  let deveAlertar = false;

  // Parse dos limites (tratar strings vazias como null)
  const parseLimite = (valor: string | null | undefined): number | null => {
    if (!valor || valor.trim() === "") return null;
    const parsed = parseFloat(valor);
    return isNaN(parsed) ? null : parsed;
  };

  const limiteInferior = parseLimite(instrumento.limiteInferior);
  const limiteSuperior = parseLimite(instrumento.limiteSuperior);
  const nivelNormal = parseLimite(instrumento.nivelNormal);
  const nivelAlerta = parseLimite(instrumento.nivelAlerta);
  const nivelCritico = parseLimite(instrumento.nivelCritico);

  // Debug: Log dos limites
  console.log('[ALERTA DEBUG] Verificando limites:', {
    valor,
    instrumentoId: (instrumento as any).id || 'N/A',
    codigoInstrumento: (instrumento as any).codigo || 'N/A',
    limites: {
      limiteInferior: instrumento.limiteInferior,
      limiteSuperior: instrumento.limiteSuperior,
      nivelNormal: instrumento.nivelNormal,
      nivelAlerta: instrumento.nivelAlerta,
      nivelCritico: instrumento.nivelCritico,
    },
    parseados: {
      limiteInferior,
      limiteSuperior,
      nivelNormal,
      nivelAlerta,
      nivelCritico,
    }
  });

  // Se não há limites configurados, não gera alerta
  if (
    limiteInferior === null &&
    limiteSuperior === null &&
    nivelAlerta === null &&
    nivelCritico === null
  ) {
    console.log('[ALERTA DEBUG] Nenhum limite configurado - não gera alerta');
    return { severidade: "info", tipoInconsistencia: "", deveAlertar: false };
  }

  // Determinar faixa normal (se não especificada, usa limites)
  const faixaMin = nivelNormal ?? limiteInferior ?? (limiteSuperior ? limiteSuperior * 0.5 : null);
  const faixaMax = nivelNormal ?? limiteSuperior ?? (limiteInferior ? limiteInferior * 1.5 : null);

  // Verificar limites CRÍTICOS primeiro (maior prioridade)
  if (nivelCritico !== null) {
    if (valor >= nivelCritico) {
      severidade = "critico";
      tipoInconsistencia = "Acima do nível crítico";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
    // Verificar se está muito abaixo do crítico (para alguns tipos de instrumentos)
    if (limiteInferior !== null && valor <= limiteInferior * 0.5) {
      severidade = "critico";
      tipoInconsistencia = "Muito abaixo do limite inferior crítico";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
  }

  // Verificar limites SUPERIORES
  if (limiteSuperior !== null) {
    const percentualSuperior = (valor / limiteSuperior) * 100;

    if (valor >= limiteSuperior) {
      // 100% ou mais = CRÍTICO
      severidade = "critico";
      tipoInconsistencia = "Ultrapassou o limite superior crítico";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    } else if (percentualSuperior >= 95) {
      // 95% a 100% = CRÍTICO (emergência)
      severidade = "critico";
      tipoInconsistencia = "Próximo ao limite superior crítico (≥95%)";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    } else if (percentualSuperior >= 90) {
      // 90% a 95% = LARANJA (alerta)
      severidade = "alerta";
      tipoInconsistencia = "Próximo ao limite superior (90-95%)";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    } else if (percentualSuperior >= 80) {
      // 80% a 90% = AMARELO (atenção)
      severidade = "aviso";
      tipoInconsistencia = "Aproximando-se do limite superior (80-90%)";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
  }

  // Verificar nível de ALERTA (se configurado)
  if (nivelAlerta !== null) {
    if (valor >= nivelAlerta) {
      // Se já passou do alerta mas não do crítico
      if (nivelCritico === null || valor < nivelCritico) {
        severidade = "alerta";
        tipoInconsistencia = "Acima do nível de alerta";
        deveAlertar = true;
        return { severidade, tipoInconsistencia, deveAlertar };
      }
    }
  }

  // Verificar limites INFERIORES
  if (limiteInferior !== null) {
    if (valor <= limiteInferior) {
      // Abaixo ou igual ao limite inferior = CRÍTICO
      severidade = "critico";
      tipoInconsistencia = "Abaixo do limite inferior crítico";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }

    // Calcular quanto está acima do limite inferior (em percentual)
    const diferenca = valor - limiteInferior;
    const percentualAcima = (diferenca / limiteInferior) * 100;

    // Se está muito próximo do limite inferior (até 5% acima)
    if (percentualAcima <= 5 && percentualAcima > 0) {
      severidade = "critico";
      tipoInconsistencia = "Muito próximo do limite inferior crítico (≤5% acima)";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
    // Se está próximo do limite inferior (5% a 10% acima)
    else if (percentualAcima <= 10 && percentualAcima > 5) {
      severidade = "alerta";
      tipoInconsistencia = "Próximo ao limite inferior (5-10% acima)";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
    // Se está se aproximando do limite inferior (10% a 20% acima)
    else if (percentualAcima <= 20 && percentualAcima > 10) {
      severidade = "aviso";
      tipoInconsistencia = "Aproximando-se do limite inferior (10-20% acima)";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
  }

  // Verificar se está dentro da faixa normal mas próximo dos limites
  if (faixaMin !== null && faixaMax !== null) {
    const percentualFaixa = ((valor - faixaMin) / (faixaMax - faixaMin)) * 100;

    // Se está muito próximo dos limites (80-90% ou 10-20% da faixa)
    if (percentualFaixa >= 80 && percentualFaixa < 90) {
      severidade = "aviso";
      tipoInconsistencia = "Valor próximo ao limite superior da faixa normal";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    } else if (percentualFaixa <= 20 && percentualFaixa > 10) {
      severidade = "aviso";
      tipoInconsistencia = "Valor próximo ao limite inferior da faixa normal";
      deveAlertar = true;
      return { severidade, tipoInconsistencia, deveAlertar };
    }
  }

  // Se chegou aqui, está dentro dos limites normais
  return { severidade: "info", tipoInconsistencia: "", deveAlertar: false };
}

export async function createLeitura(data: InsertLeitura) {
  console.log('[ALERTA DEBUG] ============================================');
  console.log('[ALERTA DEBUG] INICIANDO CRIAÇÃO DE LEITURA');
  console.log('[ALERTA DEBUG] ============================================');
  console.log('[ALERTA DEBUG] Dados recebidos:', {
    instrumentoId: data.instrumentoId,
    valor: data.valor,
    dataHora: data.dataHora,
    usuarioId: data.usuarioId,
  });

  const instrumento = await getInstrumentoById(data.instrumentoId);
  console.log('[ALERTA DEBUG] Instrumento encontrado:', {
    encontrado: !!instrumento,
    id: instrumento?.id,
    codigo: instrumento?.codigo,
    barragemId: instrumento?.barragemId,
    tipo: instrumento?.tipo,
    limites: {
      limiteInferior: instrumento?.limiteInferior,
      limiteSuperior: instrumento?.limiteSuperior,
      nivelNormal: instrumento?.nivelNormal,
      nivelAlerta: instrumento?.nivelAlerta,
      nivelCritico: instrumento?.nivelCritico,
    },
  });

  let severidadeAlerta: "info" | "aviso" | "alerta" | "critico" = "info";
  let tipoInconsistencia: string | null = null;

  if (instrumento) {
    const valor = parseFloat(data.valor);
    console.log('[ALERTA DEBUG] Valor parseado:', {
      valorOriginal: data.valor,
      valorNumerico: valor,
      isNaN: Number.isNaN(valor),
    });

    // Se o valor é numérico válido, calcular severidade
    if (!Number.isNaN(valor)) {
      console.log('[ALERTA DEBUG] Calculando severidade do alerta...');
      const resultado = calcularSeveridadeAlerta(valor, instrumento);
      console.log('[ALERTA DEBUG] Resultado do cálculo:', resultado);

      if (resultado.deveAlertar) {
        data.inconsistencia = true;
        data.tipoInconsistencia = resultado.tipoInconsistencia;
        severidadeAlerta = resultado.severidade;
        tipoInconsistencia = resultado.tipoInconsistencia;
        console.log('[ALERTA DEBUG] ✅ ALERTA DEVE SER CRIADO!', {
          severidade: severidadeAlerta,
          tipoInconsistencia: tipoInconsistencia,
        });
      } else {
        console.log('[ALERTA DEBUG] ⚠️ Alerta NÃO deve ser criado - valores dentro dos limites');
      }
    } else {
      console.log('[ALERTA DEBUG] Valor não é numérico, verificando palavras-chave...');
      // Se o valor não é numérico, verificar se é um valor crítico conhecido
      const valorLower = data.valor.toLowerCase().trim();
      if (valorLower.includes("erro") || valorLower.includes("falha") || valorLower.includes("crítico")) {
        data.inconsistencia = true;
        data.tipoInconsistencia = "Leitura com erro ou falha";
        severidadeAlerta = "critico";
        tipoInconsistencia = "Leitura com erro ou falha";
        console.log('[ALERTA DEBUG] ✅ ALERTA CRÍTICO - valor contém palavras-chave!');
      } else {
        console.log('[ALERTA DEBUG] ⚠️ Valor não numérico e não contém palavras-chave críticas');
      }
    }
  } else {
    console.log('[ALERTA DEBUG] ❌ Instrumento não encontrado! ID:', data.instrumentoId);
  }

  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.leituras (
      instrumentoId,
      usuarioId,
      dataHora,
      valor,
      nivelMontante,
      inconsistencia,
      tipoInconsistencia,
      observacoes,
      origem,
      latitude,
      longitude
    ) OUTPUT INSERTED.id VALUES (
      @instrumentoId,
      @usuarioId,
      @dataHora,
      @valor,
      @nivelMontante,
      COALESCE(@inconsistencia, 0),
      @tipoInconsistencia,
      @observacoes,
      COALESCE(@origem, 'mobile'),
      @latitude,
      @longitude
    );`,
    (request) => {
      request.input("instrumentoId", sqlServer.Int, data.instrumentoId);
      request.input("usuarioId", sqlServer.NVarChar(64), data.usuarioId);
      request.input("dataHora", sqlServer.DateTime2, toDate(data.dataHora));
      request.input("valor", sqlServer.NVarChar(50), data.valor);
      request.input("nivelMontante", sqlServer.NVarChar(50), data.nivelMontante ?? null);
      request.input("inconsistencia", sqlServer.Bit, data.inconsistencia ?? null);
      request.input("tipoInconsistencia", sqlServer.NVarChar(100), data.tipoInconsistencia ?? null);
      request.input("observacoes", sqlServer.NVarChar(sqlServer.MAX), data.observacoes ?? null);
      request.input("origem", sqlServer.NVarChar(16), data.origem ?? null);
      request.input("latitude", sqlServer.NVarChar(50), data.latitude ?? null);
      request.input("longitude", sqlServer.NVarChar(50), data.longitude ?? null);
    }
  );

  const insertedId = result.recordset[0]?.id ?? 0;
  console.log('[ALERTA DEBUG] Leitura inserida no banco:', {
    insertedId,
    sucesso: insertedId > 0,
  });

  // ============================================================================
  // INTEGRAÇÃO AUTOMÁTICA: Atualizar caracterização baseada em mapeamentos
  // ============================================================================
  if (insertedId > 0 && instrumento) {
    try {
      console.log('[Integração] Verificando mapeamentos para instrumento:', instrumento.codigo);
      
      // Atualizar caracterização se houver mapeamentos
      const caracterizacaoAtualizada = await atualizarCaracterizacaoPorLeitura(
        instrumento.codigo,
        data.valor,
        instrumento.barragemId
      );

      if (caracterizacaoAtualizada) {
        // Buscar caracterização atualizada
        const caracterizacao = await getCaracterizacaoByBarragem(instrumento.barragemId);
        
        if (caracterizacao) {
          // Sincronizar com SGSB-FINAL
          const { sincronizarCaracterizacaoComHidro, dispararCalculoAutomaticoHidro } = await import("./notificacaoHidro");
          const sincronizado = await sincronizarCaracterizacaoComHidro(caracterizacao);
          
          if (sincronizado) {
            // Disparar cálculo automático no SGSB-FINAL
            await dispararCalculoAutomaticoHidro(instrumento.barragemId);
            
            // Atualizar flag de sincronização
            await updateCaracterizacaoBarragem(caracterizacao.id, {
              sincronizadoComHidro: true,
              dataSincronizacao: new Date(),
            } as any);
          }
        }
      }
    } catch (error) {
      // Log mas não quebra o fluxo
      console.error('[Integração] Erro ao integrar leitura com caracterização:', error);
    }
  }

  // Debug: Log para verificar o que está acontecendo
  console.log('[ALERTA DEBUG] ============================================');
  console.log('[ALERTA DEBUG] VERIFICANDO CONDIÇÕES PARA CRIAR ALERTA');
  console.log('[ALERTA DEBUG] ============================================');
  console.log('[ALERTA DEBUG] Condições:', {
    temInconsistencia: data.inconsistencia,
    temInstrumento: !!instrumento,
    temInsertedId: insertedId > 0,
    temTipoInconsistencia: !!tipoInconsistencia,
    severidadeAlerta: severidadeAlerta,
    instrumentoId: instrumento?.id,
    instrumentoCodigo: instrumento?.codigo,
    instrumentoBarragemId: instrumento?.barragemId,
  });

  // Criar alerta se necessário
  if (data.inconsistencia && instrumento && insertedId && tipoInconsistencia) {
    console.log('[ALERTA DEBUG] ✅ TODAS AS CONDIÇÕES ATENDIDAS - Criando alerta...');
    // Construir mensagem detalhada
    const unidade = instrumento.unidadeMedida ? ` ${instrumento.unidadeMedida}` : "";
    const localizacao = instrumento.localizacao ? ` (${instrumento.localizacao})` : "";
    const tipoInstrumento = instrumento.tipo ? ` - ${instrumento.tipo}` : "";

    let mensagem = `O instrumento ${instrumento.codigo}${tipoInstrumento}${localizacao} apresentou leitura fora dos limites estabelecidos.\n\n`;
    mensagem += `📊 Valor lido: ${data.valor}${unidade}\n`;
    mensagem += `⚠️ Tipo de inconsistência: ${tipoInconsistencia}\n`;

    // Adicionar informações sobre limites configurados
    if (instrumento.limiteInferior || instrumento.limiteSuperior) {
      mensagem += `\n📏 Limites configurados:\n`;
      if (instrumento.limiteInferior) {
        mensagem += `   • Limite inferior: ${instrumento.limiteInferior}${unidade}\n`;
      }
      if (instrumento.limiteSuperior) {
        mensagem += `   • Limite superior: ${instrumento.limiteSuperior}${unidade}\n`;
      }
    }

    if (instrumento.nivelAlerta || instrumento.nivelCritico) {
      mensagem += `\n🎯 Níveis de referência:\n`;
      if (instrumento.nivelNormal) {
        mensagem += `   • Normal: ${instrumento.nivelNormal}${unidade}\n`;
      }
      if (instrumento.nivelAlerta) {
        mensagem += `   • Alerta: ${instrumento.nivelAlerta}${unidade}\n`;
      }
      if (instrumento.nivelCritico) {
        mensagem += `   • Crítico: ${instrumento.nivelCritico}${unidade}\n`;
      }
    }

    // Adicionar recomendações baseadas na severidade
    mensagem += `\n💡 Recomendações:\n`;
    if (severidadeAlerta === "critico") {
      mensagem += `   • AÇÃO IMEDIATA NECESSÁRIA\n`;
      mensagem += `   • Verificar instrumento in loco\n`;
      mensagem += `   • Notificar equipe técnica\n`;
      mensagem += `   • Avaliar necessidade de intervenção urgente`;
    } else if (severidadeAlerta === "alerta") {
      mensagem += `   • Monitorar com atenção\n`;
      mensagem += `   • Verificar tendência das leituras\n`;
      mensagem += `   • Preparar plano de ação se necessário`;
    } else if (severidadeAlerta === "aviso") {
      mensagem += `   • Acompanhar evolução\n`;
      mensagem += `   • Verificar se há tendência de aumento/diminuição`;
    }

    // Determinar tipo de alerta baseado no tipo de instrumento
    let tipoAlerta = "Leitura fora dos limites";
    if (instrumento.tipo) {
      const tipoLower = instrumento.tipo.toLowerCase();
      if (tipoLower.includes("nível") || tipoLower.includes("nivel")) {
        tipoAlerta = "Nível d'água fora dos limites";
      } else if (tipoLower.includes("vazão") || tipoLower.includes("vazao")) {
        tipoAlerta = "Vazão fora dos limites";
      } else if (tipoLower.includes("pressão") || tipoLower.includes("pressao") || tipoLower.includes("piezômetro") || tipoLower.includes("piezometro")) {
        tipoAlerta = "Pressão (poropressão) fora dos limites";
      } else if (tipoLower.includes("pluviômetro") || tipoLower.includes("pluviometro")) {
        tipoAlerta = "Precipitação fora dos limites";
      } else if (tipoLower.includes("deslocamento") || tipoLower.includes("inclinômetro") || tipoLower.includes("inclinometro")) {
        tipoAlerta = "Deslocamento fora dos limites";
      }
    }

    console.log('[ALERTA DEBUG] Dados do alerta a ser criado:', {
      barragemId: instrumento.barragemId,
      tipo: tipoAlerta,
      severidade: severidadeAlerta,
      titulo: `[${severidadeAlerta.toUpperCase()}] ${instrumento.codigo} - ${tipoInconsistencia}`,
      mensagemLength: mensagem.length,
      instrumentoId: data.instrumentoId,
      leituraId: insertedId,
    });

    try {
      console.log('[ALERTA DEBUG] Chamando createAlerta()...');
      const alertaId = await createAlerta({
        barragemId: instrumento.barragemId,
        tipo: tipoAlerta,
        severidade: severidadeAlerta,
        titulo: `[${severidadeAlerta.toUpperCase()}] ${instrumento.codigo} - ${tipoInconsistencia}`,
        mensagem: mensagem,
        instrumentoId: data.instrumentoId,
        leituraId: insertedId,
      });
      console.log('[ALERTA DEBUG] ============================================');
      console.log('[ALERTA DEBUG] ✅✅✅ ALERTA CRIADO COM SUCESSO! ✅✅✅');
      console.log('[ALERTA DEBUG] ID do Alerta:', alertaId);
      console.log('[ALERTA DEBUG] ============================================');
    } catch (error) {
      console.log('[ALERTA DEBUG] ============================================');
      console.error('[ALERTA ERROR] ❌❌❌ ERRO AO CRIAR ALERTA ❌❌❌');
      console.error('[ALERTA ERROR] Erro:', error);
      if (error instanceof Error) {
        console.error('[ALERTA ERROR] Mensagem:', error.message);
        console.error('[ALERTA ERROR] Stack:', error.stack);
      }
      console.log('[ALERTA DEBUG] ============================================');
    }
  } else {
    console.log('[ALERTA DEBUG] ============================================');
    console.log('[ALERTA DEBUG] ⚠️⚠️⚠️ ALERTA NÃO FOI CRIADO ⚠️⚠️⚠️');
    console.log('[ALERTA DEBUG] ============================================');
    console.log('[ALERTA DEBUG] Razões:', {
      temInconsistencia: !!data.inconsistencia,
      temInstrumento: !!instrumento,
      temInsertedId: insertedId > 0,
      temTipoInconsistencia: !!tipoInconsistencia,
    });
    console.log('[ALERTA DEBUG] Valores detalhados:', {
      inconsistencia: data.inconsistencia,
      instrumentoId: instrumento?.id,
      instrumentoCodigo: instrumento?.codigo,
      insertedId: insertedId,
      tipoInconsistencia: tipoInconsistencia,
    });
    console.log('[ALERTA DEBUG] ============================================');
  }

  console.log('[ALERTA DEBUG] Fim da criação de leitura. ID retornado:', insertedId);
  console.log('[ALERTA DEBUG] ============================================');
  return insertedId;
}

export async function getLeiturasByInstrumento(instrumentoId: number, limit = 50) {
  const result = await runQuery<InsertLeitura & { id: number }>(
    `SELECT TOP (@limit) *
     FROM dbo.leituras
     WHERE instrumentoId = @instrumentoId
     ORDER BY dataHora DESC`,
    (request) => {
      request.input("limit", sqlServer.Int, limit);
      request.input("instrumentoId", sqlServer.Int, instrumentoId);
    }
  );

  return result.recordset;
}

export async function getUltimaLeitura(instrumentoId: number) {
  const result = await runQuery<InsertLeitura & { id: number }>(
    `SELECT TOP 1 *
     FROM dbo.leituras
     WHERE instrumentoId = @instrumentoId
     ORDER BY dataHora DESC`,
    (request) => {
      request.input("instrumentoId", sqlServer.Int, instrumentoId);
    }
  );

  return result.recordset[0];
}

export async function deleteLeitura(id: number) {
  await runQuery(
    `DELETE FROM dbo.leituras WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
  return { success: true };
}

export async function getLeiturasComInconsistencia(barragemId?: number, limit?: number) {
  try {
    const topClause = limit !== undefined ? `TOP (@limit)` : "";
    const whereClause =
      barragemId !== undefined
        ? "WHERE l.inconsistencia = 1 AND i.barragemId = @barragemId"
        : "WHERE l.inconsistencia = 1";

    const result = await runQuery<InsertLeitura & InsertInstrumento & { id: number; leituraId: number; instrumentoId: number }>(
      `SELECT ${topClause}
        l.id AS leituraId,
        l.instrumentoId,
        l.usuarioId,
        l.dataHora,
        l.valor,
        l.nivelMontante,
        l.inconsistencia,
        l.tipoInconsistencia,
        l.observacoes,
        l.origem,
        l.latitude AS leituraLatitude,
        l.longitude AS leituraLongitude,
        i.id AS instrumentoId,
        i.barragemId,
        i.estruturaId,
        i.codigo,
        i.tipo,
        i.localizacao,
        i.estaca,
        i.cota,
        i.coordenadas,
        i.dataInstalacao,
        i.fabricante,
        i.modelo,
        i.numeroSerie,
        i.nivelNormal,
        i.nivelAlerta,
        i.nivelCritico,
        i.formula,
        i.unidadeMedida,
        i.limiteInferior,
        i.limiteSuperior,
        i.frequenciaLeitura,
        i.responsavel,
        i.qrCode,
        i.codigoBarras,
        i.status,
        i.observacoes AS instrumentoObservacoes,
        i.ativo,
        i.createdAt AS instrumentoCreatedAt,
        i.updatedAt AS instrumentoUpdatedAt
       FROM dbo.leituras AS l
       INNER JOIN dbo.instrumentos AS i ON l.instrumentoId = i.id
       ${whereClause}
       ORDER BY l.dataHora DESC`,
      (request) => {
        if (limit !== undefined) {
          request.input("limit", sqlServer.Int, limit);
        }
        if (barragemId !== undefined) {
          request.input("barragemId", sqlServer.Int, barragemId);
        }
      }
    );

    return result.recordset.map((row) => ({
      leitura: {
        id: row.leituraId,
        instrumentoId: row.instrumentoId,
        usuarioId: row.usuarioId,
        dataHora: row.dataHora,
        valor: row.valor,
        nivelMontante: row.nivelMontante,
        inconsistencia: row.inconsistencia,
        tipoInconsistencia: row.tipoInconsistencia,
        observacoes: row.observacoes,
        origem: row.origem,
        latitude: row.leituraLatitude,
        longitude: row.leituraLongitude,
      } as InsertLeitura & { id: number },
      instrumento: {
        id: row.instrumentoId,
        barragemId: row.barragemId,
        estruturaId: row.estruturaId,
        codigo: row.codigo,
        tipo: row.tipo,
        localizacao: row.localizacao,
        estaca: row.estaca,
        cota: row.cota,
        coordenadas: row.coordenadas,
        dataInstalacao: row.dataInstalacao,
        fabricante: row.fabricante,
        modelo: row.modelo,
        numeroSerie: row.numeroSerie,
        nivelNormal: row.nivelNormal,
        nivelAlerta: row.nivelAlerta,
        nivelCritico: row.nivelCritico,
        formula: row.formula,
        unidadeMedida: row.unidadeMedida,
        limiteInferior: row.limiteInferior,
        limiteSuperior: row.limiteSuperior,
        frequenciaLeitura: row.frequenciaLeitura,
        responsavel: row.responsavel,
        qrCode: row.qrCode,
        codigoBarras: row.codigoBarras,
        status: row.status,
        observacoes: row.instrumentoObservacoes,
        ativo: row.ativo,
        createdAt: row.instrumentoCreatedAt,
        updatedAt: row.instrumentoUpdatedAt,
      } as InsertInstrumento & { id: number },
    }));
  } catch (error) {
    console.error("[getLeiturasComInconsistencia] Erro ao buscar leituras:", error);
    throw error;
  }
}

export async function getLeiturasByBarragem(barragemId: number, limit = 100) {
  const result = await runQuery<{ leitura: string | null; instrumento: string | null }>(
    `SELECT TOP (@limit)
      (SELECT l.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS leitura,
      (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS instrumento
     FROM dbo.leituras AS l
     INNER JOIN dbo.instrumentos AS i ON l.instrumentoId = i.id
     WHERE i.barragemId = @barragemId
     ORDER BY l.dataHora DESC`,
    (request) => {
      request.input("limit", sqlServer.Int, limit);
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset.map(
    (row: { leitura: string | null; instrumento: string | null }) => ({
      leitura:
        parseJsonColumn<InsertLeitura & { id: number }>(row.leitura) ??
        ({} as InsertLeitura & { id: number }),
      instrumento:
        parseJsonColumn<InsertInstrumento & { id: number }>(row.instrumento) ??
        ({} as InsertInstrumento & { id: number }),
    })
  );
}

export async function getLeiturasCountByBarragem(barragemId: number) {
  const result = await runQuery<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM dbo.leituras AS l
     INNER JOIN dbo.instrumentos AS i ON l.instrumentoId = i.id
     WHERE i.barragemId = @barragemId`,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset[0]?.count ?? 0;
}

// ============================================================================
// CHECKLISTS
// ============================================================================

export async function createChecklist(data: InsertChecklist) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.checklists (
      barragemId,
      usuarioId,
      data,
      tipo,
      inspetor,
      climaCondicoes,
      status,
      consultorId,
      dataAvaliacao,
      comentariosConsultor,
      observacoesGerais,
      latitude,
      longitude
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @usuarioId,
      @data,
      COALESCE(@tipo, 'mensal'),
      @inspetor,
      @climaCondicoes,
      COALESCE(@status, 'em_andamento'),
      @consultorId,
      @dataAvaliacao,
      @comentariosConsultor,
      @observacoesGerais,
      @latitude,
      @longitude
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("usuarioId", sqlServer.NVarChar(64), data.usuarioId);
      request.input("data", sqlServer.DateTime2, toDate(data.data));
      request.input("tipo", sqlServer.NVarChar(32), data.tipo ?? null);
      request.input("inspetor", sqlServer.NVarChar(255), data.inspetor ?? null);
      request.input("climaCondicoes", sqlServer.NVarChar(255), data.climaCondicoes ?? null);
      request.input("status", sqlServer.NVarChar(32), data.status ?? null);
      request.input("consultorId", sqlServer.NVarChar(64), data.consultorId ?? null);
      request.input("dataAvaliacao", sqlServer.DateTime2, toDate(data.dataAvaliacao));
      request.input("comentariosConsultor", sqlServer.NVarChar(sqlServer.MAX), data.comentariosConsultor ?? null);
      request.input("observacoesGerais", sqlServer.NVarChar(sqlServer.MAX), data.observacoesGerais ?? null);
      request.input("latitude", sqlServer.NVarChar(50), data.latitude ?? null);
      request.input("longitude", sqlServer.NVarChar(50), data.longitude ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getChecklistsByBarragem(barragemId: number, limit = 20) {
  const result = await runQuery<InsertChecklist & { id: number }>(
    `SELECT TOP (@limit) *
     FROM dbo.checklists
     WHERE barragemId = @barragemId
     ORDER BY data DESC`,
    (request) => {
      request.input("limit", sqlServer.Int, limit);
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset;
}

export async function getChecklistById(id: number) {
  const result = await runQuery<InsertChecklist & { id: number }>(
    `SELECT TOP 1 * FROM dbo.checklists WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );

  return result.recordset[0];
}

export async function updateChecklist(id: number, data: Partial<InsertChecklist>) {
  const { updates, apply } = buildUpdateFragments(data as Record<string, unknown>, {
    tipo: { type: sqlServer.NVarChar(32) },
    inspetor: { type: sqlServer.NVarChar(255) },
    climaCondicoes: { type: sqlServer.NVarChar(255) },
    status: { type: sqlServer.NVarChar(32) },
    consultorId: { type: sqlServer.NVarChar(64) },
    dataAvaliacao: { type: sqlServer.DateTime2, transform: toDate },
    comentariosConsultor: { type: sqlServer.NVarChar(sqlServer.MAX) },
    observacoesGerais: { type: sqlServer.NVarChar(sqlServer.MAX) },
    latitude: { type: sqlServer.NVarChar(50) },
    longitude: { type: sqlServer.NVarChar(50) },
  });

  if (updates.length === 0) return;

  updates.push("updatedAt = SYSDATETIME()");

  await runQuery(
    `UPDATE dbo.checklists SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      apply(request);
    }
  );
}

export async function deleteChecklist(id: number) {
  await runQuery(
    "DELETE FROM dbo.checklists WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// PERGUNTAS E RESPOSTAS DO CHECKLIST
// ============================================================================

export async function createPerguntaChecklist(data: InsertPerguntaChecklist) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.perguntasChecklist (
      barragemId,
      categoria,
      pergunta,
      ordem,
      ativo
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @categoria,
      @pergunta,
      @ordem,
      COALESCE(@ativo, 1)
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId ?? null);
      request.input("categoria", sqlServer.NVarChar(100), data.categoria);
      request.input("pergunta", sqlServer.NVarChar(sqlServer.MAX), data.pergunta);
      request.input("ordem", sqlServer.Int, data.ordem);
      request.input("ativo", sqlServer.Bit, data.ativo ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getPerguntasChecklist(barragemId?: number) {
  const query = barragemId !== undefined
    ? `SELECT * FROM dbo.perguntasChecklist
       WHERE barragemId = @barragemId AND ativo = 1
       ORDER BY categoria, ordem`
    : `SELECT * FROM dbo.perguntasChecklist
       WHERE ativo = 1
       ORDER BY categoria, ordem`;

  const result = await runQuery<InsertPerguntaChecklist & { id: number }>(
    query,
    (request) => {
      if (barragemId !== undefined) {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    }
  );

  return result.recordset;
}

export async function createRespostaChecklist(data: InsertRespostaChecklist) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.respostasChecklist (
      checklistId,
      perguntaId,
      resposta,
      situacaoAnterior,
      comentario,
      fotos
    ) OUTPUT INSERTED.id VALUES (
      @checklistId,
      @perguntaId,
      @resposta,
      @situacaoAnterior,
      @comentario,
      @fotos
    );`,
    (request) => {
      request.input("checklistId", sqlServer.Int, data.checklistId);
      request.input("perguntaId", sqlServer.Int, data.perguntaId);
      request.input("resposta", sqlServer.NVarChar(4), data.resposta);
      request.input("situacaoAnterior", sqlServer.NVarChar(4), data.situacaoAnterior ?? null);
      request.input("comentario", sqlServer.NVarChar(sqlServer.MAX), data.comentario ?? null);
      request.input("fotos", sqlServer.NVarChar(sqlServer.MAX), data.fotos ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getRespostasByChecklist(checklistId: number) {
  try {
    const result = await runQuery<InsertRespostaChecklist & InsertPerguntaChecklist & { id: number; respostaId: number; perguntaId: number }>(
      `SELECT
        r.id AS respostaId,
        r.checklistId,
        r.perguntaId,
        r.resposta,
        r.situacaoAnterior,
        r.comentario,
        r.fotos,
        r.createdAt AS respostaCreatedAt,
        p.id AS perguntaId,
        p.barragemId,
        p.categoria,
        p.pergunta,
        p.ordem,
        p.ativo,
        p.createdAt AS perguntaCreatedAt
       FROM dbo.respostasChecklist AS r
       INNER JOIN dbo.perguntasChecklist AS p ON r.perguntaId = p.id
       WHERE r.checklistId = @checklistId
       ORDER BY p.categoria, p.ordem`,
      (request) => {
        request.input("checklistId", sqlServer.Int, checklistId);
      }
    );

    return result.recordset.map((row) => ({
      resposta: {
        id: row.respostaId,
        checklistId: row.checklistId,
        perguntaId: row.perguntaId,
        resposta: row.resposta,
        situacaoAnterior: row.situacaoAnterior,
        comentario: row.comentario,
        fotos: row.fotos,
        createdAt: row.respostaCreatedAt,
      } as InsertRespostaChecklist & { id: number },
      pergunta: {
        id: row.perguntaId,
        barragemId: row.barragemId,
        categoria: row.categoria,
        pergunta: row.pergunta,
        ordem: row.ordem,
        ativo: row.ativo,
        createdAt: row.perguntaCreatedAt,
      } as InsertPerguntaChecklist & { id: number },
    }));
  } catch (error) {
    console.error("[getRespostasByChecklist] Erro ao buscar respostas:", error);
    throw error;
  }
}

// ============================================================================
// CARACTERIZAÇÃO DA BARRAGEM PARA CÁLCULOS HIDROLÓGICOS
// ============================================================================

export async function createCaracterizacaoBarragem(data: InsertCaracterizacaoBarragem) {
  // Usar alturaMacicoPrincipal (sem ç) para evitar problemas de encoding com ODBC
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.caracterizacaoBarragem (
      checklistId, barragemId,
      areaBaciaHidrografica, perimetro, comprimentoRioPrincipal,
      comprimentoVetorialRioPrincipal, comprimentoTotalRioBacia,
      altitudeMinimaBacia, altitudeMaximaBacia,
      altitudeAltimetricaBaciaM, altitudeAltimetricaBaciaKM,
      comprimentoAxialBacia,
      comprimentoRioPrincipal_L, declividadeBacia_S, areaDrenagem_A,
      larguraBarragem, alturaMacicoPrincipal, volumeReservatorio,
      cargaHidraulicaMaxima, profundidadeMediaReservatorio, areaReservatorio,
      metodoMedicao, equipamentoUtilizado, responsavelMedicao, observacoes
    ) OUTPUT INSERTED.id VALUES (
      @checklistId, @barragemId,
      @areaBaciaHidrografica, @perimetro, @comprimentoRioPrincipal,
      @comprimentoVetorialRioPrincipal, @comprimentoTotalRioBacia,
      @altitudeMinimaBacia, @altitudeMaximaBacia,
      @altitudeAltimetricaBaciaM, @altitudeAltimetricaBaciaKM,
      @comprimentoAxialBacia,
      @comprimentoRioPrincipal_L, @declividadeBacia_S, @areaDrenagem_A,
      @larguraBarragem, @alturaMacicoPrincipal, @volumeReservatorio,
      @cargaHidraulicaMaxima, @profundidadeMediaReservatorio, @areaReservatorio,
      @metodoMedicao, @equipamentoUtilizado, @responsavelMedicao, @observacoes
    );`,
    (request) => {
      request.input("checklistId", sqlServer.Int, data.checklistId);
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("areaBaciaHidrografica", sqlServer.Decimal(15, 4), data.areaBaciaHidrografica ?? null);
      request.input("perimetro", sqlServer.Decimal(15, 4), data.perimetro ?? null);
      request.input("comprimentoRioPrincipal", sqlServer.Decimal(15, 4), data.comprimentoRioPrincipal ?? null);
      request.input("comprimentoVetorialRioPrincipal", sqlServer.Decimal(15, 4), data.comprimentoVetorialRioPrincipal ?? null);
      request.input("comprimentoTotalRioBacia", sqlServer.Decimal(15, 4), data.comprimentoTotalRioBacia ?? null);
      request.input("altitudeMinimaBacia", sqlServer.Decimal(15, 4), data.altitudeMinimaBacia ?? null);
      request.input("altitudeMaximaBacia", sqlServer.Decimal(15, 4), data.altitudeMaximaBacia ?? null);
      request.input("altitudeAltimetricaBaciaM", sqlServer.Decimal(15, 4), data.altitudeAltimetricaBaciaM ?? null);
      request.input("altitudeAltimetricaBaciaKM", sqlServer.Decimal(15, 4), data.altitudeAltimetricaBaciaKM ?? null);
      request.input("comprimentoAxialBacia", sqlServer.Decimal(15, 4), data.comprimentoAxialBacia ?? null);
      request.input("comprimentoRioPrincipal_L", sqlServer.Decimal(15, 4), data.comprimentoRioPrincipal_L ?? null);
      request.input("declividadeBacia_S", sqlServer.Decimal(15, 4), data.declividadeBacia_S ?? null);
      request.input("areaDrenagem_A", sqlServer.Decimal(15, 4), data.areaDrenagem_A ?? null);
      request.input("larguraBarragem", sqlServer.Decimal(15, 4), data.larguraBarragem ?? null);
      // Mapear alturaMaciçoPrincipal (do código) para alturaMacicoPrincipal (no banco)
      request.input("alturaMacicoPrincipal", sqlServer.Decimal(15, 4), data.alturaMaciçoPrincipal ?? null);
      request.input("volumeReservatorio", sqlServer.Decimal(15, 4), data.volumeReservatorio ?? null);
      request.input("cargaHidraulicaMaxima", sqlServer.Decimal(15, 4), data.cargaHidraulicaMaxima ?? null);
      request.input("profundidadeMediaReservatorio", sqlServer.Decimal(15, 4), data.profundidadeMediaReservatorio ?? null);
      request.input("areaReservatorio", sqlServer.Decimal(15, 4), data.areaReservatorio ?? null);
      request.input("metodoMedicao", sqlServer.NVarChar(100), data.metodoMedicao ?? null);
      request.input("equipamentoUtilizado", sqlServer.NVarChar(255), data.equipamentoUtilizado ?? null);
      request.input("responsavelMedicao", sqlServer.NVarChar(255), data.responsavelMedicao ?? null);
      request.input("observacoes", sqlServer.NVarChar(sqlServer.MAX), data.observacoes ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

// Função auxiliar para converter valores DECIMAL do SQL Server para número
function convertDecimalFields(data: any): any {
  if (!data) return data;
  
  const decimalFields = [
    'areaBaciaHidrografica', 'perimetro', 'comprimentoRioPrincipal',
    'comprimentoVetorialRioPrincipal', 'comprimentoTotalRioBacia',
    'altitudeMinimaBacia', 'altitudeMaximaBacia',
    'altitudeAltimetricaBaciaM', 'altitudeAltimetricaBaciaKM',
    'comprimentoAxialBacia', 'comprimentoRioPrincipal_L',
    'declividadeBacia_S', 'areaDrenagem_A',
    'larguraBarragem', 'alturaMacicoPrincipal', // Nome no banco (sem ç)
    'alturaMaciçoPrincipal', // Nome no código (com ç) - mapear para alturaMacicoPrincipal
    'volumeReservatorio', 'cargaHidraulicaMaxima',
    'profundidadeMediaReservatorio', 'areaReservatorio'
  ];

  const converted = { ...data };
  
  // Mapear alturaMacicoPrincipal (do banco) para alturaMaciçoPrincipal (no código)
  if (converted.alturaMacicoPrincipal !== null && converted.alturaMacicoPrincipal !== undefined) {
    converted.alturaMaciçoPrincipal = converted.alturaMacicoPrincipal;
  }
  
  decimalFields.forEach(field => {
    if (converted[field] !== null && converted[field] !== undefined) {
      // SQL Server DECIMAL pode vir como string ou objeto
      if (typeof converted[field] === 'string') {
        converted[field] = parseFloat(converted[field]) || 0;
      } else if (typeof converted[field] === 'object' && converted[field] !== null) {
        // Pode ser um objeto Decimal do SQL Server
        converted[field] = parseFloat(String(converted[field])) || 0;
      } else if (typeof converted[field] === 'number') {
        // Já é número, manter
        converted[field] = converted[field];
      }
    } else {
      converted[field] = 0;
    }
  });

  return converted;
}

export async function getCaracterizacaoByChecklist(checklistId: number) {
  try {
    const result = await runQuery<InsertCaracterizacaoBarragem & { id: number }>(
      `SELECT * FROM dbo.caracterizacaoBarragem WHERE checklistId = @checklistId`,
      (request) => {
        request.input("checklistId", sqlServer.Int, checklistId);
      }
    );

    const data = result.recordset[0];
    if (!data) return null;

    return convertDecimalFields(data);
  } catch (error: any) {
    console.error(`[getCaracterizacaoByChecklist] Erro ao buscar caracterização para checklist ${checklistId}:`, error);
    throw error;
  }
}

export async function getCaracterizacaoByBarragem(barragemId: number, apenasValidado: boolean = false) {
  try {
    // Primeiro tenta buscar validada, se não encontrar, busca a mais recente
    let result = await runQuery<InsertCaracterizacaoBarragem & { id: number }>(
      `SELECT TOP 1 * FROM dbo.caracterizacaoBarragem 
       WHERE barragemId = @barragemId ${apenasValidado ? 'AND validado = 1' : ''}
       ORDER BY validado DESC, createdAt DESC`,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    );

    // Se não encontrou e não está filtrando por validado, retorna null
    if (result.recordset[0]) {
      return convertDecimalFields(result.recordset[0]);
    }

    // Se estava filtrando por validado e não encontrou, tenta buscar qualquer uma
    if (apenasValidado) {
      result = await runQuery<InsertCaracterizacaoBarragem & { id: number }>(
        `SELECT TOP 1 * FROM dbo.caracterizacaoBarragem 
         WHERE barragemId = @barragemId
         ORDER BY createdAt DESC`,
        (request) => {
          request.input("barragemId", sqlServer.Int, barragemId);
        }
      );
    }

    const data = result.recordset[0];
    return data ? convertDecimalFields(data) : null;
  } catch (error: any) {
    console.error(`[getCaracterizacaoByBarragem] Erro ao buscar caracterização para barragem ${barragemId}:`, error);
    throw error;
  }
}

export async function getCaracterizacaoById(id: number) {
  try {
    const result = await runQuery<InsertCaracterizacaoBarragem & { id: number }>(
      `SELECT * FROM dbo.caracterizacaoBarragem WHERE id = @id`,
      (request) => {
        request.input("id", sqlServer.Int, id);
      }
    );

    const data = result.recordset[0];
    return data ? convertDecimalFields(data) : null;
  } catch (error: any) {
    console.error(`[getCaracterizacaoById] Erro ao buscar caracterização ID ${id}:`, error);
    throw error;
  }
}

// ============================================================================
// MAPEAMENTO INSTRUMENTO -> PARÂMETRO DE CÁLCULO
// ============================================================================

export interface MapeamentoInstrumentoParametro {
  id: number;
  instrumentoCodigo: string;
  barragemId: number;
  parametroCalculo: string;
  tipoCalculo: string;
  fatorConversao: number;
  unidadeEsperada: string | null;
  campoCaracterizacao: string;
  ativo: boolean;
}

export async function getMapeamentosPorInstrumento(instrumentoCodigo: string): Promise<MapeamentoInstrumentoParametro[]> {
  const result = await runQuery<MapeamentoInstrumentoParametro>(
    `SELECT * FROM dbo.mapeamentoInstrumentoParametro 
     WHERE instrumentoCodigo = @instrumentoCodigo AND ativo = 1`,
    (request) => {
      request.input("instrumentoCodigo", sqlServer.NVarChar(50), instrumentoCodigo);
    }
  );

  return result.recordset || [];
}

export async function getMapeamentosPorBarragem(barragemId: number): Promise<MapeamentoInstrumentoParametro[]> {
  const result = await runQuery<MapeamentoInstrumentoParametro>(
    `SELECT * FROM dbo.mapeamentoInstrumentoParametro 
     WHERE barragemId = @barragemId AND ativo = 1`,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset || [];
}

/**
 * Atualiza a caracterização da barragem com base em uma leitura de instrumento mapeado
 */
export async function atualizarCaracterizacaoPorLeitura(
  instrumentoCodigo: string,
  valorLeitura: string,
  barragemId: number
): Promise<boolean> {
  try {
    // Buscar mapeamentos para este instrumento
    const mapeamentos = await getMapeamentosPorInstrumento(instrumentoCodigo);
    
    if (mapeamentos.length === 0) {
      console.log(`[Integração] Nenhum mapeamento encontrado para instrumento: ${instrumentoCodigo}`);
      return false;
    }

    // Buscar caracterização mais recente da barragem
    let caracterizacao = await getCaracterizacaoByBarragem(barragemId);
    
    // Se não existe, buscar a última (mesmo que não validada) ou criar uma nova
    if (!caracterizacao) {
      const result = await runQuery<InsertCaracterizacaoBarragem & { id: number }>(
        `SELECT TOP 1 * FROM dbo.caracterizacaoBarragem 
         WHERE barragemId = @barragemId
         ORDER BY createdAt DESC`,
        (request) => {
          request.input("barragemId", sqlServer.Int, barragemId);
        }
      );
      caracterizacao = result.recordset[0] || null;
    }

    // Se ainda não existe, precisamos de um checklist para criar
    if (!caracterizacao) {
      // Buscar último checklist da barragem
      const checklistResult = await runQuery<{ id: number }>(
        `SELECT TOP 1 id FROM dbo.checklists 
         WHERE barragemId = @barragemId 
         ORDER BY createdAt DESC`,
        (request) => {
          request.input("barragemId", sqlServer.Int, barragemId);
        }
      );
      
      const checklistId = checklistResult.recordset[0]?.id;
      if (!checklistId) {
        console.log(`[Integração] Nenhum checklist encontrado para criar caracterização. BarragemId: ${barragemId}`);
        return false;
      }

      // Criar nova caracterização
      const newId = await createCaracterizacaoBarragem({
        checklistId,
        barragemId,
      } as any);
      
      caracterizacao = await getCaracterizacaoById(newId);
      
      if (!caracterizacao) {
        console.log(`[Integração] Erro ao criar caracterização. BarragemId: ${barragemId}`);
        return false;
      }
    }

    // Converter valor da leitura para número
    const valorNumerico = parseFloat(valorLeitura);
    if (isNaN(valorNumerico)) {
      console.log(`[Integração] Valor da leitura não é numérico: ${valorLeitura}`);
      return false;
    }

    // Atualizar cada parâmetro mapeado
    const updates: Record<string, number> = {};
    
    for (const mapeamento of mapeamentos) {
      // Aplicar fator de conversão
      const valorConvertido = valorNumerico * mapeamento.fatorConversao;
      
      // Mapear campo de caracterização
      const campo = mapeamento.campoCaracterizacao as keyof InsertCaracterizacaoBarragem;
      updates[campo] = valorConvertido;
      
      console.log(`[Integração] Atualizando ${campo} = ${valorConvertido} (origem: ${instrumentoCodigo})`);
    }

    // Atualizar caracterização
    if (Object.keys(updates).length > 0) {
      await updateCaracterizacaoBarragem(caracterizacao.id, updates as any);
      console.log(`[Integração] Caracterização atualizada. ID: ${caracterizacao.id}, BarragemId: ${barragemId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`[Integração] Erro ao atualizar caracterização por leitura:`, error);
    return false;
  }
}

export async function updateCaracterizacaoBarragem(id: number, data: Partial<InsertCaracterizacaoBarragem>) {
  const fields: string[] = [];
  const values: any = { id };

  // Mapeamento de campos para garantir nomes corretos no banco
  // IMPORTANTE: alturaMaciçoPrincipal pode ter problemas de encoding, usar alturaMacicoPrincipal
  const fieldMapping: Record<string, string> = {
    // Campos numéricos decimais
    areaBaciaHidrografica: "areaBaciaHidrografica",
    perimetro: "perimetro",
    comprimentoRioPrincipal: "comprimentoRioPrincipal",
    comprimentoVetorialRioPrincipal: "comprimentoVetorialRioPrincipal",
    comprimentoTotalRioBacia: "comprimentoTotalRioBacia",
    altitudeMinimaBacia: "altitudeMinimaBacia",
    altitudeMaximaBacia: "altitudeMaximaBacia",
    altitudeAltimetricaBaciaM: "altitudeAltimetricaBaciaM",
    altitudeAltimetricaBaciaKM: "altitudeAltimetricaBaciaKM",
    comprimentoAxialBacia: "comprimentoAxialBacia",
    comprimentoRioPrincipal_L: "comprimentoRioPrincipal_L",
    declividadeBacia_S: "declividadeBacia_S",
    areaDrenagem_A: "areaDrenagem_A",
    larguraBarragem: "larguraBarragem",
    // Mapear alturaMaciçoPrincipal para alturaMacicoPrincipal (sem ç) para evitar problemas de encoding
    alturaMaciçoPrincipal: "alturaMacicoPrincipal",
    volumeReservatorio: "volumeReservatorio",
    cargaHidraulicaMaxima: "cargaHidraulicaMaxima",
    profundidadeMediaReservatorio: "profundidadeMediaReservatorio",
    areaReservatorio: "areaReservatorio",
  };

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const dbField = fieldMapping[key] || key;
      fields.push(`${dbField} = @${dbField}`);
      values[dbField] = value;
    }
  });

  if (fields.length === 0) {
    console.warn("[updateCaracterizacaoBarragem] Nenhum campo para atualizar");
    return;
  }

  try {
    await runQuery(
      `UPDATE dbo.caracterizacaoBarragem SET ${fields.join(", ")}, updatedAt = SYSDATETIME() WHERE id = @id`,
      (request) => {
        request.input("id", sqlServer.Int, id);
        Object.entries(values).forEach(([key, value]) => {
          if (key !== "id") {
            // Verificar se é um campo numérico decimal
            const isDecimalField = fieldMapping[key] !== undefined || 
              key.includes("Bacia") || 
              key.includes("Rio") || 
              key.includes("Reservatorio") || 
              key.includes("Barragem") || 
              key.includes("Drenagem") || 
              key.includes("Declividade") || 
              key.includes("Carga") || 
              key.includes("Profundidade") || 
              key.includes("Area") || 
              key.includes("Perimetro") || 
              key.includes("Volume") || 
              key.includes("Largura") || 
              key.includes("Altura") || 
              key.includes("Comprimento");

            if (typeof value === "number" && isDecimalField) {
              request.input(key, sqlServer.Decimal(15, 4), value);
            } else if (typeof value === "string") {
              // Campos de texto têm tamanhos específicos
              if (key === "metodoMedicao") {
                request.input(key, sqlServer.NVarChar(100), value);
              } else if (key === "equipamentoUtilizado" || key === "responsavelMedicao") {
                request.input(key, sqlServer.NVarChar(255), value);
              } else if (key === "validadoPor") {
                request.input(key, sqlServer.NVarChar(64), value);
              } else {
                request.input(key, sqlServer.NVarChar(sqlServer.MAX), value);
              }
            } else if (typeof value === "boolean") {
              request.input(key, sqlServer.Bit, value);
            } else if (value instanceof Date) {
              request.input(key, sqlServer.DateTime2, value);
            } else {
              console.warn(`[updateCaracterizacaoBarragem] Tipo não mapeado para campo ${key}:`, typeof value);
            }
          }
        });
      }
    );
    console.log(`[updateCaracterizacaoBarragem] Caracterização atualizada com sucesso. ID: ${id}, Campos: ${fields.length}`);
  } catch (error: any) {
    console.error(`[updateCaracterizacaoBarragem] Erro ao atualizar caracterização ID ${id}:`, error);
    console.error(`[updateCaracterizacaoBarragem] Query: UPDATE dbo.caracterizacaoBarragem SET ${fields.join(", ")}, updatedAt = SYSDATETIME() WHERE id = @id`);
    console.error(`[updateCaracterizacaoBarragem] Valores:`, values);
    throw error;
  }
}

// ============================================================================
// OCORRÊNCIAS
// ============================================================================

export async function createOcorrencia(data: InsertOcorrencia) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.ocorrencias (
      barragemId,
      estruturaId,
      usuarioRegistroId,
      dataHoraRegistro,
      estrutura,
      relato,
      fotos,
      titulo,
      descricao,
      dataOcorrencia,
      localOcorrencia,
      acaoImediata,
      responsavel,
      categoria,
      severidade,
      tipo,
      status,
      usuarioAvaliacaoId,
      dataAvaliacao,
      comentariosAvaliacao,
      dataConclusao,
      comentariosConclusao,
      latitude,
      longitude
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @estruturaId,
      @usuarioRegistroId,
      @dataHoraRegistro,
      @estrutura,
      @relato,
      @fotos,
      @titulo,
      @descricao,
      @dataOcorrencia,
      @localOcorrencia,
      @acaoImediata,
      @responsavel,
      @categoria,
      @severidade,
      @tipo,
      COALESCE(@status, 'pendente'),
      @usuarioAvaliacaoId,
      @dataAvaliacao,
      @comentariosAvaliacao,
      @dataConclusao,
      @comentariosConclusao,
      @latitude,
      @longitude
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("estruturaId", sqlServer.Int, data.estruturaId ?? null);
      request.input("usuarioRegistroId", sqlServer.NVarChar(64), data.usuarioRegistroId);
      request.input("dataHoraRegistro", sqlServer.DateTime2, toDate(data.dataHoraRegistro));
      request.input("estrutura", sqlServer.NVarChar(255), data.estrutura);
      request.input("relato", sqlServer.NVarChar(sqlServer.MAX), data.relato);
      request.input("fotos", sqlServer.NVarChar(sqlServer.MAX), data.fotos ?? null);
      request.input("titulo", sqlServer.NVarChar(255), data.titulo ?? null);
      request.input("descricao", sqlServer.NVarChar(sqlServer.MAX), data.descricao ?? null);
      request.input("dataOcorrencia", sqlServer.DateTime2, toDate(data.dataOcorrencia));
      request.input("localOcorrencia", sqlServer.NVarChar(255), data.localOcorrencia ?? null);
      request.input("acaoImediata", sqlServer.NVarChar(sqlServer.MAX), data.acaoImediata ?? null);
      request.input("responsavel", sqlServer.NVarChar(255), data.responsavel ?? null);
      request.input("categoria", sqlServer.NVarChar(100), data.categoria ?? null);
      request.input("severidade", sqlServer.NVarChar(16), data.severidade ?? null);
      request.input("tipo", sqlServer.NVarChar(100), data.tipo ?? null);
      request.input("status", sqlServer.NVarChar(32), data.status ?? null);
      request.input("usuarioAvaliacaoId", sqlServer.NVarChar(64), data.usuarioAvaliacaoId ?? null);
      request.input("dataAvaliacao", sqlServer.DateTime2, toDate(data.dataAvaliacao));
      request.input("comentariosAvaliacao", sqlServer.NVarChar(sqlServer.MAX), data.comentariosAvaliacao ?? null);
      request.input("dataConclusao", sqlServer.DateTime2, toDate(data.dataConclusao));
      request.input("comentariosConclusao", sqlServer.NVarChar(sqlServer.MAX), data.comentariosConclusao ?? null);
      request.input("latitude", sqlServer.NVarChar(50), data.latitude ?? null);
      request.input("longitude", sqlServer.NVarChar(50), data.longitude ?? null);
    }
  );

  const insertedId = result.recordset[0]?.id ?? 0;

  if (insertedId && data.severidade && ["alta", "critica"].includes(data.severidade)) {
    await createAlerta({
      barragemId: data.barragemId,
      tipo: "Nova ocorrência",
      severidade: data.severidade === "critica" ? "critico" : "alerta",
      titulo: `Nova ocorrência registrada - ${data.estrutura}`,
      mensagem: data.relato.substring(0, 200),
      ocorrenciaId: insertedId,
    });
  }

  return insertedId;
}

export async function getOcorrenciasByBarragem(barragemId: number, status?: string) {
  const query = status
    ? `SELECT * FROM dbo.ocorrencias
       WHERE barragemId = @barragemId AND status = @status
       ORDER BY dataHoraRegistro DESC`
    : `SELECT * FROM dbo.ocorrencias
       WHERE barragemId = @barragemId
       ORDER BY dataHoraRegistro DESC`;

  const result = await runQuery<InsertOcorrencia & { id: number }>(
    query,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
      if (status) {
        request.input("status", sqlServer.NVarChar(32), status);
      }
    }
  );

  return result.recordset;
}

export async function getOcorrenciaById(id: number) {
  const result = await runQuery<InsertOcorrencia & { id: number }>(
    `SELECT TOP 1 * FROM dbo.ocorrencias WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );

  return result.recordset[0];
}

export async function updateOcorrencia(id: number, data: Partial<InsertOcorrencia>) {
  const { updates, apply } = buildUpdateFragments(data as Record<string, unknown>, {
    barragemId: { type: sqlServer.Int },
    estruturaId: { type: sqlServer.Int },
    estrutura: { type: sqlServer.NVarChar(255) },
    relato: { type: sqlServer.NVarChar(sqlServer.MAX) },
    fotos: { type: sqlServer.NVarChar(sqlServer.MAX) },
    titulo: { type: sqlServer.NVarChar(255) },
    descricao: { type: sqlServer.NVarChar(sqlServer.MAX) },
    dataOcorrencia: { type: sqlServer.DateTime2, transform: toDate },
    localOcorrencia: { type: sqlServer.NVarChar(255) },
    acaoImediata: { type: sqlServer.NVarChar(sqlServer.MAX) },
    responsavel: { type: sqlServer.NVarChar(255) },
    categoria: { type: sqlServer.NVarChar(100) },
    severidade: { type: sqlServer.NVarChar(16) },
    tipo: { type: sqlServer.NVarChar(100) },
    status: { type: sqlServer.NVarChar(32) },
    usuarioAvaliacaoId: { type: sqlServer.NVarChar(64) },
    dataAvaliacao: { type: sqlServer.DateTime2, transform: toDate },
    comentariosAvaliacao: { type: sqlServer.NVarChar(sqlServer.MAX) },
    dataConclusao: { type: sqlServer.DateTime2, transform: toDate },
    comentariosConclusao: { type: sqlServer.NVarChar(sqlServer.MAX) },
    latitude: { type: sqlServer.NVarChar(50) },
    longitude: { type: sqlServer.NVarChar(50) },
  });

  if (updates.length === 0) return;

  updates.push("updatedAt = SYSDATETIME()");

  await runQuery(
    `UPDATE dbo.ocorrencias SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      apply(request);
    }
  );
}

export async function deleteOcorrencia(id: number) {
  await runQuery(
    "DELETE FROM dbo.ocorrencias WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// HIDROMETRIA
// ============================================================================

export async function createHidrometria(data: InsertHidrometria) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.hidrometria (
      barragemId,
      usuarioId,
      dataLeitura,
      dataHora,
      nivelMontante,
      nivelJusante,
      nivelReservatorio,
      vazao,
      vazaoAfluente,
      vazaoDefluente,
      vazaoVertedouro,
      volumeReservatorio,
      volumeArmazenado,
      observacoes
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @usuarioId,
      @dataLeitura,
      @dataHora,
      @nivelMontante,
      @nivelJusante,
      @nivelReservatorio,
      @vazao,
      @vazaoAfluente,
      @vazaoDefluente,
      @vazaoVertedouro,
      @volumeReservatorio,
      @volumeArmazenado,
      @observacoes
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("usuarioId", sqlServer.NVarChar(64), data.usuarioId);
      request.input("dataLeitura", sqlServer.DateTime2, toDate(data.dataLeitura));
      request.input("dataHora", sqlServer.DateTime2, toDate(data.dataHora));
      request.input("nivelMontante", sqlServer.NVarChar(50), data.nivelMontante ?? null);
      request.input("nivelJusante", sqlServer.NVarChar(50), data.nivelJusante ?? null);
      request.input("nivelReservatorio", sqlServer.NVarChar(50), data.nivelReservatorio ?? null);
      request.input("vazao", sqlServer.NVarChar(50), data.vazao ?? null);
      request.input("vazaoAfluente", sqlServer.NVarChar(50), data.vazaoAfluente ?? null);
      request.input("vazaoDefluente", sqlServer.NVarChar(50), data.vazaoDefluente ?? null);
      request.input("vazaoVertedouro", sqlServer.NVarChar(50), data.vazaoVertedouro ?? null);
      request.input("volumeReservatorio", sqlServer.NVarChar(50), data.volumeReservatorio ?? null);
      request.input("volumeArmazenado", sqlServer.NVarChar(50), data.volumeArmazenado ?? null);
      request.input("observacoes", sqlServer.NVarChar(sqlServer.MAX), data.observacoes ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getHidrometriaByBarragem(barragemId: number, limit = 100) {
  const result = await runQuery<InsertHidrometria & { id: number }>(
    `SELECT TOP (@limit) *
     FROM dbo.hidrometria
     WHERE barragemId = @barragemId
     ORDER BY dataHora DESC`,
    (request) => {
      request.input("limit", sqlServer.Int, limit);
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset;
}

export async function getUltimaHidrometria(barragemId: number) {
  const result = await runQuery<InsertHidrometria & { id: number }>(
    `SELECT TOP 1 *
     FROM dbo.hidrometria
     WHERE barragemId = @barragemId
     ORDER BY dataHora DESC`,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
    }
  );

  return result.recordset[0];
}

export async function updateHidrometria(id: number, data: Partial<InsertHidrometria>) {
  const { updates, apply } = buildUpdateFragments(data as Record<string, unknown>, {
    barragemId: { type: sqlServer.Int },
    usuarioId: { type: sqlServer.NVarChar(64) },
    dataLeitura: { type: sqlServer.DateTime2, transform: toDate },
    dataHora: { type: sqlServer.DateTime2, transform: toDate },
    nivelMontante: { type: sqlServer.NVarChar(50) },
    nivelJusante: { type: sqlServer.NVarChar(50) },
    nivelReservatorio: { type: sqlServer.NVarChar(50) },
    vazao: { type: sqlServer.NVarChar(50) },
    vazaoAfluente: { type: sqlServer.NVarChar(50) },
    vazaoDefluente: { type: sqlServer.NVarChar(50) },
    vazaoVertedouro: { type: sqlServer.NVarChar(50) },
    volumeReservatorio: { type: sqlServer.NVarChar(50) },
    volumeArmazenado: { type: sqlServer.NVarChar(50) },
    observacoes: { type: sqlServer.NVarChar(sqlServer.MAX) },
  });

  if (updates.length === 0) return;

  await runQuery(
    `UPDATE dbo.hidrometria SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      apply(request);
    }
  );
}

export async function deleteHidrometria(id: number) {
  await runQuery(
    "DELETE FROM dbo.hidrometria WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// DOCUMENTOS
// ============================================================================

export async function createDocumento(data: InsertDocumento) {
  try {
    console.log('[DB] Creating documento:', { titulo: data.titulo, tipo: data.tipo, barragemId: data.barragemId });
    
    const result = await runQuery<{ id: number }>(
      `INSERT INTO dbo.documentos (
        barragemId,
        usuarioId,
        tipo,
        categoria,
        titulo,
        descricao,
        arquivoUrl,
        arquivoNome,
        arquivoTamanho,
        arquivoTipo,
        versao,
        documentoPaiId,
        dataValidade,
        tags
      ) OUTPUT INSERTED.id VALUES (
        @barragemId,
        @usuarioId,
        @tipo,
        @categoria,
        @titulo,
        @descricao,
        @arquivoUrl,
        @arquivoNome,
        @arquivoTamanho,
        @arquivoTipo,
        @versao,
        @documentoPaiId,
        @dataValidade,
        @tags
      );`,
      (request) => {
        request.input("barragemId", sqlServer.Int, data.barragemId);
        request.input("usuarioId", sqlServer.NVarChar(64), data.usuarioId);
        request.input("tipo", sqlServer.NVarChar(100), data.tipo);
        request.input("categoria", sqlServer.NVarChar(100), data.categoria ?? null);
        request.input("titulo", sqlServer.NVarChar(255), data.titulo);
        request.input("descricao", sqlServer.NVarChar(sqlServer.MAX), data.descricao ?? null);
        request.input("arquivoUrl", sqlServer.NVarChar(500), data.arquivoUrl);
        request.input("arquivoNome", sqlServer.NVarChar(255), data.arquivoNome);
        request.input("arquivoTamanho", sqlServer.Int, data.arquivoTamanho ?? null);
        request.input("arquivoTipo", sqlServer.NVarChar(100), data.arquivoTipo ?? null);
        request.input("versao", sqlServer.NVarChar(50), data.versao ?? null);
        request.input("documentoPaiId", sqlServer.Int, data.documentoPaiId ?? null);
        request.input("dataValidade", sqlServer.DateTime2, toDate(data.dataValidade));
        request.input("tags", sqlServer.NVarChar(500), data.tags ?? null);
      }
    );

    const id = result.recordset[0]?.id ?? 0;
    console.log('[DB] Documento created with id:', id);
    return id;
  } catch (error: any) {
    console.error('[DB] Error creating documento:', error);
    throw error;
  }
}

export async function getDocumentosByBarragem(barragemId: number, tipo?: string) {
  try {
    // Não retornar arquivoConteudo na listagem (apenas metadados) para melhor performance
    const query = tipo
      ? `SELECT 
          id, barragemId, usuarioId, tipo, categoria, titulo, descricao,
          arquivoUrl, arquivoNome, arquivoTamanho, arquivoTipo,
          versao, documentoPaiId, dataValidade, tags, createdAt, updatedAt
         FROM dbo.documentos
         WHERE barragemId = @barragemId AND tipo = @tipo
         ORDER BY createdAt DESC`
      : `SELECT 
          id, barragemId, usuarioId, tipo, categoria, titulo, descricao,
          arquivoUrl, arquivoNome, arquivoTamanho, arquivoTipo,
          versao, documentoPaiId, dataValidade, tags, createdAt, updatedAt
         FROM dbo.documentos
         WHERE barragemId = @barragemId
         ORDER BY createdAt DESC`;

    console.log(`[DB] Querying documentos for barragemId: ${barragemId}, tipo: ${tipo || 'all'}`);

    const result = await runQuery<InsertDocumento & { id: number }>(
      query,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
        if (tipo) {
          request.input("tipo", sqlServer.NVarChar(100), tipo);
        }
      }
    );

    const documentos = result.recordset || [];
    console.log(`[DB] Found ${documentos.length} documentos`);
    
    // Converter datas e limpar valores problemáticos para serialização correta
    const documentosSerializados = documentos.map((doc: any) => {
      const serialized: Record<string, any> = {};
      
      // Lista de campos esperados
      const fields = [
        'id', 'barragemId', 'usuarioId', 'tipo', 'categoria', 'titulo', 'descricao',
        'arquivoUrl', 'arquivoNome', 'arquivoTamanho', 'arquivoTipo', 'versao',
        'documentoPaiId', 'dataValidade', 'tags', 'createdAt', 'updatedAt'
      ];
      
      // Processar cada campo
      for (const key of fields) {
        const value = doc[key];
        
        // Converter datas primeiro
        if (key === 'createdAt' || key === 'updatedAt' || key === 'dataValidade') {
          if (value != null && value !== undefined) {
            try {
              // Tentar múltiplas formas de detectar Date
              let dateValue: Date | null = null;
              
              if (value instanceof Date) {
                dateValue = value;
              } else if (typeof value === 'string' && value.length > 0) {
                // Se já é string ISO, usar diretamente
                if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                  serialized[key] = value;
                  continue;
                }
                dateValue = new Date(value);
              } else if (typeof value === 'object' && value !== null) {
                // Objeto Date do SQL Server
                dateValue = new Date(value as any);
              } else {
                dateValue = new Date(value);
              }
              
              if (dateValue && !isNaN(dateValue.getTime())) {
                serialized[key] = dateValue.toISOString();
              } else {
                serialized[key] = null;
              }
            } catch (e) {
              console.warn(`[DB] Error converting date for ${key}:`, e, value);
              serialized[key] = null;
            }
          } else {
            serialized[key] = null;
          }
        }
        // Converter números
        else if (key === 'id' || key === 'barragemId' || key === 'arquivoTamanho' || key === 'documentoPaiId') {
          if (value != null && value !== undefined) {
            const num = Number(value);
            serialized[key] = isNaN(num) ? null : num;
          } else {
            serialized[key] = null;
          }
        }
        // Outros campos - usar função de serialização segura
        else {
          serialized[key] = serializeValue(value);
        }
      }
      
      return serialized;
    });
    
    // Testar serialização antes de retornar
    try {
      const test = JSON.stringify(documentosSerializados);
      console.log(`[DB] Serialization test passed, ${documentosSerializados.length} documentos, ${test.length} bytes`);
    } catch (e: any) {
      console.error('[DB] Serialization test failed:', e);
      if (documentosSerializados.length > 0) {
        console.error('[DB] Problematic documento keys:', Object.keys(documentosSerializados[0]));
        console.error('[DB] Problematic documento value types:', Object.entries(documentosSerializados[0]).map(([k, v]) => `${k}: ${typeof v}`));
      }
      // Retornar array vazio em caso de erro de serialização para não quebrar a aplicação
      return [];
    }
    
    // Log dos primeiros documentos para debug
    if (documentosSerializados.length > 0) {
      console.log('[DB] Sample documento:', {
        id: documentosSerializados[0].id,
        titulo: documentosSerializados[0].titulo,
        tipo: documentosSerializados[0].tipo,
        barragemId: documentosSerializados[0].barragemId,
        arquivoNome: documentosSerializados[0].arquivoNome,
        createdAt: documentosSerializados[0].createdAt
      });
    }
    
    return documentosSerializados;
  } catch (error: any) {
    console.error('[DB] Error getting documentos:', error);
    throw error;
  }
}

export async function getDocumentoById(id: number, includeContent = false) {
  const columns = includeContent
    ? `*`
    : `id, barragemId, usuarioId, tipo, categoria, titulo, descricao,
       arquivoUrl, arquivoNome, arquivoTamanho, arquivoTipo,
       versao, documentoPaiId, dataValidade, tags, createdAt, updatedAt`;
  
  const result = await runQuery<InsertDocumento & { id: number; arquivoConteudo?: Buffer }>(
    `SELECT TOP 1 ${columns} FROM dbo.documentos WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );

  const doc = result.recordset[0];
  if (!doc) return null;

  // Converter usando a mesma lógica de getDocumentosByBarragem
  const serialized: Record<string, any> = {};
  
  const fields = [
    'id', 'barragemId', 'usuarioId', 'tipo', 'categoria', 'titulo', 'descricao',
    'arquivoUrl', 'arquivoNome', 'arquivoTamanho', 'arquivoTipo', 'versao',
    'documentoPaiId', 'dataValidade', 'tags', 'createdAt', 'updatedAt'
  ];
  
  for (const key of fields) {
    const value = doc[key];
    
    if (key === 'createdAt' || key === 'updatedAt' || key === 'dataValidade') {
      if (value != null && value !== undefined) {
        try {
          let dateValue: Date | null = null;
          
          if (value instanceof Date) {
            dateValue = value;
          } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            serialized[key] = value;
            continue;
          } else {
            dateValue = new Date(value as any);
          }
          
          if (dateValue && !isNaN(dateValue.getTime())) {
            serialized[key] = dateValue.toISOString();
          } else {
            serialized[key] = null;
          }
        } catch (e) {
          serialized[key] = null;
        }
      } else {
        serialized[key] = null;
      }
    } else if (key === 'id' || key === 'barragemId' || key === 'arquivoTamanho' || key === 'documentoPaiId') {
      if (value != null && value !== undefined) {
        const num = Number(value);
        serialized[key] = isNaN(num) ? null : num;
      } else {
        serialized[key] = null;
      }
    } else {
      serialized[key] = serializeValue(value);
    }
  }
  
  // Testar serialização
  try {
    JSON.stringify(serialized);
  } catch (e) {
    console.error('[DB] Serialization test failed for getDocumentoById:', e);
    return null;
  }
  
  return serialized;
}

export async function updateDocumento(id: number, data: Partial<InsertDocumento>) {
  const updates: string[] = [];
  const setters: Array<(request: SqlRequest) => void> = [];

  const addField = (
    column: string,
    value: unknown,
    setter: (request: SqlRequest) => void
  ) => {
    if (value !== undefined) {
      updates.push(`${column} = @${column}`);
      setters.push(setter);
    }
  };

  addField("barragemId", data.barragemId, (request) =>
    request.input("barragemId", sqlServer.Int, data.barragemId!)
  );
  addField("usuarioId", data.usuarioId, (request) =>
    request.input("usuarioId", sqlServer.NVarChar(64), data.usuarioId!)
  );
  addField("tipo", data.tipo, (request) =>
    request.input("tipo", sqlServer.NVarChar(100), data.tipo!)
  );
  addField("categoria", data.categoria, (request) =>
    request.input("categoria", sqlServer.NVarChar(100), data.categoria ?? null)
  );
  addField("titulo", data.titulo, (request) =>
    request.input("titulo", sqlServer.NVarChar(255), data.titulo!)
  );
  addField("descricao", data.descricao, (request) =>
    request.input("descricao", sqlServer.NVarChar(sqlServer.MAX), data.descricao ?? null)
  );
  addField("arquivoUrl", data.arquivoUrl, (request) =>
    request.input("arquivoUrl", sqlServer.NVarChar(500), data.arquivoUrl ?? null)
  );
  addField("arquivoNome", data.arquivoNome, (request) =>
    request.input("arquivoNome", sqlServer.NVarChar(255), data.arquivoNome!)
  );
  addField("arquivoTamanho", data.arquivoTamanho, (request) =>
    request.input("arquivoTamanho", sqlServer.Int, data.arquivoTamanho ?? null)
  );
  addField("arquivoTipo", data.arquivoTipo, (request) =>
    request.input("arquivoTipo", sqlServer.NVarChar(100), data.arquivoTipo ?? null)
  );
  addField("arquivoConteudo", data.arquivoConteudo, (request) =>
    request.input("arquivoConteudo", sqlServer.VarBinary(sqlServer.MAX), data.arquivoConteudo ?? null)
  );
  addField("versao", data.versao, (request) =>
    request.input("versao", sqlServer.NVarChar(50), data.versao ?? null)
  );
  addField("documentoPaiId", data.documentoPaiId, (request) =>
    request.input("documentoPaiId", sqlServer.Int, data.documentoPaiId ?? null)
  );
  addField("dataValidade", data.dataValidade, (request) =>
    request.input("dataValidade", sqlServer.DateTime2, toDate(data.dataValidade))
  );
  addField("tags", data.tags, (request) =>
    request.input("tags", sqlServer.NVarChar(500), data.tags ?? null)
  );

  if (updates.length === 0) return;

  updates.push("updatedAt = SYSDATETIME()");

  await runQuery(
    `UPDATE dbo.documentos SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      setters.forEach((setter) => setter(request));
    }
  );
}

export async function deleteDocumento(id: number) {
  await runQuery(
    "DELETE FROM dbo.documentos WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// MANUTENÇÕES
// ============================================================================

export async function createManutencao(data: InsertManutencao) {
  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.manutencoes (
      barragemId,
      estruturaId,
      ocorrenciaId,
      tipo,
      titulo,
      descricao,
      dataProgramada,
      responsavel,
      dataInicio,
      dataConclusao,
      status,
      custoEstimado,
      custoReal,
      observacoes
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @estruturaId,
      @ocorrenciaId,
      @tipo,
      @titulo,
      @descricao,
      @dataProgramada,
      @responsavel,
      @dataInicio,
      @dataConclusao,
      COALESCE(@status, 'planejada'),
      @custoEstimado,
      @custoReal,
      @observacoes
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("estruturaId", sqlServer.Int, data.estruturaId ?? null);
      request.input("ocorrenciaId", sqlServer.Int, data.ocorrenciaId ?? null);
      request.input("tipo", sqlServer.NVarChar(32), data.tipo);
      request.input("titulo", sqlServer.NVarChar(255), data.titulo);
      request.input("descricao", sqlServer.NVarChar(sqlServer.MAX), data.descricao ?? null);
      request.input("dataProgramada", sqlServer.DateTime2, toDate(data.dataProgramada));
      request.input("responsavel", sqlServer.NVarChar(255), data.responsavel ?? null);
      request.input("dataInicio", sqlServer.DateTime2, toDate(data.dataInicio));
      request.input("dataConclusao", sqlServer.DateTime2, toDate(data.dataConclusao));
      request.input("status", sqlServer.NVarChar(32), data.status ?? null);
      request.input("custoEstimado", sqlServer.NVarChar(50), data.custoEstimado ?? null);
      request.input("custoReal", sqlServer.NVarChar(50), data.custoReal ?? null);
      request.input("observacoes", sqlServer.NVarChar(sqlServer.MAX), data.observacoes ?? null);
    }
  );

  return result.recordset[0]?.id ?? 0;
}

export async function getManutencoesByBarragem(barragemId: number, status?: string) {
  const query = status
    ? `SELECT * FROM dbo.manutencoes
       WHERE barragemId = @barragemId AND status = @status
       ORDER BY dataProgramada DESC`
    : `SELECT * FROM dbo.manutencoes
       WHERE barragemId = @barragemId
       ORDER BY dataProgramada DESC`;

  const result = await runQuery<InsertManutencao & { id: number }>(
    query,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
      if (status) {
        request.input("status", sqlServer.NVarChar(32), status);
      }
    }
  );

  return result.recordset;
}

export async function updateManutencao(id: number, data: Partial<InsertManutencao>) {
  const { updates, apply } = buildUpdateFragments(data as Record<string, unknown>, {
    barragemId: { type: sqlServer.Int },
    estruturaId: { type: sqlServer.Int },
    ocorrenciaId: { type: sqlServer.Int },
    tipo: { type: sqlServer.NVarChar(32) },
    titulo: { type: sqlServer.NVarChar(255) },
    descricao: { type: sqlServer.NVarChar(sqlServer.MAX) },
    dataProgramada: { type: sqlServer.DateTime2, transform: toDate },
    responsavel: { type: sqlServer.NVarChar(255) },
    dataInicio: { type: sqlServer.DateTime2, transform: toDate },
    dataConclusao: { type: sqlServer.DateTime2, transform: toDate },
    status: { type: sqlServer.NVarChar(32) },
    custoEstimado: { type: sqlServer.NVarChar(50) },
    custoReal: { type: sqlServer.NVarChar(50) },
    observacoes: { type: sqlServer.NVarChar(sqlServer.MAX) },
  });

  if (updates.length === 0) return;

  updates.push("updatedAt = SYSDATETIME()");

  await runQuery(
    `UPDATE dbo.manutencoes SET ${updates.join(", ")} WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
      apply(request);
    }
  );
}

export async function deleteManutencao(id: number) {
  await runQuery(
    "DELETE FROM dbo.manutencoes WHERE id = @id",
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// ALERTAS
// ============================================================================

export async function createAlerta(data: InsertAlerta) {
  console.log('[CREATE ALERTA DEBUG] ============================================');
  console.log('[CREATE ALERTA DEBUG] Criando alerta no banco de dados...');
  console.log('[CREATE ALERTA DEBUG] Dados recebidos:', {
    barragemId: data.barragemId,
    tipo: data.tipo,
    severidade: data.severidade,
    titulo: data.titulo?.substring(0, 50) + '...',
    mensagemLength: data.mensagem?.length,
    instrumentoId: data.instrumentoId,
    leituraId: data.leituraId,
  });

  const result = await runQuery<{ id: number }>(
    `INSERT INTO dbo.alertas (
      barragemId,
      tipo,
      severidade,
      titulo,
      mensagem,
      instrumentoId,
      leituraId,
      ocorrenciaId,
      destinatarios,
      lido,
      dataLeitura,
      acaoTomada,
      dataAcao
    ) OUTPUT INSERTED.id VALUES (
      @barragemId,
      @tipo,
      @severidade,
      @titulo,
      @mensagem,
      @instrumentoId,
      @leituraId,
      @ocorrenciaId,
      @destinatarios,
      COALESCE(@lido, 0),
      @dataLeitura,
      @acaoTomada,
      @dataAcao
    );`,
    (request) => {
      request.input("barragemId", sqlServer.Int, data.barragemId);
      request.input("tipo", sqlServer.NVarChar(100), data.tipo);
      request.input("severidade", sqlServer.NVarChar(16), data.severidade);
      request.input("titulo", sqlServer.NVarChar(255), data.titulo);
      request.input("mensagem", sqlServer.NVarChar(sqlServer.MAX), data.mensagem);
      request.input("instrumentoId", sqlServer.Int, data.instrumentoId ?? null);
      request.input("leituraId", sqlServer.Int, data.leituraId ?? null);
      request.input("ocorrenciaId", sqlServer.Int, data.ocorrenciaId ?? null);
      request.input("destinatarios", sqlServer.NVarChar(sqlServer.MAX), data.destinatarios ?? null);
      request.input("lido", sqlServer.Bit, data.lido ?? null);
      request.input("dataLeitura", sqlServer.DateTime2, toDate(data.dataLeitura));
      request.input("acaoTomada", sqlServer.NVarChar(sqlServer.MAX), data.acaoTomada ?? null);
      request.input("dataAcao", sqlServer.DateTime2, toDate(data.dataAcao));
    }
  );

  const alertaId = result.recordset[0]?.id ?? 0;
  console.log('[CREATE ALERTA DEBUG] Resultado da inserção:', {
    alertaId: alertaId,
    sucesso: alertaId > 0,
    recordset: result.recordset,
    rowsAffected: result.rowsAffected,
  });

  if (alertaId > 0) {
    console.log('[CREATE ALERTA DEBUG] ✅✅✅ ALERTA CRIADO COM SUCESSO NO BANCO! ✅✅✅');
    console.log('[CREATE ALERTA DEBUG] ID do Alerta:', alertaId);
  } else {
    console.error('[CREATE ALERTA DEBUG] ❌❌❌ ERRO: Alerta NÃO foi criado (ID = 0) ❌❌❌');
    console.error('[CREATE ALERTA DEBUG] Recordset completo:', JSON.stringify(result.recordset, null, 2));
    console.error('[CREATE ALERTA DEBUG] Rows affected:', result.rowsAffected);
  }

  console.log('[CREATE ALERTA DEBUG] ============================================');
  return alertaId;
}

export async function getAlertasByBarragem(barragemId: number, lido?: boolean) {
  const query = lido !== undefined
    ? `SELECT * FROM dbo.alertas
       WHERE barragemId = @barragemId AND lido = @lido
       ORDER BY createdAt DESC`
    : `SELECT * FROM dbo.alertas
       WHERE barragemId = @barragemId
       ORDER BY createdAt DESC`;

  const result = await runQuery<InsertAlerta & { id: number }>(
    query,
    (request) => {
      request.input("barragemId", sqlServer.Int, barragemId);
      if (lido !== undefined) {
        request.input("lido", sqlServer.Bit, lido);
      }
    }
  );

  console.log('[ALERTA DEBUG] Buscando alertas:', {
    barragemId,
    lido,
    quantidade: result.recordset.length,
    alertas: result.recordset.map(a => ({ id: a.id, titulo: a.titulo, severidade: a.severidade }))
  });

  return result.recordset;
}

export async function marcarAlertaComoLido(id: number) {
  await runQuery(
    `UPDATE dbo.alertas SET lido = 1, dataLeitura = SYSDATETIME() WHERE id = @id`,
    (request) => {
      request.input("id", sqlServer.Int, id);
    }
  );
}

// ============================================================================
// AUDITORIA
// ============================================================================

export async function registrarAuditoria(data: InsertAuditoria) {
  try {
    await runQuery(
      `INSERT INTO dbo.auditoria (
        usuarioId,
        acao,
        entidade,
        entidadeId,
        detalhes,
        ip,
        userAgent
      ) VALUES (
        @usuarioId,
        @acao,
        @entidade,
        @entidadeId,
        @detalhes,
        @ip,
        @userAgent
      );`,
      (request) => {
        request.input("usuarioId", sqlServer.NVarChar(64), data.usuarioId ?? null);
        request.input("acao", sqlServer.NVarChar(100), data.acao);
        request.input("entidade", sqlServer.NVarChar(100), data.entidade);
        request.input("entidadeId", sqlServer.Int, data.entidadeId ?? null);
        request.input("detalhes", sqlServer.NVarChar(sqlServer.MAX), data.detalhes ?? null);
        request.input("ip", sqlServer.NVarChar(50), data.ip ?? null);
        request.input("userAgent", sqlServer.NVarChar(500), data.userAgent ?? null);
      }
    );
  } catch (error) {
    console.error("[Auditoria] Erro ao registrar:", error);
  }
}

// ============================================================================
// DASHBOARD E ESTATÍSTICAS
// ============================================================================

export async function getDashboardData(barragemId: number) {
  const [
    ultimasInconsistencias,
    ultimasOcorrenciasResult,
    ultimosChecklistsResult,
    ultimaHidro,
    alertasNaoLidosResult,
    totalInstrumentosResult,
    ocorrenciasPendentesResult,
  ] = await Promise.all([
    getLeiturasComInconsistencia(barragemId, 10),
    runQuery<InsertOcorrencia & { id: number }>(
      `SELECT TOP (10) *
       FROM dbo.ocorrencias
       WHERE barragemId = @barragemId
       ORDER BY dataHoraRegistro DESC`,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    ),
    runQuery<InsertChecklist & { id: number }>(
      `SELECT TOP (5) *
       FROM dbo.checklists
       WHERE barragemId = @barragemId
       ORDER BY data DESC`,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    ),
    getUltimaHidrometria(barragemId),
    runQuery<InsertAlerta & { id: number }>(
      `SELECT *
       FROM dbo.alertas
       WHERE barragemId = @barragemId AND lido = 0
       ORDER BY createdAt DESC`,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    ),
    runQuery<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM dbo.instrumentos
       WHERE barragemId = @barragemId AND ativo = 1`,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    ),
    runQuery<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM dbo.ocorrencias
       WHERE barragemId = @barragemId AND status = 'pendente'`,
      (request) => {
        request.input("barragemId", sqlServer.Int, barragemId);
      }
    ),
  ]);

  const alertasNaoLidos = alertasNaoLidosResult.recordset;

  return {
    ultimasInconsistencias,
    ultimasOcorrencias: ultimasOcorrenciasResult.recordset,
    ultimosChecklists: ultimosChecklistsResult.recordset,
    ultimaHidrometria: ultimaHidro ?? null,
    alertasNaoLidos,
    estatisticas: {
      totalInstrumentos: totalInstrumentosResult.recordset[0]?.count ?? 0,
      ocorrenciasPendentes: ocorrenciasPendentesResult.recordset[0]?.count ?? 0,
      alertasNaoLidos: alertasNaoLidos.length,
    },
  };
}

