# Requirements Document

## Introduction

This document defines the requirements for redesigning the Apollo Vidhyalayam school website. The redesign involves updating the logo bar, navigation structure, hero section, about section, contact information, footer, and creating a new About Us page. The site is a Next.js application using Tailwind CSS with existing components that need modification.

## Glossary

- **Logo_Bar**: The top section of the site header containing the school logo, school name, and action buttons
- **Navigation_Bar**: The horizontal navigation menu below the logo bar containing links to major site sections
- **Hero_Section**: The full-viewport introductory area with a background image, tagline, motto, and call-to-action buttons
- **About_Section**: The homepage section describing the school's features and mission
- **Site_Footer**: The bottom section of every page containing links, contact info, and social media
- **Contact_Section**: The homepage section displaying the school's address, phone, and email
- **Search_Icon**: An expandable search input triggered by clicking a magnifying glass icon in the logo bar
- **About_Us_Page**: A dedicated route (/about-us) with school information and brochure download
- **Dropdown_Menu**: A sub-menu appearing below a navigation item on hover or click

## Requirements

### Requirement 1: Logo Bar Update

**User Story:** As a site visitor, I want to see the real school logo and have quick access to login portals and search, so that I can identify the school and access relevant actions immediately.

#### Acceptance Criteria

1. THE Logo_Bar SHALL display the image at `/apollo-logo.jpg` as the school logo instead of the placeholder square
2. THE Logo_Bar SHALL display the school name as "Apollo Vidhyalayam" with subtitle "CBSE • Aragonda • Excellence"
3. WHEN a user clicks the Search_Icon, THE Logo_Bar SHALL expand an inline search input field
4. WHEN the search input loses focus or is closed, THE Logo_Bar SHALL collapse the search input back to the icon
5. THE Logo_Bar SHALL display a "Parent Login" button linking to an external portal
6. THE Logo_Bar SHALL display a "Teacher Login" button linking to an external portal
7. THE Logo_Bar SHALL display an "Apply Now" button
8. THE Logo_Bar SHALL NOT display the old "Contact Us" standalone button

### Requirement 2: Navigation Bar Restructure

**User Story:** As a site visitor, I want a simplified navigation with clear sections, so that I can quickly find information about the school.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL display exactly these top-level items in order: Home, About Us, Admissions, Contact Us, Gallery
2. WHEN a user hovers over "About Us", THE Navigation_Bar SHALL display a Dropdown_Menu with sub-items "Know Us" and "Download School Brochure"
3. THE Navigation_Bar SHALL NOT display "ABOUT", "ACADEMICS", "STUDENT LIFE", or "DISCLOSURE" as top-level items
4. THE Navigation_Bar SHALL link "Home" to the root path "/"
5. THE Navigation_Bar SHALL link "Admissions" to the admissions information section
6. THE Navigation_Bar SHALL link "Contact Us" to the contact page or section
7. THE Navigation_Bar SHALL link "Gallery" to the "/gallery" route

### Requirement 3: Hero Section Update

**User Story:** As a site visitor, I want to see an impactful hero section with the school's actual imagery and messaging, so that I immediately understand the school's identity and values.

#### Acceptance Criteria

1. THE Hero_Section SHALL use `/hero-image.jpg` as the background image
2. THE Hero_Section SHALL display the tagline "Rooted in Aragonda. Raised with Discipline, Values, and Strength"
3. THE Hero_Section SHALL display the motto "Learning. Leading. Excelling."
4. THE Hero_Section SHALL display an "Explore School" button
5. THE Hero_Section SHALL display an "Admissions" button
6. THE Hero_Section SHALL NOT display the old tagline "Building Future-Ready Leaders"
7. THE Hero_Section SHALL NOT display "Apply Now", "Schedule a Campus Visit", or "Explore Student Life" buttons from the old design

### Requirement 4: About Section Enhancement

**User Story:** As a site visitor, I want to download the school brochure from the about section, so that I can share detailed school information offline.

#### Acceptance Criteria

1. THE About_Section SHALL display a "Download School Brochure" button or link
2. WHEN a user clicks "Download School Brochure", THE About_Section SHALL initiate a file download or link to the brochure resource

### Requirement 5: About Us Page Creation

**User Story:** As a site visitor, I want a dedicated About Us page with school information and brochure access, so that I can learn more about the school in detail.

#### Acceptance Criteria

1. THE About_Us_Page SHALL be accessible at the route "/about-us"
2. THE About_Us_Page SHALL contain placeholder content for future school information
3. THE About_Us_Page SHALL include a "Download School Brochure" link
4. THE About_Us_Page SHALL use the same site header and footer as other pages

### Requirement 6: Contact Information Update

**User Story:** As a site visitor, I want accurate and current contact information, so that I can reach the school through the correct channels.

#### Acceptance Criteria

1. THE Contact_Section SHALL display the address as "Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh"
2. THE Contact_Section SHALL display the phone number as "+91 81227 61667"
3. THE Contact_Section SHALL display the email as "avn.viceprincipal@gmail.com"

### Requirement 7: Footer Redesign

**User Story:** As a site visitor, I want a comprehensive footer with updated contact details, social media links, quick navigation, and portal access, so that I can find information and connect with the school from any page.

#### Acceptance Criteria

1. THE Site_Footer SHALL display the address "Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh"
2. THE Site_Footer SHALL display the phone number "+91 81227 61667"
3. THE Site_Footer SHALL display the email "avn.viceprincipal@gmail.com"
4. THE Site_Footer SHALL display an Instagram icon linking to "https://www.instagram.com/apollofoundation/?hl=en"
5. THE Site_Footer SHALL display a LinkedIn icon linking to "https://www.linkedin.com/company/apollo-fnd/?originalSubdomain=in"
6. THE Site_Footer SHALL display a Facebook icon linking to "https://www.facebook.com/aplapollofoundation/"
7. THE Site_Footer SHALL include a "Quick Links" section with navigation links
8. THE Site_Footer SHALL include a "Portals" section with "Parent Login" and "Teacher Login" links
