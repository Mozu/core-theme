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

    initComponent: function() {
        var me = this;

        me.purchaseOrderEnabled = me.record.get('purchaseOrder').isEnabled;
        me.memoField1Enabled = me.record.get('purchaseOrder').memoField1.isEnabled;
        me.memoField2Enabled = me.record.get('purchaseOrder').memoField2.isEnabled;

        me.purchaseOrderEnabledToggle = Ext.create('Ext.form.Checkbox', {
            name: 'isEnabled',
            itemId: 'purchaseOrderEnabled',
            boxLabel: 'Enable',
            margin: '0px 0px 20px 0px',
            listeners: {
                change: function(field, newValue, oldValue, eOpts) {
                    me.hidePurchaseOrder(newValue);
                }
            }
        });

        me.purchaseOrderField1Label = Ext.create('Ext.form.TextField', {
            name: 'label',
            itemId: 'purchaseOrderAddField1Label',
            allowBlank: false,
            fieldLabel: 'Label',
            margin: '0px 5px 0px 5px',
            width: '250px',
            disabled: !me.memoField1Enabled,
            flex: 1
        });

        me.purchaseOrderField1Required = Ext.create('Ext.form.Checkbox', {
            itemId: 'purchaseOrderAddField1Req',
            name: 'isRequired',
            disabled: !me.memoField1Enabled,
            boxLabel: 'Required',
            flex: 1
        });

        me.purchaseOrderMemoField1 = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            itemId: 'purchaseOrderAddField1',
            flex: 1,
            items: [
                {
                    xtype: 'text',
                    text: 'Additional Field 1',
                    flex: 1
                }, {
                    xtype: 'checkbox',
                    name: 'isEnabled',
                    itemId: 'purchaseOrderAddField1Enabled',
                    boxLabel: 'Enable',
                    listeners: {
                        change: function(field, newValue, oldValue, eOpts) {
                            me.toggleMemoField1Access(newValue);
                        }
                    }
                }, {
                    xtype: 'container',
                    layout: 'vbox',
                    margin: '0px 0px 0px 20px',
                    flex: 1,
                    items: [
                        me.purchaseOrderField1Label,
                        me.purchaseOrderField1Required
                    ]
                }
            ]
        });

        me.purchaseOrderField2Label = Ext.create('Ext.form.TextField', {
            name: 'label',
            itemId: 'purchaseOrderAddField2Label',
            allowBlank: false,
            fieldLabel: 'Label',
            margin: '0px 5px 0px 5px',
            width: '250px',
            disabled: !me.memoField2Enabled,
            flex: 1
        });

        me.purchaseOrderField2Required = Ext.create('Ext.form.Checkbox', {
            name: 'isRequired',
            itemId: 'purchaseOrderAddField2Req',
            disabled: !me.memoField2Enabled,
            boxLabel: 'Required',
            flex: 1
        });

        me.purchaseOrderMemoField2 = Ext.create('Ext.form.FieldContainer', {
            xtype: 'container',
            layout: 'vbox',
            label: 'Additional Field 2',
            itemId: 'purchaseOrderAddField2',
            flex: 1,
            items: [
                {
                    xtype: 'text',
                    text: 'Additional Field 2',
                    flex: 1
                }, {
                    xtype: 'checkbox',
                    name: 'isEnabled',
                    itemId: 'purchaseOrderAddField2Enabled',
                    boxLabel: 'Enable',
                    flex: 1,
                    listeners: {
                        change: function(field, newValue, oldValue, eOpts) {
                            me.toggleMemoField2Access(newValue);
                        }
                    }
                }, {
                    xtype: 'container',
                    layout: 'vbox',
                    margin: '0px 0px 0px 20px',
                    flex: 1,
                    items: [
                        me.purchaseOrderField2Label,
                        me.purchaseOrderField2Required
                    ]
                }
            ]
        });

        me.purchaseOrderContent = Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            width: '100%',
            itemId: 'purchaseOrderContent',
            hidden: !me.purchaseOrderEnabled,
            margin: '0px 20px 20px 0px',
            items: [
                me.purchaseOrderMemoField1,
                me.purchaseOrderMemoField2
            ]
        });


        me.purchaseOrderSplitPayment = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            width: '100%',
            itemId: 'purchaseOrderOptions',
            hidden: !me.purchaseOrderEnabled,
            items: [
                {
                xtype: 'text',
                text: 'Options'
                }, {
                    xtype: 'checkbox',
                    name: 'allowSplitPayment',
                    itemId: 'purchaseOrderSplitPayment',
                    boxLabel: 'Allow split-payment'
                }
            ]
        });

        me.items = [
            Ext.create('Ext.panel.Panel', {
                items: [
                    me.purchaseOrderEnabledToggle,
                    me.purchaseOrderContent,
                    me.purchaseOrderSplitPayment

                ]
            })];

        this.callParent(arguments);

    },
    
    hidePurchaseOrder: function(newValue) {
        this.purchaseOrderContent.setVisible(newValue);
        this.purchaseOrderSplitPayment.setVisible(newValue);
    },

    toggleMemoField1Access: function(newValue) {
        this.purchaseOrderField1Label.setDisabled(!newValue);
        this.purchaseOrderField1Required.setDisabled(!newValue);
    },

    toggleMemoField2Access: function(newValue) {
        this.purchaseOrderField2Label.setDisabled(!newValue);
        this.purchaseOrderField2Required.setDisabled(!newValue);
    }
});