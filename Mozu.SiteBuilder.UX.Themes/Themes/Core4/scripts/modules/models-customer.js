define(['modules/backbone-mozu', 'modules/models-address', 'modules/models-user', 'hyprlive'], function (Backbone, AddressModels, UserModels, Hypr) {

    var CustomerContact = Backbone.MozuModel.extend({
        mozuType: 'contact',
        relations: {
            address: AddressModels.StreetAddress,
            phoneNumbers: AddressModels.PhoneNumbers,
        },
        validation: {
            firstName: {
                required: true,
                msg: Hypr.getLabel('firstNameMissing')
            },
            lastNameOrSurname: {
                required: true,
                msg: Hypr.getLabel('lastNameMissing')
            }
        },
        isPrimaryShippingContact: function () {
            return !!_.findWhere(this.get('types'), { isPrimary: true, name: "Shipping" });
        },
        isPrimaryBillingContact: function () {
            return !!_.findWhere(this.get('types'), { isPrimary: true, name: "Billing" });
        }
    }),

    Customer = Backbone.MozuModel.extend({
        mozuType: 'customer',
        relations: {
            user: UserModels.User,
            contacts: Backbone.Collection.extend({
                model: CustomerContact
            }),
            primaryBillingContact: CustomerContact
        },
        validation: {
            'user.password': {
                fn: function(value) {
                    if (this.validateUser && !value) return Hypr.getLabel('passwordMissing')
                }
            },
            'user.confirmPassword': {
                fn: function(value) {
                    if (this.validateUser && value !== this.get('user').get('password')) return Hypr.getLabel('passwordsDoNotMatch')
                }
            },
        },
        initialize: function() {
            var primaryBillingContact = this.getPrimaryBillingContact();
            if (primaryBillingContact && primaryBillingContact instanceof CustomerContact) this.set('primaryBillingContact', primaryBillingContact, { useExistingInstances: true });
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) delete j.primaryBillingContact;
            return j;
        },
        getPrimaryBillingContact: function () {
            var contacts = this.get('contacts'),
                pbc = contacts.find(function (c) {
                    return c.isPrimaryBillingContact();
                });
            return pbc || contacts.first();
        },
        savePrimaryBillingContact: function () {
            var self = this;
            this.isLoading(true);
            return this.get('primaryBillingContact').apiUpdate().ensure(function () {
                self.isLoading(false);
            });
        },
        changePassword: function () {
            var self = this, user = this.get('user');
            self.validateUser = true;
            if (this.validate('user.password') || this.validate('user.confirmPassword')) return false;
            this.isLoading(true);
            return user.changePassword().ensure(function () {
                self.validateUser = false;
                self.isLoading(false);
            });
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer
    };
});