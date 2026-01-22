import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Code, Play, Copy, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

// Definição dos routers e procedures disponíveis
const apiRouters = {
  auth: {
    description: "Autenticação e sessão",
    procedures: [
      { name: "me", type: "query", description: "Obter informações do usuário atual", public: true },
      { name: "logout", type: "mutation", description: "Fazer logout", public: true },
    ],
  },
  users: {
    description: "Gerenciamento de usuários",
    procedures: [
      { name: "list", type: "query", description: "Listar todos os usuários", admin: true },
      { name: "updateRole", type: "mutation", description: "Atualizar role do usuário", admin: true },
      { name: "toggleStatus", type: "mutation", description: "Ativar/desativar usuário", admin: true },
    ],
  },
  barragens: {
    description: "Gerenciamento de barragens",
    procedures: [
      { name: "list", type: "query", description: "Listar todas as barragens", protected: true },
      { name: "getById", type: "query", description: "Obter barragem por ID", protected: true },
      { name: "create", type: "mutation", description: "Criar nova barragem", admin: true },
      { name: "update", type: "mutation", description: "Atualizar barragem", admin: true },
      { name: "delete", type: "mutation", description: "Deletar barragem", admin: true },
    ],
  },
  instrumentos: {
    description: "Gerenciamento de instrumentos",
    procedures: [
      { name: "list", type: "query", description: "Listar instrumentos", protected: true },
      { name: "getById", type: "query", description: "Obter instrumento por ID", protected: true },
      { name: "getByCodigo", type: "query", description: "Obter instrumento por código", protected: true },
      { name: "create", type: "mutation", description: "Criar novo instrumento", admin: true },
      { name: "update", type: "mutation", description: "Atualizar instrumento", admin: true },
      { name: "delete", type: "mutation", description: "Deletar instrumento", admin: true },
      { name: "leituras", type: "query", description: "Listar leituras do instrumento", protected: true },
      { name: "createLeitura", type: "mutation", description: "Criar nova leitura", protected: true },
      { name: "deleteLeitura", type: "mutation", description: "Deletar leitura", protected: true },
    ],
  },
  checklists: {
    description: "Gerenciamento de checklists de inspeção",
    procedures: [
      { name: "list", type: "query", description: "Listar checklists", protected: true },
      { name: "listByBarragem", type: "query", description: "Listar checklists por barragem", protected: true },
      { name: "getById", type: "query", description: "Obter checklist por ID", protected: true },
      { name: "create", type: "mutation", description: "Criar novo checklist", protected: true },
      { name: "update", type: "mutation", description: "Atualizar checklist", protected: true },
      { name: "delete", type: "mutation", description: "Deletar checklist", admin: true },
      { name: "listPerguntas", type: "query", description: "Listar perguntas do checklist", protected: true },
      { name: "createPergunta", type: "mutation", description: "Criar pergunta", admin: true },
      { name: "createResposta", type: "mutation", description: "Criar resposta", protected: true },
      { name: "getCaracterizacao", type: "query", description: "Obter caracterização", protected: true },
      { name: "createCaracterizacao", type: "mutation", description: "Criar caracterização", protected: true },
      { name: "updateCaracterizacao", type: "mutation", description: "Atualizar caracterização", protected: true },
    ],
  },
  questionarios: {
    description: "Gerenciamento de questionários de inspeção",
    procedures: [
      { name: "list", type: "query", description: "Listar questionários", protected: true },
      { name: "listByBarragem", type: "query", description: "Listar questionários por barragem", protected: true },
      { name: "getById", type: "query", description: "Obter questionário por ID", protected: true },
      { name: "create", type: "mutation", description: "Criar novo questionário", protected: true },
      { name: "update", type: "mutation", description: "Atualizar questionário", protected: true },
      { name: "delete", type: "mutation", description: "Deletar questionário", protected: true },
    ],
  },
  leituras: {
    description: "Gerenciamento de leituras de instrumentos",
    procedures: [
      { name: "listByInstrumento", type: "query", description: "Listar leituras por instrumento", protected: true },
      { name: "listByBarragem", type: "query", description: "Listar leituras por barragem", protected: true },
      { name: "countByBarragem", type: "query", description: "Contar leituras por barragem", protected: true },
      { name: "getUltima", type: "query", description: "Obter última leitura", protected: true },
      { name: "listInconsistencias", type: "query", description: "Listar leituras com inconsistências", protected: true },
      { name: "create", type: "mutation", description: "Criar nova leitura", protected: true },
      { name: "delete", type: "mutation", description: "Deletar leitura", protected: true },
    ],
  },
  ocorrencias: {
    description: "Gerenciamento de ocorrências",
    procedures: [
      { name: "listByBarragem", type: "query", description: "Listar ocorrências por barragem", protected: true },
      { name: "getById", type: "query", description: "Obter ocorrência por ID", protected: true },
      { name: "create", type: "mutation", description: "Criar nova ocorrência", protected: true },
      { name: "update", type: "mutation", description: "Atualizar ocorrência", protected: true },
      { name: "delete", type: "mutation", description: "Deletar ocorrência", protected: true },
    ],
  },
  hidrometria: {
    description: "Gerenciamento de dados hidrométricos",
    procedures: [
      { name: "listByBarragem", type: "query", description: "Listar hidrometria por barragem", protected: true },
      { name: "getUltima", type: "query", description: "Obter última hidrometria", protected: true },
      { name: "create", type: "mutation", description: "Criar nova hidrometria", protected: true },
      { name: "update", type: "mutation", description: "Atualizar hidrometria", protected: true },
      { name: "delete", type: "mutation", description: "Deletar hidrometria", protected: true },
    ],
  },
  documentos: {
    description: "Gerenciamento de documentos",
    procedures: [
      { name: "listByBarragem", type: "query", description: "Listar documentos por barragem", protected: true },
      { name: "getById", type: "query", description: "Obter documento por ID", protected: true },
      { name: "create", type: "mutation", description: "Criar novo documento", protected: true },
      { name: "update", type: "mutation", description: "Atualizar documento", protected: true },
      { name: "delete", type: "mutation", description: "Deletar documento", protected: true },
      { name: "upload", type: "mutation", description: "Upload de arquivo", protected: true },
    ],
  },
  manutencoes: {
    description: "Gerenciamento de manutenções",
    procedures: [
      { name: "listByBarragem", type: "query", description: "Listar manutenções por barragem", protected: true },
      { name: "create", type: "mutation", description: "Criar nova manutenção", admin: true },
      { name: "update", type: "mutation", description: "Atualizar manutenção", admin: true },
      { name: "delete", type: "mutation", description: "Deletar manutenção", admin: true },
    ],
  },
  alertas: {
    description: "Gerenciamento de alertas",
    procedures: [
      { name: "listByBarragem", type: "query", description: "Listar alertas por barragem", protected: true },
      { name: "marcarLido", type: "mutation", description: "Marcar alerta como lido", protected: true },
    ],
  },
  dashboard: {
    description: "Dados do dashboard",
    procedures: [
      { name: "getData", type: "query", description: "Obter dados do dashboard", protected: true },
    ],
  },
};

export default function ApiDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getEndpointUrl = (router: string, procedure: string) => {
    return `/api/trpc/${router}.${procedure}`;
  };

  const getMethodColor = (type: string) => {
    return type === "query" ? "bg-blue-500" : "bg-green-500";
  };

  const getAccessBadge = (procedure: any) => {
    if (procedure.public) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Público</Badge>;
    }
    if (procedure.admin) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Admin</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Protegido</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Code className="h-8 w-8" />
              Documentação da API tRPC
            </h1>
            <p className="text-muted-foreground mt-2">
              Interface gráfica para visualizar e testar todos os endpoints da API
            </p>
          </div>
        </div>

        {/* Informações da API */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Base URL</Label>
                <div className="font-mono text-sm mt-1">/api/trpc</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Protocolo</Label>
                <div className="text-sm mt-1">tRPC (TypeScript RPC)</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Formato</Label>
                <div className="text-sm mt-1">JSON com SuperJSON</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routers */}
        <div className="space-y-4">
          {Object.entries(apiRouters).map(([routerName, router]) => (
            <Card key={routerName}>
              <CardHeader>
                <CardTitle className="text-xl">{routerName}</CardTitle>
                <CardDescription>{router.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {router.procedures.map((procedure) => {
                    const endpoint = `${routerName}.${procedure.name}`;
                    const endpointUrl = getEndpointUrl(routerName, procedure.name);
                    const method = procedure.type === "query" ? "GET" : "POST";

                    return (
                      <AccordionItem key={endpoint} value={endpoint}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3 w-full">
                            <Badge className={getMethodColor(procedure.type)}>
                              {method}
                            </Badge>
                            <span className="font-mono text-sm">{endpoint}</span>
                            {getAccessBadge(procedure)}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label className="text-sm font-semibold">Descrição</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {procedure.description}
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-semibold">Endpoint</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                                  {endpointUrl}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(endpointUrl, endpoint)}
                                >
                                  {copiedEndpoint === endpoint ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-semibold">Método HTTP</Label>
                              <div className="mt-2">
                                <Badge className={getMethodColor(procedure.type)}>
                                  {method}
                                </Badge>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {procedure.type === "query" 
                                    ? "Busca dados (sem efeitos colaterais)" 
                                    : "Modifica dados (com efeitos colaterais)"}
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-semibold">Acesso</Label>
                              <div className="mt-2">
                                {getAccessBadge(procedure)}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-semibold">Exemplo de Uso (Frontend)</Label>
                              <div className="mt-2 p-3 bg-muted rounded-md">
                                <code className="text-xs">
                                  {procedure.type === "query" ? (
                                    <>
                                      {`const { data } = trpc.${routerName}.${procedure.name}.useQuery();`}
                                    </>
                                  ) : (
                                    <>
                                      {`const ${procedure.name} = trpc.${routerName}.${procedure.name}.useMutation();`}
                                      <br />
                                      {`await ${procedure.name}.mutateAsync({ /* dados */ });`}
                                    </>
                                  )}
                                </code>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela Resumo */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Endpoints</CardTitle>
            <CardDescription>
              Lista completa de todos os endpoints disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Router</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Endpoint</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(apiRouters).flatMap(([routerName, router]) =>
                  router.procedures.map((procedure) => {
                    const endpoint = getEndpointUrl(routerName, procedure.name);
                    const method = procedure.type === "query" ? "GET" : "POST";
                    
                    return (
                      <TableRow key={`${routerName}.${procedure.name}`}>
                        <TableCell className="font-mono">{routerName}</TableCell>
                        <TableCell className="font-mono">{procedure.name}</TableCell>
                        <TableCell>
                          <Badge className={getMethodColor(procedure.type)}>
                            {method}
                          </Badge>
                        </TableCell>
                        <TableCell>{getAccessBadge(procedure)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs">{endpoint}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(endpoint, `${routerName}.${procedure.name}`)}
                            >
                              {copiedEndpoint === `${routerName}.${procedure.name}` ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar a API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. No Frontend (React)</h3>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm">
                  {`import { trpc } from "@/lib/trpc";

// Query (GET)
const { data } = trpc.barragens.list.useQuery();

// Mutation (POST/PUT/DELETE)
const create = trpc.questionarios.create.useMutation();
await create.mutateAsync({ barragemId: 1, ... });`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Via HTTP Direto</h3>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm">
                  {`POST /api/trpc/barragens.list
Content-Type: application/json

{}`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Health Check</h3>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm">
                  {`GET /api/health

Resposta: { "status": "ok", "timestamp": "..." }`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

