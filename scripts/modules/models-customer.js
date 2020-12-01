define(['modules/backbone-mozu', 'underscore', 'modules/models-address', 'modules/models-orders', 'modules/models-paymentmethods', 'modules/models-product', 'modules/models-returns', 'hyprlive', 'modules/models-b2b-account', 'modules/models-quotes'], function (Backbone, _, AddressModels, OrderModels, PaymentMethods, ProductModels, ReturnModels, Hypr, B2BAccountModels, QuoteModels) {


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
                this.set('types', types, { silent: true });
            }
            if (!yes && isAlready) {
                this.set('types', _.without(types, isAlready), { silent: true});
            }
        };
        contactTypeListeners['change:isPrimary' + contactType + 'Contact'] = function(model, yes) {
            var types = this.get('types'),
                typeConf = { name: contactType },
                type = _.findWhere(types, typeConf);
            if (type) {
                type.isPrimary = yes;
                this.set('types', types, { silent: true });
            }
        };
    });

    var CustomerAttribute = Backbone.MozuModel.extend({
        mozuType: 'customerattribute',
        validation: {
            values: {
                fn: function (values, fieldName, fields) {
                    var inputType = fields.inputType;
                    var messages = Backbone.Validation.messages;
                    var rules = fields.validation;
                    var value = values[0];

                    if (inputType === 'TextBox') {
                        if (rules.maxStringLength && value.length > rules.maxStringLength) return format(messages.maxLength, fields.adminName, rules.maxStringLength);
                        if (rules.minStringLength && value.length < rules.minStringLength) return format(messages.minLength, fields.adminName, rules.minStringLength);
                        if (rules.maxNumericValue && value > rules.maxNumericValue) return format(messages.max, fields.adminName, rules.maxNumericValue);
                        if (rules.minNumericValue && value < rules.minNumericValue) return format(messages.min, fields.adminName, rules.minNumericValue);
                    } else if (inputType === 'TextArea') {
                        if (rules.maxStringLength && value.length > rules.maxStringLength) return format(messages.maxLength, fields.adminName, rules.maxStringLength);
                        if (rules.minStringLength && value.length < rules.minStringLength) return format(messages.minLength, fields.adminName, rules.minStringLength);
                    } else if (inputType === 'Date') {
                        if (rules.maxDateTime && Date.parse(value) > Date.parse(rules.maxDateTime)) return format(messages.max, fields.adminName, Date.parse(rules.maxDateTime));
                        if (rules.minDateTime && Date.parse(value) < Date.parse(rules.minDateTime)) return format(messages.min, fields.adminName, Date.parse(rules.minDateTime));
                    }

                    function format () {
                        var args = Array.prototype.slice.call(arguments),
                            text = args.shift();
                        return text.replace(/\{(\d+)\}/g, function (match, number) {
                            return typeof args[number] !== 'undefined' ? args[number] : match;
                        });
                    }
                }
            }
        }
    });

    var CustomerContact = Backbone.MozuModel.extend({
        mozuType: 'contact',
        requiredBehaviors: [1002],
        defaults: {
            userId: require.mozuData('user').userId  
        },
        relations: {
            address: AddressModels.StreetAddress,
            phoneNumbers: AddressModels.PhoneNumbers
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
            if (j.id === "new") delete j.id;
            return j;
        },
        save: function () {
            if (!this.parent.validate("editingContact")) {
                var id = this.get('id');

                if (!this.get('email')) this.set({ email: this.parent.get('emailAddress') }, { silent: true });
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
        contactTypeHelpers : function(){
            var self = this;
            var isShipping = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Shipping"});
                    return (found) ? true : false;
                }
                return false;
            };
            var isPrimaryShipping = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Shipping", isPrimary: true});
                    return (found) ? true : false;
                }
                return false;
            };
            var isBilling = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Billing"});
                    return (found) ? true : false;
                }
                return false;
            };
            var isPrimaryBilling = function(){
                if(self.get('types')){
                    var found = _.findWhere(self.get('types'), {name: "Billing", isPrimary: true});
                    return (found) ? true : false;
                }
                return false;
            };
            return {
                isShipping: isShipping,
                isBilling: isBilling,
                isPrimaryShipping: isPrimaryShipping,
                isPrimaryBilling: isPrimaryBilling
            };
        },
        initialize: function () {
            var self = this,
                types = this.get('types');
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
        addItemToCart: function (id) {
            var self = this;
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
        relations: {
            attributes: Backbone.Collection.extend({
                model: CustomerAttribute
            }),
            // We set this relationship so that b2battributes, when assigned, can
            // function like a backbone collection. But it's only out of convenience that the model
            // is named CustomerAttribute. This is NOT a collection of customer attributes. They are
            // ACCOUNT attributes.
            b2bAttributes: Backbone.Collection.extend({
                model: CustomerAttribute
            }),
            contacts: Backbone.Collection.extend({
                model: CustomerContact,
                getPrimaryShippingContact: function(){
                    var primaryContacts = this.find(function(contact){
                        return contact.contactTypeHelpers().isPrimaryShipping();
                    });
                    return (primaryContacts.length) ? primaryContacts[0] : null;
                },
                getPrimaryBillingContact: function(){
                     var primaryContacts = this.find(function(contact){
                        return contact.contactTypeHelpers().isPrimaryBilling();
                    });
                    return (primaryContacts.length) ? primaryContacts[0] : null;
                }
            }),
            cards: Backbone.Collection.extend({
                model: PaymentMethods.CreditCard
            }),
            credits: Backbone.Collection.extend({
                model: PaymentMethods.DigitalCredit
            })
        },
        getAttributes: function () {
            var self = this;
            var attributesCollection = this.get('attributes');

            return this.apiGetAttributes({pageSize:100}).then(function (cc) {
                // transform attributes into key-value pairs, to avoid multiple lookups
                var values = _.reduce(cc.data.items, function (a, b) {
                    a[b.fullyQualifiedName] = {
                        values: b.values,
                        attributeDefinitionId: b.attributeDefinitionId
                    };
                    return a;
                }, {});

                // get all attribute definitions
                return self.apiGetAttributeDefinitions().then(function (defs) {
                    // merge attribute values into definitions
                    _.each(defs.data.items, function (def) {
                        var fqn = def.attributeFQN;

                        if (values[fqn]) {
                            def.values = values[fqn].values;
                            def.attributeDefinitionId = values[fqn].attributeDefinitionId;
                        }
                    });
                    // sort attributes, putting checkboxes first
                    defs.data.items.sort(function (a, b) {
                        if (a.inputType === 'YesNo') return -1;
                        else if (b.inputType === 'YesNo') return 1;
                        else return 0;
                    });
                    // write fully-hydrated attributes to the model
                    attributesCollection.reset(defs.data.items);
                    self.trigger('sync', cc.data);
                    return self;
                });
            });
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

    CustomerCardWithContact = PaymentMethods.CreditCard.extend({

        validation: _.extend({
            contactId: {
                fn: function(value, property, model) {
                    if (!value && model.contacts && model.contacts.length > 0) return Hypr.getLabel('cardBillingMissing');
                }
            }
        }, PaymentMethods.CreditCard.prototype.validation),
        selected: true, // so that validation rules always run,
        isCvvOptional: true
    }),

    EditableCustomer = Customer.extend({

        handlesMessages: true,
        relations: _.extend({
            editingCard: CustomerCardWithContact,
            editingContact: CustomerContact,
            wishlist: Wishlist,
            orderHistory: OrderModels.OrderCollection,
            returnHistory: ReturnModels.RMACollection,
            quoteHistory: QuoteModels.QuoteCollection
        }, Customer.prototype.relations),
        validation: {
            password: {
                fn: function(value) {
                    if (this.validatePassword && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            confirmPassword: {
                fn: function(value) {
                    if (this.validatePassword && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        },
        defaults: function () {
            return {
                editingCard: {},
                editingContact: {}
            };
        },
        helpers: ['isNonPurchaser'],
        initialize: function() {
            var self = this,
                orderHistory = this.get('orderHistory'),
                returnHistory = this.get('returnHistory'),
                quoteHistory = this.get('quoteHistory');
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
            quoteHistory.lastRequest = {
                pageSize: 5
            };

            _.defer(function (cust) {
                cust.getCards();
            }, self);
        },
        isNonPurchaser: function() {
            return (require.mozuData('user').behaviors.length) ? false : true;
        },
        changePassword: function () {
            var self = this;
            self.validatePassword = true;
            if (this.validate('password') || this.validate('confirmPassword')) return false;
            var changePasswordPayload = {
                oldPassword: this.get('oldPassword'),
                newPassword: this.get('password')
            };
            if (this.get('accountType') === 'B2B'){
                changePasswordPayload.userId = this.get('userId');
            }
            return this.apiChangePassword(changePasswordPayload).ensure(function () {
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
                _.extend(editingCardModel, toEdit.toJSON({ helpers: true }), { isCvvOptional: true });
            }
            this.get('editingCard').set(editingCardModel);
        },
        endEditCard: function() {
            this.get('editingCard').clear({ silent: true });
        },
        saveCard: function() {
            if (!this.validate('editingCard')) {
                var self = this,
                    saveContactOp,
                    editingCard = this.get('editingCard').toJSON(),
                    doSaveCard = function() {
                        return self.apiSavePaymentCard(editingCard).then(function() {
                            return self.getCards();
                        }).then(function() {
                            return self.get('editingCard').clear({ silent: true });
                        });
                    },
                    saveContactFirst = function() {
                        self.get('editingContact').set('isBillingContact', true);
                        var op = self.get('editingContact').save();
                        if (op) return op.then(function(contact) {
                            editingCard.contactId = contact.prop('id');
                            self.endEditContact();
                            self.getContacts();
                            return true;
                        });
                    };
                if (!editingCard.contactId || editingCard.contactId === "new") {
                    saveContactOp = saveContactFirst();
                    if (saveContactOp) return saveContactOp.then(doSaveCard);
                } else {
                    return doSaveCard();
                }
            }
        },
        deleteCard: function (id) {
            var self = this;
            return this.apiModel.deletePaymentCard(id).then(function () {
                return self.getCards();
            });
        },
        deleteMultipleCards: function(ids) {
            return this.apiModel.api.all.apply(this.apiModel.api, ids.map(_.bind(this.apiModel.deletePaymentCard, this.apiModel))).then(_.bind(this.getCards, this));
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
                this.get('editingContact').set(toEdit.toJSON({ helpers: true, ensureCopy: true }), { silent: true });
        },
        endEditContact: function() {
            var editingContact = this.get('editingContact');
            editingContact.clear();
            editingContact.set('accountId', this.get('id'));
        },
        saveContact: function (options) {
            var self = this,
                editingContact = this.get('editingContact'),
                apiContact;

            if (options && options.forceIsValid) {
                editingContact.set('address.isValidated', true);
            }

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
        updateAttribute: function (attributeFQN, attributeDefinitionId, values) {
            this.apiUpdateAttribute({
                attributeFQN: attributeFQN,
                attributeDefinitionId: attributeDefinitionId,
                values: values
            });
        },
        toJSON: function (options) {
            var j = Customer.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers)
                delete j.customer;
            delete j.password;
            delete j.confirmPassword;
            delete j.oldPassword;
            return j;
        }
    }),
    B2BCustomerAccount = B2BAccountModels.b2bUser.extend({
        toJSON: function (options) {
            var j = Customer.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers)
                delete j.customer;
            delete j.password;
            delete j.confirmPassword;
            delete j.oldPassword;

            j.accountId = j.id;
            j.id = j.userId;
            return j;
        }
    });

    return {
        B2BCustomer: B2BCustomerAccount,
        Contact: CustomerContact,
        Customer: Customer,
        EditableCustomer: EditableCustomer
    };
});
