var errors = require('../errors');
var CONSTANTS = require('../constants/default');
var utils = require('../utils');
var ApiReference;
module.exports = (function () {

    errors.register({
        'BILLING_INFO_MISSING': 'Billing info missing.',
        'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED': 'Payment type missing or unrecognized.',
        'PAYMENT_MISSING': 'Sorry, something went wrong: Expected a payment to exist on this checkout and one did not.',
        'PAYPAL_TRANSACTION_ID_MISSING': 'Sorry, something went wrong: Expected the active payment to include a paymentServiceTransactionId and it did not.',
        'checkout_CANNOT_SUBMIT': 'Sorry, this checkout cannot be submitted. Please refresh the page and try again, or contact Support.',
        'ADD_COUPON_FAILED': 'Adding coupon failed for the following reason: {0}',
        'ADD_GIFT_CARD_FAILED': 'Adding gift card failed for the following reason: {0}',
        'ADD_CUSTOMER_FAILED': 'Adding customer failed for the following reason: {0}',
        'SPLIT_ORDER_ITEM_FAILED': 'Split Order Item Failed',
        'SET_SHIPPING_METHODS_FAILED': 'Set Shipping Methods Failed',
        'UNSET_DESTINATIONS_FAILED': 'Sorry, something went wrong: Unsetting all shipping destinations failed',
        'SET_DESTINATIONS_FAILED': "Sorry, something went wrong: Setting all shipping destinations failed",
        'TOKEN_MISSING': "Payment Token missing or unrecognized",
        'TOKEN_TYPE_MISSING': "Payment Token Type missing or unrecognized"
    });

    var checkoutStatus2IsComplete = {};
    checkoutStatus2IsComplete[CONSTANTS.CHECKOUT_STATUSES.SUBMITTED] = true;
    checkoutStatus2IsComplete[CONSTANTS.CHECKOUT_STATUSES.ACCEPTED] = true;
    checkoutStatus2IsComplete[CONSTANTS.CHECKOUT_STATUSES.PENDING_REVIEW] = true;
    checkoutStatus2IsComplete[CONSTANTS.CHECKOUT_STATUSES.PROCESSING] = true;
    checkoutStatus2IsComplete[CONSTANTS.CHECKOUT_STATUSES.ERRORED] = true;
    checkoutStatus2IsComplete[CONSTANTS.CHECKOUT_STATUSES.COMPLETED] = true;

    var checkoutStatus2IsReady = {};
    checkoutStatus2IsReady[CONSTANTS.CHECKOUT_ACTIONS.SUBMIT_CHECKOUT] = true;
    checkoutStatus2IsReady[CONSTANTS.CHECKOUT_ACTIONS.ACCEPT_CHECKOUT] = true;

    function getPaymentDate(p) {
        return new Date(p.auditInfo.createDate);
    }

    var PaymentStatusTypes = function () {
        return CONSTANTS.PAYMENT_STATUSES;
    }

    var PaymentStrategies = {
        "PaypalExpress": function (checkout, billingInfo) {
            if (!ApiReference) ApiReference = require('../reference');
            return checkout.createPayment({
                returnUrl: billingInfo.paypalReturnUrl,
                cancelUrl: billingInfo.paypalCancelUrl
            }).ensure(function () {
                var payment = checkout.getCurrentPayment();
                if (!payment) errors.throwOnObject(checkout, 'PAYMENT_MISSING');
                if (!payment.paymentServiceTransactionId) errors.throwOnObject(checkout, 'PAYPAL_TRANSACTION_ID_MISSING');
                window.location = ApiReference.urls.paypalExpress + (ApiReference.urls.paypalExpress.indexOf('?') === -1 ? '?' : '&') + "token=" + payment.paymentServiceTransactionId; //utils.formatString(CONSTANTS.BASE_PAYPAL_URL, payment.paymentServiceTransactionId);
            });
        },
        "PurchaseOrder": function (checkout, billingInfo) {
            return checkout.addPurchaseOrder(billingInfo);
        },
        "CreditCard": function (checkout, billingInfo) {
            var card = checkout.api.createSync('creditcard', billingInfo.card);
            errors.passFrom(card, checkout);
            return card.save().then(function (card) {
                billingInfo.card = card.getCheckoutData();
                checkout.prop('billingInfo', billingInfo);
                return checkout.createPayment();
            });
        },
        "Check": function (checkout, billingInfo) {
            return checkout.createPayment();
        },
        "ThirdParty": function (checkout, billingInfo) {
            if (!checkout.token) errors.throwOnObject(checkout, 'TOKEN_MISSING');
            if (!checkout.token.paymentServiceTokenId) errors.throwOnObject(checkout, 'TOKEN_MISSING');
            if (!checkout.token.type) errors.throwOnObject(checkout, 'TOKEN_TYPE_MISSING');
            return checkout.createPayment(billingInfo);
        }
    };

    return {
        splitCheckoutItem: function (params) {
            var self = this;
            params.quantity = params.quantity || 1;

            return this.api.action('checkout', 'splitCheckoutItem', { 'id': self.data.id, 'itemId': params.itemId, 'quantity': params.quantity }).then(function (checkout) {
                //checkout.data = utils.clone(checkout.data)
                var data = utils.clone(checkout.data);
                var newItem = data.items[data.items.length - 1]
                if (newItem.destinationId) {
                    delete newItem.destinationId;
                }
                self.fire('sync', data, self.data);
                return data;
            }, function (reason) {
                return errors.throwOnObject(self, 'SPLIT_ORDER_ITEM_FAILED', reason.message);
            });
        },
        setShippingMethod: function (params) {
            var self = this;
            var payloadCollection = {};
            payloadCollection['postdata'] = [];
            payloadCollection['id'] = self.data.id;

            if (params.groupId && params.shippingRate) {
                payloadCollection.postdata.push({
                    groupingId: params.groupId,
                    shippingRate: params.shippingRate
                });
            }

            return this.api.action('checkout', 'setShippingMethods', payloadCollection).then(function (checkout) {
                //checkout.data = utils.clone(checkout.data)
                var data = utils.clone(checkout.data);
                self.fire('sync', data, self.data);
                return data;
            }, function (reason) {
                return errors.throwOnObject(self, 'SET_SHIPPING_METHODS_FAILED', reason.message);
            });
        },
        

        unsetAllShippingDestinations: function (params) {
            var self = this;
            var id = this.data.id;
            var items = utils.clone(this.data.items);
            var payloadCollection = {
                id: id,
                postdata: [{
                    destinationId: "",
                    itemIds: []
                }]
            }

            for (i = 0; i < items.length; i++) {
                if (items[i].destinationId) {
                    if (items[i].fulfillmentMethod === "Ship" || items[i].fulfillmentMethod === "Delivery") {
                        payloadCollection.postdata[0].itemIds.push(items[i].id);
                    }
                }
            }

            return this.api.action('checkout', 'updateCheckoutItemDestinationBulk', payloadCollection).then(function (checkout) {
                //checkout.data = utils.clone(checkout.data)
                var data = utils.clone(checkout.data);
                self.fire('sync', data, self.data);
                return data;
            }, function (reason) {
                return errors.throwOnObject(self, 'UNSET_DESTINATIONS_FAILED', reason.message);
            });
        },
        setAllShippingDestinations: function (params) {
            var self = this;
            var id = this.data.id;
            var items = utils.clone(this.data.items);
            var payloadCollection = {
                id: id,
                postdata: [{
                    destinationId: params.destinationId,
                    itemIds: []
                }]
            }

            if (params.isFulfillmentMethodDelivery) {
                for (i = 0; i < items.length; i++) {
                    if (items[i].fulfillmentMethod === "Delivery") {
                        payloadCollection.postdata[0].itemIds.push(items[i].id);
                    }
                }
            } else {
                for (i = 0; i < items.length; i++) {
                    if (items[i].fulfillmentMethod === "Ship" || items[i].fulfillmentMethod === "Delivery") {
                        payloadCollection.postdata[0].itemIds.push(items[i].id);
                    }
                }
            }

            return this.api.action('checkout', 'updateCheckoutItemDestinationBulk', payloadCollection).then(function (checkout) {
                //checkout.data = utils.clone(checkout.data)
                var data = utils.clone(checkout.data);
                self.fire('sync', data, self.data);
                return data;
            }, function (reason) {
                return errors.throwOnObject(self, 'SET_DESTINATIONS_FAILED', reason.message);
            });
        },
        getShippingMethodsFromContacts: function () {
            var self = this;
            var fulfillmentInfo = utils.clone(self.prop('fulfillmentInfo'));

            var invalidAddressState = function (contact) {
                if (contact.address && !contact.address.stateOrProvince) {
                    return true
                }
                return false
            };

            var hasInvalidAddressStates = function () {
                var valid = false
                if (fulfillmentInfo instanceof Array) {
                    for (i = 0; i < fulfillmentInfo.length; i++) {
                        if (invalidAddressState(fulfillmentInfo[i].fulfillmentContact)) {
                            fulfillmentInfo[i].fulfillmentContact.address.stateOrProvince = "n/a";
                            valid = true;
                        }
                    }
                } else {
                    if (invalidAddressState(fulfillmentInfo.fulfillmentContact)) {
                        fulfillmentInfo.fulfillmentContact.address.stateOrProvince = "n/a"
                        valid = true;
                    }
                }
                return valid;
            }

            if (hasInvalidAddressStates()) {
                return self.update({ fulfillmentInfo: fulfillmentInfo }).then(function () {
                    return self.getShippingMethods();
                });
            } else {
                return self.getShippingMethods();
            }

        },
        addCoupon: function (couponCode) {
            var self = this;
            return this.applyCoupon(couponCode).then(function (data) {
                self.fire('sync', data, self.data);
                return data;
            }, function (reason) {
                errors.throwOnObject(self, 'ADD_COUPON_FAILED', reason.message);
            });
        },
        addNewCustomer: function (newCustomerPayload) {
            var self = this;
            return self.api.action('customer', 'createStorefront', newCustomerPayload).then(function (customer) {
                return customer;
            }, function (reason) {
                errors.throwOnObject(self, 'ADD_CUSTOMER_FAILED', reason.message);
            });
        },
        createPayment: function (extraProps) {
            var self = this;

            return self.api.action(self, 'createPayment', utils.extend({
                currencyCode: self.api.context.Currency().toUpperCase(),
                amount: self.prop('amountRemainingForPayment'),
                newBillingInfo: self.prop('billingInfo')
            }, extraProps || {}));

        },
        addStoreCredit: function (payment) {
            return this.createPayment({
                amount: payment.amount,
                newBillingInfo: {
                    paymentType: 'StoreCredit',
                    storeCreditCode: payment.storeCreditCode,
                    storeCreditType: payment.storeCreditType,
                    customCreditType: payment.customCreditType,
                    billingContact: {
                        email: payment.email
                    }
                }
            });
        },
        addGiftCard: function (payment) {
            var self = this;
            var giftcard = this.api.createSync('creditcard', payment);
            return giftcard.save().then(function (giftcard) {
                return self.createPayment({
                    amount: payment.amountToApply,
                    newBillingInfo: {
                        paymentType: 'GiftCard',
                        card: giftcard.data
                    }
                });
            }, function (reason) {
                errors.throwOnObject(self, 'ADD_GIFT_CARD_FAILED', reason.message);
            });
        },
        addPayment: function (payment) {
            var billingInfo = payment || this.prop('billingInfo');
            if (!billingInfo) errors.throwOnObject(this, 'BILLING_INFO_MISSING');
            if (!billingInfo.paymentType || !(billingInfo.paymentType in PaymentStrategies)) errors.throwOnObject(this, 'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED');
            return PaymentStrategies[billingInfo.paymentType](this, billingInfo);
        },
        addPurchaseOrder: function (payment) {
            // add purchase checkout stuff as the 'extraProps' call.
            return this.createPayment({
                amount: payment.amount,
                newBillingInfo: {
                    paymentType: 'PurchaseOrder',
                    billingContact: payment.billingContact,
                    purchaseOrder: payment.purchaseOrder
                }
            });
        },
        getActivePayments: function () {
            var payments = this.prop('payments'),
                activePayments = [];
            if (payments && payments.length !== 0) {
                for (var i = payments.length - 1; i >= 0; i--) {
                    if (payments[i].status === CONSTANTS.PAYMENT_STATUSES.NEW)
                        activePayments.push(utils.clone(payments[i]))
                }
            }
            return activePayments;
        },
        getCurrentPayment: function () {
            var activePayments = this.getActivePayments();
            for (var i = activePayments.length - 1; i >= 0; i--) {
                if (activePayments[i].paymentType !== "StoreCredit" && activePayments[i].paymentType !== 'GiftCard') return activePayments[i];
            }
        },
        getActiveStoreCredits: function () {
            var activePayments = this.getActivePayments(),
                credits = [];
            for (var i = activePayments.length - 1; i >= 0; i--) {
                if (activePayments[i].paymentType === "StoreCredit") credits.unshift(activePayments[i]);
            }
            return credits;
        },
        getActiveGiftCards: function () {
            //TODO : make sure this works 
            var activePayments = this.getActivePayments(),
                giftCards = [];
            for (var i = activePayments.length - 1; i >= 0; i--) {
                if (activePayments[i].paymentType === "GiftCard") giftCards.unshift(activePayments[i]);
            }
            return giftCards;
        },
        voidPayment: function (id) {
            var obj = this;
            return this.performPaymentAction({
                paymentId: id,
                actionName: CONSTANTS.PAYMENT_ACTIONS.VOID
            }).then(function (rawJSON) {
                if (rawJSON || rawJSON === 0 || rawJSON === false) {
                    delete rawJSON.billingInfo;
                    obj.data = utils.clone(rawJSON);
                }
                delete obj.unsynced;
                obj.fire('sync', rawJSON, obj.data);
                obj.api.fire('sync', obj, rawJSON, obj.data);
                return obj;
            });
        },
        checkout: function () {
            var self = this,
                availableActions = this.prop('availableActions');
            if (!this.isComplete()) {
                for (var i = availableActions.length - 1; i >= 0; i--) {
                    if (availableActions[i] in checkoutStatus2IsReady) return this.performCheckoutAction(availableActions[i]).otherwise(function (e) {
                        return self.get().ensure(function () {
                            throw e;
                        });
                    });
                }
            }
            errors.throwOnObject(this, 'CHECKOUT_CANNOT_SUBMIT');
        },
        isComplete: function () {
            return !!checkoutStatus2IsComplete[this.prop('status')];
        },

    };
}());