define(['modules/backbone-mozu', 'shim!vendor/underscore>_', 'modules/models-address', 'modules/models-orders', 'modules/models-paymentmethods', 'modules/models-product', 'hyprlive'], function (Backbone, _, AddressModels, OrderModels, PaymentMethods, ProductModels, Hypr) {


    var pageContext = require.mozuData('pagecontext'),
        validShippingCountryCodes,
        validBillingCountryCodes,
        validShippingAndBillingCountryCodes;
    if (pageContext && pageContext.shippingCountries && pageContext.billingCountries) {
        validShippingCountryCodes = _.pluck(pageContext.shippingCountries, 'value');
        validBillingCountryCodes = _.pluck(pageContext.billingCountries, 'value');
        validShippingAndBillingCountryCodes = _.intersection(validShippingCountryCodes, validBillingCountryCodes);
    }


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
            },
            "address.countryCode": {
                fn: function (value) {
                    if (!validShippingCountryCodes) return undefined;
                    var isBillingContact = this.attributes.isBillingContact || this.attributes.editingContact.attributes.isBillingContact,
                        isShippingContact = this.attributes.isShippingContact || this.attributes.editingContact.attributes.isShippingContact,
                        validCodes = ((isBillingContact && isShippingContact && validShippingAndBillingCountryCodes) ||
                                      (isBillingContact && validBillingCountryCodes) ||
                                      (isShippingContact && validShippingCountryCodes));
                    if (validCodes && !_.contains(validCodes, value)) return Hypr.getLabel("wrongCountryForType");
                }
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
        save: function () {
            if (!this.parent.validate("editingContact")) {
                var id = this.get('id');
                if (!id) return this.apiCreate();
                return this.apiUpdate();
            }
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
        helpers: ['hasSavedCards', 'hasSavedContacts'],
        hasSavedCards: function() {
            var cards = this.get('cards');
            return cards && cards.length > 0;
        },
        hasSavedContacts: function() {
            var contacts = this.get('contacts');
            return contacts && contacts.length > 0;
        },        relations: {
            contacts: Backbone.Collection.extend({
                model: CustomerContact
            }),
            cards: Backbone.Collection.extend({
                model: PaymentMethods.CreditCard
            })
        },
        getPrimaryContactOfType: function (typeName) {
            return this.get('contacts').find(function (contact) {
                return !!_.findWhere(contact.get('types'), { name: typeName, isPrimary: true });
            });
        },
        getPrimaryBillingContact: function () {
            return this.getPrimaryContactOfType("Billing");
        },
        getPrimaryShippingContact: function () {
            return this.getPrimaryContactOfType("Shipping");
        },
        getContacts: function () {
            var self = this;
            var contactsCollection = this.get('contacts');
            return this.apiGetContacts().then(function (cc) {
                contactsCollection.reset(cc.data.items);
                self.trigger('sync', cc.data);
                return self;
            });
        },
        getStoreCredits: function() {
            var self = this;
            return this.apiGetCredits().then(function (credits) {
                self.set('credits', credits.data.items);
                self.trigger('sync', credits);
                return self;
            });
        },
        addStoreCredit: function (id) {
            return this.apiAddStoreCredit(id);
        }
    }),

    EditableCustomer = Customer.extend({
        
        handlesMessages: true,
        relations: _.extend({
            editingCard: PaymentMethods.CreditCard,
            editingContact: CustomerContact,
            wishlist: Wishlist,
            orderHistory: OrderModels.OrderCollection,
            returnHistory: OrderModels.RMACollection
        }, Customer.prototype.relations),
        validation: {
            password: {
                fn: function(value) {
                    if (this.validatePassword && !value) return Hypr.getLabel('passwordMissing')
                }
            },
            confirmPassword: {
                fn: function(value) {
                    if (this.validatePassword && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch')
                }
            },
        },
        defaults: {
            editingCard: {},
            editingContact: {}
        },
        initialize: function() {
            var self = this,
                orderHistory = this.get('orderHistory'),
                returnHistory = this.get('returnHistory');
            this.get('editingContact').set('accountId', this.get('id'));
            orderHistory.lastRequest = {
                pageSize: 5
            };
            returnHistory.lastRequest = {
                pageSize: 5
            };
            orderHistory.on('returncreated', function(id) {
                returnHistory.apiGet(returnHistory.lastRequest).then(function () {
                    returnHistory.trigger('returndisplayed', id);
                });
            });
        },
        changePassword: function () {
            var self = this;
            self.validatePassword = true;
            if (this.validate('password') || this.validate('confirmPassword')) return false;
            return this.apiChangePassword({
                oldPassword: this.get('oldPassword'),
                newPassword: this.get('password')
            }).ensure(function () {
                self.validatePassword = false;
            });
        },
        beginEditCard: function(id) {
            var toEdit = this.get('cards').get(id),
                contacts = this.get('contacts').toJSON(),
                editingCardModel = {
                    contacts: contacts,
                    hasSavedContacts: this.hasSavedContacts()
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
            var self = this,
                editingCard = this.get('editingCard').toJSON(),
                doSaveCard = function () {
                    return self.apiSavePaymentCard(editingCard).then(function () {
                        return self.getCards();
                    }).then(function () {
                        return self.get('editingCard').clear({ silent: true });
                    });
                },
                saveContactFirst = function () {
                    self.get('editingContact').set('isBillingContact', true);
                    var op = self.get('editingContact').save();
                    if (!op) throw new Error("Could not save contact!");
                    return op.then(function (contact) {
                        editingCard.contactId = contact.prop('id');
                        self.endEditContact();
                        self.getContacts();
                        return true;
                    });
                };
            if (!editingCard.contactId || editingCard.contactId === "new") {
                return saveContactFirst().then(doSaveCard);
            } else {
                return doSaveCard();
            }
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
            editingContact.clear();
            editingContact.set('accountId', this.get('id'));
        },
        saveContact: function () {
            var self = this,
                editingContact = this.get('editingContact'),
                apiContact;
            
            var op = editingContact.save();
            if (op) return op.then(function (contact) {
                apiContact = contact;
                self.endEditContact();
                return self.getContacts();
            }).then(function () {
                return apiContact;
            });
        },
        deleteContact: function (id) {
            var self = this;
            return this.apiModel.deleteContact(id).then(function () {
                return self.getContacts();
            });
        },
        updateName: function () {
            return this.apiUpdate({
                firstName: this.get('firstName'),
                lastName: this.get('lastName')
            });
        },
        updateAcceptsMarketing: function(yes) {
            return this.apiUpdate({
                acceptsMarketing: yes
            });
        },
        toJSON: function (options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers)
                delete j.customer;
            delete j.password;
            delete j.confirmPassword;
            delete j.oldPassword;
            return j;
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer,
        EditableCustomer: EditableCustomer
    };
});