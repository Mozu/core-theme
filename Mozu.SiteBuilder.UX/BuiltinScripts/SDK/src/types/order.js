ApiObject.types.order = (function() {

    errors.register({
        'BILLING_INFO_MISSING': 'Billing info missing.',
        'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED': 'Payment type missing or unrecognized.',
        'PAYMENT_MISSING': 'Expected a payment to exist on this order and one did not.',
        'PAYPAL_TRANSACTION_ID_MISSING': 'Expected the active payment to include a paymentServiceTransactionId and it did not.',
        'SUBMIT_ACTION_NOT_AVAILABLE': 'Order cannot be submitted because Submit action is not present. Is order complete?'
    });

    var OrderStatus2IsComplete = {};
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.SUBMITTED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.ACCEPTED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.PENDING_REVIEW] = true;

    var OrderStatus2IsReady = {};
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.SUBMIT_ORDER] = true;


    var PaymentStrategies = {
        "PaypalExpress": function (order, billingInfo) {
            return order.createPayment({
                returnUrl: billingInfo.paypalReturnUrl,
                cancelUrl: billingInfo.paypalCancelUrl
            }).ensure(function () {
                var payment = order.getActivePayment();
                if (!payment) errors.throwOnObject(order, 'PAYMENT_MISSING');
                if (!payment.paymentServiceTransactionId) errors.throwOnObject(order, 'PAYPAL_TRANSACTION_ID_MISSING');
                window.location = utils.formatString(CONSTANTS.BASE_PAYPAL_URL, payment.paymentServiceTransactionId);
            });
        },
        "CreditCard": function (order, billingInfo) {
            var card = order.api.createSync('creditcard', billingInfo.card);
            errors.passFrom(card, this);
            return card.save().then(function(card) {
                billingInfo.card = card.getOrderData();
                order.prop('billingInfo', billingInfo);
                return order.createPayment();
            });
        },
        "Check": function (order, billingInfo) {
            return order.createPayment();
        }
    };
    
    return {
        addCoupon: function(couponCode) {
            var self = this;
            return this.applyCoupon(couponCode).then(function () {
                return self.get();
            });
        },
        addNewCustomer: function (newCustomerPayload) {
            var self = this;
            return self.api.action('customer', 'createStorefront', newCustomerPayload).then(function (customer) {
                return self.setUserId();
            });
        },
        createPayment: function(extraProps) {
            return this.api.action(this, 'createPayment', utils.extend({
                currencyCode: this.api.context.Currency().toUpperCase(),
                amount: this.prop('total'),
                newBillingInfo: this.prop('billingInfo')
            }, extraProps || {}));
        },
        addPayment: function (payment) {
            var billingInfo = this.prop('billingInfo');
            if (!billingInfo) errors.throwOnObject(this, 'BILLING_INFO_MISSING');
            if (!billingInfo.paymentType || !(billingInfo.paymentType in PaymentStrategies)) errors.throwOnObject(this, 'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED');
            return PaymentStrategies[billingInfo.paymentType](this, billingInfo);
        },
        getActivePayment: function() {
            var payments = this.prop('payments');
            if (payments.length === 0) return null;
            for (var i = payments.length -1; i >= 0; i--) {
                if (payments[i].status === CONSTANTS.PAYMENT_STATUSES.NEW)
                    return payments[i];
            }
        },
        isReadyForSubmit: function() {
            var availableActions = this.prop('availableActions');
            for (var i = availableActions.length - 1; i >= 0; i--) {
                if (availableActions[i] in OrderStatus2IsReady) return true;
            }
            return false;
        },
        isComplete: function () {
            return !!OrderStatus2IsComplete[this.prop('status')];
        },
        submitOrder: function () {
            return this.performOrderAction(CONSTANTS.ORDER_ACTIONS.SUBMIT_ORDER);
        },
        checkout: function () {
            if (!this.isReadyForSubmit()) {
                errors.throwOnObject(this, 'SUBMIT_ACTION_NOT_AVAILABLE');
            }
            return this.isComplete() || this.submitOrder();
        }
        
    };
}());