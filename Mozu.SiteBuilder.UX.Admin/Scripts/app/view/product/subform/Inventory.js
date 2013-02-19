/**
 * @class Taco.view.product.subform.Inventory
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Inventory',
    
    initComponent: function () {
        this.items = [{
                fieldLabel: 'Quantity',
                name: 'stockOnHand',
                listeners: {
                    change:function(field, newValue, oldValue, eOpts) {
                        var soh = this.product.get('stockOnHand');
                        if (newValue != soh) {
                            this.product.set('stockOnHandAdjustment', { type: 'Absolute', value: newValue });
                        } else {
                            this.product.set('stockOnHandAdjustment', null);
                        }
                    },
                    scope:this
                }
            },
            {
                xtype: 'selectfield',
                store: Ext.create('Ext.data.Store', {
                    fields: ['value','isBackOrderAllowed','isHiddenWhenOutOfStock', 'text'],
                    data: [
                        { value:1,isBackOrderAllowed: false,isHiddenWhenOutOfStock:false, "text": "show" },
                        { value: 2, isBackOrderAllowed: false, isHiddenWhenOutOfStock: false, "text": "hide" },
                        { value: 3, isBackOrderAllowed: false, isHiddenWhenOutOfStock: false, "text": "allow backorder" }
                    ]
                }),
                queryMode: 'local',
                displayField: 'text',
                valueField: 'value',
                value: this.product.get('isHiddenWhenOutOfStock') ? 2 : (this.product.get('isBackOrderAllowed') ? 3 : 1),
                fieldLabel: 'When out of stock',
                cls: Taco.baseCSSPrefix + 'flex-field-spacing',
                listeners: {
                    select:function(combo, records, eOpts) {
                        if (records.length == 0) {
                            this.product.set('isBackOrderAllowed', records[0].get('isBackOrderAllowed'));
                            this.product.set('isHiddenWhenOutOfStock', records[0].get('isHiddenWhenOutOfStock'));
                        }
                        
                    },
                    scope:this
                }
            }];

        this.callParent( arguments );
    }
});



        //{
        //    "name": "isBackOrderAllowed",
        //    "type": "boolean",
        //    "useNull": true
        //},
        //{
        //"name": "isHiddenWhenOutOfStock",
        //"type": "boolean",
        //"useNull": true
        //},