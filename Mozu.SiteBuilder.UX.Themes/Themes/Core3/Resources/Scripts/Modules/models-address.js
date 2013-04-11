define(
    ["modules/knockout-plus", "modules/knockout-viewmodel", "modules/api", "i18n!nls/messages"],
    function (ko, ViewModelPrototype, api, msg) {

        var PhoneNumbers = ViewModelPrototype.extend({
            observables: {
                Home: {},
                Work: {},
                Mobile: {},
                Fax: {}
            }
        });

        // TODO: write a real KO binding for AddressSchemas, once the data is better
        var AddressSchemesPromise = api.get('addressschemas').then(function (r) {
            var items = r.data.Items,
                statesByCountry = {};
            $.each(items, function (ix, item) {
                var states;
                $.each(item.Fields, function (ix, field) {
                    if (field.Label === "State") {
                        states = field.Data;
                        return false;
                    }
                });
                statesByCountry[item.CountryCode] = {
                    stateprovLabel: 'State',
                    stateprovList: states
                };
            });
            return {
                statesByCountry: statesByCountry,
                countries: items
            };
        });

        var addressConf = {
            observables: {
                "Address1": { required: msg.StreetMissing },
                "Address2": {},
                "Address3": {},
                "Address4": {},
                "CityOrTown": { required: msg.CityMissing },
                "StateOrProvince": {
                    required: {
                        message: msg.StateProvMissing,
                        invalidateOnChange: false
                    }
                },
                "PostalOrZipCode": { required: msg.PostalCodeMissing },
                "CountryCode": {
                    required: {
                        message: msg.CountryMissing,
                        invalidateOnChange: false
                    }
                }
            },
            autofillState: function (afs) {
                var self = this;
                this.StateOrProvince(afs);
                if (this.StateOrProvince() !== afs) {
                    // doesn't fit into the dictionary, let's try to get it by key
                    $.each(this.stateprovList(), function (i, state) {
                        if (afs === state.Value) {
                            self.StateOrProvince(state.Code);
                            return false;
                        }
                    });
                }
            }
        };

        var constructAddress = function (conf) {
            var self = this,
                AddressSchemes = false;

            this.autofilledState = ko.observable();

            this.stateprovLabel = ko.computed(function () {
                var countryCode = self.CountryCode();
                if (AddressSchemes && AddressSchemes[countryCode]) {
                    return AddressSchemes[countryCode].stateprovLabel;
                }
                return "";
            });
            this.stateprovList = ko.computed(function () {
                var countryCode = self.CountryCode();
                if (AddressSchemes && AddressSchemes[countryCode]) {
                    return AddressSchemes[countryCode].stateprovList;
                }
                return [];
            });

            self.autofilledState.subscribe(function (newValue) {
                if (!self.StateOrProvince()) self.autofillState(newValue);
            });

            self.countryList = ko.observableArray();
            // to prepopulate
            var countryCode = self.CountryCode(),
                stateOrProv = self.StateOrProvince();

            AddressSchemesPromise.then(function (r) {
                AddressSchemes = r.statesByCountry;
                self.countryList(r.countries);
                self.CountryCode(countryCode);
                self.StateOrProvince(stateOrProv);
            });
        };

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: ViewModelPrototype.extend(addressConf, constructAddress),
            addressConf: addressConf,
            constructAddress: constructAddress
        };
    });
