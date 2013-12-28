define(
    ["modules/backbone-mozu", 'hyprlive'],
    function (Backbone, Hypr) {

        var PhoneNumbers = Backbone.MozuModel.extend({
            validation: {
                home: {
                    required: true,
                    msg: Hypr.getLabel("phoneMissing")
                }
            }
        }),

        StreetAddress = Backbone.MozuModel.extend({
            mozuType: 'address',
            validation: {
                address1: {
                    required: true,
                    msg: Hypr.getLabel("streetMissing")
                },
                cityOrTown: {
                    required: true,
                    msg: Hypr.getLabel("cityMissing")
                },
                countryCode: {
                    required: true,
                    msg: Hypr.getLabel("countryMissing")
                },
                postalOrZipCode: {
                    required: true,
                    msg: Hypr.getLabel("postalCodeMissing")
                }
            },
            defaults: {
                candidateValidatedAddresses: null
            }
        });

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: StreetAddress
        };
    });
