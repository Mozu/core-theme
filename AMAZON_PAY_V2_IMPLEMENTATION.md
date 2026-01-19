# Amazon Pay v2 Implementation Guide

## Overview

This project supports **both Amazon Pay v1 and v2** implementations side-by-side, allowing seamless migration without disrupting existing functionality.

**Key Architecture Decisions:**
- **Template-Based Rendering:** v2 uses Hypr templates (`.hypr.live` files) instead of inline HTML for maintainability and reusability
- **Hosted Checkout Flow:** Amazon handles address/payment collection on their hosted pages; merchant displays read-only data
- **Smart SDK Loading:** SDK loads on-demand when checkout session returns, preventing unnecessary script loading
- **Event-Driven Architecture:** Uses EventBus for loose coupling between SDK loading and UI initialization
- **Deduplication:** Session ID tracking prevents duplicate API calls and duplicate event listeners

**Recent Improvements (Jan 2026):**
- Separated presentation from logic using Hypr templates for address and payment widgets
- Fixed SDK loading issue where `init(loadScript=false)` prevented change buttons from working
- Eliminated duplicate API calls using session deduplication and `EventBus.once()`
- Simplified button binding by removing setTimeout hacks and legacy fallback code

## Implementation Structure

### v1 Files (Original - Unchanged)
These files support the legacy Amazon Pay (OffAmazonPayments) API:

**JavaScript Modules:**
- `scripts/modules/amazonpay.js` - v1 SDK integration, widgets, and button rendering
- `scripts/modules/models-amazoncheckout.js` - v1 single-ship checkout model
- `scripts/modules/models-amazoncheckoutV2.js` - v1 multi-ship checkout model
- `scripts/pages/amazon-checkout.js` - v1 checkout page controller

**Templates:**
- `templates/pages/amazon-checkout.hypr` - v1 checkout page with widget containers
- `templates/modules/checkout/amazon-shipping-billing.hypr.live` - v1 shipping/billing module with widgets

### v2 Files (New Implementation)
These files support the new Amazon Pay Checkout v2 API:

**JavaScript Modules:**
- `scripts/modules/amazonpay-v2.js` - **Core v2 integration module**
  - SDK script loading with region-specific checkout.js URLs
  - Button rendering via `amazon.Pay.renderButton()`
  - Session data fetching via `getCheckoutSession()` API call
  - Hypr template rendering for address/payment widgets
  - Change button binding using `amazon.Pay.changeShippingAddress()` and `amazon.Pay.changePaymentMethod()`
  - Session deduplication to prevent duplicate initialization
  - EventBus integration for SDK-loaded notifications
  
- `scripts/models/models-amazoncheckout-v2.js` - v2 single-ship checkout model (order creation, charge processing)
- `scripts/models/models-amazoncheckoutV2-v2.js` - v2 multi-ship checkout model (split shipments)
- `scripts/pages/amazon-checkout-v2.js` - v2 checkout page controller (initializes widgets, handles return flow)

**Templates:**
- `templates/pages/amazon-checkout-v2.hypr` - v2 checkout page container (no embedded widgets)
- `templates/modules/checkout/amazon-shipping-billing-v2.hypr.live` - v2 shipping/billing module container
- `templates/modules/amazonpay/address-widget.hypr.live` - **Address display template**
  - Renders shipping address in read-only format
  - Shows "Change" button that triggers Amazon hosted address page
  - Conditional rendering: shows loading state if no data
  - Uses Hypr filters: `{% firstof %}` for name fallback, `|default()` for optional fields
  
- `templates/modules/amazonpay/payment-widget.hypr.live` - **Payment display template**
  - Renders payment method descriptor (e.g., "Visa ****1234")
  - Shows "Change" button that triggers Amazon hosted payment page
  - Conditional rendering: shows loading state if no data
  - CSS class-based styling (no inline styles)

**Technical Requirements:**
- `.hypr.live` extension is **mandatory** (not `.hypr`) for runtime template access
- Templates compiled by Grunt build process into `Hypr.getTemplate()` registry
- Templates must be deployed with theme to production environment
- Template syntax uses Hypr filters: `{{ variable|default("fallback") }}`, `{% firstof var1 var2 "default" %}`

### Backend (Supports Both v1 and v2)
The backend PayWithAmazon service automatically detects and routes between v1 and v2:

**Key Files:**
- `PayWithAmazon/assets/src/amazon/amazonpaysdkv2.js` - Amazon Pay v2 SDK wrapper
- `PayWithAmazon/assets/src/domains/storefront/amazonCheckoutSession.js` - v2 checkout session endpoint
- `PayWithAmazon/assets/src/amazon/paymenthelper.js` - Payment processing with automatic v1/v2 detection
- `PayWithAmazon/assets/src/amazon/checkout.js` - Checkout flow coordination

**Required Backend API Endpoints:**

Frontend makes AJAX calls to these endpoints (backend must implement):

1. **POST** `/amazonpay/v2/checkoutsession`
   - **Purpose:** Create signed checkout session payload for Amazon Pay button
   - **Request Body:**
     ```json
     {
       "cartOrOrderId": "string",
       "isCart": boolean,
       "returnUrl": "string"
     }
     ```
   - **Response:**
     ```json
     {
       "payloadJSON": "string (signed payload)",
       "signature": "string",
       "publicKeyId": "string"
     }
     ```

2. **GET** `/amazonpay/v2/checkoutsession/{checkoutSessionId}`
   - **Purpose:** Retrieve session details (shipping address, payment method)
   - **Response:**
     ```json
     {
       "data": {
         "shippingAddress": {
           "name": "string",
           "addressLine1": "string",
           "city": "string",
           "stateOrRegion": "string",
           "postalCode": "string",
           "countryCode": "string"
         },
         "paymentPreferences": [
           {
             "paymentDescriptor": "string (e.g., 'Visa ****1234')"
           }
         ]
       }
     }
     ```

3. **POST** `/amazonpay/v2/updatecheckoutsession`
   - **Purpose:** Update checkout session before final order submission
   - **Request Body:**
     ```json
     {
       "checkoutSessionId": "string",
       "webCheckoutDetails": {
         "checkoutReviewReturnUrl": "string",
         "checkoutResultReturnUrl": "string"
       },
       "paymentDetails": {
         "paymentIntent": "Authorize" | "AuthorizeWithCapture",
         "canHandlePendingAuthorization": boolean,
         "chargeAmount": {
           "amount": number,
           "currencyCode": "string"
         }
       },
       "merchantMetadata": {
         "merchantReferenceId": "string",
         "merchantStoreName": "string"
       }
     }
     ```
   - **Response:**
     ```json
     {
       "redirectUrl": "string (optional - for 3DS or challenges)"
     }
     ```

**Backend Implementation Notes:**
- Endpoints should proxy to Amazon Pay API v2 using merchant credentials
- Session creation requires RSA signature generation with private key
- GetCheckoutSession retrieves buyer info from Amazon
- UpdateCheckoutSession prepares session for charge authorization
- All endpoints require proper error handling and logging

## Key Differences: v1 vs v2

| Feature | v1 (OffAmazonPayments) | v2 (Checkout v2) |
|---------|------------------------|------------------|
| **SDK Script** | `OffAmazonPayments/*/Widgets.js` | `checkout.js` |
| **Authentication** | Client ID + Seller ID | Public Key ID + Merchant ID + Store ID |
| **Button Rendering** | `OffAmazonPayments.Button()` | `amazon.Pay.renderButton()` |
| **Widgets** | AddressBook, Wallet widgets | No widgets - data displayed via API |
| **Address/Payment Display** | Interactive widgets on page | Read-only display with "Change" buttons |
| **Change Actions** | Widget refresh | Redirect to Amazon hosted pages |
| **Checkout Flow** | Widgets on merchant site | Hosted on Amazon |
| **Order Reference** | `awsReferenceId` | `amazonCheckoutSessionId` |
| **Return URL** | `view=amazon-checkout` | `view=amazon-checkout-v2` |
| **Backend Detection** | Legacy namespace check | `isCheckoutSession()` helper |

## Configuration

### v1 Credentials (Current)
Required for v1 implementation:
```javascript
{
  "environment": "sandbox" | "production",
  "region": "us" | "uk" | "de" | "jp",
  "sellerId": "YOUR_SELLER_ID",
  "clientId": "YOUR_CLIENT_ID"
}
```

### v2 Credentials (New)
Required for v2 implementation:
```javascript
{
  "environment": "sandbox" | "production",
  "region": "us" | "uk" | "de" | "jp",
  "merchantId": "YOUR_MERCHANT_ID",  // Replaces sellerId
  "publicKeyId": "YOUR_PUBLIC_KEY_ID",  // New
  "storeId": "YOUR_STORE_ID"  // New
}
```

### Migration Path

**Option 1: Gradual Migration**
1. Keep both implementations active
2. Add v2 credentials to configuration
3. Backend will use v2 for new checkouts, v1 for existing references
4. Test v2 flow in parallel with v1
5. Once validated, remove v1 credentials

**Option 2: Immediate Switch**
1. Add v2 credentials
2. Remove v1 credentials
3. All new checkouts use v2
4. Existing v1 order references still processable by backend

## How Users Switch to v2

### Frontend Changes
The switch is **automatic** based on credentials:

1. If only v1 credentials exist → Uses v1 implementation (amazonpay.js, amazon-checkout.hypr)
2. If v2 credentials exist → Uses v2 implementation (amazonpay-v2.js, amazon-checkout-v2.hypr)

**View Name Detection:**
- v1: `viewName="amazon-checkout"` → Routes to templates/pages/amazon-checkout.hypr
- v2: `viewName="amazon-checkout-v2"` → Routes to templates/pages/amazon-checkout-v2.hypr

### Backend Changes
The backend automatically detects v1 vs v2 based on the payment token:

```javascript
// In paymenthelper.js
var isV2 = paymentHelper.isCheckoutSession(payment);

if (isV2) {
  // Use v2 methods: confirmAndAuthorizeV2, captureAmountV2, etc.
} else {
  // Use v1 methods: legacy flow
}
```

### Cart Page Integration

For v1, update cart template:
```javascript
// Cart template
require(['modules/amazonpay'], function(AmazonPay) {
  AmazonPay.init(true);
  AmazonPay.addCheckoutButton('{{ model.id }}', true, false);
});
```

For v2, update cart template:
```javascript
// Cart template
require(['modules/amazonpay-v2'], function(AmazonPay) {
  AmazonPay.init(true);
  AmazonPay.addCheckoutButton('{{ model.id }}', true, false);
});
```

**Recommended:** Use feature detection in cart template:
```javascript
// Detect which version is configured and load appropriate module
{% with siteContext.checkoutSettings.externalPaymentWorkflowSettings|findwhere("name", "PAYWITHAMAZON") as payWithAmazon %}
  {% with payWithAmazon.credentials|findwhere("apiName", "publicKeyId") as publicKeyId %}
    {% if publicKeyId %}
      require(['modules/amazonpay-v2'], function(AmazonPay) {
        AmazonPay.init(true);
        AmazonPay.addCheckoutButton('{{ model.id }}', true, false);
      });
    {% else %}
      require(['modules/amazonpay'], function(AmazonPay) {
        AmazonPay.init(true);
        AmazonPay.addCheckoutButton('{{ model.id }}', true, false);
      });
    {% endif %}
  {% endwith %}
{% endwith %}
```

## Testing Checklist

### v2 Express Checkout Flow
- [ ] **Cart Page** - Amazon Pay v2 button renders correctly
- [ ] **Button Click** - Redirects to Amazon hosted checkout
- [ ] **Amazon Checkout** - Customer selects address and payment
- [ ] **Return Flow** - Redirects back with `amazonCheckoutSessionId` parameter
- [ ] **View Routing** - Routes to `amazon-checkout-v2.hypr` template
- [ ] **Token Creation** - Creates token with checkout session ID
- [ ] **Token Details** - Backend retrieves shipping/billing from session
- [ ] **Order Creation** - Payment applied and order submitted successfully
- [ ] **Multi-ship** - Works with multi-ship checkout (if enabled)

### Payment Actions (v2)
- [ ] **Authorize** - Creates authorization successfully
- [ ] **Capture** - Captures authorized payment
- [ ] **Void/Cancel** - Cancels authorization before capture
- [ ] **Refund** - Processes refund for captured payment

### Regions (v2)
- [ ] **US** - USD, en_US
- [ ] **UK** - GBP, en_GB
- [ ] **DE** - EUR, de_DE
- [ ] **JP** - JPY, ja_JP

## v2 Implementation Details

### Express Checkout (Current Status: ✅ Complete)
The v2 implementation supports **Express Checkout** placement:
- Amazon Pay button on cart page
- Amazon collects shipping address and payment method
- Customer returns to merchant site after completing on Amazon
- Address and payment information displayed via GetCheckoutSession API
- "Change" buttons redirect to Amazon's hosted pages for updates
- Merchant creates charge and completes order

### Key v2 Features Implemented

#### 1. Hypr Template-Based Widget Rendering
Instead of inline HTML in JavaScript, v2 uses proper Hypr templates:
- `templates/modules/amazonpay/address-widget.hypr.live` - Displays shipping address
- `templates/modules/amazonpay/payment-widget.hypr.live` - Displays payment method
- Templates handle both "data available" and "placeholder" states
- Clean separation of presentation (Hypr) from logic (JavaScript)

#### 2. Smart Script Loading
- `initializeWidgets()` automatically loads Amazon SDK if not loaded
- Prevents duplicate initialization with session ID tracking
- Script loading only happens when needed (checkout return page)

##return; // Quote orders not supported in v2
}
```

### Template Loading
Hypr templates must be compiled and available in the theme:
- Templates are in `templates/modules/amazonpay/` directory
- Grunt automatically compiles `.hypr.live` files
- Templates loaded via `Hypr.getTemplate('modules/amazonpay/address-widget')`
- Ensure templates are uploaded with theme deploymentContinue button proceeds to order submission
```

#### 5. Error Handling
- Loading states while fetching session data
- Error states with fallback messaging
- Placeholder content if API fails
- Prevents duplicate API calls on re-render

## Code Examples

### Template Rendering
The v2 implementation uses Hypr templates instead of inline HTML:

```javascript
// In amazonpay-v2.js
function renderAddressWidget(address) {
    return Hypr.getTemplate('modules/amazonpay/address-widget').render({
        hasData: !!address,
        address: address || {},
        changeButtonText: "Change"
    });
}

function renderPaymentWidget(payment) {
    return Hypr.getTemplate('modules/amazonpay/payment-widget').render({
        hasData: !!payment,
        payment: payment || {},
        changeButtonText: "Change"
    });
}

// Usage in displaySessionInfoWithData
var addressHtml = renderAddressWidget(address);
$('#address-widget-container').html(addressHtml);
```

### Template Syntax Reference

**address-widget.hypr.live:**
```html
{% if hasData %}
<div class="mz-amazonpay-address-widget">
    <div class="mz-amazonpay-address">
        <p><strong>{% firstof address.name "No Name" %}</strong></p>
        <p>{{ address.addressLine1|default("") }}</p>
        {% if address.addressLine2 %}
            <p>{{ address.addressLine2 }}</p>
        {% endif %}
        <p>{{ address.city|default("") }}, {{ address.stateOrRegion|default("") }} {{ address.postalCode|default("") }}</p>
        <p>{{ address.countryCode|default("") }}</p>
    </div>
    <button class="mz-button mz-amazonpay-change-address" data-action="changeAddress">
        {{ changeButtonText }}
    </button>
</div>
{% else %}
<div class="mz-amazonpay-loading">
    <p>Loading address...</p>
</div>
{% endif %}
```

### EventBus Pattern

```javascript
// ❌ WRONG - Creates duplicate listeners on re-render
EventBus.on("aws-script-loaded", function() {
    bindChangeActions(checkoutSessionId);
});

// ✅ CORRECT - Listener fires only once
EventBus.once("aws-script-loaded", function() {
    bindChangeActions(checkoutSessionId);
});
```

### Session Deduplication

```javascript
// Prevent duplicate initialization for same session
var currentSessionId = null;

function initializeWidgets(checkoutSessionId) {
    if (currentSessionId === checkoutSessionId) {
        return; // Already initialized
    }
    currentSessionId = checkoutSessionId;
    
    // Continue with initialization...
}
```

## Migration Guide for Developers

### From Inline HTML to Hypr Templates

**Before (Inline HTML):**
```javascript
function displayAddress(address) {
    var html = '<div class="address">' +
        '<p>' + address.name + '</p>' +
        '<p>' + address.addressLine1 + '</p>' +
        '</div>';
    $('#container').html(html);
}
```

**After (Hypr Templates):**
```javascript
// 1. Create template file: templates/modules/amazonpay/address-widget.hypr.live
// 2. Use template rendering:
function renderAddressWidget(address) {
    return Hypr.getTemplate('modules/amazonpay/address-widget').render({
        hasData: !!address,
        address: address || {}
    });
}
```

### Migration Checklist

- [ ] **Step 1:** Create `.hypr.live` template files in `templates/modules/amazonpay/`
- [ ] **Step 2:** Replace inline HTML string concatenation with `Hypr.getTemplate().render()`
- [ ] **Step 3:** Pass data as objects to template's `render()` method
- [ ] **Step 4:** Use Hypr filters for default values: `{{ value|default("fallback") }}`
- [ ] **Step 5:** Use `{% firstof value1 value2 "default" %}` for multiple fallbacks
- [ ] **Step 6:** Run `grunt build` to compile templates
- [ ] **Step 7:** Test template rendering in browser
- [ ] **Step 8:** Verify "Change" buttons bind correctly after SDK loads
- [ ] **Step 9:** Use `EventBus.once()` instead of `.on()` for one-time events
- [ ] **Step 10:** Add session deduplication to prevent duplicate API calls

### End-of-Checkout (Status: 🚧 Pending)
Future enhancement for **End-of-Checkout** placement:
- Amazon Pay button on checkout page (after merchant collects shipping)
- Merchant sends order details to Amazon upfront
- Customer only selects payment method on Amazon
- Requires enhanced checkout session payload

**See:** [AMAZON_PAY_V2_END_OF_CHECKOUT.md](./AMAZON_PAY_V2_END_OF_CHECKOUT.md) for implementation details.

## Known Limitations

### v2 Quote Order Flow
The v2 implementation does not currently support Quote Order flow:
```javascript
// In amazonpay-v2.js
if (isQuoteOrder) {
  // TODO: Implement quote order flow
  window.console.warn("Amazon Pay quote order flow not yet implemented in v2");
  return;
}
```

### Token Details Handler
The frontend calls `thirdPartyPaymentExecute` with `methodName: "tokenDetails"` to retrieve shipping/billing info from the checkout session. This may require a custom action handler in the PayWithAmazon service:

```javascript
// TODO: Verify that thirdPartyPaymentExecute with methodName "tokenDetails"
// is properly implemented in backend. This may need a custom action handler
// to retrieve checkout session details from Amazon Pay v2 API.
// If this returns errors during testing, implement a handler in PayWithAmazon service.
```

## Troubleshooting

### "Amazon Pay button not rendering"
**v1:** Check sellerId and clientId in configuration
**v2:** Check merchantId, publicKeyId, and storeId in configuration

### "checkout.js failed to load"
**v2 only:** Verify region-specific checkout.js URL is correct for your region:
- US: `https://static-na.payments-amazon.com/checkout.js`
- UK/DE: `https://static-eu.payments-amazon.com/checkout.js`
- JP: `https://static-fe.payments-amazon.com/checkout.js`

### "Wrong template rendering"
Check the `view` parameter in URL:
- v1: `?view=amazon-checkout`
- v2: `?view=amazon-checkout-v2`

### "window.amazon is null"
**v2 only:** The Amazon SDK script must load before change buttons can work:
- `init(true)` loads the script from Amazon's CDN
- `initializeWidgets()` automatically calls `init(true)` if needed
- Check that checkout.js URL is accessible in your region

### "Template not found" error
Template files must use `.hypr.live` extension (not just `.hypr`):
- Correct: `address-widget.hypr.live`, `payment-widget.hypr.live`
- Wrong: `address-widget.hypr`
- Run `grunt build` to compile templates
- Check `templates/modules/amazonpay/` directory exists
- Verify templates uploaded to server with theme deployment

### "Duplicate API calls"
Fixed with session ID tracking:
- `initializeWidgets()` now checks if already initialized for same session
- Prevents duplicate `getCheckoutSession()` calls on re-render
- Use `EventBus.once()` instead of `EventBus.on()` for one-time listeners

## References

- [Amazon Pay API v2 Documentation](https://developer.amazon.com/docs/amazon-pay-api-v2/intro.html)
- [Amazon Pay Checkout v2 Integration Guide](https://developer.amazon.com/docs/amazon-pay-checkout/introduction.html)
- [End-of-Checkout Implementation](./AMAZON_PAY_V2_END_OF_CHECKOUT.md)
- [Amazon Pay SDK - Node.js](https://github.com/amzn/amazon-pay-api-sdk-nodejs)

---

**Last Updated:** 2026-01-18  
**Status:** v2 Express Checkout Complete with Hypr Templates, v1/v2 Coexistence Implemented
