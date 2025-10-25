"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { 
    href: "/collections", 
    label: "Shop",
    submenu: [
      { href: "/collections/earrings", label: "Earrings" },
      { href: "/collections/bracelets", label: "Bracelets & Bangles" },
      { href: "/collections/necklaces", label: "Necklaces & Chains" },
      { href: "/collections/hair-accessories", label: "Hair Accessories" },
      { href: "/collections/rings", label: "Rings" },
      { href: "/collections/matching-sets", label: "Matching Sets" },
      { href: "/collections/corporate-gifts", label: "Corporate Gifts" },
    ]
  },
  { href: "/bespoke", label: "Bespoke Studio" },
  { href: "/#artisans", label: "Artisans" },
  { href: "/#legacy", label: "Our Legacy" },
  { href: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex w-full justify-center px-3 pb-4 pt-4 sm:px-4 sm:pt-6">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        className="pointer-events-auto w-full max-w-6xl rounded-full border border-brand-umber/12 bg-white/90 px-4 py-4 shadow-[0_20px_48px_rgba(74,43,40,0.12)] backdrop-blur-xl sm:px-6 lg:px-8"
      >
        <div className="flex w-full flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="caps-spacing inline-flex items-center gap-2 text-[10px] font-semibold text-brand-umber/80 transition-colors hover:text-brand-umber sm:gap-3 sm:text-xs"
          >
            TAC Accessories
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-2 lg:flex lg:gap-4">
            {navLinks.map((link) => {
              const isAnchor = link.href.includes("#");
              const isActive = isAnchor
                ? pathname === "/"
                : link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href);

              if (link.submenu) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.href)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "relative flex items-center gap-1 text-xs font-medium text-brand-umber/80 transition-colors hover:text-brand-umber after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand-gold after:transition-transform after:duration-200 hover:after:scale-x-100 whitespace-nowrap",
                        isActive && "text-brand-umber after:scale-x-100"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                    </Link>
                    
                    {activeDropdown === link.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-72 rounded-lg border border-brand-umber/10 bg-white/95 p-4 shadow-[0_20px_48px_rgba(74,43,40,0.12)] backdrop-blur-xl"
                      >
                        <div className="space-y-2">
                          {link.submenu.map((subLink) => (
                            <Link
                              key={subLink.href}
                              href={subLink.href}
                              className="block rounded-md px-3 py-2 text-sm text-brand-umber/80 transition-colors hover:bg-brand-jade/10 hover:text-brand-umber whitespace-nowrap"
                            >
                              {subLink.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-xs font-medium text-brand-umber/80 transition-colors hover:text-brand-umber after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand-gold after:transition-transform after:duration-200 hover:after:scale-x-100 whitespace-nowrap",
                    isActive && "text-brand-umber after:scale-x-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-brand-beige/95 backdrop-blur-xl">
                <div className="mt-8 flex flex-col gap-4 text-brand-umber">
                  <span className="caps-spacing text-xs text-brand-umber/70">
                    Menu
                  </span>
                  {navLinks.map((link) => {
                    const isAnchor = link.href.includes("#");
                    const isActive = isAnchor
                      ? pathname === "/"
                      : pathname === link.href || pathname.startsWith(link.href);

                    return (
                      <div key={`mobile-${link.href}`}>
                        <Link
                          href={link.href}
                          className={cn(
                            "rounded-full px-4 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-white text-brand-umber shadow-sm"
                              : "text-brand-umber/70 hover:bg-white/60 hover:text-brand-umber"
                          )}
                        >
                          {link.label}
                        </Link>
                        {link.submenu && (
                          <div className="ml-4 mt-2 space-y-2">
                            {link.submenu.map((subLink) => (
                              <Link
                                key={`mobile-${subLink.href}`}
                                href={subLink.href}
                                className="block rounded-md px-3 py-2 text-xs text-brand-umber/60 hover:text-brand-umber"
                              >
                                {subLink.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              asChild
            >
              <Link href="/cart" aria-label="View cart">
                <ShoppingBag className="h-5 w-5 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-semibold text-white transition-colors">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="hidden lg:inline-flex text-[12px] px-4"
              asChild
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </motion.nav>
    </div>
  );
};
