ApiObject.types.customer = (function () {
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
            return this.deleteCard(id).then(function () {
                return self.api.del('creditcard', id);
            });
        }
    }
}());