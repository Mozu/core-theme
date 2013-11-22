define(['modules/backbone-mozu', 'modules/models-address', 'modules/models-user', 'modules/models-orders', 'modules/models-paymentmethods', 'modules/models-product', 'hyprlive'], function (Backbone, AddressModels, UserModels, OrderModels, PaymentMethods, ProductModels, Hypr) {

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
        toJSON: function() {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!j.types || j.types.length === 0) {
                j.types = [
                    {
                        name: "Billing"
                    }
                ]
            }
            return j;
        },
        isPrimaryShippingContact: function () {
            return !!_.findWhere(this.get('types'), { isPrimary: true, name: "Shipping" });
        },
        isPrimaryBillingContact: function () {
            return !!_.findWhere(this.get('types'), { isPrimary: true, name: "Billing" });
        }
    }),

    WishlistItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        }
    }),

    Wishlist = Backbone.MozuModel.extend({
        mozuType: 'wishlist',
        helpers: ['hasItems'],
        hasItems: function() {
            return this.get('items').length > 0;
        },
        relations: {
            items: Backbone.Collection.extend({
                model: WishlistItem
            })
        },
        addItemToCart: function(id) {
            return this.apiAddItemToCartById(id).then(function (item) {
                self.trigger('addedtocart', item, id);
                return item;
            });
        }
    }),
    Customer = Backbone.MozuModel.extend({
        mozuType: 'customer',
        helpers: ['hasSavedCards', 'hasSavedContacts'],
        hasSavedCards: function() {
            var cards = this.get('cards');
            return cards && cards.length > 0;
        },
        hasSavedContacts: function() {
            var contacts = this.get('contacts');
            return contacts && contacts.length > 0;
        },
        handlesMessages: true,
        relations: {
            user: UserModels.User,
            contacts: Backbone.Collection.extend({
                model: CustomerContact
            }),
            cards: Backbone.Collection.extend({
                model: PaymentMethods.CreditCard
            }),
            wishlist: Wishlist,
            editingCard: PaymentMethods.CreditCard,
            editingContact: CustomerContact,
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
            var user = this.get('user'),
                primaryBillingContact = this.getPrimaryBillingContact(),
                contactFirst = primaryBillingContact.get('firstName'),
                contactLast = primaryBillingContact.get('lastNameOrSurname'),
                op = primaryBillingContact.apiUpdate();

            // TODO: When UpdateUser works do this
            //if ((contactFirst !== user.get('firstName')) || contactLast !== user.get('lastName')) {
            //    op = op.then(function () {
            //        return user.apiUpdate({
            //            firstName: contactFirst,
            //            lastName: contactLast
            //        });
            //    });
            //}

            return op.ensure(function () {
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
                this.set('editingCard', toEdit, { useExistingInstances: true });
        },
        addCard: function () {
            var self = this;
            return this.apiModel.addPaymentCard(this.get('editingCard').toJSON()).then(function () {
                return self.getCards();
            }).then(function () {
                return self.unset('editingCard');
            });
        },
        deleteCard: function (id) {
            var self = this;
            return this.apiModel.deletePaymentCard(id).then(function () {
                return self.getCards();
            });
        },
        getCards: function () {
            var self = this;
            var cardsCollection = this.get('cards');
            this.syncApiModel();
            return this.apiModel.getCards().then(function (cc) {
                cardsCollection.set(cc.data.items);
                return self;
            });
        },
        beginEditContact: function (id) {
            var toEdit = this.get('contacts').get(id);
            if (toEdit)
                this.set('editingContact', toEdit, { useExistingInstances: true });
        },
        addContact: function () {
            var self = this;
            return this.apiModel.addContact(this.get('editingContact').toJSON()).then(function () {
                return self.getContacts();
            }).then(function () {
                return self.unset('editingContact');
            });
        },
        deleteContact: function (id) {
            var self = this;
            return this.apiModel.deleteContact(id).then(function () {
                return self.getContacts();
            });
        },
        getContacts: function () {
            var self = this;
            var contactsCollection = this.get('contacts');
            this.syncApiModel();
            return this.apiModel.getContacts().then(function (cc) {
                contactsCollection.set(cc.data.items);
                return self;
            });
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer
    };
});