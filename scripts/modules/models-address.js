define(
    ["modules/backbone-mozu", 'hyprlive'],
    function (Backbone, Hypr) {


        var defaultStateProv = "n/a";

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
            initialize: function () {
                this.on('change:countryCode', this.clearStateAndZipWhenCountryChanges, this);
            },
            clearStateAndZipWhenCountryChanges: function () {
                this.unset('postalOrZipCode');
                this.unset('stateOrProvince');
            },
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
                stateOrProvince: {
                    required: true,
                    msg: Hypr.getLabel("stateProvMissing")
                },
                postalOrZipCode: {
                    required: true,
                    msg: Hypr.getLabel("postalCodeMissing")
                }
            },
            defaults: {
                candidateValidatedAddresses: null,
                countryCode: Hypr.getThemeSetting('preselectCountryCode') || '',
                addressType: 'Residential'
            },
            toJSON: function (options) {
                // workaround for SA
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if ((!options || !options.helpers) && !j.stateOrProvince) {
                    j.stateOrProvince = "n/a";
                }
                if (options && options.helpers && j.stateOrProvince === "n/a") {
                    delete j.stateOrProvince;
                }
                return j;
            }
        });

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: StreetAddress
        };
    });
