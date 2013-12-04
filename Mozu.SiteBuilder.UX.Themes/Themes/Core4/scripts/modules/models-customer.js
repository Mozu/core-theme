define(['modules/backbone-mozu', 'shim!vendor/underscore>_', 'modules/models-address', 'modules/models-user', 'modules/models-orders', 'modules/models-paymentmethods', 'modules/models-product', 'hyprlive'], function (Backbone, _, AddressModels, UserModels, OrderModels, PaymentMethods, ProductModels, Hypr) {


    var contactTypes = ["Billing", "Shipping"],
        contactTypeListeners = {};
    _.each(contactTypes, function(contactType) {
        contactTypeListeners['change:is'+contactType+'Contact'] = function(model, yes) {
            // cheap copy to avoid accidental persistence
            var types = this.get('types');
            types = types ? JSON.parse(JSON.stringify(types)) : [];
            var newType = { name: contactType },
                isAlready = _.findWhere(types, newType);
            if (yes && !isAlready) {
                types.push(newType);
                this.set('types', types, { silent: true })
            }
            if (!yes && isAlready) {
                this.set('types', _.without(types, isAlready), { silent: true});
            }
        };
        contactTypeListeners['change:isPrimary'+contactType+'Contact'] = function(model, yes) {
            var types = this.get('types'),
                typeConf = { name: contactType },
                type = _.findWhere(types, typeConf);
            if (type) {
                type.isPrimary = yes;
                this.set('types', types, { silent: true })
            }
        }
    });


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

        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) {
                _.each(contactTypes, function(contactType) {
                    delete j['is'+contactType+'Contact'];
                    delete j['isPrimary'+contactType+'Contact'];
                });
            }
            return j;
        },
        save: function() {
            var id = this.get('id');
            if (!id) return this.apiCreate();
            return this.apiUpdate();
        },
        setTypeHelpers: function(model, types) {
            var self = this;
            _.each(contactTypes, function (contactType) {
                self.unset('is' + contactType + 'Contact');
                self.unset('isPrimary' + contactType + 'Contact');
                _.each(types, function (type) {
                    var toSet = {};
                    if (type.name === contactType) {
                        toSet['is' + contactType + 'Contact'] = true;
                        if (type.isPrimary) toSet['isPrimary' + contactType + 'Contact'] = true;
                        self.set(toSet, { silent: true });
                    }
                });
            });
        },
        initialize: function () {
            var self = this,
                types = this.get('types')
            if (types) this.setTypeHelpers(null, types);
            this.on(contactTypeListeners);
            this.on('change:types', this.setTypeHelpers, this);
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
        helpers: ['hasSavedCards', 'hasSavedContacts', 'billingContacts'],
        hasSavedCards: function() {
            var cards = this.get('cards');
            return cards && cards.length > 0;
        },
        hasSavedContacts: function() {
            var contacts = this.get('contacts');
            return contacts && contacts.length > 0;
        },
        billingContacts: function() {
            return _.invoke(this.get('contacts').where({ isBillingContact: true }), 'toJSON');
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
        defaults: {
            editingCard: {},
            editingContact: {}
        },
        initialize: function() {
            var primaryBillingContact = this.getPrimaryBillingContact();
            if (primaryBillingContact && primaryBillingContact instanceof CustomerContact) this.set('primaryBillingContact', primaryBillingContact, { useExistingInstances: true });

            this.get('editingContact').set('accountId', this.get('id'));
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) delete j.primaryBillingContact;
            return j;
        },
        getPrimaryBillingContact: function () {
            var contacts = this.get('contacts'),
                pbc = contacts.find(function (c) {
                    return c.get('isPrimaryBillingContact');
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
            var toEdit = this.get('cards').get(id),
                editingCardModel = {
                    contacts: this.billingContacts()
                };
            if (toEdit) {
                _.extend(editingCardModel, toEdit.toJSON({ helpers: true }));
            }
            this.get('editingCard').set(editingCardModel);
        },
        endEditCard: function() {
            this.get('editingCard').clear({ silent: true });
        },
        saveCard: function () {
            var self = this;
            return this.apiSavePaymentCard(this.get('editingCard').toJSON()).then(function () {
                return self.getCards();
            }).then(function () {
                return self.get('editingCard').clear({ silent: true });
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
                this.get('editingContact').set(toEdit.toJSON({ helpers: true, ensureCopy: true }));
        },
        endEditContact: function() {
            var editingContact = this.get('editingContact');
            editingContact.clear({ silent: true });
            editingContact.set('accountId', this.get('id'));
        },
        saveContact: function (id) {
            var self = this,
                editingContact = this.get('editingContact');
            return editingContact.save().then(function () {
                self.endEditContact();
                return self.getContacts();
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
                contactsCollection.reset(cc.data.items);
                return self;
            });
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer
    };
});