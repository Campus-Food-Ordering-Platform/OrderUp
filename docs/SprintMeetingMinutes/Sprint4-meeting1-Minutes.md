# Sprint 4 – Daily Scrum Meeting Minutes (Meeting 1)

**Date:** 16 May 2026  
**Attendees:** Adrian Draxl, Siyanqoba (Siya), Jonathan Mareno, Sanele, Naomi Mareno, Wendy Kumalo  

---

## 1. Individual Progress Updates

### Adrian Draxl
- Implemented a **machine learning revenue projection feature** on the analytics page
  - Replaced previous revenue calculator
  - Added:
    - Revenue projection bar graph
    - Growth slider for projected sales increase/decrease scenarios
- Completed analytics functionality for:
  - Peak sales/ordering times
  - Reviews and ratings integration
- Added reviews and ratings to database
- Fixed frontend review/rating system:
  - Previously stored in local storage only
  - Now fully integrated with database
- Updated order review logic:
  - Reviews now tied to individual orders instead of vendor-wide rating lock
- Removed unused “liked items” feature
- Raised concerns about:
  - UML/component diagram correctness
  - Oversized vendor dashboard file (~1500 lines)
- Suggested:
  - Expanding analytics-related use cases in UML/use case diagrams

### Siyanqoba (Siya)
- Notifications feature now functioning
- Updated order confirmation page UI:
  - Displays multiple vendors in a single order
- Implemented vendor media upload support:
  - Vendors can upload logos and banner images
  - Images display across multiple pages

### Jonathan Mareno
- No direct feature implementation during this period
- Planned tasks:
  - Add test cases for newly implemented features
  - Remove redundant functionality/components from app

### Sanele
- Proposed enhancement:
  - Add descriptions/tooltips for allergens and dietary tags
  - Intended to improve usability and demonstrate research depth
- Team agreed this would be a useful feature

### Wendy Kumalo
- No completed work reported during this meeting
- Plans to continue improving vendor profile/settings functionality

### Naomi Mareno
- No completed work reported during this meeting
- Planned to review meeting minutes and identify remaining tasks to complete

---

## 2. Key Issues & Concerns

### Vendor Dashboard
- File size excessively large (~1500 lines)
- Requires modularization into smaller components/files

### Vendor Order View
- Vendor dashboard currently does not display:
  - Quantity of each item in an order
- Student history page already supports this correctly
- Requires backend/frontend fix

### Analytics Export
- CSV export currently resembles simple orders table export
- Suggestion:
  - Add structured item list column (possibly JSON formatted)

### UML / Documentation
- Team uncertain whether UML diagrams require major updates
- Database changes require at least minor updates to:
  - Class diagram
  - Use case diagrams
  - Possibly component diagrams

### Remaining Bugs
- Few minor bugs remain despite most core functionality being complete

---

## 3. Additional Discussion

### Demo / Presentation Video
- Team discussed requirement for presentation/demo video
- Initial ideas:
  - Group presentation format
  - Each member explains implemented features or responsibilities
- Editing responsibility still undecided

### Documentation
- Team agreed documentation work still needs attention
- Planned discussion in following meeting

---

## 4. Planned Next Steps

- Add missing vendor order quantity display
- Continue frontend/backend cleanup
- Add allergen/tag descriptions
- Refactor vendor dashboard into smaller components
- Update UML and documentation where necessary
- Add tests for new analytics/review features
- Prepare sprint presentation/demo video

---

**Meeting Adjourned**