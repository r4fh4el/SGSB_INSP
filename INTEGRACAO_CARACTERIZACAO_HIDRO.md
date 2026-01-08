# Integração: Caracterização da Barragem (INSP) → SGSB-HIDRO

## 📋 Resumo

A nova aba de **Caracterização da Barragem** no sistema de inspeções (SGSB - Node.js) coleta dados que serão utilizados para automatizar os cálculos no SGSB-HIDRO (ASP.NET Core).

## 🔗 Fluxo de Integração

```
┌─────────────────────┐
│  SGSB (Node.js)     │
│  Sistema de Inspeção│
│                     │
│  Checklist criado   │
│  ↓                  │
│  Aba: Caracterização│
│  ↓                  │
│  Dados preenchidos  │
│  ↓                  │
│  Validado = true    │
└──────────┬──────────┘
           │
           │ API/Webhook
           │
           ▼
┌─────────────────────┐
│  SGSB-HIDRO         │
│  (ASP.NET Core)     │
│                     │
│  Recebe dados       │
│  ↓                  │
│  Atualiza parâmetros│
│  ↓                  │
│  Recalcula índices  │
│  ↓                  │
│  Páginas atualizadas│
└─────────────────────┘
```

## 📊 Mapeamento de Dados

### Índice de Caracterização de Bacia Hidrográfica

| Campo INSP | Campo HIDRO | Tipo Cálculo |
|------------|-------------|--------------|
| `areaBaciaHidrografica` | `AreaBaciaHidrografica` | IndiceCaracterizacaoBH |
| `perimetro` | `Perimetro` | IndiceCaracterizacaoBH |
| `comprimentoRioPrincipal` | `ComprimentoRioPrincipal` | IndiceCaracterizacaoBH |
| `comprimentoVetorialRioPrincipal` | `ComprimentoVetorialRioPrincipal` | IndiceCaracterizacaoBH |
| `comprimentoTotalRioBacia` | `ComprimentoTotalRioBacia` | IndiceCaracterizacaoBH |
| `altitudeMinimaBacia` | `AltitudeMinimaBacia` | IndiceCaracterizacaoBH |
| `altitudeMaximaBacia` | `AltitudeMaximaBacia` | IndiceCaracterizacaoBH |
| `altitudeAltimetricaBaciaM` | `AltitudeAltimetricaBaciaM` | IndiceCaracterizacaoBH |
| `altitudeAltimetricaBaciaKM` | `AltitudeAltimetricaBaciaKM` | IndiceCaracterizacaoBH |
| `comprimentoAxialBacia` | `ComprimentoAxialBacia` | IndiceCaracterizacaoBH |

### Tempo de Concentração

| Campo INSP | Campo HIDRO | Tipo Cálculo |
|------------|-------------|--------------|
| `comprimentoRioPrincipal_L` | `ComprimentoRioPrincipal_L` | TempoConcentracao |
| `declividadeBacia_S` | `DeclividadeBacia_S` | TempoConcentracao |
| `areaDrenagem_A` | `AreaDrenagem_A` | TempoConcentracao |

### Vazão de Pico

| Campo INSP | Campo HIDRO | Tipo Cálculo |
|------------|-------------|--------------|
| `larguraBarragem` | `valorLarguraBarragem` | VazaoPico |
| `alturaMaciçoPrincipal` | `valorHbarr` | VazaoPico |
| `volumeReservatorio` | `valorVhid` | VazaoPico |
| `cargaHidraulicaMaxima` | `valorHhid` | VazaoPico |
| `profundidadeMediaReservatorio` | `valorYmed` | VazaoPico |
| `areaReservatorio` | `valorAS` | VazaoPico |

## 🚀 Próximos Passos para Integração

### 1. Criar API no SGSB-HIDRO para receber dados

```csharp
[ApiController]
[Route("api/[controller]")]
public class IntegracaoController : ControllerBase
{
    [HttpPost("caracterizacao-barragem")]
    public async Task<IActionResult> ReceberCaracterizacao([FromBody] CaracterizacaoRequest request)
    {
        // 1. Validar dados recebidos
        // 2. Buscar barragem por ID
        // 3. Atualizar parâmetros de cálculo
        // 4. Recalcular índices
        // 5. Retornar sucesso
    }
}
```

### 2. Criar endpoint no SGSB para enviar dados

```typescript
// Quando caracterização é validada, enviar para HIDRO
export async function sincronizarComHidro(caracterizacaoId: number) {
  const caracterizacao = await getCaracterizacaoById(caracterizacaoId);
  
  if (caracterizacao.validado) {
    await fetch(`${HIDRO_API_URL}/api/integracao/caracterizacao-barragem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barragemId: caracterizacao.barragemId,
        dados: {
          // Mapear campos conforme tabela acima
        }
      })
    });
  }
}
```

### 3. Atualizar automaticamente páginas de cálculo

Quando dados são recebidos no HIDRO:
- Atualizar `IndiceCaracterizacaoBH`
- Atualizar `TempoConcentracao`
- Atualizar `VazaoPico`
- Recalcular todos os índices automaticamente

## ✅ Checklist de Implementação

- [x] Criar tabela `caracterizacaoBarragem` no banco
- [x] Criar schema no Drizzle
- [x] Criar endpoints no backend (SGSB)
- [x] Criar interface de caracterização (aba no checklist)
- [ ] Criar API de recepção no SGSB-HIDRO
- [ ] Implementar mapeamento de dados
- [ ] Implementar atualização automática de cálculos
- [ ] Testar fluxo completo
- [ ] Documentar para usuários

## 📝 Notas

- Os dados só são sincronizados quando `validado = true`
- Cada barragem pode ter múltiplas caracterizações (histórico)
- A caracterização mais recente e validada é usada para cálculos
- Campos podem ser preenchidos parcialmente (não todos obrigatórios)




