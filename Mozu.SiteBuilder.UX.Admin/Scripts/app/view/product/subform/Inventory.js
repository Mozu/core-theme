/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productinventorysubform',
    requires: ['Taco.view.product.option.Form'],

    title: 'Inventory',
    
    initComponent: function () {
        var track = this.product.get('manageStock'),
            manageStock,
          //  stockOnHand,
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
                 //       stockOnHand.show();
                        outOfStockState.show();
                    } else {
                 //       stockOnHand.hide();
                        outOfStockState.hide();
                    }
                },
                scope: this
            }
        });

        outOfStockState = Ext.widget({
            xtype: 'selectfield',
            fieldLabel: 'If out of stock...',
            width: 250,
            allowBlank: true,
            margin: '0 0 0 20',
            hidden: !track,
            queryMode: 'local',
            store: [
                ['DisplayMessage', 'Show out of stock message'],
                ['AllowBackorder', 'Allow backordering'],
                ['HideProduct', 'Hide Product in Store']
            ],
            name:'outOfStockBehavior'
        });

        options = Ext.create('Taco.view.product.option.Form', {
            product: this.product
        });

        this.items = [{
            xtype: 'container',
            width: '100%',
            layout: 'vbox',
            items: [
                manageStock,
             //   stockOnHand,
                outOfStockState
            ]
        }];

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