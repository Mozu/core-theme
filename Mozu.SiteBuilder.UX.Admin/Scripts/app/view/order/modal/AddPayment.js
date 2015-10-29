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
    title: 'Add Payment',
    models: ['Taco.model.CheckoutSettings'],

    layout: "anchor",

    // the default amount to set in the amount field;  If not provided when instantiating the editor, the amount will be auto extracted from the record;
    defaultPaymentAmount: 0,
    currentPayments: null,

    initComponent: function() {
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
            if (!this.hasValidBillingContact()) {
                // no valid billing contact, need to force the form to open;
                this.toggleExtraInfo(null, false);
                var sameAsBillingCheckbox = this.down("#sameAsBillingCheckbox");
                sameAsBillingCheckbox.hide();
            } else {
                this.toggleExtraInfo(null, true);
            }
        }, this);

        // determine which object is checked, or hidden/shown on the payment modal.
        // Enable previous payment, have it selected.

        if (this.currentPayments && this.currentPayments.length > 0) {
            // Enable previous payment, have it selected.
            this.existingCardRadio.enable(true);
            this.existingCardRadio.setValue(true);
            this.newCardRadio.setValue(false);
            // billing stuff!
            this.newCardBillingInfo.setVisible(false);
            this.existingCardBillingInfo.setVisible(true);
        } else {
            if (this.newCardRadio) {
                // Enable/disable savedCardRadio before this here!
                this.newCardRadio.setValue(true);
                this.existingCardRadio.disable(true);
                this.existingCardRadio.setValue(false);
                // this should be done if there are no saved cards on the customer or existing cards on the order.
                this.cardSelection.setVisible(false);
            }
            this.newCardBillingInfo.setVisible(true);
            this.existingCardBillingInfo.setVisible(false);
        }
    },


    // method meant to be overwritten by sub class;
    getPaymentForm: function() {
        var me = this;

        // Pull the existing payments for the dropdown list!
        this.currentPayments = this.record.payments().queryBy(function (payment) {
            return payment.get('status') !== 'Voided' && payment.get('paymentType') === 'CreditCard';
        });

        /*if (this.record.get('parentOrderId') && this.record.get('parentOrderId').length > 0) {
            // pull the parent order, get its payments, add those payments to the this.currentPayments store.

        }*/

        this.newCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: 'New Credit Card',
            name: 'cardUse',
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
            boxLabel: 'Order Credit Cards',
            name: 'cardUse',
            itemId: 'cardUse',
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
            boxLabel: 'Saved Credit Cards',
            name: 'cardUse',
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
            itemId: 'cardContainer',
            items: [
            ],
            scope: this
        }, this);

        // This is the final object to return!
        this.paymentContainer = Ext.create('Ext.container.Container', {
            anchor: 0,
            items: [
                this.cardSelection, this.cardContainer
            ],
            scope: this
        }, this);

        return this.paymentContainer;
    },

    createNewCardForm: function() {
        return Ext.create('Ext.form.FieldContainer', {
            name: 'addNewCard',
            items:
            [
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
                        {
                            xtype: 'textfield',
                            name: 'nameOnCard',
                            allowBlank: false,
                            fieldLabel: 'Name on Card',
                            margin: '0px 5px 0px 5px',
                            flex: 1
                        }, {
                            xtype: 'currencyfield',
                            width: 170,
                            currencyCode: this.record.getCurrencyCode(),
                            name: 'amount',
                            fieldLabel: 'Amount',
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
                            fieldLabel: 'Card Type',
                            queryMode: 'local',
                            margin: '0px 5px 0px 5px',
                            allowBlank: false,
                            editable: false,
                            forceSelection: true,
                            store: Taco.core.data.StoreManager.getOrCreate({
                                type: 'Taco.store.ConfiguredCreditCards'
                            })
                        }
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
                            xtype: 'textfield',
                            name: 'cardNumber',
                            itemId: 'cardNumber',
                            allowBlank: false,
                            fieldLabel: 'Card Number',
                            margin: '0px 5px 0px 5px',
                            flex: 1
                        }, {
                            xtype: 'numberfield',
                            width: 110,
                            name: 'expireMonth',
                            hideTrigger: true,
                            mouseWheelEnabled: false,
                            allowBlank: false,
                            fieldLabel: 'Exp Month',
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
                                    return "Year must have 4 digits";
                                }
                                return true;
                            },
                            mouseWheelEnabled: false,
                            fieldLabel: 'Exp Year'
                        }, {
                            xtype: 'textfield',
                            width: 100,
                            name: 'cvv',
                            itemId: 'cvv',
                            allowBlank: false,
                            fieldLabel: 'CVV',
                            margin: '0px 5px 0px 5px'
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
            data: this.currentPayments.items,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        });

        this.existingPaymentPicker = Ext.create('Taco.view.order.widget.ReusePaymentPickerField', {
            showLabel: false,
            name: 'existingPaymentPicker',
            itemId: 'existingPaymentPicker',
            fieldLabel: "Existing Cards on Order",
            labelStyle: "padding-top:16px;",
            store: curPaymentStore,
            width: 320,
            allowBlank: false,
            margin: '0px 5px 0px 5px',
            listeners: {
                select: {
                    fn: function (combo, record, index, e) {
                        var currentPayment = combo.store.queryBy(function (payment) {
                            return payment.get('id') === combo.value;
                        });
                        //me.down('#billingContactInfo').setData(currentPayment.items[0].get('billingContact'));
                        // Call a method to update the billing info stuff related to this card!!
                        me.updateBillingInfoForSelectedCard(currentPayment.items[0]);
                    }
                }
            }
        });

        var existingCardForm = Ext.create('Ext.form.FieldContainer', {
            name: 'addExistingCard',
            itemId: 'addExistingCard',
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
                            xtype: 'textfield',
                            width: 100,
                            name: 'existingCardCvv',
                            itemId: 'existingCardCVV',
                            allowBlank: true,
                            fieldLabel: 'CVV',
                            margin: '0px 5px 0px 5px',
                        }
                    ]
                }
            ],
            scope: this
        }, this);

        // figure out how to prepopulate given a single item in the list...
        if (curPaymentStore.getCount() === 1) {
            this.existingPaymentPicker.select(curPaymentStore.getAt(0));
            this.updateBillingInfoForSelectedCard(curPaymentStore.getAt(0));
        }

        return existingCardForm;
    },

    // This is currently not used
    createSavedCardForm: function() {
        return Ext.create('Ext.form.FieldContainer', {
            name: 'addSavedCard',
            items: [
                
            ],
            scope: this
        }, this);
    },

    getSelectedPayment: function (paymentId) {
        var retVal = this.currentPayments.queryBy(function(payment) {
            return payment.get('id') === paymentId;
        });
        return retVal.items[0];
    },

    createBillingLabel: function() {
        return Ext.widget({
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'billingTitle',
            autoEl: {
                tag: 'h3',
                html: 'Billing Address'
            }
        });
    },

    getBillingForm: function () {
        var billingLabel = this.createBillingLabel();

        this.billingCheckbox = Ext.create('Ext.form.field.Checkbox', {
            anchor: 0,
            boxLabel: 'Use the billing address on the order',
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
                    '<div>{firstName:stripTags} {middleName:stripTags} {lastName:stripTags}</div>',
                '</tpl>',
                '<tpl if="address1">',
                    '<div>{address1:stripTags}</div>',
                '</tpl>',
                '<tpl if="address2">',
                    '<div>{address2:stripTags}</div>',
                '</tpl>',
                '<tpl if="address3">',
                    '<div>{address3:stripTags}</div>',
                '</tpl>',
                '<tpl if="address4">',
                    '<div>{address4:stripTags}</div>',
                '</tpl>',
                    '<div>{cityOrTown:stripTags} {postalOrZipCod:stripTags} {stateOrProvince:stripTags} {countryCode:stripTags}</div>',
                '<tpl if="homePhone">',
                    '<div>Home Phone: {homePhone:stripTags}</div>',
                '</tpl>',
                '<tpl if="workPhone">',
                    '<div>Work Phone: {workPhone:stripTags}</div>',
                '</tpl>',
                '<tpl if="mobilePhone ">',
                    '<div>Mobile Phone: {mobilePhone:stripTags}</div>',
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
            items: [
                billingLabel, this.billingCheckbox, this.billingContactInfo, this.addressForm
            ],
            scope: this
        }, this);

        this.existingCardBillingInfo = Ext.create('Ext.container.Container', {
            anchor: 0,
            itemId: 'existingCardBillingContainer',
            items: [],
            scope: this
        }, this);

        this.billingInfo = Ext.create('Ext.container.Container', {
            anchor: 0,
            itemId: 'billingInfoContainer',
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
                    '<div>{firstName:stripTags} {middleName:stripTags} {lastName:stripTags}</div>',
                '</tpl>',
                '<tpl if="address1">',
                    '<div>{address1:stripTags}</div>',
                '</tpl>',
                '<tpl if="address2">',
                    '<div>{address2:stripTags}</div>',
                '</tpl>',
                '<tpl if="address3">',
                    '<div>{address3:stripTags}</div>',
                '</tpl>',
                '<tpl if="address4">',
                    '<div>{address4:stripTags}</div>',
                '</tpl>',
                    '<div>{cityOrTown:stripTags} {postalOrZipCod:stripTags} {stateOrProvince:stripTags} {countryCode:stripTags}</div>',
                '<tpl if="homePhone">',
                    '<div>Home Phone: {homePhone:stripTags}</div>',
                '</tpl>',
                '<tpl if="workPhone">',
                    '<div>Work Phone: {workPhone:stripTags}</div>',
                '</tpl>',
                '<tpl if="mobilePhone ">',
                    '<div>Mobile Phone: {mobilePhone:stripTags}</div>',
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
                        isSameBillingShippingAddress: !!formValues.sameAsBilling,
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
                            billingContact: contactInfo
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
    getPCIaaS: function() {
        return this.self.PCIaaS;
    },

    /**
     * Return a nice adapter that the PCI-as-a-service lib can use to read all our form fields.
     *
     * @private
     * @return {object} The adapter.
     */
    getPciFieldsAdapter: function() {
        var me = this;
        return {
            CardType: this.createPciFormField(this.down('#cardType')),
            CardNumber: this.createPciFormField(this.down('#cardNumber')),
            CVV: this.createPciFormField(this.down('#cvv')),
            PersistCard: function () { return false; },
            HiddenCardID: function (id) {
                if (id) me._hiddenCardId = id;
                return me._hiddenCardId;
            }
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

        //if (me.existingCardRadio && me.existingCardRadio.getValue()) {
        var retVal = me.existingPaymentPicker.getSubmitValue();
        var curPayment = me.existingPaymentPicker.getStore().queryBy(function (payment) {
            return payment.get('id') === retVal;
        });
        curPayment = curPayment.items[0];

        billingInfo = {
            paymentServiceCardId: curPayment.data.paymentServiceCardId,
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

        amount = this.down('#existingCardAmount').getValue();

        return {
            orderId: order.getId(),
            amount: amount,
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
            //}// else case is savedCardRadio!

            //billingInfo.paymentServiceCardId = me._hiddenCardId;

            me.setLoading(true, me.body);

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
function() {
    var me = this;

    Ext.Loader.loadScript({
        url: '/admin/scripts/resources/lib/pci-temp.js',
        onLoad: function() {
            me.PCIaaS = window.PCIaaS;
            Taco.app && Taco.app.fireEvent('pciloaded', me.PCIaaS);
        }
    });
});
