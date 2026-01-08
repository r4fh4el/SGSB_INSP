# 🤝 Como Trabalhar com Múltiplos Sistemas

## 🎯 Estratégia Recomendada

### **1. Estrutura de Pastas**

Organize assim:

```
E:\SGSB_PROJETOS\
├── SGSB_INSP_SQL\          # Sistema de Inspeção (atual)
├── SGSB_HIDRO\             # Sistema Hidro (novo)
└── SGSB_ALERTA\            # Sistema de Alertas (novo)
```

**OU se preferir tudo junto:**

```
E:\SGSB_INSP_SQL\
├── SGSB\                   # Sistema de Inspeção (atual)
├── HIDRO\                  # Sistema Hidro
└── ALERTA\                 # Sistema de Alertas
```

---

## 💬 Como Me Orientar

### **Template de Mensagem:**

```
"[SISTEMA] - [AÇÃO]

Contexto:
- O que já existe
- O que precisa fazer
- Dependências ou requisitos"
```

### **Exemplos:**

#### Exemplo 1: Trabalhando no SGSB_HIDRO
```
"SGSB_HIDRO - Criar módulo de processamento inteligente

Contexto:
- Já tenho a API meteorológica configurada
- Preciso processar dados de chuva prevista
- Calcular vazão afluente e nível final do reservatório
- Integrar com os sensores IoT existentes"
```

#### Exemplo 2: Trabalhando no SGSB_ALERTA
```
"SGSB_ALERTA - Melhorar sistema de notificações

Contexto:
- Alertas já são criados automaticamente
- Preciso adicionar notificações por email/SMS
- Integrar com sistema de sirenes
- Criar dashboard de alertas em tempo real"
```

#### Exemplo 3: Trabalhando no SGSB (Inspeção)
```
"SGSB - Adicionar novo tipo de instrumento

Contexto:
- Sistema atual tem piezômetros e medidores de nível
- Preciso adicionar suporte para pluviômetros automáticos
- Integrar com telemetria 4G/LoRaWAN"
```

---

## 🔄 Fluxo de Trabalho

### **Passo 1: Informar o Sistema**
```
"Vou trabalhar no [NOME_DO_SISTEMA] agora"
```

### **Passo 2: Descrever a Tarefa**
```
"Preciso [O QUE FAZER]
Baseado em [CONTEXTO/REQUISITOS]"
```

### **Passo 3: Eu Trabalho**
- Foco no sistema indicado
- Implemento o que você pediu
- Mantenho contexto do sistema atual

### **Passo 4: Trocar de Sistema (se necessário)**
```
"Agora vou para [OUTRO_SISTEMA]
Preciso [NOVA_TAREFA]"
```

---

## 📋 Vantagens desta Abordagem

### ✅ **Clareza**
- Sempre sei qual sistema você está trabalhando
- Não há confusão entre sistemas

### ✅ **Foco**
- Trabalho apenas no sistema indicado
- Não mexo em outros sistemas sem permissão

### ✅ **Eficiência**
- Você me orienta exatamente o que precisa
- Eu implemento de forma direta

### ✅ **Organização**
- Cada sistema mantém sua estrutura
- Fácil de navegar e encontrar coisas

---

## 🎯 Casos de Uso

### **Caso 1: Trabalhando em um sistema**
```
"SGSB_HIDRO - Implementar algoritmo de alerta inteligente"
```
→ Eu foco no SGSB_HIDRO e implemento

---

### **Caso 2: Compartilhando código entre sistemas**
```
"SGSB_HIDRO - Usar a função de cálculo de severidade do SGSB"
```
→ Eu pego do SGSB e adapto para SGSB_HIDRO

---

### **Caso 3: Integração entre sistemas**
```
"Integrar SGSB_HIDRO com SGSB_ALERTA
- SGSB_HIDRO calcula risco
- SGSB_ALERTA recebe e notifica"
```
→ Eu trabalho nos dois sistemas conforme necessário

---

## 💡 Dicas

1. **Sempre informe qual sistema** no início da mensagem
2. **Seja específico** sobre o que precisa
3. **Mencione dependências** (ex: "usar dados do SGSB")
4. **Peça para eu focar** se eu me confundir

---

## ✅ Checklist

Antes de começar a trabalhar:

- [ ] Sistema identificado claramente
- [ ] Tarefa descrita de forma específica
- [ ] Contexto fornecido (o que já existe)
- [ ] Requisitos mencionados (o que precisa fazer)

---

## 🚀 Pronto para Começar!

Agora é só me dizer:
- Qual sistema você quer trabalhar
- O que precisa fazer
- Qualquer contexto relevante

E eu trabalho focado nesse sistema! 🎯

