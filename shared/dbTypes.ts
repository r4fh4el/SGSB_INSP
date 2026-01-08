export type UserRole =
  | "admin"
  | "gestor"
  | "consultor"
  | "inspetor"
  | "leiturista"
  | "visualizador";

export interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: UserRole;
  ativo: boolean;
  createdAt: Date;
  lastSignedIn: Date;
}

export interface InsertUser {
  id: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: UserRole;
  ativo?: boolean;
  createdAt?: Date;
  lastSignedIn?: Date;
}

export type BarragemStatus = "ativa" | "inativa" | "em_construcao";
export type CategoriaRisco = "A" | "B" | "C" | "D" | "E";
export type DanoPotencialAssociado = "Alto" | "Medio" | "Baixo";

export interface BarragemRecord {
  id: number;
  codigo: string;
  nome: string;
  rio: string | null;
  bacia: string | null;
  municipio: string | null;
  estado: string | null;
  latitude: string | null;
  longitude: string | null;
  tipo: string | null;
  finalidade: string | null;
  altura: string | null;
  comprimento: string | null;
  volumeReservatorio: string | null;
  areaReservatorio: string | null;
  nivelMaximoNormal: string | null;
  nivelMaximoMaximorum: string | null;
  nivelMinimo: string | null;
  proprietario: string | null;
  operador: string | null;
  anoInicioConstrucao: number | null;
  anoInicioOperacao: number | null;
  categoriaRisco: CategoriaRisco | null;
  danoPotencialAssociado: DanoPotencialAssociado | null;
  status: BarragemStatus;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertBarragem {
  codigo: string;
  nome: string;
  rio?: string | null;
  bacia?: string | null;
  municipio?: string | null;
  estado?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  tipo?: string | null;
  finalidade?: string | null;
  altura?: string | null;
  comprimento?: string | null;
  volumeReservatorio?: string | null;
  areaReservatorio?: string | null;
  nivelMaximoNormal?: string | null;
  nivelMaximoMaximorum?: string | null;
  nivelMinimo?: string | null;
  proprietario?: string | null;
  operador?: string | null;
  anoInicioConstrucao?: number | null;
  anoInicioOperacao?: number | null;
  categoriaRisco?: CategoriaRisco | null;
  danoPotencialAssociado?: DanoPotencialAssociado | null;
  status?: BarragemStatus;
  observacoes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EstruturaRecord {
  id: number;
  barragemId: number;
  codigo: string;
  nome: string;
  tipo: string;
  descricao: string | null;
  localizacao: string | null;
  coordenadas: string | null;
  ativo: boolean;
  createdAt: Date;
}

export interface InsertEstrutura {
  barragemId: number;
  codigo: string;
  nome: string;
  tipo: string;
  descricao?: string | null;
  localizacao?: string | null;
  coordenadas?: string | null;
  ativo?: boolean;
  createdAt?: Date;
}

export type InstrumentoStatus = "ativo" | "inativo" | "manutencao";

export interface InstrumentoRecord {
  id: number;
  barragemId: number;
  estruturaId: number | null;
  codigo: string;
  tipo: string;
  localizacao: string | null;
  estaca: string | null;
  cota: string | null;
  coordenadas: string | null;
  dataInstalacao: Date | null;
  fabricante: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  nivelNormal: string | null;
  nivelAlerta: string | null;
  nivelCritico: string | null;
  formula: string | null;
  unidadeMedida: string | null;
  limiteInferior: string | null;
  limiteSuperior: string | null;
  frequenciaLeitura: string | null;
  responsavel: string | null;
  qrCode: string | null;
  codigoBarras: string | null;
  status: InstrumentoStatus;
  observacoes: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertInstrumento {
  barragemId: number;
  estruturaId?: number | null;
  codigo: string;
  tipo: string;
  localizacao?: string | null;
  estaca?: string | null;
  cota?: string | null;
  coordenadas?: string | null;
  dataInstalacao?: Date | null;
  fabricante?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  nivelNormal?: string | null;
  nivelAlerta?: string | null;
  nivelCritico?: string | null;
  formula?: string | null;
  unidadeMedida?: string | null;
  limiteInferior?: string | null;
  limiteSuperior?: string | null;
  frequenciaLeitura?: string | null;
  responsavel?: string | null;
  qrCode?: string | null;
  codigoBarras?: string | null;
  status?: InstrumentoStatus;
  observacoes?: string | null;
  ativo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeituraOrigem = "mobile" | "web" | "automatico";

export interface LeituraRecord {
  id: number;
  instrumentoId: number;
  usuarioId: string;
  dataHora: Date;
  valor: string;
  nivelMontante: string | null;
  inconsistencia: boolean;
  tipoInconsistencia: string | null;
  observacoes: string | null;
  origem: LeituraOrigem;
  latitude: string | null;
  longitude: string | null;
  createdAt: Date;
}

export interface InsertLeitura {
  instrumentoId: number;
  usuarioId: string;
  dataHora: Date;
  valor: string;
  nivelMontante?: string | null;
  inconsistencia?: boolean;
  tipoInconsistencia?: string | null;
  observacoes?: string | null;
  origem?: LeituraOrigem;
  latitude?: string | null;
  longitude?: string | null;
  createdAt?: Date;
}

export type ChecklistTipo = "ISR" | "ISE" | "ISP" | "mensal" | "especial" | "emergencial";
export type ChecklistStatus =
  | "em_andamento"
  | "concluida"
  | "cancelada"
  | "concluido"
  | "aprovado";

export interface ChecklistRecord {
  id: number;
  barragemId: number;
  usuarioId: string;
  data: Date;
  tipo: ChecklistTipo;
  inspetor: string | null;
  climaCondicoes: string | null;
  status: ChecklistStatus;
  consultorId: string | null;
  dataAvaliacao: Date | null;
  comentariosConsultor: string | null;
  observacoesGerais: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertChecklist {
  barragemId: number;
  usuarioId: string;
  data: Date;
  tipo?: ChecklistTipo;
  inspetor?: string | null;
  climaCondicoes?: string | null;
  status?: ChecklistStatus;
  consultorId?: string | null;
  dataAvaliacao?: Date | null;
  comentariosConsultor?: string | null;
  observacoesGerais?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PerguntaChecklistRecord {
  id: number;
  barragemId: number | null;
  categoria: string;
  pergunta: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
}

export interface InsertPerguntaChecklist {
  barragemId?: number | null;
  categoria: string;
  pergunta: string;
  ordem: number;
  ativo?: boolean;
  createdAt?: Date;
}

export type RespostaChecklistValor = "NO" | "PV" | "PC" | "AM" | "DM" | "DS";

export interface RespostaChecklistRecord {
  id: number;
  checklistId: number;
  perguntaId: number;
  resposta: RespostaChecklistValor;
  situacaoAnterior: RespostaChecklistValor | null;
  comentario: string | null;
  fotos: string | null;
  createdAt: Date;
}

export interface InsertRespostaChecklist {
  checklistId: number;
  perguntaId: number;
  resposta: RespostaChecklistValor;
  situacaoAnterior?: RespostaChecklistValor | null;
  comentario?: string | null;
  fotos?: string | null;
  createdAt?: Date;
}

// ============================================================================
// CARACTERIZAÇÃO DA BARRAGEM
// ============================================================================

export interface CaracterizacaoBarragemRecord {
  id: number;
  checklistId: number;
  barragemId: number;
  areaBaciaHidrografica?: number | null;
  perimetro?: number | null;
  comprimentoRioPrincipal?: number | null;
  comprimentoVetorialRioPrincipal?: number | null;
  comprimentoTotalRioBacia?: number | null;
  altitudeMinimaBacia?: number | null;
  altitudeMaximaBacia?: number | null;
  altitudeAltimetricaBaciaM?: number | null;
  altitudeAltimetricaBaciaKM?: number | null;
  comprimentoAxialBacia?: number | null;
  comprimentoRioPrincipal_L?: number | null;
  declividadeBacia_S?: number | null;
  areaDrenagem_A?: number | null;
  larguraBarragem?: number | null;
  alturaMaciçoPrincipal?: number | null;
  volumeReservatorio?: number | null;
  cargaHidraulicaMaxima?: number | null;
  profundidadeMediaReservatorio?: number | null;
  areaReservatorio?: number | null;
  metodoMedicao?: string | null;
  equipamentoUtilizado?: string | null;
  responsavelMedicao?: string | null;
  observacoes?: string | null;
  validado: boolean;
  validadoPor?: string | null;
  dataValidacao?: Date | null;
  sincronizadoComHidro: boolean;
  dataSincronizacao?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertCaracterizacaoBarragem {
  checklistId: number;
  barragemId: number;
  areaBaciaHidrografica?: number | null;
  perimetro?: number | null;
  comprimentoRioPrincipal?: number | null;
  comprimentoVetorialRioPrincipal?: number | null;
  comprimentoTotalRioBacia?: number | null;
  altitudeMinimaBacia?: number | null;
  altitudeMaximaBacia?: number | null;
  altitudeAltimetricaBaciaM?: number | null;
  altitudeAltimetricaBaciaKM?: number | null;
  comprimentoAxialBacia?: number | null;
  comprimentoRioPrincipal_L?: number | null;
  declividadeBacia_S?: number | null;
  areaDrenagem_A?: number | null;
  larguraBarragem?: number | null;
  alturaMaciçoPrincipal?: number | null;
  volumeReservatorio?: number | null;
  cargaHidraulicaMaxima?: number | null;
  profundidadeMediaReservatorio?: number | null;
  areaReservatorio?: number | null;
  metodoMedicao?: string | null;
  equipamentoUtilizado?: string | null;
  responsavelMedicao?: string | null;
  observacoes?: string | null;
}

export type OcorrenciaStatus =
  | "aberta"
  | "em_analise"
  | "em_tratamento"
  | "resolvida"
  | "fechada"
  | "pendente"
  | "em_acao"
  | "concluida"
  | "cancelada";

export type OcorrenciaSeveridade = "baixa" | "media" | "alta" | "critica";

export interface OcorrenciaRecord {
  id: number;
  barragemId: number;
  estruturaId: number | null;
  usuarioRegistroId: string;
  dataHoraRegistro: Date;
  estrutura: string;
  relato: string;
  fotos: string | null;
  titulo: string | null;
  descricao: string | null;
  dataOcorrencia: Date | null;
  localOcorrencia: string | null;
  acaoImediata: string | null;
  responsavel: string | null;
  categoria: string | null;
  severidade: OcorrenciaSeveridade | null;
  tipo: string | null;
  status: OcorrenciaStatus;
  usuarioAvaliacaoId: string | null;
  dataAvaliacao: Date | null;
  comentariosAvaliacao: string | null;
  dataConclusao: Date | null;
  comentariosConclusao: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertOcorrencia {
  barragemId: number;
  estruturaId?: number | null;
  usuarioRegistroId: string;
  dataHoraRegistro: Date;
  estrutura: string;
  relato: string;
  fotos?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  dataOcorrencia?: Date | null;
  localOcorrencia?: string | null;
  acaoImediata?: string | null;
  responsavel?: string | null;
  categoria?: string | null;
  severidade?: OcorrenciaSeveridade | null;
  tipo?: string | null;
  status?: OcorrenciaStatus;
  usuarioAvaliacaoId?: string | null;
  dataAvaliacao?: Date | null;
  comentariosAvaliacao?: string | null;
  dataConclusao?: Date | null;
  comentariosConclusao?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HidrometriaRecord {
  id: number;
  barragemId: number;
  usuarioId: string;
  dataLeitura: Date;
  dataHora: Date;
  nivelMontante: string | null;
  nivelJusante: string | null;
  nivelReservatorio: string | null;
  vazao: string | null;
  vazaoAfluente: string | null;
  vazaoDefluente: string | null;
  vazaoVertedouro: string | null;
  volumeReservatorio: string | null;
  volumeArmazenado: string | null;
  observacoes: string | null;
  createdAt: Date;
}

export interface InsertHidrometria {
  barragemId: number;
  usuarioId: string;
  dataLeitura: Date;
  dataHora: Date;
  nivelMontante?: string | null;
  nivelJusante?: string | null;
  nivelReservatorio?: string | null;
  vazao?: string | null;
  vazaoAfluente?: string | null;
  vazaoDefluente?: string | null;
  vazaoVertedouro?: string | null;
  volumeReservatorio?: string | null;
  volumeArmazenado?: string | null;
  observacoes?: string | null;
  createdAt?: Date;
}

export interface DocumentoRecord {
  id: number;
  barragemId: number;
  usuarioId: string;
  tipo: string;
  categoria: string | null;
  titulo: string;
  descricao: string | null;
  arquivoUrl: string | null;
  arquivoNome: string;
  arquivoTamanho: number | null;
  arquivoTipo: string | null;
  arquivoConteudo: Buffer | null;
  versao: string | null;
  documentoPaiId: number | null;
  dataValidade: Date | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertDocumento {
  barragemId: number;
  usuarioId: string;
  tipo: string;
  categoria?: string | null;
  titulo: string;
  descricao?: string | null;
  arquivoUrl?: string | null;
  arquivoNome: string;
  arquivoTamanho?: number | null;
  arquivoTipo?: string | null;
  arquivoConteudo?: Buffer | null;
  versao?: string | null;
  documentoPaiId?: number | null;
  dataValidade?: Date | null;
  tags?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ManutencaoTipo = "preventiva" | "corretiva" | "preditiva";
export type ManutencaoStatus = "planejada" | "em_andamento" | "concluida" | "cancelada";

export interface ManutencaoRecord {
  id: number;
  barragemId: number;
  estruturaId: number | null;
  ocorrenciaId: number | null;
  tipo: ManutencaoTipo;
  titulo: string;
  descricao: string | null;
  dataProgramada: Date | null;
  responsavel: string | null;
  dataInicio: Date | null;
  dataConclusao: Date | null;
  status: ManutencaoStatus;
  custoEstimado: string | null;
  custoReal: string | null;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertManutencao {
  barragemId: number;
  estruturaId?: number | null;
  ocorrenciaId?: number | null;
  tipo: ManutencaoTipo;
  titulo: string;
  descricao?: string | null;
  dataProgramada?: Date | null;
  responsavel?: string | null;
  dataInicio?: Date | null;
  dataConclusao?: Date | null;
  status?: ManutencaoStatus;
  custoEstimado?: string | null;
  custoReal?: string | null;
  observacoes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AlertaSeveridade = "info" | "aviso" | "alerta" | "critico";

export interface AlertaRecord {
  id: number;
  barragemId: number;
  tipo: string;
  severidade: AlertaSeveridade;
  titulo: string;
  mensagem: string;
  instrumentoId: number | null;
  leituraId: number | null;
  ocorrenciaId: number | null;
  destinatarios: string | null;
  lido: boolean;
  dataLeitura: Date | null;
  acaoTomada: string | null;
  dataAcao: Date | null;
  createdAt: Date;
}

export interface InsertAlerta {
  barragemId: number;
  tipo: string;
  severidade: AlertaSeveridade;
  titulo: string;
  mensagem: string;
  instrumentoId?: number | null;
  leituraId?: number | null;
  ocorrenciaId?: number | null;
  destinatarios?: string | null;
  lido?: boolean;
  dataLeitura?: Date | null;
  acaoTomada?: string | null;
  dataAcao?: Date | null;
  createdAt?: Date;
}

export interface RelatorioRecord {
  id: number;
  barragemId: number;
  usuarioId: string;
  tipo: string;
  titulo: string;
  checklistId: number | null;
  arquivoUrl: string | null;
  formato: string | null;
  createdAt: Date;
}

export interface InsertRelatorio {
  barragemId: number;
  usuarioId: string;
  tipo: string;
  titulo: string;
  checklistId?: number | null;
  arquivoUrl?: string | null;
  formato?: string | null;
  createdAt?: Date;
}

export interface AuditoriaRecord {
  id: number;
  usuarioId: string | null;
  acao: string;
  entidade: string;
  entidadeId: number | null;
  detalhes: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface InsertAuditoria {
  usuarioId?: string | null;
  acao: string;
  entidade: string;
  entidadeId?: number | null;
  detalhes?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

