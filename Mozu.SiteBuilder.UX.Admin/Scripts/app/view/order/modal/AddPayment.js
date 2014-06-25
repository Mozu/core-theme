/**
 * @class Taco.view.order.modal.AddPayment
 */

Ext.define('Taco.view.order.modal.AddPayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    scale: 'large',
    title: 'Add Payment',
    models: ['Taco.model.CheckoutSettings'],

    // the default amount to set in the amount field;  If not provided when instantiating the editor, the amount will be auto extracted from the record;
    defaultPaymentAmount : null,

    initComponent: function () {
        var me = this,
            authorizationInfo = this.record.get('authorizationInfo'),
            balance = authorizationInfo.captureAmount || 0;

        //Ext.define('MyReader', {
        //    extend: 'Ext.data.reader.Json',
        //    alias: 'reader.cards-json',
        //    read: function (object) {
        //        var rep = this.callParent([object]);
        //        Ext.Array.each(rep.records, function (rec, idx) {
        //            rec.set('cardName', rec.raw);
        //            rec.set('cardType', rec.raw);
        //        });
        //        return rep;
        //    }
        //});

        var store = Ext.create('Taco.store.ConfiguredCreditCards');



        //    Ext.create('Ext.data.Store', {
        //    autoLoad: false,
        //    fields: ['cardType', 'cardName'],
        //    proxy: {
        //        type: 'ajax',
        //        url: '/admin/app/checkoutsettings/read',
        //        reader: {
        //            type: 'cards-json',
        //            root: 'items.gateway.supportedCards',
        //        }
        //    }
        //});
        
        

        
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'vbox'
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    margin: '0 20 0 0',
                    width: 180
                },
                items: [{
                    xtype: 'textfield',
                    name: 'nameOnCard',
                    allowBlank: false,
                    fieldLabel: 'Name on Card',
                    width: 340
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount',
                    allowBlank: false,
                    value : this.getDefaultPaymentAmount()
                }, {
                    xtype: 'combobox',
                    name: 'cardType',
                    itemId: 'cardType',
                    valueField: 'Key',
                    displayField: 'Value',
                    fieldLabel: 'Card Type',
                    queryMode:'local',
                    margin: '0 0 0 0',
                    allowBlank: false,
                    editable: false,
                    forceSelection: true,
                    store: store
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    margin: '0 20 0 0',
                    width: 120
                },
                items: [{
                    xtype: 'textfield',
                    name: 'cardNumber',
                    itemId: 'cardNumber',
                    allowBlank: false,
                    fieldLabel: 'Card Number',
                    width: 340
                }, {
                    xtype: 'numberfield',
                    name: 'expireMonth',
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    allowBlank: false,
                    fieldLabel: 'Exp Month',
                    minValue: 1,
                    maxValue: 12
                }, {
                    xtype: 'numberfield',
                    name: 'expireYear',
                    hideTrigger: true,
                    allowBlank: false,
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
                    name: 'cvv',
                    itemId: 'cvv',
                    allowBlank: false,
                    fieldLabel: 'CVV',
                    margin: '0 0 0 0',
                    width: 100
                }]
            }, {
                xtype: 'fieldcontainer',
                layout: 'fit',
                fieldLabel: 'Payment Address',
                items: [{
                    xtype: 'checkboxfield',
                    boxLabel: 'Use primary billing address',
                    name: 'sameAsBilling',
                    checked: true,
                    scope: this,
                    handler: this.toggleExtraInfo
                }]
            }, {
                xtype: 'component',
                itemId: 'billingContactInfo',                
                tpl: [
                    '<tpl if="firstName || middleName ||lastName">',
                        '<div>{firstName} {middleName} {lastName}</div>',
                    '</tpl>',
                    '<tpl if="address1">',
                        '<div>{address1}</div>',
                    '</tpl>',
                    '<tpl if="address2">',
                        '<div>{address2}</div>',
                    '</tpl>',
                    '<tpl if="address3">',
                        '<div>{address3}</div>',
                    '</tpl>',
                    '<tpl if="address4">',
                        '<div>{address4}</div>',
                    '</tpl>',
                    
                    '<div>{cityOrTown} {postalOrZipCode} {stateOrProvince} {countryCode}</div>',

                    '<tpl if="homePhone">',
                        '<div>homePhone: {homePhone}</div>',
                    '</tpl>',

                    '<tpl if="workPhone">',
                        '<div>Work Phone: {workPhone}</div>',
                    '</tpl>',

                    '<tpl if="mobilePhone ">',
                        '<div>Mobile Phone: {mobilePhone}</div>',
                    '</tpl>',

                    '<tpl if="email">',
                        '<div>{email}</div>',
                    '</tpl>'
                ],
                data : this.record.data.billingContact
            }, {
                xtype: 'container',
                itemId: 'extraInfo',
                hidden: true,
                layout: {
                    type: 'vbox'
                },
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 25 0 0',
                        width: 230
                    },
                    items: [{
                        xtype: 'textfield',
                        itemId: 'billingFirstName',
                        name: 'firstName',
                        fieldLabel: 'First Name'
                    }, {
                        xtype: 'textfield',
                        name: 'middleName',
                        itemId: 'billingMiddleName',
                        fieldLabel: 'Middle Name'
                    }, {
                        xtype: 'textfield',
                        name: 'lastName',
                        itemId: 'billingLastName',
                        fieldLabel: 'Last Name',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 360
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'address1',
                        itemId: 'billingAddress1',
                        fieldLabel: 'Address 1'
                    }, {
                        xtype: 'textfield',
                        name: 'address2',
                        itemId: 'billingAddress2',
                        fieldLabel: 'Address 2',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 360
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'address3',
                        itemId: 'billingAddress3',
                        fieldLabel: 'Address 3'
                    }, {
                        xtype: 'textfield',
                        name: 'address4',
                        itemId: 'billingAddress4',
                        fieldLabel: 'Address 4',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 170
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'cityOrTown',
                        itemId: 'billingCityOrTown',
                        fieldLabel: 'City'
                    }, {
                        xtype: 'textfield',
                        name: 'stateOrProvince',
                        itemId: 'billingStateOrProvince',
                        fieldLabel: 'State'
                    }, {
                        xtype: 'textfield',
                        name: 'postalOrZipCode',
                        itemId: 'billingPostalOrZipCode',
                        fieldLabel: 'ZIP Code'
                    }, {
                        xtype: 'textfield',
                        name: 'countryCode',
                        itemId: 'billingCountryCode',
                        fieldLabel: 'Country',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 170
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'email',
                        itemId: 'billingEmail',
                        fieldLabel: 'Email'
                    }, {
                        xtype: 'textfield',
                        name: 'homePhone',
                        itemId: 'billingHomePhone',
                        fieldLabel: 'Home Phone'
                    }, {
                        xtype: 'textfield',
                        name: 'workPhone',
                        itemId: 'billingWorkPhone',
                        fieldLabel: 'Work Phone'
                    }, {
                        xtype: 'textfield',
                        name: 'mobilePhone',
                        itemId: 'billingMobilePhone',
                        fieldLabel: 'Mobile Phone',
                        margin: '0 0 0 0'
                    }]
                }]
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.createPciProcessor();

        this.copyBillingInfo();
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
                framePath: "/../../Assets/pci_receiver.html",
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
            authInfo = me.record.data.authorizationInfo;
            if (authInfo && authInfo.captureAmount) {
                retVal = authInfo.captureAmount;
            }
        } else {
            retVal = this.defaultPaymentAmount;
        }

        return retVal;
    },

    doSave: function () {
        this.setLoading(true, this.body);        
        this.pciProcessor.process();
    },

    toggleExtraInfo: function (checkbox, isChecked) {
        var extraInfo = this.down('#extraInfo');

        extraInfo[isChecked ? 'hide' : 'show']();

        this.copyBillingInfo();
    },

    copyBillingInfo: function() {
        var isChecked = this.getForm().findField('sameAsBilling').getValue(),
            billingContact = this.record.get('billingContact'),
            fields = [
                'firstName',
                'fiddleName',
                'lastName',
                'address1',
                'address2',
                'address3',
                'address4',
                'cityOrTown',
                'stateOrProvince',
                'postalOrZipCode',
                'countryCode',
                'email',
                'homePhone',
                'workPhone',
                'mobilePhone'
            ];

        Ext.each(fields, function(fieldName) {
            var field = this.getForm().findField(fieldName);

            if (!field) return;

            field.setValue(billingContact[fieldName]);
        }, this);

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
