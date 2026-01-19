# Amazon Pay v2 - End-of-Checkout Implementation Guide

## Overview

This document outlines the implementation requirements for Amazon Pay v2 "End-of-Checkout" placement, as detailed in the [official Amazon Pay documentation](https://developer.amazon.com/docs/amazon-pay-checkout/end-of-checkout.html).

## Current Implementation Status

### ✅ Completed (Express Checkout)
The current implementation supports **Express Checkout** placement:
- Amazon Pay button on cart page
- Amazon collects shipping address and payment method
- Customer returns to merchant site after completing on Amazon
- Merchant creates charge and completes order

### 🚧 Pending (End-of-Checkout)
**End-of-Checkout** placement requires additional implementation:
- Amazon Pay button on checkout page (after merchant collects shipping info)
- Merchant sends order details to Amazon upfront
- Customer only selects payment method on Amazon
- Merchant completes session and creates charge

## Key Differences: Express vs End-of-Checkout

| Feature | Express Checkout | End-of-Checkout |
|---------|------------------|-----------------|
| **Button Location** | Cart page | Checkout page |
| **Shipping Collection** | Amazon collects | Merchant collects |
| **Checkout Mode** | Default (not specified) | `ProcessOrder` |
| **Initial Payload** | Minimal (returnUrl, storeId) | Full (amount, address, payment intent) |
| **Session Update** | Not needed | May be needed before completion |

## Implementation Requirements for End-of-Checkout

### 1. Enhanced Checkout Session Payload

**File:** `PayWithAmazon/assets/src/domains/storefront/amazonCheckoutSession.js`

**Current payload:**
```javascript
{
  webCheckoutDetails: {
    checkoutReviewReturnUrl: returnUrl
  },
  storeId: config.storeId,
  scopes: ['name', 'email', 'phoneNumber', 'billingAddress']
}
```

**Required payload for end-of-checkout:**
```javascript
{
  webCheckoutDetails: {
    checkoutReviewReturnUrl: returnUrl,
    checkoutMode: 'ProcessOrder'  // NEW: Required for end-of-checkout
  },
  storeId: config.storeId,
  paymentDetails: {  // NEW: Required payment information
    chargeAmount: {
      amount: orderTotal,  // Must be passed from request
      currencyCode: 'USD'  // Or EUR, GBP, JPY based on region
    },
    paymentIntent: 'Authorize'  // Or 'AuthorizeWithCapture' based on config
  },
  addressDetails: {  // OPTIONAL: If merchant already collected shipping
    name: shippingAddress.name,
    addressLine1: shippingAddress.addressLine1,
    addressLine2: shippingAddress.addressLine2,
    city: shippingAddress.city,
    stateOrRegion: shippingAddress.stateOrProvince,
    postalCode: shippingAddress.postalCode,
    countryCode: shippingAddress.countryCode,
    phoneNumber: shippingAddress.phoneNumber
  },
  scopes: ['name', 'email', 'phoneNumber', 'billingAddress']
}
```

**Implementation steps:**
1. Update `amazonCheckoutSession.js` to accept additional request parameters:
   - `orderTotal` - The total amount to charge
   - `currencyCode` - Currency code for the charge
   - `shippingAddress` - (Optional) Merchant-collected shipping address
2. Include `paymentDetails` in payload based on request data
3. Include `addressDetails` if shipping address is available
4. Set `checkoutMode: 'ProcessOrder'`

### 2. Optional: Update Checkout Session Before Completion

**File:** `PayWithAmazon/assets/src/amazon/paymenthelper.js`
**Function:** `confirmAndAuthorizeV2()`

If the merchant needs to send updated information (e.g., final order total, updated shipping address) before completing the session, add an `updateCheckoutSession` call:

```javascript
// BEFORE completing the session, update it with final details
var updatePayload = {
  paymentDetails: {
    chargeAmount: {
      amount: paymentAction.amount,  // Final order total
      currencyCode: paymentAction.currencyCode
    }
  },
  // Optional: update shipping address if changed
  addressDetails: {
    // ... shipping address details
  }
};

return amazonPayV2.updateCheckoutSession(checkoutSessionId, updatePayload)
  .then(function(updatedSession) {
    console.log("Checkout session updated:", updatedSession);

    // NOW complete the session
    return amazonPayV2.completeCheckoutSession(checkoutSessionId, completePayload);
  })
  .then(function(completedSession) {
    // ... continue with charge creation
  });
```

**Note:** The `updateCheckoutSession` method is already implemented in `amazonpaysdkv2.js` (line 95), so you just need to call it.

### 3. Frontend Changes

**File:** `Mozu.CoreTheme/scripts/modules/amazonpay.js`
**Function:** `getCheckoutSessionConfig()`

Update the API call to include order details:

```javascript
getCheckoutSessionConfig: function(cartOrOrderId, isCart) {
  var self = this;
  var apiUrl = "/api/commerce/amazonpay/checkoutsession";

  // TODO: Get order total and shipping address from current cart/order
  var orderData = this.getOrderData(cartOrOrderId, isCart);

  return $.ajax({
    method: "POST",
    url: apiUrl,
    contentType: "application/json",
    data: JSON.stringify({
      cartOrOrderId: cartOrOrderId,
      isCart: isCart,
      returnUrl: self.getReturnUrl(cartOrOrderId, isCart),
      // NEW: Include order details for end-of-checkout
      orderTotal: orderData.total,
      currencyCode: orderData.currencyCode,
      shippingAddress: orderData.shippingAddress  // If available
    })
  })
  // ... rest of implementation
}
```

### 4. Configuration Setting

Add a configuration option to choose between Express and End-of-Checkout placement:

**Recommended:** Add a setting in payment configuration:
- `placementType`: "Express" or "EndOfCheckout"
- Use this to determine which payload structure to use

## Testing Checklist for End-of-Checkout

- [ ] **Checkout Page Button** - Button renders on checkout page (not just cart)
- [ ] **Payload Verification** - Verify signed payload includes:
  - [ ] `checkoutMode: 'ProcessOrder'`
  - [ ] `paymentDetails.chargeAmount`
  - [ ] `paymentDetails.paymentIntent`
  - [ ] `addressDetails` (if applicable)
- [ ] **Amazon Hosted Page** - Customer sees:
  - [ ] Order amount displayed correctly
  - [ ] Shipping address displayed (if sent)
  - [ ] Only payment method selection required
- [ ] **Session Completion** - Backend successfully:
  - [ ] Completes checkout session
  - [ ] Creates charge with correct amount
  - [ ] Handles authorization/capture based on config
- [ ] **Error Handling** - Test scenarios:
  - [ ] Invalid payment method
  - [ ] Insufficient funds
  - [ ] Session timeout
  - [ ] Network errors

## API Reference

### Amazon Pay v2 SDK Methods (Already Implemented)

All required methods are already in `amazonpaysdkv2.js`:

- ✅ `generateButtonSignature(payload)` - Signs the checkout session payload
- ✅ `getCheckoutSession(sessionId)` - Retrieves session details
- ✅ `updateCheckoutSession(sessionId, payload)` - Updates session before completion
- ✅ `completeCheckoutSession(sessionId, payload)` - Completes the session
- ✅ `createCharge(payload)` - Creates authorization or charge

### Required Enhancements

Only the payload construction logic needs to be enhanced:

1. **amazonCheckoutSession.js** - Build richer initial payload
2. **paymenthelper.js confirmAndAuthorizeV2()** - Optionally update before completing
3. **amazonpay.js getCheckoutSessionConfig()** - Send order data in request

## Migration Path

### Phase 1: Current State (Express Checkout Only)
- ✅ Works for cart page button placement
- ✅ Amazon collects all information
- ✅ Basic v2 integration complete

### Phase 2: Add End-of-Checkout Support (Pending)
- 🚧 Enhance checkout session payload creation
- 🚧 Support button on checkout page
- 🚧 Send merchant-collected order details to Amazon
- 🚧 Optionally update session before completion

### Phase 3: Configuration & Testing
- 🚧 Add placement type configuration
- 🚧 Test both express and end-of-checkout flows
- 🚧 Verify all payment scenarios (auth, capture, refund, void)

## Key Considerations

### 1. **Placement Strategy**
Decide where to show Amazon Pay button:
- **Express only:** Cart page (current implementation)
- **End-of-checkout only:** Checkout page (after collecting shipping)
- **Both:** Cart AND checkout page (recommended for flexibility)

### 2. **Address Handling**
- **Express:** Amazon provides address, merchant validates/applies shipping rates
- **End-of-checkout:** Merchant collects address first, sends to Amazon

### 3. **Amount Accuracy**
For end-of-checkout, ensure the amount in the initial payload matches final charge:
- Include shipping costs
- Include taxes
- Include discounts
- If amounts change, update session before completing

### 4. **Scope Requirements**
Different placements may need different scopes:
- **Express:** Need shipping address scope
- **End-of-checkout:** May only need payment scope

## Related Files

### Frontend (Mozu.CoreTheme)
- `scripts/modules/amazonpay.js` - Button rendering and payload fetching
- `scripts/modules/models-amazoncheckout.js` - Single-ship checkout handling
- `scripts/modules/models-amazoncheckoutV2.js` - Multi-ship checkout handling
- `scripts/pages/amazon-checkout.js` - Checkout page controller

### Backend (PayWithAmazon)
- `assets/src/domains/storefront/amazonCheckoutSession.js` - Payload generation endpoint
- `assets/src/amazon/amazonpaysdkv2.js` - Amazon Pay v2 SDK wrapper
- `assets/src/amazon/paymenthelper.js` - Payment processing logic
- `assets/src/amazon/checkout.js` - Checkout flow coordination

## References

- [Amazon Pay End-of-Checkout Documentation](https://developer.amazon.com/docs/amazon-pay-checkout/end-of-checkout.html)
- [Amazon Pay Button Documentation](https://developer.amazon.com/docs/amazon-pay-checkout/add-the-amazon-pay-button.html)
- [Amazon Pay API Reference](https://developer.amazon.com/docs/amazon-pay-api-v2/checkout-session.html)
- [Amazon Pay SDK - Node.js](https://github.com/amzn/amazon-pay-api-sdk-nodejs)

---

**Last Updated:** 2025-11-19
**Migration Status:** Phase 1 Complete, Phase 2 Pending
