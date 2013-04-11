define(
    ["modules/knockout-viewmodel"],
    function (ViewModelPrototype) {

        var Customer = ViewModelPrototype.extend({
            mozuType: 'customer',
            statics: {
                Id: ""
            },
            observableArrays: {
                "Contacts": [],
                "Groups": [],
                "Notes": [],
            },
            observables: {
                "OrderSummary": {},
                "EmailAddress": {
                    required: {
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
                    }
                },
                "LocaleCode": {},
                "FirstName": {},
                "LastName": {},
                "Password": {
                    required: true
                },
                "Id": {}
            }
        });

        return {
            Customer: Customer
        }
    }
);
