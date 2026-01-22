#!/bin/bash
# Script para fazer pull das alterações no servidor via SSH
# Uso: ssh usuario@servidor 'bash -s' < comandos-ssh-pull-atualizado.sh
# OU execute os comandos diretamente no servidor

echo "=== Atualizando SGSB_INSP no servidor ==="
echo ""

# Navegar para o diretório do projeto
cd ~/SGSB_INSP || cd /var/www/SGSB_INSP || cd /home/usuario/SGSB_INSP || {
    echo "❌ Erro: Diretório SGSB_INSP não encontrado!"
    echo "   Verifique o caminho correto do projeto"
    exit 1
}

echo "📂 Diretório atual: $(pwd)"
echo ""

# Fazer backup do .env
if [ -f .env ]; then
    echo "💾 Fazendo backup do .env..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado"
else
    echo "⚠️  Arquivo .env não encontrado"
fi

echo ""
echo "🔄 Fazendo git fetch..."
git fetch origin

echo ""
echo "📥 Fazendo git pull..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer pull!"
    exit 1
fi

echo ""
echo "📦 Instalando/atualizando dependências..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo "⚠️  pnpm não encontrado, usando npm..."
    npm install
fi

echo ""
echo "🔄 Reiniciando aplicação com PM2..."
if command -v pm2 &> /dev/null; then
    pm2 restart sgsb-insp || pm2 restart all
    echo "✅ Aplicação reiniciada"
    echo ""
    echo "📊 Status do PM2:"
    pm2 status
else
    echo "⚠️  PM2 não encontrado. Reinicie manualmente o servidor."
fi

echo ""
echo "✅ Atualização concluída!"
echo ""
echo "🌐 Verifique se a aplicação está rodando:"
echo "   - Frontend: http://SEU_IP/"
echo "   - API Panel: http://SEU_IP/api/panel"
echo "   - Health: http://SEU_IP/api/health"

