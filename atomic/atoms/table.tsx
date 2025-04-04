import React from "react"
import { cn } from "@/atomic/utils/cn"

// Componente TableRoot
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export function Table({ className, ...props }: TableProps) {
  return (
    <table
      className={cn("w-full border-collapse text-sm", className)}
      {...props}
    />
  )
}

// Componente TableHeader
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead className={cn("border-b border-gray-800", className)} {...props} />
  )
}

// Componente TableBody
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

// Componente TableFooter
interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      className={cn("border-t border-gray-800 bg-gray-900/50 text-gray-300", className)}
      {...props}
    />
  )
}

// Componente TableRow
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-gray-800 transition-colors data-[state=selected]:bg-gray-800",
        className
      )}
      {...props}
    />
  )
}

// Componente TableHead
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle text-gray-400 font-medium",
        className
      )}
      {...props}
    />
  )
}

// Componente TableCell
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      className={cn("p-4 align-middle", className)}
      {...props}
    />
  )
}

// Componente TableCaption
interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      className={cn("mt-4 text-sm text-gray-400", className)}
      {...props}
    />
  )
} 