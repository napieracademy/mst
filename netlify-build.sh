#!/bin/bash

# Script per il build in ambiente Netlify con configurazioni robuste
echo "=== INIZIO BUILD NETLIFY ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Verifica variabili d'ambiente
echo "Verifica variabili d'ambiente..."
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
  echo "Warning: NEXT_PUBLIC_SITE_URL non impostata!"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Warning: NEXT_PUBLIC_SUPABASE_URL non impostata!"
fi

# Pulizia cache
echo "Pulizia cache..."
npm cache clean --force
rm -rf .next
rm -rf node_modules/.cache

# Installazione dipendenze
echo "Installazione dipendenze..."
npm install --legacy-peer-deps

# Build con opzioni ottimizzate e controllo di fallimenti
echo "Avvio build..."
export NODE_OPTIONS="--max-old-space-size=3584" 
export NEXT_TELEMETRY_DISABLED=1

# Usa next build direttamente invece di npm per maggiore controllo
echo "Avvio next build..."
./node_modules/.bin/next build

# Verifica risultato
BUILD_RESULT=$?
if [ $BUILD_RESULT -eq 0 ]; then
  echo "=== BUILD COMPLETATO CON SUCCESSO ==="
else
  echo "=== ERRORE NEL BUILD (Exit code: $BUILD_RESULT) ==="
  exit $BUILD_RESULT
fi