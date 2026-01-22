import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FileText, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Tipos
type Situacao = "NA" | "NE" | "PV" | "DS" | "DI" | "PC" | "AU" | "NI" | "";
type Magnitude = "I" | "P" | "M" | "G" | "";
type NivelPerigo = 0 | 1 | 2 | 3 | null;

interface ItemQuestionario {
  numero: number;
  descricao: string;
  situacao: Situacao;
  magnitude: Magnitude;
  nivelPerigo: NivelPerigo;
}

interface DadosGerais {
  nomeBarragem: string;
  coordenadaLatGrau: string;
  coordenadaLatMinuto: string;
  coordenadaLatSegundo: string;
  coordenadaLonGrau: string;
  coordenadaLonMinuto: string;
  coordenadaLonSegundo: string;
  datum: string;
  municipioEstado: string;
  vistoriadoPor: string;
  assinatura: string;
  cargo: string;
  dataVistoria: string;
  vistoriaNumero: string;
  cotaAtualNivelAgua: string;
  bacia: string;
  cursoDAguaBarrado: string;
  empreendedor: string;
  nivelPerigoGlobal: NivelPerigo;
}

export default function Questionario() {
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);
  
  // Queries
  const { data: barragens } = trpc.barragens.list.useQuery();
  
  // Selecionar primeira barragem automaticamente
  useEffect(() => {
    if (!selectedBarragem && barragens && barragens.length > 0) {
      setSelectedBarragem(barragens[0].id);
    }
  }, [barragens, selectedBarragem]);

  const [dadosGerais, setDadosGerais] = useState<DadosGerais>({
    nomeBarragem: "",
    coordenadaLatGrau: "",
    coordenadaLatMinuto: "",
    coordenadaLatSegundo: "",
    coordenadaLonGrau: "",
    coordenadaLonMinuto: "",
    coordenadaLonSegundo: "",
    datum: "",
    municipioEstado: "",
    vistoriadoPor: "",
    assinatura: "",
    cargo: "",
    dataVistoria: "",
    vistoriaNumero: "",
    cotaAtualNivelAgua: "",
    bacia: "",
    cursoDAguaBarrado: "",
    empreendedor: "",
    nivelPerigoGlobal: null,
  });

  const [outrosProblemas, setOutrosProblemas] = useState("");
  const [sugestoesRecomendacoes, setSugestoesRecomendacoes] = useState("");
  const [comentariosSecoes, setComentariosSecoes] = useState<Record<string, string>>({});

  // Inicializar seções
  const [secaoA, setSecaoA] = useState<ItemQuestionario[]>([]);
  const [secaoB1, setSecaoB1] = useState<ItemQuestionario[]>([]);
  const [secaoB2, setSecaoB2] = useState<ItemQuestionario[]>([]);
  const [secaoB3, setSecaoB3] = useState<ItemQuestionario[]>([]);
  const [secaoB4, setSecaoB4] = useState<ItemQuestionario[]>([]);
  const [secaoB5, setSecaoB5] = useState<ItemQuestionario[]>([]);
  const [secaoC1, setSecaoC1] = useState<ItemQuestionario[]>([]);
  const [secaoC2, setSecaoC2] = useState<ItemQuestionario[]>([]);
  const [secaoC3, setSecaoC3] = useState<ItemQuestionario[]>([]);
  const [secaoC4, setSecaoC4] = useState<ItemQuestionario[]>([]);
  const [secaoC5, setSecaoC5] = useState<ItemQuestionario[]>([]);
  const [secaoD, setSecaoD] = useState<ItemQuestionario[]>([]);
  const [secaoE1, setSecaoE1] = useState<ItemQuestionario[]>([]);
  const [secaoE2, setSecaoE2] = useState<ItemQuestionario[]>([]);
  const [secaoE3, setSecaoE3] = useState<ItemQuestionario[]>([]);
  const [secaoE4, setSecaoE4] = useState<ItemQuestionario[]>([]);
  const [secaoF, setSecaoF] = useState<ItemQuestionario[]>([]);
  const [secaoG, setSecaoG] = useState<ItemQuestionario[]>([]);
  const [secaoH, setSecaoH] = useState<ItemQuestionario[]>([]);
  const [secaoI, setSecaoI] = useState<ItemQuestionario[]>([]);

  // Função auxiliar para criar item
  const criarItem = (numero: number, descricao: string): ItemQuestionario => ({
    numero,
    descricao,
    situacao: "",
    magnitude: "",
    nivelPerigo: null,
  });

  // Inicializar itens das seções
  useEffect(() => {
    // Seção A: INFRAESTRUTURA OPERACIONAL
    setSecaoA([
      criarItem(1, "Falta de documentação sobre barragem"),
      criarItem(2, "Falta de material para manutenção"),
      criarItem(3, "Falta de treinamento do pessoal"),
      criarItem(4, "Precariedade de acesso de veículos"),
      criarItem(5, "Falta de energia elétrica"),
      criarItem(6, "Falta de sistema de comunicação eficiente"),
      criarItem(7, "Falta ou deficiência de cercas de proteção"),
      criarItem(8, "Falta ou deficiência nas placas de aviso"),
      criarItem(9, "Falta de acompanhamento da Gerência Regional"),
      criarItem(10, "Falta de manuais de operação e manutenção dos equipamentos Hidromecânicos e elétricos"),
    ]);

    // Seção B.1: TALUDE DE MONTANTE
    setSecaoB1([
      criarItem(1, "Erosões"),
      criarItem(2, "Escorregamentos"),
      criarItem(3, "Rachaduras/afundamento (laje de concreto)"),
      criarItem(4, "Rip-rap incompleto, destruído ou deslocado"),
      criarItem(5, "Afundamentos e buracos"),
      criarItem(6, "Árvores e arbustos"),
      criarItem(7, "Erosão nos encontros das ombreiras"),
      criarItem(8, "Canaletas quebradas ou obstruídas"),
      criarItem(9, "Formigueiros, cupinzeiros ou tocas de animais"),
      criarItem(10, "Sinais de movimento"),
    ]);

    // Seção B.2: COROAMENTO
    setSecaoB2([
      criarItem(1, "Erosões"),
      criarItem(2, "Rachaduras"),
      criarItem(3, "Falta de revestimento"),
      criarItem(4, "Falha no revestimento"),
      criarItem(5, "Afundamentos e buracos"),
      criarItem(6, "Árvores e arbustos"),
      criarItem(7, "Defeitos na drenagem"),
      criarItem(8, "Defeitos no meio-fio"),
      criarItem(9, "Formigueiros, cupinzeiros ou tocas de animais"),
      criarItem(10, "Sinais de movimento"),
      criarItem(11, "Desalinhamento do meio-fio"),
      criarItem(12, "Ameaça de trasbordamento da barragem"),
    ]);

    // Seção B.3: TALUDE DE JUSANTE
    setSecaoB3([
      criarItem(1, "Erosões"),
      criarItem(2, "Escorregamentos"),
      criarItem(3, "Rachaduras/afundamento (laje de concreto)"),
      criarItem(4, "Falha na proteção granular"),
      criarItem(5, "Falha na proteção vegetal"),
      criarItem(6, "Afundamentos e buracos"),
      criarItem(7, "Árvores e arbustos"),
      criarItem(8, "Erosão nos encontros das ombreiras"),
      criarItem(9, "Cavernas e buracos nas ombreiras"),
      criarItem(10, "Canaletas quebradas ou obstruídas"),
      criarItem(11, "Formigueiros, cupinzeiros ou tocas de animais"),
      criarItem(12, "Sinais de movimento"),
      criarItem(13, "Sinais de fuga d'água ou áreas úmidas"),
      criarItem(14, "Carreamento de material na água dos drenos"),
    ]);

    // Seção B.4: REGIÃO A JUSANTE DA BARRAGEM
    setSecaoB4([
      criarItem(1, "Construções irregulares próximas ao leito do rio"),
      criarItem(2, "Fuga d'água"),
      criarItem(3, "Erosão nas ombreiras"),
      criarItem(4, "Cavernas e buracos nas ombreiras"),
      criarItem(5, "Árvores/arbustos na faixa de 10m do pé da barragem"),
    ]);

    // Seção B.5: INSTRUMENTAÇÃO
    setSecaoB5([
      criarItem(1, "Acesso precário aos instrumentos"),
      criarItem(2, "Piezômetros entupidos ou defeituosos"),
      criarItem(3, "Marcos de recalque defeituosos"),
      criarItem(4, "Medidores de vazão de percolação defeituosos"),
      criarItem(5, "Falta de instrumentação"),
      criarItem(6, "Falta de registro de leituras da instrumentação"),
      criarItem(7, "Deficiência no poço de alívio"),
    ]);

    // Seção C.1: CANAIS DE APROXIMAÇÃO E RESTITUIÇÃO
    setSecaoC1([
      criarItem(1, "Árvores e arbustos"),
      criarItem(2, "Obstrução ou entulhos"),
      criarItem(3, "Desalinhamento dos taludes e muros laterais"),
      criarItem(4, "Erosões ou escorregamentos nos taludes"),
      criarItem(5, "Erosão na base dos canais escavados"),
      criarItem(6, "Erosão na área à jusante (erosão regressiva)"),
      criarItem(7, "Construções irregulares (aterro, casa, cerca)"),
    ]);

    // Seção C.2: ESTRUTURA FIXAÇÃO DA SOLEIRA
    setSecaoC2([
      criarItem(1, "Rachaduras ou trincas no concreto"),
      criarItem(2, "Ferragem do concreto exposta"),
      criarItem(3, "Deterioração da superfície do concreto"),
      criarItem(4, "Descalçamento da estrutura"),
      criarItem(5, "Juntas danificadas"),
      criarItem(6, "Sinais de deslocamentos das estruturas"),
    ]);

    // Seção C.3: RÁPIDO/ BACIA AMORTECEDORA
    setSecaoC3([
      criarItem(1, "Rachaduras ou trincas no concreto"),
      criarItem(2, "Ferragem do concreto exposta"),
      criarItem(3, "Deterioração da superfície do concreto"),
      criarItem(4, "Ocorrência de buracos na soleira"),
      criarItem(5, "Erosões"),
      criarItem(6, "Presença de entulhos na bacia"),
      criarItem(7, "Presença de vegetação na bacia"),
      criarItem(8, "Falha no enrocamento da proteção"),
    ]);

    // Seção C.4: MUROS LATERAIS
    setSecaoC4([
      criarItem(1, "Erosão na fundação"),
      criarItem(2, "Erosão nos contatos dos muros"),
      criarItem(3, "Rachaduras no concreto"),
      criarItem(4, "Ferragem do concreto exposta"),
      criarItem(5, "Deterioração da superfície do concreto"),
    ]);

    // Seção C.5: COMPORTAS DO VERTEDOURO
    setSecaoC5([
      criarItem(1, "Peças fixas (corrosão, amassamento da guia e falha na pintura)"),
      criarItem(2, "Estrutura (corrosão, amassamento e falha na pintura)"),
      criarItem(3, "Defeito das vedações (vazamento)"),
      criarItem(4, "Defeito das rodas (comporta vagão)"),
      criarItem(5, "Defeitos nos rolamentos ou buchas e retentores"),
      criarItem(6, "Defeito no ponto de içamento"),
    ]);

    // Seção D: RESERVATÓRIO
    setSecaoD([
      criarItem(1, "Réguas danificadas ou faltando"),
      criarItem(2, "Construções em áreas de proteção"),
      criarItem(3, "Poluição por esgoto, lixo, entulho, pesticidas etc."),
      criarItem(4, "Indícios de má qualidade d'água"),
      criarItem(5, "Erosões"),
      criarItem(6, "Assoreamento"),
      criarItem(7, "Desmoronamento das margens"),
      criarItem(8, "Existência de vegetação aquática excessiva"),
      criarItem(9, "Desmatamentos na área de proteção"),
      criarItem(10, "Presença de animais e peixes mortos"),
      criarItem(11, "Gado pastando"),
    ]);

    // Seção E.1: ENTRADA
    setSecaoE1([
      criarItem(1, "Assoreamento"),
      criarItem(2, "Obstrução e entulhos"),
      criarItem(3, "Tubulação danificada"),
      criarItem(4, "Registros defeituosos"),
      criarItem(5, "Falta de grade de proteção"),
      criarItem(6, "Defeitos na grade"),
    ]);

    // Seção E.2: ACIONAMENTO
    setSecaoE2([
      criarItem(1, "Hastes (travada no mancal, corrosão e empenamento)"),
      criarItem(2, "Base dos mancais (corrosão, falta de chumbadores)"),
      criarItem(3, "Falta de mancais"),
      criarItem(4, "Corrosão nos mancais"),
      criarItem(5, "Falhas nos chumbadores, lubrificação e pintura do pedestal"),
      criarItem(6, "Falta de indicador de abertura"),
      criarItem(7, "Falta de Volante"),
    ]);

    // Seção E.3: COMPORTAS
    setSecaoE3([
      criarItem(1, "Peças fixas (corrosão, amassamento da guia e falha na pintura)"),
      criarItem(2, "Estrutura (corrosão, amassamento e falha na pintura)"),
      criarItem(3, "Defeito das vedações (vazamento)"),
      criarItem(4, "Defeito das rodas (comporta vagão)"),
      criarItem(5, "Defeitos nos rolamentos ou buchas e retentores"),
      criarItem(6, "Defeito no ponto de içamento"),
    ]);

    // Seção E.4: ESTRUTURA
    setSecaoE4([
      criarItem(1, "Ferragem exposta da torre"),
      criarItem(2, "Falta de guarda corpo na escada de acesso"),
      criarItem(3, "Deterioração do guarda corpo na escada de acesso"),
      criarItem(4, "Ferragem exposta na plataforma (passadiço)"),
      criarItem(5, "Falta de guarda corpo no passadiço"),
      criarItem(6, "Deterioração do guarda corpo no passadiço"),
      criarItem(7, "Deterioração do portão do abrigo de manobra"),
      criarItem(8, "Deterioração do tubo de aeração e \"by-pass\""),
      criarItem(9, "Deterioração da instalação de controle"),
    ]);

    // Seção F: CAIXA DE MONTANTE
    setSecaoF([
      criarItem(1, "Assoreamento"),
      criarItem(2, "Obstrução e entulhos"),
      criarItem(3, "Ferragem exposta na estrutura de concreto"),
      criarItem(4, "Deterioração no concreto"),
      criarItem(5, "Falta de grade de proteção"),
      criarItem(6, "Defeitos na grade"),
      criarItem(7, "Peças fixas (corrosão, amassamento da guia e falha na pintura)"),
      criarItem(8, "Estrutura do \"stop-log\" (corrosão, amassamento e falha na pintura)"),
      criarItem(9, "Defeito no acionamento do \"stop-log\""),
      criarItem(10, "Defeito no ponto de içamento"),
    ]);

    // Seção G: GALERIA
    setSecaoG([
      criarItem(1, "Corrosão e vazamentos na tubulação"),
      criarItem(2, "Sinais de abrasão ou cavitação"),
      criarItem(3, "Sinais de fadiga ou perda de resistência"),
      criarItem(4, "Defeitos nas juntas"),
      criarItem(5, "Deformação do conduto"),
      criarItem(6, "Desalinhamento do conduto"),
      criarItem(7, "Surgências de água no concreto"),
      criarItem(8, "Precariedade de acesso"),
      criarItem(9, "Vazamento nos dispositivos de controle"),
      criarItem(10, "Surgências de água junto à galeria"),
      criarItem(11, "Falta de manutenção"),
      criarItem(12, "Presença de pedras e lixo dentro da galeria"),
      criarItem(13, "Defeitos no concreto"),
    ]);

    // Seção H: ESTRUTURA DE SAÍDA
    setSecaoH([
      criarItem(1, "Corrosão e vazamentos na tubulação"),
      criarItem(2, "Sinais de abrasão ou cavitação"),
      criarItem(3, "Sinais de fadiga ou perda de resistência"),
      criarItem(4, "Ruídos estranhos"),
      criarItem(5, "Defeitos nos dispositivos de controle"),
      criarItem(6, "Falta ou deficiência nas instruções de operação"),
      criarItem(7, "Surgências de água no concreto"),
      criarItem(8, "Precariedade de acesso (árvores e arbustos)"),
      criarItem(9, "Vazamento nos dispositivos de controle"),
      criarItem(10, "Falta de manutenção"),
      criarItem(11, "Construções irregulares"),
      criarItem(12, "Falta ou deficiência de drenagem da caixa de válvulas"),
      criarItem(13, "Presença de pedras e lixo dentro da caixa de válvulas"),
      criarItem(14, "Defeitos no concreto"),
      criarItem(15, "Defeitos na cerca de proteção"),
    ]);

    // Seção I: MEDIDOR DE VAZÃO
    setSecaoI([
      criarItem(1, "Ausência da placa medidora de vazão"),
      criarItem(2, "Corrosão da placa"),
      criarItem(3, "Defeitos no concreto"),
      criarItem(4, "Falta de escala de leitura de vazão"),
      criarItem(5, "Assoreamento da câmara de medição"),
      criarItem(6, "Erosão à jusante do medidor"),
    ]);
  }, []);

  const deveMostrarMagnitude = (situacao: Situacao): boolean => {
    return situacao === "PV" || situacao === "DI" || situacao === "PC" || situacao === "AU";
  };

  // Mutations
  const createQuestionario = trpc.questionarios.create.useMutation();

  const handleSalvar = async () => {
    if (!selectedBarragem) {
      toast.error("Selecione uma barragem antes de salvar");
      return;
    }

    try {
      // Coletar todos os itens de todas as seções
      const todosItens: Array<{
        secao: string;
        numero: number;
        descricao: string;
        situacao?: string;
        magnitude?: string;
        nivelPerigo?: number;
      }> = [];

      const adicionarItens = (secao: string, itens: ItemQuestionario[]) => {
        itens.forEach((item) => {
          if (item.situacao || item.magnitude || item.nivelPerigo) {
            todosItens.push({
              secao,
              numero: item.numero,
              descricao: item.descricao,
              situacao: item.situacao || undefined,
              magnitude: item.magnitude || undefined,
              nivelPerigo: item.nivelPerigo ?? undefined,
            });
          }
        });
      };

      adicionarItens("A", secaoA);
      adicionarItens("B.1", secaoB1);
      adicionarItens("B.2", secaoB2);
      adicionarItens("B.3", secaoB3);
      adicionarItens("B.4", secaoB4);
      adicionarItens("B.5", secaoB5);
      adicionarItens("C.1", secaoC1);
      adicionarItens("C.2", secaoC2);
      adicionarItens("C.3", secaoC3);
      adicionarItens("C.4", secaoC4);
      adicionarItens("C.5", secaoC5);
      adicionarItens("D", secaoD);
      adicionarItens("E.1", secaoE1);
      adicionarItens("E.2", secaoE2);
      adicionarItens("E.3", secaoE3);
      adicionarItens("E.4", secaoE4);
      adicionarItens("F", secaoF);
      adicionarItens("G", secaoG);
      adicionarItens("H", secaoH);
      adicionarItens("I", secaoI);

      await createQuestionario.mutateAsync({
        barragemId: selectedBarragem,
        nomeBarragem: dadosGerais.nomeBarragem || undefined,
        coordenadaLatGrau: dadosGerais.coordenadaLatGrau || undefined,
        coordenadaLatMinuto: dadosGerais.coordenadaLatMinuto || undefined,
        coordenadaLatSegundo: dadosGerais.coordenadaLatSegundo || undefined,
        coordenadaLonGrau: dadosGerais.coordenadaLonGrau || undefined,
        coordenadaLonMinuto: dadosGerais.coordenadaLonMinuto || undefined,
        coordenadaLonSegundo: dadosGerais.coordenadaLonSegundo || undefined,
        datum: dadosGerais.datum || undefined,
        municipioEstado: dadosGerais.municipioEstado || undefined,
        vistoriadoPor: dadosGerais.vistoriadoPor || undefined,
        assinatura: dadosGerais.assinatura || undefined,
        cargo: dadosGerais.cargo || undefined,
        dataVistoria: dadosGerais.dataVistoria || undefined,
        vistoriaNumero: dadosGerais.vistoriaNumero || undefined,
        cotaAtualNivelAgua: dadosGerais.cotaAtualNivelAgua || undefined,
        bacia: dadosGerais.bacia || undefined,
        cursoDAguaBarrado: dadosGerais.cursoDAguaBarrado || undefined,
        empreendedor: dadosGerais.empreendedor || undefined,
        nivelPerigoGlobal: dadosGerais.nivelPerigoGlobal ?? undefined,
        outrosProblemas: outrosProblemas || undefined,
        sugestoesRecomendacoes: sugestoesRecomendacoes || undefined,
        itens: todosItens,
        comentariosSecoes: comentariosSecoes,
      });

      toast.success("Questionário salvo com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar questionário");
    }
  };

  const handleLimpar = () => {
    if (!confirm("Tem certeza que deseja limpar todos os dados do questionário?")) return;
    
    setDadosGerais({
      nomeBarragem: "",
      coordenadaLatGrau: "",
      coordenadaLatMinuto: "",
      coordenadaLatSegundo: "",
      coordenadaLonGrau: "",
      coordenadaLonMinuto: "",
      coordenadaLonSegundo: "",
      datum: "",
      municipioEstado: "",
      vistoriadoPor: "",
      assinatura: "",
      cargo: "",
      dataVistoria: "",
      vistoriaNumero: "",
      cotaAtualNivelAgua: "",
      bacia: "",
      cursoDAguaBarrado: "",
      empreendedor: "",
      nivelPerigoGlobal: null,
    });
    setOutrosProblemas("");
    setSugestoesRecomendacoes("");
    setComentariosSecoes({});
    
    // Limpar todas as seções
    const limparSecao = (setter: any) => {
      setter((prev: ItemQuestionario[]) => 
        prev.map(item => ({ ...item, situacao: "", magnitude: "", nivelPerigo: null }))
      );
    };
    
    limparSecao(setSecaoA);
    limparSecao(setSecaoB1);
    limparSecao(setSecaoB2);
    limparSecao(setSecaoB3);
    limparSecao(setSecaoB4);
    limparSecao(setSecaoB5);
    limparSecao(setSecaoC1);
    limparSecao(setSecaoC2);
    limparSecao(setSecaoC3);
    limparSecao(setSecaoC4);
    limparSecao(setSecaoC5);
    limparSecao(setSecaoD);
    limparSecao(setSecaoE1);
    limparSecao(setSecaoE2);
    limparSecao(setSecaoE3);
    limparSecao(setSecaoE4);
    limparSecao(setSecaoF);
    limparSecao(setSecaoG);
    limparSecao(setSecaoH);
    limparSecao(setSecaoI);
    
    toast.success("Questionário limpo com sucesso!");
  };

  const renderSecao = (
    codigoSecao: string,
    tituloSecao: string,
    itens: ItemQuestionario[],
    setItens: (items: ItemQuestionario[]) => void
  ) => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{codigoSecao} - {tituloSecao}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-32">Situação</TableHead>
                <TableHead className="w-32">Magnitude</TableHead>
                <TableHead className="w-24">NPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item, index) => (
                <TableRow key={item.numero}>
                  <TableCell>{item.numero}</TableCell>
                  <TableCell className="text-sm">{item.descricao}</TableCell>
                  <TableCell>
                    <Select
                      value={item.situacao}
                      onValueChange={(value: Situacao) => {
                        const novosItens = [...itens];
                        novosItens[index] = { ...item, situacao: value };
                        if (!deveMostrarMagnitude(value)) {
                          novosItens[index].magnitude = "";
                          novosItens[index].nivelPerigo = null;
                        }
                        setItens(novosItens);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NA">NA</SelectItem>
                        <SelectItem value="NE">NE</SelectItem>
                        <SelectItem value="PV">PV</SelectItem>
                        <SelectItem value="DS">DS</SelectItem>
                        <SelectItem value="DI">DI</SelectItem>
                        <SelectItem value="PC">PC</SelectItem>
                        <SelectItem value="AU">AU</SelectItem>
                        <SelectItem value="NI">NI</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.magnitude}
                      onValueChange={(value: Magnitude) => {
                        const novosItens = [...itens];
                        novosItens[index] = { ...item, magnitude: value };
                        setItens(novosItens);
                      }}
                      disabled={!deveMostrarMagnitude(item.situacao)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">I</SelectItem>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.nivelPerigo?.toString() || ""}
                      onValueChange={(value) => {
                        const novosItens = [...itens];
                        novosItens[index] = { ...item, nivelPerigo: value ? parseInt(value) as NivelPerigo : null };
                        setItens(novosItens);
                      }}
                      disabled={!deveMostrarMagnitude(item.situacao)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Label>Comentários</Label>
            <Textarea
              value={comentariosSecoes[codigoSecao] || ""}
              onChange={(e) => setComentariosSecoes({ ...comentariosSecoes, [codigoSecao]: e.target.value })}
              rows={3}
              placeholder="Adicione comentários sobre esta seção..."
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">FICHA PARA INSPEÇÃO REGULAR DE BARRAGEM DE TERRA</h1>
            <p className="text-muted-foreground mt-2">DADOS GERAIS - CONDIÇÃO ATUAL</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSalvar} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Questionário
            </Button>
            <Button variant="outline" onClick={handleLimpar} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Seleção de Barragem */}
        {barragens && barragens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selecione a Barragem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full md:w-1/2">
                <Label>Barragem</Label>
                <Select
                  value={selectedBarragem?.toString() || ""}
                  onValueChange={(value) => setSelectedBarragem(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma barragem" />
                  </SelectTrigger>
                  <SelectContent>
                    {barragens.map((barragem) => (
                      <SelectItem key={barragem.id} value={barragem.id.toString()}>
                        {barragem.nome} {barragem.codigo ? `(${barragem.codigo})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DADOS GERAIS */}
        <Card>
          <CardHeader>
            <CardTitle>DADOS GERAIS - CONDIÇÃO ATUAL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>1 – Nome da Barragem</Label>
                <Input
                  value={dadosGerais.nomeBarragem}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, nomeBarragem: e.target.value })}
                />
              </div>
              
              <div>
                <Label>2 - Coordenadas - Latitude - Grau</Label>
                <Input
                  type="number"
                  value={dadosGerais.coordenadaLatGrau}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, coordenadaLatGrau: e.target.value })}
                />
              </div>
              <div>
                <Label>Minuto</Label>
                <Input
                  type="number"
                  value={dadosGerais.coordenadaLatMinuto}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, coordenadaLatMinuto: e.target.value })}
                />
              </div>
              <div>
                <Label>Segundo</Label>
                <Input
                  type="number"
                  value={dadosGerais.coordenadaLatSegundo}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, coordenadaLatSegundo: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Longitude - Grau</Label>
                <Input
                  type="number"
                  value={dadosGerais.coordenadaLonGrau}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, coordenadaLonGrau: e.target.value })}
                />
              </div>
              <div>
                <Label>Minuto</Label>
                <Input
                  type="number"
                  value={dadosGerais.coordenadaLonMinuto}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, coordenadaLonMinuto: e.target.value })}
                />
              </div>
              <div>
                <Label>Segundo</Label>
                <Input
                  type="number"
                  value={dadosGerais.coordenadaLonSegundo}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, coordenadaLonSegundo: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Datum</Label>
                <Input
                  value={dadosGerais.datum}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, datum: e.target.value })}
                />
              </div>
              <div>
                <Label>3 – Município/Estado</Label>
                <Input
                  value={dadosGerais.municipioEstado}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, municipioEstado: e.target.value })}
                />
              </div>
              
              <div>
                <Label>4 - Vistoriado Por</Label>
                <Input
                  value={dadosGerais.vistoriadoPor}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, vistoriadoPor: e.target.value })}
                />
              </div>
              <div>
                <Label>Assinatura</Label>
                <Input
                  value={dadosGerais.assinatura}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, assinatura: e.target.value })}
                />
              </div>
              
              <div>
                <Label>5 - Cargo</Label>
                <Input
                  value={dadosGerais.cargo}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, cargo: e.target.value })}
                />
              </div>
              <div>
                <Label>6 - Data da Vistoria</Label>
                <Input
                  type="date"
                  value={dadosGerais.dataVistoria}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, dataVistoria: e.target.value })}
                />
              </div>
              <div>
                <Label>Vistoria N.º</Label>
                <Input
                  value={dadosGerais.vistoriaNumero}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, vistoriaNumero: e.target.value })}
                />
              </div>
              
              <div>
                <Label>7 - Cota atual do nível d'água</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosGerais.cotaAtualNivelAgua}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, cotaAtualNivelAgua: e.target.value })}
                />
              </div>
              <div>
                <Label>8 – Bacia</Label>
                <Input
                  value={dadosGerais.bacia}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, bacia: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Curso d'água barrado</Label>
                <Input
                  value={dadosGerais.cursoDAguaBarrado}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, cursoDAguaBarrado: e.target.value })}
                />
              </div>
              <div>
                <Label>9 – Empreendedor</Label>
                <Input
                  value={dadosGerais.empreendedor}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, empreendedor: e.target.value })}
                />
              </div>
              <div>
                <Label>10 – Nível de Perigo Global da Barragem (NPGB)</Label>
                <Select
                  value={dadosGerais.nivelPerigoGlobal?.toString() || ""}
                  onValueChange={(value) => setDadosGerais({ ...dadosGerais, nivelPerigoGlobal: value ? parseInt(value) as NivelPerigo : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Normal</SelectItem>
                    <SelectItem value="1">1 - Atenção</SelectItem>
                    <SelectItem value="2">2 - Alerta</SelectItem>
                    <SelectItem value="3">3 - Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LEGENDA */}
        <Accordion type="single" collapsible>
          <AccordionItem value="legenda">
            <AccordionTrigger>Legenda</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">SITUAÇÃO:</h4>
                  <ul className="text-sm space-y-1">
                    <li>NA – Este item Não é Aplicável</li>
                    <li>NE – Anomalia Não Existente</li>
                    <li>PV – Anomalia constatada pela Primeira Vez</li>
                    <li>DS – Anomalia Desapareceu</li>
                    <li>DI – Anomalia Diminuiu</li>
                    <li>PC – Anomalia Permaneceu Constante</li>
                    <li>AU – Anomalia Aumentou</li>
                    <li>NI – Este item Não foi Inspecionado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">MAGNITUDE:</h4>
                  <ul className="text-sm space-y-1">
                    <li>I - Insignificante</li>
                    <li>P - Pequena</li>
                    <li>M - Média</li>
                    <li>G - Grande</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">NÍVEL DE PERIGO DA ANOMALIA - NPA:</h4>
                  <ul className="text-sm space-y-1">
                    <li>0 - Normal</li>
                    <li>1 - Atenção</li>
                    <li>2 - Alerta</li>
                    <li>3 - Emergência</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* SEÇÕES DO QUESTIONÁRIO */}
        {secaoA.length > 0 && renderSecao("A", "INFRAESTRUTURA OPERACIONAL", secaoA, setSecaoA)}
        
        {/* Seção B: BARRAGEM */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>B. BARRAGEM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {secaoB1.length > 0 && renderSecao("B.1", "TALUDE DE MONTANTE", secaoB1, setSecaoB1)}
            {secaoB2.length > 0 && renderSecao("B.2", "COROAMENTO", secaoB2, setSecaoB2)}
            {secaoB3.length > 0 && renderSecao("B.3", "TALUDE DE JUSANTE", secaoB3, setSecaoB3)}
            {secaoB4.length > 0 && renderSecao("B.4", "REGIÃO A JUSANTE DA BARRAGEM", secaoB4, setSecaoB4)}
            {secaoB5.length > 0 && renderSecao("B.5", "INSTRUMENTAÇÃO", secaoB5, setSecaoB5)}
          </CardContent>
        </Card>

        {/* Seção C: SANGRADOURO/VERTEDOURO */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>C. SANGRADOURO/VERTEDOURO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {secaoC1.length > 0 && renderSecao("C.1", "CANAIS DE APROXIMAÇÃO E RESTITUIÇÃO", secaoC1, setSecaoC1)}
            {secaoC2.length > 0 && renderSecao("C.2", "ESTRUTURA FIXAÇÃO DA SOLEIRA", secaoC2, setSecaoC2)}
            {secaoC3.length > 0 && renderSecao("C.3", "RÁPIDO/ BACIA AMORTECEDORA", secaoC3, setSecaoC3)}
            {secaoC4.length > 0 && renderSecao("C.4", "MUROS LATERAIS", secaoC4, setSecaoC4)}
            {secaoC5.length > 0 && renderSecao("C.5", "COMPORTAS DO VERTEDOURO", secaoC5, setSecaoC5)}
          </CardContent>
        </Card>

        {secaoD.length > 0 && renderSecao("D", "RESERVATÓRIO", secaoD, setSecaoD)}

        {/* Seção E: TORRE DA TOMADA D'ÁGUA */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>E. TORRE DA TOMADA D'ÁGUA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {secaoE1.length > 0 && renderSecao("E.1", "ENTRADA", secaoE1, setSecaoE1)}
            {secaoE2.length > 0 && renderSecao("E.2", "ACIONAMENTO", secaoE2, setSecaoE2)}
            {secaoE3.length > 0 && renderSecao("E.3", "COMPORTAS", secaoE3, setSecaoE3)}
            {secaoE4.length > 0 && renderSecao("E.4", "ESTRUTURA", secaoE4, setSecaoE4)}
          </CardContent>
        </Card>

        {secaoF.length > 0 && renderSecao("F", "CAIXA DE MONTANTE (BOCA DE ENTRADA E \"STOP-LOG\")", secaoF, setSecaoF)}
        {secaoG.length > 0 && renderSecao("G", "GALERIA", secaoG, setSecaoG)}
        {secaoH.length > 0 && renderSecao("H", "ESTRUTURA DE SAÍDA", secaoH, setSecaoH)}
        {secaoI.length > 0 && renderSecao("I", "MEDIDOR DE VAZÃO", secaoI, setSecaoI)}

        {/* SEÇÃO J: OUTROS PROBLEMAS */}
        <Card>
          <CardHeader>
            <CardTitle>J. OUTROS PROBLEMAS EXISTENTES</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outrosProblemas}
              onChange={(e) => setOutrosProblemas(e.target.value)}
              rows={5}
              placeholder="Descreva outros problemas encontrados..."
            />
          </CardContent>
        </Card>

        {/* SEÇÃO K: SUGESTÕES */}
        <Card>
          <CardHeader>
            <CardTitle>K. SUGESTÕES E RECOMENDAÇÕES</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sugestoesRecomendacoes}
              onChange={(e) => setSugestoesRecomendacoes(e.target.value)}
              rows={5}
              placeholder="Descreva sugestões e recomendações..."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

