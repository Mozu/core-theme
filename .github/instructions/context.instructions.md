---
applyTo: '**'
---
Kibo UCP Core-Theme - Technical Analysis & Context

Executive Summary

* Project Purpose: The Kibo UCP core-theme is a customizable, modular frontend theme for Kibo’s Unified Commerce Platform. It provides the user interface and business logic for eCommerce workflows such as checkout, customer account management, cart, B2B account features, and payment integrations. The theme is designed for extensibility and theming to support various storefronts.
* Business Domain: Retail and eCommerce. The application enables online shopping, order management, B2B commerce, and digital payments for retailers and brands using the Kibo Commerce platform.
* Key Users: Shoppers (B2C and B2B), business buyers, account managers, and site administrators.

Technology Stack

* Frontend: JavaScript (ES5/ES6), Backbone.js (MVC), Hypr templates, LESS for styles, jQuery, Underscore.js
* Backend: None in theme (all business logic/data via Kibo Commerce REST APIs)
* Database: None in theme (data managed by Kibo platform; theme accesses via REST APIs)
* Infrastructure: Built with Grunt, Node.js for tooling, packaged as NuGet for deployment to Kibo’s cloud platform. CI/CD and hosting managed by Kibo platform.

Architecture Overview

* Design Pattern: MVC (Backbone.js), modular, event-driven, themable architecture
* Layer Separation: Models (data/business logic), Views (UI/rendering), Collections (paged data), Hypr templates (presentation), LESS (styles)
* Communication: Event-driven (Backbone events, event bus), API calls for all data, centralized message handler for errors/info

External Integrations

* APIs: Kibo Commerce REST APIs (customers, cart, orders, products, B2B accounts, etc.), payment vendor SDKs (Apple Pay, Amazon Pay, Visa Checkout, PayPal), Monetate (personalization)
* Authentication: Managed by Kibo platform (session/cookie-based); theme checks user roles/permissions for B2B features
* Data Sources: All data from Kibo APIs; no direct DB or external data sources in theme
* Third-party Libraries: Backbone.js, jQuery, Underscore.js, payment SDKs, Monetate

Core Business Workflows

* Checkout: Multi-step process (shipping, payment, review), with validation, error handling, coupon/discount support, digital wallets, and B2B purchase flows. State managed in models, UI in views/templates.
* Customer Account: Registration, login, profile management, address book, saved cards, order history. CRUD via models mapped to API endpoints, validation with Backbone.Validation.
* B2B Account: Account/user management, quick order, purchase approval, account-level payment/shipping, role-based access. Managed via dedicated models and views, with role checks before sensitive actions.

Key Technical Insights

* Strengths: Modular, event-driven, and themable architecture; clear separation of business/UI logic; centralized error handling; extendable for B2B and B2C; secure API usage for sensitive operations.
* Technical Debt: Relies on older Backbone.js patterns; limited use of modern JS (async/await, modules); no service worker or advanced client-side caching; error handling not deeply instrumented for analytics.
* Performance Considerations: Async API calls, some in-memory caching in models/collections, event-driven UI updates. Performance depends on API latency; large collections may need pagination/virtual scrolling.
* Security Posture: Sensitive operations use secure API calls and vendor SDKs; role-based access enforced in B2B modules; relies on HTTPS and Kibo’s secure APIs; no sensitive data exposed in frontend.

Development Context

* File Structure: 
  - scripts/modules/: Core JS modules (models, views, business logic)
  - scripts/pages/: Page-level JS (entry points for storefront pages)
  - stylesheets/: LESS/CSS styles
  - templates/: Hypr templates for UI
  - admin/: Admin/editor scripts
  - resources/: Static assets
* Entry Points: scripts/pages/ (e.g., checkout.js, myaccount.js, cart.js)
* Configuration: theme.json, theme-ui.json, Gruntfile.js, package.json
* Build Process: Built with Grunt (JS/LESS compilation, asset management), packaged as NuGet for deployment

Future Considerations

* Scalability: Performance tied to Kibo API responsiveness; large data sets may require more advanced client-side optimization (pagination, virtual scrolling)
* Modernization: Refactor to ES6 modules, async/await, introduce service worker for offline support/caching, add client-side logging/analytics
* Feature Expansion: Modular design supports new workflows/features; B2B/B2C extensibility built-in

Quick Reference

* Key Files: 
  - scripts/modules/models-customer.js
  - scripts/modules/models-cart.js
  - scripts/modules/models-checkout.js
  - scripts/modules/models-b2b-account.js
  - scripts/modules/message-handler.js
  - scripts/modules/login-links.js
  - scripts/pages/checkout.js
  - scripts/pages/myaccount.js
  - scripts/pages/cart.js
  - templates/pages/order-status.hypr
* Important Classes/Services: Backbone Models (Customer, Cart, Order, B2BAccount), Collections, Views, Message Handler
* API Endpoints: All via Kibo Commerce REST APIs (customers, cart, orders, products, B2B accounts, payments)
* Configuration Keys: theme.json (theme settings), theme-ui.json (UI config), Gruntfile.js (build tasks)

---

# Deep Dive: Key Models and Data Structures

## Customer Model (`models-customer.js`)
- **Attributes:** id, emailAddress, firstName, lastName, addresses (array), contacts, cards, authentication state
- **Key Methods:**
  - `login`, `logout`, `register`, `updateProfile`, `addAddress`, `removeAddress`, `addCard`, `removeCard`
- **Relationships:**
  - One-to-many with addresses and cards
  - One-to-many with orders

## Cart Model (`models-cart.js`)
- **Attributes:** id, items (array), discounts, shipping/tax estimates, total, status
- **Key Methods:**
  - `addItem`, `removeItem`, `updateItem`, `applyDiscount`, `estimateShipping`, `checkout`
- **Relationships:**
  - One-to-many with line items
  - One-to-one with customer (current session)

## Order Model (`models-orders.js`)
- **Attributes:** id, items, payments, shipments, status, attributes, total
- **Key Methods:**
  - `submitOrder`, `cancelOrder`, `getOrderDetails`, `addPayment`, `addShipment`
- **Relationships:**
  - One-to-many with payments and shipments
  - One-to-one with customer

## B2B Account Model (`models-b2b-account.js`)
- **Attributes:** id, name, users (array), roles, hierarchy, payment/shipping info
- **Key Methods:**
  - `addUser`, `removeUser`, `updateUserRole`, `getHierarchy`, `setPaymentInfo`, `setShippingInfo`
- **Relationships:**
  - One-to-many with users
  - Hierarchical (parent/child accounts)

---

# Example API Endpoint Patterns

- **Customer:**
  - `GET /api/commerce/customer/accounts/{id}`
  - `POST /api/commerce/customer/accounts` (create)
  - `PUT /api/commerce/customer/accounts/{id}` (update)
- **Cart:**
  - `GET /api/commerce/carts/current`
  - `POST /api/commerce/carts/current/items` (add item)
  - `DELETE /api/commerce/carts/current/items/{itemId}`
- **Order:**
  - `GET /api/commerce/orders/{id}`
  - `POST /api/commerce/orders` (submit)
- **B2B Account:**
  - `GET /api/commerce/b2b/accounts/{id}`
  - `POST /api/commerce/b2b/accounts/{id}/users` (add user)

---

# Validation and Error Handling Flows

- **Validation:**
  - Uses `Backbone.Validation` for client-side checks (required fields, email format, etc.)
  - Business rules enforced in models and via API responses (e.g., cannot checkout with empty cart)
- **Error Handling:**
  - API errors are caught and surfaced via `message-handler.js`
  - Errors are displayed contextually (form fields, global alerts)
  - Common pattern: `model.trigger('error', errorObj)`

---

# Important Files, Classes, and Methods

- **`scripts/modules/models-customer.js`:** Customer model, authentication, profile management
- **`scripts/modules/models-cart.js`:** Cart model, item management, discounts
- **`scripts/modules/models-checkout.js`:** Checkout process, step management
- **`scripts/modules/models-b2b-account.js`:** B2B account and user management
- **`scripts/modules/message-handler.js`:** Centralized error/info messaging
- **`scripts/pages/checkout.js`:** Checkout page entry point, workflow orchestration
- **`scripts/pages/myaccount.js`:** Customer account page logic
- **`scripts/pages/cart.js`:** Cart page logic

---

# Example Data Flow: Checkout
1. User adds items to cart (`addItem` → API call)
2. User proceeds to checkout (`checkout.js` initializes checkout model)
3. Shipping info entered and validated (Backbone.Validation)
4. Payment info entered (supports cards, Apple Pay, Amazon Pay, etc.)
5. Order submitted (`submitOrder` → API call)
6. Success or error surfaced via message handler

---

# Example Data Flow: B2B User Management
1. Account manager adds user (`addUser` → API call)
2. User receives invite, sets up profile
3. Role-based access enforced in UI and API
4. Account manager can update or remove users

---

# Common Validation Rules
- Required fields: email, password, shipping address, payment info
- Email format: regex validation
- Password strength: minimum length, character requirements
- Address validation: country, postal code, etc.

---

# Error Handling Patterns
- API/network errors: Displayed as global alerts
- Validation errors: Inline with form fields
- Business rule errors: Contextual messages (e.g., "Item out of stock")

---

# Example: Adding an Item to Cart
- UI triggers `addItem` on cart model
- Model sends `POST /api/commerce/carts/current/items`
- On success: cart updated, UI refreshed
- On error: error message shown via message handler

---

# Example: Role-Based Access (B2B)
- UI checks user role before showing admin features
- Sensitive API calls require proper role; errors handled gracefully

---

# Example: Payment Integration
- Payment info entered in checkout step
- Tokenization via vendor SDK (Apple Pay, Amazon Pay, etc.)
- Secure API call to submit payment
- Errors handled and surfaced to user

---

# Example: Observability
- Key user actions (cart changes, checkout steps) emit events
- Events can be tracked for analytics or debugging

---

# Recent Security & UX Improvements

## Order Status Page - Login/OTP/2FA Isolation (July 2025)
**Problem:** Login, OTP, and 2FA functionality was leaking into the order status form, causing authentication errors and UI elements to appear inappropriately on order lookup forms.

**Root Cause:** Both login and order status forms shared the `.mz-loginform-page` CSS class, causing login-related JavaScript logic to apply to both forms.

**Solution Implemented:**
- **Context-Aware Selectors:** Updated all login/OTP/2FA selectors from `.mz-loginform-page` to `.mz-loginform-page:not(.mz-anonymousorder-form)` 
- **Form-Specific Logic:** Added context checks in OTP/2FA methods to prevent execution on order status forms
- **Scoped Event Handlers:** Limited login-related event binding to actual login forms only
- **Message Display Isolation:** Updated global message display functions to exclude order status forms

**Key Changes in `login-links.js`:**
- OTP/2FA initialization scoped to login forms only using `:not(.mz-anonymousorder-form)` selector
- Added context safeguards in `start2FAChallenge()` and `show2FAChallenge()` methods
- Updated global `displayMessage()` helper to exclude order status forms
- Added form type checks in Enter key handling for OTP actions
- Scoped browser refresh cleanup to login forms only

**Impact:**
- **Security:** Prevents authentication workflows from interfering with order lookup
- **UX:** Clean separation - login errors stay in login forms, order status errors stay in order status forms
- **Scalability:** Solution uses CSS selectors and form context, not hardcoded error filtering
- **Maintainability:** Future error messages will automatically follow proper form scoping

**Template Structure:**
- Login Form: `<form class="mz-loginform mz-loginform-page" name="mz-loginform">` (gets login/OTP/2FA functionality)
- Order Status Form: `<form class="mz-loginform mz-loginform-page mz-anonymousorder-form" name="mz-anonymousorder">` (excluded from login logic)

---

Document Created: 2025-06-10
Last Updated: 2025-07-07
Analysis Depth: Comprehensive (with deep technical details)
