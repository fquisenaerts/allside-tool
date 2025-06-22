"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface DropdownOption {
  label: string
  value: string
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  buttonLabel?: string
  icon?: React.ReactNode
}

export function CustomDropdown({ options, value, onChange, buttonLabel, icon }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  // Find the selected option label
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="gap-2 text-black border border-gray-300 bg-white hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {icon}
        {buttonLabel || selectedOption?.label || "Select option"}
      </Button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100] overflow-hidden"
          style={{ display: isOpen ? "block" : "none" }}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  option.value === value ? "bg-gray-50" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="text-black">{option.label}</span>
                {option.value === value && <Check className="h-4 w-4 text-black" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
