'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type CSSProperties,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search, Crown, Gem, Zap, Sparkles, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_TAXONOMY } from '@/lib/category-taxonomy'

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
  searchable?: boolean
  ariaLabel?: string
}

type MenuPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

function useDropdownPosition(
  isOpen: boolean,
  triggerRef: RefObject<HTMLButtonElement | null>
) {
  const [position, setPosition] = useState<MenuPosition | null>(null)

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const viewportPadding = 16
    const gap = 8
    const isMobile = window.innerWidth < 640
    const width = isMobile
      ? Math.min(Math.max(rect.width, 240), window.innerWidth - viewportPadding * 2)
      : rect.width
    const left = isMobile
      ? Math.max(
          viewportPadding,
          Math.min(rect.left, window.innerWidth - width - viewportPadding)
        )
      : rect.left

    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding
    const spaceAbove = rect.top - gap - viewportPadding
    const openBelow = spaceBelow >= 140 || spaceBelow >= spaceAbove
    const maxHeight = Math.min(280, Math.max(120, openBelow ? spaceBelow : spaceAbove))
    const top = openBelow ? rect.bottom + gap : rect.top - gap - maxHeight

    setPosition({ top, left, width, maxHeight })
  }, [triggerRef])

  useEffect(() => {
    if (!isOpen) {
      setPosition(null)
      return
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, updatePosition])

  return position
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
  error = false,
  searchable = false,
  ariaLabel,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const position = useDropdownPosition(isOpen, triggerRef)

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions =
    searchable && searchTerm
      ? options.filter(
          (option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
      return () => window.clearTimeout(timer)
    }
  }, [isOpen, searchable])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || window.innerWidth >= 640) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const menuStyle: CSSProperties | undefined = position
    ? {
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        zIndex: 9999,
      }
    : undefined

  const menu = (
    <AnimatePresence>
      {isOpen && position && (
        <motion.div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          style={menuStyle}
          className="overflow-hidden rounded-3xl border border-brand-umber/25 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
        >
          {searchable && (
            <div className="border-b border-brand-umber/10 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-umber/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-brand-umber/20 bg-white py-2.5 pl-10 pr-4 text-base text-brand-umber placeholder:text-brand-umber/50 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                />
              </div>
            </div>
          )}
          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: searchable ? position.maxHeight - 64 : position.maxHeight }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.03 }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSelect(option.value)
                  }}
                  className={cn(
                    'flex min-h-12 w-full items-center justify-between px-4 py-3 text-left sm:min-h-11',
                    'cursor-pointer border-b border-brand-umber/5 transition-all duration-200 last:border-b-0',
                    'hover:bg-brand-teal/20 active:bg-brand-teal/30',
                    'focus:bg-brand-teal/25 focus:outline-none',
                    'touch-manipulation',
                    value === option.value && 'bg-brand-teal/30 font-semibold text-brand-umber'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {option.icon && (
                      <span className="shrink-0 text-brand-umber/70">{option.icon}</span>
                    )}
                    <span className="truncate text-base text-brand-umber sm:text-sm">
                      {option.label}
                    </span>
                  </div>
                  {value === option.value && (
                    <Check className="h-4 w-4 shrink-0 text-brand-umber" />
                  )}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-brand-umber/60">
                <p className="text-sm">No results found</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel ?? placeholder}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) {
            setIsOpen((open) => !open)
          }
        }}
        disabled={disabled}
        className={cn(
          'flex w-full min-h-12 items-center justify-between rounded-full border border-brand-umber bg-brand-umber px-4 py-3 text-left text-brand-beige sm:min-h-11',
          'cursor-pointer transition-all duration-200 ease-in-out touch-manipulation',
          'focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal',
          error && 'border-brand-coral focus:ring-brand-coral',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'ring-2 ring-brand-teal/30'
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {selectedOption?.icon && (
            <span className="shrink-0 text-brand-beige/80">{selectedOption.icon}</span>
          )}
          <span
            className={cn(
              'truncate text-base sm:text-sm',
              selectedOption ? 'text-brand-beige' : 'text-brand-beige/70'
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-brand-beige/70" />
        </motion.div>
      </button>

      {isMounted && isOpen ? createPortal(menu, document.body) : null}
    </div>
  )
}

interface CategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
  includeAll?: boolean
}

export function CategoryDropdown({
  value,
  onChange,
  className,
  includeAll = true,
}: CategoryDropdownProps) {
  const categoryIcons: Record<string, React.ReactNode> = {
    'african-arts': <Palette className="h-4 w-4" />,
    'bracelets-bangles': <Zap className="h-4 w-4" />,
    earrings: <Sparkles className="h-4 w-4" />,
    'necklaces-chains': <Gem className="h-4 w-4" />,
    'arm-bands': <Crown className="h-4 w-4" />,
    accessories: <Crown className="h-4 w-4" />,
    'matching-sets': <Crown className="h-4 w-4" />,
  }

  const categoryOptions: DropdownOption[] = [
    ...(includeAll
      ? [{ value: 'all', label: 'All Products', icon: <Crown className="h-4 w-4" /> }]
      : []),
    ...CATEGORY_TAXONOMY.map((category) => ({
      value: category.slug,
      label: category.name,
      icon: categoryIcons[category.slug] ?? <Crown className="h-4 w-4" />,
    })),
    { value: 'matching-sets', label: 'Matching Sets', icon: <Crown className="h-4 w-4" /> },
  ]

  return (
    <CustomDropdown
      options={categoryOptions}
      value={value}
      onChange={onChange}
      placeholder="Select category"
      className={className}
      ariaLabel="Product category"
    />
  )
}

interface SubcategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  className?: string
}

export function SubcategoryDropdown({
  value,
  onChange,
  options,
  className,
}: SubcategoryDropdownProps) {
  if (options.length <= 1) {
    return null
  }

  const dropdownOptions: DropdownOption[] = options.map((option) => ({
    value: option,
    label: option === 'all' ? 'All designs' : option,
  }))

  return (
    <CustomDropdown
      options={dropdownOptions}
      value={value}
      onChange={onChange}
      placeholder="All designs"
      className={className}
      ariaLabel="Subcategory"
    />
  )
}

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
    { value: 'rating', label: 'Highest Rated' },
  ]

  return (
    <CustomDropdown
      options={sortOptions}
      value={value}
      onChange={onChange}
      placeholder="Sort by"
      className={className}
      ariaLabel="Sort products"
    />
  )
}
