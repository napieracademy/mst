"use client";

import React, { useState, useRef, useEffect } from "react";
import { Portal } from "./portal";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
  offset?: number;
  forceShow?: boolean;
  zIndex?: number;
  portalId?: string;
}

/**
 * Componente Tooltip personalizzato che utilizza React Portal
 * per mostrare suggerimenti fluttuanti sopra un elemento.
 */
export function CustomTooltip({
  children,
  content,
  delay = 300,
  position = "top",
  className,
  contentClassName,
  offset = 8,
  forceShow = false,
  zIndex = 7000,
  portalId = "tooltip-portal"
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(forceShow);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calcola la posizione del tooltip
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Previeni che il tooltip vada fuori schermo
    top = Math.max(5, Math.min(window.innerHeight - tooltipRect.height - 5, top));
    left = Math.max(5, Math.min(window.innerWidth - tooltipRect.width - 5, left));

    setTooltipPosition({ top, left });
  };

  // Funzioni di mostra/nascondi tooltip
  const showTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (!isVisible && !showTimeoutRef.current) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        showTimeoutRef.current = null;
      }, delay);
    }
  };

  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (isVisible && !hideTimeoutRef.current && !forceShow) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        hideTimeoutRef.current = null;
      }, 100);
    }
  };

  // Gestisce forceShow prop
  useEffect(() => {
    setIsVisible(forceShow);
  }, [forceShow]);

  // Aggiorna posizione quando necessario
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
      };
    }
  }, [isVisible]);

  // Aggiorna posizione dopo che il tooltip è visibile
  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(updatePosition);
    }
  }, [isVisible]);

  // Cleanup dei timeout
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("inline-block", className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible && (
        <Portal zIndex={zIndex} id={portalId}>
          <div
            ref={tooltipRef}
            className={cn(
              "fixed py-1 px-2 text-xs font-medium shadow-md rounded",
              "bg-black/90 text-white",
              "animate-fade-in-down",
              contentClassName
            )}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`
            }}
            role="tooltip"
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}