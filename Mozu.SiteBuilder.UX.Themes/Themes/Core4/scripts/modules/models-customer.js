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
        initialize: function() {
            var primaryBillingContact = this.getPrimaryBillingContact();
            if (primaryBillingContact && primaryBillingContact instanceof Backbone.Model) this.set('primaryBillingContact', primaryBillingContact.toJSON());
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
        fetch: function () {
            var self = this, user = this.get('user');
            return user.apiModel.action('getCustomers').then(function (customers) {
                self.apiModel.prop(customers[0].data);
                self.apiModel.fire('sync', customers[0].data, customers[0].data);
                return self.apiModel;
            });
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer
    };
});