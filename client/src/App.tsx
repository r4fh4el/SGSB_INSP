import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Barragens from "./pages/Barragens";
import Instrumentos from "./pages/Instrumentos";
import Checklists from "./pages/Checklists";
import CaracterizacaoBarragem from "./pages/CaracterizacaoBarragem";
import CalculoAutomatico from "./pages/CalculoAutomatico";
import Ocorrencias from "./pages/Ocorrencias";
import Hidrometria from "./pages/Hidrometria";
import Documentos from "./pages/Documentos";
import Manutencoes from "./pages/Manutencoes";
import Alertas from "./pages/Alertas";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import Questionario from "./pages/Questionario";
import BalancoHidrico from "./pages/BalancoHidrico";
import MobileHome from "./mobile/pages/MobileHome";
import MobileChecklists from "./mobile/pages/MobileChecklists";
import MobileBarragens from "./mobile/pages/MobileBarragens";
import MobileOcorrencias from "./mobile/pages/MobileOcorrencias";
import MobileLeituras from "./mobile/pages/MobileLeituras";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/barragens" component={Barragens} />
      <Route path="/instrumentos" component={Instrumentos} />
      <Route path="/checklists" component={Checklists} />
      <Route path="/caracterizacao" component={CaracterizacaoBarragem} />
      <Route path="/calculo-automatico" component={CalculoAutomatico} />
      <Route path="/ocorrencias" component={Ocorrencias} />
      <Route path="/hidrometria" component={Hidrometria} />
      <Route path="/documentos" component={Documentos} />
      <Route path="/manutencoes" component={Manutencoes} />
      <Route path="/alertas" component={Alertas} />
      <Route path="/usuarios" component={Usuarios} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route path="/questionario" component={Questionario} />
      <Route path="/balanco-hidrico" component={BalancoHidrico} />
      <Route path="/mobile" component={MobileHome} />
      <Route path="/mobile/checklists" component={MobileChecklists} />
      <Route path="/mobile/barragens" component={MobileBarragens} />
      <Route path="/mobile/ocorrencias" component={MobileOcorrencias} />
      <Route path="/mobile/leituras" component={MobileLeituras} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

