define(
    ["modules/jquery-plus", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-customer", "modules/models-user"],
    function ($, ko, ViewModelPrototype, CustomerModels, UserModels) {

        var MyAccount = ViewModelPrototype.extend({
            hasMessages: true,
            submodels: {
                User: UserModels.User,
                Customer: CustomerModels.Customer
            },
            changeEmail: function () {
                this.publish("changeemail");
            }
        }, function constructMyAccount() {
            
        });
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
            AccountModel: MyAccount
        }
    }
);
