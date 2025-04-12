"use client";

import React, { useEffect, useRef } from "react";
import { Portal } from "./portal";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  size?: string;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  zIndex?: number;
  portalId?: string;
}

/**
 * Componente Drawer (pannello laterale) che utilizza React Portal
 * per creare un pannello scorrevole da un lato dello schermo.
 */
export function CustomDrawer({
  isOpen,
  onClose,
  children,
  position = "right",
  size = "300px",
  className,
  contentClassName,
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  zIndex = 9200,
  portalId = "drawer-portal"
}: DrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Blocca lo scroll quando il drawer è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Gestisce la chiusura con tasto ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Gestisce il clic fuori dal drawer
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Definisci stili in base alla posizione
  const positionStyles: React.CSSProperties = {};
  const dimensionStyles: React.CSSProperties = {};

  switch (position) {
    case "left":
      positionStyles.left = 0;
      dimensionStyles.width = size;
      dimensionStyles.height = "100%";
      break;
    case "right":
      positionStyles.right = 0;
      dimensionStyles.width = size;
      dimensionStyles.height = "100%";
      break;
    case "top":
      positionStyles.top = 0;
      dimensionStyles.height = size;
      dimensionStyles.width = "100%";
      break;
    case "bottom":
      positionStyles.bottom = 0;
      dimensionStyles.height = size;
      dimensionStyles.width = "100%";
      break;
  }

  const drawerClasses = cn(
    "fixed bg-black/90 shadow-xl transition-transform duration-300 ease-in-out",
    {
      "inset-y-0": position === "left" || position === "right",
      "inset-x-0": position === "top" || position === "bottom",
    },
    contentClassName
  );

  return (
    <Portal zIndex={zIndex} id={portalId}>
      {/* Overlay di sfondo */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          className
        )}
        onClick={handleBackdropClick}
      >
        {/* Contenuto del drawer */}
        <div
          ref={contentRef}
          className={drawerClasses}
          style={{
            ...positionStyles,
            ...dimensionStyles
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="p-6 h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}