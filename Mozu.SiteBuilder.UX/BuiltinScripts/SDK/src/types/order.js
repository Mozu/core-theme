ApiObject.types.order = utils.inherit(ApiObject, (function() {

    errors.register({
        'BILLING_INFO_MISSING': 'Billing info missing.',
        'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED': 'Payment type missing or unrecognized.',
        'PAYMENT_MISSING': 'Expected a payment to exist on this order and one did not.',
        'PAYPAL_TRANSACTION_ID_MISSING': 'Expected the active payment to include a paymentServiceTransactionId and it did not.'
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
            return card.save().then(function(card) {
                billingInfo.card = card.data;
                order.prop('billingInfo', billingInfo);
                return order.createPayment();
            });
        },
        "Check": function (order, billingInfo) {
            return order.createPayment();
        }
    };
    
    return {
        addNewUser: function (login) {
            var self = this;
            return self.api.create('user', login).then(function (user) {
                return user.action('login', { emailAddress: user.prop('emailAddress'), password: user.prop('password') });
            }).then(function () {
                return self.action('setUserId');
            });
        },
        createPayment: function(extraProps) {
            return this.action('createPayment', utils.extend({
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
            return OrderStatus2IsComplete[this.prop('status')];
        },
        submitOrder: function () {
            return this.action('performOrderAction', CONSTANTS.ORDER_ACTIONS.SUBMIT_ORDER);
        }
        
    };
}()));