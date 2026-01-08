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
import { Droplets, Edit, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Hidrometria() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHidrometria, setEditingHidrometria] = useState<any>(null);
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);

  const { data: barragens } = trpc.barragens.list.useQuery();
  const { data: hidrometrias, refetch: refetchHidrometrias } = trpc.hidrometria.listByBarragem.useQuery(
    { barragemId: selectedBarragem!, limit: 50 },
    { enabled: !!selectedBarragem }
  );

  const createHidrometria = trpc.hidrometria.create.useMutation();
  const updateHidrometria = trpc.hidrometria.update.useMutation();
  const deleteHidrometria = trpc.hidrometria.delete.useMutation();

  const [hidrometriaForm, setHidrometriaForm] = useState({
    dataLeitura: "",
    nivelMontante: "",
    nivelJusante: "",
    nivelReservatorio: "",
    vazaoAfluente: "",
    vazaoDefluente: "",
    vazaoVertedouro: "",
    volumeArmazenado: "",
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
        ...hidrometriaForm,
        barragemId: selectedBarragem,
        dataLeitura: hidrometriaForm.dataLeitura ? new Date(hidrometriaForm.dataLeitura) : new Date(),
      };

      if (editingHidrometria) {
        await updateHidrometria.mutateAsync({ id: editingHidrometria.id, data: data as any });
        toast.success("Leitura atualizada!");
      } else {
        await createHidrometria.mutateAsync(data as any);
        toast.success("Leitura registrada!");
      }

      setDialogOpen(false);
      setEditingHidrometria(null);
      resetForm();
      refetchHidrometrias();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    }
  };

  const handleEdit = (h: any) => {
    setEditingHidrometria(h);
    setHidrometriaForm({
      dataLeitura: h.dataLeitura ? new Date(h.dataLeitura).toISOString().split("T")[0] : "",
      nivelMontante: h.nivelMontante || "",
      nivelJusante: h.nivelJusante || "",
      nivelReservatorio: h.nivelReservatorio || "",
      vazaoAfluente: h.vazaoAfluente || "",
      vazaoDefluente: h.vazaoDefluente || "",
      vazaoVertedouro: h.vazaoVertedouro || "",
      volumeArmazenado: h.volumeArmazenado || "",
      observacoes: h.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta leitura?")) return;
    try {
      await deleteHidrometria.mutateAsync({ id });
      toast.success("Leitura excluída!");
      refetchHidrometrias();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir");
    }
  };

  const resetForm = () => {
    setHidrometriaForm({
      dataLeitura: "",
      nivelMontante: "",
      nivelJusante: "",
      nivelReservatorio: "",
      vazaoAfluente: "",
      vazaoDefluente: "",
      vazaoVertedouro: "",
      volumeArmazenado: "",
      observacoes: "",
    });
  };

  const getTendencia = (atual: string | null, anterior: string | null) => {
    if (!atual || !anterior) return null;
    const a = parseFloat(atual);
    const b = parseFloat(anterior);
    if (isNaN(a) || isNaN(b)) return null;
    if (a > b) return { icon: <TrendingUp className="h-4 w-4 text-green-600" />, text: "↑" };
    if (a < b) return { icon: <TrendingDown className="h-4 w-4 text-red-600" />, text: "↓" };
    return { icon: null, text: "=" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hidrometria</h1>
            <p className="text-muted-foreground mt-1">Registro de níveis d'água e vazões</p>
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
                if (!open) { setEditingHidrometria(null); resetForm(); }
              }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Registrar Leitura</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingHidrometria ? "Editar" : "Nova"} Leitura</DialogTitle>
                    <DialogDescription>Dados hidrométr icos</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Data *</Label>
                      <Input type="date" value={hidrometriaForm.dataLeitura} onChange={(e) => setHidrometriaForm({...hidrometriaForm, dataLeitura: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Nível Montante (m)</Label>
                        <Input type="number" step="0.01" value={hidrometriaForm.nivelMontante} onChange={(e) => setHidrometriaForm({...hidrometriaForm, nivelMontante: e.target.value})} />
                      </div>
                      <div>
                        <Label>Nível Jusante (m)</Label>
                        <Input type="number" step="0.01" value={hidrometriaForm.nivelJusante} onChange={(e) => setHidrometriaForm({...hidrometriaForm, nivelJusante: e.target.value})} />
                      </div>
                      <div>
                        <Label>Nível Reservatório (m)</Label>
                        <Input type="number" step="0.01" value={hidrometriaForm.nivelReservatorio} onChange={(e) => setHidrometriaForm({...hidrometriaForm, nivelReservatorio: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Vazão Afluente (m³/s)</Label>
                        <Input type="number" step="0.01" value={hidrometriaForm.vazaoAfluente} onChange={(e) => setHidrometriaForm({...hidrometriaForm, vazaoAfluente: e.target.value})} />
                      </div>
                      <div>
                        <Label>Vazão Defluente (m³/s)</Label>
                        <Input type="number" step="0.01" value={hidrometriaForm.vazaoDefluente} onChange={(e) => setHidrometriaForm({...hidrometriaForm, vazaoDefluente: e.target.value})} />
                      </div>
                      <div>
                        <Label>Vazão Vertedouro (m³/s)</Label>
                        <Input type="number" step="0.01" value={hidrometriaForm.vazaoVertedouro} onChange={(e) => setHidrometriaForm({...hidrometriaForm, vazaoVertedouro: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <Label>Volume Armazenado (m³)</Label>
                      <Input type="number" step="0.01" value={hidrometriaForm.volumeArmazenado} onChange={(e) => setHidrometriaForm({...hidrometriaForm, volumeArmazenado: e.target.value})} />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea rows={3} value={hidrometriaForm.observacoes} onChange={(e) => setHidrometriaForm({...hidrometriaForm, observacoes: e.target.value})} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createHidrometria.isPending || updateHidrometria.isPending}>
                        {createHidrometria.isPending || updateHidrometria.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {hidrometrias && hidrometrias.length > 0 ? (
              <div className="space-y-4">
                {hidrometrias.map((h: any, i: number) => {
                  const ant = i < hidrometrias.length - 1 ? hidrometrias[i + 1] : null;
                  return (
                    <Card key={h.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Leitura de {h.dataLeitura ? new Date(h.dataLeitura).toLocaleDateString("pt-BR") : "-"}
                            </CardTitle>
                            <CardDescription>
                              Registrado em {h.createdAt ? new Date(h.createdAt).toLocaleString("pt-BR") : "-"}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(h)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(h.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {h.nivelMontante && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Nível Montante</p>
                              <p className="text-lg font-semibold flex items-center gap-2">
                                {h.nivelMontante} m {getTendencia(h.nivelMontante || null, ant?.nivelMontante || null)?.icon}
                              </p>
                            </div>
                          )}
                          {h.nivelJusante && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Nível Jusante</p>
                              <p className="text-lg font-semibold flex items-center gap-2">
                                {h.nivelJusante} m {getTendencia(h.nivelJusante || null, ant?.nivelJusante || null)?.icon}
                              </p>
                            </div>
                          )}
                          {h.nivelReservatorio && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Nível Reservatório</p>
                              <p className="text-lg font-semibold flex items-center gap-2">
                                {h.nivelReservatorio} m {getTendencia(h.nivelReservatorio || null, ant?.nivelReservatorio || null)?.icon}
                              </p>
                            </div>
                          )}
                          {h.volumeArmazenado && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Volume</p>
                              <p className="text-lg font-semibold">{h.volumeArmazenado} m³</p>
                            </div>
                          )}
                          {h.vazaoAfluente && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Vazão Afluente</p>
                              <p className="text-lg font-semibold">{h.vazaoAfluente} m³/s</p>
                            </div>
                          )}
                          {h.vazaoDefluente && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Vazão Defluente</p>
                              <p className="text-lg font-semibold">{h.vazaoDefluente} m³/s</p>
                            </div>
                          )}
                          {h.vazaoVertedouro && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Vazão Vertedouro</p>
                              <p className="text-lg font-semibold">{h.vazaoVertedouro} m³/s</p>
                            </div>
                          )}
                        </div>
                        {h.observacoes && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">Observações</p>
                            <p className="text-sm mt-1">{h.observacoes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Droplets className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">Nenhuma leitura registrada</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />Registrar Leitura
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

