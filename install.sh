#!/bin/bash

# ============================================
# Script de Instalação Rápida - SGSB
# ============================================

echo "🚀 Iniciando instalação do SGSB..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "   Instale Node.js 18+ em: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm encontrado: $NPM_VERSION"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

echo "✅ Dependências instaladas!"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚙️  Criando arquivo .env..."
    if [ -f env.example.txt ]; then
        cp env.example.txt .env
        echo "✅ Arquivo .env criado a partir de env.example.txt"
        echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações!"
    else
        echo "⚠️  Arquivo env.example.txt não encontrado!"
        echo "   Crie manualmente o arquivo .env"
    fi
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

echo "✅ Build concluído!"
echo ""
echo "============================================"
echo "✅ Instalação concluída!"
echo "============================================"
echo ""
echo "📝 Próximos passos:"
echo "   1. Edite o arquivo .env com suas configurações"
echo "   2. Configure o SQL Server (veja CONFIGURAR_SQL_ONLINE.md)"
echo "   3. Execute: npm start"
echo ""
echo "📚 Documentação:"
echo "   - COMO_RODAR_ONLINE.md - Guia completo"
echo "   - CONFIGURAR_SQL_ONLINE.md - Configurar SQL Server"
echo ""


