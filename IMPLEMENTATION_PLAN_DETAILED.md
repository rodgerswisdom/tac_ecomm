# Implementation Plan: TAC Accessories Enhancements

## Overview
This document outlines the implementation plan for all requested features and fixes for the TAC Accessories e-commerce platform.

---

## 1. Name Consistency: "Tac Accessories"

### What Needs to Be Done
- Standardize the brand name to "Tac Accessories" (with capital T and A) throughout the entire codebase
- Replace all variations: "TAC Accessories", "TAC Jewellery", "Tac accessories", etc.

### How I'll Do It
1. **Search and Replace Strategy:**
   - Use grep to find all instances of brand name variations
   - Replace in the following files:
     - `src/app/layout.tsx` - Metadata and SEO
     - `src/components/Navbar.tsx` - Navigation branding
     - `src/components/Footer.tsx` - Footer branding
     - `src/app/auth/signup/page.tsx` - Sign up page
     - `src/app/auth/signin/page.tsx` - Sign in page
     - `src/app/about/page.tsx` - About page
     - `src/lib/seo.ts` - SEO configuration
     - Any other files with brand references

2. **Consistency Check:**
   - Ensure "Tac Accessories" is used in:
     - Page titles
     - Meta descriptions
     - UI text
     - Email templates
     - Error messages

---

## 2. Hero Section: Categories + Featured Products Slideshow

### What Needs to Be Done
- Transform the hero section to include a dynamic slideshow that alternates between:
  - Category showcases (existing hero images)
  - Featured product highlights with CTAs
- Add creative CTAs on product slides (e.g., "Shop Now", "View Collection", "Limited Edition")

### How I'll Do It
1. **Update Hero Component (`src/components/Hero.tsx`):**
   - Extend the slideshow to include both hero images AND featured products
   - Create a unified slide data structure:
     ```typescript
     type SlideType = 'hero' | 'product'
     interface Slide {
       type: SlideType
       image: string
       title: string
       description: string
       cta: { label: string, href: string, variant: 'primary' | 'secondary' }
       product?: ProductCardData // if type is 'product'
     }
     ```
   - Add featured products from `featuredProducts` array
   - Create dynamic CTAs based on product type:
     - Regular products: "Shop Now" → product page
     - Limited edition: "Limited Edition" → product page
     - Collections: "View Collection" → collection page
   - Add smooth transitions between slides
   - Include product price and key features on product slides

2. **Design Enhancements:**
   - Overlay product information on slides (name, price, key feature)
   - Add gradient overlays for text readability
   - Include "New Arrival" or "Featured" badges
   - Add hover effects on product slides
   - Create animated CTAs with hover states

3. **Integration:**
   - Pull featured products from `src/data/content.ts`
   - Ensure products are marked as featured
   - Add category links on category slides

---

## 3. Search Bar in Navigation

### What Needs to Be Done
- Add a search bar to the navbar
- Implement search functionality that searches through products
- Show search results in a dropdown or dedicated search page

### How I'll Do It
1. **Create Search Component (`src/components/SearchBar.tsx`):**
   - Build a search input with icon
   - Implement debounced search (300ms delay)
   - Search through product name, description, category, materials
   - Display results in a dropdown overlay
   - Show product image, name, price in results
   - Navigate to product page on click

2. **Update Navbar (`src/components/Navbar.tsx`):**
   - Add search bar between logo and navigation links
   - Make it responsive (hide on mobile, show icon that opens modal)
   - Style to match existing navbar design
   - Add keyboard shortcuts (Cmd/Ctrl + K to focus)

3. **Search Logic:**
   - Client-side search using `featuredProducts` array
   - Filter by:
     - Product name (case-insensitive)
     - Description keywords
     - Category
     - Materials
   - Limit results to 5-8 items in dropdown
   - Show "View All Results" link if more matches exist

4. **Search Results Page (Optional Enhancement):**
   - Create `/search?q=query` page for full search results
   - Show filtered products with filters
   - Add pagination if needed

---

## 4. Related Products on Product Detail Page

### What Needs to Be Done
- Enhance the related products section on product detail pages
- Show products related by:
  - Same category
  - Same materials
  - Same artisan
  - Similar price range
- Make it visually appealing and interactive

### How I'll Do It
1. **Enhance Related Products Logic (`src/app/products/[slug]/page.tsx`):**
   - Improve the `related` useMemo to:
     - Prioritize same category products
     - Include products with similar materials
     - Show products from same artisan (if available)
     - Include products in similar price range (±30%)
     - Limit to 4-6 related products
   - Add variety: don't show all from same category

2. **Visual Enhancements:**
   - Create a carousel/slider for related products
   - Add "You May Also Like" section header
   - Include product cards with:
     - Product image with hover effect
     - Product name
     - Price
     - Quick view button
     - "Add to Cart" quick action
   - Add smooth scroll animations
   - Show product badges (New, Limited, etc.)

3. **Interactive Features:**
   - Add "Quick View" modal for related products
   - Include "Recently Viewed" section (using localStorage)
   - Add "Complete the Look" suggestions for matching sets

---

## 5. Sign Up Flow Fix

### What Needs to Be Done
- Fix authentication flow to ensure all auth works correctly
- Ensure proper redirects after signup/signin
- Fix any issues with NextAuth configuration
- Handle errors gracefully

### How I'll Do It
1. **Review Auth Configuration:**
   - Check `src/lib/auth.ts` for proper NextAuth setup
   - Verify credentials provider configuration
   - Ensure Google OAuth is properly configured (if used)
   - Check session handling

2. **Fix Sign Up Flow (`src/app/auth/signup/page.tsx`):**
   - Ensure registration API call works correctly
   - Fix redirect after successful signup:
     - Currently redirects to `/admin` - should redirect to home or profile
     - Add option to redirect based on user role
   - Improve error handling:
     - Show specific error messages
     - Handle network errors
     - Validate email format before submission
   - Add loading states
   - Ensure auto-login after signup works

3. **Fix Sign In Flow (`src/app/auth/signin/page.tsx`):**
   - Verify credentials authentication
   - Fix redirect logic (currently goes to `/admin`)
   - Add "Remember Me" functionality
   - Handle session expiration
   - Improve error messages

4. **Test Authentication:**
   - Test email/password signup
   - Test email/password signin
   - Test Google OAuth (if configured)
   - Test session persistence
   - Test logout functionality

5. **Update Registration API (`src/app/api/auth/register/route.ts`):**
   - Ensure proper password hashing
   - Add email verification (optional)
   - Set appropriate user roles (not all as ADMIN)
   - Return proper error messages

---

## 6. Country Dropdown Fix (Payment Form)

### What Needs to Be Done
- Fix the dropdown background that makes text invisible in the checkout form
- Ensure proper contrast between text and background
- Fix z-index issues if dropdown is behind other elements

### How I'll Do It
1. **Fix Custom Dropdown Component (`src/components/ui/custom-dropdown.tsx`):**
   - Current issue: Button has `bg-brand-umber` with `text-brand-beige`, but dropdown menu also has dark background
   - Fix text color in dropdown options:
     - Change from `text-brand-beige` to `text-brand-umber` or white
     - Ensure proper contrast ratio (WCAG AA compliance)
   - Update dropdown menu background:
     - Change from `bg-brand-umber/95` to lighter background or ensure text is white
     - Add proper backdrop blur
   - Fix z-index:
     - Ensure dropdown is above other elements (currently z-[9999] should work)
     - Check if parent elements have z-index conflicts

2. **Update Checkout Page (`src/app/checkout/page.tsx`):**
   - Verify dropdown styling in context
   - Ensure no CSS conflicts
   - Test on different screen sizes

3. **Specific Fixes:**
   - Line 69: Button text color is correct (`text-brand-beige`)
   - Line 107: Dropdown menu background `bg-brand-umber/95` with `text-brand-beige` should work, but may need adjustment
   - Line 138: Option text `text-brand-beige` should be visible
   - Add hover states with better contrast
   - Ensure selected option is clearly visible

---

## 7. Corporate Gifts Page Enhancement

### What Needs to Be Done
- The corporate gifts page already exists at `/collections/corporate-gifts`
- Enhance it with:
  - Better integration with product data
  - Contact form for corporate inquiries
  - Product filtering for corporate gifts
  - Bulk order functionality (UI)

### How I'll Do It
1. **Enhance Existing Page (`src/app/collections/corporate-gifts/page.tsx`):**
   - Connect to actual product data (filter `isCorporateGift: true`)
   - Add product grid showing corporate gift products
   - Add filters for:
     - Price range
     - Product type
     - Minimum order quantity
   - Add "Request Quote" functionality that opens contact form

2. **Add Corporate Contact Form:**
   - Create modal or section for corporate inquiries
   - Fields:
     - Company name
     - Contact person
     - Email
     - Phone
     - Quantity needed
     - Budget range
     - Special requirements
   - Submit to contact API or email

3. **Integration:**
   - Link from navbar dropdown (already exists)
   - Add CTAs throughout site pointing to corporate gifts
   - Show corporate gift badge on relevant products
   - Add corporate gifts to product detail pages if applicable

---

## Implementation Order

1. **Quick Wins (High Impact, Low Effort):**
   - Name consistency fix
   - Country dropdown fix
   - Sign up flow fixes

2. **Medium Priority:**
   - Search bar implementation
   - Related products enhancement

3. **High Priority (User-Facing):**
   - Hero section with featured products
   - Corporate gifts page enhancements

---

## Testing Checklist

- [ ] Name consistency verified across all pages
- [ ] Hero slideshow shows both categories and products
- [ ] Search bar works and shows results
- [ ] Related products show on product pages
- [ ] Sign up creates account and redirects correctly
- [ ] Sign in works and maintains session
- [ ] Country dropdown is readable in checkout
- [ ] Corporate gifts page displays products correctly
- [ ] All CTAs navigate to correct pages
- [ ] Mobile responsiveness maintained
- [ ] No console errors
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Notes

- All changes will maintain the existing design system and brand colors
- Animations will use Framer Motion (already in use)
- Product data comes from `src/data/content.ts` (will need to ensure corporate gift products are marked)
- Authentication uses NextAuth (already configured)
- All components are client-side ("use client") where needed

