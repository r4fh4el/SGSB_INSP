#!/bin/bash
# Script para testar o endpoint da API HIDRO

echo "========================================"
echo "  TESTE DE ENDPOINT DA API HIDRO"
echo "========================================"
echo ""

# Carregar .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

API_URL="${HIDRO_API_URL:-http://72.60.57.220:5204}"
BARRA_ID=3

echo "URL Base: $API_URL"
echo "Barragem ID: $BARRA_ID"
echo ""

# Teste 1: Swagger
echo "=== Teste 1: Swagger ==="
SWAGGER_URL="${API_URL}/swagger"
echo "Testando: $SWAGGER_URL"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$SWAGGER_URL" 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Swagger está acessível (HTTP $HTTP_CODE)"
else
    echo "✗ Swagger retornou HTTP $HTTP_CODE"
    curl -v "$SWAGGER_URL" 2>&1 | head -10
fi
echo ""

# Teste 2: Endpoint de cálculos
echo "=== Teste 2: Endpoint de Cálculos ==="
CALCULOS_URL="${API_URL}/API/BuscarCalculosAutomaticosPorBarragem?barragemId=${BARRA_ID}"
echo "Testando: $CALCULOS_URL"
echo ""

HTTP_CODE=$(curl -s -o /tmp/response.json -w "%{http_code}" --connect-timeout 10 "$CALCULOS_URL" 2>&1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Endpoint está funcionando!"
    echo "Resposta (primeiros 500 caracteres):"
    head -c 500 /tmp/response.json
    echo ""
    echo ""
else
    echo "✗ Endpoint retornou erro HTTP $HTTP_CODE"
    echo "Resposta completa:"
    cat /tmp/response.json
    echo ""
fi

# Teste 3: Verificar se API está rodando
echo "=== Teste 3: Health Check ==="
HEALTH_URL="${API_URL}/api/health"
echo "Testando: $HEALTH_URL"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$HEALTH_URL" 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Health check OK (HTTP $HTTP_CODE)"
else
    echo "⚠ Health check não disponível (HTTP $HTTP_CODE)"
fi
echo ""

# Resumo
echo "========================================"
echo "  RESUMO"
echo "========================================"
echo ""
echo "Se o endpoint retornou 404:"
echo "  1. Verifique se a WebAPI está rodando"
echo "  2. Verifique se está na porta 5204"
echo "  3. Verifique se o endpoint existe: /API/BuscarCalculosAutomaticosPorBarragem"
echo ""
echo "Para testar manualmente:"
echo "  curl \"$CALCULOS_URL\""
echo ""

rm -f /tmp/response.json



