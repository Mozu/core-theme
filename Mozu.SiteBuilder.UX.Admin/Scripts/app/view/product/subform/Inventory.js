/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',

    requires: ['Taco.view.product.option.Form'],

    title: 'Inventory',
    
    initComponent: function () {
        var track = this.product.get('manageStock'),
            manageStock,
            stockOnHand,
            outOfStockState,
            options;
        this.record = this.product;
        
        manageStock = Ext.widget({
            xtype: 'checkboxfield',
            name: 'manageStock',
            boxLabel: 'Track stock level',
            checked: track,
            listeners: {
                change: function (field, checked) {
                    if (checked) {
                        stockOnHand.show();
                        outOfStockState.show();
                    } else {
                        stockOnHand.hide();
                        outOfStockState.hide();
                    }
                },
                scope: this
            }
        });

        stockOnHand = Ext.widget({
            xtype: 'textfield',
            name: 'stockOnHand',
            fieldLabel: 'Quantity',
            value: this.product.get('stockOnHand'),
            margin: '0 0 0 20',
            hidden: !track,
            listeners: {
                change: function (field, newValue) {
                    this.product.set('stockOnHandAdjustment', 
                                        newValue === this.product.get('stockOnHand') 
                                            ? null
                                            : { 
                                                type: 'Absolute',
                                                value: newValue
                                            }
                    );
                },
                scope: this
            }
        });

        outOfStockState = Ext.widget({
            xtype: 'selectfield',
            fieldLabel: 'If out of stock...',
            width: 250,
            margin: '0 0 0 20',
            hidden: !track,
            queryMode: 'local',
            store: [
                [0, 'Show out of stock message'],
                [1, 'Allow backordering'],
                [2, 'Hide Product in Store']
            ],
            value: this.getOutOfStockState(),
            listeners: {
                change: function (field, newValue) {
                    this.product.set('isBackOrderAllowed', newValue === 1);
                    this.product.set('isHiddenWhenOutOfStock', newValue === 2);
                },
                scope: this
            }
        });

        options = Ext.create('Taco.view.product.option.Form', {
            product: this.product
        });

        this.items = [{
            xtype: 'formflexbox',
            width: '100%',
            justify: false,
            items: [
                manageStock,
                stockOnHand,
                outOfStockState
            ]
        }, options];

        this.callParent(arguments);
       
    },

    getOutOfStockState: function () {
        var backorder = this.product.get('isBackOrderAllowed'),
            hide = this.product.get('isHiddenWhenOutOfStock'),
            result = 0;

        if (hide) {
            result = 2;
        } else if (backorder) {
            result = 1;
        }

        return result;
    }
});