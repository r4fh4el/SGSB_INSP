# Integração Automática Completa - SGSB_INSP → SGSB-FINAL

## 📋 Resumo da Implementação

A integração automática foi implementada com sucesso! Agora, quando você cadastra ou atualiza leituras de instrumentos no **SGSB_INSP**, os cálculos são automaticamente atualizados no **SGSB-FINAL**.

## 🔄 Fluxo de Integração

### 1. Cadastro/Atualização de Leitura de Instrumento

Quando uma leitura é criada ou atualizada em `SGSB_INSP`:

1. **Verificação de Mapeamentos**: O sistema verifica se existe mapeamento entre o instrumento e parâmetros de cálculo na tabela `mapeamentoInstrumentoParametro`.

2. **Atualização da Caracterização**: Se houver mapeamento, os dados da caracterização são atualizados automaticamente com o valor da leitura (aplicando fator de conversão se necessário).

3. **Sincronização com SGSB-FINAL**: Os dados atualizados são enviados ao `SGSB-FINAL` via API.

4. **Cálculo Automático**: O `SGSB-FINAL` calcula automaticamente:
   - **Índice de Caracterização da Bacia Hidrográfica**
     - Índice de Circularidade
     - Fator de Forma
     - Coeficiente de Compacidade
     - Densidade de Drenagem
     - Coeficiente de Manutenção
     - Gradiente de Canais
     - Relação de Relevo
     - Índice de Rugosidade
     - Sinuosidade do Curso d'água Principal
   
   - **Tempo de Concentração**
     - Kirpich (1940)
     - Corps Engineers (1946)
     - Carter (1961)
     - Dooge (1956)
     - Ven te Chow (1962)

## 📊 Tabela de Mapeamento

A tabela `mapeamentoInstrumentoParametro` permite configurar qual instrumento atualiza qual parâmetro:

```sql
SELECT * FROM dbo.mapeamentoInstrumentoParametro
WHERE barragemId = @barragemId AND ativo = 1
```

**Campos principais:**
- `instrumentoCodigo`: Código do instrumento (ex: 'ALT_MAX_001')
- `barragemId`: ID da barragem
- `parametroCalculo`: Nome do parâmetro (ex: 'AltitudeMaximaBacia')
- `campoCaracterizacao`: Campo na tabela `caracterizacaoBarragem` (ex: 'altitudeMaximaBacia')
- `fatorConversao`: Fator para converter valor (padrão: 1.0)
- `unidadeEsperada`: Unidade esperada (ex: 'm', 'Km', 'Km²')

## 🔌 Endpoints Criados

### SGSB-FINAL

1. **POST /API/CalcularCaracterizacaoAutomatica**
   - Calcula automaticamente todos os índices de caracterização
   - Body: `{ "barragemId": 1 }`

2. **POST /API/CalcularTempoConcentracaoAutomatico**
   - Calcula automaticamente o tempo de concentração
   - Body: `{ "barragemId": 1 }`

3. **GET /API/BuscarIndiceCaracterizacaoBHPorBarragem?barragemId=1**
   - Busca índice de caracterização por barragem

### SGSB_INSP

Os endpoints existentes foram modificados para:
- `POST /api/mutations/createLeitura`: Agora atualiza caracterização e sincroniza automaticamente
- `PUT /api/mutations/updateCaracterizacao`: Calcula automaticamente após salvar

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Certifique-se de que o arquivo `.env` do `SGSB_INSP` contém:

```env
HIDRO_API_URL=http://localhost:5000  # URL do SGSB-FINAL
```

### 2. Criar Mapeamentos

Exemplo de mapeamento:

```sql
INSERT INTO dbo.mapeamentoInstrumentoParametro 
  (instrumentoCodigo, barragemId, parametroCalculo, tipoCalculo, 
   fatorConversao, unidadeEsperada, campoCaracterizacao, ativo, observacoes)
VALUES
  ('ALT_MAX_001', 1, 'AltitudeMaximaBacia', 'IndiceCaracterizacaoBH', 
   1.0, 'm', 'altitudeMaximaBacia', 1, 
   'Instrumento de altitude máxima para caracterização da bacia');
```

## 📝 Exemplo de Uso

1. **Cadastrar Instrumento** no SGSB_INSP (ex: 'ALT_MAX_001')

2. **Criar Mapeamento**:
   ```sql
   INSERT INTO dbo.mapeamentoInstrumentoParametro 
     (instrumentoCodigo, barragemId, parametroCalculo, tipoCalculo, 
      fatorConversao, campoCaracterizacao, ativo)
   VALUES
     ('ALT_MAX_001', 1, 'AltitudeMaximaBacia', 'IndiceCaracterizacaoBH',
      1.0, 'altitudeMaximaBacia', 1);
   ```

3. **Registrar Leitura** do instrumento (ex: valor = 1250.5)

4. **Resultado Automático**:
   - A caracterização é atualizada com `altitudeMaximaBacia = 1250.5`
   - O SGSB-FINAL recebe os dados
   - Todos os índices são calculados automaticamente
   - Os resultados aparecem na aba "Caracterização da Bacia" no SGSB-FINAL

## 🎯 Parâmetros Mapeáveis

### Para Índice de Caracterização:
- `areaBaciaHidrografica` → Área da bacia hidrográfica (Km²)
- `perimetro` → Perímetro (Km)
- `comprimentoRioPrincipal` → Comprimento do rio principal (Km)
- `comprimentoVetorialRioPrincipal` → Comprimento vetorial (Km)
- `comprimentoTotalRioBacia` → Comprimento total dos rios (Km)
- `altitudeMinimaBacia` → Altitude mínima (m)
- `altitudeMaximaBacia` → Altitude máxima (m)
- `altitudeAltimetricaBaciaM` → Amplitude altimétrica (m)
- `comprimentoAxialBacia` → Comprimento axial (Km)

### Para Tempo de Concentração:
- `comprimentoRioPrincipal_L` → Comprimento do rio principal (L)
- `declividadeBacia_S` → Declividade da bacia (S)
- `areaDrenagem_A` → Área de drenagem (A)

### Para Vazão de Pico:
- `larguraBarragem` → Largura da barragem (m)
- `alturaMaciçoPrincipal` → Altura do maciço (m)
- `volumeReservatorio` → Volume do reservatório (m³)
- `cargaHidraulicaMaxima` → Carga hidráulica máxima (m)
- `profundidadeMediaReservatorio` → Profundidade média (m)
- `areaReservatorio` → Área do reservatório (m²)

## ✅ Checklist de Verificação

- [x] Tabela `mapeamentoInstrumentoParametro` criada
- [x] Função `atualizarCaracterizacaoPorLeitura` implementada
- [x] Integração no `createLeitura` adicionada
- [x] Endpoints de cálculo automático criados no SGSB-FINAL
- [x] Sincronização automática configurada
- [x] Mapeamentos de exemplo criados

## 🚀 Próximos Passos

1. **Testar a integração**:
   - Criar um instrumento
   - Criar mapeamento
   - Registrar leitura
   - Verificar cálculos no SGSB-FINAL

2. **Configurar mais mapeamentos** conforme necessário

3. **Monitorar logs** para verificar o funcionamento:
   - Logs do SGSB_INSP: `[Integração]`, `[Sincronização HIDRO]`
   - Logs do SGSB-FINAL: Console do ASP.NET Core

## 📚 Documentação Adicional

- [ANALISE_INTEGRACAO_MEDIDAS.md](../ANALISE_INTEGRACAO_MEDIDAS.md)
- [EXEMPLO_IMPLEMENTACAO_INTEGRACAO.md](../EXEMPLO_IMPLEMENTACAO_INTEGRACAO.md)
- [CARACTERISTICAS_SISTEMA_INSPECOES.md](../CARACTERISTICAS_SISTEMA_INSPECOES.md)




