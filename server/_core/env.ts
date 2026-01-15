// Normalizar HIDRO_API_URL - limpar e corrigir problemas comuns
let hidroApiUrl = process.env.HIDRO_API_URL ?? "";
if (hidroApiUrl) {
  // Remover espaços
  hidroApiUrl = hidroApiUrl.trim();
  
  // Remover /swagger ou /swagger/ do final
  if (hidroApiUrl.includes("/swagger")) {
    console.warn("[ENV] ⚠️  HIDRO_API_URL contém /swagger, removendo...");
    hidroApiUrl = hidroApiUrl.replace(/\/swagger\/?.*$/, "");
  }
  
  // Remover barra final
  hidroApiUrl = hidroApiUrl.replace(/\/$/, "");
  
  // Substituir 0.0.0.0 por localhost
  if (hidroApiUrl.includes("0.0.0.0")) {
    console.warn("[ENV] ⚠️  HIDRO_API_URL contém 0.0.0.0, substituindo por localhost");
    hidroApiUrl = hidroApiUrl.replace("0.0.0.0", "localhost");
  }
  
  // Log da URL final (sem mostrar senhas se houver)
  console.log(`[ENV] HIDRO_API_URL configurada: ${hidroApiUrl}`);
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  skipAuth: process.env.SKIP_AUTH !== "false",
  hidroApiUrl: hidroApiUrl,
};
