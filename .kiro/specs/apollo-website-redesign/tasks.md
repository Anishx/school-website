# Implementation Plan: Apollo Website Redesign

## Overview

Incrementally update existing Next.js components to match the new Apollo Vidhyalayam branding and navigation structure. Each task modifies specific files with clear before/after expectations. Tasks are ordered to handle shared config first (nav), then individual components, and finally the new page.

## Tasks

- [x] 1. Restructure navigation configuration
  - [x] 1.1 Replace `navItems` array in `src/components/nav-config.ts`
    - Replace the entire `navItems` export with exactly 5 top-level items: Home, About Us (with compact dropdown containing "Know Us" and "Download School Brochure"), Admissions, Contact Us, Gallery
    - Remove all old items: "Academics", "Student Life", existing "About Us" compact items, "Admissions" compact items, "Contact"
    - Keep the `NavItem` and `NavLink` type exports unchanged
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2. Update Logo Bar and add Search Toggle
  - [x] 2.1 Create `SearchToggle` client component in `src/components/search-toggle.tsx`
    - Create a new client component with local `expanded` state (boolean)
    - Render a search icon button; when clicked, expand an inline text input with smooth width transition
    - On blur or Escape keypress, collapse input back to icon
    - Use `useRef` for input focus management and `useEffect` to focus on expand
    - Use lucide-react `Search` and `X` icons
    - _Requirements: 1.3, 1.4_

  - [x] 2.2 Update Logo Bar section in `src/components/site-header.tsx`
    - Replace placeholder square with `<Image src="/apollo-logo.jpg" alt="Apollo Vidhyalayam" width={40} height={40} />`
    - Change school name text to "Apollo Vidhyalayam" and subtitle to "CBSE • Aragonda • Excellence"
    - Remove the "Contact Us" button entirely
    - Add "Parent Login" and "Teacher Login" outline-style buttons (hidden on small screens)
    - Keep "Apply Now" button
    - Import and render `<SearchToggle />` in the right-side button group
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 1.8_

  - [x] 2.3 Update Mobile Nav drawer header in `src/components/mobile-nav.tsx`
    - Replace placeholder logo square with `<Image src="/apollo-logo.jpg" ... />`
    - Change school name to "Apollo Vidhyalayam" and subtitle to "CBSE • Aragonda • Excellence"
    - _Requirements: 1.1, 1.2_

- [x] 3. Update Hero Section
  - [x] 3.1 Rewrite `src/components/hero-section.tsx`
    - Change background image `src` from picsum URL to `/hero-image.jpg`
    - Replace heading with: "Rooted in Aragonda. Raised with Discipline, Values, and Strength"
    - Add subtitle paragraph: "Learning. Leading. Excelling."
    - Replace all CTA buttons with exactly two: "Explore School" (primary yellow) and "Admissions" (outline white)
    - Remove old buttons: "Apply Now", "Schedule a Campus Visit", "Explore Student Life"
    - Remove the old subtitle paragraph about "academic excellence, innovation..."
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Update Contact Section
  - [x] 4.1 Update `contactInfo` array in `src/components/contact-section.tsx`
    - Change address to "Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh"
    - Change phone to "+91 81227 61667"
    - Change email to "avn.viceprincipal@gmail.com"
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Update About Section with Brochure Download
  - [x] 5.1 Add "Download School Brochure" link to `src/components/about-section.tsx`
    - Add a download button/link near the "Read more" button in the "What We Do" subsection
    - Style as secondary/outline button with a Download icon from lucide-react
    - Link to a placeholder href (e.g., "#brochure" or a future PDF path)
    - _Requirements: 4.1, 4.2_

- [x] 6. Redesign Site Footer
  - [x] 6.1 Rewrite `src/components/site-footer.tsx`
    - Update brand section: replace placeholder logo with `<Image src="/apollo-logo.jpg" ... />`, correct school name
    - Replace text social links with icon links: Instagram (linking to https://www.instagram.com/apollofoundation/?hl=en), LinkedIn (linking to https://www.linkedin.com/company/apollo-fnd/?originalSubdomain=in), Facebook (linking to https://www.facebook.com/aplapollofoundation/)
    - Restructure link columns to include: "Quick Links" section (Home, About Us, Gallery, Admissions, Contact Us) and "Portals" section (Parent Login, Teacher Login)
    - Add contact info block with address "Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh", phone "+91 81227 61667", email "avn.viceprincipal@gmail.com"
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 7. Checkpoint - Verify existing pages render correctly
  - Ensure all tests pass, ask the user if questions arise.
  - Verify the homepage renders with updated header, hero, about, contact, and footer
  - Verify the gallery page still works with updated navigation

- [x] 8. Create About Us Page
  - [x] 8.1 Create `src/app/about-us/page.tsx`
    - Create new page file at the `/about-us` route
    - Import and render `SiteHeader` at top
    - Add a simple hero banner with page title "About Us"
    - Add placeholder content section for future school information (a few paragraphs of placeholder text)
    - Add a "Download School Brochure" link/button
    - Footer is automatically rendered by the global layout
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Final checkpoint - Verify all pages and navigation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `/about-us` page renders correctly with header and footer
  - Verify "About Us" dropdown in nav links to `/about-us` for "Know Us"
  - Verify all navigation links point to correct routes

## Notes

- No new npm dependencies are needed — all icons come from lucide-react already in the project
- The `SiteFooter` is rendered globally in `layout.tsx`, so the new About Us page automatically gets the footer
- Navigation changes in `nav-config.ts` automatically propagate to both desktop `PrimaryNavBar` and `MobileNav`
- Search toggle state is purely local — no context providers or global state stores required
- External portal links (Parent Login, Teacher Login) should use `target="_blank"` and `rel="noopener noreferrer"`
