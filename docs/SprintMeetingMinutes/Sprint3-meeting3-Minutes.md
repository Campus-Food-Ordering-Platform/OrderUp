# Sprint 3 – Daily Scrum Meeting Minutes (3rd Meeting)

**Date:** Not specified  
**Attendees:** Adrian, Sanele, Siyanqoba (Siya), Naomi, Wendy, Jonathan  

---

## 1. Individual Progress Updates

### Adrian
- Worked on **analytics backend (repository layer)**  
- Began implementing **analytics service layer**  
- Noted lack of clarity on required analytics functions  
- Confirmed frontend errors previously encountered are mostly resolved  

### Siyanqoba (Siya)
- Focused on **backend debugging and stabilization**  
- Continued work on **notifications feature** (not yet complete due to errors)  
- Did not push recent changes due to instability  

### Jonathan
- **Paystack payment integration** now functional after debugging  
- Implemented **student order review system**:
  - Students can review vendors from order history  
- Identified issues:
  - Poor **frontend test coverage**  
  - Inconsistencies between **vendor/admin vs student views**  
- Planned work:
  - Add test cases  
  - Implement **multi-vendor cart functionality**  

### Sanele
- Fixed **database issues**:
  - Created `run_application_users` table  
  - Removed redundant/duplicate columns  
- Worked on **analytics export feature**:
  - CSV export functional  
  - PDF export not yet implemented  

### Naomi
- Collaborating on **analytics export** (scope refined to exports only)  
- Identified missing **export button** on analytics page  
- Clarified analytics requirements:
  - Required views:
    - Sales per vendor over time (completed)  
    - Peak ordering hours  
    - Custom/order-based views  

### Wendy
- Finished Vendor profile locally pending push to main.   

---

## 2. System Status

- **Frontend errors**: largely resolved  
- **Backend**: stable for core functionality, but not guaranteed error-free  
- **Payments (Paystack)**: working  
- **Analytics**:
  - Partial implementation complete  
  - Export (CSV) working  
  - UI integration incomplete  

---

## 3. Key Issues Identified

- Missing alignment between:
  - Vendor/Admin dashboards  
  - Student-facing features  
- Low **frontend test coverage**  
- Incomplete **notifications feature**  
- Missing **analytics export UI controls**  
- Unclear full scope of analytics functionality  

---

## 4. Feature Work in Progress

- Notifications system (backend)  
- Multi-vendor cart functionality  
- Analytics service layer  
- Analytics export (CSV complete, PDF pending)  
- Cart and payment frontend pages  
- UI templates for order display (card components)

---

## 5. Decisions & Agreements

- Naomi to add **export button** on analytics page  
- Jonathan to proceed with **cart and payment frontend implementation**  
- Team to align **student-facing features** with admin/vendor functionality  
- Continue improving **test coverage**  

---

## 6. Next Steps

- Complete analytics views (peak hours, additional reports)  
- Finalize analytics service integration  
- Implement missing frontend components (cards/templates)  
- Stabilize notifications feature  
- Improve frontend testing coverage  
- Ensure consistency across all user roles  

---

**Meeting Adjourned**