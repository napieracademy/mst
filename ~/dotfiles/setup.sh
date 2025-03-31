#!/bin/bash

# Colori per i messaggi
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Inizializzazione dei dotfiles...${NC}"

# Directory corrente
DOTFILES_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Funzione per creare i symlink
create_symlink() {
    local source=$1
    local target=$2
    
    if [ -f "$target" ] || [ -d "$target" ]; then
        echo -e "${YELLOW}⚠️  $target esiste già. Creo backup...${NC}"
        mv "$target" "$target.backup"
    fi
    
    echo -e "${GREEN}🔗 Creo symlink: $source -> $target${NC}"
    ln -s "$source" "$target"
}

# Creo i symlink per i file di configurazione
create_symlink "$DOTFILES_DIR/.zshrc" "$HOME/.zshrc"
create_symlink "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"
create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
create_symlink "$DOTFILES_DIR/.tmux.conf" "$HOME/.tmux.conf"

# Creo la directory per i plugin di vim se non esiste
mkdir -p "$HOME/.vim/plugins"
mkdir -p "$HOME/.vim/undodir"

# Installo Vim Plug se non è già installato
if [ ! -f "$HOME/.vim/autoload/plug.vim" ]; then
    echo -e "${GREEN}📦 Installo Vim Plug...${NC}"
    curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
        https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
fi

# Installo Oh My Zsh se non è già installato
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo -e "${GREEN}📦 Installo Oh My Zsh...${NC}"
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Installo Powerlevel10k theme per Oh My Zsh
if [ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k" ]; then
    echo -e "${GREEN}📦 Installo Powerlevel10k theme...${NC}"
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
fi

# Installo zsh-autosuggestions se non è già installato
if [ ! -d "$HOME/.oh-my-zsh/custom/plugins/zsh-autosuggestions" ]; then
    echo -e "${GREEN}📦 Installo zsh-autosuggestions...${NC}"
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
fi

# Installo zsh-syntax-highlighting se non è già installato
if [ ! -d "$HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" ]; then
    echo -e "${GREEN}📦 Installo zsh-syntax-highlighting...${NC}"
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
fi

echo -e "${GREEN}✅ Setup completato!${NC}"
echo -e "${YELLOW}⚠️  Riavvia il terminale per applicare le modifiche${NC}" 