"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal } from "./portal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  zIndex?: number;
  portalId?: string;
}

/**
 * Componente Modal standardizzato che utilizza React Portal
 * per evitare problemi di sovrapposizione e z-index.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  contentClassName,
  showCloseButton = true,
  closeOnOutsideClick = true,
  zIndex = 9000,
  portalId = "modal-portal"
}: ModalProps) {
  // Blocca lo scroll quando il modale è aperto
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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal zIndex={zIndex} id={portalId}>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4",
          className
        )}
        onClick={closeOnOutsideClick ? onClose : undefined}
        aria-modal="true"
        role="dialog"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div
          className={cn(
            "bg-black/90 rounded-xl shadow-xl w-full max-w-lg overflow-hidden",
            contentClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              {title && (
                <h2 id="modal-title" className="text-lg font-medium">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          <div className="p-6">
            {description && (
              <p id="modal-description" className="text-gray-400 mb-4">
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}

/**
 * Higher Order Component per avvolgere componenti esistenti con il Modal.
 * Utile per migrare componenti esistenti a Portal.
 */
export function withModal<P extends { isOpen: boolean; onClose: () => void }>(
  Component: React.ComponentType<P>,
  zIndex?: number,
  portalId?: string
) {
  return function WithModal(props: P) {
    if (!props.isOpen) return null;
    
    return (
      <Portal zIndex={zIndex} id={portalId}>
        <Component {...props} />
      </Portal>
    );
  };
}