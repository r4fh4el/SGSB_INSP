/**
 * Serviço para enviar notificações ao sistema SGSB-HIDRO
 * quando uma inspeção é criada ou atualizada
 */

import { ENV } from "./_core/env";

interface NotificacaoInspecao {
  checklistId: number;
  barragemId: number;
  tipo: string;
  data: string;
  inspetor?: string;
  status?: string;
  temCaracterizacao?: boolean;
}

/**
 * Envia notificação ao HIDRO sobre nova inspeção
 */
export async function notificarHidroNovaInspecao(
  checklistId: number,
  barragemId: number,
  tipo: string,
  data: Date,
  inspetor?: string,
  status?: string,
  temCaracterizacao = false
): Promise<void> {
  const hidroUrl = ENV.hidroApiUrl;

  // Se não estiver configurado, apenas loga e retorna (não quebra o fluxo)
  if (!hidroUrl) {
    console.log("[Notificação HIDRO] URL não configurada, pulando notificação");
    return;
  }

  try {
    const notificacao: NotificacaoInspecao = {
      checklistId,
      barragemId,
      tipo,
      data: data.toISOString(),
      inspetor,
      status,
      temCaracterizacao,
    };

    const response = await fetch(`${hidroUrl}/API/NotificarNovaInspecao`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificacao),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Notificação HIDRO] Erro ao enviar notificação: ${response.status} - ${errorText}`
      );
      // Não lança erro para não quebrar o fluxo principal
      return;
    }

    const result = await response.json();
    console.log(
      `[Notificação HIDRO] Notificação enviada com sucesso: ChecklistId=${checklistId}, BarragemId=${barragemId}`
    );
  } catch (error) {
    // Loga o erro mas não quebra o fluxo principal
    console.error("[Notificação HIDRO] Erro ao enviar notificação:", error);
  }
}

/**
 * Interface para dados de caracterização da barragem
 */
interface CaracterizacaoBarragemData {
  id?: number;
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
}

/**
 * Envia dados de caracterização da barragem ao SGSB-FINAL para cálculos automáticos
 * Esta função converte os dados do SGSB para o formato esperado pelo SGSB-FINAL
 * e atualiza ou cria o registro de IndiceCaracterizacaoBH automaticamente
 */
export async function sincronizarCaracterizacaoComHidro(
  caracterizacao: CaracterizacaoBarragemData
): Promise<boolean> {
  const hidroUrl = ENV.hidroApiUrl;

  // Se não estiver configurado, apenas loga e retorna (não quebra o fluxo)
  if (!hidroUrl) {
    console.log("[Sincronização HIDRO] URL não configurada, pulando sincronização");
    return false;
  }

  try {
    // Buscar lista de índices para verificar se já existe registro para esta barragem
    let registroExistente: any = null;
    try {
      // Adicionar timeout para evitar que a requisição trave
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
      
      const listResponse = await fetch(`${hidroUrl}/API/ListarIndiceCaracterizacaoBH`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (listResponse.ok) {
        const lista = await listResponse.json();
        registroExistente = Array.isArray(lista) 
          ? lista.find((item: any) => item.Barragem_ID === caracterizacao.barragemId)
          : null;
      }
    } catch (error: any) {
      // Se não conseguir buscar lista, continua tentando criar/atualizar
      if (error.name === 'AbortError') {
        console.log("[Sincronização HIDRO] Timeout ao verificar registros existentes, tentando criar novo");
      } else if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
        console.log("[Sincronização HIDRO] Serviço HIDRO não disponível (ECONNREFUSED), pulando sincronização");
        return false;
      } else {
        console.log("[Sincronização HIDRO] Não foi possível verificar registros existentes, tentando criar novo");
      }
    }

    // Preparar dados no formato esperado pelo SGSB-FINAL
    const dadosHidro = {
      Id: registroExistente?.Id || 0,
      Barragem_ID: caracterizacao.barragemId,
      AreaBaciaHidrografica: caracterizacao.areaBaciaHidrografica ?? 0,
      Perimetro: caracterizacao.perimetro ?? 0,
      ComprimentoRioPrincipal: caracterizacao.comprimentoRioPrincipal ?? 0,
      ComprimentoVetorialRioPrincipal: caracterizacao.comprimentoVetorialRioPrincipal ?? 0,
      AltitudeVetorialRioPrincipal: 0, // Campo não mapeado no SGSB, manter 0
      ComprimentoTotalRioBacia: caracterizacao.comprimentoTotalRioBacia ?? 0,
      AltitudeMaximaBacia: caracterizacao.altitudeMaximaBacia ?? 0,
      AltitudeMinimaBacia: caracterizacao.altitudeMinimaBacia ?? 0,
      AltitudeAltimetricaBaciaM: caracterizacao.altitudeAltimetricaBaciaM ?? 0,
      AltitudeAltimetricaBaciaKM: caracterizacao.altitudeAltimetricaBaciaKM ?? 0,
      ComprimentoAxialBacia: caracterizacao.comprimentoAxialBacia ?? 0,
      // Campos de resultado serão calculados pelo SGSB-FINAL, preservar valores existentes se houver
      ResultadoIndiceCircularidade: registroExistente?.ResultadoIndiceCircularidade ?? 0,
      ResultadoFatorForma: registroExistente?.ResultadoFatorForma ?? 0,
      ResultadoCoeficienteCompacidade: registroExistente?.ResultadoCoeficienteCompacidade ?? 0,
      ResultadoDensidadeDrenagem: registroExistente?.ResultadoDensidadeDrenagem ?? 0,
      ResultadoCoeficienteManutencao: registroExistente?.ResultadoCoeficienteManutencao ?? 0,
      ResultadoGradienteCanais: registroExistente?.ResultadoGradienteCanais ?? 0,
      ResultadoRelacaoRelevo: registroExistente?.ResultadoRelacaoRelevo ?? 0,
      ResultadoIndiceRugosidade: registroExistente?.ResultadoIndiceRugosidade ?? 0,
      ResultadoSinuosidadeCursoDagua: registroExistente?.ResultadoSinuosidadeCursoDagua ?? 0,
    };

    // Se já existe registro (Id > 0), atualizar; caso contrário, criar novo
    const endpoint = registroExistente?.Id
      ? "/API/AtualizaIndiceCaracterizacaoBH"
      : "/API/AdicionarIndiceCaracterizacaoBH";
    
    const method = registroExistente?.Id ? "PUT" : "POST";

    // Adicionar timeout para evitar que a requisição trave
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    const response = await fetch(`${hidroUrl}${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosHidro),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Sincronização HIDRO] Erro ao sincronizar caracterização: ${response.status} - ${errorText}`
      );
      return false;
    }

    const result = await response.json();
    console.log(
      `[Sincronização HIDRO] Caracterização sincronizada com sucesso: BarragemId=${caracterizacao.barragemId}, ChecklistId=${caracterizacao.checklistId}`
    );

    // Sincronizar também TempoConcentracao se houver dados
    if (caracterizacao.comprimentoRioPrincipal_L || caracterizacao.declividadeBacia_S || caracterizacao.areaDrenagem_A) {
      try {
        await sincronizarTempoConcentracaoComHidro(caracterizacao);
      } catch (error) {
        console.error("[Sincronização HIDRO] Erro ao sincronizar TempoConcentracao:", error);
      }
    }
    
    return true;
  } catch (error: any) {
    // Loga o erro mas não quebra o fluxo principal
    // Tratamento específico para erros de conexão
    if (error.name === 'AbortError') {
      console.log("[Sincronização HIDRO] Timeout ao sincronizar caracterização (serviço HIDRO não respondeu a tempo)");
    } else if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
      console.log("[Sincronização HIDRO] Serviço HIDRO não disponível (ECONNREFUSED), sincronização ignorada");
    } else {
      console.error("[Sincronização HIDRO] Erro ao sincronizar caracterização:", error.message || error);
    }
    return false;
  }
}

/**
 * Sincroniza dados de Tempo de Concentração com SGSB-FINAL
 */
async function sincronizarTempoConcentracaoComHidro(
  caracterizacao: CaracterizacaoBarragemData
): Promise<boolean> {
  const hidroUrl = ENV.hidroApiUrl;

  if (!hidroUrl) {
    return false;
  }

  try {
    // Buscar lista de tempos de concentração
    let tempoExistente: any = null;
    try {
      const listResponse = await fetch(`${hidroUrl}/API/ListarTempoConcentracao`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (listResponse.ok) {
        const lista = await listResponse.json();
        tempoExistente = Array.isArray(lista) 
          ? lista.find((item: any) => item.BarragemId === caracterizacao.barragemId)
          : null;
      }
    } catch (error) {
      console.log("[Sincronização HIDRO] Não foi possível verificar TempoConcentracao existente");
    }

    // Preparar dados - usar comprimentoRioPrincipal como fallback se comprimentoRioPrincipal_L não existir
    const comprimentoL = caracterizacao.comprimentoRioPrincipal_L ?? caracterizacao.comprimentoRioPrincipal ?? 0;
    
    const dadosTempo = {
      Id: tempoExistente?.Id || 0,
      BarragemId: caracterizacao.barragemId,
      ComprimentoRioPrincipal_L: comprimentoL,
      DeclividadeBacia_S: caracterizacao.declividadeBacia_S ?? 0,
      AreaDrenagem_A: caracterizacao.areaDrenagem_A ?? (caracterizacao.areaBaciaHidrografica ?? 0),
      // Preservar resultados existentes se houver
      ResultadoKirpich: tempoExistente?.ResultadoKirpich ?? 0,
      ResultadoCorpsEngineers: tempoExistente?.ResultadoCorpsEngineers ?? 0,
      ResultadoCarter: tempoExistente?.ResultadoCarter ?? 0,
      ResultadoDooge: tempoExistente?.ResultadoDooge ?? 0,
      ResultadoVenTeChow: tempoExistente?.ResultadoVenTeChow ?? 0,
    };

    // Criar ou atualizar
    const endpoint = tempoExistente?.Id
      ? "/API/AtualizaTempoConcentracao"
      : "/API/AdicionarTempoConcentracao";
    
    const method = tempoExistente?.Id ? "PUT" : "POST";

    const response = await fetch(`${hidroUrl}${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosTempo),
    });

    if (response.ok) {
      console.log(`[Sincronização HIDRO] TempoConcentracao sincronizado: BarragemId=${caracterizacao.barragemId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Sincronização HIDRO] Erro ao sincronizar TempoConcentracao:", error);
    return false;
  }
}

/**
 * Dispara cálculo automático no SGSB-FINAL para uma barragem
 * Este endpoint calcula automaticamente todos os índices disponíveis:
 * - Índice de Caracterização da Bacia Hidrográfica
 * - Tempo de Concentração
 * Ambos são calculados em uma única chamada
 */
export async function dispararCalculoAutomaticoHidro(barragemId: number): Promise<boolean> {
  const hidroUrl = ENV.hidroApiUrl;

  if (!hidroUrl) {
    console.log("[Cálculo Automático HIDRO] URL não configurada, pulando cálculo");
    return false;
  }

  try {
    // Calcular Índice de Caracterização da Bacia e Tempo de Concentração
    // O endpoint CalcularCaracterizacaoAutomatica agora calcula ambos automaticamente
    const response = await fetch(`${hidroUrl}/API/CalcularCaracterizacaoAutomatica`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        barragemId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Cálculo Automático HIDRO] Erro ao calcular índices: ${response.status} - ${errorText}`
      );
      return false;
    }

    const result = await response.json();
    console.log(
      `[Cálculo Automático HIDRO] Caracterização e Tempo de Concentração calculados: BarragemId=${barragemId}`
    );
    
    return true;
  } catch (error) {
    console.error("[Cálculo Automático HIDRO] Erro ao disparar cálculo:", error);
    return false;
  }
}

/**
 * Verifica se o serviço de notificação do HIDRO está ativo
 */
export async function verificarHidroHealth(): Promise<boolean> {
  const hidroUrl = ENV.hidroApiUrl;

  if (!hidroUrl) {
    return false;
  }

  try {
    const response = await fetch(`${hidroUrl}/API/NotificacaoInspecao/Health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[Notificação HIDRO] Erro ao verificar health:", error);
    return false;
  }
}

