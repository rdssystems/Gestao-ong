#!/bin/bash

# Script de Atualização Automática - Gestão ONG
echo "🚀 Iniciando atualização do sistema..."

# 1. Puxar as mudanças do Git
echo "📥 Buscando atualizações no repositório..."
git pull

# 2. Reconstruir e subir os containers
echo "🛠️ Reconstruindo containers..."
docker compose down
docker compose up -d --build

# 3. Recarregar o Nginx para limpar cache de IP
echo "🔄 Atualizando rotas do Nginx..."
docker exec gerenciador-nginx nginx -s reload

# 4. Limpar imagens antigas
echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo "✅ Sistema atualizado e online em https://gestaobalance.app.br"
