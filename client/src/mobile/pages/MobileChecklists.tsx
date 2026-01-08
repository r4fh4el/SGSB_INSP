import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { saveChecklist } from "../services/offlineStorage";

export default function MobileChecklists() {
  const [selectedBarragem, setSelectedBarragem] = useState("");
  const [tipo, setTipo] = useState<"ISR" | "ISE" | "ISP">("ISR");
  const [itens, setItens] = useState<any[]>([]);
  
  const { data: barragens } = trpc.barragens.list.useQuery();

  const handleSave = async () => {
    const checklist = {
      id: `checklist_${Date.now()}`,
      barragemId: selectedBarragem,
      tipo,
      data: new Date().toISOString(),
      status: "Rascunho",
      itens,
      fotos: [],
      synced: false,
      createdAt: new Date().toISOString()
    };
    
    await saveChecklist(checklist);
    alert("Checklist salvo localmente!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-4">
        <Link href="/mobile" className="text-sm mb-2 inline-flex items-center gap-2">
          <i className="fas fa-arrow-left" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Checklists de Inspeção</h1>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Barragem</label>
          <select 
            className="w-full p-3 border rounded-lg"
            value={selectedBarragem}
            onChange={(e) => setSelectedBarragem(e.target.value)}
          >
            <option value="">Selecione uma barragem</option>
            {barragens?.map((b: any) => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Inspeção</label>
          <div className="grid grid-cols-3 gap-2">
            {["ISR", "ISE", "ISP"].map(t => (
              <button
                key={t}
                onClick={() => setTipo(t as any)}
                className={`p-3 rounded-lg font-semibold ${
                  tipo === t ? "bg-blue-600 text-white" : "bg-white border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full py-6 text-lg">
          <i className="fas fa-save mr-2"></i>Salvar Checklist
        </Button>
      </div>
    </div>
  );
}

