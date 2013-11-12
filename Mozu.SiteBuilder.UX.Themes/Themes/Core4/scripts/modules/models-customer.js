define(['modules/backbone-mozu', 'modules/models-address', 'modules/models-user', 'modules/models-orders', 'modules/models-paymentmethods', 'hyprlive'], function (Backbone, AddressModels, UserModels, OrderModels, PaymentMethods, Hypr) {

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
        handlesMessages: true,
        relations: {
            user: UserModels.User,
            contacts: Backbone.Collection.extend({
                model: CustomerContact
            }),
            cards: Backbone.Collection.extend({
                model: PaymentMethods.CreditCard
            }),
            editingCard: PaymentMethods.CreditCard, 
            orderHistory: OrderModels.OrderCollection,
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
            if (this.validate()) return false;
            this.isLoading(true);
            return user.changePassword().ensure(function () {
                self.validateUser = false;
                self.isLoading(false);
            });
        },
        beginEditCard: function(id) {
            var toEdit = this.get('cards').get(id);
            if (toEdit)
                this.set('editingCard', toEdit);
        },
        addCard: function () {
            var self = this;
            return this.apiModel.addPaymentCard(this.get('editingCard').toJSON()).then(function () {
                return self.getCards();
            }).then(function () {
                return self.unset('editingCard');
            });
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer
    };
});