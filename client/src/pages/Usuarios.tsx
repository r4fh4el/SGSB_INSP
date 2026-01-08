import { useAuth } from "@/_core/hooks/useAuth";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@shared/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Edit, Plus, Shield, Trash2, UserCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users, refetch: refetchUsers } = trpc.users.list.useQuery();
  const updateUserRole = trpc.users.updateRole.useMutation();
  const toggleUserStatus = trpc.users.toggleStatus.useMutation();

  const [userForm, setUserForm] = useState({
    role: "user",
  });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("Você não pode alterar seu próprio papel!");
      return;
    }
    
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole as any });
      toast.success("Papel atualizado!");
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar papel");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser?.id) {
      toast.error("Você não pode desativar sua própria conta!");
      return;
    }

    try {
      await toggleUserStatus.mutateAsync({ userId });
      toast.success(currentStatus ? "Usuário desativado!" : "Usuário ativado!");
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar status");
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      "admin": "bg-red-100 text-red-800",
      "gestor": "bg-purple-100 text-purple-800",
      "consultor": "bg-blue-100 text-blue-800",
      "inspetor": "bg-green-100 text-green-800",
      "leiturista": "bg-yellow-100 text-yellow-800",
      "visualizador": "bg-gray-100 text-gray-800",
      "user": "bg-gray-100 text-gray-800",
    };
    return colors[role] || colors["user"];
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") return <Shield className="h-4 w-4" />;
    return <UserCircle className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground mt-1">Gestão de usuários e permissões</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Gerencie os usuários e suas permissões no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                          {user.name || "Sem nome"}
                        </div>
                      </TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleUpdateRole(user.id, v)}
                          disabled={user.id === currentUser?.id || updateUserRole.isPending}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                                {getRoleIcon(user.role)}
                                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="gestor">Gestor</SelectItem>
                            <SelectItem value="consultor">Consultor</SelectItem>
                            <SelectItem value="inspetor">Inspetor</SelectItem>
                            <SelectItem value="leiturista">Leiturista</SelectItem>
                            <SelectItem value="visualizador">Visualizador</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.ativo)}
                          disabled={user.id === currentUser?.id || toggleUserStatus.isPending}
                        >
                          {user.ativo ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Ativo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <XCircle className="h-4 w-4" />
                              Inativo
                            </span>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-muted-foreground">Você</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <UserCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-medium mb-2">Nenhum usuário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre Papéis e Permissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  Administrador
                </h4>
                <p className="text-muted-foreground">Acesso total ao sistema, incluindo gestão de usuários e configurações.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-purple-600" />
                  Gestor
                </h4>
                <p className="text-muted-foreground">Gerencia barragens, aprova inspeções e toma decisões operacionais.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-blue-600" />
                  Consultor
                </h4>
                <p className="text-muted-foreground">Acesso completo para análise e elaboração de relatórios técnicos.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-green-600" />
                  Inspetor
                </h4>
                <p className="text-muted-foreground">Realiza inspeções em campo e registra ocorrências.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-yellow-600" />
                  Leiturista
                </h4>
                <p className="text-muted-foreground">Registra leituras de instrumentos e dados de hidrometria.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-gray-600" />
                  Visualizador
                </h4>
                <p className="text-muted-foreground">Acesso somente leitura para consulta de informações.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

