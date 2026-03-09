"use client"

import { createContext, useContext, type ReactNode } from "react"

export type NavShopCategory = { slug: string; name: string }

const NavbarCategoriesContext = createContext<NavShopCategory[] | undefined>(undefined)

export function useNavbarCategories(): NavShopCategory[] {
  const ctx = useContext(NavbarCategoriesContext)
  return ctx ?? []
}

interface NavbarCategoriesProviderProps {
  children: ReactNode
  categories: NavShopCategory[]
}

export function NavbarCategoriesProvider({ children, categories }: NavbarCategoriesProviderProps) {
  return (
    <NavbarCategoriesContext.Provider value={categories}>
      {children}
    </NavbarCategoriesContext.Provider>
  )
}
