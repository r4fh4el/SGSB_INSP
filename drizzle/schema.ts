import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Schema do Sistema de Gestão e Segurança de Barragem - SGSB
 * Sistema completo para gestão e monitoramento de segurança de barragens
 */

// ============================================================================
// USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "gestor", "consultor", "inspetor", "leiturista", "visualizador"]).default("visualizador").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// BARRAGENS
// ============================================================================

export const barragens = mysqlTable("barragens", {
  id: int("id").primaryKey().autoincrement(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  nome: varchar("nome", { length: 255 }).notNull(),
  
  // Localização
  rio: varchar("rio", { length: 255 }),
  bacia: varchar("bacia", { length: 255 }),
  municipio: varchar("municipio", { length: 255 }),
  estado: varchar("estado", { length: 2 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  // Características técnicas
  tipo: varchar("tipo", { length: 100 }), // Terra, Enrocamento, Concreto, etc
  finalidade: varchar("finalidade", { length: 255 }), // Geração de energia, abastecimento, etc
  altura: varchar("altura", { length: 50 }),
  comprimento: varchar("comprimento", { length: 50 }),
  volumeReservatorio: varchar("volumeReservatorio", { length: 50 }),
  areaReservatorio: varchar("areaReservatorio", { length: 50 }),
  
  // Níveis operacionais
  nivelMaximoNormal: varchar("nivelMaximoNormal", { length: 50 }),
  nivelMaximoMaximorum: varchar("nivelMaximoMaximorum", { length: 50 }),
  nivelMinimo: varchar("nivelMinimo", { length: 50 }),
  
  // Gestão
  proprietario: varchar("proprietario", { length: 255 }),
  operador: varchar("operador", { length: 255 }),
  anoInicioConstrucao: int("anoInicioConstrucao"),
  anoInicioOperacao: int("anoInicioOperacao"),
  
  // Classificação de risco
  categoriaRisco: mysqlEnum("categoriaRisco", ["A", "B", "C", "D", "E"]),
  danoPotencialAssociado: mysqlEnum("danoPotencialAssociado", ["Alto", "Medio", "Baixo"]),
  
  status: mysqlEnum("status", ["ativa", "inativa", "em_construcao"]).default("ativa").notNull(),
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Barragem = typeof barragens.$inferSelect;
export type InsertBarragem = typeof barragens.$inferInsert;

// ============================================================================
// ESTRUTURAS DA BARRAGEM
// ============================================================================

export const estruturas = mysqlTable("estruturas", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  codigo: varchar("codigo", { length: 50 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(), // Barragem de terra, Vertedouro, Casa de força, etc
  descricao: text("descricao"),
  localizacao: varchar("localizacao", { length: 255 }),
  coordenadas: varchar("coordenadas", { length: 100 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Estrutura = typeof estruturas.$inferSelect;
export type InsertEstrutura = typeof estruturas.$inferInsert;

// ============================================================================
// INSTRUMENTAÇÃO
// ============================================================================

export const instrumentos = mysqlTable("instrumentos", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  estruturaId: int("estruturaId").references(() => estruturas.id, { onDelete: "set null" }),
  
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  tipo: varchar("tipo", { length: 100 }).notNull(), // Piezômetro, Medidor de vazão, Marco superficial, etc
  
  // Localização
  localizacao: varchar("localizacao", { length: 255 }),
  estaca: varchar("estaca", { length: 50 }),
  cota: varchar("cota", { length: 50 }),
  coordenadas: varchar("coordenadas", { length: 100 }),
  
  // Dados técnicos
  dataInstalacao: datetime("dataInstalacao"),
  fabricante: varchar("fabricante", { length: 255 }),
  modelo: varchar("modelo", { length: 255 }),
  numeroSerie: varchar("numeroSerie", { length: 100 }),
  
  // Níveis de referência
  nivelNormal: varchar("nivelNormal", { length: 50 }),
  nivelAlerta: varchar("nivelAlerta", { length: 50 }),
  nivelCritico: varchar("nivelCritico", { length: 50 }),
  
  // Fórmula de cálculo (se aplicável)
  formula: text("formula"),
  unidadeMedida: varchar("unidadeMedida", { length: 50 }),
  
  // Limites de leitura
  limiteInferior: varchar("limiteInferior", { length: 50 }),
  limiteSuperior: varchar("limiteSuperior", { length: 50 }),
  
  // Frequência de leitura e responsável
  frequenciaLeitura: varchar("frequenciaLeitura", { length: 100 }),
  responsavel: varchar("responsavel", { length: 255 }),
  
  // QR Code / Código de barras
  qrCode: varchar("qrCode", { length: 255 }),
  codigoBarras: varchar("codigoBarras", { length: 255 }),
  
  status: mysqlEnum("status", ["ativo", "inativo", "manutencao"]).default("ativo").notNull(),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Instrumento = typeof instrumentos.$inferSelect;
export type InsertInstrumento = typeof instrumentos.$inferInsert;

// ============================================================================
// LEITURAS DE INSTRUMENTOS
// ============================================================================

export const leituras = mysqlTable("leituras", {
  id: int("id").primaryKey().autoincrement(),
  instrumentoId: int("instrumentoId").notNull().references(() => instrumentos.id, { onDelete: "cascade" }),
  usuarioId: varchar("usuarioId", { length: 64 }).notNull().references(() => users.id),
  
  dataHora: datetime("dataHora").notNull(),
  valor: varchar("valor", { length: 50 }).notNull(),
  nivelMontante: varchar("nivelMontante", { length: 50 }),
  
  // Análise automática
  inconsistencia: boolean("inconsistencia").default(false).notNull(),
  tipoInconsistencia: varchar("tipoInconsistencia", { length: 100 }), // Acima do alerta, Acima do crítico, etc
  
  observacoes: text("observacoes"),
  
  // Metadados
  origem: mysqlEnum("origem", ["mobile", "web", "automatico"]).default("mobile").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Leitura = typeof leituras.$inferSelect;
export type InsertLeitura = typeof leituras.$inferInsert;

// ============================================================================
// CHECKLISTS DE INSPEÇÃO
// ============================================================================

export const checklists = mysqlTable("checklists", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  usuarioId: varchar("usuarioId", { length: 64 }).notNull().references(() => users.id),
  
  data: datetime("data").notNull(),
  tipo: mysqlEnum("tipo", ["ISR", "ISE", "ISP", "mensal", "especial", "emergencial"]).default("mensal").notNull(),
  
  // Dados da inspeção
  inspetor: varchar("inspetor", { length: 255 }),
  climaCondicoes: varchar("climaCondicoes", { length: 255 }),
  
  status: mysqlEnum("status", ["em_andamento", "concluida", "cancelada", "concluido", "aprovado"]).default("em_andamento").notNull(),
  
  // Avaliação do consultor/gestor
  consultorId: varchar("consultorId", { length: 64 }).references(() => users.id),
  dataAvaliacao: datetime("dataAvaliacao"),
  comentariosConsultor: text("comentariosConsultor"),
  
  observacoesGerais: text("observacoesGerais"),
  
  // Metadados
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

// ============================================================================
// PERGUNTAS DO CHECKLIST (Template)
// ============================================================================

export const perguntasChecklist = mysqlTable("perguntasChecklist", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").references(() => barragens.id, { onDelete: "cascade" }),
  
  categoria: varchar("categoria", { length: 100 }).notNull(), // Infraestrutura, Reservatório, Casa de Força, etc
  pergunta: text("pergunta").notNull(),
  ordem: int("ordem").notNull(),
  
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PerguntaChecklist = typeof perguntasChecklist.$inferSelect;
export type InsertPerguntaChecklist = typeof perguntasChecklist.$inferInsert;

// ============================================================================
// RESPOSTAS DO CHECKLIST
// ============================================================================

export const respostasChecklist = mysqlTable("respostasChecklist", {
  id: int("id").primaryKey().autoincrement(),
  checklistId: int("checklistId").notNull().references(() => checklists.id, { onDelete: "cascade" }),
  perguntaId: int("perguntaId").notNull().references(() => perguntasChecklist.id),
  
  resposta: mysqlEnum("resposta", ["NO", "PV", "PC", "AM", "DM", "DS"]).notNull(),
  // NO - Não Observado
  // PV - Primeira Vez
  // PC - Permaneceu Constante
  // AM - Aumentou
  // DM - Diminuiu
  // DS - Desapareceu
  
  situacaoAnterior: mysqlEnum("situacaoAnterior", ["NO", "PV", "PC", "AM", "DM", "DS"]),
  comentario: text("comentario"),
  
  // Fotos (URLs separadas por vírgula ou JSON)
  fotos: text("fotos"),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type RespostaChecklist = typeof respostasChecklist.$inferSelect;
export type InsertRespostaChecklist = typeof respostasChecklist.$inferInsert;

// ============================================================================
// CARACTERIZAÇÃO DA BARRAGEM PARA CÁLCULOS HIDROLÓGICOS
// ============================================================================

export const caracterizacaoBarragem = mysqlTable("caracterizacaoBarragem", {
  id: int("id").primaryKey().autoincrement(),
  checklistId: int("checklistId").notNull().references(() => checklists.id, { onDelete: "cascade" }),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  
  // ========== ÍNDICE DE CARACTERIZAÇÃO DE BACIA HIDROGRÁFICA ==========
  // A: Área da bacia hidrográfica (Km²)
  areaBaciaHidrografica: decimal("areaBaciaHidrografica", { precision: 15, scale: 4 }),
  // P: Perímetro (Km)
  perimetro: decimal("perimetro", { precision: 15, scale: 4 }),
  // Lc: Comprimento do rio principal (Km)
  comprimentoRioPrincipal: decimal("comprimentoRioPrincipal", { precision: 15, scale: 4 }),
  // Lv: Comprimento vetorial do rio principal (Km)
  comprimentoVetorialRioPrincipal: decimal("comprimentoVetorialRioPrincipal", { precision: 15, scale: 4 }),
  // Lt: Comprimento total dos rios da bacia (Km)
  comprimentoTotalRioBacia: decimal("comprimentoTotalRioBacia", { precision: 15, scale: 4 }),
  // Amin: Altitude Mínima da bacia (m)
  altitudeMinimaBacia: decimal("altitudeMinimaBacia", { precision: 15, scale: 4 }),
  // Amax: Altitude Máxima da bacia (m)
  altitudeMaximaBacia: decimal("altitudeMaximaBacia", { precision: 15, scale: 4 }),
  // Hm: Amplitude altimétrica da bacia (m)
  altitudeAltimetricaBaciaM: decimal("altitudeAltimetricaBaciaM", { precision: 15, scale: 4 }),
  // Hm: Amplitude altimétrica da bacia (Km)
  altitudeAltimetricaBaciaKM: decimal("altitudeAltimetricaBaciaKM", { precision: 15, scale: 4 }),
  // L: Comprimento axial da bacia (Km)
  comprimentoAxialBacia: decimal("comprimentoAxialBacia", { precision: 15, scale: 4 }),
  
  // ========== TEMPO DE CONCENTRAÇÃO ==========
  // L: Comprimento do rio principal (L)
  comprimentoRioPrincipal_L: decimal("comprimentoRioPrincipal_L", { precision: 15, scale: 4 }),
  // S: Declividade da bacia (S)
  declividadeBacia_S: decimal("declividadeBacia_S", { precision: 15, scale: 4 }),
  // A: Área de drenagem (A)
  areaDrenagem_A: decimal("areaDrenagem_A", { precision: 15, scale: 4 }),
  
  // ========== VAZÃO DE PICO ==========
  // Bd: Largura da barragem - comprimento (m)
  larguraBarragem: decimal("larguraBarragem", { precision: 15, scale: 4 }),
  // Hbarr, H ou Hd: Altura do Maciço Principal (m)
  alturaMaciçoPrincipal: decimal("alturaMaciçoPrincipal", { precision: 15, scale: 4 }),
  // Vhid = V = Vres: Volume do reservatório (m³)
  volumeReservatorio: decimal("volumeReservatorio", { precision: 15, scale: 4 }),
  // Hhid: Carga hidráulica máxima sobre a base da brecha (m)
  cargaHidraulicaMaxima: decimal("cargaHidraulicaMaxima", { precision: 15, scale: 4 }),
  // Ymed: Profundidade média do reservatório (m)
  profundidadeMediaReservatorio: decimal("profundidadeMediaReservatorio", { precision: 15, scale: 4 }),
  // As: Área do reservatório (m²)
  areaReservatorio: decimal("areaReservatorio", { precision: 15, scale: 4 }),
  
  // Metadados
  metodoMedicao: varchar("metodoMedicao", { length: 100 }),
  equipamentoUtilizado: varchar("equipamentoUtilizado", { length: 255 }),
  responsavelMedicao: varchar("responsavelMedicao", { length: 255 }),
  observacoes: text("observacoes"),
  
  // Status
  validado: boolean("validado").default(false).notNull(),
  validadoPor: varchar("validadoPor", { length: 64 }).references(() => users.id),
  dataValidacao: datetime("dataValidacao"),
  
  // Sincronização com SGSB-HIDRO
  sincronizadoComHidro: boolean("sincronizadoComHidro").default(false).notNull(),
  dataSincronizacao: datetime("dataSincronizacao"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type CaracterizacaoBarragem = typeof caracterizacaoBarragem.$inferSelect;
export type InsertCaracterizacaoBarragem = typeof caracterizacaoBarragem.$inferInsert;

// ============================================================================
// OCORRÊNCIAS
// ============================================================================

export const ocorrencias = mysqlTable("ocorrencias", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  estruturaId: int("estruturaId").references(() => estruturas.id, { onDelete: "set null" }),
  
  // Registro
  usuarioRegistroId: varchar("usuarioRegistroId", { length: 64 }).notNull().references(() => users.id),
  dataHoraRegistro: datetime("dataHoraRegistro").notNull(),
  
  estrutura: varchar("estrutura", { length: 255 }).notNull(),
  relato: text("relato").notNull(),
  
  // Fotos (URLs separadas por vírgula ou JSON)
  fotos: text("fotos"),
  
  // Dados adicionais
  titulo: varchar("titulo", { length: 255 }),
  descricao: text("descricao"),
  dataOcorrencia: datetime("dataOcorrencia"),
  localOcorrencia: varchar("localOcorrencia", { length: 255 }),
  acaoImediata: text("acaoImediata"),
  responsavel: varchar("responsavel", { length: 255 }),
  categoria: varchar("categoria", { length: 100 }),
  
  // Classificação
  severidade: mysqlEnum("severidade", ["baixa", "media", "alta", "critica"]),
  tipo: varchar("tipo", { length: 100 }), // Infiltração, Trinca, Erosão, etc
  
  // Gestão
  status: mysqlEnum("status", ["aberta", "em_analise", "em_tratamento", "resolvida", "fechada", "pendente", "em_acao", "concluida", "cancelada"]).default("pendente").notNull(),
  
  // Avaliação
  usuarioAvaliacaoId: varchar("usuarioAvaliacaoId", { length: 64 }).references(() => users.id),
  dataAvaliacao: datetime("dataAvaliacao"),
  comentariosAvaliacao: text("comentariosAvaliacao"),
  
  // Conclusão
  dataConclusao: datetime("dataConclusao"),
  comentariosConclusao: text("comentariosConclusao"),
  
  // Metadados
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Ocorrencia = typeof ocorrencias.$inferSelect;
export type InsertOcorrencia = typeof ocorrencias.$inferInsert;

// ============================================================================
// HIDROMETRIA
// ============================================================================

export const hidrometria = mysqlTable("hidrometria", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  usuarioId: varchar("usuarioId", { length: 64 }).notNull().references(() => users.id),
  
  dataLeitura: datetime("dataLeitura").notNull(),
  dataHora: datetime("dataHora").notNull(),
  nivelMontante: varchar("nivelMontante", { length: 50 }),
  nivelJusante: varchar("nivelJusante", { length: 50 }),
  nivelReservatorio: varchar("nivelReservatorio", { length: 50 }),
  vazao: varchar("vazao", { length: 50 }),
  vazaoAfluente: varchar("vazaoAfluente", { length: 50 }),
  vazaoDefluente: varchar("vazaoDefluente", { length: 50 }),
  vazaoVertedouro: varchar("vazaoVertedouro", { length: 50 }),
  volumeReservatorio: varchar("volumeReservatorio", { length: 50 }),
  volumeArmazenado: varchar("volumeArmazenado", { length: 50 }),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Hidrometria = typeof hidrometria.$inferSelect;
export type InsertHidrometria = typeof hidrometria.$inferInsert;

// ============================================================================
// DOCUMENTOS
// ============================================================================

export const documentos = mysqlTable("documentos", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  usuarioId: varchar("usuarioId", { length: 64 }).notNull().references(() => users.id),
  
  tipo: varchar("tipo", { length: 100 }).notNull(), // PSB, PAE, Relatório, Manual, etc
  categoria: varchar("categoria", { length: 100 }), // Volume I, Volume II, etc
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Arquivo
  arquivoUrl: varchar("arquivoUrl", { length: 500 }).notNull(),
  arquivoNome: varchar("arquivoNome", { length: 255 }).notNull(),
  arquivoTamanho: int("arquivoTamanho"),
  arquivoTipo: varchar("arquivoTipo", { length: 100 }),
  
  // Versionamento
  versao: varchar("versao", { length: 50 }),
  documentoPaiId: int("documentoPaiId"),
  
  // Validade
  dataValidade: datetime("dataValidade"),
  
  tags: varchar("tags", { length: 500 }), // Tags separadas por vírgula
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = typeof documentos.$inferInsert;

// ============================================================================
// MANUTENÇÕES
// ============================================================================

export const manutencoes = mysqlTable("manutencoes", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  estruturaId: int("estruturaId").references(() => estruturas.id, { onDelete: "set null" }),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id, { onDelete: "set null" }),
  
  tipo: mysqlEnum("tipo", ["preventiva", "corretiva", "preditiva"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Planejamento
  dataProgramada: datetime("dataProgramada"),
  responsavel: varchar("responsavel", { length: 255 }),
  
  // Execução
  dataInicio: datetime("dataInicio"),
  dataConclusao: datetime("dataConclusao"),
  
  status: mysqlEnum("status", ["planejada", "em_andamento", "concluida", "cancelada"]).default("planejada").notNull(),
  
  // Custos
  custoEstimado: varchar("custoEstimado", { length: 50 }),
  custoReal: varchar("custoReal", { length: 50 }),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Manutencao = typeof manutencoes.$inferSelect;
export type InsertManutencao = typeof manutencoes.$inferInsert;

// ============================================================================
// ALERTAS
// ============================================================================

export const alertas = mysqlTable("alertas", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  
  tipo: varchar("tipo", { length: 100 }).notNull(), // Leitura crítica, Instrumento sem leitura, Checklist atrasado, etc
  severidade: mysqlEnum("severidade", ["info", "aviso", "alerta", "critico"]).notNull(),
  
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  
  // Referências
  instrumentoId: int("instrumentoId").references(() => instrumentos.id, { onDelete: "set null" }),
  leituraId: int("leituraId").references(() => leituras.id, { onDelete: "set null" }),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id, { onDelete: "set null" }),
  
  // Destinatários
  destinatarios: text("destinatarios"), // IDs de usuários separados por vírgula
  
  // Status
  lido: boolean("lido").default(false).notNull(),
  dataLeitura: datetime("dataLeitura"),
  
  acaoTomada: text("acaoTomada"),
  dataAcao: datetime("dataAcao"),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Alerta = typeof alertas.$inferSelect;
export type InsertAlerta = typeof alertas.$inferInsert;

// ============================================================================
// RELATÓRIOS GERADOS
// ============================================================================

export const relatorios = mysqlTable("relatorios", {
  id: int("id").primaryKey().autoincrement(),
  barragemId: int("barragemId").notNull().references(() => barragens.id, { onDelete: "cascade" }),
  usuarioId: varchar("usuarioId", { length: 64 }).notNull().references(() => users.id),
  
  tipo: varchar("tipo", { length: 100 }).notNull(), // Checklist, Instrumentação, Ocorrências, etc
  titulo: varchar("titulo", { length: 255 }).notNull(),
  
  // Referências
  checklistId: int("checklistId").references(() => checklists.id, { onDelete: "set null" }),
  
  // Arquivo gerado
  arquivoUrl: varchar("arquivoUrl", { length: 500 }),
  formato: varchar("formato", { length: 20 }), // PDF, Excel, etc
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = typeof relatorios.$inferInsert;

// ============================================================================
// LOG DE AUDITORIA
// ============================================================================

export const auditoria = mysqlTable("auditoria", {
  id: int("id").primaryKey().autoincrement(),
  usuarioId: varchar("usuarioId", { length: 64 }).references(() => users.id),
  
  acao: varchar("acao", { length: 100 }).notNull(), // criar, editar, excluir, visualizar
  entidade: varchar("entidade", { length: 100 }).notNull(), // instrumento, leitura, checklist, etc
  entidadeId: int("entidadeId"),
  
  detalhes: text("detalhes"), // JSON com detalhes da ação
  
  ip: varchar("ip", { length: 50 }),
  userAgent: varchar("userAgent", { length: 500 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Auditoria = typeof auditoria.$inferSelect;
export type InsertAuditoria = typeof auditoria.$inferInsert;

// ============================================================================
// RELAÇÕES
// ============================================================================

export const barragensRelations = relations(barragens, ({ many }) => ({
  estruturas: many(estruturas),
  instrumentos: many(instrumentos),
  checklists: many(checklists),
  ocorrencias: many(ocorrencias),
  hidrometria: many(hidrometria),
  documentos: many(documentos),
  manutencoes: many(manutencoes),
  alertas: many(alertas),
}));

export const instrumentosRelations = relations(instrumentos, ({ one, many }) => ({
  barragem: one(barragens, {
    fields: [instrumentos.barragemId],
    references: [barragens.id],
  }),
  estrutura: one(estruturas, {
    fields: [instrumentos.estruturaId],
    references: [estruturas.id],
  }),
  leituras: many(leituras),
}));

export const leiturasRelations = relations(leituras, ({ one }) => ({
  instrumento: one(instrumentos, {
    fields: [leituras.instrumentoId],
    references: [instrumentos.id],
  }),
  usuario: one(users, {
    fields: [leituras.usuarioId],
    references: [users.id],
  }),
}));

export const checklistsRelations = relations(checklists, ({ one, many }) => ({
  barragem: one(barragens, {
    fields: [checklists.barragemId],
    references: [barragens.id],
  }),
  usuario: one(users, {
    fields: [checklists.usuarioId],
    references: [users.id],
  }),
  consultor: one(users, {
    fields: [checklists.consultorId],
    references: [users.id],
  }),
  respostas: many(respostasChecklist),
}));

export const ocorrenciasRelations = relations(ocorrencias, ({ one }) => ({
  barragem: one(barragens, {
    fields: [ocorrencias.barragemId],
    references: [barragens.id],
  }),
  estrutura: one(estruturas, {
    fields: [ocorrencias.estruturaId],
    references: [estruturas.id],
  }),
  usuarioRegistro: one(users, {
    fields: [ocorrencias.usuarioRegistroId],
    references: [users.id],
  }),
  usuarioAvaliacao: one(users, {
    fields: [ocorrencias.usuarioAvaliacaoId],
    references: [users.id],
  }),
}));

