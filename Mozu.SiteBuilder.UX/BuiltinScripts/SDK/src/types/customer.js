ApiObject.types.customer = (function () {
    return {
        addPaymentCard: function (unmaskedCardData) {
            var self = this, card = this.api.createSync('creditcard', unmaskedCardData);
            return card.save().then(function (card) {
                var payload = utils.clone(card.data);
                payload.cardNumberPart = payload.cardNumber;
                delete payload.cardNumber;
                return self.addCard(payload);
            });
        }
    }
}());