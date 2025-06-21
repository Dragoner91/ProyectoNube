import type React from "react"

interface TableProps {
  children: React.ReactNode
  className?: string
}

interface TableHeaderProps {
  children: React.ReactNode
}

interface TableBodyProps {
  children: React.ReactNode
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

interface TableHeadProps {
  children: React.ReactNode
  className?: string
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
    </div>
  )
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead className="[&_tr]:border-b">{children}</thead>
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return (
    <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
}
