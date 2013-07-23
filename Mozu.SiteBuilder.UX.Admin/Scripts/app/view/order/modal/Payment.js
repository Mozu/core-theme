/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.Payment', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 700,
    height: 500,
    style: 'overflow-y: scroll;overflow-x: hidden;',
    data: {},
    field: '',

    getPCIaaS: function() {
        return this.self.PCIaaS;
    },

    createPciProcessor: function() {
        var me = this,
            PCI = me.getPCIaaS();

        if (!PCI)
        {
            return me.mon(Taco.app, 'pciloaded', me.createPciProcessor, me);
        }

        me.pciProcessor = PCI({
            fields: me.getPciFieldsAdapter(),
            events: {
                success: function () {
                    me.pciProcessor.applyMask();
                    var order = me.record,
                    billingInfo = me.formpanel.getValues(),
                    amount = billingInfo.amount;

                delete billingInfo.amount;
                billingInfo.paymentServiceCardId = me._hiddenCardId;

                order.addPayment({
                    jsonData: {
                        orderId: order.getId(),
                        amount: amount,
                        billingInfo: billingInfo
                    },
                    success: function() {
                        me.hide();
                        order.reload();
                    }
                });
                    // TODO: impl mask for our own form and also finish working.
                }
            },
            settings: {
                apiBase: Taco.paymentApiBaseUrl,
                framePath: "/../../Assets/pci_receiver.html",
                siteId: me.record.get('siteId'),
                tenantId: me.record.get('tenantId')
            }
        });
    },

    /*
     * returns a nice adapter that the PCI-as-a-service lib can use to read all our form fields 
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

    createPciFormField: function(field) {
        return function(val) {
            if (val)
            {
                return field.setValue(val);
            }
            return field.getValue();
        }
    },

    initComponent: function (eOpts) {
        var me = this;

         me.extraInfoCont = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
            layout: { type: 'hbox' },
            hidden: true,
            items: [{
                xtype: 'container',
                style: 'padding-right: 10px;',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [
                {
                    xtype: 'textfield',
                    name: 'firstname',
                    fieldLabel: 'First Name'
                }, {
                    xtype: 'textfield',
                    name: 'middlename',
                    fieldLabel: 'Middle Name'
                }, {
                    xtype: 'textfield',
                    name: 'lastname',
                    fieldLabel: 'Last Name'
                }, {
                    xtype: 'textfield',
                    name: 'email',
                    fieldLabel: 'Email'
                }, {
                    xtype: 'textfield',
                    name: 'address1',
                    fieldLabel: 'Address 1'
                }, {
                    xtype: 'textfield',
                    name: 'address2',
                    fieldLabel: 'Address 2'
                }, {
                    xtype: 'textfield',
                    name: 'address3',
                    fieldLabel: 'Address 3'
                }, {
                    xtype: 'textfield',
                    name: 'address4',
                    fieldLabel: 'Address 4'
                }]
            }, {
                xtype: 'container',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [
                {
                    xtype: 'textfield',
                    name: 'state',
                    fieldLabel: 'State'
                }, {
                    xtype: 'textfield',
                    name: 'zipCode',
                    fieldLabel: 'ZIP'
                }, {
                    xtype: 'textfield',
                    name: 'countryCode',
                    fieldLabel: 'Country'
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
                    fieldLabel: 'Mobile Phone'
                }, {
                    xtype: 'textfield',
                    name: 'cityOrTown',
                    fieldLabel: 'City'
                }]
            }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });

        me.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
            layout: { type: 'vbox' },
            items: [{
                xtype: 'panel',
            layout: { type: 'hbox' },
            items: [{
                xtype: 'container',
                style: 'padding-right: 10px;',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [
                {
                    name: 'nameOnCard',
                    fieldLabel: 'Name on Card',
                    value: 'Bob Boberson'
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount',
                    emptyText: '0',
                    value: '223'
                }, {
                    xtype: 'numberfield',
                    name: 'expireMonth',
                    fieldLabel: 'Exp Month',
                    minValue: 1,
                    maxValue: 12,
                    value: 3
                }, {
                    xtype: 'numberfield',
                    name: 'expireYear',
                    fieldLabel: 'Exp Year',
                    value: 2015
                }]
            }, {
                xtype: 'container',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [
                {
                    xtype: 'combobox',
                    name: 'cardType',
                    itemId: 'cardType',
                    fieldLabel: 'Card Type',
                    allowBlank: false,
//                    editable: false,
                    forceSelection: true,
//                    listConfig: { shadow: false },
//                    shrinkWrap: 3,
                    store: [['Visa', 'Visa'], ['NotVisa', 'Something that is not Visa']],
                    value: 'Visa'
                }, {
                    name: 'cardNumber',
                    itemId: 'cardNumber',
                    fieldLabel: 'Card Number',
                    value: '4111111111111111'
                }, {
                    name: 'cvv',
                    itemId: 'cvv',
                    fieldLabel: 'CVV',
                    value: '255',
                    width: 100
                    }, {
                        xtype: 'checkboxfield',
                        boxLabel: 'Address Same as billing',
                        name: 'sameAsBilling',
                        checked: true,
                        style: 'margin-top:50px;',
                        handler: function (it, status) {
                            console.log(status);
                           // me.extraInfoCont.show(!status);
                            if (!status) {
                                me.extraInfoCont.show();
                            } else {
                                me.extraInfoCont.hide();
                            }
                        }
                    }]
                }]
            }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });

        me.formpanel.add(me.extraInfoCont);

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    cls: 'order-modal-title',
                    html: 'Add Payment'
                }
            },
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            click: function () {
                this.pciProcessor.process();
            },
            scope: this
        });

        this.actions = {
            xtype: 'container',
            items: [this.primaryButton, {
                xtype: 'action',
                text: 'Cancel',
                onClick: function () {
                    me.hide();
                }
            }]
        };

        this.callParent(arguments);

        me.createPciProcessor();

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