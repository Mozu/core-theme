# Amazon Pay v2 Implementation Guide

## Overview

This project now supports **both Amazon Pay v1 and v2** implementations side-by-side. Users can continue using the existing v1 implementation until they're ready to migrate to v2 by updating their configuration.

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
- `scripts/modules/amazonpay-v2.js` - v2 SDK integration with checkout.js
- `scripts/modules/models-amazoncheckout-v2.js` - v2 single-ship checkout model
- `scripts/modules/models-amazoncheckoutV2-v2.js` - v2 multi-ship checkout model
- `scripts/pages/amazon-checkout-v2.js` - v2 checkout page controller

**Templates:**
- `templates/pages/amazon-checkout-v2.hypr` - v2 checkout page (no widgets)
- `templates/modules/checkout/amazon-shipping-billing-v2.hypr.live` - v2 shipping/billing module (simplified)

### Backend (Supports Both v1 and v2)
The backend PayWithAmazon service automatically detects and routes between v1 and v2:

**Key Files:**
- `PayWithAmazon/assets/src/amazon/amazonpaysdkv2.js` - Amazon Pay v2 SDK wrapper
- `PayWithAmazon/assets/src/domains/storefront/amazonCheckoutSession.js` - v2 checkout session endpoint
- `PayWithAmazon/assets/src/amazon/paymenthelper.js` - Payment processing with automatic v1/v2 detection
- `PayWithAmazon/assets/src/amazon/checkout.js` - Checkout flow coordination

## Key Differences: v1 vs v2

| Feature | v1 (OffAmazonPayments) | v2 (Checkout v2) |
|---------|------------------------|------------------|
| **SDK Script** | `OffAmazonPayments/*/Widgets.js` | `checkout.js` |
| **Authentication** | Client ID + Seller ID | Public Key ID + Merchant ID + Store ID |
| **Button Rendering** | `OffAmazonPayments.Button()` | `amazon.Pay.renderButton()` |
| **Widgets** | AddressBook, Wallet widgets | No widgets (hosted checkout) |
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
The v2 implementation currently supports **Express Checkout** placement:
- Amazon Pay button on cart page
- Amazon collects shipping address and payment method
- Customer returns to merchant site after completing on Amazon
- Merchant creates charge and completes order

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

### "Token details not returned"
The `tokenDetails` handler may need to be implemented in PayWithAmazon service. Check backend logs for errors from `thirdPartyPaymentExecute` call.

## References

- [Amazon Pay v2 Documentation](https://developer.amazon.com/docs/amazon-pay-checkout/)
- [Migration Guide (v1 to v2)](https://developer.amazon.com/docs/amazon-pay-checkout/v2-migration-guide.html)
- [End-of-Checkout Implementation](./AMAZON_PAY_V2_END_OF_CHECKOUT.md)
- [Amazon Pay SDK - Node.js](https://github.com/amzn/amazon-pay-api-sdk-nodejs)

---

**Last Updated:** 2025-11-21
**Status:** v2 Express Checkout Complete, v1/v2 Coexistence Implemented
