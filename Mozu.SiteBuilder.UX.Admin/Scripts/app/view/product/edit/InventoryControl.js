///**
// * @class Taco.view.product.edit.InventoryControl
// */
//Ext.define('Taco.view.product.edit.InventoryControl', {
//    extend: 'Taco.core.ux.form.Module',
//    requires: ['Taco.core.ux.form.FlexBox'],

//    model: 'Taco.model.Product',
//    useModuleFrame: false,
//    closed: false,

//    form: {
//        width: 720,
//        layout: { type: 'vbox', align: 'stretch' },
//        defaults: { xtype: 'formflexbox' },
//        items: [{
//            defaults: {
//                labelAlign: 'top',
//                labelSeparator: '',
//                margin: '0 10 5 0'
//            },
//            items: [{
//                xtype: 'selectfield',
//                name: 'manageStock',
//                fieldLabel: 'Inventory control',
//                width: 200,
//                // value: me.data.get('manageStock'),
//                mode: 'local',
//                valueField: 'storedValue',
//                displayField: 'displayValue',
//                store: Ext.create('Ext.data.ArrayStore', {
//                    fields: [
//                        { name: 'storedValue', type: 'boolean' },
//                        { name: 'displayValue', type: 'string' }
//                    ],
//                    data: [
//                        [false, 'Do not track inventory'],
//                        [true, 'Track inventory']
//                    ]
//                }),
//                listeners: {
//                    // select: function (field, records) {
//                    //     var val = records[0].get('storedValue'),
//                    //     handlingField = field.up('form').getForm().findField('inventoryHandling'),
//                    //     stockOnHandField = field.up('form').getForm().findField('stockOnHand'),
//                    //     md = me.store.getProxy().getReader().metaData;

//                    //     if (val === true) {
//                    //         if (handlingField.getValue() < 1) {
//                    //             handlingField.setValue(2);
//                    //         }
//                    //         handlingField.show().enable();
//                    //         me.store.rejectChanges();
//                    //         me.store.each(function (record) {
//                    //             if (record.get('stockOnHand') === null ) {
//                    //                 record.set('stockOnHand', 0);
//                    //             }
//                    //         });

//                    //     } else {
//                    //         handlingField.hide().disable();

//                    //         if (md.options.length) {
//                    //             me.store.each(function (record) {
//                    //             record.set('stockOnHand', null);
//                    //             });
//                    //         } else {
//                    //             stockOnHandField.setValue(null);
//                    //         }
//                    //     }
//                    // }
//                }
//            }, {
//                xtype: 'numberfield',
//                name: 'stockOnHand',
//                fieldLabel: 'Qty in stock',
//                emptyText: '∞',
//                decimalPrecision: 0,
//                hideTrigger: true,
//                keyNavEnabled: false,
//                mouseWheelEnabled: false,
//                // hidden: !!(optionsCount),
//                // disabled: !!(optionsCount),
//                // value: me.data.get('stockOnHand'),
//                listeners: {
//                    // change: function (field, newValue, oldValue) {
//                    //     var manageField = field.up('formflexbox').down('textfield[name="manageStock"]'),
//                    //     records = [];

//                    //     if (newValue) {
//                    //         manageField.select(true);
//                    //         records.push(manageField.store.getAt(1));
//                    //         manageField.fireEvent('select', manageField, records);
//                    //     }
//                    // }
//                }
//            }, {
//                xtype: 'selectfield',
//                name: 'inventoryHandling',
//                fieldLabel: 'If out of stock',
//                width: 300,
//                // hidden: !me.data.get('manageStock'),
//                // disabled: !me.data.get('manageStock'),
//                mode: 'local',
//                valueField: 'storedValue',
//                // value: me.data.get('inventoryHandling'),
//                displayField: 'displayValue',
//                store: Ext.create('Ext.data.ArrayStore', {
//                    fields: [
//                        { name: 'storedValue', type: 'int' },
//                        { name: 'displayValue', type: 'string' }
//                    ],
//                    data: [
//                        [1, 'Allow Shopper to backorder'],
//                        [2, 'Hide when out of stock'],
//                        [3, 'Allow Shopper to view Product Details']
//                    ]
//                })
//            }]
//        }]
//    },

//    initComponent: function () {
//        var me = this;

//        this.addCls(Taco.baseCSSPrefix + 'form-module-inventorycontrol');

//        this.callParent(arguments);
//    },

//    loadRecord: function (data) {
//        var me = this,
//            store;

//        this.data = data;

//        store = this.data.productVariations();

//        store.on({
//            load: {
//                fn: function () {
//                    me.loadValues(store);
//                },
//                scope: me
//            }
//        });
//    },

//    loadValues: function (store) {
//        var me = this,
//            msField = this.form.getForm().findField('manageStock'),
//            sohField = this.form.getForm().findField('stockOnHand'),
//            ihField = this.form.getForm().findField('inventoryHandling'),
//            md = store.getProxy().getReader().metaData;

//        msField.on({
//            select: {
//                fn: function (field, records) {
//                    console.log(this, ihField, md);

//                    var val = records[0].get('storedValue');

//                    if (val === true) {
//                        if (ihField.getValue() < 1) {
//                            ihField.setValue(2);
//                        }
//                        ihField.show().enable();
//                        store.rejectChanges();
//                        store.each(function (record) {
//                            if (record.get('stockOnHand') === null) {
//                                record.set('stockOnHand', 0);
//                            }
//                        });
//                    } else {
//                        ihField.hide().disable();

//                        if (md.options.length) {
//                            store.each(function (record) {
//                                record.set('stockOnHand', null);
//                            });
//                        } else {
//                            stockOnHandField.setValue(null);
//                        }
//                    }
//                }
//            }
//        });
//    }
//});