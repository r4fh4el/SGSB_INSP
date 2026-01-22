// Script para testar se HIDRO_API_URL está sendo carregada
require('dotenv').config();

console.log("========================================");
console.log("  TESTE DE VARIÁVEIS DE AMBIENTE");
console.log("========================================");
console.log("");

console.log("process.env.HIDRO_API_URL (raw):", process.env.HIDRO_API_URL);
console.log("process.env.HIDRO_API_URL (type):", typeof process.env.HIDRO_API_URL);
console.log("process.env.HIDRO_API_URL (length):", process.env.HIDRO_API_URL?.length);
console.log("");

// Testar import do env.ts
(async () => {
  try {
    const { ENV } = await import('./server/_core/env.ts');
    console.log("ENV.hidroApiUrl:", ENV.hidroApiUrl);
    console.log("ENV.hidroApiUrl (type):", typeof ENV.hidroApiUrl);
    console.log("ENV.hidroApiUrl (length):", ENV.hidroApiUrl?.length);
    console.log("ENV.hidroApiUrl (isEmpty):", !ENV.hidroApiUrl || ENV.hidroApiUrl.trim() === "");
    console.log("");
    
    if (ENV.hidroApiUrl && ENV.hidroApiUrl.trim() !== "") {
      console.log("✅ HIDRO_API_URL está configurada!");
      console.log("   Valor:", ENV.hidroApiUrl);
    } else {
      console.log("❌ HIDRO_API_URL NÃO está configurada ou está vazia!");
      console.log("");
      console.log("Verifique:");
      console.log("  1. Se a variável existe no arquivo .env");
      console.log("  2. Se não há espaços ou caracteres invisíveis");
      console.log("  3. Se o arquivo .env está na raiz do projeto");
      console.log("  4. Se o servidor foi reiniciado após alterar o .env");
    }
  } catch (error) {
    console.error("Erro ao importar env.ts:", error);
  }
})();



