import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MobileOcorrencias() {
  const { data: barragens } = trpc.barragens.list.useQuery();
  const [selectedBarragem, setSelectedBarragem] = useState<number | null>(null);

  const ocorrenciasQuery = trpc.ocorrencias.listByBarragem.useQuery(
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
        <h1 className="text-2xl font-bold">Ocorrências</h1>
        <p className="text-sm text-blue-100">
          Registros recentes de ocorrências e anomalias
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
            Selecione uma barragem para visualizar as ocorrências.
          </div>
        ) : ocorrenciasQuery.isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Carregando ocorrências...
          </div>
        ) : !ocorrenciasQuery.data?.length ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Nenhuma ocorrência registrada até o momento.
          </div>
        ) : (
          ocorrenciasQuery.data.map((ocorrencia) => (
            <div
              key={ocorrencia.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-100 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Ocorrência #{ocorrencia.id}</h2>
                {ocorrencia.status && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                    {ocorrencia.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {ocorrencia.dataHoraRegistro
                  ? new Date(ocorrencia.dataHoraRegistro).toLocaleString()
                  : "Data não informada"}
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                {ocorrencia.severidade && (
                  <p>
                    <span className="font-semibold text-gray-600">Severidade:</span>{" "}
                    {ocorrencia.severidade}
                  </p>
                )}
                {ocorrencia.estrutura && (
                  <p>
                    <span className="font-semibold text-gray-600">Estrutura:</span>{" "}
                    {ocorrencia.estrutura}
                  </p>
                )}
                {ocorrencia.relato && (
                  <p className="text-gray-600 leading-relaxed">{ocorrencia.relato}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

