ApiObject.types.creditcard = utils.inherit(ApiObject, (function() {

    var ERRORS = {
        CARD_TYPE_MISSING: {
            code: 'PCI_CARD_TYPE_MISSING',
            message: 'Card type missing.'
        },
        CARD_NUMBER_MISSING: {
            code: 'PCI_CARD_NUMBER_MISSING',
            message: 'Card number missing.'
        },
        CVV_MISSING: {
            code: 'PCI_CVV_MISSING',
            message: 'Card security code missing.'
        },
        CARD_NUMBER_UNRECOGNIZED: {
            code: 'PCI_CARD_NUMBER_UNRECOGNIZED',
            message: 'Card number is in an unrecognized format.'
        },
        MASK_PATTERN_INVALID: {
            code: 'PCI_MASK_PATTERN_INVALID',
            message: 'Supplied mask pattern did not match a valid card number.'
        }
    };

    var charsInCardNumberRE = /[\s-]/g;

    function fail(obj, error) {
        obj.fire('error', error);
        obj.api.fire('error', error, obj);
        throw new Error(error.message);
    }

    function validateCardNumber(obj, cardNumber) {
        var maskCharacter = obj.maskCharacter;
        if (!cardNumber) return false;
        if (cardNumber.indexOf(maskCharacter) !== -1) {
            // bugfix 9/30/2011: unknown issue causes card number to be sent as all mask characters.
            return cardNumber.match(new RegExp('[^' + maskCharacter + '\\d]')) || !cardNumber.match(/\d/);
        }
        return luhn10(cardNumber);
    }

    function luhn10(s) {
        // luhn 10 algorithm for card numbers
        var i, n, c, r, t;
        r = "";
        for (i = 0; i < s.length; i++) {
            c = parseInt(s.charAt(i), 10);
            if (c >= 0 && c <= 9) r = c + r;
        }
        if (r.length <= 1) return false;
        t = "";
        for (i = 0; i < r.length; i++) {
            c = parseInt(r.charAt(i), 10);
            if (i % 2 != 0) c *= 2;
            t = t + c;
        }
        n = 0;
        for (i = 0; i < t.length; i++) {
            c = parseInt(t.charAt(i), 10);
            n = n + c;
        }
        return (n != 0 && n % 10 == 0);
    }

    function createCardNumberMask(obj, cardNumber) {
        var maskRE = new RegExp(obj.maskPattern),
            matches = cardNumber.match(maskRE),
            toDisplay = cardNumber,
            toSend = [],
            maskCharacter = obj.maskCharacter,
            tempMask = "";

        if (!matches) fail(obj, ERRORS.MASK_PATTERN_INVALID);
        for (var i = 1; i < matches.length; i++) {
            tempMask = "";
            for (var j = 0; j < matches[i].length; j++) {
                tempMask += maskCharacter;
            }
            toDisplay = toDisplay.replace(matches[i], tempMask);
        }
        for (i = toDisplay.length - 1; i >= 0; i--) {
            toSend.unshift(toDisplay.charAt(i) === maskCharacter ? cardNumber.charAt(i) : maskCharacter);
        }
        obj.maskedCardNumber = toDisplay;
        return toSend.join('');
    }

    function makePayload(obj) {
        var data = obj.data, maskCharacter = obj.maskCharacter, maskedData;
        if (!data.paymentOrCardType) fail(obj, ERRORS.CARD_TYPE_MISSING);
        if (!data.cardNumberPartOrMask) fail(obj, ERRORS.CARD_NUMBER_MISSING);
        if (!data.cvv) fail(obj, ERRORS.CVV_MISSING);
        maskedData = transform.toCardData(data)
        var cardNumber = maskedData.cardNumber.replace(charsInCardNumberRE, '');
        if (!validateCardNumber(obj, cardNumber)) fail(obj, ERRORS.CARD_NUMBER_UNRECOGNIZED);

        // only add numberPart if the current card number isn't already masked
        if (cardNumber.indexOf(maskCharacter) === -1) maskedData.numberPart = createCardNumberMask(obj, cardNumber);
        delete maskedData.cardNumber;

        return maskedData;
    }


    var transform = {
        fields: {
            "cardNumber": "cardNumberPartOrMask",
            "persistCard": "isCardInfoSaved",
            "cardholderName": "nameOnCard",
            "cardType": "paymentOrCardType",
            "cardId": "cardId",
            "cvv": "cvv"
        },
        toStorefrontData: function (data) {
            var storefrontData = {};
            for (var serviceField in this.fields) {
                if (serviceField in data) storefrontData[this.fields[serviceField]] = data[serviceField];
            }
            return storefrontData;
        },
        toCardData: function (data) {
            var cardData = {};
            for (var serviceField in this.fields) {
                if (this.fields[serviceField] in data) cardData[serviceField] = data[this.fields[serviceField]]
            }
            return cardData;
        }
    };
    

    return {
        maskCharacter: "*",
        maskPattern: "^(\\d+?)\\d{4}$",
        save: function () {
            var self = this,
                isUpdate = !!this.prop('cardId');
            return this.action(isUpdate ? 'update' : 'save', makePayload(this)).then(function (res) {
                self.prop(transform.toStorefrontData(isUpdate ? res : {
                    cardNumber: self.maskedCardNumber,
                    cvv: self.prop('cvv').replace(/\d/g, self.maskCharacter),
                    cardId: res
                }));
                self.fire('sync', utils.clone(self.data), self.data);
                return self;
            });
        }
    };

}()));