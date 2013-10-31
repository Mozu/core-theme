define(
    ["modules/backbone-mozu"],
    function (Backbone) {

        var PhoneNumbers = Backbone.MozuModel.extend({
            validation: {
                home: {
                    required: true,
                    msg: require.mozuLabel("phoneMissing")
                }
            }
        }),

        StreetAddress = Backbone.MozuModel.extend({
            validation: {
                address1: {
                    required: true,
                    msg: require.mozuLabel("streetMissing")
                },
                cityOrTown: {
                    required: true,
                    msg: require.mozuLabel("cityMissing")
                },
                countryCode: {
                    required: true,
                    msg: require.mozuLabel("countryMissing")
                },
                postalOrZipCode: {
                    required: true,
                    msg: require.mozuLabel("postalCodeMissing")
                }
            }
        });

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: StreetAddress
        };
    });
