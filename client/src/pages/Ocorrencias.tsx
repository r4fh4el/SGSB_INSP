import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, AlertTriangle, CheckCircle, Edit, Eye, Plus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Ocorrencias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<any>(null);
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<any>(null);

  // Queries
  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: ocorrencias, refetch: refetchOcorrencias } = trpc.ocorrencias.listByBarragem.useQuery(
    { barragemId: selectedBarragem! },
    { enabled: !!selectedBarragem }
  );

  // Mutations
  const createOcorrencia = trpc.ocorrencias.create.useMutation();
  const updateOcorrencia = trpc.ocorrencias.update.useMutation();
  const deleteOcorrencia = trpc.ocorrencias.delete.useMutation();

  // Form state
  const [ocorrenciaForm, setOcorrenciaForm] = useState({
    titulo: "",
    descricao: "",
    dataOcorrencia: "",
    localOcorrencia: "",
    severidade: "baixa" as "baixa" | "media" | "alta" | "critica",
    categoria: "",
    status: "aberta" as "aberta" | "em_analise" | "em_tratamento" | "resolvida" | "fechada",
    acaoImediata: "",
    responsavel: "",
  });

  // Selecionar primeira barragem automaticamente
  if (!selectedBarragem && barragens && barragens.length > 0) {
    setSelectedBarragem(barragens[0].id);
  }

  const handleSubmitOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarragem) return;

    try {
      if (editingOcorrencia) {
        await updateOcorrencia.mutateAsync({
          id: editingOcorrencia.id,
          data: {
            status: ocorrenciaForm.status || undefined,
            severidade: ocorrenciaForm.severidade || undefined,
            tipo: ocorrenciaForm.categoria || undefined,
            comentariosAvaliacao: undefined,
            comentariosConclusao: undefined,
          } as any,
        });
        toast.success("Ocorrência atualizada com sucesso!");
      } else {
        const data = {
          barragemId: selectedBarragem,
          estruturaId: undefined,
          estrutura: ocorrenciaForm.localOcorrencia || "Não especificado",
          relato: ocorrenciaForm.descricao || ocorrenciaForm.titulo || "Sem descrição",
          fotos: undefined,
          severidade: ocorrenciaForm.severidade || undefined,
          tipo: ocorrenciaForm.categoria || undefined,
          latitude: undefined,
          longitude: undefined,
        };
        await createOcorrencia.mutateAsync(data);
        toast.success("Ocorrência registrada com sucesso!");
      }

      setDialogOpen(false);
      setEditingOcorrencia(null);
      resetOcorrenciaForm();
      refetchOcorrencias();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar ocorrência");
    }
  };

  const handleEdit = (ocorrencia: any) => {
    setEditingOcorrencia(ocorrencia);
    setOcorrenciaForm({
      titulo: ocorrencia.titulo || "",
      descricao: ocorrencia.descricao || "",
      dataOcorrencia: ocorrencia.dataOcorrencia
        ? new Date(ocorrencia.dataOcorrencia).toISOString().split("T")[0]
        : "",
      localOcorrencia: ocorrencia.localOcorrencia || "",
      severidade: ocorrencia.severidade || "baixa",
      categoria: ocorrencia.categoria || "",
      status: ocorrencia.status || "aberta",
      acaoImediata: ocorrencia.acaoImediata || "",
      responsavel: ocorrencia.responsavel || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta ocorrência?")) return;

    try {
      await deleteOcorrencia.mutateAsync({ id });
      toast.success("Ocorrência excluída com sucesso!");
      refetchOcorrencias();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir ocorrência");
    }
  };

  const handleView = (ocorrencia: any) => {
    setSelectedOcorrencia(ocorrencia);
    setViewDialogOpen(true);
  };

  const resetOcorrenciaForm = () => {
    setOcorrenciaForm({
      titulo: "",
      descricao: "",
      dataOcorrencia: "",
      localOcorrencia: "",
      severidade: "baixa",
      categoria: "",
      status: "aberta",
      acaoImediata: "",
      responsavel: "",
    });
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "critica":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800";
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800";
      case "baixa":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case "critica":
        return <XCircle className="h-4 w-4" />;
      case "alta":
        return <AlertTriangle className="h-4 w-4" />;
      case "media":
        return <AlertCircle className="h-4 w-4" />;
      case "baixa":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolvida":
      case "fechada":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "em_tratamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "em_analise":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "aberta":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aberta":
        return "Aberta";
      case "em_analise":
        return "Em Análise";
      case "em_tratamento":
        return "Em Tratamento";
      case "resolvida":
        return "Resolvida";
      case "fechada":
        return "Fechada";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ocorrências e Anomalias</h1>
            <p className="text-muted-foreground mt-1">Registro e acompanhamento de ocorrências</p>
          </div>
        </div>

        {/* Seletor de Barragem */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione uma Barragem</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBarragem?.toString()}
              onValueChange={(value) => setSelectedBarragem(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma barragem" />
              </SelectTrigger>
              <SelectContent>
                {barragens?.map((barragem: any) => (
                  <SelectItem key={barragem.id} value={barragem.id.toString()}>
                    {barragem.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedBarragem && (
          <>
            <div className="flex justify-end">
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setEditingOcorrencia(null);
                    resetOcorrenciaForm();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOcorrencia ? "Editar Ocorrência" : "Registrar Nova Ocorrência"}
                    </DialogTitle>
                    <DialogDescription>Preencha os dados da ocorrência</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitOcorrencia} className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={ocorrenciaForm.titulo}
                        onChange={(e) =>
                          setOcorrenciaForm({ ...ocorrenciaForm, titulo: e.target.value })
                        }
                        required
                        placeholder="Título resumido da ocorrência"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataOcorrencia">Data da Ocorrência *</Label>
                        <Input
                          id="dataOcorrencia"
                          type="date"
                          value={ocorrenciaForm.dataOcorrencia}
                          onChange={(e) =>
                            setOcorrenciaForm({ ...ocorrenciaForm, dataOcorrencia: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="localOcorrencia">Local da Ocorrência</Label>
                        <Input
                          id="localOcorrencia"
                          value={ocorrenciaForm.localOcorrencia}
                          onChange={(e) =>
                            setOcorrenciaForm({ ...ocorrenciaForm, localOcorrencia: e.target.value })
                          }
                          placeholder="Ex: Talude de montante, Vertedouro"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="severidade">Severidade *</Label>
                        <Select
                          value={ocorrenciaForm.severidade}
                          onValueChange={(value: any) =>
                            setOcorrenciaForm({ ...ocorrenciaForm, severidade: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="critica">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="categoria">Categoria</Label>
                        <Input
                          id="categoria"
                          value={ocorrenciaForm.categoria}
                          onChange={(e) =>
                            setOcorrenciaForm({ ...ocorrenciaForm, categoria: e.target.value })
                          }
                          placeholder="Ex: Erosão, Infiltração, Trinca"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição Detalhada *</Label>
                      <Textarea
                        id="descricao"
                        value={ocorrenciaForm.descricao}
                        onChange={(e) =>
                          setOcorrenciaForm({ ...ocorrenciaForm, descricao: e.target.value })
                        }
                        rows={4}
                        required
                        placeholder="Descreva a ocorrência em detalhes..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="acaoImediata">Ação Imediata Tomada</Label>
                      <Textarea
                        id="acaoImediata"
                        value={ocorrenciaForm.acaoImediata}
                        onChange={(e) =>
                          setOcorrenciaForm({ ...ocorrenciaForm, acaoImediata: e.target.value })
                        }
                        rows={3}
                        placeholder="Descreva as ações imediatas tomadas..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Input
                          id="responsavel"
                          value={ocorrenciaForm.responsavel}
                          onChange={(e) =>
                            setOcorrenciaForm({ ...ocorrenciaForm, responsavel: e.target.value })
                          }
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={ocorrenciaForm.status}
                          onValueChange={(value: any) =>
                            setOcorrenciaForm({ ...ocorrenciaForm, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aberta">Aberta</SelectItem>
                            <SelectItem value="em_analise">Em Análise</SelectItem>
                            <SelectItem value="em_tratamento">Em Tratamento</SelectItem>
                            <SelectItem value="resolvida">Resolvida</SelectItem>
                            <SelectItem value="fechada">Fechada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createOcorrencia.isPending || updateOcorrencia.isPending}
                      >
                        {createOcorrencia.isPending || updateOcorrencia.isPending
                          ? "Salvando..."
                          : "Salvar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Ocorrências */}
            {ocorrencias && ocorrencias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ocorrencias.map((ocorrencia: any) => (
                  <Card key={ocorrencia.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-2">{ocorrencia.titulo}</CardTitle>
                          <CardDescription className="mt-1">
                            {ocorrencia.dataOcorrencia ? new Date(ocorrencia.dataOcorrencia).toLocaleDateString("pt-BR") : "-"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getSeveridadeColor(ocorrencia.severidade || "baixa")}`}
                        >
                          {getSeveridadeIcon(ocorrencia.severidade || "baixa")}
                          {ocorrencia.severidade || "baixa"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ocorrencia.status)}`}>
                          {getStatusLabel(ocorrencia.status)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {ocorrencia.localOcorrencia && (
                          <div>
                            <span className="font-medium">Local:</span> {ocorrencia.localOcorrencia}
                          </div>
                        )}
                        {ocorrencia.categoria && (
                          <div>
                            <span className="font-medium">Categoria:</span> {ocorrencia.categoria}
                          </div>
                        )}
                        {ocorrencia.responsavel && (
                          <div>
                            <span className="font-medium">Responsável:</span> {ocorrencia.responsavel}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleView(ocorrencia)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(ocorrencia)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDelete(ocorrencia.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">Nenhuma ocorrência registrada</p>
                  <p className="text-muted-foreground mb-4">
                    Comece registrando a primeira ocorrência
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Ocorrência
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Dialog de Visualização */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Ocorrência</DialogTitle>
            </DialogHeader>
            {selectedOcorrencia && (
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <p className="text-sm mt-1 font-medium">{selectedOcorrencia.titulo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data da Ocorrência</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedOcorrencia.dataOcorrencia).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <Label>Local</Label>
                    <p className="text-sm mt-1">{selectedOcorrencia.localOcorrencia || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Severidade</Label>
                    <p className="text-sm mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getSeveridadeColor(selectedOcorrencia.severidade)}`}
                      >
                        {selectedOcorrencia.severidade}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOcorrencia.status)}`}>
                        {getStatusLabel(selectedOcorrencia.status)}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedOcorrencia.categoria && (
                  <div>
                    <Label>Categoria</Label>
                    <p className="text-sm mt-1">{selectedOcorrencia.categoria}</p>
                  </div>
                )}

                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedOcorrencia.descricao}</p>
                </div>

                {selectedOcorrencia.acaoImediata && (
                  <div>
                    <Label>Ação Imediata</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{selectedOcorrencia.acaoImediata}</p>
                  </div>
                )}

                {selectedOcorrencia.responsavel && (
                  <div>
                    <Label>Responsável</Label>
                    <p className="text-sm mt-1">{selectedOcorrencia.responsavel}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

