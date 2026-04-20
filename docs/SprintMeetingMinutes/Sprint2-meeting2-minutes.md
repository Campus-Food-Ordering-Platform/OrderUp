# Daily Scrum Meeting Minutes

**Date:** 18 April 2026, evening
**Attendees:** Adrian, Sanele, Naomi, Wendy, Jonaphan  

---

## 1. Progress Updates

### UML & 4+1 Model
- Adrian working on UML diagrams (use case diagram nearly complete)
- 4+1 model requires multiple diagrams (logical, development, process, physical + scenarios)
- Naomi and Sanele to assist with 4+1 diagrams
- Class diagram to be derived from existing ERD
- State diagram still unclear; to be researched and clarified as a team

### Database
- Adrian and Sanele completed database setup
- Sanele added table for dietary restrictions (e.g. halal) alongside allergens
- Minor issue identified: duplicate versioning (two “version 9” entries)

### Admin Page
- Implemented with multiple features:
  - Vendor verification (accept/reject applications)
  - Complaint handling system
  - Search functionality (order number, vendor name, customer name)
  - Vendor statistics and analytics
- Admin login handled via hidden route (`/admin setup`) with Google authentication
- Potential issue: may interfere with testing due to persistent admin login state

### Student History Page
- Implemented reorder feature:
  - Redirects to checkout with autofilled previous order
- Complaint submission available from past orders

### Testing & Code Coverage
- Backend testing partially complete
- Code coverage tool integrated with frontend, but coverage is low
- Additional frontend test cases required
- Siya and Jonathan responsible for improving overall coverage

### Deployment / Integration
- Work pushed to `dev` branch
- Pending testing completion before merging to `main`

---

## 2. Current Blockers

### Wendy
- Unable to run application locally
- Authentication loop issue (redirected back to login repeatedly)
- Possible causes:
  - Authentication misconfiguration
  - Backend/frontend servers not both running
  - Local environment setup issues
- Also unclear on deployment workflow (Vercel access limited to one member)

### General
- Uncertainty around state diagram and full 4+1 requirements
- Code coverage insufficient for full system

---

## 3. Actions Agreed

- Naomi to assist Wendy (video call) to debug environment and authentication issues
- Team to work on frontend testing to improve code coverage
- Adrian to finalize UML diagram and push to `dev`
- Sanele and Naomi to proceed with 4+1 model diagrams
- Team to research unclear diagram types before implementation
- Review and resolve database version inconsistency

---

## 4. Next Steps

- Complete UML diagrams before finalizing 4+1 model
- Improve frontend test coverage
- Resolve Wendy’s local setup and authentication issues
- Verify deployment workflow and team access process
- Continue integration between frontend and backend

---

**Meeting Adjourned**