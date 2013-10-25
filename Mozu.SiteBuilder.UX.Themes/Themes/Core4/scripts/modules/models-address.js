define(
    ["modules/backbone-mozu"],
    function (Backbone) {

        var PhoneNumbers = Backbone.MozuModel.extend({
            validation: {
                Home: {
                    required: true,
                    msg: require.mozuLabel("phoneMissing")
                }
            }
        }),

        StreetAddress = Backbone.MozuModel.extend({
            validation: {
                Address1: {
                    required: true,
                    msg: require.mozuLabel("streetMissing")
                },
                CityOrTown: {
                    required: true,
                    msg: require.mozuLabel("cityMissing")
                },
                CountryCode: {
                    required: true,
                    msg: require.mozuLabel("countryMissing")
                },
                PostalOrZipCode: {
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
