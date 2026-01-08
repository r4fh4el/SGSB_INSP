import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Calendar, Calculator, AlertCircle, CheckCircle2, Clock, BarChart3, TrendingUp, RefreshCw, AlertTriangle, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// URL da API do SGSB-WEB (SGSB-FINAL) - ajustar conforme necessário
const SGSB_FINAL_API_URL = import.meta.env.VITE_SGSB_FINAL_API_URL || "http://localhost:5204";
// URL da API do SGSB-ALERTA - ajustar conforme necessário
const SGSB_ALERTA_API_URL = import.meta.env.VITE_SGSB_ALERTA_API_URL || "http://localhost:61400";

interface CalculosResultados {
  tempoConcentracao?: {
    resultados: {
      kirpich: number;
      corpsEngineers: number;
      carter: number;
      dooge: number;
      venTeChow: number;
    };
    grafico?: Array<{ metodo: string; tempo: number }>;
  };
  indiceCaracterizacao?: {
    resultados: {
      indiceCircularidade: number;
      fatorForma: number;
      coeficienteCompacidade: number;
      densidadeDrenagem: number;
      coeficienteManutencao: number;
      gradienteCanais: number;
      relacaoRelevo: number;
      indiceRugosidade: number;
      sinuosidadeCursoDagua: number;
    };
    grafico?: Array<{ nome: string; valor: number }>;
  };
  vazaoPico?: {
    resultados: {
      lou: number;
      saintVenant: number;
      usbr1982: number;
      soilConservationService: number;
      kirkpatrick: number;
      froehlich: number;
      institutionCivilEngineers: number;
      evans: number;
      costa: number;
      webby: number;
      usbr1989: number;
      lemperiere: number;
      espanhaMinisterioMedioAmbiente: number;
      singhSnorrason: number;
    };
    grafico?: Array<{ metodo: string; vazao: number }>;
  };
}

interface NivelAlerta {
  nivel: 1 | 2 | 3 | 4;
  nome: string;
  cor: string;
  descricao: string;
  vazaoMedia: number;
  vazaoMinima: number;
  vazaoMaxima: number;
}

export default function CalculoAutomatico() {
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  const [calculosResultados, setCalculosResultados] = useState<CalculosResultados | null>(null);
  const [loadingCalculos, setLoadingCalculos] = useState(false);
  const [erroConexao, setErroConexao] = useState<string | null>(null);
  const [statusConexao, setStatusConexao] = useState<{
    url: string;
    status: 'conectado' | 'erro' | 'verificando' | 'desconectado';
    ultimaVerificacao?: Date;
    mensagem?: string;
  } | null>(null);

  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: checklists } = trpc.checklists.list.useQuery(
    { barragemId: selectedBarragem! },
    { enabled: !!selectedBarragem }
  );

  // Verificar status da conexão com SGSB-WEB
  const verificarConexao = async () => {
    setStatusConexao({
      url: SGSB_FINAL_API_URL,
      status: 'verificando'
    });

    try {
      // Tentar acessar o endpoint de health ou swagger
      const response = await fetch(`${SGSB_FINAL_API_URL}/swagger/index.html`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      setStatusConexao({
        url: SGSB_FINAL_API_URL,
        status: 'conectado',
        ultimaVerificacao: new Date(),
        mensagem: 'Conexão estabelecida com sucesso'
      });
      setErroConexao(null);
    } catch (error: any) {
      setStatusConexao({
        url: SGSB_FINAL_API_URL,
        status: 'erro',
        ultimaVerificacao: new Date(),
        mensagem: error.message || 'Erro ao conectar com SGSB-WEB'
      });
      setErroConexao(error.message || 'Erro ao conectar com SGSB-WEB');
    }
  };

  // Buscar resultados dos cálculos do SGSB-WEB
  const buscarCalculos = async () => {
    if (!selectedBarragem) return;

    setLoadingCalculos(true);
    setErroConexao(null);
    setStatusConexao({
      url: SGSB_FINAL_API_URL,
      status: 'verificando',
      mensagem: 'Buscando dados...'
    });

    try {
      const url = `${SGSB_FINAL_API_URL}/API/BuscarCalculosAutomaticosPorBarragem?barragemId=${selectedBarragem}`;
      console.log("[CalculoAutomatico] Tentando buscar de:", url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[CalculoAutomatico] Dados recebidos do SGSB-WEB:", data);
        setCalculosResultados(data);
        setErroConexao(null);
        setStatusConexao({
          url: SGSB_FINAL_API_URL,
          status: 'conectado',
          ultimaVerificacao: new Date(),
          mensagem: 'Dados recebidos com sucesso'
        });
        
        // Verificar se há dados válidos
        const temDados = data?.indiceCaracterizacao || data?.tempoConcentracao || data?.vazaoPico;
        if (temDados) {
          toast.success("Cálculos atualizados com sucesso!");
        } else {
          console.warn("[CalculoAutomatico] Dados recebidos mas vazios, usando cálculo local");
          setStatusConexao({
            url: SGSB_FINAL_API_URL,
            status: 'conectado',
            ultimaVerificacao: new Date(),
            mensagem: 'Conexão OK, mas sem dados calculados. Usando cálculo local.'
          });
        }
      } else {
        const errorText = await response.text();
        console.warn("Não foi possível buscar cálculos do SGSB-WEB:", response.status, errorText);
        setErroConexao(`Erro ${response.status}: ${errorText.substring(0, 100)}`);
        setStatusConexao({
          url: SGSB_FINAL_API_URL,
          status: 'erro',
          ultimaVerificacao: new Date(),
          mensagem: `Erro HTTP ${response.status}: ${errorText.substring(0, 50)}`
        });
      }
    } catch (error: any) {
      console.warn("Erro ao buscar cálculos:", error);
      const mensagemErro = error.message || 'Erro de conexão';
      setErroConexao(mensagemErro);
      setStatusConexao({
        url: SGSB_FINAL_API_URL,
        status: 'erro',
        ultimaVerificacao: new Date(),
        mensagem: mensagemErro
      });
    } finally {
      setLoadingCalculos(false);
    }
  };

  // Verificar conexão ao montar componente
  useEffect(() => {
    verificarConexao();
  }, []);

  // Buscar cálculos quando barragem mudar
  useEffect(() => {
    if (selectedBarragem) {
      buscarCalculos();
    }
  }, [selectedBarragem]);

  // Funções de cálculo (mesmas fórmulas do HIDRO)
  const calcularIndiceBH = (caracterizacao: any) => {
    if (!caracterizacao) return null;

    const A = caracterizacao.areaBaciaHidrografica || 0;
    const P = caracterizacao.perimetro || 0;
    const Lc = caracterizacao.comprimentoRioPrincipal || 0;
    const Lv = caracterizacao.comprimentoVetorialRioPrincipal || 0;
    const Lt = caracterizacao.comprimentoTotalRioBacia || 0;
    const Amin = caracterizacao.altitudeMinimaBacia || 0;
    const Amax = caracterizacao.altitudeMaximaBacia || 0;
    const Hm = caracterizacao.altitudeAltimetricaBaciaM || 0;
    const HmKm = caracterizacao.altitudeAltimetricaBaciaKM || 0;
    const L = caracterizacao.comprimentoAxialBacia || 0;

    if (A === 0 || P === 0) return null;

    return {
      indiceCircularidade: P > 0 ? 12.57 * (A / Math.pow(P, 2)) : 0,
      fatorForma: L > 0 ? P / Math.pow(L, 2) : 0,
      coeficienteCompacidade: A > 0 ? 0.28 * (P / Math.sqrt(A)) : 0,
      densidadeDrenagem: A > 0 ? Lt / A : 0,
      coeficienteManutencao: Lt > 0 ? A / Lt : 0,
      gradienteCanais: Lc > 0 ? (Amax / (Lc * 1000)) * 100 : 0,
      relacaoRelevo: Lc > 0 ? Amax / Lc : 0,
      indiceRugosidade: Hm / 1000,
      sinuosidadeCurso: Lv > 0 ? Lc / Lv : 0,
    };
  };

  const calcularTempoConcentracao = (caracterizacao: any) => {
    if (!caracterizacao) {
      console.log("[calcularTempoConcentracao] Caracterização não existe");
      return null;
    }

    // Tentar diferentes campos possíveis - verificar todos os nomes possíveis
    const L = caracterizacao.comprimentoRioPrincipal_L || 
              caracterizacao.comprimentoRioPrincipal_L ||
              caracterizacao.comprimentoRioPrincipal || 
              caracterizacao.comprimentoRioPrincipal ||
              0;
    const S = caracterizacao.declividadeBacia_S || 
              caracterizacao.declividadeBacia_S ||
              caracterizacao.declividadeBacia || 
              caracterizacao.declividade ||
              0;
    const A = caracterizacao.areaDrenagem_A || 
              caracterizacao.areaDrenagem_A ||
              caracterizacao.areaDrenagem ||
              caracterizacao.areaBaciaHidrografica || 
              0;

    console.log("[calcularTempoConcentracao] Valores encontrados:", { 
      L, 
      S, 
      A,
      camposDisponiveis: {
        comprimentoRioPrincipal_L: caracterizacao.comprimentoRioPrincipal_L,
        comprimentoRioPrincipal: caracterizacao.comprimentoRioPrincipal,
        declividadeBacia_S: caracterizacao.declividadeBacia_S,
        declividadeBacia: caracterizacao.declividadeBacia,
        areaDrenagem_A: caracterizacao.areaDrenagem_A,
        areaDrenagem: caracterizacao.areaDrenagem,
        areaBaciaHidrografica: caracterizacao.areaBaciaHidrografica,
      }
    });

    // SEMPRE retornar um objeto, mesmo que os valores sejam 0
    // Isso permite que a tabela seja exibida com mensagem de dados insuficientes
    const resultado = {
      kirpch: S > 0 && L > 0 ? 0.0663 * Math.pow(L, 0.77) * Math.pow(S, -0.385) : 0,
      corpsEngineers: S > 0 && L > 0 ? 0.191 * Math.pow(L, 0.76) * Math.pow(S, -0.19) : 0,
      carter: S > 0 && L > 0 ? 0.0977 * Math.pow(L, 0.6) * Math.pow(S, -0.3) : 0,
      dooge: S > 0 && A > 0 ? 0.365 * Math.pow(A, 0.41) * Math.pow(S, -0.17) : 0,
      venteChow: S > 0 && L > 0 ? 0.160 * Math.pow(L, 0.64) * Math.pow(S, -0.32) : 0,
      temDadosSuficientes: L > 0 && S > 0, // Flag para saber se tem dados suficientes
    };
    
    console.log("[calcularTempoConcentracao] Resultado calculado:", resultado);
    return resultado;
  };

  const calcularVazaoPico = (caracterizacao: any) => {
    if (!caracterizacao) return null;

    const Bd = caracterizacao.larguraBarragem || 0;
    const Hbarr = caracterizacao.alturaMaciçoPrincipal || 0;
    const Vhid = caracterizacao.volumeReservatorio || 0;
    const Hhid = caracterizacao.cargaHidraulicaMaxima || 0;
    const Ymed = caracterizacao.profundidadeMediaReservatorio || 0;
    const As = caracterizacao.areaReservatorio || 0;

    console.log("[calcularVazaoPico] Valores encontrados:", { 
      Bd, Hbarr, Vhid, Hhid, Ymed, As,
      camposDisponiveis: {
        larguraBarragem: caracterizacao.larguraBarragem,
        alturaMaciçoPrincipal: caracterizacao.alturaMaciçoPrincipal,
        volumeReservatorio: caracterizacao.volumeReservatorio,
        cargaHidraulicaMaxima: caracterizacao.cargaHidraulicaMaxima,
        profundidadeMediaReservatorio: caracterizacao.profundidadeMediaReservatorio,
        areaReservatorio: caracterizacao.areaReservatorio,
      }
    });

    // SEMPRE retornar um objeto, mesmo que os valores sejam 0
    // Isso permite que a tabela seja exibida com mensagem de dados insuficientes
    return {
      lou: Hhid > 0 ? 7.683 * Math.pow(Hhid, 1.909) : 0,
      saintVenant: Ymed > 0 && Bd > 0 ? 0.296 * Bd * Math.sqrt(9.8 * Math.pow(Ymed, 1.5)) : 0,
      usbr1982: Hhid > 0 ? 19 * Math.pow(Hhid, 1.85) : 0,
      soilConservationService: Hhid > 0 ? 16.6 * Math.pow(Hhid, 1.85) : 0,
      kirkpatrick: Hhid > 0 ? 1.268 * Math.pow(Hhid + 0.3, 2.5) : 0,
      froehlich: Vhid > 0 && Hhid > 0 ? 0.607 * 0.934 * Math.pow(Vhid, 0.295) * Math.pow(Hhid, 1.24) : 0,
      institutionCivilEngineers: Hhid > 0 ? 1.3 * Math.pow(Hhid, 2.5) : 0,
      evans: Vhid > 0 ? 0.72 * Math.pow(Vhid, 0.53) : 0,
      costa: Vhid > 0 && Hhid > 0 ? 0.763 * Math.pow(Vhid * Hhid, 0.42) : 0,
      webby: Hhid > 0 && Vhid > 0 ? 0.0443 * Math.sqrt(9.8) * Math.pow(Hhid, 1.4) * Math.pow(Vhid, 0.367) : 0,
      usbr1989: Hbarr > 0 && Vhid > 0 ? 6.14 * Math.pow(Hbarr, 1.81) * Math.pow(Vhid, 0.061) : 0,
      lemperiere: Hhid > 0 && Vhid > 0 ? Math.pow(Hhid, 0.5) * (Math.pow(Hhid, 2) + 0.1 * Math.pow(Vhid, 0.5)) : 0,
      espanhaMinisterioMedioAmbiente: Hbarr > 0 && Vhid > 0 ? 0.78 * Math.sqrt(Hbarr * Vhid) : 0,
      singhSnorrason: Hbarr > 0 ? 13.4 * Math.pow(Hbarr, 1.89) : 0,
      temDadosSuficientes: Hhid > 0, // Flag para saber se tem dados suficientes
    };
  };

  // Função para calcular o nível de alerta baseado nos resultados de vazão de pico
  const calcularNivelAlerta = (vazaoPico: any): NivelAlerta | null => {
    if (!vazaoPico || !vazaoPico.temDadosSuficientes) return null;

    // Coletar todos os valores de vazão válidos (maiores que zero)
    const vazoes = [
      vazaoPico.lou,
      vazaoPico.saintVenant,
      vazaoPico.usbr1982,
      vazaoPico.soilConservationService,
      vazaoPico.kirkpatrick,
      vazaoPico.froehlich,
      vazaoPico.institutionCivilEngineers,
      vazaoPico.evans,
      vazaoPico.costa,
      vazaoPico.webby,
      vazaoPico.usbr1989,
      vazaoPico.lemperiere,
      vazaoPico.espanhaMinisterioMedioAmbiente,
      vazaoPico.singhSnorrason,
    ].filter(v => v > 0);

    if (vazoes.length === 0) return null;

    // Calcular estatísticas
    const vazaoMinima = Math.min(...vazoes);
    const vazaoMaxima = Math.max(...vazoes);
    const vazaoMedia = vazoes.reduce((a, b) => a + b, 0) / vazoes.length;
    
    // Calcular mediana para melhor representação
    const vazoesOrdenadas = [...vazoes].sort((a, b) => a - b);
    const mediana = vazoesOrdenadas.length % 2 === 0
      ? (vazoesOrdenadas[vazoesOrdenadas.length / 2 - 1] + vazoesOrdenadas[vazoesOrdenadas.length / 2]) / 2
      : vazoesOrdenadas[Math.floor(vazoesOrdenadas.length / 2)];

    // Usar mediana como valor de referência para o nível de alerta
    const valorReferencia = mediana;

    // Definir thresholds (em m³/s) - ajustar conforme necessário
    // Nível 1 (Baixo): < 100 m³/s
    // Nível 2 (Médio): 100 - 500 m³/s
    // Nível 3 (Alto): 500 - 2000 m³/s
    // Nível 4 (Crítico): > 2000 m³/s
    let nivel: 1 | 2 | 3 | 4;
    let nome: string;
    let cor: string;
    let descricao: string;

    if (valorReferencia < 100) {
      nivel = 1;
      nome = "Baixo";
      cor = "bg-green-500";
      descricao = "Vazão de pico dentro dos parâmetros normais. Monitoramento de rotina.";
    } else if (valorReferencia < 500) {
      nivel = 2;
      nome = "Médio";
      cor = "bg-yellow-500";
      descricao = "Vazão de pico moderada. Atenção aumentada recomendada.";
    } else if (valorReferencia < 2000) {
      nivel = 3;
      nome = "Alto";
      cor = "bg-orange-500";
      descricao = "Vazão de pico elevada. Ações preventivas necessárias.";
    } else {
      nivel = 4;
      nome = "Crítico";
      cor = "bg-red-500";
      descricao = "Vazão de pico muito elevada. Ação imediata requerida.";
    }

    return {
      nivel,
      nome,
      cor,
      descricao,
      vazaoMedia,
      vazaoMinima,
      vazaoMaxima,
    };
  };

  // Função para enviar alerta para SGSB-ALERTA
  const enviarAlerta = async (barragemId: number, nivelAlerta: NivelAlerta, vazaoPico: any, barragemNome?: string) => {
    try {
      const titulo = `Alerta de Vazão de Pico - Nível ${nivelAlerta.nivel} (${nivelAlerta.nome})`;
      const descricao = `${nivelAlerta.descricao}\n\n` +
        `Barragem: ${barragemNome || `ID ${barragemId}`}\n` +
        `Vazão Média: ${nivelAlerta.vazaoMedia.toFixed(2)} m³/s\n` +
        `Vazão Mínima: ${nivelAlerta.vazaoMinima.toFixed(2)} m³/s\n` +
        `Vazão Máxima: ${nivelAlerta.vazaoMaxima.toFixed(2)} m³/s\n\n` +
        `Resultados por Método:\n` +
        `- Lou: ${vazaoPico.lou.toFixed(2)} m³/s\n` +
        `- Saint-Venant: ${vazaoPico.saintVenant.toFixed(2)} m³/s\n` +
        `- USBR 1982: ${vazaoPico.usbr1982.toFixed(2)} m³/s\n` +
        `- Soil Conservation Service: ${vazaoPico.soilConservationService.toFixed(2)} m³/s\n` +
        `- Kirkpatrick: ${vazaoPico.kirkpatrick.toFixed(2)} m³/s\n` +
        `- Froehlich: ${vazaoPico.froehlich.toFixed(2)} m³/s\n` +
        `- Institution of Civil Engineers: ${vazaoPico.institutionCivilEngineers.toFixed(2)} m³/s\n` +
        `- Evans: ${vazaoPico.evans.toFixed(2)} m³/s\n` +
        `- Costa: ${vazaoPico.costa.toFixed(2)} m³/s\n` +
        `- Webby: ${vazaoPico.webby.toFixed(2)} m³/s\n` +
        `- USBR 1989: ${vazaoPico.usbr1989.toFixed(2)} m³/s\n` +
        `- Lemperière: ${vazaoPico.lemperiere.toFixed(2)} m³/s\n` +
        `- Espanha - Ministerio: ${vazaoPico.espanhaMinisterioMedioAmbiente.toFixed(2)} m³/s\n` +
        `- Singh e Snorrason: ${vazaoPico.singhSnorrason.toFixed(2)} m³/s`;

      const response = await fetch(`${SGSB_ALERTA_API_URL}/notificacao/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IdBarragem: barragemId,
          Titulo: titulo,
          Descricao: descricao,
        }),
      });

      if (response.ok) {
        toast.success(`Alerta de nível ${nivelAlerta.nivel} enviado com sucesso para o SGSB-ALERTA!`);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Erro ao enviar alerta:", response.status, errorText);
        toast.error(`Erro ao enviar alerta: ${response.status} - ${errorText.substring(0, 100)}`);
        return false;
      }
    } catch (error: any) {
      console.error("Erro ao enviar alerta:", error);
      toast.error(`Erro ao enviar alerta: ${error.message || 'Erro de conexão'}`);
      return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cálculo Automático</h1>
            <p className="text-muted-foreground mt-2">
              Cálculos hidrológicos automáticos baseados na caracterização das inspeções e leituras de instrumentação
            </p>
          </div>
          {selectedBarragem && (
            <Button onClick={buscarCalculos} disabled={loadingCalculos} variant="outline" size="lg">
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingCalculos ? "animate-spin" : ""}`} />
              {loadingCalculos ? "Atualizando..." : "Atualizar Cálculos"}
            </Button>
          )}
        </div>

        {/* Status de Conexão com SGSB-WEB */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${
                statusConexao?.status === 'conectado' ? 'text-green-500' : 
                statusConexao?.status === 'erro' ? 'text-red-500' : 
                'text-yellow-500'
              }`} />
              Status de Conexão com SGSB-WEB
            </CardTitle>
            <CardDescription>
              Diagnóstico da comunicação com o sistema de cálculos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">URL do SGSB-WEB</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {SGSB_FINAL_API_URL || 'Não configurado'}
                      </code>
                    </TableCell>
                    <TableCell>
                      {!SGSB_FINAL_API_URL && (
                        <span className="text-red-500 text-sm">
                          Configure VITE_SGSB_FINAL_API_URL no .env
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Status da Conexão</TableCell>
                    <TableCell>
                      <Badge variant={
                        statusConexao?.status === 'conectado' ? 'default' :
                        statusConexao?.status === 'erro' ? 'destructive' :
                        'secondary'
                      }>
                        {statusConexao?.status === 'conectado' ? '✓ Conectado' :
                         statusConexao?.status === 'erro' ? '✗ Erro' :
                         statusConexao?.status === 'verificando' ? '⏳ Verificando...' :
                         '○ Desconectado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {statusConexao?.mensagem || 'Não verificado'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Última Verificação</TableCell>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground">
                      {statusConexao?.ultimaVerificacao 
                        ? format(statusConexao.ultimaVerificacao, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
                        : 'Nunca'}
                    </TableCell>
                  </TableRow>
                  {erroConexao && (
                    <TableRow>
                      <TableCell className="font-medium text-red-500">Erro</TableCell>
                      <TableCell colSpan={2} className="text-sm text-red-500">
                        {erroConexao}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">Dados Recebidos</TableCell>
                    <TableCell colSpan={2}>
                      {calculosResultados ? (
                        <div className="text-sm space-y-1">
                          <div>✓ Índice Caracterização: {calculosResultados.indiceCaracterizacao ? 'Sim' : 'Não'}</div>
                          <div>✓ Tempo Concentração: {calculosResultados.tempoConcentracao ? 'Sim' : 'Não'}</div>
                          <div>✓ Vazão Pico: {calculosResultados.vazaoPico ? 'Sim' : 'Não'}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nenhum dado recebido ainda</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={verificarConexao} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Conexão
              </Button>
              {selectedBarragem && (
                <Button onClick={buscarCalculos} disabled={loadingCalculos} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingCalculos ? 'animate-spin' : ''}`} />
                  {loadingCalculos ? 'Buscando...' : 'Buscar Cálculos'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seletor de Barragem */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione uma Barragem</CardTitle>
            <CardDescription>
              Escolha a barragem para visualizar os cálculos automáticos das inspeções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBarragem?.toString() || ""}
              onValueChange={(value) => setSelectedBarragem(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma barragem" />
              </SelectTrigger>
              <SelectContent>
                {barragens?.map((barragem: { id: number; nome: string }) => (
                  <SelectItem key={barragem.id} value={barragem.id.toString()}>
                    {barragem.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Lista de Inspeções com Cálculos */}
        {selectedBarragem && checklists && (
          <div className="space-y-4">
            {checklists.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    Nenhuma inspeção encontrada para esta barragem.
                  </div>
                </CardContent>
              </Card>
            ) : (
              checklists.map((checklist: any) => (
                <CalculoInspecaoCard
                  key={checklist.id}
                  checklist={checklist}
                  calcularIndiceBH={calcularIndiceBH}
                  calcularTempoConcentracao={calcularTempoConcentracao}
                  calcularVazaoPico={calcularVazaoPico}
                  calculosResultados={calculosResultados}
                  calcularNivelAlerta={calcularNivelAlerta}
                  enviarAlerta={enviarAlerta}
                  selectedBarragem={selectedBarragem}
                  barragens={barragens}
                />
              ))
            )}
          </div>
        )}

        {!selectedBarragem && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Selecione uma barragem para visualizar os cálculos automáticos.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function CalculoInspecaoCard({
  checklist,
  calcularIndiceBH,
  calcularTempoConcentracao,
  calcularVazaoPico,
  calculosResultados,
  calcularNivelAlerta,
  enviarAlerta,
  selectedBarragem,
  barragens,
}: {
  checklist: any;
  calcularIndiceBH: (caracterizacao: any) => any;
  calcularTempoConcentracao: (caracterizacao: any) => any;
  calcularVazaoPico: (caracterizacao: any) => any;
  calculosResultados: CalculosResultados | null;
  calcularNivelAlerta: (vazaoPico: any) => NivelAlerta | null;
  enviarAlerta: (barragemId: number, nivelAlerta: NivelAlerta, vazaoPico: any, barragemNome?: string) => Promise<boolean>;
  selectedBarragem: number | null;
  barragens?: Array<{ id: number; nome: string }>;
}) {
  const { data: caracterizacao } = trpc.checklists.getCaracterizacao.useQuery(
    { checklistId: checklist.id },
    { enabled: !!checklist.id }
  );

  // Debug: log dos dados recebidos
  useEffect(() => {
    if (caracterizacao) {
      console.log("[CalculoInspecaoCard] Caracterização carregada:", caracterizacao);
      console.log("[CalculoInspecaoCard] Campos de Tempo de Concentração:", {
        comprimentoRioPrincipal_L: caracterizacao.comprimentoRioPrincipal_L,
        comprimentoRioPrincipal: caracterizacao.comprimentoRioPrincipal,
        declividadeBacia_S: caracterizacao.declividadeBacia_S,
        declividadeBacia: caracterizacao.declividadeBacia,
        areaDrenagem_A: caracterizacao.areaDrenagem_A,
        areaDrenagem: caracterizacao.areaDrenagem,
        areaBaciaHidrografica: caracterizacao.areaBaciaHidrografica,
      });
    }
    if (calculosResultados) {
      console.log("[CalculoInspecaoCard] Cálculos do SGSB-WEB:", calculosResultados);
    }
  }, [caracterizacao, calculosResultados]);

  // Usar dados do SGSB-WEB se disponíveis e válidos, caso contrário calcular localmente
  // Verificar se os dados do SGSB-WEB têm valores válidos (não são todos zero)
  const temIndicesValidos = calculosResultados?.indiceCaracterizacao?.resultados && 
    (calculosResultados.indiceCaracterizacao.resultados.indiceCircularidade > 0 ||
     calculosResultados.indiceCaracterizacao.resultados.fatorForma > 0 ||
     calculosResultados.indiceCaracterizacao.resultados.coeficienteCompacidade > 0);

  const indicesBH = temIndicesValidos
    ? {
        indiceCircularidade: calculosResultados.indiceCaracterizacao.resultados.indiceCircularidade,
        fatorForma: calculosResultados.indiceCaracterizacao.resultados.fatorForma,
        coeficienteCompacidade: calculosResultados.indiceCaracterizacao.resultados.coeficienteCompacidade,
        densidadeDrenagem: calculosResultados.indiceCaracterizacao.resultados.densidadeDrenagem,
        coeficienteManutencao: calculosResultados.indiceCaracterizacao.resultados.coeficienteManutencao,
        gradienteCanais: calculosResultados.indiceCaracterizacao.resultados.gradienteCanais,
        relacaoRelevo: calculosResultados.indiceCaracterizacao.resultados.relacaoRelevo,
        indiceRugosidade: calculosResultados.indiceCaracterizacao.resultados.indiceRugosidade,
        sinuosidadeCurso: calculosResultados.indiceCaracterizacao.resultados.sinuosidadeCursoDagua,
      }
    : (caracterizacao ? calcularIndiceBH(caracterizacao) : null);

  // Verificar se os dados de tempo de concentração são válidos
  const temTempoValido = calculosResultados?.tempoConcentracao?.resultados &&
    (calculosResultados.tempoConcentracao.resultados.kirpich > 0 ||
     calculosResultados.tempoConcentracao.resultados.corpsEngineers > 0 ||
     calculosResultados.tempoConcentracao.resultados.carter > 0);

  // Calcular tempo de concentração - sempre tentar calcular se houver caracterização
  const tempoConcCalculado = caracterizacao ? calcularTempoConcentracao(caracterizacao) : null;
  
  // Usar dados do SGSB-WEB se disponíveis, senão usar cálculo local (mesmo que seja 0)
  const tempoConc = temTempoValido
    ? {
        kirpch: calculosResultados.tempoConcentracao.resultados.kirpich,
        corpsEngineers: calculosResultados.tempoConcentracao.resultados.corpsEngineers,
        carter: calculosResultados.tempoConcentracao.resultados.carter,
        dooge: calculosResultados.tempoConcentracao.resultados.dooge,
        venteChow: calculosResultados.tempoConcentracao.resultados.venTeChow,
        temDadosSuficientes: true,
      }
    : tempoConcCalculado; // Sempre retornar o objeto, mesmo que valores sejam 0

  // Verificar se os dados de vazão de pico são válidos
  const temVazaoValida = calculosResultados?.vazaoPico?.resultados &&
    (calculosResultados.vazaoPico.resultados.lou > 0 ||
     calculosResultados.vazaoPico.resultados.usbr1982 > 0);

  // Calcular vazão de pico - sempre tentar calcular se houver caracterização
  const vazaoPicoCalculada = caracterizacao ? calcularVazaoPico(caracterizacao) : null;

  // Usar dados do SGSB-WEB se disponíveis, senão usar cálculo local (mesmo que seja 0)
  const vazaoPico = temVazaoValida
    ? { ...calculosResultados.vazaoPico.resultados, temDadosSuficientes: true }
    : vazaoPicoCalculada; // Sempre retornar o objeto, mesmo que valores sejam 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Inspeção #{checklist.id}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span>
                {checklist.data
                  ? format(new Date(checklist.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Data não informada"}
                {" • "}
                Tipo: {checklist.tipo || "mensal"}
              </span>
              {calculosResultados && (calculosResultados.indiceCaracterizacao || calculosResultados.tempoConcentracao) && (
                <Badge variant="outline">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Calculado Automaticamente
                </Badge>
              )}
            </CardDescription>
          </div>
          <Badge variant={caracterizacao ? "default" : "secondary"}>
            {caracterizacao ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Com Caracterização
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Sem Caracterização
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!caracterizacao ? (
          <div className="text-center text-muted-foreground py-8">
            Esta inspeção não possui caracterização da barragem.
            <br />
            <span className="text-sm">
              Adicione a caracterização na página de "Caracterização" para ver os cálculos automáticos.
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Debug info - remover em produção */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                Debug: caracterizacao={caracterizacao ? 'sim' : 'não'}, 
                indicesBH={indicesBH ? 'sim' : 'não'}, 
                tempoConc={tempoConc ? 'sim' : 'não'}, 
                vazaoPico={vazaoPico ? 'sim' : 'não'},
                calculosResultados={calculosResultados ? 'sim' : 'não'},
                areaBacia={caracterizacao?.areaBaciaHidrografica || 0},
                perimetro={caracterizacao?.perimetro || 0}
              </div>
            )}
            
            {/* Mensagem quando não há dados para calcular */}
            {!indicesBH && !tempoConc && !vazaoPico && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium mb-2">Não há dados suficientes para calcular</p>
                    <p className="text-sm">
                      Certifique-se de que a caracterização possui os dados necessários:
                      <br />
                      • Para Índice de Caracterização: área da bacia e perímetro
                      <br />
                      • Para Tempo de Concentração: comprimento do rio principal e declividade
                      <br />
                      • Para Vazão de Pico: carga hidráulica máxima
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Índice de Caracterização de Bacia Hidrográfica */}
            {indicesBH && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Índice de Caracterização de Bacia Hidrográfica
                  </CardTitle>
                  <CardDescription>
                    Índices calculados automaticamente (adimensionais)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gráfico de Barras */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Gráfico Comparativo dos Índices</Label>
                    <ChartContainer
                      config={{
                        indiceCircularidade: { label: "Índice Circularidade", color: "hsl(var(--chart-1))" },
                        fatorForma: { label: "Fator Forma", color: "hsl(var(--chart-2))" },
                        coeficienteCompacidade: { label: "Coef. Compacidade", color: "hsl(var(--chart-3))" },
                        densidadeDrenagem: { label: "Densidade Drenagem", color: "hsl(var(--chart-4))" },
                        coeficienteManutencao: { label: "Coef. Manutenção", color: "hsl(var(--chart-5))" },
                        gradienteCanais: { label: "Gradiente Canais", color: "hsl(var(--chart-1))" },
                        relacaoRelevo: { label: "Relação Relevo", color: "hsl(var(--chart-2))" },
                        indiceRugosidade: { label: "Índice Rugosidade", color: "hsl(var(--chart-3))" },
                        sinuosidadeCursoDagua: { label: "Sinuosidade", color: "hsl(var(--chart-4))" },
                      }}
                      className="h-[400px]"
                    >
                      <BarChart data={[
                        { nome: "Índice Circularidade", valor: indicesBH.indiceCircularidade },
                        { nome: "Fator Forma", valor: indicesBH.fatorForma },
                        { nome: "Coef. Compacidade", valor: indicesBH.coeficienteCompacidade },
                        { nome: "Densidade Drenagem", valor: indicesBH.densidadeDrenagem },
                        { nome: "Coef. Manutenção", valor: indicesBH.coeficienteManutencao },
                        { nome: "Gradiente Canais", valor: indicesBH.gradienteCanais },
                        { nome: "Relação Relevo", valor: indicesBH.relacaoRelevo },
                        { nome: "Índice Rugosidade", valor: indicesBH.indiceRugosidade },
                        { nome: "Sinuosidade", valor: indicesBH.sinuosidadeCurso },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="nome" 
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          tick={{ fontSize: 9 }}
                        />
                        <YAxis label={{ value: "Valor", angle: -90, position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="valor" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>

                  {/* Tabela de Resultados */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Tabela de Resultados dos Índices</Label>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Índice</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead>Autor</TableHead>
                            <TableHead>Descrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Índice de Circularidade (Ic)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.indiceCircularidade.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Miller (1953)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Mede a forma circular da bacia hidrográfica</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Fator de Forma (F)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.fatorForma.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Horton (1945)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Razão entre a largura média e o comprimento axial da bacia</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Coeficiente de Compacidade (Kc)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.coeficienteCompacidade.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Lima (1969)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Relação entre o perímetro da bacia e o perímetro de um círculo de mesma área</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Densidade de Drenagem (Dd)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.densidadeDrenagem.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Horton (1945)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Razão entre o comprimento total dos rios e a área da bacia</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Coeficiente de Manutenção (Cm)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.coeficienteManutencao.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Inverso da densidade de drenagem</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Gradiente de Canais (Gc)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.gradienteCanais.toFixed(4)}</TableCell>
                            <TableCell>%</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Gradiente médio dos canais da bacia</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Relação de Relevo (Rr)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.relacaoRelevo.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Christofoletti (1969)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Relação entre a amplitude altimétrica e o comprimento do rio principal</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Índice de Rugosidade (IR)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.indiceRugosidade.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Christofoletti (1969)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Mede a rugosidade do relevo da bacia</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Sinuosidade do Curso d'água (S)</TableCell>
                            <TableCell className="text-right font-mono">{indicesBH.sinuosidadeCurso.toFixed(4)}</TableCell>
                            <TableCell>Adimensional</TableCell>
                            <TableCell>Schumm (1963)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Razão entre o comprimento real e o comprimento vetorial do rio principal</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tempo de Concentração */}
            {tempoConc && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tempo de Concentração
                  </CardTitle>
                  <CardDescription>
                    Resultados calculados automaticamente (em horas)
                    {tempoConc.temDadosSuficientes === false && (
                      <span className="block mt-2 text-yellow-600 text-sm">
                        ⚠️ Dados insuficientes: É necessário preencher "Comprimento do Rio Principal" e "Declividade da Bacia" na caracterização
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {tempoConc.temDadosSuficientes === false && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Atenção:</strong> Para calcular o Tempo de Concentração, é necessário preencher os seguintes campos na caracterização:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Comprimento do Rio Principal</strong> (comprimentoRioPrincipal_L ou comprimentoRioPrincipal)</li>
                          <li><strong>Declividade da Bacia</strong> (declividadeBacia_S ou declividadeBacia)</li>
                        </ul>
                      </p>
                    </div>
                  )}
                  {/* Gráfico de Barras */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Gráfico Comparativo dos Métodos</Label>
                    <ChartContainer
                      config={{
                        kirpich: { label: "Kirpich", color: "hsl(var(--chart-1))" },
                        corpsEngineers: { label: "Corps Engineers", color: "hsl(var(--chart-2))" },
                        carter: { label: "Carter", color: "hsl(var(--chart-3))" },
                        dooge: { label: "Dooge", color: "hsl(var(--chart-4))" },
                        venTeChow: { label: "Ven te Chow", color: "hsl(var(--chart-5))" },
                      }}
                      className="h-[400px]"
                    >
                      <BarChart data={[
                        { metodo: "Kirpich", tempo: tempoConc.kirpch },
                        { metodo: "Corps Engineers", tempo: tempoConc.corpsEngineers },
                        { metodo: "Carter", tempo: tempoConc.carter },
                        { metodo: "Dooge", tempo: tempoConc.dooge },
                        { metodo: "Ven te Chow", tempo: tempoConc.venteChow },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="metodo" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis label={{ value: "Tempo (horas)", angle: -90, position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tempo" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>

                  {/* Tabela de Resultados */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Tabela de Resultados por Método</Label>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Método</TableHead>
                            <TableHead className="text-right">Tempo (horas)</TableHead>
                            <TableHead>Ano</TableHead>
                            <TableHead>Autor</TableHead>
                            <TableHead>Descrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Kirpich</TableCell>
                            <TableCell className="text-right font-mono">{tempoConc.kirpch.toFixed(4)}</TableCell>
                            <TableCell>1940</TableCell>
                            <TableCell>Kirpich</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Baseado no comprimento do rio principal e declividade</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Corps Engineers</TableCell>
                            <TableCell className="text-right font-mono">{tempoConc.corpsEngineers.toFixed(4)}</TableCell>
                            <TableCell>1946</TableCell>
                            <TableCell>U.S. Army Corps of Engineers</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método desenvolvido pelo Corpo de Engenheiros dos EUA</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Carter</TableCell>
                            <TableCell className="text-right font-mono">{tempoConc.carter.toFixed(4)}</TableCell>
                            <TableCell>1961</TableCell>
                            <TableCell>Carter</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método empírico para cálculo de tempo de concentração</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Dooge</TableCell>
                            <TableCell className="text-right font-mono">{tempoConc.dooge.toFixed(4)}</TableCell>
                            <TableCell>1956</TableCell>
                            <TableCell>Dooge</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Baseado na área de drenagem e declividade</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Ven te Chow</TableCell>
                            <TableCell className="text-right font-mono">{tempoConc.venteChow.toFixed(4)}</TableCell>
                            <TableCell>1962</TableCell>
                            <TableCell>Ven te Chow</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método amplamente utilizado em hidrologia</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vazão de Pico */}
            {vazaoPico && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Vazão de Pico
                  </CardTitle>
                  <CardDescription>
                    Vazões calculadas automaticamente (m³/s)
                    {vazaoPico.temDadosSuficientes === false && (
                      <span className="block mt-2 text-yellow-600 text-sm">
                        ⚠️ Dados insuficientes: É necessário preencher "Carga Hidráulica Máxima" na caracterização
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Nível de Alerta */}
                  {(() => {
                    if (!selectedBarragem) return null;
                    const nivelAlerta = calcularNivelAlerta(vazaoPico);
                    if (!nivelAlerta) return null;
                    
                    return (
                      <Card className={`border-2 ${nivelAlerta.cor.replace('bg-', 'border-')}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`${nivelAlerta.cor} text-white rounded-full p-2`}>
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                                  Nível de Alerta: {nivelAlerta.nome} (Nível {nivelAlerta.nivel})
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {nivelAlerta.descricao}
                                </CardDescription>
                              </div>
                            </div>
                            <Button
                              onClick={async () => {
                                const barragem = barragens?.find((b: { id: number; nome: string }) => b.id === selectedBarragem);
                                await enviarAlerta(
                                  selectedBarragem,
                                  nivelAlerta,
                                  vazaoPico,
                                  barragem?.nome
                                );
                              }}
                              variant={nivelAlerta.nivel >= 3 ? "destructive" : "default"}
                              className="flex items-center gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Enviar Alerta
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">Vazão Média</Label>
                              <p className="text-lg font-semibold">{nivelAlerta.vazaoMedia.toFixed(2)} m³/s</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Vazão Mínima</Label>
                              <p className="text-lg font-semibold">{nivelAlerta.vazaoMinima.toFixed(2)} m³/s</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Vazão Máxima</Label>
                              <p className="text-lg font-semibold">{nivelAlerta.vazaoMaxima.toFixed(2)} m³/s</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                  {vazaoPico.temDadosSuficientes === false && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Atenção:</strong> Para calcular a Vazão de Pico, é necessário preencher os seguintes campos na caracterização:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Carga Hidráulica Máxima</strong> (cargaHidraulicaMaxima) - obrigatório</li>
                          <li><strong>Volume do Reservatório</strong> (volumeReservatorio) - opcional, mas recomendado</li>
                          <li><strong>Altura do Maciço Principal</strong> (alturaMaciçoPrincipal) - opcional</li>
                          <li><strong>Largura da Barragem</strong> (larguraBarragem) - opcional</li>
                        </ul>
                      </p>
                    </div>
                  )}
                  {/* Gráfico de Barras */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Gráfico Comparativo dos Métodos</Label>
                    <ChartContainer
                      config={{
                        vazao: { label: "Vazão (m³/s)", color: "hsl(var(--chart-1))" },
                      }}
                      className="h-[400px]"
                    >
                      <BarChart data={[
                        { metodo: "Lou", vazao: vazaoPico.lou },
                        { metodo: "Saint-Venant", vazao: vazaoPico.saintVenant },
                        { metodo: "USBR 1982", vazao: vazaoPico.usbr1982 },
                        { metodo: "Soil Conservation", vazao: vazaoPico.soilConservationService },
                        { metodo: "Kirkpatrick", vazao: vazaoPico.kirkpatrick },
                        { metodo: "Froehlich", vazao: vazaoPico.froehlich },
                        { metodo: "Institution Civil Engineers", vazao: vazaoPico.institutionCivilEngineers },
                        { metodo: "Evans", vazao: vazaoPico.evans },
                        { metodo: "Costa", vazao: vazaoPico.costa },
                        { metodo: "Webby", vazao: vazaoPico.webby },
                        { metodo: "USBR 1989", vazao: vazaoPico.usbr1989 },
                        { metodo: "Lemperière", vazao: vazaoPico.lemperiere },
                        { metodo: "Espanha - Ministerio", vazao: vazaoPico.espanhaMinisterioMedioAmbiente },
                        { metodo: "Singh e Snorrason", vazao: vazaoPico.singhSnorrason },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="metodo" 
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          tick={{ fontSize: 9 }}
                        />
                        <YAxis label={{ value: "Vazão (m³/s)", angle: -90, position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="vazao" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>

                  {/* Tabela de Resultados */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Tabela de Resultados por Método</Label>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Método</TableHead>
                            <TableHead className="text-right">Vazão (m³/s)</TableHead>
                            <TableHead>Ano</TableHead>
                            <TableHead>Autor</TableHead>
                            <TableHead>Descrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Lou</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.lou.toFixed(2)}</TableCell>
                            <TableCell>1981</TableCell>
                            <TableCell>Lou (apud Mascarenhas 1990)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método baseado na carga hidráulica máxima</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Saint-Venant</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.saintVenant.toFixed(2)}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>Saint-Venant (apud U.S. Army Corps)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Baseado na largura da barragem e profundidade média</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">USBR 1982</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.usbr1982.toFixed(2)}</TableCell>
                            <TableCell>1982</TableCell>
                            <TableCell>USBR (apud USBR 1987)</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método do Bureau of Reclamation dos EUA</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Soil Conservation Service</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.soilConservationService.toFixed(2)}</TableCell>
                            <TableCell>1981</TableCell>
                            <TableCell>Soil Conservation Service</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método do Serviço de Conservação do Solo</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Kirkpatrick</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.kirkpatrick.toFixed(2)}</TableCell>
                            <TableCell>1977</TableCell>
                            <TableCell>Kirkpatrick</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método empírico para cálculo de vazão de pico</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Froehlich</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.froehlich.toFixed(2)}</TableCell>
                            <TableCell>1995</TableCell>
                            <TableCell>Froehlich</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Baseado no volume e carga hidráulica</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Institution of Civil Engineers</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.institutionCivilEngineers.toFixed(2)}</TableCell>
                            <TableCell>1996</TableCell>
                            <TableCell>Institution of Civil Engineers</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método da Instituição de Engenheiros Civis</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Evans</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.evans.toFixed(2)}</TableCell>
                            <TableCell>1986</TableCell>
                            <TableCell>Evans</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Baseado no volume do reservatório</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Costa</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.costa.toFixed(2)}</TableCell>
                            <TableCell>1985</TableCell>
                            <TableCell>Costa</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método empírico combinando volume e carga</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Webby</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.webby.toFixed(2)}</TableCell>
                            <TableCell>1996</TableCell>
                            <TableCell>Webby</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método baseado em carga e volume</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">USBR 1989</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.usbr1989.toFixed(2)}</TableCell>
                            <TableCell>1989</TableCell>
                            <TableCell>USBR</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método atualizado do Bureau of Reclamation</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Lemperière</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.lemperiere.toFixed(2)}</TableCell>
                            <TableCell>1996</TableCell>
                            <TableCell>Lemperière</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método francês para cálculo de vazão de pico</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Espanha - Ministerio de Medio Ambiente</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.espanhaMinisterioMedioAmbiente.toFixed(2)}</TableCell>
                            <TableCell>1998</TableCell>
                            <TableCell>Espanha - Ministerio de Medio Ambiente</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Método espanhol oficial</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Singh e Snorrason</TableCell>
                            <TableCell className="text-right font-mono">{vazaoPico.singhSnorrason.toFixed(2)}</TableCell>
                            <TableCell>1984</TableCell>
                            <TableCell>Singh e Snorrason</TableCell>
                            <TableCell className="text-sm text-muted-foreground">Baseado na altura do maciço principal</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

