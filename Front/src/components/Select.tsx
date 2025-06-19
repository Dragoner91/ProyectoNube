"use client"

import type React from "react"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

export function Select({ value, onValueChange, children, className = "" }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    >
      {children}
    </select>
  )
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>
}
