"use client"

import type React from "react"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "outline"
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
