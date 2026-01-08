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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckSquare, ClipboardList, Edit, Eye, FileText, Plus, Trash2, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Checklists() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<any>(null);
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Queries
  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: checklists, refetch: refetchChecklists } = trpc.checklists.list.useQuery(
    { barragemId: selectedBarragem! },
    { enabled: !!selectedBarragem }
  );

  // Mutations
  const createChecklist = trpc.checklists.create.useMutation();
  const updateChecklist = trpc.checklists.update.useMutation();
  const deleteChecklist = trpc.checklists.delete.useMutation();

  // Form state
  const [checklistForm, setChecklistForm] = useState({
    tipo: "mensal" as "mensal" | "especial" | "emergencial",
    dataInspecao: "",
    inspetor: "",
    climaCondicoes: "",
    observacoesGerais: "",
    status: "em_andamento" as "em_andamento" | "concluida" | "cancelada",
  });

  // Selecionar primeira barragem automaticamente
  if (!selectedBarragem && barragens && barragens.length > 0) {
    setSelectedBarragem(barragens[0].id);
  }

  const handleSubmitChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarragem) return;

    try {
      const data: any = {
        barragemId: selectedBarragem,
        data: checklistForm.dataInspecao 
          ? new Date(checklistForm.dataInspecao).toISOString()
          : new Date().toISOString(),
        tipo: checklistForm.tipo || "mensal",
      };
      
      if (checklistForm.observacoesGerais) {
        data.observacoesGerais = checklistForm.observacoesGerais;
      }

      if (editingChecklist) {
        await updateChecklist.mutateAsync({
          id: editingChecklist.id,
          data: {
            tipo: checklistForm.tipo || undefined,
            inspetor: checklistForm.inspetor || undefined,
            climaCondicoes: checklistForm.climaCondicoes || undefined,
            status: checklistForm.status || undefined,
            observacoesGerais: checklistForm.observacoesGerais || undefined,
          } as any,
        });
        toast.success("Checklist atualizado com sucesso!");
      } else {
        await createChecklist.mutateAsync(data);
        toast.success("Checklist criado com sucesso!");
      }

      setDialogOpen(false);
      setEditingChecklist(null);
      resetChecklistForm();
      refetchChecklists();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar checklist");
    }
  };

  const handleEdit = (checklist: any) => {
    setEditingChecklist(checklist);
    setChecklistForm({
      tipo: (checklist.tipo || "mensal") as "mensal" | "especial" | "emergencial",
      dataInspecao: checklist.data
        ? new Date(checklist.data).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      inspetor: checklist.inspetor || "",
      climaCondicoes: checklist.climaCondicoes || "",
      observacoesGerais: checklist.observacoesGerais || "",
      status: checklist.status || "em_andamento",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este checklist?")) return;

    try {
      await deleteChecklist.mutateAsync({ id });
      toast.success("Checklist excluído com sucesso!");
      refetchChecklists();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir checklist");
    }
  };

  const handleView = (checklist: any) => {
    setSelectedChecklist(checklist);
    setViewDialogOpen(true);
  };

  const resetChecklistForm = () => {
    setChecklistForm({
      tipo: "mensal" as "mensal" | "especial" | "emergencial",
      dataInspecao: "",
      inspetor: "",
      climaCondicoes: "",
      observacoesGerais: "",
      status: "em_andamento",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "em_andamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída";
      case "em_andamento":
        return "Em Andamento";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "ISR":
        return "Inspeção de Segurança Regular (ISR)";
      case "ISE":
        return "Inspeção de Segurança Especial (ISE)";
      case "ISP":
        return "Inspeção de Segurança Periódica (ISP)";
      default:
        return tipo;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Checklists de Inspeção</h1>
            <p className="text-muted-foreground mt-1">Gerenciamento de inspeções de segurança</p>
          </div>
        </div>

        {/* Seletor de Barragem */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione uma Barragem</CardTitle>
            <CardDescription>
              Selecione uma barragem para visualizar ou criar inspeções
            </CardDescription>
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
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Inspeções da Barragem Selecionada
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie as inspeções desta barragem
                </p>
              </div>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setEditingChecklist(null);
                    resetChecklistForm();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Inspeção
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingChecklist ? "Editar Inspeção" : "Nova Inspeção"}
                    </DialogTitle>
                    <DialogDescription>Preencha os dados da inspeção</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitChecklist} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo">Tipo de Inspeção *</Label>
                        <Select
                          value={checklistForm.tipo}
                          onValueChange={(value) =>
                            setChecklistForm({ ...checklistForm, tipo: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="especial">Especial</SelectItem>
                            <SelectItem value="emergencial">Emergencial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dataInspecao">Data da Inspeção *</Label>
                        <Input
                          id="dataInspecao"
                          type="date"
                          value={checklistForm.dataInspecao}
                          onChange={(e) =>
                            setChecklistForm({ ...checklistForm, dataInspecao: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inspetor">Inspetor Responsável *</Label>
                        <Input
                          id="inspetor"
                          value={checklistForm.inspetor}
                          onChange={(e) =>
                            setChecklistForm({ ...checklistForm, inspetor: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="climaCondicoes">Condições Climáticas</Label>
                        <Input
                          id="climaCondicoes"
                          value={checklistForm.climaCondicoes}
                          onChange={(e) =>
                            setChecklistForm({ ...checklistForm, climaCondicoes: e.target.value })
                          }
                          placeholder="Ex: Ensolarado, Nublado, Chuvoso"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={checklistForm.status}
                        onValueChange={(value: any) =>
                          setChecklistForm({ ...checklistForm, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="observacoesGerais">Observações Gerais</Label>
                      <Textarea
                        id="observacoesGerais"
                        value={checklistForm.observacoesGerais}
                        onChange={(e) =>
                          setChecklistForm({ ...checklistForm, observacoesGerais: e.target.value })
                        }
                        rows={4}
                        placeholder="Observações gerais sobre a inspeção..."
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createChecklist.isPending || updateChecklist.isPending}
                      >
                        {createChecklist.isPending || updateChecklist.isPending
                          ? "Salvando..."
                          : "Salvar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Checklists */}
            {checklists && checklists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklists.map((checklist: any) => (
                  <Card key={checklist.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            {getTipoLabel(checklist.tipo)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(checklist.data).toLocaleDateString("pt-BR")}
                          </CardDescription>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(checklist.status)}`}>
                          {getStatusLabel(checklist.status)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {checklist.inspetor && (
                          <div>
                            <span className="font-medium">Inspetor:</span> {checklist.inspetor}
                          </div>
                        )}
                        {checklist.climaCondicoes && (
                          <div>
                            <span className="font-medium">Clima:</span> {checklist.climaCondicoes}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleView(checklist)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(checklist)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDelete(checklist.id)}
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
                  <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">Nenhuma inspeção cadastrada</p>
                  <p className="text-muted-foreground mb-4">
                    Comece cadastrando a primeira inspeção
                  </p>
                  <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) {
                        setEditingChecklist(null);
                        resetChecklistForm();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Inspeção
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingChecklist ? "Editar Inspeção" : "Nova Inspeção"}
                        </DialogTitle>
                        <DialogDescription>Preencha os dados da inspeção</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitChecklist} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tipo">Tipo de Inspeção *</Label>
                            <Select
                              value={checklistForm.tipo}
                              onValueChange={(value) =>
                                setChecklistForm({ ...checklistForm, tipo: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mensal">Mensal</SelectItem>
                                <SelectItem value="especial">Especial</SelectItem>
                                <SelectItem value="emergencial">Emergencial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dataInspecao">Data da Inspeção *</Label>
                            <Input
                              id="dataInspecao"
                              type="date"
                              value={checklistForm.dataInspecao}
                              onChange={(e) =>
                                setChecklistForm({ ...checklistForm, dataInspecao: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="inspetor">Inspetor Responsável *</Label>
                            <Input
                              id="inspetor"
                              value={checklistForm.inspetor}
                              onChange={(e) =>
                                setChecklistForm({ ...checklistForm, inspetor: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="climaCondicoes">Condições Climáticas</Label>
                            <Input
                              id="climaCondicoes"
                              value={checklistForm.climaCondicoes}
                              onChange={(e) =>
                                setChecklistForm({ ...checklistForm, climaCondicoes: e.target.value })
                              }
                              placeholder="Ex: Ensolarado, Nublado, Chuvoso"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={checklistForm.status}
                            onValueChange={(value: any) =>
                              setChecklistForm({ ...checklistForm, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="observacoesGerais">Observações Gerais</Label>
                          <Textarea
                            id="observacoesGerais"
                            value={checklistForm.observacoesGerais}
                            onChange={(e) =>
                              setChecklistForm({ ...checklistForm, observacoesGerais: e.target.value })
                            }
                            rows={4}
                            placeholder="Observações gerais sobre a inspeção..."
                          />
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={createChecklist.isPending || updateChecklist.isPending}
                          >
                            {createChecklist.isPending || updateChecklist.isPending
                              ? "Salvando..."
                              : "Salvar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium mb-2">Selecione uma Barragem</p>
              <p className="text-muted-foreground mb-4">
                Selecione uma barragem acima para visualizar ou criar inspeções
              </p>
              {(!barragens || barragens.length === 0) && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhuma barragem cadastrada. Cadastre uma barragem primeiro.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/barragens">
                      Ir para Barragens
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog de Visualização */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Inspeção</DialogTitle>
              <DialogDescription>
                {selectedChecklist && getTipoLabel(selectedChecklist.tipo)}
              </DialogDescription>
            </DialogHeader>
            {selectedChecklist && (
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dados">Dados da Inspeção</TabsTrigger>
                  <TabsTrigger value="caracterizacao">Caracterização da Barragem</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data da Inspeção</Label>
                      <p className="text-sm mt-1">
                        {new Date(selectedChecklist.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedChecklist.status)}`}>
                          {getStatusLabel(selectedChecklist.status)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Inspetor</Label>
                      <p className="text-sm mt-1">{selectedChecklist.inspetor || "-"}</p>
                    </div>
                    <div>
                      <Label>Condições Climáticas</Label>
                      <p className="text-sm mt-1">{selectedChecklist.climaCondicoes || "-"}</p>
                    </div>
                  </div>
                  {selectedChecklist.observacoesGerais && (
                    <div>
                      <Label>Observações Gerais</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {selectedChecklist.observacoesGerais}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="caracterizacao">
                  <CaracterizacaoForm checklistId={selectedChecklist.id} barragemId={selectedChecklist.barragemId} />
                </TabsContent>
              </Tabs>
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

// Componente de Formulário de Caracterização
function CaracterizacaoForm({ checklistId, barragemId }: { checklistId: number; barragemId: number }) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const { data: caracterizacao, refetch } = trpc.checklists.getCaracterizacao.useQuery(
    { checklistId },
    { enabled: !!checklistId }
  );
  
  const createCaracterizacao = trpc.checklists.createCaracterizacao.useMutation();
  const updateCaracterizacao = trpc.checklists.updateCaracterizacao.useMutation();

  useEffect(() => {
    if (caracterizacao) {
      setFormData(caracterizacao);
    } else {
      setFormData({ checklistId, barragemId });
    }
  }, [caracterizacao, checklistId, barragemId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (caracterizacao?.id) {
        await updateCaracterizacao.mutateAsync({
          id: caracterizacao.id,
          data: formData,
        });
        toast.success("Caracterização atualizada com sucesso!");
      } else {
        await createCaracterizacao.mutateAsync(formData);
        toast.success("Caracterização salva com sucesso!");
      }
      refetch();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dados para Cálculos Hidrológicos
          </h3>
          <p className="text-sm text-muted-foreground">
            Preencha os dados que serão utilizados para automatizar os cálculos no SGSB-HIDRO
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Caracterização"}
        </Button>
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
        </TabsContent>

        {/* Tempo de Concentração */}
        <TabsContent value="tempo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tempo de Concentração</CardTitle>
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
        </TabsContent>

        {/* Vazão de Pico */}
        <TabsContent value="vazao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vazão de Pico</CardTitle>
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
        </TabsContent>
      </Tabs>

      {/* Metadados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadados da Medição</CardTitle>
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
  );
}

