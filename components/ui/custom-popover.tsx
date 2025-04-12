"use client";

import React, { useState, useEffect, useRef } from "react";
import { Portal } from "./portal";
import { cn } from "@/lib/utils";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
  offset?: number;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  zIndex?: number;
  portalId?: string;
}

/**
 * Componente Popover personalizzato che utilizza React Portal
 * per mostrare contenuto fluttuante collegato a un elemento trigger.
 */
export function CustomPopover({
  trigger,
  children,
  placement = "bottom",
  className,
  contentClassName,
  offset = 8,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  zIndex = 5000,
  portalId = "popover-portal"
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calcola la posizione del popover in base al trigger
  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top - contentRect.height - offset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left - contentRect.width - offset;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Evita che il popover esca dallo schermo
    top = Math.max(10, Math.min(window.innerHeight - contentRect.height - 10, top));
    left = Math.max(10, Math.min(window.innerWidth - contentRect.width - 10, left));

    setPosition({ top, left });
  };

  // Gestisce il click fuori dal popover
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, closeOnOutsideClick]);

  // Gestisce la chiusura con tasto ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, closeOnEscape]);

  // Aggiorna la posizione quando cambia isOpen o la dimensione della finestra
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen]);

  // Controlla se il contenuto è inizialmente montato
  useEffect(() => {
    if (isOpen) {
      setTimeout(updatePosition, 10);
    }
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("inline-block", className)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {isOpen && (
        <Portal zIndex={zIndex} id={portalId}>
          <div
            ref={contentRef}
            className={cn(
              "fixed shadow-lg rounded-lg p-4 bg-black/90 text-white",
              contentClassName
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  );
}