#!/bin/bash
# Script para corrigir o .env online

echo "========================================"
echo "  CORREÇÃO DO .env ONLINE"
echo "========================================"
echo ""

ENV_FILE=".env"
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"

# Fazer backup
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✓ Backup criado: $BACKUP_FILE"
else
    echo "✗ Arquivo .env não encontrado!"
    exit 1
fi

echo ""
echo "Corrigindo HIDRO_API_URL..."
echo ""

# Remover /swagger/ do final da HIDRO_API_URL
if grep -q "HIDRO_API_URL=http.*swagger" "$ENV_FILE"; then
    # Substituir qualquer URL que termine com /swagger ou /swagger/
    sed -i 's|HIDRO_API_URL=\(http[^/]*\)/swagger/*|HIDRO_API_URL=\1|g' "$ENV_FILE"
    echo "✓ HIDRO_API_URL corrigida"
else
    echo "⚠ HIDRO_API_URL não contém /swagger, verificando formato..."
fi

# Verificar se HIDRO_API_URL está correta
HIDRO_URL=$(grep "^HIDRO_API_URL=" "$ENV_FILE" | cut -d'=' -f2)
echo "HIDRO_API_URL atual: $HIDRO_URL"

if [[ "$HIDRO_URL" == *"/swagger"* ]]; then
    echo "⚠ Ainda contém /swagger, corrigindo manualmente..."
    sed -i 's|HIDRO_API_URL=.*|HIDRO_API_URL=http://72.60.57.220:5204|g' "$ENV_FILE"
    echo "✓ Corrigido para: http://72.60.57.220:5204"
fi

echo ""
echo "Verificando outras configurações..."
echo ""

# Verificar PORT
if grep -q "^PORT=" "$ENV_FILE"; then
    PORT=$(grep "^PORT=" "$ENV_FILE" | cut -d'=' -f2)
    echo "PORT: $PORT"
    if [ "$PORT" != "80" ]; then
        echo "⚠ PORT não está configurado como 80"
    fi
else
    echo "⚠ PORT não encontrado, adicionando..."
    echo "PORT=80" >> "$ENV_FILE"
fi

# Verificar HOST
if grep -q "^HOST=" "$ENV_FILE"; then
    HOST=$(grep "^HOST=" "$ENV_FILE" | cut -d'=' -f2)
    echo "HOST: $HOST"
    if [ "$HOST" != "0.0.0.0" ]; then
        echo "⚠ HOST não está configurado como 0.0.0.0"
    fi
else
    echo "⚠ HOST não encontrado, adicionando..."
    echo "HOST=0.0.0.0" >> "$ENV_FILE"
fi

echo ""
echo "========================================"
echo "  RESUMO"
echo "========================================"
echo ""
echo "✓ Backup criado: $BACKUP_FILE"
echo "✓ .env corrigido"
echo ""
echo "HIDRO_API_URL corrigida:"
grep "^HIDRO_API_URL=" "$ENV_FILE"
echo ""
echo "Próximos passos:"
echo "  1. Verifique o arquivo .env"
echo "  2. Reinicie o servidor Node.js"
echo "  3. Teste a conexão"
echo ""

