/**
 * @class Taco.view.order.modal.AddPayment
 */
Ext.define('Taco.view.order.modal.AddPayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.store.ConfiguredCreditCards',
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Taco.shared.view.form.Address',
        'Taco.core.ux.form.TextField',
        'Taco.view.order.widget.ReusePaymentPickerField'
    ],

    scale: 'large',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.add_payment,
    models: ['Taco.model.CheckoutSettings'],

    layout: "anchor",
    isLoading: false,

    // the default amount to set in the amount field;  If not provided when instantiating the editor, the amount will be auto extracted from the record;
    defaultPaymentAmount: 0,
    currentPayments: null,
    savedPayments: null,

    initComponent: function () {
        var me = this,
            balance = this.record.getNewPaymentAmountHint(),
            formItems = [];

        // moved the payment form into a method so that it can be overwritten by a subclass (add manual payment)
        formItems.push(this.getPaymentForm());

        // checkbox to toggle between primary billing address
        formItems.push(this.getBillingForm());

        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'anchor'
            },
            items: formItems
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.mon(this, "boxready", function() {
            this.setModalLoading(this.isLoading);
            if (!this.hasValidBillingContact()) {
                // no valid billing contact, need to force the form to open;
                this.toggleExtraInfo(null, false);
                var sameAsBillingCheckbox = this.down("#sameAsBillingCheckbox");
                sameAsBillingCheckbox ? sameAsBillingCheckbox.hide() : null;
                //sameAsBillingCheckbox.hide();
            } else {
                this.toggleExtraInfo(null, true);
            }
            if (!this.isLoading) {
                this.setDisplayedItems();
            }

        }, this);
    },

    setDisplayedItems: function () {
        // determine which object is checked, or hidden/shown on the payment modal.
        // Enable previous payment, have it selected.
        var hasCurrentPayment = (this.currentPayments && this.currentPayments.length > 0);
        var hasSavedPayment = (this.savedPayments && this.savedPayments.length > 0) || false;
        var hasPayments = hasCurrentPayment || hasSavedPayment;

        // Ext is dumb, and this is the method to enable/disable the field.
        //  I have to ! the boolean because we want the opposite in this case.
        this.existingCardRadio.setDisabled(!hasCurrentPayment);
        this.existingCardRadio.setValue(hasCurrentPayment);

        // If we have saved payments, but also have current payments, we don't default to the saved card view.
        this.savedCardRadio.setDisabled(!hasSavedPayment);
        this.savedCardRadio.setValue(hasSavedPayment && !hasCurrentPayment);

        // If we have no other payments, default to the new card radio
        this.newCardRadio.setValue(!hasPayments);
        // This should be done if there are no saved cards on the customer or existing cards on the order.
        this.cardSelection.setVisible(hasPayments);

        // Determine what is showing after checking above:
        this.existingCardBillingInfo.setVisible(hasPayments);
        this.newCardBillingInfo.setVisible(!hasPayments);
    },

    // method meant to be overwritten by sub class;
    getPaymentForm: function() {
        var me = this;

        // This pull the existing credit card payments against the order or its
        //   parent order. It passes in the order.
        this.pullOrderPaymentData(this.record);

        // This pulls the saved card from the customer and adds the missing data
        //  to the model for easy import down below.
        this.pullCustomerPaymentData(this.record.customer);

        this.newCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.new_credit_card,
            name: 'cardUse',
            itemId: 'useNewCard',
            inputValue: 'newCard',
            flex: 1,
            handler: function(radio) {
                if (radio.getValue()) {
                    // Determine what is shown and hidden...
                    me.updateDisplayedItems('new');

                    this.createPciProcessor();
                }
            },
            scope: this
        });

        this.existingCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.order_credit_cards,
            name: 'cardUse',
            itemId: 'useExistingCard',
            inputValue: 'existingCard',
            disabled: true,
            flex: 1,
            handler: function(radio) {
                if (radio.getValue()) {
                    // Determine what is shown and hidden...
                    me.updateDisplayedItems('existing');
                }
            },
            scope: this
        });

        this.savedCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.saved_credit_cards,
            name: 'cardUse',
            itemId: 'useSavedCard',
            inputValue: 'savedCard',
            disabled: true,
            flex: 1,
            handler: function(radio) {
                if (radio.getValue()) {
                    // Determine what is shown and hidden...
                    me.updateDisplayedItems('saved');
                }
            },
            scope: this
        });

        this.cardSelection = Ext.create('Ext.form.RadioGroup', {
            columns: 3,
            width: '100%',
            vertical: false,
            items: [
                this.existingCardRadio, this.savedCardRadio, this.newCardRadio
            ],
            scope: this
        }, this);

        this.cardContainer = Ext.create('Ext.container.Container', {
            anchor: 0,
            width: '100%',
            itemId: 'cardContainer',
            items: [
            ],
            scope: this
        }, this);

        // This is the final object to return!
        this.paymentContainer = Ext.create('Ext.container.Container', {
            anchor: 0,
            width: '100%',
            items: [
                this.cardSelection, this.cardContainer
            ],
            scope: this
        }, this);

        return this.paymentContainer;
    },

    pullOrderPaymentData: function(order) {
        // Pull the existing payments for the dropdown list!
        this.currentPayments = order.payments().queryBy(function(payment) {
            return payment.get('paymentType') === 'CreditCard';
        });

        this.currentGiftCardPayments = order.payments().queryBy(function (payment) {
            return payment.get('paymentType') === 'GiftCard';
        });

        // Only run if no payments are on the order
        if (this.currentPayments && !this.currentPayments.getCount()) {
            // Pull the parent order payment data.
            this.retrieveParentPaymentData();
        }

        // Retrieve the JSON array from the store.
        this.currentPayments = this.currentPayments.getRange().map(function (payment) { return payment.data; });
        this.currentGiftCardPayments = this.currentGiftCardPayments.getRange().map(function (payment) { return payment.data; });

        // Filter and clear the json array, there isn't a primary so pass false to skip the search
        this.currentPayments = this.filterAndClearArrayDuplicates(this.currentPayments, false);
        this.currentGiftCardPayments = this.filterAndClearArrayDuplicates(this.currentGiftCardPayments, false);
    },

    // private
    retrieveParentPaymentData: function () {
        // If there is a parentOrderId, pull the parent order and get the used payments from it.
        if (this.record.get('parentOrderId') && this.record.get('parentOrderId').length > 0) {
            // This modal needs to be loading!
            this.isLoading = true;
            // pull the parent order, get its payments, add those payments to the this.currentPayments store.;
            this.retrieveOrderPaymentDataAjax(this.record.get('parentOrderId'));
        } else if (this.record.get('parentReturnId') && this.record.get('parentReturnId').length > 0) {
            // This modal needs to be loading!
            this.isLoading = true;
            // if there is a parentReturnId, pull the parent return Id, and then pull the order from its order id.
            var me = this;
            Ext.Ajax.request({
                url: '/admin/app/return/list',
                params: {
                    id: me.record.get('parentReturnId')
                },
                method: 'GET',
                success: function (returnResponse) {
                    // populate the stuff!
                    // remove the loading spinny thing after the payment data is pulled and populated.
                    var returnList = JSON.parse(returnResponse.responseText).items;
                    if (returnList && returnList.length > 0) {
                        var parentOrderId = returnList[0].originalOrderId;
                        me.retrieveOrderPaymentDataAjax(parentOrderId);
                    }
                }
            });
        }
    },

    retrieveOrderPaymentDataAjax: function (orderId) {
        var me = this;
        Ext.Ajax.request({
            url: '/admin/app/order/list',
            params: {
                id: orderId
            },
            method: 'GET',
            success: function (orderResponse) {
                var orderList = JSON.parse(orderResponse.responseText).items;

                // create the store here if it doesn't exist!
                me.currentPayments = me.currentPayments || [];
                me.currentGiftCardPayments = me.currentGiftCardPayments || [];

                if (orderList && orderList.length > 0) {
                    var paymentList = orderList[0].payments;
                    if (paymentList) {
                        for (var i = 0; i < paymentList.length; ++i) {
                            if (paymentList[i].paymentType.toLowerCase() === 'creditcard') {
                                // Add this payment to the currentPayments Store!
                                // Need to do this when there is a currentPayments created and when adding a new one.
                                me.currentPayments.push(paymentList[i]);
                            }
                            if (paymentList[i].paymentType.toLowerCase() === 'giftcard') {
                                me.currentGiftCardPayments.push(paymentList[i]);
                            }
                        }
                    }
                }
                // This is needed because the parent order may have duplicates, and this is inside an async call so it
                //  is done well after the first pass.
                me.currentPayments = me.filterAndClearArrayDuplicates(me.currentPayments, false);
                me.currentGiftCardPayments = me.filterAndClearArrayDuplicates(me.currentGiftCardPayments, false);
                me.setDisplayedItems();
                me.setModalLoading(false);
            }
        });
    },

    // private
    pullCustomerPaymentData: function (customer) {
        // if the customer attached to the record isn't anonymous, check to see if they have cards saved.
        if (!customer || customer.get('isAnonymous') || customer.raw.paymentCards.length <= 0) {
            return;
        }

        // Match customer credit cards with their associated billing info.
        var curSavedPayments = customer.raw.paymentCards;
        var contactList = customer.get('contacts');
        for (var i in curSavedPayments) {
            curSavedPayments[i].cardNumber = curSavedPayments[i].cardNumberPart;
            curSavedPayments[i].isDefault = customer.raw.paymentCards[i].isDefaultPayMethod;

            var foundItem = contactList.find(function(element) {
                return (element.id === curSavedPayments[i].contactId);
            });

            // If this is ever undefined, then there is a bigger problem with the customer's data.
            curSavedPayments[i].billingContact = foundItem;

        }

        // Prune out duplicates here!
        this.savedPayments = this.filterAndClearArrayDuplicates(curSavedPayments, true);
    },

    /**
     * filterAndClearArrayDuplicates - This loops through the array and removes
     *  duplicate entries then sorts the remaining items so that the primary
     *  card is first (if there), the current cards are next, and finally the
     *  expired cards are on the bottom of the list.
     * findPrimary - boolean to determine if a primary is in the list.
     **/
    filterAndClearArrayDuplicates: function (sourceArray, findPrimary) {
        var retVal = [];
        // Basically a hash array
        var keysAdded = {};
        // Data bins to rebuild the 
        var primary = null;
        var current = [];
        var expired = [];

        var test, curKey, curItem;
        // Move the primary location to the front.
        if (findPrimary) {
            for (var j = 0; j < sourceArray.length; ++j) {
                if (sourceArray[j].isDefault) {
                    primary = sourceArray[j];
                    // Remove the primary
                    sourceArray.splice(j, 1);
                    // Add to the beginning of the array.
                    sourceArray.unshift(primary);
                    // Jump out of the array!
                    break;
                }
            }
        }
        // Process as normal, looking for duplicates.
        for (var i = 0; i < sourceArray.length; ++i) {
            curItem = sourceArray[i];
            // Setting expiration date
            curItem.isExpired = this.isCardExpired(curItem);
            // Checking hash for key.
            curKey = this.createKey(curItem).toLowerCase();
            test = keysAdded[curKey];
            // Was the hash already added?
            if (!test) {
                // If not place in the proper bin.
                if (curItem.isDefault && !curItem.isExpired) {
                    primary = curItem;
                } else if (curItem.isExpired ) {
                    expired.push(curItem);
                } else {
                    current.push(curItem);
                }
                keysAdded[curKey] = curKey;
            }
        }

        // Reorder arrays into a single return value.
        // Make sure there is a primary and it isn't expired
        //  'primary' can be set, if it is expired.
        //  Set when 'findPrimary = true'.
        if (primary && !primary.isExpired) {
            retVal.push(primary);
        }
        retVal = retVal.concat(current);
        retVal = retVal.concat(expired);
        return retVal;
    },

    isCardExpired: function (currentItem) {
        if (currentItem.paymentType && currentItem.paymentType.toLowerCase() === 'giftcard') return false;
        // Expiration checks:
        var curDate = new Date();
        var curYear = curDate.getFullYear();
        var curMonth = curDate.getMonth() + 1;
        // Expiration calculation
        return currentItem.expireYear < curYear || currentItem.expireMonth < curMonth && currentItem.expireYear <= curYear;
    },

    createKey: function(paymentObj) {
        var key = (paymentObj.cardType || "") +
            paymentObj.cardNumber +
            (paymentObj.expireMonth || "") +
            (paymentObj.expireYear || "") +
            (paymentObj.nameOnCard || "");

        if (paymentObj.billingContact) {
            key += (paymentObj.billingContact.address1 || "") + (paymentObj.billingContact.cityOrTown || "")
                + (paymentObj.billingContact.countryCode || "") + (paymentObj.billingContact.email || "")
                + (paymentObj.billingContact.firstName || "") + (paymentObj.billingContact.lastName || "")
                + (paymentObj.billingContact.postalOrZipCode || "") + (paymentObj.billingContact.stateOrProvince || "");
        }
        return key;
    },

    createNewCardForm: function () {
        var cardTypeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.ConfiguredCreditCards'
        });
        cardTypeStore.removeAt(cardTypeStore.find('key', 'GIFTCARD'));
        return Ext.create('Ext.form.FieldContainer', {
            name: 'addNewCard',
            width: '100%',
            items:
                [
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        width:'100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [
                                {
                                    xtype: 'textfield',
                                    name: 'nameOnCard',
                                    allowBlank: false,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.name_on_card,
                                    margin: '0px 5px 0px 5px',
                                    flex: 1
                                }, {
                                    xtype: 'currencyfield',
                                    width: 170,
                                    currencyCode: this.record.getCurrencyCode(),
                                    name: 'amount',
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.amount,
                                    validateOnChange: false,
                                    selectOnFocus: true,
                                    allowBlank: false,
                                    minValue: 0.01,
                                    margin: '0px 5px 0px 5px',
                                    value: this.getDefaultPaymentAmount()
                                }, {
                                    xtype: 'combobox',
                                    width: 170,
                                    name: 'cardType',
                                    itemId: 'cardType',
                                    valueField: 'Key',
                                    displayField: 'Value',
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.card_type,
                                    queryMode: 'local',
                                    margin: '0px 5px 0px 5px',
                                    allowBlank: false,
                                    editable: false,
                                    forceSelection: true,
                                    store: cardTypeStore,
                                    listeners: {
                                        scope: this,
                                        'select': function (selection) {
                                            var skipValChk = this.down('#skipValidation');
                                            skipValChk.setValue(false);
                                            if (selection.getValue() === 'OTHER') {
                                                this.down('#skipValidation').show();
                                            }
                                            else {
                                                this.down('#skipValidation').hide();
                                            }
                                        }
                                    }
                                }
                            ]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        width: '100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [
                                {
                                    xtype: 'textfield',
                                    name: 'cardNumber',
                                    itemId: 'cardNumber',
                                    allowBlank: false,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.card_number,
                                    margin: '0px 5px 0px 5px',
                                    flex: 1
                                }, {
                                    xtype: 'numberfield',
                                    width: 110,
                                    name: 'expireMonth',
                                    hideTrigger: true,
                                    mouseWheelEnabled: false,
                                    allowBlank: false,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.exp_month,
                                    validateOnChange: false,
                                    maxLength: 2,
                                    enforceMaxLength: true,
                                    minValue: 1,
                                    maxValue: 12,
                                    margin: '0px 5px 0px 5px'
                                }, {
                                    xtype: 'numberfield',
                                    width: 110,
                                    name: 'expireYear',
                                    hideTrigger: true,
                                    allowBlank: false,
                                    maxLength: 4,
                                    enforceMaxLength: true,
                                    validateOnChange: false,
                                    margin: '0px 5px 0px 5px',
                                    validator: function (value) {
                                        if (value && value.length < 4) {
                                            return Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.year_must_have_four_digits;
                                        }
                                        return true;
                                    },
                                    mouseWheelEnabled: false,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.exp_year
                                }, {
                                    xtype: 'textfield',
                                    width: 100,
                                    name: 'cvv',
                                    itemId: 'cvv',
                                    allowBlank: false,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.cvv,
                                    margin: '0px 5px 0px 5px'
                                }
                            ]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        width: '100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [
                                {
                                    xtype: 'checkbox',
                                    anchor: 0,
                                    margin: "10 0 10 0",
                                    name: 'skipOtherCCTypeValidation',
                                    boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.skip_validation,
                                    checked: false,
                                    itemId: 'skipValidation',
                                }
                            ]
                    }
                ],
            scope: this
        }, this);
    },

    createExistingCardForm: function () {
        var me = this;
        var curPaymentStore = Ext.create("Ext.data.Store", {
            model: 'Taco.model.OrderPayment',
            data: this.currentPayments,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        });

        this.existingPaymentPicker = Ext.create('Taco.view.order.widget.ReusePaymentPickerField', {
            showLabel: true,
            name: 'existingPaymentPicker',
            itemId: 'existingPaymentPicker',
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.existing_cards_on_order,
            labelStyle: "padding-top:16px;",
            store: curPaymentStore,
            width: 500,
            allowBlank: false,
            margin: '0px 5px 0px 5px',
            listeners: {
                select: {
                    fn: function (combo, record) {
                        // Call a method to update the billing info stuff related to this card!!
                        me.updateBillingInfoForSelectedCard(record[0]);
                    }
                }
            }
        });

        var existingCardForm = Ext.create('Ext.form.FieldContainer', {
            name: 'addExistingCard',
            itemId: 'addExistingCard',
            width: '100%',
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        style: {
                            margin: '0 20 0 0'
                        }
                    },
                    items:
                        [
                            this.existingPaymentPicker
                        ]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        style: {
                            margin: '0 20 0 0'
                        }
                    },
                    items:
                        [
                            {
                                xtype: 'currencyfield',
                                width: 170,
                                currencyCode: this.record.getCurrencyCode(),
                                name: 'existingCardAmount',
                                itemId: 'existingCardAmount',
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.amount,
                                validateOnChange: false,
                                selectOnFocus: true,
                                allowBlank: false,
                                minValue: 0.01,
                                margin: '0px 5px 0px 5px',
                                value: this.getDefaultPaymentAmount()
                            }, {
                                xtype: 'textfield',
                                width: 100,
                                name: 'existingCardCvv',
                                itemId: 'existingCardCVV',
                                allowBlank: true,
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.cvv,
                                margin: '0px 5px 0px 5px',
                            }
                        ]
                }
            ],
            scope: this
        }, this);

        // figure out how to prepopulate given a single item in the list...
        if (curPaymentStore.getCount() === 1 && !curPaymentStore.getAt(0).get('isExpired')) {
            this.existingPaymentPicker.select(curPaymentStore.getAt(0));
            this.updateBillingInfoForSelectedCard(curPaymentStore.getAt(0));
        }

        return existingCardForm;
    },

    createSavedCardForm: function () {
        var me = this;

        var savedPaymentStore = Ext.create("Ext.data.Store", {
            model: 'Taco.model.OrderPayment',
            data: this.savedPayments,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        });

        this.savedPaymentPicker = Ext.create('Taco.view.order.widget.ReusePaymentPickerField', {
            showLabel: false,
            name: 'savedPaymentPicker',
            itemId: 'savedPaymentPicker',
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.saved_cards_on_order,
            labelStyle: "padding-top:16px;",
            store: savedPaymentStore,
            width: 500,
            allowBlank: false,
            margin: '0px 5px 0px 5px',
            listeners: {
                select: {
                    fn: function (combo, record) {
                        // Call a method to update the billing info stuff related to this card!!
                        me.updateBillingInfoForSelectedCard(record[0]);
                    }
                }
            }
        });

        var savedCardForm =  Ext.create('Ext.form.FieldContainer', {
            name: 'addSavedCard',
            width: '100%',
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        style: {
                            margin: '0 20 0 0'
                        }
                    },
                    items:
                        [
                            this.savedPaymentPicker
                        ]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        style: {
                            margin: '0 20 0 0'
                        }
                    },
                    items:
                        [
                            {
                                xtype: 'currencyfield',
                                width: 170,
                                currencyCode: this.record.getCurrencyCode(),
                                name: 'savedCardAmount',
                                itemId: 'savedCardAmount',
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.amount,
                                validateOnChange: false,
                                selectOnFocus: true,
                                allowBlank: false,
                                minValue: 0.01,
                                margin: '0px 5px 0px 5px',
                                value: this.getDefaultPaymentAmount()
                            }, {
                                xtype: 'textfield',
                                width: 100,
                                name: 'savedCardCvv',
                                itemId: 'savedCardCVV',
                                allowBlank: true,
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.cvv,
                                margin: '0px 5px 0px 5px',
                            }
                        ]
                }
            ],
            scope: this
        }, this);

        if (savedPaymentStore.getCount() === 1 && !savedPaymentStore.getAt(0).get('isExpired')) {
            this.savedPaymentPicker.select(savedPaymentStore.getAt(0));
            this.updateBillingInfoForSelectedCard(savedPaymentStore.getAt(0));
        } else {
            var curItem;
            for (var i = 0; i < savedPaymentStore.getCount() ; i++) {
                curItem = savedPaymentStore.getAt(i);
                if (curItem.get('isDefault')) {
                    if (!curItem.get('isExpired')) {
                        this.savedPaymentPicker.select(curItem);
                        this.updateBillingInfoForSelectedCard(curItem);
                    }
                    // Quit the for loop, we found the primary.
                    break;
                }
            }
        }
        return savedCardForm;
    },

    createBillingLabel: function () {
        return Ext.widget({
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'billingTitle',
            autoEl: {
                tag: 'h3',
                html: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.billing_address,
            }
        });
    },

    getBillingForm: function () {
        var billingLabel = this.createBillingLabel();

        this.billingCheckbox = Ext.create('Ext.form.field.Checkbox', {
            anchor: 0,
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.use_billing_address_order,
            name: 'sameAsBilling',
            margin: "10 0 10 0",
            checked: true,
            itemId: "sameAsBillingCheckbox",
            scope: this,
            handler: this.toggleExtraInfo
        });

        this.billingContactInfo = Ext.create('Ext.Component', {
            anchor: 0,
            itemId: 'billingContactInfo',
            tpl: [
                '<tpl if="firstName || middleName ||lastName">',
                '<div>{firstName:htmlEncode} {middleName:htmlEncode} {lastName:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address1">',
                '<div>{address1:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address2">',
                '<div>{address2:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address3">',
                '<div>{address3:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address4">',
                '<div>{address4:htmlEncode}</div>',
                '</tpl>',
                '<div>{cityOrTown:htmlEncode} {postalOrZipCod:htmlEncode} {stateOrProvince:htmlEncode} {countryCode:htmlEncode}</div>',
                '<tpl if="homePhone">',
                '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.home_phone + ': {homePhone:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="workPhone">',
                '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.work_phone + ': {workPhone:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="mobilePhone ">',
                '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.mobile_phone + ': {mobilePhone:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="email">',
                '<div>{email}</div>',
                '</tpl>'
            ],
            data: this.record.data.billingContact
        });

        this.billingContactRecord = Ext.create('Taco.model.Contact', this.record.data.billingContact);

        this.addressForm = Ext.create('Taco.shared.view.form.Address', {
            record: this.billingContactRecord,
            itemId: 'extraInfo',
            header: false,
            emailRequired: true,
            addressHasNames: true,
            showCompanyName: true,
            showEmail: true,
            showPhoneNumbers: true,
            showDefaultOptions: false,
            manageHeight: false
        });

        this.newCardBillingInfo = Ext.create('Ext.container.Container', {
            anchor: 0,
            itemId: 'newCardBillingContainer',
            width: '100%',
            items: [
                billingLabel, this.billingCheckbox, this.billingContactInfo, this.addressForm
            ],
            scope: this
        }, this);

        this.existingCardBillingInfo = Ext.create('Ext.container.Container', {
            anchor: 0,
            itemId: 'existingCardBillingContainer',
            items: [],
            width: '100%',
            scope: this
        }, this);

        this.billingInfo = Ext.create('Ext.container.Container', {
            anchor: 0,
            itemId: 'billingInfoContainer',
            width: '100%',
            items: [
                this.newCardBillingInfo, this.existingCardBillingInfo
            ],
            scope: this
        }, this);

        return this.billingInfo;
    },

    updateDisplayedItems: function (clickedItem) {
        this.cardContainer.removeAll();
        switch(clickedItem) {
            case 'saved':
                {
                    // payment form
                    this.cardContainer.add(this.createSavedCardForm());
                    // billing form
                    this.newCardBillingInfo.hide();
                    this.existingCardBillingInfo.show();

                }
                break;
            case 'existing':
                {
                    // payment form
                    this.cardContainer.add(this.createExistingCardForm());
                    // billing form
                    this.newCardBillingInfo.hide();
                    this.existingCardBillingInfo.show();
                }
                break;
            case 'new':
            // Fall through!!
            default:
                {
                    // payment form
                    this.cardContainer.add(this.createNewCardForm());
                    // billing form
                    this.newCardBillingInfo.show();
                    this.existingCardBillingInfo.hide();
                }
                break;
        }
    },

    updateBillingInfoForSelectedCard: function (record) {
        var billingLabel = this.createBillingLabel();

        this.existingBillingContactInfo = Ext.create('Ext.Component', {
            anchor: 0,
            itemId: 'existingBillingContactInfo',
            tpl: [
                '<tpl if="firstName || middleName ||lastName">',
                '<div>{firstName:htmlEncode} {middleName:htmlEncode} {lastName:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address1">',
                '<div>{address1:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address2">',
                '<div>{address2:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address3">',
                '<div>{address3:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="address4">',
                '<div>{address4:htmlEncode}</div>',
                '</tpl>',
                '<div>{cityOrTown:htmlEncode} {postalOrZipCod:htmlEncode} {stateOrProvince:htmlEncode} {countryCode:htmlEncode}</div>',
                '<tpl if="homePhone">',
                '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.home_phone + ': {homePhone:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="workPhone">',
                '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.work_phone + ': {workPhone:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="mobilePhone ">',
                '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.mobile_phone + ': {mobilePhone:htmlEncode}</div>',
                '</tpl>',
                '<tpl if="email">',
                '<div>{email}</div>',
                '</tpl>'
            ],
            data: record.data.billingContact
        });
        // Update the current billing info here!
        this.down('#existingCardBillingContainer').removeAll();
        this.down('#existingCardBillingContainer').add(billingLabel);
        this.down('#existingCardBillingContainer').add(this.existingBillingContactInfo);

    },

    // need to use the billing address form to validate the billing contact data;
    hasValidBillingContact: function () {
        var inValidField = this.addressForm.getForm().hasInvalidField();
        return !inValidField;
    },

    setModalLoading: function (value) {
        this.setLoading(value);
        this.isLoading = value;
    },

    /**
     * Create a PCIaaS form field.
     *
     * @private
     */
    createPciFormField: function (field) {
        return function (val) {
            if (val) {
                return field.setValue(val);
            }
            return field.getValue();
        }
    },

    /**
     * Create a PCIaaS processor.
     *
     * @private
     */
    createPciProcessor: function () {
        var me = this,
            PCI = me.getPCIaaS();

        if (!PCI) {
            return me.mon(Taco.app, 'pciloaded', me.createPciProcessor, me);
        }



        me.pciProcessor = PCI({
            fields: me.getPciFieldsAdapter(),
            events: {
                //replacing the default error handling that thows js error with one that uses our error handling pattern and closes the loading indicator
                error: function (errorObj) {
                    var errors = []
                    for (var i = 0; i < errorObj.length; i++) {
                        errors.push("PCIaaS Error " + errorObj[i].majorCode + ': ' + errorObj[i].minorCode + ': ' + errorObj[i].message);
                    };
                    Taco.app.fireEvent('setmessage', errors.join(), 'error');
                    me.setLoading(false,me.body);
                },
                success: function () {
                    var formValues = me.form.getValues();

                    me.pciProcessor.applyMask();

                    var order = me.record,
                        billingInfo = {
                            isSameBillingShippingAddress: false,
                            paymentServiceCardId: formValues.paymentServiceCardId,
                            nameOnCard: formValues.nameOnCard,
                            cardType: formValues.cardType,
                            cardNumber: formValues.cardNumber,
                            expireMonth: formValues.expireMonth,
                            expireYear: formValues.expireYear
                        },
                        contactInfo = {
                            email: formValues.email,
                            firstName: formValues.firstName,
                            middleName: formValues.middleName,
                            lastName: formValues.lastName,
                            address1: formValues.address1,
                            address2: formValues.address2,
                            address3: formValues.address3,
                            address4: formValues.address4,
                            cityOrTown: formValues.cityOrTown,
                            countryCode: formValues.countryCode,
                            postalOrZipCode: formValues.postalOrZipCode,
                            stateOrProvince: formValues.stateOrProvince,
                            homePhone: formValues.homePhone,
                            mobilePhone: formValues.mobilePhone,
                            workPhone: formValues.workPhone
                        },
                        amount = formValues.amount;

                    billingInfo.paymentServiceCardId = me._hiddenCardId;

                    me.setLoading(true, me.body);

                    order.addPayment({
                        jsonData: {
                            orderId: order.getId(),
                            amount: amount,
                            billingInfo: billingInfo,
                            billingContact: contactInfo,
                            paymentType: 'CreditCard'
                        },
                        success: function (response) {
                            me.setLoading(false, me.body);
                            var json = Ext.decode(response.responseText, true);
                            if (!json || !json.success) {
                                return;
                            }

                            order.reload();
                            me.saveSuccess(json);
                        },
                        failure: function (response) {
                            me.setLoading(false, me.body);
                            order.reload();
                            // close the dialog
                            me.close();
                        }
                    });
                }
            },
            settings: {
                apiBase: Taco.paymentApiBaseUrl,
                framePath: "/../../../Assets/pci_receiver.html",
                siteId: me.record.get('siteId') || Taco.app.context.getSiteId(),
                tenantId: me.record.get('tenantId') || Taco.app.context.getTenantId()
            }
        });
    },

    /**
     * @private
     */
    getPCIaaS: function () {
        return this.self.PCIaaS;
    },

    /**
     * Return a nice adapter that the PCI-as-a-service lib can use to read all our form fields.
     *
     * @private
     * @return {object} The adapter.
     */
    getPciFieldsAdapter: function () {
        var me = this;
        return {
            CardType: this.createPciFormField(this.down('#cardType')),
            CardNumber: this.createPciFormField(this.down('#cardNumber')),
            CVV: this.createPciFormField(this.down('#cvv')),
            PersistCard: function () { return false; },
            HiddenCardID: function (id) {
                if (id) me._hiddenCardId = id;
                return me._hiddenCardId;
            },
            SkipValidationOtherCCType: this.createPciFormField(this.down('#skipValidation'))
        };
    },

    // returns the amount to populate the payment amount field; override if you need any custom logic to determine this amount;
    getDefaultPaymentAmount: function () {
        var me = this,
            retVal = "",
            authInfo;

        // only do this if one is not set when instantiating this class;
        if (!this.defaultPaymentAmount) {
            retVal = this.record.getNewPaymentAmountHint();
        } else {
            retVal = this.defaultPaymentAmount;
        }

        retVal = (retVal < 0) ? "" : retVal;
        return retVal;
    },

    getPaymentPayload: function () {
        var me = this;
        var order = this.record;

        var billingInfo = null;
        var contactInfo = null;
        var amount = null;
        var curPayment = null;
        var paymentServiceCardId = null;

        if (me.existingCardRadio && me.existingCardRadio.getValue()) {
            curPayment = me.existingPaymentPicker.findRecordByValue(me.existingPaymentPicker.getSubmitValue());
            amount = this.down('#existingCardAmount').getValue();
            paymentServiceCardId = curPayment.data.paymentServiceCardId;
        } else {
            curPayment = me.savedPaymentPicker.findRecordByValue(me.savedPaymentPicker.getSubmitValue());
            amount = this.down('#savedCardAmount').getValue();
            paymentServiceCardId = curPayment.data.id;
        }

        billingInfo = {
            paymentServiceCardId: paymentServiceCardId,
            nameOnCard: curPayment.data.nameOnCard,
            cardType: curPayment.data.cardType,
            cardNumber: curPayment.data.cardNumber,
            expireMonth: curPayment.data.expireMonth,
            expireYear: curPayment.data.expireYear
        };

        contactInfo = {
            email: curPayment.data.billingContact.email,
            firstName: curPayment.data.billingContact.firstName,
            middleName: curPayment.data.billingContact.middleName,
            lastName: curPayment.data.billingContact.lastName,
            address1: curPayment.data.billingContact.address1,
            address2: curPayment.data.billingContact.address2,
            address3: curPayment.data.billingContact.address3,
            address4: curPayment.data.billingContact.address4,
            cityOrTown: curPayment.data.billingContact.cityOrTown,
            countryCode: curPayment.data.billingContact.countryCode,
            postalOrZipCode: curPayment.data.billingContact.postalOrZipCode,
            stateOrProvince: curPayment.data.billingContact.stateOrProvince,
            homePhone: curPayment.data.billingContact.homePhone,
            mobilePhone: curPayment.data.billingContact.mobilePhone,
            workPhone: curPayment.data.billingContact.workPhone
        };

        return {
            orderId: order.getId(),
            amount: amount,
            paymentType: 'CreditCard',
            billingInfo: billingInfo,
            billingContact: contactInfo
        };
    },

    doSave: function () {
        var me = this;
        this.setLoading(true, this.body);
        // Determine where to pull the data from within this method. This will check which radio button is selected and 
        if (this.newCardRadio && this.newCardRadio.getValue()) {
            this.pciProcessor.process();
        } else {
            // Existing card 
            var order = this.record;
            var payloadData = this.getPaymentPayload();

            order.addPayment({
                jsonData: payloadData,
                success: function (response) {
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        return;
                    }

                    order.reload();
                    me.saveSuccess(json);
                },
                failure: function (response) {
                    me.setLoading(false, me.body);
                    order.reload();
                    // close the dialog
                    me.close();
                }
            });
        }
    },

    toggleExtraInfo: function (checkbox, isChecked) {
        var extraInfo = this.down('#extraInfo'),
            billingContactInfo = this.down("#billingContactInfo");
        extraInfo[isChecked ? 'hide' : 'show']();
        billingContactInfo[isChecked ? 'show' : 'hide']();

        // reset the form when the visibility is toggled;
        this.addressForm.getForm().setValues(this.billingContactRecord.getData());
    }
},
    /* class definition-time function */
    function () {
        var me = this;

        Ext.Loader.loadScript({
            url: '/admin/scripts/resources/lib/pci-temp.js',
            onLoad: function() {
                me.PCIaaS = window.PCIaaS;
                Taco.app && Taco.app.fireEvent('pciloaded', me.PCIaaS);
            }
        });
    });
