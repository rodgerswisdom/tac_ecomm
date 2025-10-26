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
    console.log('Dropdown selection:', optionValue);
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className={cn("relative z-[100]", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={cn(
          "w-full rounded-full border border-brand-umber bg-brand-umber px-4 py-3 text-left text-brand-beige",
          "focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal",
          "transition-all duration-200 ease-in-out",
          "flex items-center justify-between cursor-pointer",
          "touch-manipulation", // Improves touch responsiveness
          error && "border-brand-coral focus:ring-brand-coral",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-brand-teal/30"
        )}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && (
            <span className="text-brand-beige/80">
              {selectedOption.icon}
            </span>
          )}
          <span className={cn(
            "text-brand-beige",
            !selectedOption && "text-brand-beige/70"
          )}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-brand-beige/70" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute z-[9999] mt-2 w-full overflow-hidden rounded-3xl border border-brand-umber/25 bg-brand-umber/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
        >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.05 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer",
                    "transition-all duration-200",
                    "border-b border-white/10 last:border-b-0",
                    "hover:bg-brand-teal/20 active:bg-brand-teal/30",
                    "focus:outline-none focus:bg-brand-teal/25",
                    "touch-manipulation", // Improves touch responsiveness
                    value === option.value && "bg-brand-teal/30 text-brand-beige font-semibold"
                  )}
                  type="button"
                >
                  <div className="flex items-center space-x-2">
                    {option.icon && (
                      <span className="text-brand-beige/70">
                        {option.icon}
                      </span>
                    )}
                    <span className="text-brand-beige">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-brand-beige" />
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
