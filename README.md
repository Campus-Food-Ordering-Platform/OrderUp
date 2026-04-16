
# OrderUp/Campus Caterers: Campus Food Ordering System
  ***COMS3009: Software Design***
  
## 1. Project Overview
University food courts experience heavy congestion during peak hours. Students and potentially, staff, spend significant time waiting in queues which lead them to being late for lectures of missing meals. At the same time, vendors are overwhelmed during these peak times, leading to a decline in quality and customer satisfaction.

OrderUp addresses this problem by providing a centralized, web-based food ordering platform for campus environments. The system allows customers to browse menus, place orders across multiple vendors in a single transaction, and track order progress in real time. Vendors are provided with a management interface to update menus and process incoming orders efficiently and give order status updates.

## 2. Tech Stack
| Layer | Technology | Purpose |
|------|-----------|--------|
| Frontend | React 18 | UI & routing |
| Backend | Node.js + Express | REST API |
| Database | PostgreSQL | Data storage |
| Authentication | Auth0(Google Authentication) | Secure sessions |
| Styling | Tailwind CSS | UI styling |

## 3. Features 
###  Customer Features
- Secure authentication
- Browse menus with prices and descriptions
- Cart management
- Order placement and confirmation
- Order tracking
- View allergen information of vendor menu items

###  Vendor Features
- Vendor dashboard access(View and approve or reject incoming orders)
- Menu CRUD operations
- Order management and status updates

### Admin Features
- Monitor vendor accounts
- Delete or suspend non-compliant vendor account

## 4. Project Structure
TBD

## 5. Prerequisites
- [Node.js (v18+)](https://nodejs.org)
- npm (bundled with Node.js)
- Azure Account, Added to the rescource group
- VS code PostreSQL extension
- Flyway CLI

## Getting Started
TBD

## 6. Git Workflow
TBD

## 5. License
This is an academic project as part of COMS3009A at the University of the Witwatersrand.

## 7. Notes
- Do not commit `.env` files
- Use meaningful commit messages
- Keep `main` stable at all times
