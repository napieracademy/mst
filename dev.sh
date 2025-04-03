#!/bin/bash

# Colori per output più leggibile
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}= Script di sviluppo Mastroianni Film =${NC}"
echo -e "${BLUE}=======================================${NC}"

# Funzione per terminare i processi Node.js già in esecuzione
kill_node_processes() {
  echo -e "${YELLOW}Terminazione di tutti i processi Node.js in esecuzione...${NC}"
  pkill -f node || true
  sleep 1
}

# Funzione per rimediare ai permessi della cartella .next
fix_next_permissions() {
  if [ -d ".next" ]; then
    echo -e "${YELLOW}Correggo i permessi della cartella .next...${NC}"
    chmod -R 755 .next || {
      echo -e "${RED}Non è stato possibile correggere i permessi della cartella .next${NC}"
      echo -e "${YELLOW}Provo ad eliminarla come utente normale...${NC}"
      rm -rf .next || {
        echo -e "${RED}Non è stato possibile eliminare la cartella .next${NC}"
        echo -e "${YELLOW}Provo con sudo una sola volta...${NC}"
        sudo rm -rf .next
        # Previene la creazione di cartelle con problemi di permessi in futuro
        mkdir -p .next
        chmod 755 .next
      }
    }
  else
    echo -e "${GREEN}Cartella .next non presente, ottimo.${NC}"
  fi
}

# Funzione per liberare le porte utilizzate da Next.js
free_ports() {
  echo -e "${YELLOW}Liberazione delle porte da 3000 a 3010...${NC}"
  for port in {3000..3010}
  do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
      echo -e "${YELLOW}Terminazione processo sulla porta $port (PID: $pid)${NC}"
      kill -9 $pid 2>/dev/null || true
    fi
  done
  sleep 1
}

# Funzione principale per avviare il server
start_server() {
  # Imposta una porta specifica
  echo -e "${GREEN}Avvio del server Next.js sulla porta 3000...${NC}"
  PORT=3000 npm run dev
}

# Esecuzione principale dello script
echo -e "${YELLOW}Preparazione dell'ambiente di sviluppo...${NC}"

# Termina i processi precedenti
kill_node_processes

# Libera le porte
free_ports

# Corregge permessi e pulisce .next
fix_next_permissions

# Avvia il server
echo -e "${GREEN}Ambiente di sviluppo pronto! Avvio del server...${NC}"
start_server 