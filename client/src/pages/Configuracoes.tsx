import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { APP_LOGO, APP_TITLE } from "@shared/const";
import { Bell, Database, FileText, Mail, Save, Settings as SettingsIcon, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Configuracoes() {
  const [notificacoes, setNotificacoes] = useState({
    emailAlertas: true,
    emailRelatorios: false,
    pushAlertas: true,
    pushInspecoes: true,
  });

  const [limites, setLimites] = useState({
    piezometroAlto: "10",
    piezometroCritico: "15",
    vazaoAlta: "100",
    vazaoCritica: "150",
  });

  const [sistema, setSistema] = useState({
    backupAutomatico: true,
    frequenciaBackup: "diario",
    retencaoDados: "365",
  });

  const handleSaveNotificacoes = () => {
    toast.success("Configurações de notificações salvas!");
  };

  const handleSaveLimites = () => {
    toast.success("Limites de alertas salvos!");
  };

  const handleSaveSistema = () => {
    toast.success("Configurações do sistema salvas!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema</p>
          </div>
        </div>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>Informações do Sistema</CardTitle>
            </div>
            <CardDescription>Detalhes sobre a instalação do SGSB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Nome do Sistema</Label>
                <p className="font-medium">{APP_TITLE}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Versão</Label>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ambiente</Label>
                <p className="font-medium">Produção</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Última Atualização</Label>
                <p className="font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configure como você deseja receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas por Email</Label>
                <p className="text-sm text-muted-foreground">Receber alertas críticos por email</p>
              </div>
              <Switch
                checked={notificacoes.emailAlertas}
                onCheckedChange={(v) => setNotificacoes({ ...notificacoes, emailAlertas: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Relatórios por Email</Label>
                <p className="text-sm text-muted-foreground">Receber relatórios periódicos por email</p>
              </div>
              <Switch
                checked={notificacoes.emailRelatorios}
                onCheckedChange={(v) => setNotificacoes({ ...notificacoes, emailRelatorios: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push - Alertas</Label>
                <p className="text-sm text-muted-foreground">Notificações push para alertas</p>
              </div>
              <Switch
                checked={notificacoes.pushAlertas}
                onCheckedChange={(v) => setNotificacoes({ ...notificacoes, pushAlertas: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push - Inspeções</Label>
                <p className="text-sm text-muted-foreground">Notificações push para inspeções pendentes</p>
              </div>
              <Switch
                checked={notificacoes.pushInspecoes}
                onCheckedChange={(v) => setNotificacoes({ ...notificacoes, pushInspecoes: v })}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveNotificacoes}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Notificações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Limites de Alertas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Limites de Alertas</CardTitle>
            </div>
            <CardDescription>Configure os limites para geração automática de alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Piezômetro - Nível Alto (m)</Label>
                <Input
                  type="number"
                  value={limites.piezometroAlto}
                  onChange={(e) => setLimites({ ...limites, piezometroAlto: e.target.value })}
                />
              </div>
              <div>
                <Label>Piezômetro - Nível Crítico (m)</Label>
                <Input
                  type="number"
                  value={limites.piezometroCritico}
                  onChange={(e) => setLimites({ ...limites, piezometroCritico: e.target.value })}
                />
              </div>
              <div>
                <Label>Vazão Alta (m³/s)</Label>
                <Input
                  type="number"
                  value={limites.vazaoAlta}
                  onChange={(e) => setLimites({ ...limites, vazaoAlta: e.target.value })}
                />
              </div>
              <div>
                <Label>Vazão Crítica (m³/s)</Label>
                <Input
                  type="number"
                  value={limites.vazaoCritica}
                  onChange={(e) => setLimites({ ...limites, vazaoCritica: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveLimites}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Limites
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Sistema</CardTitle>
            </div>
            <CardDescription>Configurações gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Realizar backup automático dos dados</p>
              </div>
              <Switch
                checked={sistema.backupAutomatico}
                onCheckedChange={(v) => setSistema({ ...sistema, backupAutomatico: v })}
              />
            </div>
            <Separator />
            <div>
              <Label>Retenção de Dados (dias)</Label>
              <Input
                type="number"
                value={sistema.retencaoDados}
                onChange={(e) => setSistema({ ...sistema, retencaoDados: e.target.value })}
                placeholder="365"
              />
              <p className="text-xs text-muted-foreground mt-1">Tempo de retenção de dados históricos</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveSistema}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Integrações</CardTitle>
            </div>
            <CardDescription>Configure integrações com serviços externos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Servidor SMTP</Label>
                <Input placeholder="smtp.exemplo.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Porta</Label>
                  <Input placeholder="587" />
                </div>
                <div>
                  <Label>Email Remetente</Label>
                  <Input placeholder="sgsb@exemplo.com" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Integrações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Relatórios</CardTitle>
            </div>
            <CardDescription>Configurações de geração de relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Automáticos</Label>
                  <p className="text-sm text-muted-foreground">Gerar relatórios mensais automaticamente</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Incluir Gráficos</Label>
                  <p className="text-sm text-muted-foreground">Adicionar gráficos aos relatórios</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end mt-4">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Relatórios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

