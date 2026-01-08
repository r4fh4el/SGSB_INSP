import { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MobileBarragens() {
  const { data: barragens, isLoading } = trpc.barragens.list.useQuery();

  const groupedByRisco = useMemo(() => {
    if (!barragens) return [];
    const groups = new Map<string, Array<(typeof barragens)[number]>>();
    for (const barragem of barragens) {
      const categoria = barragem.categoriaRisco ?? "Sem classificação";
      if (!groups.has(categoria)) {
        groups.set(categoria, []);
      }
      groups.get(categoria)!.push(barragem);
    }

    return Array.from(groups.entries()).map(([categoria, items]) => ({
      categoria,
      items,
    }));
  }, [barragens]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-4">
        <Link href="/mobile" className="text-sm mb-2 inline-flex items-center gap-2">
          <i className="fas fa-arrow-left" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Barragens</h1>
        <p className="text-sm text-blue-100">
          Visualize as barragens cadastradas e seus níveis de risco
        </p>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Carregando barragens...
          </div>
        ) : !barragens?.length ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Nenhuma barragem cadastrada ainda.
          </div>
        ) : (
          groupedByRisco.map((group) => (
            <div key={group.categoria} className="space-y-2">
              <h2 className="text-sm font-semibold uppercase text-gray-500">
                Categoria {group.categoria}
              </h2>
              <div className="space-y-3">
                {group.items.map((barragem) => (
                  <div
                    key={barragem.id}
                    className="bg-white rounded-lg shadow p-4 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {barragem.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {barragem.municipio && barragem.estado
                            ? `${barragem.municipio} - ${barragem.estado}`
                            : "Localização não informada"}
                        </p>
                      </div>
                      {barragem.status && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {barragem.status}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-600">
                      <div>
                        <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                          Tipo
                        </p>
                        <p>{barragem.tipo || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                          Dano Potencial
                        </p>
                        <p>{barragem.danoPotencialAssociado || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                          Altura (m)
                        </p>
                        <p>{barragem.altura || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                          Volume (m³)
                        </p>
                        <p>{barragem.volumeReservatorio || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


