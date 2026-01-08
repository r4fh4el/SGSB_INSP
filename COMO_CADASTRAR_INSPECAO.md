# 📝 Como Cadastrar uma Nova Inspeção

## 🎯 Localização

A opção para cadastrar uma nova inspeção está na página de **Checklists**.

## 🚀 Passo a Passo

### 1. Acesse a Página de Checklists

**Opção A - Pelo Menu Lateral:**
- No menu lateral esquerdo, clique em **"Checklists"** (ícone de checklist 📋)

**Opção B - Pela Página Inicial:**
- Na página inicial (Home), clique no card **"Inspeções"**

**Opção C - Pela URL:**
- Acesse diretamente: `http://localhost:5173/checklists`

### 2. Selecione uma Barragem

- No topo da página, há um **card com seletor de barragem**
- Clique no dropdown e **selecione a barragem** desejada
- ⚠️ **IMPORTANTE**: O botão "Nova Inspeção" só aparece depois de selecionar uma barragem!

### 3. Clique no Botão "Nova Inspeção"

- No **canto superior direito** da página, você verá um botão:
  ```
  [+ Nova Inspeção]
  ```
- Clique neste botão

### 4. Preencha o Formulário

Um dialog será aberto com os seguintes campos:

**Campos Obrigatórios (*):**
- **Tipo de Inspeção**: Mensal, Especial ou Emergencial
- **Data da Inspeção**: Selecione a data
- **Inspetor Responsável**: Nome do inspetor

**Campos Opcionais:**
- **Condições Climáticas**: Ex: Ensolarado, Nublado, Chuvoso
- **Status**: Em Andamento, Concluída ou Cancelada
- **Observações Gerais**: Texto livre

### 5. Salve a Inspeção

- Clique no botão **"Salvar"** no rodapé do dialog
- A inspeção será criada e aparecerá na lista

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
│  │ Selecione uma Barragem            │ │
│  │ [Barragem ABC ▼]                  │ │ ← Selecione aqui
│  └───────────────────────────────────┘ │
│                                         │
│                    [+ Nova Inspeção]   │ ← Clique aqui!
│                                         │
│  (Lista de inspeções aparecerá aqui)   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Dialog: Nova Inspeção                  │
│  ┌───────────────────────────────────┐ │
│  │ Tipo: [Mensal ▼]                  │ │
│  │ Data: [__/__/____]                 │ │
│  │ Inspetor: [________]               │ │
│  │ Clima: [________]                  │ │
│  │ Status: [Em Andamento ▼]           │ │
│  │ Observações: [________]             │ │
│  │                                    │ │
│  │ [Cancelar] [Salvar]                │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📍 Onde Está o Botão

O botão **"Nova Inspeção"** está localizado:

- **Posição**: Canto superior direito da página
- **Aparência**: Botão azul com ícone de "+" e texto "Nova Inspeção"
- **Visibilidade**: Só aparece quando uma barragem está selecionada

## ⚠️ Problemas Comuns

### "Não vejo o botão Nova Inspeção"

**Solução:**
1. Verifique se você selecionou uma barragem no dropdown
2. O botão só aparece quando há uma barragem selecionada
3. Se não houver barragens cadastradas, cadastre uma primeiro em "Barragens"

### "O botão não funciona"

**Solução:**
1. Verifique se está logado no sistema
2. Verifique se tem permissões para criar inspeções
3. Recarregue a página (F5)
4. Verifique o console do navegador (F12) para erros

### "Não consigo selecionar uma barragem"

**Solução:**
1. Vá em "Barragens" e cadastre uma barragem primeiro
2. Volte para "Checklists"
3. Agora você poderá selecionar a barragem

## ✅ Checklist Rápido

- [ ] Acessei a página Checklists
- [ ] Selecionei uma barragem
- [ ] Vi o botão "Nova Inspeção" no canto superior direito
- [ ] Cliquei no botão
- [ ] Preenchi os campos obrigatórios
- [ ] Cliquei em "Salvar"
- [ ] A inspeção apareceu na lista

## 🎯 Após Criar a Inspeção

Depois de criar a inspeção, você pode:

1. **Visualizar**: Clique no botão "Visualizar" 👁️ para ver detalhes
2. **Editar**: Clique no botão "Editar" ✏️ para modificar
3. **Adicionar Caracterização**: Na visualização, vá na aba "Caracterização da Barragem"
4. **Adicionar Perguntas/Respostas**: (se houver perguntas configuradas)

## 📝 Resumo Ultra-Rápido

1. **Menu** → **Checklists**
2. **Selecione** uma barragem
3. **Clique** em "**+ Nova Inspeção**" (canto superior direito)
4. **Preencha** o formulário
5. **Salve**




