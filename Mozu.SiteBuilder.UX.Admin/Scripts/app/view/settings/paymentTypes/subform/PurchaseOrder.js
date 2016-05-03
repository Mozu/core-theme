/**
 * @class Taco.view.settings.paymentTypes.subform.PurchaseOrder
 *
 "purchaseOrder": {
  "isEnabled": false,
  "netTerms": [],
  "allowSplitPayment": false,
  "memoField1": {
   "isEnabled": false,
   "isRequired": false
  },
  "memoField2": {
   "isEnabled": false,
   "isRequired": false
  }
 }
 */

Ext.define('Taco.view.settings.paymentTypes.subform.PurchaseOrder', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Purchase Order',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function () {
        var me = this;

        this.items = [
            Ext.create('Ext.panel.Panel', {
                items: [
                    {
                        xtype: 'checkbox',
                        name: 'isEnabled',
                        boxLabel: 'Enable'
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        width: '100%',
                        //hidden: !me.record.get('purchaseOrder').isEnabled,
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items: [
                            {
                                xtype: 'container',
                                layout: 'vbox',
                                label: 'Additional Field 1',
                                items: [
                                {
                                    xtype: 'checkbox',
                                    name: 'isEnabled',
                                    boxLabel: 'Enable'
                                }, {
                                    xtype: 'container',
                                    layout: 'vbox',
                                    margin: '0px 0px 0px 20px',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            name: 'label',
                                            allowBlank: false,
                                            fieldLabel: 'Label',
                                            margin: '0px 5px 0px 5px',
                                            width: '250px',
                                            flex: 1
                                        }, {
                                            xtype: 'checkbox',
                                            name: 'isRequired',
                                            boxLabel: 'Required'
                                        }
                                    ]
                                }
                            ]
                            }, {
                                xtype: 'container',
                                layout: 'vbox',
                                label: 'Additional Field 2',
                                items: [
                                    {
                                        xtype: 'checkbox',
                                        name: 'isEnabled',
                                        boxLabel: 'Enable'
                                    }, {
                                        xtype: 'container',
                                        layout: 'vbox',
                                        margin: '0px 0px 0px 20px',
                                        items: [{
                                            xtype: 'textfield',
                                            name: 'label',
                                            allowBlank: false,
                                            fieldLabel: 'Label',
                                            margin: '0px 5px 0px 5px',
                                            width: '250px',
                                            flex: 1
                                        }, {
                                            xtype: 'checkbox',
                                            name: 'isRequired',
                                            boxLabel: 'Required'
                                        }]
                                    }
                                ]
                            }
                        ]
                    }, {
                        xtype: 'checkbox',
                        name: 'allowSplitPayment',
                        boxLabel: 'Allow split-payment'
                    }

                ]
            })];

        this.callParent(arguments);

    }
});