/**
 * @class Taco.view.order.modal.AddGiftCard
 */

Ext.define('Taco.view.order.modal.AddGiftCard', {
    extend: 'Taco.view.order.modal.AddPayment',
    requires: [
        'Taco.view.order.widget.GiftCardForm',
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Ext.form.field.Number',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.form.FieldContainer'
    ],

    // need this layout in order for scrollbar showing up to cause the form to resize. criminy...
    layout: "anchor",

    scale: 'medium',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.add_gift_card,
    getBillingForm: Ext.emptyFn,
    hasValidBillingContact: Ext.emptyFn,
    toggleExtraInfo: Ext.emptyFn,
    initComponent: function () {
        var me = this;

        //me.form = Ext.create('Taco.view.order.widget.GiftCardForm', {
        //    order: me.record
        //});

        //me.items = [me.form];

        me.callParent(arguments);
    },

    getPaymentForm: function () {
        var me = this;

        // This pull the existing credit card payments against the order or its
        //   parent order. It passes in the order.
        this.pullOrderPaymentData(this.record);

        // This pulls the saved card from the customer and adds the missing data
        //  to the model for easy import down below.
        this.pullCustomerPaymentData(this.record.customer);

        this.newCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.new_gift_card,
            name: 'cardUse',
            itemId: 'useNewCard',
            inputValue: 'newCard',
            flex: 1,
            handler: function (radio) {
                if (radio.getValue()) {
                    // Determine what is shown and hidden...
                    me.updateDisplayedItems('new');
                }
            },
            scope: this
        });

        this.existingCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.order_gift_cards,
            name: 'cardUse',
            itemId: 'useExistingCard',
            inputValue: 'existingCard',
            disabled: true,
            flex: 1,
            handler: function (radio) {
                if (radio.getValue()) {
                    // Determine what is shown and hidden...
                    me.updateDisplayedItems('existing');
                }
            },
            scope: this
        });

        this.savedCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.saved_gift_cards,
            name: 'cardUse',
            itemId: 'useSavedCard',
            inputValue: 'savedCard',
            disabled: true,
            flex: 1,
            handler: function (radio) {
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
                this.existingCardRadio, this.newCardRadio
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

    setDisplayedItems: function () {
        var hasGiftCardPayments = (this.currentGiftCardPayments && this.currentGiftCardPayments.length > 0);
        var hasSavedPayment = (this.savedPayments && this.savedPayments.length > 0) || false;

        // Ext is dumb, and this is the method to enable/disable the field.
        //  I have to ! the boolean because we want the opposite in this case.
        this.existingCardRadio.setDisabled(!hasGiftCardPayments);
        this.existingCardRadio.setValue(hasGiftCardPayments);

        // If we have saved payments, but also have current payments, we don't default to the saved card view.
        this.savedCardRadio.setDisabled(true);
        //this.savedCardRadio.setValue(hasSavedPayment && !hasGiftCardPayments);

        // If we have no other payments, default to the new card radio
        this.newCardRadio.setValue(!hasGiftCardPayments);
        // This should be done if there are no saved cards on the customer or existing cards on the order.
        this.cardSelection.setVisible(hasGiftCardPayments);
    },

    updateDisplayedItems: function (clickedItem) {
        this.cardContainer.removeAll();
        switch (clickedItem) {
            case 'saved':
                this.cardContainer.add(this.createSavedCardForm());
                break;
            case 'existing':
                this.cardContainer.add(this.createExistingCardForm());
                break;
            //fall through if case 'new':
            default:
                this.cardContainer.add(this.createNewCardForm());
                break;
        }
    },

    // Enables creation of a "Get Balance" button and field unique to each of the existing/saved/new views.
    // This is mainly done because Ext doesn't like to have a component living in multiple places simultaneously on the UI,
    // and keeping a common instance always visible and swapping the rest of the UI is cumbersome.
    generateGetBalanceFields: function (namePrefix) {
        var me = this;

        var balanceDisplayField = Ext.widget(
            {
                xtype: 'currencyfield',
                width: 170,
                currencyCode: this.record.getCurrencyCode(),
                name: namePrefix + 'GiftCardBalanceField',
                itemId: namePrefix + 'GiftCardBalanceField',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.balance,
                readOnly: true,
                margin: '0px 5px 0px 5px',
                hidden: true,
            });

        var checkBalanceButton = Ext.widget(
            {
                xtype: 'button',
                itemId: namePrefix + 'CheckBalanceButton',
                name: namePrefix + 'CheckBalanceButton',
                ui: 'action',
                scale: 'medium',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.check_balance,
                margin: '30 0 0 0',
                handler: function () {
                    me.doGetBalance(function (data) {
                        var value = data.balance;
                        balanceDisplayField.setValue(value);
                        balanceDisplayField.setVisible(true);
                        checkBalanceButton.setVisible(false);
                    });
                }
            });

        var container = Ext.create('Ext.container.Container',
            {
                name: namePrefix + 'CheckBalanceContainer',
                items: [
                    checkBalanceButton,
                    balanceDisplayField
                ]
            });

        // Resets the container and sets whether it is "disabled".
        container.setDisabled = function(value) {
            balanceDisplayField.reset();
            balanceDisplayField.setVisible(false);
            checkBalanceButton.setVisible(true);
            checkBalanceButton.setDisabled(value);
        };

        return container;
    },

    createSavedCardForm: function () {
        //copied and pasted from AddPayment.js. We probably need to modify the ui, fields, and data store 
        // to account for giftcard differences. 
        var me = this;

        var savedPaymentStore = Ext.create("Ext.data.Store", {
            model: 'Taco.model.OrderPayment',
            data: this.savedPayments,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            },
            filters: [{
                property: 'cardType',
                value: /GIFTCARD/
            }]
        });

        var checkBalanceContainer = me.generateGetBalanceFields('saved');
        checkBalanceContainer.setDisabled(true);

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
                change: {
                    fn: function (combo, record) {
                        checkBalanceContainer.setDisabled(!record);
                    }
                }
            }
        });

        var savedCardForm = Ext.create('Ext.form.FieldContainer', {
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
                            },
                            checkBalanceContainer
                        ]
                }
            ],
            scope: this
        }, this);

        if (savedPaymentStore.getCount() === 1 && !savedPaymentStore.getAt(0).get('isExpired')) {
            this.savedPaymentPicker.select(savedPaymentStore.getAt(0));
        } else {
            var curItem;
            for (var i = 0; i < savedPaymentStore.getCount(); i++) {
                curItem = savedPaymentStore.getAt(i);
                if (curItem.get('isDefault')) {
                    if (!curItem.get('isExpired')) {
                        this.savedPaymentPicker.select(curItem);
                    }
                    // Quit the for loop, we found the primary.
                    break;
                }
            }
        }
        return savedCardForm;
    },

    createExistingCardForm: function () {
        var me = this;
        var order = this.record;

        var curPaymentStore = Ext.create("Ext.data.Store", {
            model: 'Taco.model.OrderPayment',
            data: this.currentGiftCardPayments,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        });

        var checkBalanceContainer = me.generateGetBalanceFields('existing');
        checkBalanceContainer.setDisabled(true);

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
            emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.select_giftcard,
            displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{cardType} {cardNumber} </tpl>'),
            listConfig: {
                loadingText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.loading,
                emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.no_matching_payments,
                // Custom rendering template for each item
                // Card type (Visa) Card Mask (****) exp (month/year)
                getInnerTpl: function () {
                    return '<tpl for="."><div class="taco-payment-item"><span style="width:30px">{cardType}</span><span style="width:140px">{cardNumber}</span></div></tpl>';
                }
            },
            listeners: {
                change: {
                    fn: function (combo, record) {
                        checkBalanceContainer.setDisabled(!record);
                    }
                }
            },
            initComponent: function (eOpts) {
                var me = this;

                me.callParent(arguments);
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
                                validateOnChange: true,
                                selectOnFocus: true,
                                allowBlank: false,
                                minValue: 0.01,
                                margin: '0px 5px 0px 5px',
                                value: this.getDefaultPaymentAmount(),
                                validator: function (value) {
                                    var balanceField = me.query('[name="existingGiftCardBalanceField"]')[0];
                                    if (!balanceField || balanceField.value === null) {
                                        return true;
                                    } else if (balanceField.parseValue(value[0]) <= balanceField.value) {
                                        return true;
                                    } else {
                                        return Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.amount_cannot_exceed_card;
                                    }
                                }
                            },
                            checkBalanceContainer
                        ]
                }
            ],
            scope: this
        });

        // figure out how to prepopulate given a single item in the list...
        if (curPaymentStore.getCount() === 1 && !curPaymentStore.getAt(0).get('isExpired')) {
            this.existingPaymentPicker.select(curPaymentStore.getAt(0));
        }

        return existingCardForm;
    },

    createNewCardForm: function () {
        var me = this;

        var checkBalanceContainer = me.generateGetBalanceFields('new');

        return Ext.create('Ext.form.FieldContainer', {
            name: 'addNewCard',
            width: '100%',
            items:
                [
                    {
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
                                    name: 'giftCardNumber',
                                    allowBlank: false,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.gift_card_number,
                                    margin: '0px 5px 0px 5px',
                                    flex: 2,
                                    listeners: {
                                        focus: {
                                            fn: function () {
                                                this.prevValue = this.value || "";
                                            }
                                        },
                                        blur: {
                                            fn: function () {
                                                this.currentValue = this.value || "";
                                                if (this.prevValue !== this.currentValue) {
                                                    checkBalanceContainer.setDisabled(false);
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    name: 'giftCardSecurityCode',
                                    allowBlank: true,
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.security_code,
                                    margin: '0px 5px 0px 5px',
                                    flex: 1,
                                    listeners: {
                                        focus: {
                                            fn: function () {
                                                this.prevValue = this.value || "";
                                            }
                                        },
                                        blur: {
                                            fn: function () {
                                                this.currentValue = this.value || "";
                                                if (this.prevValue !== this.currentValue) {
                                                    checkBalanceContainer.setDisabled(false);
                                                }
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
                                    xtype: 'currencyfield',
                                    width: 170,
                                    currencyCode: this.record.getCurrencyCode(),
                                    name: 'newCardAmount',
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.amount,
                                    validateOnChange: true,
                                    selectOnFocus: true,
                                    allowBlank: false,
                                    minValue: 0.01,
                                    margin: '0px 5px 0px 5px',
                                    value: this.getDefaultPaymentAmount(),
                                    validator: function (value) {
                                        var balanceField = me.query('[name="newGiftCardBalanceField"]')[0];
                                        if (!balanceField || balanceField.value === null) {
                                            return true;
                                        } else if (balanceField.parseValue(value[0]) <= balanceField.value) {
                                            return true;
                                        } else {
                                            return Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.amount_cannot_exceed_card;
                                        }
                                    }
                                },
                                checkBalanceContainer
                            ]
                    }
                ],
            scope: this
        }, this);
    },

    /**
     * @private
     */
    getPCIaaS: function () {
        return this.self.PCIaaS;
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
     * Return a nice adapter that the PCI-as-a-service lib can use to read all our form fields.
     *
     * @private
     * @return {object} The adapter.
     */
    getPciFieldsAdapter: function () {
        var me = this;
        return {
            CardType: function () { return 'GIFTCARD' },
            CardNumber: this.createPciFormField(this.down('[name=giftCardNumber]')),
            CVV: this.createPciFormField(this.down('[name=giftCardSecurityCode]')),
            HiddenCardID: function (id) {
                if (id) me._hiddenCardId = id;
                return me._hiddenCardId;
            }
        };
    },

    registerNewCardAndAddToOrder: function () {
        var me = this,
            PCI = me.getPCIaaS();

        if (!PCI) {
            Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.unable_communicate_payment_service, 'error');
            return;
        }

        var pciProcessor = PCI({
            fields: me.getPciFieldsAdapter(),
            events: {
                //replacing the default error handling that thows js error with one that uses our error handling pattern and closes the loading indicator
                error: function (errorObj) {
                    var errors = []
                    for (var i = 0; i < errorObj.length; i++) {
                        errors.push("PCIaaS Error " + errorObj[i].majorCode + ': ' + errorObj[i].minorCode + ': ' + errorObj[i].message);
                    };
                    Taco.app.fireEvent('setmessage', errors.join(), 'error');
                    me.setLoading(false, me.body);
                },
                success: function () {
                    pciProcessor.applyMask();
                    me.addGiftCardPaymentToOrder(me.getNewGiftCardData());
                }
            },
            settings: {
                apiBase: Taco.paymentApiBaseUrl,
                framePath: "/../../../Assets/pci_receiver.html",
                siteId: me.record.get('siteId') || Taco.app.context.getSiteId(),
                tenantId: me.record.get('tenantId') || Taco.app.context.getTenantId(),
                skipValidation: true,
                giftCardBalanceCall: false
            }
        });
        pciProcessor.process();
    },

    getNewGiftCardData: function () {
        var me = this;
        if (me.createNewCardForm) {
            var data = {
                orderId: this.record.getId(),
                amount: this.down('[name=newCardAmount]').getValue(),
                paymentType: 'GiftCard',
                billingInfo: {
                    paymentServiceCardId: me._hiddenCardId,
                    cardType: "GIFTCARD",
                    cardNumber: this.down('[name=giftCardNumber]').getValue()
                },
                billingContact: {}
            }
            return data;
        }
        return {}
    },

    getExistingGiftCardData: function () {
        var me = this;
        var order = this.record;

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

        return {
            orderId: order.getId(),
            amount: amount,
            paymentType: 'GiftCard',
            billingInfo: {
                paymentServiceCardId: paymentServiceCardId,
                nameOnCard: curPayment.data.nameOnCard,
                cardType: curPayment.data.cardType || 'GIFTCARD',
                cardNumber: curPayment.data.cardNumber,
                expireMonth: curPayment.data.expireMonth,
                expireYear: curPayment.data.expireYear
            },
            billingContact: {
                email: curPayment.data.billingContact.email
            }
        };
    },

    makeGetBalancePayload: function () {
        var me = this;
        var curPayment;
        var payload = {
            CardType: 'GiftCard'
        };

        if (me.newCardRadio.getValue()) {
            payload.CardNumberPart = this.down('[name=giftCardNumber]').getValue();
            payload.CVV = this.down('[name=giftCardSecurityCode]').getValue();
        }
        else if (me.existingCardRadio.getValue()) {
            curPayment = me.existingPaymentPicker.findRecordByValue(me.existingPaymentPicker.getSubmitValue());
            payload.CardNumberPart = curPayment.data.cardNumber;
            payload.HiddenCardId = curPayment.data.paymentServiceCardId;
        } else {
            curPayment = me.savedPaymentPicker.findRecordByValue(me.savedPaymentPicker.getSubmitValue());
            payload.CardNumberPart = curPayment.data.cardNumber;
            payload.HiddenCardId = curPayment.data.id;
        }

        return payload;
    },

    doGetBalance: function (successFunc) {
        var me = this;

        me.setLoading({
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.retrieving_balance
        }, me.body);

        var PCI = me.getPCIaaS();
        if (!PCI) return;

        var payload = me.makeGetBalancePayload();

        var pciProcessor = PCI({
            fields: {
                HiddenCardID: function () { return payload.HiddenCardId; }
            },
            events: {
                //replacing the default error handling that thows js error with one that uses our error handling pattern and closes the loading indicator
                error: function (errorObj) {
                    var errors = [];
                    for (var i = 0; i < errorObj.length; i++) {
                        errors.push("PCIaaS Error " + errorObj[i].majorCode + ': ' + errorObj[i].minorCode + ': ' + errorObj[i].message);
                    };
                    Taco.app.fireEvent('setmessage', errors.join(), 'error');
                    me.setLoading(false, me.body);
                },
                success: function (data) {
                    me.setLoading(false, me.body);
                    successFunc(data);
                }
            },
            settings: {
                apiBase: Taco.paymentApiBaseUrl,
                framePath: "/../../../Assets/pci_receiver.html",
                siteId: me.record.get('siteId') || Taco.app.context.getSiteId(),
                tenantId: me.record.get('tenantId') || Taco.app.context.getTenantId(),
                skipValidation: true,
                giftCardBalanceCall: true
            }
        });
        me.setLoading(true, me.body);
        pciProcessor.process(JSON.stringify(payload));
    },
    doSave: function () {
        var self = this;
        this.setLoading({
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.applying_gift_cards
        }, this.body);
        var prefix;
        if (self.newCardRadio && self.newCardRadio.getValue()) {
            prefix = 'new';
        } else {
            prefix = 'existing';
        }
        var alreadyCheckedBalance = true;
        var balanceField = this.query('[name="' + prefix + 'GiftCardBalanceField"]')[0];
        if (balanceField.getValue() === null) {
            alreadyCheckedBalance = false;
        }

        if (!alreadyCheckedBalance) {
            this.doGetBalance(function (data) {
                    // Check amount to add value and compare to balance 
                    var amount = self.query('[name="' + prefix + 'CardAmount"]')[0].getValue();
                    if (amount > data.balance) {
                        Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.amount_exceeds_gift_card, 'error');
                        self.query('[name="' + prefix + 'CheckBalanceButton"]')[0].setVisible(false);
                        balanceField.setValue(data.balance);
                        balanceField.setVisible(true);
                    } else {
                        if (self.newCardRadio && self.newCardRadio.getValue()) {
                            self.registerNewCardAndAddToOrder();
                        } else {
                            self.addGiftCardPaymentToOrder(self.getExistingGiftCardData());
                        }
                    }     
                
            });
        } else {
            // At this point we shouldn't need to do any amount comparison because 
            // a balance call has already been made, populating the balance field
            // there should be validation on the Amount field ensuring that it never exceeds
            // the value in the balance field if it exists. 
            if (this.newCardRadio && this.newCardRadio.getValue()) {
                this.registerNewCardAndAddToOrder();
            } else {
                this.addGiftCardPaymentToOrder(this.getExistingGiftCardData());
            }
        }

       
    },

    addGiftCardPaymentToOrder: function (data) {
        var me = this;
        this.record.addGiftCards({
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true);
                if (!json) return;

                me.record.reload();
                me.saveSuccess(json.items);
            },
            failure: function () {
                me.setLoading(false, me.body);
            }
        });
    }
},

    /* class definition-time function */
    function () {
        var me = this;

        Ext.Loader.loadScript({
            url: '/admin/scripts/resources/lib/pci-temp.js',
            onLoad: function () {
                me.PCIaaS = window.PCIaaS;
                if (Taco.app) Taco.app.fireEvent('pciloaded', me.PCIaaS);
            }
        });
    });
