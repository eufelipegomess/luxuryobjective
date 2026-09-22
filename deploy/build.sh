#!/usr/bin/env bash
# Build para servidor próprio.
#
# `standalone` deixa em .next/standalone um servidor com apenas as dependências
# que usa. Faltam-lhe dois diretórios que o Next não copia: `public` e
# `.next/static`. Sem eles o site arranca sem imagens nem estilos — é o erro
# mais comum nesta instalação, e é por isso que este script existe.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ dependências"
npm ci

echo "→ build"
NEXT_OUTPUT=standalone npm run build

echo "→ a juntar public/ e .next/static ao servidor"
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/

echo "✓ pronto. Arrancar com: node .next/standalone/server.js"
