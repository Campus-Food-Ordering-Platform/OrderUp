# Sprint 4 – Daily Scrum Meeting Minutes (Meeting 2)

**Date:** 16 May 2026  
**Attendees:** Adrian Draxl, Naomi Mareno, Jonaphan Mareno, Siyanqoba Kunene, Sanele Hlatswayo, Wendy Khumalo  

---

## 1. Individual Progress Updates

### Naomi Mareno
- Reviewed the sprint backlog/product backlog
- Confirmed that nearly all planned work has been completed
- Identified **vendor profile functionality** as one of the few remaining incomplete areas

---

### Jonaphan Mareno
- No completed work since the last meeting
- Planned work:
  - Add **test cases** for recently implemented features
  - Fix issue where **student reviews are stored in the backend but do not display on the student dashboard**

---

### Siyanqoba Kunene
- Refined **vendor application workflow**
- Fixed issue where:
  - Uploaded vendor certificates were being stored as `null`
- Added support for **vendor certificate display** in admin review page
- Fixed issue where:
  - Vendor images were not visible to admins during application review

**Current concern:**
- Bugs remain in **vendor settings page**
- Plans to resolve before sprint end

---

### Sanele Hlatswayo
- Added **informational descriptions for dietary tags**
  - Provides additional context for vendors when selecting tags
- Planned work:
  - Update **database diagrams** to reflect recent schema changes

---

### Adrian Draxl
- Cleaned and updated **Sprint Backlog**
  - Moved all completed tasks into finished state
  - Verified remaining outstanding work
- Continued **bug fixing** alongside Siya
- Fixed issues with **ratings system**
- Improved **authentication for image access**
- Planned feature:
  - **Vendor open/closed status logic**
    - Vendors automatically marked closed outside operating hours
    - Example: vendors unavailable at 2 AM appear closed

**Concerns:**
- Database contains many `null` values and requires cleanup
- UML diagrams likely sufficient; no major updates planned unless necessary

---

### Wendy Khumalo
- No completed work reported
- Awaiting assignment of remaining tasks or bugs to address

---

## 2. Key Issues Identified

### Vendor Settings Bugs
- Some unresolved issues remain
- Siya currently addressing these

### Student Review Display
- Reviews correctly stored in backend
- Not appearing on student dashboard
- Jonaphan to investigate and fix

### Database Cleanup
- Presence of many `null` values
- Cleanup required before final submission

### UML / Documentation
- Only minor database diagram updates likely needed
- Team generally agreed diagrams are sufficient

---

## 3. Project Status

- Most sprint backlog items completed
- Core application functionality largely finished
- Remaining work focused on:
  - Bug fixing
  - Test case additions
  - Final data cleanup
  - Minor feature completion

---

## 4. Next Steps

- Fix vendor settings issues
- Link student reviews to frontend display
- Add test coverage for final features
- Update database diagrams
- Clean database null values
- Complete vendor open/closed status feature

---

**Meeting Adjourned**
