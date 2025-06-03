"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/app/hooks/useLanguage"
import { ChevronDown } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
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

  const languages = [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  const changeLanguage = (code: string) => {
    setLanguage(code)
    setIsOpen(false)
    // Force page refresh to ensure all content is translated
    window.location.reload()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-transparent text-white hover:text-gray-300 rounded-full p-1.5"
        aria-label="Select language"
      >
        <span className="text-sm font-medium uppercase">{currentLanguage.code}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100]">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
