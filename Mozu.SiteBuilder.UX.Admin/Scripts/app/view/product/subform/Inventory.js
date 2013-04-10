/**
 * @class Taco.view.product.subform.Inventory
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Inventory',
    
    initComponent: function () {
        // this.items = [{
        //         fieldLabel: 'Quantity',
        //         name: 'stockOnHand',
        //         listeners: {
        //             change:function(field, newValue, oldValue, eOpts) {
        //                 var soh = this.product.get('stockOnHand');
        //                 if (newValue != soh) {
        //                     this.product.set('stockOnHandAdjustment', { type: 'Absolute', value: newValue });
        //                 } else {
        //                     this.product.set('stockOnHandAdjustment', null);
        //                 }
        //             },
        //             scope:this
        //         }
        //     },
        //     {
        //         xtype: 'selectfield',
        //         store: Ext.create('Ext.data.Store', {
        //             fields: ['value','isBackOrderAllowed','isHiddenWhenOutOfStock', 'text'],
        //             data: [
        //                 { value:1,isBackOrderAllowed: false,isHiddenWhenOutOfStock:false, "text": "show" },
        //                 { value: 2, isBackOrderAllowed: false, isHiddenWhenOutOfStock: false, "text": "hide" },
        //                 { value: 3, isBackOrderAllowed: false, isHiddenWhenOutOfStock: false, "text": "allow backorder" }
        //             ]
        //         }),
        //         queryMode: 'local',
        //         displayField: 'text',
        //         valueField: 'value',
        //         value: this.product.get('isHiddenWhenOutOfStock') ? 2 : (this.product.get('isBackOrderAllowed') ? 3 : 1),
        //         fieldLabel: 'When out of stock',
        //         cls: Taco.baseCSSPrefix + 'flex-field-spacing',
        //         listeners: {
        //             select:function(combo, records, eOpts) {
        //                 if (records.length == 0) {
        //                     this.product.set('isBackOrderAllowed', records[0].get('isBackOrderAllowed'));
        //                     this.product.set('isHiddenWhenOutOfStock', records[0].get('isHiddenWhenOutOfStock'));
        //                 }
                        
        //             },
        //             scope:this
        //         }
        //     }];
        //     
        var track = this.product.get('manageStock');

        this.items = [{
            xtype: 'formflexbox',
            width: '100%',
            justify: false,
            items: [{
                xtype: 'checkboxfield',
                name: 'manageStock',
                boxLabel: 'Track stock level',
                checked: track,
                listeners: {
                    change: function (field, newValue, oldValue) {
                        var form = this.getForm(),
                            fields = [form.findField('stockOnHand'), form.findField('stockManagement')];

                        Ext.Array.each(fields, function (item) {
                            if (newValue) {
                                item.show();
                            } else {
                                item.hide();
                            }
                        }, this);
                    },
                    scope: this
                }
            }, {
                xtype: 'textfield',
                name: 'stockOnHand',
                fieldLabel: 'Quantity',
                value: this.product.get('stockOnHand'),
                margin: '0 0 0 20',
                hidden: !track,
                listeners: {
                    change: function (field, newValue, oldValue) {
                        var stock = this.product.get('stockOnHand');

                        this.product.set('stockOnHandAdjustment', newValue === stock ? null : { type: 'Absolute', value: newValue });
                    },
                    scope: this
                }
            }, {
                xtype: 'selectfield',
                name: 'stockManagement',
                fieldLabel: 'If out of stock...',
                width: 250,
                margin: '0 0 0 20',
                hidden: !track,
                queryMode: 'local',
                store: [[0, 'Show out of stock message'], [1, 'Allow backordering'], [2, 'Hide Product in Store']],
                value: this.getStockManagementValue(),
                listeners: {
                    change: function (field, newValue, oldValue) {
                        this.product.set('isBackOrderAllowed', newValue === 1);
                        this.product.set('isHiddenWhenOutOfStock', newValue === 2);
                    },
                    scope: this
                }
            }]
        }];

        this.callParent(arguments);
    },

    getStockManagementValue: function () {
        var backorder = this.product.get('isBackOrderAllowed'),
            hide = this.product.get('isHiddenWhenOutOfStock'),
            ret = 0;

        if (hide) {
            ret = 2;
        } else if (backorder) {
            ret = 1;
        }

        return ret;
    }
});