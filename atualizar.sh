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

# 3. Aplicar migrações do Prisma
echo "🗄️ Aplicando migrações do banco de dados..."
docker exec app_ong-app-1 npx prisma migrate deploy

# 4. Limpar imagens antigas (opcional, para economizar espaço)
echo "🧹 Limpando imagens antigas não utilizadas..."
docker image prune -f

echo "✅ Atualização concluída com sucesso! O sistema já está rodando a nova versão."
