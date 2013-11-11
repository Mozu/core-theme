ApiObject.types.order = utils.inherit(ApiObject, (function() {
    
    errors.register({
        'BILLING_INFO_MISSING': 'Billing info missing.',
        'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED': 'Payment type missing or unrecognized.'
    });

    var PaymentStrategies = {
        "PaypalExpress": function (order, billingInfo) {
            return order.createPayment('SetupPaypal').ensure(function (deets) {
                console.log(deets);
            });
        },
        "CreditCard": function (order, billingInfo) {
            var card = order.api.createSync('creditcard', billingInfo.card);
            return card.save().then(function(card) {
                billingInfo.card = card.data;
                order.prop('billingInfo', billingInfo);
                return order.createPayment('CreatePayment');
            });
        },
        "Check": function (order, billingInfo) {
            return order.createPayment('RequestCheck');
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
        createPayment: function(actionName) {
            return this.action('createPayment', {
                actionName: actionName,
                currencyCode: this.api.context.Currency(),
                amount: this.prop('total'),
                newBillingInfo: this.prop('billingInfo')
            });
        },
        addPayment: function (payment) {
            var billingInfo = this.prop('billingInfo');
            if (!billingInfo) errors.throwOnObject(this, 'BILLING_INFO_MISSING');
            if (!billingInfo.paymentType || !(billingInfo.paymentType in PaymentStrategies)) errors.throwOnObject(this, 'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED');
            return PaymentStrategies[billingInfo.paymentType](this, billingInfo);
        }
    };
}()));