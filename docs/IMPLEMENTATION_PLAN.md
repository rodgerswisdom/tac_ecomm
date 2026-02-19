# Implementation Plan - Milestone One Feedback

## Overview

This document outlines the implementation plan for addressing all feedback items from milestone one review.

---

## 1. Simplify Landing Page (Remove Excessive Sections)

### Current State

The landing page (`src/app/page.tsx`) currently includes:

- Hero section
- Curated Collections section
- Featured Pieces section
- Experience TAC section (with InteractiveRing)
- ArtisanGallery section
- LegacyTimeline section (includes testimonials)

### Changes Required

**Remove the following sections:**

- Experience TAC section (lines 165-203)
- ArtisanGallery section (line 205) - *Note: This will be moved to a separate page (see item 6)*
- LegacyTimeline section (line 207) - *Note: Testimonials will be limited to 3 and kept separately (see item 2)*

**Keep the following sections:**

- Hero section
- Curated Collections section
- Featured Pieces section
- A simplified testimonials section (3 testimonials only)

### Implementation Steps

1. Remove `Experience TAC` section from `src/app/page.tsx`
2. Remove `ArtisanGallery` import and usage
3. Remove `LegacyTimeline` import and usage
4. Remove `InteractiveRing` import (if not used elsewhere)
5. Add a simple testimonials section with only 3 testimonials
6. Update imports to remove unused components

---

## 2. Limit Testimonials to 3

### Current State

- `TestimonialsMarquee` component has 8 testimonials (2 rows of 4)
- Located in `src/components/TestimonialsMarquee.tsx`
- Currently used within `LegacyTimeline` component

### Changes Required

1. Reduce testimonials array from 8 to 3 items
2. Update the component to display 3 testimonials in a simpler layout (not marquee)
3. Add the simplified testimonials section to the landing page

### Implementation Steps

1. Modify `src/components/TestimonialsMarquee.tsx`:
   - Reduce `reviewRows` to only 3 testimonials
   - Change from marquee/scrolling to static grid layout (3 columns on desktop, stacked on mobile)
   - Rename component to `Testimonials` or keep name but change behavior
2. Add testimonials section to landing page after Featured Pieces section
3. Remove testimonials from `LegacyTimeline` component (or remove LegacyTimeline entirely as per item 1)

---

## 3. Remove Stock Count from Categories

### Current State

- `CategoryCard` component displays `{category.itemCount} pieces` (line 53 in `src/components/CategoryCard.tsx`)
- Used on landing page and collection pages

### Changes Required

Remove the stock count display from category cards.

### Implementation Steps

1. Edit `src/components/CategoryCard.tsx`:
   - Remove or comment out the paragraph showing item count (line 52-54)
   - Optionally keep the description or remove it entirely for cleaner look

---

## 4. Remove Artisan Details from Product Detail Page

### Current State

- Product detail page (`src/app/products/[slug]/page.tsx`) includes extensive artisan section:
  - Master Artisan card (lines 165-193)
  - Community Impact section (lines 196-212)
  - Sourcing Story section (lines 215-227)
  - Corporate Gift Badge (lines 230-243)

### Changes Required

Remove all artisan-related information from the product detail page.

### Implementation Steps

1. Edit `src/app/products/[slug]/page.tsx`:
   - Remove the entire "Enhanced Artisan Section" (lines 165-244)
   - Remove artisan-related imports if no longer needed
   - Keep: product images, name, description, price, materials, add to cart button, related products

---

## 5. Implement 360-Degree Product View

### Current State

- Products currently have a static image gallery with thumbnails
- Located in `src/app/products/[slug]/page.tsx` (lines 68-113)

### Changes Required

Implement an interactive 360-degree product viewer that allows users to rotate the product image.

### Implementation Steps

1. **Research and choose a 360-degree viewer library:**
   - Option A: `react-360-view` or similar React library
   - Option B: `three-sixty` JavaScript library
   - Option C: Custom implementation using image sequences

2. **Prepare product images:**
   - Ensure products have multiple angle images (or a 360-degree image sequence)
   - Update product data structure to support 360-degree images

3. **Create/Update component:**
   - Create `Product360Viewer.tsx` component
   - Replace or enhance the current image gallery section
   - Add controls for rotation (drag, buttons, or auto-rotate)

4. **Integration:**
   - Replace static image display with 360-degree viewer in product detail page
   - Keep thumbnail navigation if applicable
   - Ensure mobile responsiveness

### Technical Considerations

- Image loading optimization
- Touch gestures for mobile
- Fallback to static images if 360 images unavailable
- Performance optimization for large image sequences

---

## 6. Create Separate Artisan Page

### Current State

- `ArtisanGallery` component is displayed on the landing page (line 205 in `src/app/page.tsx`)
- Component located at `src/components/ArtisanGallery.tsx`

### Changes Required

1. Create a new page for artisans: `/artisans` or `/artisans/gallery`
2. Move `ArtisanGallery` component to this new page
3. Remove it from the landing page
4. Add navigation link to the new page (in Navbar or Footer)

### Implementation Steps

1. **Create new page:**
   - Create `src/app/artisans/page.tsx`
   - Import and use `ArtisanGallery` component
   - Add Navbar and Footer
   - Style appropriately

2. **Update landing page:**
   - Remove `ArtisanGallery` import and usage from `src/app/page.tsx`

3. **Add navigation:**
   - Add link to artisans page in `Navbar.tsx` or `Footer.tsx`
   - Ensure proper routing

4. **Optional enhancements:**
   - Add individual artisan detail pages (`/artisans/[id]` or `/artisans/[slug]`)
   - Add filtering/search functionality

---

## 7. Bespoke Studio Updates

### 7A. Standard Timeline Selection (Dropdown)

### Current State

- Bespoke form has a timeline dropdown with custom options (lines 330-345 in `src/app/bespoke/page.tsx`)
- Options: "ASAP (2-3 weeks)", "Flexible (1-2 months)", "Planning ahead (3+ months)"

### Changes Required

Replace with predefined standard timelines set by the business.

### Implementation Steps

1. Define standard timeline options (to be confirmed with business):
   - Example: "2-3 weeks", "4-6 weeks", "8-12 weeks", "12+ weeks"
   - Or specific delivery dates/periods

2. Update the timeline dropdown:
   - Replace current options with standard timelines
   - Update form state structure if needed
   - Ensure proper validation

### 7B. Add Photo Upload Feature

### Current State

- Bespoke form has text fields but no file upload capability
- Form located in `src/app/bespoke/page.tsx` (lines 235-357)

### Changes Required

Add a photo upload field to allow users to upload reference images for their bespoke request.

### Implementation Steps

1. **Add file input to form:**
   - Add file upload field in the form (after "Your Vision" textarea)
   - Support multiple image uploads
   - Add preview functionality for uploaded images
   - Set file size and type restrictions (e.g., max 5MB, images only)

2. **Update form state:**
   - Add `photos` or `images` field to form state
   - Handle file selection and preview

3. **File handling:**
   - Option A: Upload to cloud storage (Cloudinary, AWS S3, etc.)
   - Option B: Convert to base64 for form submission (not recommended for large files)
   - Option C: Use a file upload service/API endpoint

4. **UI/UX:**
   - Add drag-and-drop zone
   - Show image previews
   - Allow removal of uploaded images
   - Show upload progress
   - Display file size/type validation errors

5. **Backend integration:**
   - Create API endpoint for file uploads (if needed)
   - Update form submission handler to include image URLs
   - Store image references in database or send via email

### Technical Considerations

- File size limits
- Image compression/optimization
- Security (file type validation, virus scanning if applicable)
- Storage solution (local vs cloud)
- Error handling for failed uploads

---

## Implementation Priority

### Phase 1 (Quick Wins)

1. ✅ Remove stock count from categories
2. ✅ Remove artisan details from product page
3. ✅ Limit testimonials to 3
4. ✅ Simplify landing page (remove sections)

### Phase 2 (Medium Complexity)

5. ✅ Create separate artisan page
2. ✅ Update bespoke timeline dropdown

### Phase 3 (Higher Complexity)

7. ✅ Implement 360-degree product view
2. ✅ Add photo upload to bespoke form

---

## Files to Modify

1. `src/app/page.tsx` - Landing page simplification
2. `src/components/CategoryCard.tsx` - Remove stock count
3. `src/components/TestimonialsMarquee.tsx` - Limit to 3 testimonials
4. `src/app/products/[slug]/page.tsx` - Remove artisan section
5. `src/app/artisans/page.tsx` - **NEW FILE** - Create artisan gallery page
6. `src/app/bespoke/page.tsx` - Update timeline and add photo upload
7. `src/components/Navbar.tsx` or `src/components/Footer.tsx` - Add artisans link
8. `src/components/Product360Viewer.tsx` - **NEW FILE** - 360-degree viewer component
9. `src/data/content.ts` - May need updates for 360-degree image support

---

## Testing Checklist

- [ ] Landing page loads with simplified sections
- [ ] Only 3 testimonials displayed
- [ ] Category cards show no stock count
- [ ] Product detail page has no artisan information
- [ ] 360-degree viewer works on product pages
- [ ] Artisan page accessible and displays correctly
- [ ] Bespoke form has standard timeline options
- [ ] Photo upload works in bespoke form
- [ ] All navigation links work correctly
- [ ] Mobile responsiveness maintained
- [ ] Performance not degraded

---

## Notes

- Consider creating a backup branch before making changes
- Test each change incrementally
- Ensure all animations and transitions still work
- Maintain accessibility standards
- Keep SEO considerations in mind when removing/adding content
