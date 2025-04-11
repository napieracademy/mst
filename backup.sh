#\!/bin/bash

# Script di backup per il progetto MST

# Crea directory di backup con timestamp
BACKUP_DIR="/Users/claudioripoli/Documents/mst_backup_$(date +"%Y%m%d_%H%M%S")"
mkdir -p "$BACKUP_DIR"

echo "Creazione backup in $BACKUP_DIR"

# Backup file di configurazione ambiente
echo "Backup file .env*..."
cp -R .env* "$BACKUP_DIR/"

# Backup configurazioni VSCode
echo "Backup configurazioni VSCode..."
cp -R .vscode "$BACKUP_DIR/"

# Salva le modifiche locali come patch
echo "Salvataggio modifiche locali..."
git diff > "$BACKUP_DIR/local_changes.diff"

# Backup file non tracciati 
echo "Backup file non tracciati da git..."
mkdir -p "$BACKUP_DIR/untracked"
git ls-files --others --exclude-standard | xargs -I{} cp --parents {} "$BACKUP_DIR/untracked/" 2>/dev/null || true

echo "\nBackup completato in $BACKUP_DIR"
