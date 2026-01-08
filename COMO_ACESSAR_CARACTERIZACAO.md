# 📍 Como Acessar a Aba de Caracterização da Barragem

## 🎯 Localização

A aba de **"Caracterização da Barragem"** está localizada dentro da página de **Checklists (Inspeções)**.

## 🚀 Passo a Passo para Acessar

### 1. Acesse a Página de Checklists

**Opção A - Pelo Menu Lateral:**
- No menu lateral, clique em **"Checklists"** (ícone de checklist/inspeção)

**Opção B - Pela Página Inicial:**
- Na página inicial (Home), clique no card **"Inspeções"**

**Opção C - Pela URL:**
- Acesse diretamente: `http://localhost:5173/checklists`

### 2. Selecione uma Barragem

- No topo da página, há um seletor de barragem
- Selecione a barragem desejada

### 3. Visualize uma Inspeção Existente

- Na lista de inspeções, encontre a inspeção desejada
- Clique no botão **"Visualizar"** (ícone de olho 👁️) no card da inspeção

### 4. Acesse a Aba de Caracterização

- Um dialog será aberto com os detalhes da inspeção
- Você verá **2 abas** no topo:
  - **"Dados da Inspeção"** (aba padrão)
  - **"Caracterização da Barragem"** ← **ESTA É A NOVA ABA!**

- Clique na aba **"Caracterização da Barragem"**

## 📊 O que você encontrará na aba

A aba de Caracterização contém **3 sub-abas**:

### 1. **Índice de Caracterização BH**
Campos para:
- Área da bacia hidrográfica (Km²)
- Perímetro (Km)
- Comprimento do rio principal (Km)
- Comprimento vetorial do rio principal (Km)
- Comprimento total dos rios da bacia (Km)
- Altitude mínima e máxima da bacia (m)
- Amplitude altimétrica (m e Km)
- Comprimento axial da bacia (Km)

### 2. **Tempo de Concentração**
Campos para:
- Comprimento do rio principal (L)
- Declividade da bacia (S)
- Área de drenagem (A)

### 3. **Vazão de Pico**
Campos para:
- Largura da barragem (m)
- Altura do Maciço Principal (m)
- Volume do reservatório (m³)
- Carga hidráulica máxima (m)
- Profundidade média do reservatório (m)
- Área do reservatório (m²)

### 4. **Metadados da Medição**
- Método de medição
- Equipamento utilizado
- Responsável pela medição
- Observações

## 🖼️ Visualização do Fluxo

```
┌─────────────────────────────────────────┐
│  Menu Lateral                           │
│  ┌───────────────────────────────────┐ │
│  │ 📋 Checklists                     │ │ ← Clique aqui
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Página de Checklists                   │
│  ┌───────────────────────────────────┐ │
│  │ [Seletor de Barragem ▼]           │ │ ← Selecione barragem
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📋 Inspeção Mensal                │ │
│  │ Data: 15/01/2024                  │ │
│  │ [👁️ Visualizar] [✏️ Editar] [🗑️] │ │ ← Clique em Visualizar
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Dialog: Detalhes da Inspeção           │
│  ┌───────────────────────────────────┐ │
│  │ [Dados da Inspeção] [Caracterização]│ ← Clique aqui!
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📊 Dados para Cálculos Hidrológicos│ │
│  │                                    │ │
│  │ [Índice BH] [Tempo] [Vazão]       │ │
│  │                                    │ │
│  │ Área da bacia: [____] Km²         │ │
│  │ Perímetro: [____] Km               │ │
│  │ ...                                 │ │
│  │                                    │ │
│  │ [Salvar Caracterização]            │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## ⚠️ Importante

- A aba só aparece quando você **visualiza uma inspeção existente**
- Se não houver inspeções, crie uma nova primeiro
- Os dados são salvos automaticamente quando você clica em "Salvar Caracterização"
- Os dados ficam vinculados à inspeção específica

## 🔍 Se não estiver vendo a aba

1. **Verifique se há inspeções cadastradas:**
   - Se não houver, crie uma nova inspeção primeiro

2. **Verifique se está visualizando uma inspeção:**
   - A aba só aparece no dialog de visualização
   - Não aparece no formulário de criação/edição

3. **Verifique o console do navegador:**
   - Pressione F12
   - Veja se há erros no console

4. **Recarregue a página:**
   - Pressione Ctrl+F5 para forçar recarregamento

## 📝 Resumo Rápido

1. **Menu** → **Checklists**
2. **Selecione** uma barragem
3. **Clique** em "Visualizar" em uma inspeção
4. **Clique** na aba "Caracterização da Barragem"
5. **Preencha** os dados
6. **Salve** a caracterização




