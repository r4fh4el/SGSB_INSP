import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MobileLeituras() {
  const { data: barragens } = trpc.barragens.list.useQuery();
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);

  const leiturasQuery = trpc.hidrometria.listByBarragem.useQuery(
    { barragemId: selectedBarragem ?? 0 },
    { enabled: selectedBarragem !== null }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-4">
        <Link href="/mobile" className="text-sm mb-2 inline-flex items-center gap-2">
          <i className="fas fa-arrow-left" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Leituras Hidrométricas</h1>
        <p className="text-sm text-blue-100">
          Consulte as últimas leituras registradas por barragem
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar barragem
          </label>
          <select
            className="w-full border rounded-lg p-3 text-sm"
            value={selectedBarragem ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedBarragem(value ? Number(value) : null);
            }}
          >
            <option value="">Escolha uma barragem</option>
            {barragens?.map((barragem) => (
              <option key={barragem.id} value={barragem.id}>
                {barragem.nome}
              </option>
            ))}
          </select>
        </div>

        {selectedBarragem === null ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Selecione uma barragem para visualizar as leituras.
          </div>
        ) : leiturasQuery.isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Carregando leituras...
          </div>
        ) : !leiturasQuery.data?.length ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Nenhuma leitura encontrada para a barragem selecionada.
          </div>
        ) : (
          <div className="space-y-3">
            {leiturasQuery.data.map((leitura) => (
              <div
                key={leitura.id}
                className="bg-white rounded-lg shadow p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {leitura.dataLeitura
                      ? new Date(leitura.dataLeitura).toLocaleString()
                      : "Sem data"}
                  </span>
                  <span className="uppercase tracking-wide text-[10px] text-gray-400">
                    Registro #{leitura.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                      Nível Montante
                    </p>
                    <p>{leitura.nivelMontante || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                      Nível Jusante
                    </p>
                    <p>{leitura.nivelJusante || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                      Vazão Afluente
                    </p>
                    <p>{leitura.vazaoAfluente || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                      Vazão Defluente
                    </p>
                    <p>{leitura.vazaoDefluente || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                      Observações
                    </p>
                    <p>{leitura.observacoes || "Sem observações"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


