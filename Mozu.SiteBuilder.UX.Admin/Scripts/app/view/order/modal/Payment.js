/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.Payment', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 700,
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
                        this.hide();
                    }
                });
                    // TODO: impl mask for our own form and also finish working.
                }
            },
            settings: {
                // TODO: hardcoded to SI
                apiBase: "http://aus02niserv001.dev.volusion.com/mozu.paymentservice.webapi/Mozu/cards/",
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


        me.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
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
                    name: 'expYear',
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
                }]
            }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });

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