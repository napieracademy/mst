#!/bin/bash

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}= Correzione permessi Mastroianni Film =${NC}"
echo -e "${BLUE}=======================================${NC}"

# Ottenere il nome utente corrente
CURRENT_USER=$(whoami)
echo -e "${YELLOW}Utente corrente: ${CURRENT_USER}${NC}"

# Terminare processi Next.js in esecuzione
echo -e "${YELLOW}Terminazione di processi Next.js in esecuzione...${NC}"
pkill -f "next" || true
sleep 1

# Rimozione directory .next con sudo (se necessario)
if [ -d ".next" ]; then
  echo -e "${YELLOW}Rimozione della cartella .next...${NC}"
  sudo rm -rf .next
fi

# Correzione delle cartelle di cache
echo -e "${YELLOW}Pulizia e correzione delle cartelle di cache...${NC}"
sudo rm -rf node_modules/.cache
sudo rm -rf .next

# Creazione delle directory con permessi corretti
echo -e "${YELLOW}Creazione di cartelle con permessi corretti...${NC}"
mkdir -p .next
mkdir -p node_modules/.cache

# Impostazione dei permessi corretti
echo -e "${YELLOW}Impostazione dei permessi corretti...${NC}"
sudo chown -R $CURRENT_USER:$(id -gn) .
chmod -R 755 .next
chmod -R 755 node_modules

echo -e "${GREEN}Permessi corretti con successo!${NC}"
echo -e "${GREEN}Ora puoi eseguire ./dev.sh per avviare il server di sviluppo${NC}" 