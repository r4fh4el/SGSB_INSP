import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Alertas() {
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  const [filtroLido, setFiltroLido] = useState<boolean | undefined>(undefined);
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos");

  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: alertasRaw, refetch: refetchAlertas } = trpc.alertas.listByBarragem.useQuery(
    { barragemId: selectedBarragem!, lido: filtroLido },
    { enabled: !!selectedBarragem }
  );

  // Filtrar por severidade
  const alertas = alertasRaw?.filter((alerta: any) => {
    if (filtroSeveridade === "todos") return true;
    return alerta.severidade === filtroSeveridade;
  });

  const marcarLido = trpc.alertas.marcarLido.useMutation();

  if (!selectedBarragem && barragens && barragens.length > 0) {
    setSelectedBarragem(barragens[0].id);
  }

  const handleMarcarLido = async (id: number) => {
    try {
      await marcarLido.mutateAsync({ id });
      toast.success("Alerta marcado como lido!");
      refetchAlertas();
    } catch (error: any) {
      toast.error(error.message || "Erro ao marcar alerta");
    }
  };

  const getSeveridadeColor = (severidade: string) => {
    const colors: Record<string, string> = {
      "info": "bg-blue-100 text-blue-800 border-blue-200",
      "aviso": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "alerta": "bg-orange-100 text-orange-800 border-orange-200",
      "critico": "bg-red-100 text-red-800 border-red-200",
    };
    return colors[severidade] || colors["info"];
  };

  const getSeveridadeIcon = (severidade: string) => {
    const icons: Record<string, any> = {
      "info": Info,
      "aviso": AlertCircle,
      "alerta": AlertTriangle,
      "critico": AlertCircle,
    };
    const Icon = icons[severidade] || Info;
    return <Icon className="h-5 w-5" />;
  };

  const getSeveridadeLabel = (severidade: string) => {
    const labels: Record<string, string> = {
      "info": "Informação",
      "aviso": "Aviso",
      "alerta": "Alerta",
      "critico": "Crítico",
    };
    return labels[severidade] || severidade;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      "instrumento": "Instrumento",
      "inspecao": "Inspeção",
      "manutencao": "Manutenção",
      "documento": "Documento",
      "sistema": "Sistema",
    };
    return labels[tipo] || tipo;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
            <p className="text-muted-foreground mt-1">Notificações e alertas do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Selecione uma Barragem</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBarragem?.toString()} onValueChange={(v) => setSelectedBarragem(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma barragem" />
                </SelectTrigger>
                <SelectContent>
                  {barragens?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtrar por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={filtroLido === undefined ? "todos" : filtroLido ? "lidos" : "nao_lidos"} onValueChange={(v) => setFiltroLido(v === "todos" ? undefined : v === "lidos")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nao_lidos">Não Lidos</SelectItem>
                  <SelectItem value="lidos">Lidos</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtrar por Severidade</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="alerta">Alerta</SelectItem>
                  <SelectItem value="aviso">Aviso</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {selectedBarragem && (
          <>
            {alertas && alertas.length > 0 ? (
              <div className="space-y-3">
                {alertas.map((alerta: any) => (
                  <Card key={alerta.id} className={`border-l-4 ${!alerta.lido ? "bg-muted/30" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getSeveridadeColor(alerta.severidade)}`}>
                            {getSeveridadeIcon(alerta.severidade)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
                              {!alerta.lido && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                  Novo
                                </span>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {getTipoLabel(alerta.tipo)} • {alerta.createdAt ? new Date(alerta.createdAt).toLocaleString("pt-BR") : "-"}
                            </CardDescription>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getSeveridadeColor(alerta.severidade)}`}>
                          {getSeveridadeLabel(alerta.severidade)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-4 whitespace-pre-line font-mono text-xs bg-muted/50 p-3 rounded border">
                        {alerta.mensagem}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {alerta.lido ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Lido em {alerta.dataLeitura ? new Date(alerta.dataLeitura).toLocaleString("pt-BR") : "-"}
                            </span>
                          ) : (
                            <span>Aguardando leitura</span>
                          )}
                        </div>
                        {!alerta.lido && (
                          <Button size="sm" variant="outline" onClick={() => handleMarcarLido(alerta.id)} disabled={marcarLido.isPending}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como Lido
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">Nenhum alerta encontrado</p>
                  <p className="text-muted-foreground">
                    {filtroLido === false ? "Não há alertas não lidos" : "Não há alertas para esta barragem"}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

