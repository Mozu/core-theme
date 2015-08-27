/**
 * @class Taco.view.order.modal.AddPayment
 */

Ext.define('Taco.view.order.modal.AddPayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.store.ConfiguredCreditCards',
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Taco.shared.view.form.Address'
    ],

    scale: 'large',
    title: 'Add Payment',
    models: ['Taco.model.CheckoutSettings'],

    layout:"anchor",

    // the default amount to set in the amount field;  If not provided when instantiating the editor, the amount will be auto extracted from the record;
    defaultPaymentAmount : 0,

    initComponent: function () {
        var me = this,
            balance = this.record.getNewPaymentAmountHint(),
            formItems = [];

        // moved the payment form into a method so that it can be overwritten by a subclass (add manual payment)
        formItems.push(this.getPaymentForm());

        // checkbox to toggle between primary billing address
        formItems.push({
            xtype: 'checkboxfield',
            anchor:"0",
            fieldLabel: 'Payment Address',
            boxLabel: 'Use primary billing address',
            name: 'sameAsBilling',
            margin:"0 0 20 0",
            checked: true,
            itemId: "sameAsBillingCheckbox",
            scope: this,
            handler: this.toggleExtraInfo
        });

        formItems.push({
            xtype: 'component',
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
                    '<div>homePhone: {homePhone:stripTags}</div>',
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
        })

        this.billingContactRecord =Ext.create('Taco.model.Contact',this.record.data.billingContact);
        
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

        formItems.push(this.addressForm);

        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'anchor'
            },
            items: formItems
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.createPciProcessor();

        this.mon(this, "boxready", function () {
            if (!this.hasValidBillingContact()) {
                // no valid billing contact, need to force the form to open;
                this.toggleExtraInfo(null, false);
                var sameAsBillingCheckbox = this.down("#sameAsBillingCheckbox");
                sameAsBillingCheckbox.hide();
            } else {
                this.toggleExtraInfo(null, true);
            }
        }, this)
    },


    // method meant to be overwritten by sub class;
    getPaymentForm: function () {

        return {
            xtype: 'container',
            anchor: 0,
            items: [{
                xtype: 'container',
                anchor: 0,
                layout: 'hbox',
                defaults: {
                    margin: '0 20 0 0'
                },
                items: [
                    {
                        xtype: 'textfield',
                        name: 'nameOnCard',
                        allowBlank: false,
                        fieldLabel: 'Name on Card',
                        flex: 1
                    }, {
                        xtype: 'currencyfield',
                        width: 180,
                        currencyCode: this.record.getCurrencyCode(),
                        name: 'amount',
                        fieldLabel: 'Amount',
                        validateOnChange: false,
                        selectOnFocus: true,
                        allowBlank: false,
                        minValue:0.01,
                        value: this.getDefaultPaymentAmount()
                    }, {
                        xtype: 'combobox',
                        width: 180,
                        name: 'cardType',
                        itemId: 'cardType',
                        valueField: 'Key',
                        displayField: 'Value',
                        fieldLabel: 'Card Type',
                        queryMode: 'local',
                        margin: '0 0 0 0',
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
                    margin: '0 20 0 0'
                },
                items: [
                    {
                        xtype: 'textfield',
                        name: 'cardNumber',
                        itemId: 'cardNumber',
                        allowBlank: false,
                        fieldLabel: 'Card Number',
                        flex: 1
                    }, {
                        xtype: 'numberfield',
                        width: 120,
                        name: 'expireMonth',
                        hideTrigger: true,
                        mouseWheelEnabled: false,
                        allowBlank: false,
                        fieldLabel: 'Exp Month',
                        validateOnChange: false,
                        maxLength: 2,
                        enforceMaxLength: true,
                        minValue: 1,
                        maxValue: 12
                    }, {
                        xtype: 'numberfield',
                        width: 120,
                        name: 'expireYear',
                        hideTrigger: true,
                        allowBlank: false,
                        maxLength: 4,
                        enforceMaxLength: true,
                        validateOnChange:false,
                        validator: function (value) {
                            if (value && value.length < 4) {
                                return "Year must have 4 digits"
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
                        margin: '0 0 0 0'
                    }
                ]
            }

        ]};
    },


    // need to use the billing address form to validate the billing contact data;
    hasValidBillingContact: function () {        
        var inValidField = this.addressForm.getForm().hasInvalidField();
        return !inValidField
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
                    me.pciProcessor.applyMask();
                    var order = me.record,
                    formValues = me.form.getValues(),
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
                                return
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
            PersistCard: function() { return false; },
            HiddenCardID: function(id) {
                if (id) me._hiddenCardId = id;
                return me._hiddenCardId;
            }
        }
    },

    // returns the amount to populate the payment amount field; override if you need any custom logic to determine this amount;
    getDefaultPaymentAmount: function () {
        var me = this,
            retVal = "",
            authInfo;            

        // only do this if one is not set when instantiating this class;
        if (!this.defaultPaymentAmount) {
            retVal = this.record.getNewPaymentAmountHint()
        } else {
            retVal = this.defaultPaymentAmount;
        }

        retVal = (retVal < 0) ? "" : retVal;
        return retVal;
    },

    doSave: function () {
        this.setLoading(true, this.body);        
        this.pciProcessor.process();
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
