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
import { Calendar, CheckCircle, Clock, Edit, Plus, Trash2, Wrench, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Manutencoes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManutencao, setEditingManutencao] = useState<any>(null);
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);

  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: manutencoes, refetch: refetchManutencoes } = trpc.manutencoes.listByBarragem.useQuery(
    { barragemId: selectedBarragem! },
    { enabled: !!selectedBarragem }
  );

  const createManutencao = trpc.manutencoes.create.useMutation();
  const updateManutencao = trpc.manutencoes.update.useMutation();
  const deleteManutencao = trpc.manutencoes.delete.useMutation();

  const [manutencaoForm, setManutencaoForm] = useState({
    tipo: "",
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataConclusao: "",
    status: "planejada",
    responsavel: "",
    custoEstimado: "",
    observacoes: "",
  });

  if (!selectedBarragem && barragens && barragens.length > 0) {
    setSelectedBarragem(barragens[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarragem) return;

    try {
      const data = {
        ...manutencaoForm,
        barragemId: selectedBarragem,
      };

      if (editingManutencao) {
        await updateManutencao.mutateAsync({ id: editingManutencao.id, data: data as any });
        toast.success("Manutenção atualizada!");
      } else {
        await createManutencao.mutateAsync(data as any);
        toast.success("Manutenção registrada!");
      }

      setDialogOpen(false);
      setEditingManutencao(null);
      resetForm();
      refetchManutencoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar manutenção");
    }
  };

  const handleEdit = (manutencao: any) => {
    setEditingManutencao(manutencao);
    setManutencaoForm({
      tipo: manutencao.tipo || "",
      titulo: manutencao.titulo || "",
      descricao: manutencao.descricao || "",
      dataInicio: manutencao.dataInicio ? new Date(manutencao.dataInicio).toISOString().split('T')[0] : "",
      dataConclusao: manutencao.dataConclusao ? new Date(manutencao.dataConclusao).toISOString().split('T')[0] : "",
      status: manutencao.status || "planejada",
      responsavel: manutencao.responsavel || "",
      custoEstimado: manutencao.custoEstimado || "",
      observacoes: manutencao.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta manutenção?")) return;
    try {
      await deleteManutencao.mutateAsync({ id });
      toast.success("Manutenção excluída!");
      refetchManutencoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir");
    }
  };

  const resetForm = () => {
    setManutencaoForm({
      tipo: "",
      titulo: "",
      descricao: "",
      dataInicio: "",
      dataConclusao: "",
      status: "planejada",
      responsavel: "",
      custoEstimado: "",
      observacoes: "",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "planejada": "bg-blue-100 text-blue-800",
      "em_andamento": "bg-yellow-100 text-yellow-800",
      "concluida": "bg-green-100 text-green-800",
      "cancelada": "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors["planejada"];
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      "planejada": Calendar,
      "em_andamento": Clock,
      "concluida": CheckCircle,
      "cancelada": XCircle,
    };
    const Icon = icons[status] || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "planejada": "Planejada",
      "em_andamento": "Em Andamento",
      "concluida": "Concluída",
      "cancelada": "Cancelada",
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manutenções</h1>
            <p className="text-muted-foreground mt-1">Gestão de manutenções preventivas e corretivas</p>
          </div>
        </div>

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

        {selectedBarragem && (
          <>
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) { setEditingManutencao(null); resetForm(); }
              }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Nova Manutenção</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingManutencao ? "Editar" : "Nova"} Manutenção</DialogTitle>
                    <DialogDescription>Preencha os dados da manutenção</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo *</Label>
                        <Select value={manutencaoForm.tipo} onValueChange={(v) => setManutencaoForm({...manutencaoForm, tipo: v})} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preventiva">Preventiva</SelectItem>
                            <SelectItem value="corretiva">Corretiva</SelectItem>
                            <SelectItem value="preditiva">Preditiva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status *</Label>
                        <Select value={manutencaoForm.status} onValueChange={(v) => setManutencaoForm({...manutencaoForm, status: v})} required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planejada">Planejada</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Título *</Label>
                      <Input value={manutencaoForm.titulo} onChange={(e) => setManutencaoForm({...manutencaoForm, titulo: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea rows={2} value={manutencaoForm.descricao} onChange={(e) => setManutencaoForm({...manutencaoForm, descricao: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data Início *</Label>
                        <Input type="date" value={manutencaoForm.dataInicio} onChange={(e) => setManutencaoForm({...manutencaoForm, dataInicio: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Data Conclusão</Label>
                        <Input type="date" value={manutencaoForm.dataConclusao} onChange={(e) => setManutencaoForm({...manutencaoForm, dataConclusao: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Responsável</Label>
                        <Input value={manutencaoForm.responsavel} onChange={(e) => setManutencaoForm({...manutencaoForm, responsavel: e.target.value})} />
                      </div>
                      <div>
                        <Label>Custo Estimado (R$)</Label>
                        <Input value={manutencaoForm.custoEstimado} onChange={(e) => setManutencaoForm({...manutencaoForm, custoEstimado: e.target.value})} placeholder="Ex: 5000.00" />
                      </div>
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea rows={2} value={manutencaoForm.observacoes} onChange={(e) => setManutencaoForm({...manutencaoForm, observacoes: e.target.value})} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createManutencao.isPending || updateManutencao.isPending}>Salvar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {manutencoes && manutencoes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {manutencoes.map((manutencao: any) => (
                  <Card key={manutencao.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-primary" />
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(manutencao.status)}`}>
                            {getStatusIcon(manutencao.status)}
                            {getStatusLabel(manutencao.status)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{manutencao.tipo}</span>
                      </div>
                      <CardTitle className="text-lg mt-2">{manutencao.titulo}</CardTitle>
                      <CardDescription>
                        {manutencao.dataInicio ? new Date(manutencao.dataInicio).toLocaleDateString("pt-BR") : "-"}
                        {manutencao.dataConclusao && ` até ${new Date(manutencao.dataConclusao).toLocaleDateString("pt-BR")}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {manutencao.responsavel && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Responsável:</span>
                            <span className="font-medium">{manutencao.responsavel}</span>
                          </div>
                        )}
                        {manutencao.custoEstimado && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Custo Estimado:</span>
                            <span className="font-medium">R$ {manutencao.custoEstimado}</span>
                          </div>
                        )}
                        {manutencao.descricao && (
                          <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{manutencao.descricao}</p>
                        )}
                        {manutencao.observacoes && (
                          <p className="text-muted-foreground mt-2 line-clamp-2">{manutencao.observacoes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(manutencao)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(manutencao.id)}>
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
                  <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">Nenhuma manutenção registrada</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />Nova Manutenção
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

