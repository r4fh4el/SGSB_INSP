import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Middleware para verificar se o usuário é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores e gestores podem realizar esta ação.",
    });
  }
  return next({ ctx });
});

const normalizeEnumValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

function flexEnum<T extends readonly [string, ...string[]]>(
  values: T,
  message?: string
) {
  const map = new Map<string, T[number]>();
  values.forEach((value) => {
    map.set(normalizeEnumValue(value), value);
  });

  return z
    .string()
    .transform((input, ctx) => {
      if (!input || input.trim() === "") {
        return values[0]; // Retorna o primeiro valor como padrão se vazio
      }
      const canonical = map.get(normalizeEnumValue(input));
      if (!canonical) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            message ??
            `Valor inválido. Use um dos seguintes: ${Array.from(values).join(", ")}`,
        });
        return z.NEVER;
      }
      return canonical;
    });
}

const USER_ROLES = [
  "admin",
  "gestor",
  "consultor",
  "inspetor",
  "leiturista",
  "visualizador",
] as const;

const CATEGORIA_RISCO = ["A", "B", "C", "D", "E"] as const;
const DANO_POTENCIAL = ["Alto", "Medio", "Baixo"] as const;
const BARRAGEM_STATUS = ["ativa", "inativa", "em_construcao"] as const;

const INSTRUMENTO_STATUS = ["ativo", "inativo", "manutencao"] as const;
const LEITURA_ORIGEM = ["mobile", "web", "automatico"] as const;

const CHECKLIST_CREATE_TYPES = ["mensal", "especial", "emergencial"] as const;
const CHECKLIST_TYPES = ["ISR", "ISE", "ISP", "mensal", "especial", "emergencial"] as const;
const CHECKLIST_STATUS = ["em_andamento", "concluida", "cancelada", "concluido", "aprovado"] as const;

const RESPOSTA_OPTIONS = ["NO", "PV", "PC", "AM", "DM", "DS"] as const;

const OCORRENCIA_SEVERIDADE = ["baixa", "media", "alta", "critica"] as const;
const OCORRENCIA_STATUS = ["pendente", "em_analise", "em_acao", "concluida", "cancelada"] as const;

const MANUTENCAO_TIPO = ["preventiva", "corretiva", "preditiva"] as const;
const MANUTENCAO_STATUS = ["planejada", "em_andamento", "concluida", "cancelada"] as const;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // USUÁRIOS
  // ============================================================================

  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    updateRole: adminProcedure
      .input(
        z.object({
          userId: z.string(),
          role: flexEnum(USER_ROLES),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    toggleStatus: adminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        await db.toggleUserStatus(input.userId);
        return { success: true };
      }),
  }),

  // ============================================================================
  // BARRAGENS
  // ============================================================================

  barragens: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllBarragens();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getBarragemById(input.id);
    }),

    create: adminProcedure
      .input(
        z.object({
          codigo: z.string(),
          nome: z.string(),
          rio: z.string().optional(),
          bacia: z.string().optional(),
          municipio: z.string().optional(),
          estado: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          tipo: z.string().optional(),
          finalidade: z.string().optional(),
          altura: z.string().optional(),
          comprimento: z.string().optional(),
          volumeReservatorio: z.string().optional(),
          areaReservatorio: z.string().optional(),
          nivelMaximoNormal: z.string().optional(),
          nivelMaximoMaximorum: z.string().optional(),
          nivelMinimo: z.string().optional(),
          proprietario: z.string().optional(),
          operador: z.string().optional(),
          anoInicioConstrucao: z.number().optional(),
          anoInicioOperacao: z.number().optional(),
          categoriaRisco: flexEnum(CATEGORIA_RISCO).optional(),
          danoPotencialAssociado: flexEnum(DANO_POTENCIAL).optional(),
          status: flexEnum(BARRAGEM_STATUS).optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createBarragem(input);
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            codigo: z.string().optional(),
            nome: z.string().optional(),
            rio: z.string().optional(),
            bacia: z.string().optional(),
            municipio: z.string().optional(),
            estado: z.string().optional(),
            latitude: z.string().optional(),
            longitude: z.string().optional(),
            tipo: z.string().optional(),
            finalidade: z.string().optional(),
            altura: z.string().optional(),
            comprimento: z.string().optional(),
            volumeReservatorio: z.string().optional(),
            areaReservatorio: z.string().optional(),
            nivelMaximoNormal: z.string().optional(),
            nivelMaximoMaximorum: z.string().optional(),
            nivelMinimo: z.string().optional(),
            proprietario: z.string().optional(),
            operador: z.string().optional(),
            anoInicioConstrucao: z.number().optional(),
            anoInicioOperacao: z.number().optional(),
            categoriaRisco: flexEnum(CATEGORIA_RISCO).optional(),
            danoPotencialAssociado: flexEnum(DANO_POTENCIAL).optional(),
            status: flexEnum(BARRAGEM_STATUS).optional(),
            observacoes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateBarragem(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteBarragem(input.id);
      return { success: true };
    }),
  }),

  // ============================================================================
  // ESTRUTURAS
  // ============================================================================

  estruturas: router({
    listByBarragem: protectedProcedure.input(z.object({ barragemId: z.number() })).query(async ({ input }) => {
      return await db.getEstruturasByBarragem(input.barragemId);
    }),

    create: adminProcedure
      .input(
        z.object({
          barragemId: z.number(),
          codigo: z.string(),
          nome: z.string(),
          tipo: z.string(),
          descricao: z.string().optional(),
          localizacao: z.string().optional(),
          coordenadas: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createEstrutura(input);
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            codigo: z.string().optional(),
            nome: z.string().optional(),
            tipo: z.string().optional(),
            descricao: z.string().optional(),
            localizacao: z.string().optional(),
            coordenadas: z.string().optional(),
            ativo: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateEstrutura(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteEstrutura(input.id);
      return { success: true };
    }),
  }),

  // ============================================================================
  // INSTRUMENTOS
  // ============================================================================

  instrumentos: router({
    list: protectedProcedure.input(z.object({ barragemId: z.number().optional() })).query(async ({ input }) => {
      return await db.getAllInstrumentos(input.barragemId);
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getInstrumentoById(input.id);
    }),

    getByCodigo: protectedProcedure.input(z.object({ codigo: z.string() })).query(async ({ input }) => {
      return await db.getInstrumentoByCodigo(input.codigo);
    }),

    create: adminProcedure
      .input(
        z.object({
          barragemId: z.number(),
          estruturaId: z.number().optional(),
          codigo: z.string(),
          tipo: z.string(),
          localizacao: z.string().optional(),
          estaca: z.string().optional(),
          cota: z.string().optional(),
          coordenadas: z.string().optional(),
          dataInstalacao: z.string().optional(),
          fabricante: z.string().optional(),
          modelo: z.string().optional(),
          numeroSerie: z.string().optional(),
          nivelNormal: z.string().optional(),
          nivelAlerta: z.string().optional(),
          nivelCritico: z.string().optional(),
          formula: z.string().optional(),
          unidadeMedida: z.string().optional(),
          limiteInferior: z.string().optional(),
          limiteSuperior: z.string().optional(),
          frequenciaLeitura: z.string().optional(),
          responsavel: z.string().optional(),
          qrCode: z.string().optional(),
          codigoBarras: z.string().optional(),
          status: flexEnum(INSTRUMENTO_STATUS).optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createInstrumento(input as any);
        return { id, success: true };
      }),

    createLeitura: protectedProcedure
      .input(
        z.object({
          instrumentoId: z.number(),
          valor: z.string(),
          dataHora: z.date(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.createLeitura({
          ...input,
          usuarioId: ctx.user.id,
        });
        return { id, success: true };
      }),

    leituras: protectedProcedure
      .input(z.object({ instrumentoId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getLeiturasByInstrumento(input.instrumentoId, input.limit);
      }),

    deleteLeitura: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLeitura(input.id);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            codigo: z.string().optional(),
            tipo: z.string().optional(),
            localizacao: z.string().optional(),
            estaca: z.string().optional(),
            cota: z.string().optional(),
            coordenadas: z.string().optional(),
            dataInstalacao: z.string().optional(),
            fabricante: z.string().optional(),
            modelo: z.string().optional(),
            numeroSerie: z.string().optional(),
            nivelNormal: z.string().optional(),
            nivelAlerta: z.string().optional(),
            nivelCritico: z.string().optional(),
            formula: z.string().optional(),
            unidadeMedida: z.string().optional(),
            limiteInferior: z.string().optional(),
            limiteSuperior: z.string().optional(),
            frequenciaLeitura: z.string().optional(),
            responsavel: z.string().optional(),
            qrCode: z.string().optional(),
            codigoBarras: z.string().optional(),
            status: flexEnum(INSTRUMENTO_STATUS).optional(),
            observacoes: z.string().optional(),
            ativo: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateInstrumento(input.id, input.data as any);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteInstrumento(input.id);
      return { success: true };
    }),
  }),

  // ============================================================================
  // LEITURAS
  // ============================================================================

  leituras: router({
    listByInstrumento: protectedProcedure
      .input(z.object({ instrumentoId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getLeiturasByInstrumento(input.instrumentoId, input.limit);
      }),

    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getLeiturasByBarragem(input.barragemId, input.limit);
      }),

    countByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLeiturasCountByBarragem(input.barragemId);
      }),

    getUltima: protectedProcedure.input(z.object({ instrumentoId: z.number() })).query(async ({ input }) => {
      return await db.getUltimaLeitura(input.instrumentoId);
    }),

    listInconsistencias: protectedProcedure
      .input(z.object({ barragemId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getLeiturasComInconsistencia(input.barragemId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          instrumentoId: z.number(),
          dataHora: z.string(),
          valor: z.string(),
          nivelMontante: z.string().optional(),
          observacoes: z.string().optional(),
          origem: flexEnum(LEITURA_ORIGEM).optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.createLeitura({
          ...input,
          dataHora: new Date(input.dataHora) as any,
          usuarioId: ctx.user.id,
        });
        return { id, success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLeitura(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // CHECKLISTS
  // ============================================================================

  checklists: router({
    list: protectedProcedure
      .input(z.object({ barragemId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.barragemId) {
          return await db.getChecklistsByBarragem(input.barragemId, input.limit);
        }
        return [];
      }),

    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getChecklistsByBarragem(input.barragemId, input.limit);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const checklist = await db.getChecklistById(input.id);
      const respostas = await db.getRespostasByChecklist(input.id);
      return { checklist, respostas };
    }),

    create: protectedProcedure
      .input(
        z.object({
          barragemId: z.number(),
          data: z.string().optional(),
          tipo: flexEnum(CHECKLIST_CREATE_TYPES).optional(),
          observacoesGerais: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const dataValue = input.data && input.data.trim() !== "" 
          ? new Date(input.data) 
          : new Date();
        const tipoValue = input.tipo && input.tipo.trim() !== ""
          ? input.tipo
          : "mensal";
        
        const id = await db.createChecklist({
          barragemId: input.barragemId,
          data: dataValue as any,
          tipo: tipoValue,
          observacoesGerais: input.observacoesGerais || undefined,
          latitude: input.latitude || undefined,
          longitude: input.longitude || undefined,
          usuarioId: ctx.user.id,
        });

        // Notificar HIDRO sobre nova inspeção (não bloqueia se falhar)
        try {
          const { notificarHidroNovaInspecao } = await import("./notificacaoHidro");
          const caracterizacao = await db.getCaracterizacaoByChecklist(id);
          await notificarHidroNovaInspecao(
            id,
            input.barragemId,
            tipoValue,
            dataValue as Date,
            undefined, // inspetor
            "em_andamento", // status
            !!caracterizacao // temCaracterizacao
          );
        } catch (error) {
          // Log mas não quebra o fluxo
          console.error("[Checklist] Erro ao notificar HIDRO:", error);
        }

        return { id, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            tipo: flexEnum(CHECKLIST_TYPES).optional(),
            inspetor: z.string().optional(),
            climaCondicoes: z.string().optional(),
            status: flexEnum(CHECKLIST_STATUS).optional(),
            consultorId: z.string().optional(),
            dataAvaliacao: z.string().optional(),
            comentariosConsultor: z.string().optional(),
            observacoesGerais: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = { ...input.data };
        if (updateData.dataAvaliacao) {
          updateData.dataAvaliacao = new Date(updateData.dataAvaliacao);
        }
        await db.updateChecklist(input.id, updateData);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteChecklist(input.id);
      return { success: true };
    }),

    // Perguntas
    listPerguntas: protectedProcedure
      .input(z.object({ barragemId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getPerguntasChecklist(input.barragemId);
      }),

    createPergunta: adminProcedure
      .input(
        z.object({
          barragemId: z.number().optional(),
          categoria: z.string(),
          pergunta: z.string(),
          ordem: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createPerguntaChecklist(input as any);
        return { id, success: true };
      }),

    // Respostas
    createResposta: protectedProcedure
      .input(
        z.object({
          checklistId: z.number(),
          perguntaId: z.number(),
          resposta: flexEnum(RESPOSTA_OPTIONS),
          situacaoAnterior: flexEnum(RESPOSTA_OPTIONS).optional(),
          comentario: z.string().optional(),
          fotos: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createRespostaChecklist(input as any);
        return { id, success: true };
      }),

    // Caracterização da Barragem
    getCaracterizacao: protectedProcedure
      .input(z.object({ checklistId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaracterizacaoByChecklist(input.checklistId);
      }),

    getCaracterizacaoByBarragem: publicProcedure
      .input(z.object({ barragemId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaracterizacaoByBarragem(input.barragemId);
      }),

    createCaracterizacao: protectedProcedure
      .input(
        z.object({
          checklistId: z.number(),
          barragemId: z.number(),
          areaBaciaHidrografica: z.number().optional(),
          perimetro: z.number().optional(),
          comprimentoRioPrincipal: z.number().optional(),
          comprimentoVetorialRioPrincipal: z.number().optional(),
          comprimentoTotalRioBacia: z.number().optional(),
          altitudeMinimaBacia: z.number().optional(),
          altitudeMaximaBacia: z.number().optional(),
          altitudeAltimetricaBaciaM: z.number().optional(),
          altitudeAltimetricaBaciaKM: z.number().optional(),
          comprimentoAxialBacia: z.number().optional(),
          comprimentoRioPrincipal_L: z.number().optional(),
          declividadeBacia_S: z.number().optional(),
          areaDrenagem_A: z.number().optional(),
          larguraBarragem: z.number().optional(),
          alturaMaciçoPrincipal: z.number().optional(),
          volumeReservatorio: z.number().optional(),
          cargaHidraulicaMaxima: z.number().optional(),
          profundidadeMediaReservatorio: z.number().optional(),
          areaReservatorio: z.number().optional(),
          metodoMedicao: z.string().optional(),
          equipamentoUtilizado: z.string().optional(),
          responsavelMedicao: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createCaracterizacaoBarragem(input as any);
        
        // Sincronizar automaticamente com SGSB-FINAL após criar
        // Nota: A sincronização é opcional e não deve quebrar o fluxo principal
        try {
          const caracterizacao = await db.getCaracterizacaoById(id);
          if (caracterizacao) {
            const { sincronizarCaracterizacaoComHidro } = await import("./notificacaoHidro");
            const sincronizado = await sincronizarCaracterizacaoComHidro(caracterizacao);
            
            // Atualizar flag de sincronização apenas se a sincronização foi bem-sucedida
            if (sincronizado) {
              await db.updateCaracterizacaoBarragem(id, {
                sincronizadoComHidro: true,
                dataSincronizacao: new Date(),
              } as any);
            }
            // Se não sincronizou, não loga erro (a função sincronizarCaracterizacaoComHidro já trata internamente)
          }
        } catch (error: any) {
          // Log apenas se for um erro inesperado (não relacionado à conexão)
          // Erros de conexão já são tratados dentro de sincronizarCaracterizacaoComHidro
          if (error.code !== 'ECONNREFUSED' && error.cause?.code !== 'ECONNREFUSED') {
            console.error("[Caracterização] Erro inesperado ao sincronizar com HIDRO:", error.message || error);
          }
        }
        
        return { id, success: true };
      }),

    updateCaracterizacao: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            areaBaciaHidrografica: z.number().optional(),
            perimetro: z.number().optional(),
            comprimentoRioPrincipal: z.number().optional(),
            comprimentoVetorialRioPrincipal: z.number().optional(),
            comprimentoTotalRioBacia: z.number().optional(),
            altitudeMinimaBacia: z.number().optional(),
            altitudeMaximaBacia: z.number().optional(),
            altitudeAltimetricaBaciaM: z.number().optional(),
            altitudeAltimetricaBaciaKM: z.number().optional(),
            comprimentoAxialBacia: z.number().optional(),
            comprimentoRioPrincipal_L: z.number().optional(),
            declividadeBacia_S: z.number().optional(),
            areaDrenagem_A: z.number().optional(),
            larguraBarragem: z.number().optional(),
            alturaMaciçoPrincipal: z.number().optional(),
            volumeReservatorio: z.number().optional(),
            cargaHidraulicaMaxima: z.number().optional(),
            profundidadeMediaReservatorio: z.number().optional(),
            areaReservatorio: z.number().optional(),
            metodoMedicao: z.string().optional(),
            equipamentoUtilizado: z.string().optional(),
            responsavelMedicao: z.string().optional(),
            // Aceitar null e transformar em string vazia ou undefined
            observacoes: z.string().nullable().optional().transform(val => val ?? ""),
            validado: z.boolean().optional(),
            validadoPor: z.string().nullable().optional().transform(val => val ?? ""),
          }).partial(),
        })
      )
      .mutation(async ({ input }) => {
        // Garantir que observacoes e validadoPor sejam strings vazias ao invés de null
        const updateData: any = { ...input.data };
        if (updateData.observacoes === null) {
          updateData.observacoes = "";
        }
        if (updateData.validadoPor === null) {
          updateData.validadoPor = "";
        }
        await db.updateCaracterizacaoBarragem(input.id, updateData);
        
        // Sincronizar automaticamente com SGSB-FINAL após atualizar
        // Nota: A sincronização é opcional e não deve quebrar o fluxo principal
        try {
          const caracterizacao = await db.getCaracterizacaoById(input.id);
          if (caracterizacao) {
            const { sincronizarCaracterizacaoComHidro } = await import("./notificacaoHidro");
            const sincronizado = await sincronizarCaracterizacaoComHidro(caracterizacao);
            
            // Atualizar flag de sincronização apenas se a sincronização foi bem-sucedida
            if (sincronizado) {
              await db.updateCaracterizacaoBarragem(input.id, {
                sincronizadoComHidro: true,
                dataSincronizacao: new Date(),
              } as any);
            }
            // Se não sincronizou, não loga erro (a função sincronizarCaracterizacaoComHidro já trata internamente)
          }
        } catch (error: any) {
          // Log apenas se for um erro inesperado (não relacionado à conexão)
          // Erros de conexão já são tratados dentro de sincronizarCaracterizacaoComHidro
          if (error.code !== 'ECONNREFUSED' && error.cause?.code !== 'ECONNREFUSED') {
            console.error("[Caracterização] Erro inesperado ao sincronizar com HIDRO:", error.message || error);
          }
        }
        
        return { success: true };
      }),
  }),

  // ============================================================================
  // OCORRÊNCIAS
  // ============================================================================

  ocorrencias: router({
    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), status: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getOcorrenciasByBarragem(input.barragemId, input.status);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getOcorrenciaById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          barragemId: z.number(),
          estruturaId: z.number().optional(),
          estrutura: z.string(),
          relato: z.string(),
          fotos: z.string().optional(),
          severidade: flexEnum(OCORRENCIA_SEVERIDADE).optional(),
          tipo: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.createOcorrencia({
          ...input,
          usuarioRegistroId: ctx.user.id,
          dataHoraRegistro: new Date() as any,
        });
        return { id, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            status: flexEnum(OCORRENCIA_STATUS).optional(),
            severidade: flexEnum(OCORRENCIA_SEVERIDADE).optional(),
            tipo: z.string().optional(),
            usuarioAvaliacaoId: z.string().optional(),
            dataAvaliacao: z.string().optional(),
            comentariosAvaliacao: z.string().optional(),
            dataConclusao: z.string().optional(),
            comentariosConclusao: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = { ...input.data };
        if (updateData.dataAvaliacao) {
          updateData.dataAvaliacao = new Date(updateData.dataAvaliacao);
        }
        if (updateData.dataConclusao) {
          updateData.dataConclusao = new Date(updateData.dataConclusao);
        }
        await db.updateOcorrencia(input.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOcorrencia(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // HIDROMETRIA
  // ============================================================================

  hidrometria: router({
    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getHidrometriaByBarragem(input.barragemId, input.limit);
      }),

    getUltima: protectedProcedure.input(z.object({ barragemId: z.number() })).query(async ({ input }) => {
      return await db.getUltimaHidrometria(input.barragemId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          barragemId: z.number(),
          dataLeitura: z.date(),
          nivelMontante: z.string().optional(),
          nivelJusante: z.string().optional(),
          nivelReservatorio: z.string().optional(),
          vazao: z.string().optional(),
          vazaoAfluente: z.string().optional(),
          vazaoDefluente: z.string().optional(),
          vazaoVertedouro: z.string().optional(),
          volumeReservatorio: z.string().optional(),
          volumeArmazenado: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.createHidrometria({
          ...input,
          dataHora: input.dataLeitura as any,
          usuarioId: ctx.user.id,
        });
        return { id, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            dataLeitura: z.date().optional(),
            nivelMontante: z.string().optional(),
            nivelJusante: z.string().optional(),
            nivelReservatorio: z.string().optional(),
            vazaoAfluente: z.string().optional(),
            vazaoDefluente: z.string().optional(),
            vazaoVertedouro: z.string().optional(),
            volumeArmazenado: z.string().optional(),
            observacoes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateHidrometria(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteHidrometria(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // DOCUMENTOS
  // ============================================================================

  documentos: router({
    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), tipo: z.string().optional() }))
      .query(async ({ input }) => {
        try {
          const documentos = await db.getDocumentosByBarragem(input.barragemId, input.tipo);
          console.log(`[Documentos] Found ${documentos?.length || 0} documentos for barragem ${input.barragemId}`);
          
          // Os documentos já vêm serializados do db.ts, mas vamos garantir
          const cleanDocumentos = (documentos || []).map((doc: any) => {
            const clean: Record<string, any> = {};
            
            // Campos esperados
            const fields = [
              'id', 'barragemId', 'usuarioId', 'tipo', 'categoria', 'titulo', 'descricao',
              'arquivoUrl', 'arquivoNome', 'arquivoTamanho', 'arquivoTipo', 'versao',
              'documentoPaiId', 'dataValidade', 'tags', 'createdAt', 'updatedAt'
            ];
            
            for (const key of fields) {
              const value = doc[key];
              
              // Garantir tipos primitivos apenas
              if (value === null || value === undefined) {
                clean[key] = null;
              } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                clean[key] = value;
              } else {
                // Converter qualquer outro tipo para string ou null
                try {
                  clean[key] = String(value);
                } catch {
                  clean[key] = null;
                }
              }
            }
            
            return clean;
          });
          
          // Forçar serialização JSON padrão e depois parse para garantir que é serializável
          try {
            // Serializar e parse para garantir que todos os valores são JSON-safe
            const jsonString = JSON.stringify(cleanDocumentos);
            const parsed = JSON.parse(jsonString);
            console.log(`[Documentos] Serialization test passed, ${parsed.length} documentos, ${jsonString.length} bytes`);
            return parsed;
          } catch (e: any) {
            console.error('[Documentos] Serialization test failed:', e);
            if (cleanDocumentos.length > 0) {
              console.error('[Documentos] First documento:', Object.keys(cleanDocumentos[0]));
              // Tentar serializar apenas o primeiro para ver qual campo está causando problema
              try {
                JSON.stringify(cleanDocumentos[0]);
              } catch (e2: any) {
                console.error('[Documentos] Problematic field in first doc:', e2.message);
              }
            }
            // Retornar array vazio em vez de erro para não quebrar a aplicação
            return [];
          }
        } catch (error: any) {
          console.error('[Documentos] Error listing documentos:', error);
          throw new Error(`Erro ao listar documentos: ${error.message}`);
        }
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getDocumentoById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          barragemId: z.number(),
          tipo: z.string(),
          categoria: z.string().optional(),
          titulo: z.string(),
          descricao: z.string().optional(),
          arquivoNome: z.string(),
          arquivoTamanho: z.number().optional(),
          arquivoTipo: z.string().optional(),
          arquivoConteudo: z.string().optional(), // Base64 string
          versao: z.string().optional(),
          documentoPaiId: z.number().optional(),
          dataValidade: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log('[Documentos] Creating documento:', { titulo: input.titulo, tipo: input.tipo, barragemId: input.barragemId });
          const id = await db.createDocumento({
            ...input,
            dataValidade: input.dataValidade ? (new Date(input.dataValidade) as any) : undefined,
            usuarioId: ctx.user.id,
          });
          console.log('[Documentos] Documento created with id:', id);
          return { id, success: true };
        } catch (error: any) {
          console.error('[Documentos] Error creating documento:', error);
          throw new Error(`Erro ao criar documento: ${error.message}`);
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            tipo: z.string().optional(),
            categoria: z.string().optional(),
            titulo: z.string().optional(),
            descricao: z.string().optional(),
            versao: z.string().optional(),
            dataValidade: z.string().optional(),
            tags: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = { ...input.data };
        if (updateData.dataValidade) {
          updateData.dataValidade = new Date(updateData.dataValidade);
        }
        await db.updateDocumento(input.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteDocumento(input.id);
      return { success: true };
    }),

    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(),
          contentType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Extrair base64 data
          const base64Data = input.fileData.split(',')[1] || input.fileData;
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Gerar nome único
          const timestamp = Date.now();
          const ext = input.fileName.split('.').pop();
          const key = `documentos/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
          
          // Tentar upload para S3, se falhar, usar data URL direto
          try {
            const { storagePut } = await import('./storage');
            const { url } = await storagePut(key, buffer, input.contentType);
            return { url, key };
          } catch (storageError: any) {
            console.warn('[Documentos] Storage upload failed, using data URL:', storageError.message);
            // Se o storage falhar, retornar a data URL diretamente
            return { url: input.fileData, key: key };
          }
        } catch (error: any) {
          console.error('[Documentos] Upload error:', error);
          throw new Error(`Erro ao fazer upload: ${error.message}`);
        }
      }),
  }),

  // ============================================================================
  // MANUTENÇÕES
  // ============================================================================

  manutencoes: router({
    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), status: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getManutencoesByBarragem(input.barragemId, input.status);
      }),

    create: adminProcedure
      .input(
        z.object({
          barragemId: z.number(),
          estruturaId: z.number().optional(),
          ocorrenciaId: z.number().optional(),
          tipo: flexEnum(MANUTENCAO_TIPO),
          titulo: z.string(),
          descricao: z.string().optional(),
          dataProgramada: z.string().optional(),
          responsavel: z.string().optional(),
          custoEstimado: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createManutencao({
          ...input,
          dataProgramada: input.dataProgramada ? (new Date(input.dataProgramada) as any) : undefined,
        });
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            tipo: flexEnum(MANUTENCAO_TIPO).optional(),
            titulo: z.string().optional(),
            descricao: z.string().optional(),
            dataProgramada: z.string().optional(),
            dataInicio: z.string().optional(),
            dataConclusao: z.string().optional(),
            status: flexEnum(MANUTENCAO_STATUS).optional(),
            responsavel: z.string().optional(),
            custoEstimado: z.string().optional(),
            custoReal: z.string().optional(),
            observacoes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = { ...input.data };
        if (updateData.dataProgramada) {
          updateData.dataProgramada = new Date(updateData.dataProgramada);
        }
        if (updateData.dataInicio) {
          updateData.dataInicio = new Date(updateData.dataInicio);
        }
        if (updateData.dataConclusao) {
          updateData.dataConclusao = new Date(updateData.dataConclusao);
        }
        await db.updateManutencao(input.id, updateData);
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteManutencao(input.id);
      return { success: true };
    }),
  }),

  // ============================================================================
  // ALERTAS
  // ============================================================================

  alertas: router({
    listByBarragem: protectedProcedure
      .input(z.object({ barragemId: z.number(), lido: z.boolean().optional() }))
      .query(async ({ input }) => {
        return await db.getAlertasByBarragem(input.barragemId, input.lido);
      }),

    marcarLido: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.marcarAlertaComoLido(input.id);
      return { success: true };
    }),
  }),

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  dashboard: router({
    getData: protectedProcedure.input(z.object({ barragemId: z.number() })).query(async ({ input }) => {
      return await db.getDashboardData(input.barragemId);
    }),
  }),
});

export type AppRouter = typeof appRouter;

