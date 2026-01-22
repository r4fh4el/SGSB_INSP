#!/bin/bash
# Script para testar conectividade com a API HIDRO

echo "========================================"
echo "Teste de Conectividade - API HIDRO"
echo "========================================"
echo ""

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Arquivo .env carregado"
else
    echo "✗ Arquivo .env não encontrado!"
    exit 1
fi

# Verificar se HIDRO_API_URL está configurada
if [ -z "$HIDRO_API_URL" ]; then
    echo "✗ HIDRO_API_URL não configurada no .env"
    exit 1
fi

echo "HIDRO_API_URL: $HIDRO_API_URL"
echo ""

# Normalizar URL (substituir 0.0.0.0 por localhost)
TEST_URL="$HIDRO_API_URL"
if [[ "$TEST_URL" == *"0.0.0.0"* ]]; then
    echo "⚠️  URL contém 0.0.0.0, substituindo por localhost"
    TEST_URL="${TEST_URL//0.0.0.0/localhost}"
    echo "URL normalizada: $TEST_URL"
    echo ""
fi

# Extrair host e porta
if [[ $TEST_URL =~ http://([^:]+):([0-9]+) ]]; then
    HOST="${BASH_REMATCH[1]}"
    PORT="${BASH_REMATCH[2]}"
    echo "Host: $HOST"
    echo "Porta: $PORT"
    echo ""
else
    echo "✗ Formato de URL inválido: $TEST_URL"
    exit 1
fi

# Teste 1: Verificar se a porta está acessível
echo "=== Teste 1: Conectividade de Rede ==="
if command -v nc &> /dev/null; then
    if nc -z -v -w5 "$HOST" "$PORT" 2>&1; then
        echo "✓ Porta $PORT está acessível em $HOST"
    else
        echo "✗ Porta $PORT NÃO está acessível em $HOST"
        echo "  Possíveis causas:"
        echo "    - Firewall bloqueando a porta"
        echo "    - API não está rodando"
        echo "    - Host/porta incorretos"
    fi
else
    echo "⚠️  netcat (nc) não instalado, pulando teste de porta"
fi
echo ""

# Teste 2: Testar endpoint Swagger
echo "=== Teste 2: Endpoint Swagger ==="
SWAGGER_URL="${TEST_URL}/swagger"
echo "Testando: $SWAGGER_URL"

if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$SWAGGER_URL" 2>&1)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Swagger está acessível (HTTP $HTTP_CODE)"
    else
        echo "✗ Swagger retornou HTTP $HTTP_CODE"
        echo "  Tentando obter resposta completa..."
        curl -v "$SWAGGER_URL" 2>&1 | head -20
    fi
else
    echo "⚠️  curl não instalado, pulando teste HTTP"
fi
echo ""

# Teste 3: Testar endpoint de cálculos
echo "=== Teste 3: Endpoint de Cálculos ==="
CALCULOS_URL="${TEST_URL}/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"
echo "Testando: $CALCULOS_URL"

if command -v curl &> /dev/null; then
    echo "Fazendo requisição..."
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" --connect-timeout 10 "$CALCULOS_URL" 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Endpoint de cálculos está funcionando (HTTP $HTTP_CODE)"
        echo "Resposta (primeiros 200 caracteres):"
        echo "$BODY" | head -c 200
        echo ""
    else
        echo "✗ Endpoint retornou HTTP $HTTP_CODE"
        echo "Resposta:"
        echo "$BODY" | head -c 500
        echo ""
    fi
else
    echo "⚠️  curl não instalado, pulando teste"
fi
echo ""

# Resumo
echo "========================================"
echo "Resumo"
echo "========================================"
echo "URL configurada: $HIDRO_API_URL"
echo "URL de teste: $TEST_URL"
echo ""
echo "Se todos os testes falharam:"
echo "  1. Verifique se a WebAPI está rodando"
echo "  2. Verifique o firewall do servidor"
echo "  3. Verifique se o IP/porta estão corretos"
echo "  4. Teste manualmente: curl $TEST_URL/swagger"
echo ""



