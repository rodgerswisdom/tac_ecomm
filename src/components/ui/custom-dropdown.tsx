'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
  error = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn("relative z-[100]", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 text-left bg-background border rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all duration-200 ease-in-out",
          "flex items-center justify-between",
          "hover:border-primary/50",
          error && "border-destructive focus:ring-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-primary ring-2 ring-primary/20"
        )}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && (
            <span className="text-muted-foreground">
              {selectedOption.icon}
            </span>
          )}
          <span className={cn(
            "text-foreground",
            !selectedOption && "text-muted-foreground"
          )}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute z-[99999] w-full mt-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl overflow-hidden"
        >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.05 }}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-4 py-3 text-left flex items-center justify-between",
                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-emerald/10 transition-all duration-200",
                    "focus:outline-none focus:bg-gradient-to-r focus:from-primary/10 focus:to-emerald/10",
                    "border-b border-border/30 last:border-b-0",
                    value === option.value && "bg-gradient-to-r from-primary/20 to-emerald/20 text-primary font-semibold"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {option.icon && (
                      <span className="text-muted-foreground">
                        {option.icon}
                      </span>
                    )}
                    <span className="text-foreground">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Specialized dropdown for categories with icons
interface CategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategoryDropdown({ value, onChange, className }: CategoryDropdownProps) {
  const categoryOptions: DropdownOption[] = [
    { value: 'all', label: 'All Products', icon: <Crown className="h-4 w-4" /> },
    { value: 'necklaces', label: 'Necklaces', icon: <Gem className="h-4 w-4" /> },
    { value: 'rings', label: 'Rings', icon: <Award className="h-4 w-4" /> },
    { value: 'bracelets', label: 'Bracelets', icon: <Zap className="h-4 w-4" /> },
    { value: 'earrings', label: 'Earrings', icon: <Sparkles className="h-4 w-4" /> },
    { value: 'sets', label: 'Sets', icon: <Crown className="h-4 w-4" /> }
  ]

  return (
    <CustomDropdown
      options={categoryOptions}
      value={value}
      onChange={onChange}
      placeholder="Select category"
      className={className}
    />
  )
}

// Specialized dropdown for sorting
interface SortDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  const sortOptions: DropdownOption[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' }
  ]

  return (
    <CustomDropdown
      options={sortOptions}
      value={value}
      onChange={onChange}
      placeholder="Sort by"
      className={className}
    />
  )
}

// Import icons for the specialized dropdowns
import { Crown, Gem, Award, Zap, Sparkles } from 'lucide-react'
