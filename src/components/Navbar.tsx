"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Menu, ChevronDown, Search, User, LogOut, Settings } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { CurrencyCode } from "@/lib/currency";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  { href: "/artisans", label: "Artisans" },
  { href: "/contact", label: "Contact" },
];

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "KSH", label: "KES" },
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { getCartItemCount } = useCart();
  const { currency, setCurrency } = useCurrency();
  const cartCount = getCartItemCount();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const getUserInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const userName = session?.user?.name ?? undefined;
  const userEmail = session?.user?.email ?? undefined;

  const handleDropdownMouseEnter = (href: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(href);
  };

  const handleDropdownMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;

    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      closeTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
        closeTimeoutRef.current = null;
      }, 120);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

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
            Tac Accessories
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
                    onMouseEnter={() => handleDropdownMouseEnter(link.href)}
                    onMouseLeave={handleDropdownMouseLeave}
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
                        className="absolute top-full left-0 mt-2 w-72 rounded-lg border border-brand-umber/10 bg-white/95 p-4 shadow-[0_20px_48px_rgba(74,43,40,0.12)] backdrop-blur-xl z-50"
                        onMouseEnter={() => handleDropdownMouseEnter(link.href)}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        <div className="space-y-2">
                          {link.submenu.map((subLink) => (
                            <Link
                              key={subLink.href}
                              href={subLink.href}
                              className="block rounded-md px-3 py-2 text-sm text-brand-umber/80 transition-colors hover:bg-brand-jade/10 hover:text-brand-umber whitespace-nowrap"
                              onClick={() => setActiveDropdown(null)}
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

          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium text-brand-umber/80 hover:text-brand-umber"
                >
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                {CURRENCY_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.code}
                    onClick={() => setCurrency(opt.code)}
                    className={cn(currency === opt.code && "bg-brand-teal/10 font-medium")}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // For mobile, we could open a search modal or navigate to search page
                  // For now, just show search icon
                }}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
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
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="mt-8 flex flex-col gap-4 text-brand-umber">
                  {session?.user && (
                    <div className="mb-4 pb-4 border-b border-brand-umber/10">
                      <div className="flex items-center gap-3 px-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.user.image || undefined} alt={userName || ''} />
                          <AvatarFallback className="bg-brand-gold text-white text-xs font-semibold">
                            {getUserInitials(userName, userEmail)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brand-umber truncate">
                            {userName || 'User'}
                          </p>
                          <p className="text-xs text-brand-umber/60 truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                  {session?.user ? (
                    <>
                      <div className="pt-2 border-t border-brand-umber/10">
                        <Link
                          href="/profile"
                          className={cn(
                            "rounded-full px-4 py-3 text-sm font-medium transition-colors block",
                            pathname === "/profile"
                              ? "bg-white text-brand-umber shadow-sm"
                              : "text-brand-umber/70 hover:bg-white/60 hover:text-brand-umber"
                          )}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full rounded-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-2 border-t border-brand-umber/10">
                      <Link
                        href="/auth/signin"
                        className="rounded-full px-4 py-3 text-sm font-medium bg-brand-umber text-white hover:bg-brand-umber/90 transition-colors block text-center"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
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

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image || undefined} alt={userName || ''} />
                      <AvatarFallback className="bg-brand-gold text-white text-xs font-semibold">
                        {getUserInitials(userName, userEmail)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="hidden lg:inline-flex text-[12px] px-4"
                asChild
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </motion.nav>
    </div>
  );
};
