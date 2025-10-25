"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Menu } from "lucide-react";
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
  { href: "/collections", label: "Collections" },
  { href: "/#artisans", label: "Artisans" },
  { href: "/#legacy", label: "Our Legacy" },
  { href: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();

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

          <div className="hidden flex-1 items-center justify-center gap-4 lg:flex lg:gap-6">
            {navLinks.map((link) => {
              const isAnchor = link.href.includes("#");
              const isActive = isAnchor
                ? pathname === "/"
                : link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-sm font-medium text-brand-umber/80 transition-colors hover:text-brand-umber after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand-gold after:transition-transform after:duration-200 hover:after:scale-x-100",
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
                  className="lg:hidden hover:bg-transparent hover:text-brand-umber"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5 text-brand-umber" />
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
                      <Link
                        key={`mobile-${link.href}`}
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
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-transparent hover:text-brand-teal"
              asChild
            >
              <Link href="/cart" aria-label="View cart">
                <ShoppingBag className="h-5 w-5 text-brand-teal transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-semibold text-brand-umber transition-colors">
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
