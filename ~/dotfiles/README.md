# Dotfiles

Questi sono i miei dotfiles personali per configurare il mio ambiente di sviluppo.

## Caratteristiche

- **Shell**: Zsh con Oh My Zsh e tema Powerlevel10k
- **Editor**: Vim/Neovim con plugin essenziali
- **Version Control**: Git con configurazioni ottimizzate
- **Terminal Multiplexer**: Tmux con configurazioni personalizzate

## Requisiti

- macOS (testato su macOS 13+)
- Homebrew
- Git
- Zsh
- Vim/Neovim
- Tmux

## Installazione

1. Clona il repository:
```bash
git clone https://github.com/yourusername/dotfiles.git ~/dotfiles
```

2. Esegui lo script di setup:
```bash
cd ~/dotfiles
chmod +x setup.sh
./setup.sh
```

3. Riavvia il terminale

## Struttura

```
dotfiles/
├── .zshrc           # Configurazione Zsh
├── .vimrc           # Configurazione Vim/Neovim
├── .gitconfig       # Configurazione Git
├── .tmux.conf       # Configurazione Tmux
├── setup.sh         # Script di installazione
└── README.md        # Questo file
```

## Personalizzazione

### Git
Modifica il file `.gitconfig` con le tue informazioni:
```ini
[user]
    name = Your Name
    email = your.email@example.com
```

### Vim/Neovim
I plugin sono gestiti tramite Vim Plug. Per installarli, apri Vim e esegui:
```
:PlugInstall
```

### Zsh
Il tema Powerlevel10k può essere personalizzato eseguendo:
```bash
p10k configure
```

## Manutenzione

Per aggiornare i dotfiles:
```bash
cd ~/dotfiles
git pull
./setup.sh
```

## Licenza

MIT 