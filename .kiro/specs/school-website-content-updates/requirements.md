# Requirements Document

## Introduction

Content updates to the Apollo Vidhyalayam school website frontend. This involves removing obsolete pages and navigation links (Programs, Fee Structure, Circulars, Newsletter), updating admission age criteria by incrementing each grade's minimum age by one year, and replacing the required documents list with a new set of seven items.

## Glossary

- **Website**: The Apollo Vidhyalayam Next.js frontend application
- **Navigation_Config**: The centralized navigation configuration file (`src/components/nav-config.ts`) that defines all menu items and dropdowns
- **Resources_Page**: The News & Events page at `/news-events` that uses a tabbed interface to display content categories
- **Admissions_Page**: The admissions page at `/admissions` displaying process steps, age criteria, fee structure, and required documents
- **Programs_Page**: The standalone page at `/programs` displaying academic programme information
- **Admissions_Dropdown**: The "Admissions" navigation dropdown menu containing links to admission-related pages
- **Resources_Dropdown**: The "Resources" navigation dropdown menu containing links to news and events tabs
- **Tab_Interface**: The set of clickable tab buttons on the Resources_Page that switch between content panels

## Requirements

### Requirement 1: Remove Circulars Tab

**User Story:** As a website administrator, I want the Circulars tab removed from the Resources page, so that outdated content categories are no longer visible to visitors.

#### Acceptance Criteria

1. WHEN the Resources_Page loads, THE Tab_Interface SHALL display only the tabs: Latest News, Announcements, Holiday List, and Downloads
2. WHEN a user navigates to `/news-events?tab=circulars`, THE Resources_Page SHALL display the first tab (Latest News) as the active content
3. THE Navigation_Config SHALL exclude the "Circulars" link from the Resources_Dropdown compact menu items

### Requirement 2: Remove Newsletter Tab

**User Story:** As a website administrator, I want the Newsletter tab removed from the Resources page, so that the tab interface only shows actively maintained content categories.

#### Acceptance Criteria

1. WHEN the Resources_Page loads, THE Tab_Interface SHALL not include a "Newsletter" tab button
2. WHEN a user navigates to `/news-events?tab=newsletter`, THE Resources_Page SHALL display the first tab (Latest News) as the active content
3. THE Navigation_Config SHALL exclude the "Newsletter" link from the Resources_Dropdown compact menu items

### Requirement 3: Remove Programs Page

**User Story:** As a website administrator, I want the Programs page and its navigation link removed, so that the site no longer exposes a standalone programmes route.

#### Acceptance Criteria

1. THE Website SHALL not serve any content at the `/programs` route
2. THE Navigation_Config SHALL exclude the "Programs" link from the Admissions_Dropdown compact menu items
3. WHEN a user attempts to access `/programs`, THE Website SHALL display the default 404 page

### Requirement 4: Remove Fee Structure Section

**User Story:** As a website administrator, I want the Fee Structure section removed from the Admissions page and navigation, so that fee details are no longer publicly displayed on the website.

#### Acceptance Criteria

1. WHEN the Admissions_Page loads, THE Admissions_Page SHALL not render a "Fee Structure" section or any fee category cards
2. THE Navigation_Config SHALL exclude the "Fee Structure" link from the Admissions_Dropdown compact menu items

### Requirement 5: Update Admission Age Criteria

**User Story:** As a school administrator, I want all admission age requirements increased by one year, so that the website reflects the updated eligibility policy.

#### Acceptance Criteria

1. THE Admissions_Page SHALL display the following age criteria: LKG requires 4+ years, UKG requires 5+ years, Grade I requires 6+ years, Grade II requires 7+ years, Grade III requires 8+ years, Grade IV requires 9+ years, Grade V requires 10+ years, Grade VI requires 11+ years, Grade VII requires 12+ years, Grade VIII requires 13+ years, Grade IX requires 14+ years, Grade X requires 15+ years
2. WHEN the Admissions_Page loads, THE Admissions_Page SHALL render exactly 12 age criteria entries matching the updated values

### Requirement 6: Replace Required Documents List

**User Story:** As a school administrator, I want the required documents list replaced with the current official list, so that parents see accurate documentation requirements.

#### Acceptance Criteria

1. THE Admissions_Page SHALL display exactly 7 required document items in the "Required Documents" section
2. THE Admissions_Page SHALL list the following documents in order: Birth Certificate, Transfer Certificate, Aadhaar Card (Student & Parents), Mark Sheet, 4 Photographs, Mother's Bank Passbook, Caste Certificate
3. WHEN the Admissions_Page loads, THE Admissions_Page SHALL not display any previously listed documents that are not in the updated list
