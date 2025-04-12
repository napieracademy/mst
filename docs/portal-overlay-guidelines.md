# Linee Guida per Componenti Overlay con React Portal

## Introduzione

Questo documento stabilisce le linee guida per la creazione e l'utilizzo di componenti overlay (modali, dropdown, toast, tooltip, ecc.) nell'applicazione. Abbiamo standardizzato l'uso di React Portal per questi componenti al fine di prevenire problemi di z-index e garantire una corretta sovrapposizione degli elementi UI.

## Vantaggi del nostro approccio basato su Portal

La standardizzazione dei componenti overlay tramite Portal offre diversi vantaggi:

1. **Risolve problemi di stacking context**: I componenti renderizzati tramite Portal esistono al di fuori della normale gerarchia DOM, evitando limitazioni imposte da elementi ancestor con proprietà CSS come `overflow: hidden`, `position: relative/absolute`, o contesti di stacking specifici.

2. **Controllo centralizzato degli z-index**: Il nostro sistema assegna automaticamente z-index coerenti seguendo una gerarchia predefinita, evitando conflitti tra componenti.

3. **Gestione ottimizzata dei portali**: La nostra implementazione gestisce automaticamente la creazione e la pulizia dei nodi portal nel DOM, prevenendo memory leak.

4. **Esperienza utente migliorata**: Garantisce che elementi come modali, tooltip e dropdown siano sempre visibili e non tagliati da altri elementi UI, migliorando usabilità e accessibilità.

5. **Compatibilità con sistemi esistenti**: La nostra implementazione è compatibile con librerie UI esistenti come Radix UI, permettendo un'integrazione fluida e mantenendo le funzionalità originali.

## Quando usare Portal

Utilizzare il componente `Portal` per:

- Modali e dialog
- Menu dropdown che possono essere tagliati dal overflow:hidden
- Tooltip che devono apparire sopra altri elementi
- Notifiche e toast
- Menu contestuali
- Componenti picture-in-picture
- Qualsiasi elemento UI che deve apparire sopra gli altri componenti

## Struttura del componente Portal

Il componente Portal è disponibile in `/components/ui/portal.tsx` e offre:

1. Un componente `<Portal>` standard
2. Un Higher Order Component `withPortal()` per avvolgere componenti esistenti

## Gerarchia degli z-index

Per mantenere coerenza e prevedibilità, seguire questa gerarchia di z-index:

| Componente                          | Range z-index | Note                                       |
|------------------------------------|---------------|-------------------------------------------|
| Contenuto principale               | 0-49          | Elementi standard della pagina             |
| Elementi fissi (bottoni, action)   | 50-999        | Elementi fissi che stanno sopra il contenuto |
| Header e navigation                | 1000-1999     | Header, navigation, menu primari          |
| Dropdown e popover                 | 2000-4999     | Menu dropdown, select, autocomplete       |
| Sticky elements                    | 5000-7999     | Elementi sticky durante lo scroll         |
| Floating elements                  | 8000-8999     | Elementi flottanti (search, chat)         |
| Modali e overlay                   | 9000-9799     | Dialog, modal, pannelli laterali          |
| Toast e notifiche                  | 9800-9899     | Notifiche temporanee                      |
| Trailer e video modali             | 9900-9999     | Priorità massima per video player         |

## Utilizzo base

```tsx
import { Portal } from '@/components/ui/portal';

function MyModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <Portal zIndex={9000}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose}>
        <div className="..." onClick={(e) => e.stopPropagation()}>
          {/* Contenuto del modale */}
        </div>
      </div>
    </Portal>
  );
}
```

## Utilizzo con Higher Order Component

Per componenti esistenti:

```tsx
import { withPortal } from '@/components/ui/portal';

const MyModal = ({ isOpen, onClose }) => {
  // ... implementazione esistente
};

// Esporta la versione avvolta in Portal
export default withPortal(MyModal, 'my-modal-portal', 9000);
```

## Gestione dello scroll

È importante gestire lo scroll della pagina quando un modale è aperto:

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  }
  
  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);
```

## Best Practices

1. **Naming coerente**: Usa ID descrittivi per i portali (es. `image-gallery-portal`)
2. **Event propagation**: Usa `stopPropagation()` per impedire che i click passino attraverso l'overlay
3. **Accessibilità**: Mantieni focus-trap all'interno dei modali per accessibilità
4. **Chiusura con ESC**: Implementa sempre la chiusura con tasto ESC
5. **Chiusura al click fuori**: Permetti sempre la chiusura cliccando fuori dal modale
6. **Animazioni**: Usa animazioni fluide per apertura/chiusura dei modali

## Esempio completo

```tsx
"use client"

import { useState, useEffect } from "react";
import { Portal } from '@/components/ui/portal';

export function ExampleModal({ isOpen, onClose, children }) {
  // Blocca lo scroll quando il modale è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);
  
  // Gestisce chiusura con tasto ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => { window.removeEventListener("keydown", handleEsc); };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <Portal zIndex={9000} id="example-modal-portal">
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center" 
        onClick={onClose}
      >
        <div 
          className="bg-white p-6 rounded-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}
```

## Come migrare componenti esistenti

Per migrare un componente esistente all'utilizzo di Portal, segui questi passaggi:

### Migrazione di un componente custom

```tsx
// Prima
function MyOverlayComponent({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Contenuto */}
      </div>
    </div>
  );
}

// Dopo
import { Portal } from '@/components/ui/portal';

function MyOverlayComponent({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <Portal zIndex={9000} id="my-overlay-portal">
      <div className="fixed inset-0 bg-black/50">
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Contenuto (non serve più z-index locale) */}
        </div>
      </div>
    </Portal>
  );
}
```

### Migrazione di un componente Radix UI o simile

```tsx
// Prima (con Portal di Radix)
const MyRadixComponent = React.forwardRef((props, ref) => (
  <RadixPrimitive.Portal>
    <RadixPrimitive.Content
      ref={ref}
      className="z-50 ..."
      {...props}
    />
  </RadixPrimitive.Portal>
));

// Dopo (con nostro Portal)
const MyRadixComponent = React.forwardRef((props, ref) => (
  <Portal id="my-radix-portal" zIndex={7000}>
    <RadixPrimitive.Content
      ref={ref}
      className="..." // non serve più z-index qui
      {...props}
    />
  </Portal>
));
```

## Componenti già migrati a Portal

I seguenti componenti già utilizzano Portal e possono essere usati come riferimento:

### Componenti custom:
- `TrailerModal` - per riprodurre video in un modale o PIP
- `ShareMenu` - menu di condivisione social
- `ImageModal` - visualizzazione galleria a schermo intero
- `FloatingSearch` - ricerca flottante e risultati
- `Toaster` - sistema di notifiche toast
- `Modal` (components/ui/modal.tsx) - componente modale generico basato su Portal
- `CustomPopover` (components/ui/custom-popover.tsx) - componente popover posizionato
- `CustomTooltip` (components/ui/custom-tooltip.tsx) - tooltip contestuale
- `CustomDrawer` (components/ui/custom-drawer.tsx) - pannello laterale slide-in

### Componenti UI standard con Portal integrato:
- `Tooltip` - contenuto tooltip viene renderizzato in un Portal
- `Dialog` - componente dialog/modal con overlay, renderizzato in Portal
- `Sheet` - pannello laterale slide-in, renderizzato in Portal
- `DropdownMenu` - menu dropdown posizionato, renderizzato in Portal
- `HoverCard` - card di preview al passaggio del mouse, renderizzata in Portal
- `Popover` - contenuto popover posizionato, renderizzato in Portal

## Troubleshooting

### Problemi comuni e soluzioni

1. **Elemento non appare o è sotto altri elementi**
   - Controlla che il valore `zIndex` nel Portal sia corretto secondo la gerarchia
   - Verifica che altri elementi non abbiano z-index superiori
   - Assicurati che il Portal sia montato nel corpo del documento (`document.body`)

2. **Posizionamento scorretto**
   - Per elementi ancorati (tooltip, popover), assicurati di aggiornare la posizione al resize/scroll
   - Utilizza `getBoundingClientRect()` sul trigger element per calcolare la posizione
   - Considera il posizionamento dinamico in base allo spazio disponibile

3. **Conflitti tra portali**
   - Assegna ID unici ai portali (es. `my-component-portal-123`)
   - Rispetta la gerarchia degli z-index
   - Verifica che i portali vengano correttamente smontati quando non servono

4. **Problemi di rendering/performance**
   - Usa `React.memo` o altri metodi di ottimizzazione per contenuti complessi in portali
   - Limita il numero di portali attivi contemporaneamente
   - Considera l'uso di un portale condiviso per elementi simili (es. un solo portale per tutti i tooltip)

5. **Problemi di server-rendering**
   - Il componente Portal è safe-lato-server grazie al check `if (!mounted) return null`
   - Assicurati che l'hydration lato client avvenga correttamente
   - Gestisci l'effetto "flash of unstyled content" durante l'idratazione