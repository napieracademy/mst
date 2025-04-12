"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  id?: string;
  zIndex?: number;
}

/**
 * Componente Portal che renderizza i suoi figli in un nodo DOM separato,
 * al di fuori della gerarchia DOM normale dell'applicazione.
 * Usato per overlay, modal e componenti che devono uscire dal flusso normale.
 */
export function Portal({ 
  children, 
  id = "react-portal", 
  zIndex = 9999 
}: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  
  // Crea il container del portale quando il componente viene montato
  useEffect(() => {
    // Check per client-side rendering
    setMounted(true);
    
    // Cerca un portale esistente o ne crea uno nuovo
    let element = document.getElementById(id);
    let createdNewElement = false;
    
    if (!element) {
      createdNewElement = true;
      element = document.createElement("div");
      element.id = id;
      element.style.position = "fixed";
      element.style.zIndex = zIndex.toString();
      element.setAttribute("data-portal", "true");
      document.body.appendChild(element);
    }
    
    setPortalElement(element);
    
    // Cleanup al dismount
    return () => {
      // Rimuovi l'elemento dal DOM solo se l'abbiamo creato noi
      // e non ha altri figli (altri portali con lo stesso ID)
      if (createdNewElement && element && element.childElementCount <= 1) {
        if (element.parentElement) {
          element.parentElement.removeChild(element);
        }
      }
    };
  }, [id, zIndex]);
  
  // Non renderizzare nulla sul server o prima che il componente sia montato
  if (!mounted || !portalElement) return null;
  
  // Renderizza i children nel portale
  return createPortal(children, portalElement);
}

/**
 * Higher Order Component (HOC) che avvolge un componente con un portale.
 * Utile per convertire facilmente componenti esistenti in componenti portale.
 */
export function withPortal<P>(
  Component: React.ComponentType<P>, 
  portalId?: string,
  zIndex?: number
) {
  return function WithPortal(props: P) {
    return (
      <Portal id={portalId} zIndex={zIndex}>
        <Component {...props} />
      </Portal>
    );
  };
}