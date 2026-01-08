import { Capacitor } from "@capacitor/core";
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

// Suprimir avisos benignos de ResizeObserver
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
const resizeObserverLoopErrRe2 = /^[^(ResizeObserver loop completed with undelivered notifications)]/;
window.addEventListener("error", (e) => {
  if (
    resizeObserverLoopErrRe.test(e.message) ||
    resizeObserverLoopErrRe2.test(e.message)
  ) {
    e.stopImmediatePropagation();
  }
});

const queryClient = new QueryClient();

// Suportar VITE_API_URL tanto para mobile quanto para web
// Se não estiver definido, usar URL relativa (assume mesmo servidor)
const apiHost = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim().length > 0
  ? import.meta.env.VITE_API_URL
  : Capacitor.isNativePlatform()
    ? "http://10.0.2.2:3000"
    : "";

const baseApiUrl = apiHost
  ? `${apiHost.replace(/\/$/, "")}/api/trpc`
  : "/api/trpc";

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log("[tRPC] API URL:", baseApiUrl);
  console.log("[tRPC] VITE_API_URL:", import.meta.env.VITE_API_URL);
  console.log("[tRPC] Is Native:", Capacitor.isNativePlatform());
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: baseApiUrl,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

function AppContainer() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    import("@capacitor/splash-screen")
      .then(({ SplashScreen }) => SplashScreen.hide().catch(() => undefined))
      .catch(() => undefined);
  }, []);

  // Verificação adicional de CSS carregado (backup do script inline)
  useEffect(() => {
    const checkCSS = () => {
      // Verificar se CSS crítico foi injetado (indicando problema)
      const criticalCSS = document.getElementById('critical-css-fallback');
      if (criticalCSS) {
        console.warn('⚠️ CSS crítico está sendo usado - verifique carregamento de CSS externo');
      }
      
      // Verificar se elementos principais têm background
      const root = document.getElementById('root');
      if (root) {
        const styles = window.getComputedStyle(root);
        const bgColor = styles.backgroundColor;
        const isTransparent = bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent';
        
        if (isTransparent) {
          console.error('❌ Root element tem background transparente! Corrigindo...');
          root.style.backgroundColor = '#ffffff';
          root.style.color = '#1f2937';
        }
      }
    };
    
    // Verificar após um pequeno delay
    setTimeout(checkCSS, 1000);
  }, []);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <AppContainer />
      </Router>
    </QueryClientProvider>
  </trpc.Provider>
);
