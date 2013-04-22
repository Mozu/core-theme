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
            },
            updateEmail: function () {
                var me = this, newEmail = this.EmailAddress();
                this.update({
                    EmailAddress: newEmail
                }).then(function () {
                    me.oldEmail = newEmail;
                    me.publish('emailupdated');
                });
            },
            revertEmail: function () {
                this.EmailAddress(this.oldEmail);
            }
        }, function constructCustomer(obj) {
            this.oldEmail = obj.EmailAddress;
        });

        return {
            Customer: Customer
        }
    }
);
