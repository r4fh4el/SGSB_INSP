import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle,
  ClipboardList,
  Droplets,
  FileText,
  Gauge,
  MapPin,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  // Buscar todas as barragens para exibir resumo geral
  const { 
    data: barragens, 
    isLoading: loadingBarragens, 
    error: errorBarragens,
    refetch: refetchBarragens 
  } = trpc.barragens.list.useQuery(undefined, {
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Calcular estatísticas gerais
  const estatisticasGerais = barragens && Array.isArray(barragens) && barragens.length > 0
    ? {
        total: barragens.length,
        comRiscoAlto: barragens.filter((b: any) => b.categoriaRisco === "A" || b.categoriaRisco === "B").length,
        comRiscoMedio: barragens.filter((b: any) => b.categoriaRisco === "C").length,
        comRiscoBaixo: barragens.filter((b: any) => b.categoriaRisco === "D" || b.categoriaRisco === "E").length,
        comDanoAlto: barragens.filter((b: any) => b.danoPotencialAssociado === "Alto").length,
      }
    : null;

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case "A":
      case "B":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800";
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800";
      case "D":
      case "E":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getRiscoIcon = (risco: string) => {
    switch (risco) {
      case "A":
      case "B":
        return <XCircle className="h-4 w-4" />;
      case "C":
        return <AlertTriangle className="h-4 w-4" />;
      case "D":
      case "E":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getRiscoLabel = (risco: string) => {
    switch (risco) {
      case "A":
      case "B":
        return "Alto";
      case "C":
        return "Médio";
      case "D":
      case "E":
        return "Baixo";
      default:
        return risco;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ backgroundColor: '#ffffff' }}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">
            Sistema de Gestão e Segurança de Barragem - Visão Geral
          </p>
        </div>

        {loadingBarragens ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando dados das barragens...</p>
          </div>
        ) : errorBarragens ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-6">
                {errorBarragens.message || "Não foi possível carregar as barragens. Verifique sua conexão."}
              </p>
              <Button onClick={() => refetchBarragens()} variant="outline">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : barragens && Array.isArray(barragens) && barragens.length > 0 && estatisticasGerais ? (
          <>
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem', display: 'grid' }}>
              <Card 
                className="bg-card border border-border shadow-sm"
                style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Total de Barragens</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasGerais.total || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Cadastradas no sistema</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-card border border-border shadow-sm"
                style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Risco Alto</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {estatisticasGerais.comRiscoAlto || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Requerem atenção prioritária</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-card border border-border shadow-sm"
                style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Risco Médio</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {estatisticasGerais.comRiscoMedio || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Monitoramento regular</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-card border border-border shadow-sm"
                style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Dano Potencial Alto</CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {estatisticasGerais.comDanoAlto || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Alto impacto potencial</p>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição de Risco */}
            <Card 
              className="bg-card border border-border shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
            >
              <CardHeader>
                <CardTitle>Distribuição de Categoria de Risco</CardTitle>
                <CardDescription>Classificação das barragens por nível de risco</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risco Alto</span>
                    <span className="text-sm text-muted-foreground">
                      {estatisticasGerais?.comRiscoAlto || 0} de {estatisticasGerais?.total || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      estatisticasGerais && estatisticasGerais.total > 0
                        ? (estatisticasGerais.comRiscoAlto / estatisticasGerais.total) * 100
                        : 0
                    }
                    className="h-2 bg-red-100 dark:bg-red-950"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risco Médio</span>
                    <span className="text-sm text-muted-foreground">
                      {estatisticasGerais?.comRiscoMedio || 0} de {estatisticasGerais?.total || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      estatisticasGerais && estatisticasGerais.total > 0
                        ? (estatisticasGerais.comRiscoMedio / estatisticasGerais.total) * 100
                        : 0
                    }
                    className="h-2 bg-yellow-100 dark:bg-yellow-950"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risco Baixo</span>
                    <span className="text-sm text-muted-foreground">
                      {estatisticasGerais?.comRiscoBaixo || 0} de {estatisticasGerais?.total || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      estatisticasGerais && estatisticasGerais.total > 0
                        ? (estatisticasGerais.comRiscoBaixo / estatisticasGerais.total) * 100
                        : 0
                    }
                    className="h-2 bg-green-100 dark:bg-green-950"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Barragens */}
            <Card 
              className="bg-card border border-border shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Barragens Cadastradas
                </CardTitle>
                <CardDescription>Status e informações de todas as barragens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {barragens.map((barragem: any) => (
                    <Card key={barragem.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{barragem.nome}</h3>
                              {barragem.categoriaRisco && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getRiscoColor(barragem.categoriaRisco)}`}
                                >
                                  {getRiscoIcon(barragem.categoriaRisco)}
                                  Risco {getRiscoLabel(barragem.categoriaRisco)} ({barragem.categoriaRisco})
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Localização</p>
                                  <p className="text-sm font-medium">
                                    {barragem.municipio && barragem.estado
                                      ? `${barragem.municipio} - ${barragem.estado}`
                                      : "Não informado"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Droplets className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Tipo</p>
                                  <p className="text-sm font-medium">{barragem.tipo || "Não informado"}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Dano Potencial</p>
                                  <p className="text-sm font-medium">
                                    {barragem.danoPotencialAssociado || "Não informado"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Altura (m)</p>
                                  <p className="text-sm font-medium">{barragem.altura || "-"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Ações Rápidas */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/barragens?id=${barragem.id}`}>
                                  <FileText className="h-3 w-3 mr-1" />
                                  Detalhes
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/instrumentos?barragemId=${barragem.id}`}>
                                  <Gauge className="h-3 w-3 mr-1" />
                                  Instrumentos
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/checklists?barragemId=${barragem.id}`}>
                                  <ClipboardList className="h-3 w-3 mr-1" />
                                  Inspeções
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/ocorrencias?barragemId=${barragem.id}`}>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Ocorrências
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card 
              className="bg-card border border-border shadow-sm"
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: '1px' }}
            >
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/barragens">
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm">Barragens</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/instrumentos">
                      <Gauge className="h-6 w-6" />
                      <span className="text-sm">Instrumentos</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/checklists">
                      <ClipboardList className="h-6 w-6" />
                      <span className="text-sm">Inspeções</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/ocorrencias">
                      <AlertCircle className="h-6 w-6" />
                      <span className="text-sm">Ocorrências</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/hidrometria">
                      <Droplets className="h-6 w-6" />
                      <span className="text-sm">Hidrometria</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/documentos">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Documentos</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/manutencoes">
                      <Wrench className="h-6 w-6" />
                      <span className="text-sm">Manutenções</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link href="/alertas">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="text-sm">Alertas</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma barragem cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Comece cadastrando a primeira barragem no sistema
              </p>
              <Button asChild size="lg">
                <Link href="/barragens">
                  <Building2 className="h-4 w-4 mr-2" />
                  Cadastrar Barragem
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

