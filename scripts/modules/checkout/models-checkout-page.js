define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'modules/models-customer',
    'modules/models-address',
    'modules/models-paymentmethods',
    'hyprlivecontext',
    'modules/models-orders',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/checkout/steps/step1/models-step-shipping-info',
    'modules/checkout/models-shipping-destinations',
    'modules/checkout/steps/step2/models-step-shipping-methods',
    'modules/checkout/steps/step3/models-payment',
    'modules/checkout/contact-dialog/models-contact-dialog'
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods,
        HyprLiveContext, OrderModels, CheckoutStep, ShippingStep,
        ShippingDestinationModels, ShippingInfo, BillingInfo, ContactDialogModels) {

    var checkoutPageValidation = {
            'emailAddress': {
                fn: function (value) {
                    if (this.attributes.createAccount && (!value || !value.match(Backbone.Validation.patterns.email))) return Hypr.getLabel('emailMissing');
                }
            },
            'password': {
                fn: function (value) {
                    if (this.attributes.createAccount && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            'confirmPassword': {
                fn: function (value) {
                    if (this.attributes.createAccount && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        };

        if (Hypr.getThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: Hypr.getLabel('didNotAgreeToTerms')
            };
        }

        var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
        if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0){

            var requiredAttributes = _.filter(storefrontOrderAttributes,
                function(attr) { return attr.isRequired && attr.isVisible && attr.valueType !== 'AdminEntered' ;  });
            requiredAttributes.forEach(function(attr) {
                if(attr.isRequired) {

                    checkoutPageValidation['orderAttribute-' + attr.attributeFQN] =
                    {
                        required: true,
                        msg: attr.content.value + " " + Hypr.getLabel('missing')
                    };
                }
            }, this);
        }



var CheckoutOrder = OrderModels.Order.extend({
    helpers : ['selectableDestinations', 'isOriginalCartItem'],
    validation : {
        destinationId : {
            required: true,
            msg: Hypr.getLabel("shippingDestinationRequiredError")
        }
    },
    initialize: function(){

    },
    getCheckout : function(){
        return this.collection.parent;
    },
    getDestinations : function(){
        return this.getCheckout().get('destinations');
    },
    selectableDestinations : function(){
        var selectable = [];
         var shippingDestinations = this.getCheckout().selectableDestinations("Shipping");
         shippingDestinations.forEach(function(destination){
            if(!destination.isSingleShipDestination){
                selectable.push(destination);
            }
        });
        return selectable;
    },
    isOriginalCartItem : function(){
        var self = this;
        var originalCartItem = self.collection.findWhere({originalCartItemId: self.get('originalCartItemId')});
        return originalCartItem.id == self.get('id');
    },
    addNewContact: function(){

        this.getCheckout().get('dialogContact').resetDestinationContact();
        this.getCheckout().get('dialogContact').unset('id');

        this.getCheckout().get('dialogContact').trigger('openDialog');
    },
    editContact: function(destinationId){
        var destination = this.getDestinations().findWhere({'id': destinationId});

        if(destination){
            var destCopy = destination.toJSON();
            destCopy = new ShippingDestinationModels.ShippingDestination(destCopy);
            //destCopy.set('destinationContact', new CustomerModels.Contact(destCopy.get('destinationContact')));
            //this.getCheckout().get('dialogContact').get("destinationContact").clear();
            this.getCheckout().set('dialogContact', destCopy);
            this.getCheckout().get('dialogContact').set("destinationContact", new CustomerModels.Contact(destCopy.get('destinationContact').toJSON()));
            this.getCheckout().get('dialogContact').trigger('openDialog');
        }

    },
    updateOrderItemDestination: function(destinationId, customerContactId){
        var self = this;
        self.isLoading(true);

        if(!destinationId) {
            var destination = self.getCheckout().get('destinations').findWhere({customerContactId: customerContactId});
            if(destination){
                return destination.saveDestinationAsync().then(function(data){
                    return self.getCheckout().apiUpdateCheckoutItemDestination({
                        id: self.getCheckout().get('id'),
                        itemId: self.get('id'),
                        destinationId: data.data.id
                    }).ensure(function(){
                        self.isLoading(false);
                    });
                });
            }
        }
        self.set('destinationId', destinationId);
        return self.getCheckout().apiUpdateCheckoutItemDestination({
            id: self.getCheckout().get('id'),
            itemId: self.get('id'),
            destinationId: destinationId
        }).ensure(function(){
            self.isLoading(false);
        });
    },
    splitCheckoutItem : function(){
        var self = this;
        var me = this;
        this.getCheckout().get('shippingStep').splitCheckoutItem(self.get('id'), 1);
    }
});


var CheckoutGrouping = Backbone.MozuModel.extend({
    helpers: ['groupingItemInfo', 'groupingDestinationInfo', 'groupingShippingMethods', 'loadingShippingMethods'],
    validation : {
        shippingMethodCode : {
            fn: "validateShippingCode",
            msg: Hypr.getLabel("shippingMethodRequiredError")
        }
    },
    validateShippingCode: function(value, attr) {
        if (!this.get('shippingMethodCode') && this.get('fulfillmentMethod') == "Ship") return this.validation[attr.split('.').pop()].msg;
    },
    getCheckout : function(){
        return this.collection.parent;
    },
    groupingItemInfo : function(){
        var self = this,
            orderItems = [];

        _.forEach(this.get('orderItemIds'), function(itemId, idx){
            var item = self.getCheckout().get('items').findWhere({id: itemId});
            if(item) orderItems.push(item.toJSON());
        });

        return orderItems;
    },
    groupingDestinationInfo : function(){
       var self = this,
       destinationInfo = self.getCheckout().get('destinations').findWhere({id:this.get('destinationId')});
       return (destinationInfo) ? destinationInfo.toJSON() : {};
    },
    groupingShippingMethods : function(){
        var self = this,
        shippingMethod = self.getCheckout().get('shippingMethods').findWhere({groupingId:this.get('id')});
        return (shippingMethod) ? shippingMethod.toJSON().shippingRates : [];
    },
    loadingShippingMethods : function(){
        this.getCheckout().get('shippingMethods').get('isLoading');
    }
});

var CheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'checkout',
            handlesMessages: true,
            relations: {
                items : Backbone.Collection.extend({
                    model : CheckoutOrder
                }),
                groupings : Backbone.Collection.extend({
                    model : CheckoutGrouping
                }),
                billingInfo: BillingInfo,
                shopperNotes: Backbone.MozuModel.extend(),
                customer: CustomerModels.Customer,
                destinations : ShippingDestinationModels.ShippingDestinations,
                shippingStep: ShippingStep,
                shippingInfo: ShippingInfo,
                dialogContact: ContactDialogModels,
                shippingMethods : Backbone.Collection.extend()
            },
            validation: checkoutPageValidation,
            dataTypes: {
                createAccount: Backbone.MozuModel.DataTypes.Boolean,
                acceptsMarketing: Backbone.MozuModel.DataTypes.Boolean,
                amountRemainingForPayment: Backbone.MozuModel.DataTypes.Float,
                isMultiShipMode : Backbone.MozuModel.DataTypes.Boolean
            },
            defaults: {
                "isMultiShipMode" : false
            },
            setMultiShipMode : function(){
            var directShipItems = this.get('items').where({fulfillmentMethod: "Ship"});
            var destinationCount = [];
             _.each(directShipItems, function(item){
                var id = item.get('destinationId') ? item.get('destinationId') : 0;
                if(destinationCount.indexOf(id) === -1) {
                    destinationCount.push(id);
                }
             });

            return (destinationCount.length > 1) ? this.set('isMultiShipMode', true) : this.set('isMultiShipMode', false);
            },
            addCustomerContacts : function(){
                var self =this;
                var contacts = self.get('customer').get('contacts');

                if(contacts.length){
                    contacts.each(function(contact, key){

                        if(!self.get('destinations').hasDestination(contact)){
                            if(contact.contactTypeHelpers().isShipping() && contact.contactTypeHelpers().isBilling()){
                                self.get('destinations').newDestination(contact, true, "ShippingAndBilling");
                            } else if (contact.contactTypeHelpers().isShipping()) {
                                self.get('destinations').newDestination(contact, true, "Shipping");
                            } else if (contact.contactTypeHelpers().isBilling()) {
                                self.get('destinations').newDestination(contact, true, "Billing");
                            }
                        }

                    });
                    self.get('destinations').trigger('destinationsUpdate');
                }
            },
            initialize: function (data) {

                var self = this,
                    user = require.mozuData('user');
                    //self.get('shippingStep').initSet();

                this.on('sync', function(rawJSON) {
                    self.addCustomerContacts();
                });

                self.addCustomerContacts();

                _.defer(function() {
                    self.setMultiShipMode();


                    var latestPayment = self.apiModel.getCurrentPayment(),
                        activePayments = self.apiModel.getActivePayments(),
                        //fulfillmentInfo = self.get('fulfillmentInfo'),
                        shippingStep = self.get('shippingStep'),
                        shippingInfo = self.get('shippingInfo'),
                        billingInfo = self.get('billingInfo'),
                        steps = [shippingStep, shippingInfo, billingInfo],
                        paymentWorkflow = latestPayment && latestPayment.paymentWorkflow,
                        visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' }),
                        allStepsComplete = function () {
                            return _.reduce(steps, function(m, i) { return m + i.stepStatus(); }, '') === 'completecompletecomplete';
                        },
                        isReady = allStepsComplete();

                    //Visa checkout payments can be added to order without UIs knowledge. This evaluates and voids the required payments.
                    if (visaCheckoutPayment) {
                        _.each(_.filter(self.apiModel.getActivePayments(), function (payment) {
                            return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard' && payment.paymentWorkflow != 'VisaCheckout';
                        }), function (payment) {
                            self.apiVoidPayment(payment.id);
                        });
                        paymentWorkflow = visaCheckoutPayment.paymentWorkflow;
                        billingInfo.unset('billingContact');
                        billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                        billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                     }

                    if (paymentWorkflow) {
                        billingInfo.set('paymentWorkflow', paymentWorkflow);
                        billingInfo.get('card').set({
                            isCvvOptional: Hypr.getThemeSetting('isCvvSuppressed'),
                            paymentWorkflow: paymentWorkflow
                        });
                        billingInfo.trigger('stepstatuschange'); // trigger a rerender
                    }

                    self.isReady(isReady);

                    _.each(steps, function(step) {
                        self.listenTo(step, 'stepstatuschange', function() {
                            _.defer(function() {
                                self.isReady(allStepsComplete());
                            });
                        });
                    });

                    if (!self.get('requiresFulfillmentInfo')) {
                        self.validation = _.pick(self.constructor.prototype.validation, _.filter(_.keys(self.constructor.prototype.validation), function(k) { return k.indexOf('fulfillment') === -1; }));
                    }



                    var billingEmail = billingInfo.get('billingContact.email');
                    if (!billingEmail && user.email) billingInfo.set('billingContact.email', user.email);

                    self.applyAttributes();

                });
                if (user.isAuthenticated) {
                    this.set('customer', { id: user.accountId });
                }
                // preloaded JSON has this as null if it's unset, which defeats the defaults collection in backbone
                if (!data.acceptsMarketing) {
                    self.set('acceptsMarketing', true);
                }

                _.bindAll(this, 'update', 'onCheckoutSuccess', 'onCheckoutError', 'addNewCustomer', 'saveCustomerCard', 'apiCheckout',
                    'addDigitalCreditToCustomerAccount', 'saveCustomerContacts');

            },
            getCustomerInfo : function(){
                return this.get('customer');
            },
            getCheckout : function(){
                return this;
            },
            selectableDestinations : function(customerContactType){
               var selectable = [];
               this.getCheckout().get('destinations').each(function(destination){
                    if(!destination.get('isGiftCardDestination')){
                       if(customerContactType && destination.get('customerContactType')) {
                            if(destination.get('customerContactType') === customerContactType || destination.get('customerContactType') === "ShippingAndBilling"){
                                selectable.push(destination.toJSON());
                            }
                        } else {
                            selectable.push(destination.toJSON());
                        }
                    }
                });
                return selectable;
            },
            applyAttributes: function() {
                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    this.set('orderAttributes', storefrontOrderAttributes);
                }
            },

            processDigitalWallet: function(digitalWalletType, payment) {
                var me = this;
                me.runForAllSteps(function() {
                    this.isLoading(true);
                });
                me.trigger('beforerefresh');
                // void active payments; if there are none then the promise will resolve immediately
                return api.all.apply(api, _.map(_.filter(me.apiModel.getActivePayments(), function(payment) {
                    return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard';
                }), function(payment) {
                    return me.apiVoidPayment(payment.id);
                })).then(function() {
                    return me.apiProcessDigitalWallet({
                        digitalWalletData: JSON.stringify(payment)
                    }).then(function () {
                        me.updateVisaCheckoutBillingInfo();
                        me.runForAllSteps(function() {
                            this.trigger('sync');
                            this.isLoading(false);
                        });
                        me.updateShippingInfo();
                    });
                });
            },
            updateShippingInfo: function() {
                var me = this;
                this.apiModel.getShippingMethods().then(function (methods) {
                    //me.get('fulfillmentInfo').refreshShippingMethods(methods);
                });
            },
            updateVisaCheckoutBillingInfo: function() {
                //Update the billing info with visa checkout payment
                var billingInfo = this.get('billingInfo');
                var activePayments = this.apiModel.getActivePayments();
                var visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' });
                if (visaCheckoutPayment) {
                    billingInfo.set('usingSavedCard', false);
                    billingInfo.unset('savedPaymentMethodId');
                    billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                    billingInfo.unset('billingContact');
                    billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                    billingInfo.set('paymentWorkflow', visaCheckoutPayment.paymentWorkflow);
                    billingInfo.set('paymentType', visaCheckoutPayment.paymentType);
                    this.refresh();
                }
            },
            addCoupon: function () {
                var me = this;
                var code = this.get('couponCode');
                var orderDiscounts = me.get('orderDiscounts');
                if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    deferred.promise.otherwise(function () {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                        });
                    });
                    return deferred.promise;
                }
                this.isLoading(true);
                return this.apiAddCoupon(this.get('couponCode')).then(function (response) {

                    me.get('billingInfo').trigger('sync');
                    me.set('couponCode', '');
                    var groupingShippingDiscounts = [];
                    me.get("groupings").forEach(function(grouping){
                      grouping.get('shippingDiscounts').forEach(function(discount){
                        groupingShippingDiscounts.push(discount);
                      });
                    });

                    var productDiscounts = _.flatten(me.get('items').pluck('productDiscounts'));
                    var shippingDiscounts = _.flatten(_.pluck(_.flatten(me.get('items').pluck('shippingDiscounts')), 'discount'));
                    var orderShippingDiscounts = _.flatten(_.pluck(groupingShippingDiscounts, 'discount'));

                    var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts).concat(orderShippingDiscounts);
                    var lowerCode = code.toLowerCase();

                    var matchesCode = function (d) {
                        // there are discounts that have no coupon code that we should not blow up on.
                        return (d.couponCode || "").toLowerCase() === lowerCode;
                    };

                    var invalidCoupons = _.pluck(response.invalidCoupons, "couponCode");
                    if (_.contains(invalidCoupons, code)){
                      me.trigger('error', {
                        message: Hypr.getLabel('promoCodeInvalid', code)
                      });

                    } else if (!allDiscounts || !_.find(allDiscounts, matchesCode))
                    {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeError', code)
                        });

                    }

                    else if (me.get('total') === 0) {
                        me.trigger('complete');
                    }
                    // only do this when there isn't a payment on the order...
                    me.get('billingInfo').updatePurchaseOrderAmount();
                    me.isLoading(false);

                });
            },
            onCheckoutSuccess: function () {
                this.isLoading(true);
                this.trigger('complete');
            },
            onCheckoutError: function (error) {
                var order = this,
                    errorHandled = false;
                order.isLoading(false);
                if (!error || !error.items || error.items.length === 0) {
                    if (error.message.indexOf('10486') != -1){
                        var siteContext = HyprLiveContext.locals.siteContext,
                            externalPayment = _.findWhere(siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayPalExpress2"}),
                            environment = _.findWhere(externalPayment.credentials, {"apiName" : "environment"}),
                            url = "";

                        if (environment.value.toLowerCase() === "sandbox"){
                            url = "https://www.sandbox.paypal.com";
                        }
                        else{
                            url = "https://www.paypal.com";
                        }

                        window.location.href = url + "/cgi-bin/webscr?cmd=_express-checkout&token=" + order.get('payments')[order.get('payments').length-1].externalTransactionId;

                        return;
                    } else {
                        error = {
                            items: [
                                {
                                    message: error.message || Hypr.getLabel('unknownError')
                                }
                            ]
                        };
                    }
                }
                $.each(error.items, function (ix, errorItem) {
                    if (errorItem.name === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: password')) {
                        errorHandled = true;
                        order.trigger('passwordinvalid', errorItem.message.substring(errorItem.message.indexOf('Password')));
                    }
                    if (errorItem.errorCode === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: emailaddress')) {
                        errorHandled = true;
                        order.trigger('userexists', order.get('emailAddress'));
                    }
                });

                this.trigger('error', error);

                if (!errorHandled) order.messages.reset(error.items);
                order.isSubmitting = false;
                throw error;
            },
            addNewCustomer: function () {
                var self = this,
                billingInfo = this.get('billingInfo'),
                billingContact = billingInfo.get('billingContact'),
                email = this.get('emailAddress'),
                captureCustomer = function (customer) {
                    if (!customer || (customer.type !== 'customer' && customer.type !== 'login')) return;
                    var newCustomer;
                    if (customer.type === 'customer') newCustomer = customer.data;
                    if (customer.type === 'login') newCustomer = customer.data.customerAccount;
                    if (newCustomer && newCustomer.id) {
                        self.set('customer', newCustomer);
                        api.off('sync', captureCustomer);
                        api.off('spawn', captureCustomer);
                    }
                };
                api.on('sync', captureCustomer);
                api.on('spawn', captureCustomer);
                return this.apiAddNewCustomer({
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: billingContact.get('firstName') || this.get('fulfillmentInfo.fulfillmentContact.firstName'),
                        lastName: billingContact.get('lastNameOrSurname') || this.get('fulfillmentInfo.fulfillmentContact.lastNameOrSurname'),
                        acceptsMarketing: self.get('acceptsMarketing')
                    },
                    password: this.get('password')
                }).then(function (customer) {
                    self.customerCreated = true;
                    return customer;
                }, function (error) {
                    self.customerCreated = false;
                    self.isSubmitting = false;
                    throw error;
                });
            },
            addApiCustomerContacts: function () {
                var self = this;
                var destinations = self.get('destinations');
                if(self.get('destinations').length) {
                    //Save some Contacts

                }
            },
            compareAddressObjects: function(obj1, obj2) {
                var areEqual = _.isMatch(obj1, {
                    address1 : obj2.address1,
                    addressType : obj2.addressType,
                    cityOrTown : obj2.cityOrTown,
                    countryCode : obj2.countryCode,
                    postalOrZipCode : obj2.postalOrZipCode,
                    stateOrProvince : obj2.stateOrProvince
                });
                return areEqual;
            },
            getContactIndex: function(contacts, contact) {
                var self = this;
                return _.findIndex(contacts, function(existingContact) {
                        return self.compareAddressObjects(existingContact.address, contact.address);
                    });
            },
            mergeContactTypes: function(originalContactTypes, newContactTypes) {
                    var mergedTypes = originalContactTypes || [];
                    var originalContactsTypesIndex = _.findIndex(originalContactTypes, function(type) {
                        return type.name === "Billing";
                    });

                    var newContactTypesIndex = _.findIndex(newContactTypes, function(type) {
                        return type.name === "Billing";
                    });

                    if (newContactTypes) {
                        if (originalContactsTypesIndex > -1) {
                            mergedTypes[originalContactsTypesIndex] = newContactTypes[newContactTypesIndex];
                        }
                        else {
                            mergedTypes.push(newContactTypes[newContactTypesIndex]);
                        }
                    }

                    return mergedTypes;
            },
            saveCustomerContacts: function() {
                var customer = this.get('customer');
                var destinations = this.get('destinations');
                var existingContacts = customer.get('contacts').toJSON() || [];
                var updatedContacts = [];
                var self = this;

                destinations.each(function(destination) {
                    if (!destination.get("isGiftCardDestination")) {
                        var destinationContact = destination.get('destinationContact').toJSON();
                        var existingContactIndex = existingContacts.length > 0 ?
                            self.getContactIndex(existingContacts, destinationContact)
                            : -1;

                        if (existingContactIndex && existingContactIndex === -1) {
                            delete destinationContact.id;
                            destinationContact.types =  [{
                                "name": "Shipping",
                                "isPrimary": (destination.get('destinationContact').contactTypeHelpers().isPrimaryShipping()) ? true : false
                            }];
                            updatedContacts.push(destinationContact);
                        }
                    }
                });

                // TO-DO :REMOVE
                // This no good and down right bad...
                // var isSavingNewCustomer = this.isSavingNewCustomer();
                // if(isSavingNewCustomer){
                //     if(updatedContacts.length) {
                //         updatedContacts.push(updatedContacts[0].types[{
                //         "name": "Shipping",
                //         "isPrimary": false
                //     }])
                //     }
                // }

                var billingContact = this.get('billingInfo').get('billingContact').toJSON();
                delete billingContact.email;
                billingContact.types =  [{
                        "name": "Billing",
                        "isPrimary": true
                    }];

                var existingBillingContactIndex = existingContacts.length > 0 ?
                    self.getContactIndex(existingContacts, billingContact)
                    : -1;
                var updatedContactIndex = updatedContacts.length > 0 ?
                    self.getContactIndex(updatedContacts, billingContact)
                    : -1;

                if (updatedContactIndex > -1) {
                    updatedContacts[updatedContactIndex].types = self.mergeContactTypes(updatedContacts[updatedContactIndex].types, billingContact.types);
                }
                else if (existingBillingContactIndex > -1) {
                    var newBillingContact = existingContacts[existingBillingContactIndex];
                    newBillingContact.types = self.mergeContactTypes(existingContacts[existingBillingContactIndex].types, billingContact.types);
                    updatedContacts.push(newBillingContact);
                }
                else {
                    updatedContacts.push(billingContact);
                }


                return customer.apiModel.updateCustomerContacts({id: customer.id, postdata:updatedContacts}).then(function(contactResult) {
                    _.each(contactResult.data.items, function(contact) {
                        if(contact.types){
                            var found = _.findWhere(contact.types, {name: "Billing", isPrimary: true});
                            if(found) {
                                self.get('billingInfo').set('billingContact', contact);
                            return false;
                            }
                        }
                    });
                    return contactResult;
                });
            },
            saveCustomerCard: function () {
                var order = this,
                customer = this.get('customer'), //new CustomerModels.EditableCustomer(this.get('customer').toJSON()),
                billingInfo = this.get('billingInfo'),
                isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                isPrimaryAddress = this.isSavingNewCustomer(),
                billingContact = billingInfo.get('billingContact').toJSON(),
                card = billingInfo.get('card'),

                doSaveCard = function() {
                    order.cardsSaved = order.cardsSaved || customer.get('cards').reduce(function(saved, card) {
                        saved[card.id] = true;
                        return saved;
                    }, {});
                    var method = order.cardsSaved[card.get('id') || card.get('paymentServiceCardId')] ? 'updateCard' : 'addCard';
                    card.set('contactId', billingContact.id);
                    card.set('isDefaultPayMethod', true);
                    return customer.apiModel[method](card.toJSON()).then(function(card) {
                        order.cardsSaved[card.data.id] = true;
                        return card;
                    });
                };

                if (billingContact.id) {
                    return doSaveCard();
                }
            },
            getBillingContact: function () {
                return;
            },
            syncBillingAndCustomerEmail: function () {
                var self = this;
                var billingEmail = this.get('billingInfo.billingContact.email'),
                    customerEmail = require.mozuData('user').email;

                if (customerEmail) {
                    this.set('email', customerEmail);
                } else {
                    this.set('email', billingEmail);
                }
            },
            setNewCustomerEmailAddress : function(){
                var self = this;

                if(!self.get('emailAddress')){
                    self.set('emailAddress', this.get('billingInfo.billingContact.email'));
                }

            },
            addDigitalCreditToCustomerAccount: function () {
                var billingInfo = this.get('billingInfo'),
                    customer = this.get('customer');

                var digitalCredits = billingInfo.getDigitalCreditsToAddToCustomerAccount();
                if (!digitalCredits)
                    return;
                return _.each(digitalCredits, function (cred) {
                    return customer.apiAddStoreCredit(cred.get('code'));
                });
            },
            isSavingNewCustomer: function() {
                return this.get('createAccount') && !this.customerCreated;
            },

            validateReviewCheckoutFields: function(){
                var validationResults = [];
                var isValid = true;
                for (var field in checkoutPageValidation) {
                    if(checkoutPageValidation.hasOwnProperty(field)) {
                        var result = this.preValidate(field, this.get(field));
                        if(result) {
                            this.trigger('error', {
                                message: result
                            });
                            isValid = false;
                            return false;
                        }
                    }
                }

                return isValid;
            },

            submit: function () {
                var checkout = this,
                    billingInfo = this.get('billingInfo'),
                    billingContact = billingInfo.get('billingContact'),
                    isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                    isSavingCreditCard = false,
                    isSavingNewCustomer = this.isSavingNewCustomer(),
                    isAuthenticated = require.mozuData('user').isAuthenticated,
                    nonStoreCreditTotal = billingInfo.nonStoreCreditTotal(),
                    requiresFulfillmentInfo = this.get('requiresFulfillmentInfo'),
                    requiresBillingInfo = nonStoreCreditTotal > 0,
                    process = [function() {
                        return checkout.apiUpdateCheckout({
                            ipAddress: checkout.get('ipAddress'),
                            shopperNotes: checkout.get('shopperNotes').toJSON(),
                            email: checkout.get('email')
                        });
                    }];

                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    var updateAttrs = [];
                    storefrontOrderAttributes.forEach(function(attr){
                        var attrVal = checkout.get('orderAttribute-' + attr.attributeFQN);
                        if(attrVal) {
                            updateAttrs.push({
                                'fullyQualifiedName': attr.attributeFQN,
                                'values': [ attrVal ]
                            });
                        }
                    });

                    if(updateAttrs.length > 0){
                        process.push(function(){
                            return checkout.apiUpdateAttributes(updateAttrs);
                        }, function() {
                            return checkout.apiGet();
                        });
                    }
                }

                if (this.isSubmitting) return;

                this.isSubmitting = true;

                if (requiresBillingInfo && !billingContact.isValid()) {
                    // reconcile the empty address after we got back from paypal and possibly other situations.
                    // also happens with visacheckout ..
                    var billingInfoFromPayment = (this.apiModel.getCurrentPayment() || {}).billingInfo;
                    billingInfo.set(billingInfoFromPayment, { silent: true });
                }

                this.syncBillingAndCustomerEmail();
                this.setNewCustomerEmailAddress();

                // skip payment validation, if there are no payments, but run the attributes and accept terms validation.
                if (!this.validateReviewCheckoutFields()) {
                    this.isSubmitting = false;
                    return false;
                }



                this.isLoading(true);

                if (isSavingNewCustomer) {
                    process.unshift(this.addNewCustomer);
                }

                //save contacts
                if (isAuthenticated || isSavingNewCustomer) {
                    process.push(this.saveCustomerContacts);
                }

                var activePayments = this.apiModel.getActivePayments();
                var saveCreditCard = false;

                if (activePayments !== null && activePayments.length > 0) {
                     var creditCard = _.findWhere(activePayments, { paymentType: 'CreditCard' });
                     if (creditCard && creditCard.billingInfo && creditCard.billingInfo.card) {
                         saveCreditCard = creditCard.billingInfo.card.isCardInfoSaved;
                         billingInfo.set('card', creditCard.billingInfo.card);
                     }
                 }

                 if (saveCreditCard && (this.get('createAccount') || isAuthenticated)) {
                    isSavingCreditCard = true;
                    process.push(this.saveCustomerCard);
                }

                if ((this.get('createAccount') || isAuthenticated) && billingInfo.getDigitalCreditsToAddToCustomerAccount().length > 0) {
                    process.push(this.addDigitalCreditToCustomerAccount);
                }

                process.push(/*this.finalPaymentReconcile, */this.apiCheckout);

                api.steps(process).then(this.onCheckoutSuccess, this.onCheckoutError);

            },
            update: function() {
                var j = this.toJSON();
                return this.apiModel.update(j);
            },
            refresh: function() {
              var me = this;
              this.trigger('beforerefresh');
              return this.apiGet().then(function() {
                me.trigger('refresh');
                // me.runForAllSteps(function() {
                //   this.trigger("sync");
                // });
              });
            },
            runForAllSteps: function(cb) {
                var me = this;
                _.each([
                       'shippingStep',
                       'shippingInfo',
                       'billingInfo'
                ], function(name) {
                    cb.call(me.get(name));
                });
            },
            isReady: function (val) {
                this.set('isReady', val);
            },
            toJSON: function (options) {
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if (!options || !options.helpers) {
                    delete j.password;
                    delete j.confirmPassword;
                }
                return j;
            }
        });
    return CheckoutPage;
});
