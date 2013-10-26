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
    
    initComponent: function () {
        var me = this;

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
                    fieldLabel: 'Name on Card',
                    width: 340
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount',
                    emptyText: '0'
                }, {
                    xtype: 'combobox',
                    name: 'cardType',
                    itemId: 'cardType',
                    fieldLabel: 'Card Type',
                    margin: '0 0 0 0',
                    allowBlank: false,
                    editable: false,
                    forceSelection: true,
                    store: [
                        ['Visa', 'Visa'],
                        ['Mastercard', 'Mastercard']
                    ]
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
                    fieldLabel: 'Card Number',
                    width: 340
                }, {
                    xtype: 'numberfield',
                    name: 'expireMonth',
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    fieldLabel: 'Exp Month',
                    minValue: 1,
                    maxValue: 12
                }, {
                    xtype: 'numberfield',
                    name: 'expireYear',
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    fieldLabel: 'Exp Year'
                }, {
                    xtype: 'textfield',
                    name: 'cvv',
                    itemId: 'cvv',
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
                    boxLabel: 'Use billing address',
                    name: 'sameAsBilling',
                    checked: true,
                    scope: this,
                    handler: this.toggleExtraInfo
                }]
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
                        name: 'firstName',
                        fieldLabel: 'First Name'
                    }, {
                        xtype: 'textfield',
                        name: 'middleName',
                        fieldLabel: 'Middle Name'
                    }, {
                        xtype: 'textfield',
                        name: 'lastName',
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
                        fieldLabel: 'Address 1'
                    }, {
                        xtype: 'textfield',
                        name: 'address2',
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
                        fieldLabel: 'Address 3'
                    }, {
                        xtype: 'textfield',
                        name: 'address4',
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
                        fieldLabel: 'City'
                    }, {
                        xtype: 'textfield',
                        name: 'stateOrProvince',
                        fieldLabel: 'State'
                    }, {
                        xtype: 'textfield',
                        name: 'postalOrZipCode',
                        fieldLabel: 'ZIP Code'
                    }, {
                        xtype: 'textfield',
                        name: 'countryCode',
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
                        fieldLabel: 'Email'
                    }, {
                        xtype: 'textfield',
                        name: 'homePhone',
                        fieldLabel: 'Home Phone'
                    }, {
                        xtype: 'textfield',
                        name: 'workPhone',
                        fieldLabel: 'Work Phone'
                    }, {
                        xtype: 'textfield',
                        name: 'mobilePhone',
                        fieldLabel: 'Mobile Phone',
                        margin: '0 0 0 0'
                    }]
                }]
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.createPciProcessor();

        this.on({
            save: {
                scope: this,
                fn: 'save'
            }
        });
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
                        zipCode: formValues.zipCode,
                        state: formValues.state,
                        homePhone: formValues.homePhone,
                        mobilePhone: formValues.mobilePhone,
                        workPhone: formValues.workPhone
                    },
                    amount = formValues.amount;

                    billingInfo.paymentServiceCardId = me._hiddenCardId;

                    me.setLoading(true,me.body);
                    
                    if (me.isCreateMode) {
                        order.setBillingInfo({
                            jsonData: {
                                orderId: order.getId(),
                                billingInfo: billingInfo,
                                billingContact: contactInfo
                            },
                            success: function (response) {
                                me.setLoading(false, me.body);
                                var json = Ext.decode(response.responseText, true);
                                if (!json || !json.success) {
                                    Taco.app.fireEvent('setmessage', "Error saving billing information", 'error');
                                    return;
                                }
                                
                                // me.hide();
                                order.reload();
                            },
                            failure: function (response) {
                                var json = Ext.decode(response.responseText, true),
                                  msg = (json && json.Message) ? json.Message : "Error saving billing information";
                                Taco.app.fireEvent('setmessage', msg, 'error');
                                me.setLoading(false, me.body);
                            }
                        });
                    }
                    else {
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
                                    Taco.app.fireEvent('setmessage', "Error adding payment", 'error');
                                    return;
                                }

                                // me.hide();
                                order.reload();
                            },
                            failure: function (response) {
                                var json = Ext.decode(response.responseText, true),
                                  msg = (json && json.Message) ? json.Message : "Error adding payment";
                                Taco.app.fireEvent('setmessage', msg, 'error');
                                me.setLoading(false, me.body);
                            }
                        });
                    }
                    // TODO: impl mask for our own form and also finish working.
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

    save: function () {
        this.setLoading(true, this.body);
        this.pciProcessor.process();
    },

    toggleExtraInfo: function (checkbox, isChecked) {
        var extraInfo = this.down('#extraInfo');

        extraInfo[isChecked ? 'hide' : 'show']();
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
