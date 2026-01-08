import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getPendingSync } from "../services/offlineStorage";

export default function MobileHome() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  
  const { data: barragens } = trpc.barragens.list.useQuery();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadPending() {
      const pending = await getPendingSync();
      const total = pending.checklists.length + pending.ocorrencias.length + pending.leituras.length;
      setPendingCount(total);
    }
    loadPending();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">SGSB Inspeção</h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1 text-sm bg-green-500 px-2 py-1 rounded">
                <i className="fas fa-wifi"></i> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm bg-red-500 px-2 py-1 rounded">
                <i className="fas fa-wifi-slash"></i> Offline
              </span>
            )}
          </div>
        </div>
        <p className="text-sm opacity-90">Olá, {user?.name}</p>
        {pendingCount > 0 && (
          <div className="mt-2 bg-yellow-600 px-3 py-2 rounded text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {pendingCount} {pendingCount === 1 ? 'item pendente' : 'itens pendentes'} de sincronização
          </div>
        )}
      </div>

      {/* Menu Principal */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Menu Principal</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/mobile/barragens" className="block">
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition">
              <i className="fas fa-water text-4xl text-blue-600 mb-3"></i>
              <p className="font-semibold text-gray-800">Barragens</p>
              <p className="text-xs text-gray-500 mt-1">{barragens?.length || 0} cadastradas</p>
            </div>
          </Link>
          
          <Link href="/mobile/checklists" className="block">
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition">
              <i className="fas fa-clipboard-check text-4xl text-green-600 mb-3"></i>
              <p className="font-semibold text-gray-800">Checklists</p>
              <p className="text-xs text-gray-500 mt-1">ISR, ISE, ISP</p>
            </div>
          </Link>
          
          <Link href="/mobile/ocorrencias" className="block">
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition">
              <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-3"></i>
              <p className="font-semibold text-gray-800">Ocorrências</p>
              <p className="text-xs text-gray-500 mt-1">Registrar anomalias</p>
            </div>
          </Link>
          
          <Link href="/mobile/leituras" className="block">
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition">
              <i className="fas fa-chart-line text-4xl text-purple-600 mb-3"></i>
              <p className="font-semibold text-gray-800">Leituras</p>
              <p className="text-xs text-gray-500 mt-1">Instrumentos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Sincronização */}
      {isOnline && pendingCount > 0 && (
        <div className="p-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
            <i className="fas fa-sync mr-2"></i>
            Sincronizar Dados ({pendingCount})
          </Button>
        </div>
      )}
    </div>
  );
}

