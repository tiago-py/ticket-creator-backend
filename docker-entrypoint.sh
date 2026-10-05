#!/bin/sh
set -eu

echo "Aplicando migrations do banco de dados..."
npx prisma migrate deploy

echo "Iniciando a API..."
exec "$@"
