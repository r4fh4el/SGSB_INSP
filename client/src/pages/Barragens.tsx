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
import { Building2, Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Barragens() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarragem, setEditingBarragem] = useState<any>(null);

  const { data: barragens, isLoading, refetch } = trpc.barragens.list.useQuery();
  const createMutation = trpc.barragens.create.useMutation();
  const updateMutation = trpc.barragens.update.useMutation();
  const deleteMutation = trpc.barragens.delete.useMutation();

  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    rio: "",
    bacia: "",
    municipio: "",
    estado: "",
    latitude: "",
    longitude: "",
    tipo: "",
    finalidade: "",
    altura: "",
    comprimento: "",
    volumeReservatorio: "",
    areaReservatorio: "",
    nivelMaximoNormal: "",
    nivelMaximoMaximorum: "",
    nivelMinimo: "",
    proprietario: "",
    operador: "",
    anoInicioConstrucao: "",
    anoInicioOperacao: "",
    categoriaRisco: "",
    danoPotencialAssociado: "",
    status: "ativa" as "ativa" | "inativa" | "em_construcao",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBarragem) {
        await updateMutation.mutateAsync({
          id: editingBarragem.id,
          data: {
            ...formData,
            anoInicioConstrucao: formData.anoInicioConstrucao ? parseInt(formData.anoInicioConstrucao) : undefined,
            anoInicioOperacao: formData.anoInicioOperacao ? parseInt(formData.anoInicioOperacao) : undefined,
            categoriaRisco: formData.categoriaRisco as any,
            danoPotencialAssociado: formData.danoPotencialAssociado as any,
          },
        });
        toast.success("Barragem atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          anoInicioConstrucao: formData.anoInicioConstrucao ? parseInt(formData.anoInicioConstrucao) : undefined,
          anoInicioOperacao: formData.anoInicioOperacao ? parseInt(formData.anoInicioOperacao) : undefined,
          categoriaRisco: formData.categoriaRisco as any,
          danoPotencialAssociado: formData.danoPotencialAssociado as any,
        });
        toast.success("Barragem cadastrada com sucesso!");
      }

      setDialogOpen(false);
      setEditingBarragem(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar barragem");
    }
  };

  const handleEdit = (barragem: any) => {
    setEditingBarragem(barragem);
    setFormData({
      codigo: barragem.codigo || "",
      nome: barragem.nome || "",
      rio: barragem.rio || "",
      bacia: barragem.bacia || "",
      municipio: barragem.municipio || "",
      estado: barragem.estado || "",
      latitude: barragem.latitude || "",
      longitude: barragem.longitude || "",
      tipo: barragem.tipo || "",
      finalidade: barragem.finalidade || "",
      altura: barragem.altura || "",
      comprimento: barragem.comprimento || "",
      volumeReservatorio: barragem.volumeReservatorio || "",
      areaReservatorio: barragem.areaReservatorio || "",
      nivelMaximoNormal: barragem.nivelMaximoNormal || "",
      nivelMaximoMaximorum: barragem.nivelMaximoMaximorum || "",
      nivelMinimo: barragem.nivelMinimo || "",
      proprietario: barragem.proprietario || "",
      operador: barragem.operador || "",
      anoInicioConstrucao: barragem.anoInicioConstrucao?.toString() || "",
      anoInicioOperacao: barragem.anoInicioOperacao?.toString() || "",
      categoriaRisco: barragem.categoriaRisco || "",
      danoPotencialAssociado: barragem.danoPotencialAssociado || "",
      status: barragem.status || "ativa",
      observacoes: barragem.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta barragem?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Barragem excluída com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir barragem");
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nome: "",
      rio: "",
      bacia: "",
      municipio: "",
      estado: "",
      latitude: "",
      longitude: "",
      tipo: "",
      finalidade: "",
      altura: "",
      comprimento: "",
      volumeReservatorio: "",
      areaReservatorio: "",
      nivelMaximoNormal: "",
      nivelMaximoMaximorum: "",
      nivelMinimo: "",
      proprietario: "",
      operador: "",
      anoInicioConstrucao: "",
      anoInicioOperacao: "",
      categoriaRisco: "",
      danoPotencialAssociado: "",
      status: "ativa",
      observacoes: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Barragens</h1>
            <p className="text-muted-foreground mt-1">Gerenciamento de barragens cadastradas no sistema</p>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingBarragem(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Barragem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBarragem ? "Editar Barragem" : "Nova Barragem"}</DialogTitle>
                <DialogDescription>Preencha os dados da barragem</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rio">Rio</Label>
                    <Input
                      id="rio"
                      value={formData.rio}
                      onChange={(e) => setFormData({ ...formData, rio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bacia">Bacia</Label>
                    <Input
                      id="bacia"
                      value={formData.bacia}
                      onChange={(e) => setFormData({ ...formData, bacia: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="municipio">Município</Label>
                    <Input
                      id="municipio"
                      value={formData.municipio}
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Input
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      placeholder="Ex: Terra, Enrocamento, Concreto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalidade">Finalidade</Label>
                    <Input
                      id="finalidade"
                      value={formData.finalidade}
                      onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="categoriaRisco">Categoria de Risco</Label>
                    <Select value={formData.categoriaRisco} onValueChange={(value) => setFormData({ ...formData, categoriaRisco: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="danoPotencialAssociado">Dano Potencial</Label>
                    <Select value={formData.danoPotencialAssociado} onValueChange={(value) => setFormData({ ...formData, danoPotencialAssociado: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Medio">Médio</SelectItem>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="inativa">Inativa</SelectItem>
                        <SelectItem value="em_construcao">Em Construção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proprietario">Proprietário</Label>
                    <Input
                      id="proprietario"
                      value={formData.proprietario}
                      onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="operador">Operador</Label>
                    <Input
                      id="operador"
                      value={formData.operador}
                      onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Barragens */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando barragens...</p>
          </div>
        ) : barragens && barragens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barragens.map((barragem: any) => (
              <Card key={barragem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {barragem.nome}
                      </CardTitle>
                      <CardDescription className="mt-1">Código: {barragem.codigo}</CardDescription>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        barragem.status === "ativa"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : barragem.status === "inativa"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {barragem.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {barragem.municipio && barragem.estado && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {barragem.municipio} - {barragem.estado}
                      </div>
                    )}
                    {barragem.tipo && (
                      <div>
                        <span className="font-medium">Tipo:</span> {barragem.tipo}
                      </div>
                    )}
                    {barragem.categoriaRisco && (
                      <div>
                        <span className="font-medium">Risco:</span> {barragem.categoriaRisco}
                        {barragem.danoPotencialAssociado && ` | Dano: ${barragem.danoPotencialAssociado}`}
                      </div>
                    )}
                    {barragem.operador && (
                      <div>
                        <span className="font-medium">Operador:</span> {barragem.operador}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(barragem)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(barragem.id)}
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
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium mb-2">Nenhuma barragem cadastrada</p>
              <p className="text-muted-foreground mb-4">Comece cadastrando sua primeira barragem</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Barragem
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

