# OrderUp - User Stories & Acceptance Tests
## Sprint 1

---

## US001 - Student Browse Vendors

**User Story:**
As a student, I want to browse and search for vendors,
so that I can find food I want to order.

### Acceptance Tests

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | I am logged in as a student | I open the student dashboard | I see a grid of vendor cards | Pass |
| 2 | I am on the student dashboard | I type "Chinese" in the search bar | Only vendors matching "Chinese" appear | Pass |
| 3 | I am on the student dashboard | I click the "Asian" filter chip | Only Asian vendors are displayed | Pass |
| 4 | I am on the student dashboard | I type a name that doesn't exist | A "No vendors found" message appears | Pass |

---

## US002 - Student View Menu and Add to Cart

**User Story:**
As a student, I want to view a vendor's menu and add 
items to my cart, so that I can select what I want to order.

### Acceptance Tests

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | I am on the student dashboard | I click on a vendor card | I am taken to that vendor's menu page | Pass |
| 2 | I am on a vendor menu page | I view the menu items | I can see item name, price, description and allergen tags | Pass |
| 3 | I am on a vendor menu page | I click "Add" on a menu item | The item is added to my cart and a cart bar appears | Pass |
| 4 | I have items in my cart | I click the + button | The item quantity increases | Pass |
| 5 | I have items in my cart | I click the - button | The item quantity decreases | Pass |
| 6 | I am on the menu page | I click a category filter | Only items in that category are shown | Pass |

---

## US003 - Student Checkout and Place Order

**User Story:**
As a student, I want to checkout and place my order online,
so that I can pay without waiting in a queue.

### Acceptance Tests

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | I have items in my cart | I click "View Cart" on the cart bar | I am taken to the checkout page | Pass |
| 2 | I am on the checkout page | I view my order | I can see all my items, quantities and prices | Pass |
| 3 | I am on the checkout page | I view the order summary | I can see subtotal, service fee and total | Pass |
| 4 | I am on the checkout page | I select Paystack as payment method | Paystack is highlighted as selected | Pass |
| 5 | I am on the checkout page | I type in the special instructions box | My note is saved | Pass |
| 6 | I am on the checkout page | I click "Place Order" | I am taken to the order confirmed page | Pass |
| 7 | I navigate to checkout with empty cart | The page loads | I see an empty cart message with a Browse Vendors button | Pass |

---

## US004 - Student Track Order Status

**User Story:**
As a student, I want to track my order status in real-time,
so that I know when my food is ready for collection.

### Acceptance Tests

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | I have placed an order | I am on the order confirmed page | I can see my order number, estimated time and total paid | Pass |
| 2 | I am on the order confirmed page | The page loads | I see a live tracking timeline with 3 steps | Pass |
| 3 | I am on the order confirmed page | Time passes | The status automatically progresses from Confirmed to Preparing to Ready | Pass |
| 4 | I am on the order confirmed page | I view the collection info | I can see the collection point is The Matrix Food Court | Pass |
| 5 | I entered special instructions | I am on the order confirmed page | My special instructions are displayed | Pass |

---

## US005 - Vendor Manage Incoming Orders

**User Story:**
As a vendor, I want to receive and manage incoming orders,
so that I can prepare food efficiently and update order status.

### Acceptance Tests

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | I am logged in as a vendor | I open the vendor dashboard | I see all active incoming orders | Pass |
| 2 | I am on the vendor dashboard | I view an order card | I can see order number, customer name, items and total | Pass |
| 3 | An order has status Confirmed | I click "Start Preparing" | The order status changes to Preparing | Pass |
| 4 | An order has status Preparing | I click "Mark Ready" | The order status changes to Ready | Pass |
| 5 | An order has status Ready | I click "Mark as Collected" | The order is removed from the active list | Pass |
| 6 | I am on the vendor dashboard | I click the "Preparing" filter | Only orders with Preparing status are shown | Pass |

---

## US006 - Vendor Manage Menu Items

**User Story:**
As a vendor, I want to manage my menu items including 
adding, editing and removing items, so that my menu 
is always accurate and up to date.

### Acceptance Tests

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | I am on the vendor dashboard | I click the Menu tab | I see my current menu items in a grid | Pass |
| 2 | I am on the menu tab | I click "+ Add Item" | A form appears to fill in item details | Pass |
| 3 | I fill in the item name, price and category | I click "Add Item" | The new item appears in the menu grid | Pass |
| 4 | I am adding a menu item | I select allergen tags | The tags are saved with the item | Pass |
| 5 | I am adding a menu item | I upload a food image | The image previews and saves with the item | Pass |
| 6 | I have an existing menu item | I click "Edit" | The form opens pre-filled with that item's details | Pass |
| 7 | I have an existing menu item | I click the bin icon | The item is removed from the menu | Pass |
| 8 | I have a menu item | I toggle the Available switch off | The item shows as Sold Out | Pass |
| 9 | I am on the menu tab | I click a category filter | Only items in that category are shown | Pass |

