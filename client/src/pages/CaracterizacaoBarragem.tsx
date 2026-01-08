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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { trpc } from "@/lib/trpc";
import { Calculator, Save, RefreshCw, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// URL da API do SGSB-FINAL - ajustar conforme necessário
const SGSB_FINAL_API_URL = import.meta.env.VITE_SGSB_FINAL_API_URL || "http://localhost:5204";

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

export default function CaracterizacaoBarragem() {
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [calculosResultados, setCalculosResultados] = useState<CalculosResultados | null>(null);
  const [loadingCalculos, setLoadingCalculos] = useState(false);

  // Queries
  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: caracterizacao, refetch } = trpc.checklists.getCaracterizacaoByBarragem.useQuery(
    { barragemId: selectedBarragem! },
    { enabled: !!selectedBarragem }
  );

  // Mutations
  const createCaracterizacao = trpc.checklists.createCaracterizacao.useMutation();
  const updateCaracterizacao = trpc.checklists.updateCaracterizacao.useMutation();

  // Selecionar primeira barragem automaticamente
  useEffect(() => {
    if (!selectedBarragem && barragens && barragens.length > 0) {
      setSelectedBarragem(barragens[0].id);
    }
  }, [barragens, selectedBarragem]);

  // Carregar dados quando barragem ou caracterização mudar
  useEffect(() => {
    if (caracterizacao) {
      setFormData(caracterizacao);
    } else if (selectedBarragem) {
      setFormData({ barragemId: selectedBarragem });
    }
  }, [caracterizacao, selectedBarragem]);

  // Buscar resultados dos cálculos do SGSB-FINAL
  const buscarCalculos = async () => {
    if (!selectedBarragem) return;

    setLoadingCalculos(true);
    try {
      const response = await fetch(`${SGSB_FINAL_API_URL}/API/BuscarCalculosAutomaticosPorBarragem?barragemId=${selectedBarragem}`);
      if (response.ok) {
        const data = await response.json();
        setCalculosResultados(data);
      } else {
        console.warn("Não foi possível buscar cálculos do SGSB-FINAL");
      }
    } catch (error) {
      console.warn("Erro ao buscar cálculos:", error);
    } finally {
      setLoadingCalculos(false);
    }
  };

  // Buscar cálculos quando barragem ou caracterização mudar
  useEffect(() => {
    if (selectedBarragem && caracterizacao) {
      buscarCalculos();
    }
  }, [selectedBarragem, caracterizacao]);

  // Buscar último checklist da barragem para vincular
  const { data: checklists } = trpc.checklists.list.useQuery(
    { barragemId: selectedBarragem! },
    { enabled: !!selectedBarragem }
  );
  const createChecklist = trpc.checklists.create.useMutation();

  const handleSave = async () => {
    if (!selectedBarragem) {
      toast.error("Selecione uma barragem primeiro!");
      return;
    }

    setLoading(true);
    try {
      let checklistId = caracterizacao?.checklistId;

      // Se não houver checklist vinculado, buscar o último ou criar um novo
      if (!checklistId) {
        if (checklists && checklists.length > 0) {
          // Usar o último checklist da barragem
          checklistId = checklists[0].id;
          toast.info("Vinculando caracterização ao último checklist da barragem");
        } else {
          // Criar um checklist temporário para caracterização
          toast.info("Criando checklist automático para vincular a caracterização...");
          const resultado = await createChecklist.mutateAsync({
            barragemId: selectedBarragem,
            data: new Date().toISOString(),
            tipo: "mensal",
            observacoesGerais: "Checklist criado automaticamente para caracterização da barragem",
          });
          checklistId = resultado.id;
        }
      }

      if (caracterizacao?.id) {
        await updateCaracterizacao.mutateAsync({
          id: caracterizacao.id,
          data: { ...formData, barragemId: selectedBarragem, checklistId },
        });
        toast.success("Caracterização atualizada com sucesso!");
      } else {
        await createCaracterizacao.mutateAsync({
          ...formData,
          barragemId: selectedBarragem,
          checklistId: checklistId!,
        });
        toast.success("Caracterização salva com sucesso!");
      }
      refetch();
      // Buscar cálculos atualizados após salvar
      await buscarCalculos();
      toast.success("Caracterização salva! Os cálculos serão atualizados automaticamente no SGSB-FINAL.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar caracterização");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value === "" ? null : parseFloat(value) || null }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Caracterização da Barragem
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure os dados da barragem para cálculos hidrológicos automáticos
            </p>
          </div>
        </div>

        {/* Seletor de Barragem */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione uma Barragem</CardTitle>
            <CardDescription>
              Selecione a barragem para configurar os dados de caracterização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBarragem?.toString()}
              onValueChange={(value) => setSelectedBarragem(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma barragem" />
              </SelectTrigger>
              <SelectContent>
                {barragens && barragens.length > 0 ? (
                  barragens.map((barragem: any) => (
                    <SelectItem key={barragem.id} value={barragem.id.toString()}>
                      {barragem.nome}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Nenhuma barragem cadastrada
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedBarragem ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Dados para Cálculos Hidrológicos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados que serão utilizados para automatizar os cálculos no SGSB-HIDRO
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={buscarCalculos} disabled={loadingCalculos || !selectedBarragem} variant="outline" size="lg">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingCalculos ? "animate-spin" : ""}`} />
                  {loadingCalculos ? "Atualizando..." : "Atualizar Cálculos"}
                </Button>
                <Button onClick={handleSave} disabled={loading} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Caracterização"}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="indice" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="indice">Índice de Caracterização BH</TabsTrigger>
                <TabsTrigger value="tempo">Tempo de Concentração</TabsTrigger>
                <TabsTrigger value="vazao">Vazão de Pico</TabsTrigger>
              </TabsList>

              {/* Índice de Caracterização de Bacia Hidrográfica */}
              <TabsContent value="indice" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Índice de Caracterização de Bacia Hidrográfica</CardTitle>
                    <CardDescription>
                      Dados geométricos e topográficos da bacia hidrográfica
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Área da bacia hidrográfica (Km²)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.areaBaciaHidrografica || ""}
                          onChange={(e) => updateField("areaBaciaHidrografica", e.target.value)}
                          placeholder="Ex: 125.5"
                        />
                      </div>
                      <div>
                        <Label>Perímetro (Km)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.perimetro || ""}
                          onChange={(e) => updateField("perimetro", e.target.value)}
                          placeholder="Ex: 45.2"
                        />
                      </div>
                      <div>
                        <Label>Comprimento do rio principal (Km)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.comprimentoRioPrincipal || ""}
                          onChange={(e) => updateField("comprimentoRioPrincipal", e.target.value)}
                          placeholder="Ex: 12.8"
                        />
                      </div>
                      <div>
                        <Label>Comprimento vetorial do rio principal (Km)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.comprimentoVetorialRioPrincipal || ""}
                          onChange={(e) => updateField("comprimentoVetorialRioPrincipal", e.target.value)}
                          placeholder="Ex: 10.5"
                        />
                      </div>
                      <div>
                        <Label>Comprimento total dos rios da bacia (Km)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.comprimentoTotalRioBacia || ""}
                          onChange={(e) => updateField("comprimentoTotalRioBacia", e.target.value)}
                          placeholder="Ex: 85.3"
                        />
                      </div>
                      <div>
                        <Label>Altitude Mínima da bacia (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.altitudeMinimaBacia || ""}
                          onChange={(e) => updateField("altitudeMinimaBacia", e.target.value)}
                          placeholder="Ex: 450.0"
                        />
                      </div>
                      <div>
                        <Label>Altitude Máxima da bacia (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.altitudeMaximaBacia || ""}
                          onChange={(e) => updateField("altitudeMaximaBacia", e.target.value)}
                          placeholder="Ex: 850.0"
                        />
                      </div>
                      <div>
                        <Label>Amplitude altimétrica da bacia (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.altitudeAltimetricaBaciaM || ""}
                          onChange={(e) => updateField("altitudeAltimetricaBaciaM", e.target.value)}
                          placeholder="Ex: 400.0"
                        />
                      </div>
                      <div>
                        <Label>Amplitude altimétrica da bacia (Km)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.altitudeAltimetricaBaciaKM || ""}
                          onChange={(e) => updateField("altitudeAltimetricaBaciaKM", e.target.value)}
                          placeholder="Ex: 0.4"
                        />
                      </div>
                      <div>
                        <Label>Comprimento axial da bacia (Km)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.comprimentoAxialBacia || ""}
                          onChange={(e) => updateField("comprimentoAxialBacia", e.target.value)}
                          placeholder="Ex: 15.2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resultados dos Cálculos - Índice de Caracterização */}
                {calculosResultados?.indiceCaracterizacao && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Resultados dos Cálculos - Índice de Caracterização BH
                        </CardTitle>
                        <CardDescription>
                          Índices calculados automaticamente no SGSB-FINAL (adimensionais)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Gráfico de Barras */}
                        {calculosResultados.indiceCaracterizacao.grafico && calculosResultados.indiceCaracterizacao.grafico.length > 0 && (
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
                              <BarChart data={calculosResultados.indiceCaracterizacao.grafico}>
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
                        )}

                        {/* Gráfico de Linha */}
                        {calculosResultados.indiceCaracterizacao.grafico && calculosResultados.indiceCaracterizacao.grafico.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold mb-3 block">Evolução dos Índices (Linha)</Label>
                            <ChartContainer
                              config={{
                                valor: { label: "Valor", color: "hsl(var(--chart-2))" },
                              }}
                              className="h-[300px]"
                            >
                              <LineChart data={calculosResultados.indiceCaracterizacao.grafico}>
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
                                <Line 
                                  type="monotone" 
                                  dataKey="valor" 
                                  stroke="hsl(var(--chart-2))" 
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </div>
                        )}

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
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.indiceCircularidade.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>Miller (1953)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Mede a forma circular da bacia hidrográfica</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Fator de Forma (F)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.fatorForma.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>Horton (1945)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Razão entre a largura média e o comprimento axial da bacia</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Coeficiente de Compacidade (Kc)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.coeficienteCompacidade.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>Lima (1969)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Relação entre o perímetro da bacia e o perímetro de um círculo de mesma área</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Densidade de Drenagem (Dd)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.densidadeDrenagem.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>Horton (1945)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Razão entre o comprimento total dos rios e a área da bacia</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Coeficiente de Manutenção (Cm)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.coeficienteManutencao.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>-</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Inverso da densidade de drenagem</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Gradiente de Canais (Gc)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.gradienteCanais.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>-</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Gradiente médio dos canais da bacia</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Relação de Relevo (Rr)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.relacaoRelevo.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>Christofoletti (1969)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Relação entre a amplitude altimétrica e o comprimento do rio principal</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Índice de Rugosidade (IR)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.indiceRugosidade.toFixed(4)}
                                  </TableCell>
                                  <TableCell>Adimensional</TableCell>
                                  <TableCell>Christofoletti (1969)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Mede a rugosidade do relevo da bacia</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Sinuosidade do Curso d'água (S)</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.indiceCaracterizacao.resultados.sinuosidadeCursoDagua.toFixed(4)}
                                  </TableCell>
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
                  </div>
                )}
              </TabsContent>

              {/* Tempo de Concentração */}
              <TabsContent value="tempo" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tempo de Concentração</CardTitle>
                    <CardDescription>
                      Parâmetros para cálculo do tempo de concentração da bacia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Comprimento do rio principal (L)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.comprimentoRioPrincipal_L || ""}
                          onChange={(e) => updateField("comprimentoRioPrincipal_L", e.target.value)}
                          placeholder="Ex: 12.8"
                        />
                      </div>
                      <div>
                        <Label>Declividade da bacia (S)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.declividadeBacia_S || ""}
                          onChange={(e) => updateField("declividadeBacia_S", e.target.value)}
                          placeholder="Ex: 0.025"
                        />
                      </div>
                      <div>
                        <Label>Área de drenagem (A)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.areaDrenagem_A || ""}
                          onChange={(e) => updateField("areaDrenagem_A", e.target.value)}
                          placeholder="Ex: 125.5"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resultados dos Cálculos - Tempo de Concentração */}
                {calculosResultados?.tempoConcentracao && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Resultados dos Cálculos - Tempo de Concentração
                        </CardTitle>
                        <CardDescription>
                          Resultados calculados automaticamente no SGSB-FINAL (em horas)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Gráfico de Barras */}
                        {calculosResultados.tempoConcentracao.grafico && calculosResultados.tempoConcentracao.grafico.length > 0 && (
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
                              <BarChart data={calculosResultados.tempoConcentracao.grafico}>
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
                        )}

                        {/* Gráfico de Linha */}
                        {calculosResultados.tempoConcentracao.grafico && calculosResultados.tempoConcentracao.grafico.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold mb-3 block">Evolução dos Métodos (Linha)</Label>
                            <ChartContainer
                              config={{
                                tempo: { label: "Tempo (horas)", color: "hsl(var(--chart-1))" },
                              }}
                              className="h-[300px]"
                            >
                              <LineChart data={calculosResultados.tempoConcentracao.grafico}>
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
                                <Line 
                                  type="monotone" 
                                  dataKey="tempo" 
                                  stroke="hsl(var(--chart-1))" 
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </div>
                        )}

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
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.tempoConcentracao.resultados.kirpich.toFixed(4)}
                                  </TableCell>
                                  <TableCell>1940</TableCell>
                                  <TableCell>Kirpich</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Baseado no comprimento do rio principal e declividade</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Corps Engineers</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.tempoConcentracao.resultados.corpsEngineers.toFixed(4)}
                                  </TableCell>
                                  <TableCell>1946</TableCell>
                                  <TableCell>U.S. Army Corps of Engineers</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método desenvolvido pelo Corpo de Engenheiros dos EUA</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Carter</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.tempoConcentracao.resultados.carter.toFixed(4)}
                                  </TableCell>
                                  <TableCell>1961</TableCell>
                                  <TableCell>Carter</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método empírico para cálculo de tempo de concentração</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Dooge</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.tempoConcentracao.resultados.dooge.toFixed(4)}
                                  </TableCell>
                                  <TableCell>1956</TableCell>
                                  <TableCell>Dooge</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Baseado na área de drenagem e declividade</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Ven te Chow</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.tempoConcentracao.resultados.venTeChow.toFixed(4)}
                                  </TableCell>
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
                  </div>
                )}
              </TabsContent>

              {/* Vazão de Pico */}
              <TabsContent value="vazao" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vazão de Pico</CardTitle>
                    <CardDescription>
                      Dados estruturais e do reservatório para cálculo de vazão de pico
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Largura da barragem - comprimento (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.larguraBarragem || ""}
                          onChange={(e) => updateField("larguraBarragem", e.target.value)}
                          placeholder="Ex: 150.0"
                        />
                      </div>
                      <div>
                        <Label>Altura do Maciço Principal (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.alturaMaciçoPrincipal || ""}
                          onChange={(e) => updateField("alturaMaciçoPrincipal", e.target.value)}
                          placeholder="Ex: 25.5"
                        />
                      </div>
                      <div>
                        <Label>Volume do reservatório (m³)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.volumeReservatorio || ""}
                          onChange={(e) => updateField("volumeReservatorio", e.target.value)}
                          placeholder="Ex: 1250000"
                        />
                      </div>
                      <div>
                        <Label>Carga hidráulica máxima (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.cargaHidraulicaMaxima || ""}
                          onChange={(e) => updateField("cargaHidraulicaMaxima", e.target.value)}
                          placeholder="Ex: 24.8"
                        />
                      </div>
                      <div>
                        <Label>Profundidade média do reservatório (m)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.profundidadeMediaReservatorio || ""}
                          onChange={(e) => updateField("profundidadeMediaReservatorio", e.target.value)}
                          placeholder="Ex: 8.5"
                        />
                      </div>
                      <div>
                        <Label>Área do reservatório (m²)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={formData.areaReservatorio || ""}
                          onChange={(e) => updateField("areaReservatorio", e.target.value)}
                          placeholder="Ex: 150000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resultados dos Cálculos - Vazão de Pico */}
                {calculosResultados?.vazaoPico && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Resultados dos Cálculos - Vazão de Pico
                        </CardTitle>
                        <CardDescription>
                          Vazões calculadas automaticamente no SGSB-FINAL (m³/s)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Gráfico de Barras */}
                        {calculosResultados.vazaoPico.grafico && calculosResultados.vazaoPico.grafico.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold mb-3 block">Gráfico Comparativo dos Métodos</Label>
                            <ChartContainer
                              config={{
                                vazao: { label: "Vazão (m³/s)", color: "hsl(var(--chart-1))" },
                              }}
                              className="h-[400px]"
                            >
                              <BarChart data={calculosResultados.vazaoPico.grafico}>
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
                        )}

                        {/* Gráfico de Linha */}
                        {calculosResultados.vazaoPico.grafico && calculosResultados.vazaoPico.grafico.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold mb-3 block">Evolução dos Métodos (Linha)</Label>
                            <ChartContainer
                              config={{
                                vazao: { label: "Vazão (m³/s)", color: "hsl(var(--chart-2))" },
                              }}
                              className="h-[300px]"
                            >
                              <LineChart data={calculosResultados.vazaoPico.grafico}>
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
                                <Line 
                                  type="monotone" 
                                  dataKey="vazao" 
                                  stroke="hsl(var(--chart-2))" 
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </div>
                        )}

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
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.lou.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1981</TableCell>
                                  <TableCell>Lou (apud Mascarenhas 1990)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método baseado na carga hidráulica máxima</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Saint-Venant</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.saintVenant.toFixed(2)}
                                  </TableCell>
                                  <TableCell>-</TableCell>
                                  <TableCell>Saint-Venant (apud U.S. Army Corps)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Baseado na largura da barragem e profundidade média</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">USBR 1982</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.usbr1982.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1982</TableCell>
                                  <TableCell>USBR (apud USBR 1987)</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método do Bureau of Reclamation dos EUA</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Soil Conservation Service</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.soilConservationService.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1981</TableCell>
                                  <TableCell>Soil Conservation Service</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método do Serviço de Conservação do Solo</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Kirkpatrick</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.kirkpatrick.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1977</TableCell>
                                  <TableCell>Kirkpatrick</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método empírico para cálculo de vazão de pico</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Froehlich</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.froehlich.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1995</TableCell>
                                  <TableCell>Froehlich</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Baseado no volume e carga hidráulica</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Institution of Civil Engineers</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.institutionCivilEngineers.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1996</TableCell>
                                  <TableCell>Institution of Civil Engineers</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método da Instituição de Engenheiros Civis</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Evans</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.evans.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1986</TableCell>
                                  <TableCell>Evans</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Baseado no volume do reservatório</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Costa</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.costa.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1985</TableCell>
                                  <TableCell>Costa</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método empírico combinando volume e carga</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Webby</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.webby.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1996</TableCell>
                                  <TableCell>Webby</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método baseado em carga e volume</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">USBR 1989</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.usbr1989.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1989</TableCell>
                                  <TableCell>USBR</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método atualizado do Bureau of Reclamation</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Lemperière</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.lemperiere.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1996</TableCell>
                                  <TableCell>Lemperière</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método francês para cálculo de vazão de pico</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Espanha - Ministerio de Medio Ambiente</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.espanhaMinisterioMedioAmbiente.toFixed(2)}
                                  </TableCell>
                                  <TableCell>1998</TableCell>
                                  <TableCell>Espanha - Ministerio de Medio Ambiente</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">Método espanhol oficial</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Singh e Snorrason</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {calculosResultados.vazaoPico.resultados.singhSnorrason.toFixed(2)}
                                  </TableCell>
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
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Metadados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadados da Medição</CardTitle>
                <CardDescription>
                  Informações sobre como e quando as medições foram realizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Método de Medição</Label>
                    <Input
                      value={formData.metodoMedicao || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, metodoMedicao: e.target.value }))}
                      placeholder="Ex: GPS, Trena, Nível"
                    />
                  </div>
                  <div>
                    <Label>Equipamento Utilizado</Label>
                    <Input
                      value={formData.equipamentoUtilizado || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, equipamentoUtilizado: e.target.value }))}
                      placeholder="Ex: GPS Garmin, Nível Laser"
                    />
                  </div>
                  <div>
                    <Label>Responsável pela Medição</Label>
                    <Input
                      value={formData.responsavelMedicao || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, responsavelMedicao: e.target.value }))}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre as medições realizadas..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium mb-2">Selecione uma Barragem</p>
              <p className="text-muted-foreground mb-4">
                Selecione uma barragem acima para configurar os dados de caracterização
              </p>
              {(!barragens || barragens.length === 0) && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhuma barragem cadastrada. Cadastre uma barragem primeiro.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

