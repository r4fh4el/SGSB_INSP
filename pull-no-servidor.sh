#!/bin/bash
# Script para fazer pull do SGSB_INSP no servidor

echo "========================================"
echo "  PULL SGSB_INSP NO SERVIDOR"
echo "========================================"
echo ""

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    echo "✗ Este diretório não é um repositório Git!"
    exit 1
fi

# Fazer backup do .env
if [ -f ".env" ]; then
    BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_FILE"
    echo "✓ Backup do .env criado: $BACKUP_FILE"
else
    echo "⚠ Arquivo .env não encontrado"
fi

echo ""
echo "Verificando alterações no repositório remoto..."
git fetch origin

# Verificar se há alterações
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✓ Já está atualizado com o repositório remoto"
    exit 0
fi

echo ""
echo "Há alterações para baixar!"
echo "Últimos commits:"
git log HEAD..origin/main --oneline 2>/dev/null || git log HEAD..origin/master --oneline 2>/dev/null

echo ""
read -p "Deseja continuar com o pull? (s/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 0
fi

# Fazer pull
echo ""
echo "Fazendo pull..."
BRANCH=$(git branch --show-current)
git pull origin "$BRANCH" || git pull origin main || git pull origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Pull realizado com sucesso!"
    
    # Restaurar .env se foi alterado
    if [ -f "$BACKUP_FILE" ] && [ -f ".env" ]; then
        # Verificar se .env foi alterado pelo git
        if git diff --quiet HEAD HEAD~1 -- .env 2>/dev/null; then
            echo "✓ .env não foi alterado pelo git"
        else
            echo "⚠ .env foi alterado pelo git"
            echo "  Backup disponível em: $BACKUP_FILE"
            read -p "Deseja restaurar o .env do backup? (s/N) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                cp "$BACKUP_FILE" .env
                echo "✓ .env restaurado do backup"
            fi
        fi
    fi
    
    echo ""
    echo "Próximos passos:"
    echo "  1. Instalar dependências (se necessário): npm install"
    echo "  2. Rebuild (se necessário): npm run build"
    echo "  3. Reiniciar servidor: pm2 restart all"
    echo ""
else
    echo ""
    echo "✗ Erro ao fazer pull"
    echo "  Verifique se há conflitos: git status"
    exit 1
fi

