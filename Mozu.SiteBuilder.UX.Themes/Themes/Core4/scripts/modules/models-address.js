define(
    ["modules/backbone-mozu", "i18n!nls/messages"],
    function (Backbone, messages) {

        var PhoneNumbers = Backbone.MozuModel.extend({
            validation: {
                Home: {
                    required: true,
                    msg: messages.PhoneMissing
                }
            }
        }),

        StreetAddress = Backbone.MozuModel.extend({
            validation: {
                Address1: {
                    required: true,
                    msg: messages.StreetMissing
                },
                CityOrTown: {
                    required: true,
                    msg: messages.CityMissing
                },
                CountryCode: {
                    required: true,
                    msg: messages.CountryMissing
                },
                PostalOrZipCode: {
                    required: true,
                    msg: messages.PostalCodeMissing
                }
            }
        });

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: StreetAddress
        };
    });
