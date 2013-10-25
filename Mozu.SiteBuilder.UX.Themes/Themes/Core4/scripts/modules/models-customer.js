define(
    ["modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-address"],
    function (ko, ViewModelPrototype, AddressModels) {

        //var Contact = ViewModelPrototype.extend({
        //    observables: {
        //        IsPrimary: {}
        //    },
        //    submodels: {
        //        Address: AddressModels.StreetAddress,
        //        PhoneNumbers: AddressModels.PhoneNumbers
        //    }
        //});

        //var Customer = ViewModelPrototype.extend({
        //    mozuType: 'customer',
        //    statics: {
        //        Id: ""
        //    },
        //    observableArrays: {
        //        "Groups": [],
        //        "Notes": [],
        //    },
        //    observables: {
        //        "OrderSummary": {},
        //        "EmailAddress": {
        //            required: {
        //                pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
        //            }
        //        },
        //        "LocaleCode": {},
        //        "Password": {
        //            required: true
        //        },
        //        "Id": {},
        //        "primaryBillingContact": {}
        //    },
        //    submodelArrays: {
        //        "Contacts": Contact
        //    },
        //    updateEmail: function () {
        //        var me = this, newEmail = this.EmailAddress();
        //        this.update({
        //            EmailAddress: newEmail
        //        }).then(function () {
        //            me.oldEmail = newEmail;
        //            me.publish('emailupdated');
        //        });
        //    },
        //    revertEmail: function () {
        //        this.EmailAddress(this.oldEmail);
        //    }
        //}, function constructCustomer(obj) {
        //    var self = this;

        //    this.oldEmail = obj.EmailAddress;

        //    this.primaryBillingContact = ko.computed(function () {
        //        return ko.utils.arrayFirst(self.Contacts(), function (c) {
        //            return c.IsPrimary();
        //        });
        //    });

        //});

        //return {
        //    Customer: Customer
        //}
    }
);
