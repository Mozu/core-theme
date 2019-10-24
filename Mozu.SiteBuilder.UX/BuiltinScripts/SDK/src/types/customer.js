var utils = require('../utils');
var errors = require('../errors');
module.exports = (function () {
    return {
        postconstruct: function() {
            var self = this;
            this.on('sync', function (json) {
                if (json && json.authTicket && json.authTicket.accessToken) {
                    self.api.context.UserClaims(json.authTicket.accessToken);
                    self.api.fire('login', json.authTicket);
                }
            });
        },
        savePaymentCard: function (unmaskedCardData) {
            var self = this, card = this.api.createSync('creditcard', unmaskedCardData),
                isUpdate = !!(unmaskedCardData.paymentServiceCardId || unmaskedCardData.id);
            errors.passFrom(card, this);
            return card.save().then(function (card) {
                var payload = utils.clone(card.data);
                payload.cardNumberPart = payload.cardNumberPartOrMask || payload.cardNumber;
                payload.id = payload.paymentServiceCardId;
                delete payload.cardNumber;
                delete payload.cardNumberPartOrMask;
                delete payload.paymentServiceCardId;
                return isUpdate ? self.updateCard(payload) : self.addCard(payload);
            });
        },
        deletePaymentCard: function (id) {
            var self = this;
            return this.deleteCard(id).then(function() {
                // TODO: until paymentservice enables a DELETE tunnelling handler
                // we'll just leave these cards orphaned
                //return self.api.del('creditcard', id);
            });
        },
        getStoreCredits: function() {
            var credits = this.api.createSync('storecredits');
            errors.passFrom(credits, this);
            return credits.get();
        },
        getPurchaseOrderTransactions: function () {
            var self = this;
            return this.api.action(this, 'getPurchaseOrderTransactions', { accountId: this.data.id }).then(function (response) {
                return response.data;
            }, function (error) {
                console.log(error)
            });
        },
        getDigitalCredit: function (id) {
            var credit = this.api.createSync('storecredit', { code: id });
            errors.passFrom(credit, this);
            return credit.getCredit();
        },
        addStoreCredit: function (id) {
            var credit = this.api.createSync('storecredit', { code: id });
            errors.passFrom(credit, this);
            return credit.associateToShopper();
        },
        getReturnLabel: function (data) {
            return this.api.action('rma', 'getReturnLabel', { 'returnId': data.returnId, 'packageId': data.packageId, 'returnAsBase64Png': true }).then(function (label) {
                return label;
            }, function (reason) {
                errors.throwOnObject(self, 'GET_RETURN_LABEL_FAILED', reason.message);
            });
        },
        getFulfillmentReturnLabel: function (data) {
            return this.api.action('rma', 'getFulfillmentReturnLabel', { 'returnId': data.returnId}).then(function (label) {
                return label;
            }, function (reason) {
                errors.throwOnObject(self, 'GET_RETURN_LABEL_FAILED', reason.message);
            });
        }
    }
}());