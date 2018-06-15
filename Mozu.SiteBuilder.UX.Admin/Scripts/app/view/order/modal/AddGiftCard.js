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
    title: 'Add Gift Card',
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
            boxLabel: 'New Gift Card',
            name: 'cardUse',
            itemId: 'useNewCard',
            inputValue: 'newCard',
            flex: 1,
            handler: function (radio) {
                if (radio.getValue()) {
                    // Determine what is shown and hidden...
                    me.updateDisplayedItems('new');
                    this.createPciProcessor();
                }
            },
            scope: this
        });

        this.existingCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: 'Order Gift Cards',
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
            boxLabel: 'Saved Gift Cards',
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

        //TODO: 
        // This function was copied and pasted from AddPayment.js
        // we need to change this to make sure we get all the payment information from the order. 

        // determine which object is checked, or hidden/shown on the payment modal.
        // Enable previous payment, have it selected.

        //TODO: filter for gift card payments only. 
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
                {
                    // payment form
                    this.cardContainer.add(this.createSavedCardForm());
                }
                break;
            case 'existing':
                {
                    // payment form
                    this.cardContainer.add(this.createExistingCardForm());
                    // billing form
                }
                break;
                //fall through if case 'new':
            default:
                {
                    // payment form
                    this.cardContainer.add(this.createNewCardForm());
                }
                break;
        }
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

        this.savedPaymentPicker = Ext.create('Taco.view.order.widget.ReusePaymentPickerField', {
            showLabel: false,
            name: 'savedPaymentPicker',
            itemId: 'savedPaymentPicker',
            fieldLabel: "Saved Cards on Order",
            labelStyle: "padding-top:16px;",
            store: savedPaymentStore,
            width: 500,
            allowBlank: false,
            margin: '0px 5px 0px 5px',
            listeners: {
                select: {
                    fn: function (combo, record) {
                        // Call a method to update the billing info stuff related to this card!!
                        console.log('update billing info was here. replace with something relevant.');
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
                            fieldLabel: 'Amount',
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
                            fieldLabel: 'CVV',
                            margin: '0px 5px 0px 5px',
                        }
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

        //TODO: copied and pasted from AddPayment. Data, ui, and fields should be modified to be GC specific. 
        var me = this;

        //TODO: filter for giftcard payments?
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

        this.existingPaymentPicker = Ext.create('Taco.view.order.widget.ReusePaymentPickerField', {
            showLabel: true,
            name: 'existingPaymentPicker',
            itemId: 'existingPaymentPicker',
            fieldLabel: "Existing Gift Cards on Order",
            labelStyle: "padding-top:16px;",
            store: curPaymentStore,
            width: 500,
            allowBlank: false,
            margin: '0px 5px 0px 5px',
            emptyText: "Select a Giftcard",
            displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{cardType} {cardNumber} </tpl>'),
            listConfig: {
                loadingText: 'Loading...',
                emptyText: 'No matching payments found.',
                // Custom rendering template for each item
                // Card type (Visa) Card Mask (****) exp (month/year)
                getInnerTpl: function () {
                    return '<tpl for="."><div class="taco-payment-item"><span style="width:30px">{cardType}</span><span style="width:140px">{cardNumber}</span></div></tpl>';
                }
            },
            initComponent: function (eOpts) {
                var me = this;

                me.callParent(arguments);
            }
        });

        this.checkBalanceButton = Ext.widget(
            {
                xtype: 'button',
                itemId: 'existingCheckBalance',
                ui: 'action',
                scale: 'medium',
                text: 'Check Balance',
                margin: '30 0 0 0',
                handler: function (button) {
                    
                    var data = me.getApplyingGiftCardData();

                    me.record.checkGiftCardBalance({
                        jsonData: data.paymentInfo,
                        success: function (response) {
                            me.setLoading(false, me.body);

                            me.getGiftCardBalanceField.value(response);
                            me.newCardBalanceField.show();
                        },
                        failure: function () {
                            me.setLoading(false, me.body);
                        }
                    })

                    me.checkBalanceButton.hide();
                    me.existingCardBalanceField.show();
                }
            }
        );

        this.existingCardBalanceField = Ext.widget(
            {
                xtype: 'currencyfield',
                width: 170,
                currencyCode: this.record.getCurrencyCode(),
                name: 'giftCardBalanceField',
                itemId: 'giftCardBalanceField',
                fieldLabel: 'Balance',
                disabled: true,
                margin: '0px 5px 0px 5px',
                value: '123.45',
                hidden: true
            }

        );


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
                            fieldLabel: 'Amount',
                            validateOnChange: false,
                            selectOnFocus: true,
                            allowBlank: false,
                            minValue: 0.01,
                            margin: '0px 5px 0px 5px',
                            value: this.getDefaultPaymentAmount()
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            items: [
                                this.checkBalanceButton,
                                this.existingCardBalanceField,
                            ]
                            
                        }
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
        //TODO make these fields accurate. We only need number, security code, button for check balanace, and field for balance display. 
        var me = this;
        this.newCardBalanceField = Ext.widget(
            {
                xtype: 'box',
                anchor: 0,
                margin: '20 0 -20 0',
                hidden: true,
                itemId: 'giftCardBalanceField',
                autoEl: {
                    tag: 'h3',
                    html: '$123.45'
                }
            }
        );

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
                            fieldLabel: 'Gift Card Number',
                            margin: '0px 5px 0px 5px',
                            flex: 2
                        },
                        {
                            xtype: 'textfield', 
                            name: 'giftCardSecurityCode', 
                            allowBlank: false,
                            fieldLabel: 'Security Code', 
                            margin: '0px 5px 0px 5px',
                            flex: 1
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
                            name: 'newGiftCardamount',
                            fieldLabel: 'Amount',
                            validateOnChange: false,
                            selectOnFocus: true,
                            allowBlank: false,
                            minValue: 0.01,
                            margin: '0px 5px 0px 5px',
                            value: this.getDefaultPaymentAmount()
                        }, {
                            xtype: 'container',
                            layout: 'vbox',
                            items: [
                                this.newCardBalanceField,
                                {
                                    xtype: 'button',
                                    itemId: 'newCheckBalance',
                                    ui: 'action',
                                    scale: 'medium',
                                    text: 'Check Balance',
                                    margin: '30 0 0 0',
                                    handler: function (button) {
                                        var addCard = this.pciProcessor;
                                        addCard.events.success = function(){
                                            var data = me.getNewGiftCardData();

                                            me.record.checkGiftCardBalance({
                                                jsonData: data.paymentInfo,
                                                success: function (response) {
                                                    me.setLoading(false, me.body);

                                                    me.getGiftCardBalanceField.value(response);
                                                    me.newCardBalanceField.show();
                                                },
                                                failure: function () {
                                                    me.setLoading(false, me.body);
                                                }
                                            })
                                        }

                                        addCard.process();
                                        
                                    }
                                }
                            ]

                        } 
                    ]
                }
            ],
            scope: this
        }, this);
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
                    me.setLoading(false, me.body);
                },
                success: function () {

                    var data = me.getNewGiftCardData();

                    
                    me.record.addGiftCards({
                        jsonData: data,
                        success: function (response) {
                            me.setLoading(false, me.body);
                            var json = Ext.decode(response.responseText, true),
                                data;

                            if (!json) return;

                            data = json.items;
                            me.record.reload();
                            me.saveSuccess(data);
                        },
                        failure: function () {
                            me.setLoading(false, me.body);
                        }
                    })

                }
            },
            settings: {
                apiBase: Taco.paymentApiBaseUrl,
                framePath: "/../../../Assets/pci_receiver.html",
                siteId: me.record.get('siteId') || Taco.app.context.getSiteId(),
                tenantId: me.record.get('tenantId') || Taco.app.context.getTenantId(),
                skipValidation: true
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
            CardType: function () { return 'GiftCard' },
            CardNumber: this.createPciFormField(this.down('[name=giftCardNumber]')),
            CVV: this.createPciFormField(this.down('[name=giftCardSecurityCode]')),
            HiddenCardID: function (id) {
                if (id) me._hiddenCardId = id;
                return me._hiddenCardId;
            }
        };
    },
    getGiftCardBalanceField: function () {
        return this.down('#giftCardBalanceField');
    },
    getApplyingGiftCardData: function () {
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
        };

        return {
            orderId: order.getId(),
            amountToApply: amount,
            paymentInfo: {
                cardNumber: curPayment.data.cardNumber,
                expireMonth: curPayment.data.expireMonth,
                expireYear: curPayment.data.expireYear,
                nameOnCard: curPayment.data.nameOnCard,
                cardType: curPayment.data.cardType,
                billingContact: contactInfo,
                paymentType: 'GiftCard',
                paymentServiceCardId: paymentServiceCardId
            }
            
        };
    },
    getNewGiftCardData: function(){
        var me = this;
        if (me.createNewCardForm) {
            var data = {
                orderId: this.record.getId(),
                amountToApply: this.down('[name=newGiftCardamount]').getValue(),
                paymentInfo: {
                    cardNumber: this.down('[name=giftCardNumber]').getValue(),
                    cardType: "GC",
                    paymentType: 'GiftCard',
                    paymentServiceCardId: me._hiddenCardId
                }
            }
            return data;
        }
        return {}
    },
    doSave: function () {
        this.setLoading({
            msg: "Applying gift cards"
        }, this.body);

        if (this.newCardRadio && this.newCardRadio.getValue()) {
            if (this.getNewGiftCardData.paymentInfo.paymentServiceCardId) {
                var me = this,
               data = this.getNewGiftCardData();

                this.record.addGiftCards({
                    jsonData: data,
                    success: function (response) {
                        me.setLoading(false, me.body);
                        var json = Ext.decode(response.responseText, true),
                            data;

                        if (!json) return;

                        data = json.items;
                        me.record.reload();
                        me.saveSuccess(data);
                    },
                    failure: function () {
                        me.setLoading(false, me.body);
                    }
                });
                return;
            }
            this.pciProcessor.process();
            
        } else {

            var me = this,
                data = this.getApplyingGiftCardData();

            this.record.addGiftCards({
                jsonData: data,
                success: function (response) {
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true),
                        data;

                    if (!json) return;

                    data = json.items;
                    me.record.reload();
                    me.saveSuccess(data);
                },
                failure: function () {
                    me.setLoading(false, me.body);
                }
            });
        }

    }
    
},
/* class definition-time function */
function () {
    var me = this;

    Ext.Loader.loadScript({
        url: '/admin/scripts/resources/lib/pci-temp.js',
        onLoad: function () {
            me.PCIaaS = window.PCIaaS;
            if(Taco.app) Taco.app.fireEvent('pciloaded', me.PCIaaS);
        }
    });
});
