#!/bin/bash
# Script rápido para fazer pull no servidor via SSH
# Uso: ./pull-servidor-rapido.sh USER@HOST [CAMINHO]

USER_HOST=${1:-"USER@HOST"}
PROJECT_PATH=${2:-"~/SGSB_INSP"}

echo "========================================"
echo "  PULL SGSB_INSP NO SERVIDOR VIA SSH"
echo "========================================"
echo ""
echo "Servidor: $USER_HOST"
echo "Caminho: $PROJECT_PATH"
echo ""

# Executar comandos no servidor
ssh $USER_HOST << EOF
set -e

echo "Navegando para $PROJECT_PATH..."
cd $PROJECT_PATH

echo ""
echo "Fazendo backup do .env..."
if [ -f .env ]; then
    BACKUP_FILE=".env.backup.\$(date +%Y%m%d_%H%M%S)"
    cp .env "\$BACKUP_FILE"
    echo "✓ Backup criado: \$BACKUP_FILE"
else
    echo "⚠ Arquivo .env não encontrado"
fi

echo ""
echo "Verificando alterações..."
git fetch origin

LOCAL=\$(git rev-parse @)
REMOTE=\$(git rev-parse @{u} 2>/dev/null || echo "")

if [ -z "\$REMOTE" ]; then
    echo "⚠ Branch remota não encontrada, fazendo pull mesmo assim..."
    git pull origin main || git pull origin master
elif [ "\$LOCAL" = "\$REMOTE" ]; then
    echo "✓ Já está atualizado"
    exit 0
else
    echo "Há alterações para baixar!"
    echo "Últimos commits:"
    git log HEAD..origin/main --oneline 2>/dev/null || git log HEAD..origin/master --oneline 2>/dev/null
    echo ""
    echo "Fazendo pull..."
    git pull origin main || git pull origin master
fi

echo ""
echo "Instalando dependências..."
if [ -f pnpm-lock.yaml ]; then
    pnpm install
elif [ -f package-lock.json ]; then
    npm install
else
    echo "⚠ Nenhum gerenciador de pacotes detectado"
fi

echo ""
echo "Reiniciando servidor..."
if command -v pm2 &> /dev/null; then
    pm2 restart all || pm2 restart sgsb-insp
    echo "✓ Servidor reiniciado"
    echo ""
    echo "Status do PM2:"
    pm2 status
else
    echo "⚠ PM2 não encontrado, reinicie manualmente"
fi

echo ""
echo "========================================"
echo "✓ ATUALIZAÇÃO CONCLUÍDA!"
echo "========================================"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Pull realizado com sucesso no servidor!"
else
    echo ""
    echo "✗ Erro ao executar pull no servidor"
    exit 1
fi

