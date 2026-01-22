import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Calculator, Droplets, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";

interface PluviometroData {
  instrumentoId: number;
  codigo: string;
  localizacao: string;
  areaThiessen: number; // km²
  precipitacao: number; // mm (pode ser editado manualmente)
}

interface BalancoHidricoResult {
  // Precipitação
  precipitacaoMediaThiessen: number; // mm
  volumePrecipitacao: number; // m³
  
  // Entradas
  volumeAfluente: number; // m³
  totalEntradas: number; // m³
  
  // Saídas
  volumeEvaporacao: number; // m³
  volumeSaida: number; // m³
  volumeCaptacao: number; // m³
  totalSaidas: number; // m³
  
  // Balanço
  variacaoVolume: number; // m³
  variacaoNivel: number; // m
  
  // Níveis
  nivelAtual: number; // m
  nivelFinal: number; // m
  nivelMaximoSeguro: number; // m
  margemSeguranca: number; // m
  
  // Status
  status: "NORMAL" | "ALERTA" | "ATENÇÃO" | "CRÍTICO";
  acionarAlerta: boolean;
  mensagem: string;
}

export default function BalancoHidrico() {
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  const [pluviometros, setPluviometros] = useState<PluviometroData[]>([]);
  const [resultado, setResultado] = useState<BalancoHidricoResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Parâmetros do cálculo
  const [areaReservatorio, setAreaReservatorio] = useState<string>(""); // km²
  const [nivelAtual, setNivelAtual] = useState<string>(""); // m
  const [nivelMaximoSeguro, setNivelMaximoSeguro] = useState<string>(""); // m
  const [evaporacao, setEvaporacao] = useState<string>(""); // mm
  const [vazaoAfluente, setVazaoAfluente] = useState<string>(""); // m³/s
  const [vazaoSaida, setVazaoSaida] = useState<string>(""); // m³/s
  const [volumeCaptacao, setVolumeCaptacao] = useState<string>(""); // m³
  const [periodoDias, setPeriodoDias] = useState<string>("30"); // dias
  
  // Queries
  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: instrumentos } = trpc.instrumentos.list.useQuery(
    { barragemId: selectedBarragem ?? undefined },
    { enabled: !!selectedBarragem }
  );
  
  // Selecionar primeira barragem automaticamente
  useEffect(() => {
    if (!selectedBarragem && barragens && barragens.length > 0) {
      setSelectedBarragem(barragens[0].id);
    }
  }, [barragens, selectedBarragem]);
  
  // Buscar pluviômetros
  useEffect(() => {
    if (!selectedBarragem || !instrumentos) {
      setPluviometros([]);
      return;
    }
    
    const pluviometrosEncontrados = instrumentos.filter(
      (inst) => inst.tipo && (
        inst.tipo.toLowerCase().includes("pluviômetro") ||
        inst.tipo.toLowerCase().includes("pluviometro") ||
        inst.tipo.toLowerCase().includes("pluvi")
      )
    );
    
    // Inicializar pluviômetros com área padrão
    const pluviometrosIniciais: PluviometroData[] = pluviometrosEncontrados.map((pluv) => ({
      instrumentoId: pluv.id,
      codigo: pluv.codigo,
      localizacao: pluv.localizacao || "Não informado",
      areaThiessen: 1, // km² - padrão, pode ser editado
      precipitacao: 0, // Será atualizado quando buscar leituras
    }));
    
    setPluviometros(pluviometrosIniciais);
  }, [selectedBarragem, instrumentos]);
  
  const atualizarPrecipitacao = (index: number, valor: string) => {
    const novaPrecipitacao = parseFloat(valor) || 0;
    const novosPluviometros = [...pluviometros];
    novosPluviometros[index].precipitacao = novaPrecipitacao;
    setPluviometros(novosPluviometros);
  };
  
  // Componente para buscar leitura de um pluviômetro específico
  const BuscarLeituraButton = ({ instrumentoId, onLeituraCarregada }: { instrumentoId: number; onLeituraCarregada: (valor: number) => void }) => {
    const { data: leituras, isLoading, refetch } = trpc.instrumentos.leituras.useQuery(
      { instrumentoId, limit: 1 },
      { enabled: false } // Não buscar automaticamente
    );
    
    const handleBuscar = async () => {
      const result = await refetch();
      if (result.data && result.data.length > 0) {
        const valor = parseFloat(result.data[0].valor) || 0;
        onLeituraCarregada(valor);
        toast.success(`Última leitura carregada: ${valor.toFixed(2)} mm`);
      } else {
        toast.warning("Nenhuma leitura encontrada para este pluviômetro");
      }
    };
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleBuscar}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="h-3 w-3 mr-1" />
        )}
        Buscar
      </Button>
    );
  };
  
  // Carregar dados da barragem selecionada
  useEffect(() => {
    if (!selectedBarragem || !barragens) return;
    
    const barragem = barragens.find((b) => b.id === selectedBarragem);
    if (barragem) {
      if (barragem.areaReservatorio) {
        const area = parseFloat(barragem.areaReservatorio);
        if (!isNaN(area)) {
          setAreaReservatorio((area / 1000000).toString()); // Converter m² para km²
        }
      }
    }
  }, [selectedBarragem, barragens]);
  
  const calcularBalancoHidrico = async () => {
    if (!selectedBarragem) {
      toast.error("Selecione uma barragem");
      return;
    }
    
    if (pluviometros.length === 0) {
      toast.error("Nenhum pluviômetro encontrado para esta barragem");
      return;
    }
    
    // Validar campos obrigatórios
    const areaRes = parseFloat(areaReservatorio);
    const nivelAt = parseFloat(nivelAtual);
    const nivelMax = parseFloat(nivelMaximoSeguro);
    const evap = parseFloat(evaporacao);
    const vazaoAfl = parseFloat(vazaoAfluente);
    const vazaoSai = parseFloat(vazaoSaida);
    const volCapt = parseFloat(volumeCaptacao) || 0;
    const periodo = parseFloat(periodoDias) || 30;
    
    if (isNaN(areaRes) || isNaN(nivelAt) || isNaN(nivelMax) || isNaN(evap) || isNaN(vazaoAfl) || isNaN(vazaoSai)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Calcular Precipitação Média pelo Método de Thiessen
      let somaPonderada = 0;
      let somaAreas = 0;
      
      pluviometros.forEach((pluv) => {
        somaPonderada += pluv.areaThiessen * pluv.precipitacao;
        somaAreas += pluv.areaThiessen;
      });
      
      const precipitacaoMedia = somaAreas > 0 ? somaPonderada / somaAreas : 0;
      
      // 2. Converter unidades
      const areaReservatorioM2 = areaRes * 1000000; // km² para m²
      
      // 3. Calcular Volumes
      // Volume de Precipitação Direta (mm para m³)
      const volumePrecipitacao = (precipitacaoMedia / 1000) * areaReservatorioM2;
      
      // Volume Afluente (m³/s para m³)
      const volumeAfluente = vazaoAfl * periodo * 86400; // dias * segundos/dia
      
      // Volume Evaporado (mm para m³)
      const volumeEvaporacao = (evap / 1000) * areaReservatorioM2;
      
      // Volume de Saída (m³/s para m³)
      const volumeSaida = vazaoSai * periodo * 86400;
      
      // Volume de Captação (já em m³)
      const volumeCaptacaoTotal = volCapt;
      
      // 4. Balanço Hídrico
      const totalEntradas = volumePrecipitacao + volumeAfluente;
      const totalSaidas = volumeEvaporacao + volumeSaida + volumeCaptacaoTotal;
      const variacaoVolume = totalEntradas - totalSaidas;
      
      // 5. Variação de Nível
      const variacaoNivel = variacaoVolume / areaReservatorioM2;
      
      // 6. Nível Final
      const nivelFinal = nivelAt + variacaoNivel;
      
      // 7. Margem de Segurança
      const margemSeguranca = nivelMax - nivelFinal;
      
      // 8. Determinar Status
      let status: "NORMAL" | "ALERTA" | "ATENÇÃO" | "CRÍTICO" = "NORMAL";
      let acionarAlerta = false;
      let mensagem = "";
      
      if (margemSeguranca < 0) {
        status = "CRÍTICO";
        acionarAlerta = true;
        mensagem = "⚠️ RISCO DE TRANSBORDAMENTO! O nível final ultrapassa o limite máximo seguro.";
      } else if (margemSeguranca < 0.5) {
        status = "ATENÇÃO";
        acionarAlerta = true;
        mensagem = "⚠️ ATENÇÃO: O reservatório está muito próximo do limite máximo. Monitorar de perto.";
      } else if (margemSeguranca < 1.0) {
        status = "ALERTA";
        acionarAlerta = false;
        mensagem = "⚠️ ALERTA: O reservatório está se aproximando do limite máximo.";
      } else {
        status = "NORMAL";
        acionarAlerta = false;
        mensagem = "✓ Nível dentro dos limites de segurança.";
      }
      
      const resultado: BalancoHidricoResult = {
        precipitacaoMediaThiessen: precipitacaoMedia,
        volumePrecipitacao,
        volumeAfluente,
        totalEntradas,
        volumeEvaporacao,
        volumeSaida,
        volumeCaptacao: volumeCaptacaoTotal,
        totalSaidas,
        variacaoVolume,
        variacaoNivel,
        nivelAtual: nivelAt,
        nivelFinal,
        nivelMaximoSeguro: nivelMax,
        margemSeguranca,
        status,
        acionarAlerta,
        mensagem,
      };
      
      setResultado(resultado);
      toast.success("Balanço hídrico calculado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao calcular balanço hídrico");
    } finally {
      setLoading(false);
    }
  };
  
  const atualizarAreaThiessen = (index: number, area: string) => {
    const novaArea = parseFloat(area) || 0;
    const novosPluviometros = [...pluviometros];
    novosPluviometros[index].areaThiessen = novaArea;
    setPluviometros(novosPluviometros);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Droplets className="h-8 w-8" />
              Balanço Hídrico - Variação do Nível do Reservatório
            </h1>
            <p className="text-muted-foreground mt-2">
              Cálculo integrado: Método de Thiessen + Balanço Hídrico
            </p>
          </div>
        </div>
        
        {/* Seleção de Barragem */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione a Barragem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2">
              <Label>Barragem</Label>
              <Select
                value={selectedBarragem?.toString() || ""}
                onValueChange={(value) => setSelectedBarragem(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma barragem" />
                </SelectTrigger>
                <SelectContent>
                  {barragens?.map((barragem) => (
                    <SelectItem key={barragem.id} value={barragem.id.toString()}>
                      {barragem.nome} {barragem.codigo ? `(${barragem.codigo})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Pluviômetros Encontrados */}
        {pluviometros.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pluviômetros Cadastrados</CardTitle>
              <CardDescription>
                Configure a área de influência (Thiessen) para cada pluviômetro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Precipitação (mm)</TableHead>
                    <TableHead>Área Thiessen (km²)</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pluviometros.map((pluv, index) => (
                    <TableRow key={pluv.instrumentoId}>
                      <TableCell className="font-mono">{pluv.codigo}</TableCell>
                      <TableCell>{pluv.localizacao}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={pluv.precipitacao}
                          onChange={(e) => atualizarPrecipitacao(index, e.target.value)}
                          className="w-24"
                          placeholder="0.0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          value={pluv.areaThiessen}
                          onChange={(e) => atualizarAreaThiessen(index, e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <BuscarLeituraButton
                          instrumentoId={pluv.instrumentoId}
                          onLeituraCarregada={(valor) => atualizarPrecipitacao(index, valor.toString())}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pluviometros.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Método de Thiessen:</strong> A precipitação média será calculada como: 
                    Pm = Σ(Ai × Pi) / ΣAi
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {pluviometros.length === 0 && selectedBarragem && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>Nenhum pluviômetro encontrado para esta barragem.</p>
                <p className="text-sm mt-2">
                  Cadastre instrumentos do tipo "Pluviômetro" na aba Instrumentos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Parâmetros do Cálculo */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Balanço Hídrico</CardTitle>
            <CardDescription>
              Configure os parâmetros do reservatório e do período de análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="areaReservatorio">Área do Reservatório (km²) *</Label>
                <Input
                  id="areaReservatorio"
                  type="number"
                  step="0.01"
                  value={areaReservatorio}
                  onChange={(e) => setAreaReservatorio(e.target.value)}
                  placeholder="Ex: 2.0"
                />
              </div>
              
              <div>
                <Label htmlFor="nivelAtual">Nível Atual (m) *</Label>
                <Input
                  id="nivelAtual"
                  type="number"
                  step="0.01"
                  value={nivelAtual}
                  onChange={(e) => setNivelAtual(e.target.value)}
                  placeholder="Ex: 8.5"
                />
              </div>
              
              <div>
                <Label htmlFor="nivelMaximoSeguro">Nível Máximo Seguro (m) *</Label>
                <Input
                  id="nivelMaximoSeguro"
                  type="number"
                  step="0.01"
                  value={nivelMaximoSeguro}
                  onChange={(e) => setNivelMaximoSeguro(e.target.value)}
                  placeholder="Ex: 10.0"
                />
              </div>
              
              <div>
                <Label htmlFor="evaporacao">Evaporação (mm) *</Label>
                <Input
                  id="evaporacao"
                  type="number"
                  step="0.1"
                  value={evaporacao}
                  onChange={(e) => setEvaporacao(e.target.value)}
                  placeholder="Ex: 150"
                />
              </div>
              
              <div>
                <Label htmlFor="vazaoAfluente">Vazão Afluente (m³/s) *</Label>
                <Input
                  id="vazaoAfluente"
                  type="number"
                  step="0.1"
                  value={vazaoAfluente}
                  onChange={(e) => setVazaoAfluente(e.target.value)}
                  placeholder="Ex: 2.0"
                />
              </div>
              
              <div>
                <Label htmlFor="vazaoSaida">Vazão de Saída (m³/s) *</Label>
                <Input
                  id="vazaoSaida"
                  type="number"
                  step="0.1"
                  value={vazaoSaida}
                  onChange={(e) => setVazaoSaida(e.target.value)}
                  placeholder="Ex: 1.0"
                />
              </div>
              
              <div>
                <Label htmlFor="volumeCaptacao">Volume de Captação (m³)</Label>
                <Input
                  id="volumeCaptacao"
                  type="number"
                  step="1000"
                  value={volumeCaptacao}
                  onChange={(e) => setVolumeCaptacao(e.target.value)}
                  placeholder="Ex: 165000000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional: captação para uso industrial/urbano
                </p>
              </div>
              
              <div>
                <Label htmlFor="periodoDias">Período de Análise (dias)</Label>
                <Input
                  id="periodoDias"
                  type="number"
                  step="1"
                  value={periodoDias}
                  onChange={(e) => setPeriodoDias(e.target.value)}
                  placeholder="Ex: 30"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                onClick={calcularBalancoHidrico}
                disabled={loading || pluviometros.length === 0}
                size="lg"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Calcular Balanço Hídrico
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Resultados */}
        {resultado && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultados do Balanço Hídrico</CardTitle>
                <Badge
                  variant={
                    resultado.status === "CRÍTICO"
                      ? "destructive"
                      : resultado.status === "ATENÇÃO"
                      ? "default"
                      : resultado.status === "ALERTA"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-lg px-4 py-2"
                >
                  {resultado.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mensagem de Status */}
              <div
                className={`p-4 rounded-lg ${
                  resultado.status === "CRÍTICO"
                    ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                    : resultado.status === "ATENÇÃO"
                    ? "bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800"
                    : resultado.status === "ALERTA"
                    ? "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800"
                    : "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  {resultado.status === "CRÍTICO" || resultado.status === "ATENÇÃO" ? (
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" />
                  )}
                  <p className="font-medium">{resultado.mensagem}</p>
                </div>
              </div>
              
              {/* Precipitação Média (Thiessen) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Precipitação Média (Thiessen)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {resultado.precipitacaoMediaThiessen.toFixed(2)} <span className="text-lg text-muted-foreground">mm</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculado a partir de {pluviometros.length} pluviômetro(s)
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Volume de Precipitação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(resultado.volumePrecipitacao / 1000000).toFixed(2)} <span className="text-lg text-muted-foreground">Mm³</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resultado.volumePrecipitacao.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m³
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Entradas e Saídas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Entradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Precipitação:</span>
                      <span className="font-mono">{(resultado.volumePrecipitacao / 1000000).toFixed(2)} Mm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vazão Afluente:</span>
                      <span className="font-mono">{(resultado.volumeAfluente / 1000000).toFixed(2)} Mm³</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Entradas:</span>
                        <span className="font-mono text-green-600">{(resultado.totalEntradas / 1000000).toFixed(2)} Mm³</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Saídas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Evaporação:</span>
                      <span className="font-mono">{(resultado.volumeEvaporacao / 1000000).toFixed(2)} Mm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vazão de Saída:</span>
                      <span className="font-mono">{(resultado.volumeSaida / 1000000).toFixed(2)} Mm³</span>
                    </div>
                    {resultado.volumeCaptacao > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Captação:</span>
                        <span className="font-mono">{(resultado.volumeCaptacao / 1000000).toFixed(2)} Mm³</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Saídas:</span>
                        <span className="font-mono text-red-600">{(resultado.totalSaidas / 1000000).toFixed(2)} Mm³</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Variação de Nível */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">Variação do Nível do Reservatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Variação de Volume</Label>
                      <div className="text-2xl font-bold mt-1">
                        {(resultado.variacaoVolume / 1000000).toFixed(2)} <span className="text-sm text-muted-foreground">Mm³</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Variação de Nível</Label>
                      <div className={`text-2xl font-bold mt-1 ${resultado.variacaoNivel >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {resultado.variacaoNivel >= 0 ? "+" : ""}
                        {resultado.variacaoNivel.toFixed(3)} <span className="text-sm text-muted-foreground">m</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Nível Atual</Label>
                      <div className="text-2xl font-bold mt-1">
                        {resultado.nivelAtual.toFixed(2)} <span className="text-sm text-muted-foreground">m</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Nível Final</Label>
                      <div className="text-2xl font-bold mt-1">
                        {resultado.nivelFinal.toFixed(3)} <span className="text-sm text-muted-foreground">m</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nível Máximo Seguro</Label>
                      <div className="text-xl font-bold mt-1">
                        {resultado.nivelMaximoSeguro.toFixed(2)} <span className="text-sm text-muted-foreground">m</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Margem de Segurança</Label>
                      <div className={`text-xl font-bold mt-1 ${resultado.margemSeguranca < 1 ? "text-red-600" : "text-green-600"}`}>
                        {resultado.margemSeguranca.toFixed(3)} <span className="text-sm text-muted-foreground">m</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

