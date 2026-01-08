# Sistema de Alertas Automáticos - SGSB

## 📋 Visão Geral

Sistema implementado para gerar alertas automáticos quando leituras de instrumentos ultrapassam limites configurados. O sistema verifica limites inferiores, superiores, níveis de alerta e críticos, gerando alertas com diferentes níveis de severidade.

## 🎯 Funcionalidades Implementadas

### 1. Verificação Automática de Limites

Quando uma leitura é registrada, o sistema automaticamente:
- Verifica se o valor ultrapassa limites configurados
- Calcula a severidade do alerta (info, aviso, alerta, crítico)
- Gera alerta automaticamente na página de Alertas
- Inclui informações detalhadas sobre a leitura e limites

### 2. Níveis de Severidade

O sistema utiliza 4 níveis de severidade baseados em percentuais:

#### 🟢 **INFO** - Informação
- Valores dentro da faixa normal
- Não gera alerta

#### 🟡 **AVISO** - Atenção
- Valores próximos aos limites (80-90% do limite superior ou 10-20% acima do limite inferior)
- Requer monitoramento

#### 🟠 **ALERTA** - Alerta
- Valores muito próximos aos limites (90-95% do limite superior ou 5-10% acima do limite inferior)
- Requer atenção imediata

#### 🔴 **CRÍTICO** - Emergência
- Valores que ultrapassam ou estão muito próximos dos limites críticos
- Requer ação imediata

### 3. Tipos de Limites Suportados

#### Limites Superiores
- **≥100%**: CRÍTICO - Ultrapassou o limite
- **95-100%**: CRÍTICO - Próximo ao limite crítico
- **90-95%**: ALERTA - Próximo ao limite
- **80-90%**: AVISO - Aproximando-se do limite

#### Limites Inferiores
- **≤100%**: CRÍTICO - Abaixo do limite
- **0-5% acima**: CRÍTICO - Muito próximo do limite
- **5-10% acima**: ALERTA - Próximo ao limite
- **10-20% acima**: AVISO - Aproximando-se do limite

#### Níveis de Referência
- **Nível Normal**: Faixa de operação normal
- **Nível Alerta**: Valor que indica necessidade de atenção
- **Nível Crítico**: Valor que indica situação de emergência

## 🔧 Configuração de Instrumentos

Para que o sistema funcione corretamente, os instrumentos devem ter configurados:

### Campos Obrigatórios (pelo menos um):
- `limiteInferior`: Valor mínimo aceitável
- `limiteSuperior`: Valor máximo aceitável
- `nivelAlerta`: Valor que indica alerta
- `nivelCritico`: Valor que indica situação crítica

### Campos Opcionais:
- `nivelNormal`: Valor de referência normal
- `unidadeMedida`: Unidade de medida (ex: m, m³/s, kPa)
- `tipo`: Tipo do instrumento (ex: "Sensor de Nível", "Piezômetro")

## 📊 Exemplo de Uso

### Exemplo 1: Sensor de Nível d'Água

**Configuração:**
- Limite Inferior: 0.5 m
- Limite Superior: 30.0 m
- Nível Normal: 15.0 m
- Nível Alerta: 25.0 m
- Nível Crítico: 28.0 m
- Unidade: m

**Cenários:**

1. **Leitura: 28.5 m**
   - Severidade: CRÍTICO
   - Alerta: "Ultrapassou o limite superior crítico"
   - Ação: Intervenção imediata necessária

2. **Leitura: 27.0 m**
   - Severidade: CRÍTICO
   - Alerta: "Próximo ao limite superior crítico (≥95%)"
   - Ação: Monitoramento contínuo, preparar ação

3. **Leitura: 26.0 m**
   - Severidade: ALERTA
   - Alerta: "Próximo ao limite superior (90-95%)"
   - Ação: Aumentar frequência de leituras

4. **Leitura: 24.0 m**
   - Severidade: AVISO
   - Alerta: "Aproximando-se do limite superior (80-90%)"
   - Ação: Monitorar tendência

### Exemplo 2: Piezômetro (Pressão)

**Configuração:**
- Limite Inferior: 50 kPa
- Limite Superior: 500 kPa
- Nível Crítico: 450 kPa
- Unidade: kPa

**Cenários:**

1. **Leitura: 45 kPa**
   - Severidade: CRÍTICO
   - Alerta: "Abaixo do limite inferior crítico"
   - Ação: Verificar possíveis problemas estruturais

2. **Leitura: 480 kPa**
   - Severidade: CRÍTICO
   - Alerta: "Acima do nível crítico"
   - Ação: Análise estrutural urgente

## 🎨 Interface de Alertas

A página de Alertas (`/alertas`) foi melhorada com:

1. **Filtros:**
   - Por Barragem
   - Por Status (Todos, Lidos, Não Lidos)
   - Por Severidade (Todas, Crítico, Alerta, Aviso, Informação)

2. **Exibição:**
   - Cards coloridos por severidade
   - Mensagens formatadas com quebras de linha
   - Informações detalhadas sobre limites e recomendações
   - Botão para marcar como lido

3. **Mensagens Detalhadas:**
   - Valor lido
   - Tipo de inconsistência
   - Limites configurados
   - Níveis de referência
   - Recomendações baseadas na severidade

## 🔄 Fluxo de Funcionamento

```
1. Usuário registra leitura → createLeitura()
2. Sistema busca instrumento → getInstrumentoById()
3. Sistema calcula severidade → calcularSeveridadeAlerta()
4. Se deveAlertar = true:
   - Marca leitura como inconsistente
   - Cria alerta → createAlerta()
   - Alerta aparece na página de Alertas
5. Usuário visualiza e pode marcar como lido
```

## 📝 Mensagens de Alerta

As mensagens incluem:

- **Título**: `[SEVERIDADE] Código do Instrumento - Tipo de Inconsistência`
- **Mensagem Detalhada**:
  - Valor lido com unidade
  - Tipo de inconsistência
  - Limites configurados
  - Níveis de referência
  - Recomendações baseadas na severidade

## 🚀 Próximos Passos (Opcional)

1. **Notificações Push**: Enviar notificações em tempo real
2. **Email/SMS**: Alertas críticos por email ou SMS
3. **Dashboard**: Gráficos de tendência de alertas
4. **Histórico**: Relatórios de alertas por período
5. **Integração com API Meteorológica**: Alertas preventivos baseados em previsão

## ⚠️ Observações

- O sistema só gera alertas se pelo menos um limite estiver configurado
- Valores não numéricos são tratados como erros críticos
- Alertas são criados automaticamente, mas podem ser marcados como lidos
- A severidade é calculada com base na maior prioridade (crítico > alerta > aviso > info)

## 📚 Referências

- Documento: "EQUIPAMENTOS ESSENCIAIS PARA SGSB HIDRO"
- Categorias de equipamentos: Nível, Vazão, Pluviometria, Geotécnica, Meteorologia

