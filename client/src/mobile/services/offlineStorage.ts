import { openDB, IDBPDatabase } from 'idb';

let dbInstance: IDBPDatabase | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB('sgsb-inspecao', 1, {
    upgrade(db: any) {
      if (!db.objectStoreNames.contains('checklists')) {
        const checklistStore = db.createObjectStore('checklists', { keyPath: 'id' });
        checklistStore.createIndex('by-synced', 'synced');
      }
      if (!db.objectStoreNames.contains('ocorrencias')) {
        const ocorrenciaStore = db.createObjectStore('ocorrencias', { keyPath: 'id' });
        ocorrenciaStore.createIndex('by-synced', 'synced');
      }
      if (!db.objectStoreNames.contains('leituras')) {
        const leituraStore = db.createObjectStore('leituras', { keyPath: 'id' });
        leituraStore.createIndex('by-synced', 'synced');
      }
      if (!db.objectStoreNames.contains('fotos')) {
        db.createObjectStore('fotos', { keyPath: 'id' });
      }
    },
  });
  
  return dbInstance;
}

export async function saveChecklist(checklist: any) {
  const db = await getDB();
  await db.put('checklists', { ...checklist, synced: false });
}

export async function saveOcorrencia(ocorrencia: any) {
  const db = await getDB();
  await db.put('ocorrencias', { ...ocorrencia, synced: false });
}

export async function saveLeitura(leitura: any) {
  const db = await getDB();
  await db.put('leituras', { ...leitura, synced: false });
}

export async function saveFoto(foto: any) {
  const db = await getDB();
  await db.put('fotos', foto);
}

export async function getPendingSync() {
  const db = await getDB();
  const tx = db.transaction(['checklists', 'ocorrencias', 'leituras'], 'readonly');
  
  const checklists = await tx.objectStore('checklists').getAll();
  const ocorrencias = await tx.objectStore('ocorrencias').getAll();
  const leituras = await tx.objectStore('leituras').getAll();
  
  return {
    checklists: checklists.filter((c: any) => !c.synced),
    ocorrencias: ocorrencias.filter((o: any) => !o.synced),
    leituras: leituras.filter((l: any) => !l.synced)
  };
}

export async function markAsSynced(store: string, id: string) {
  const db = await getDB();
  const item = await db.get(store, id);
  if (item) {
    await db.put(store, { ...item, synced: true });
  }
}

