/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productinventorysubform',
  //  requires: ['Taco.view.product.option.Form'],

    title: 'Inventory',
    
    // enables the manage button; This is part of future work;
    manageEnabled: false,
    
    initComponent: function () {
        var me = this,
            track = this.product.get('manageStock'),
          //  stockOnHand,
            options;

        

        this.record = this.product;

        if (this.manageEnabled) {
            this.manageInventoryButton = Ext.create('Ext.button.Button', {
                ui: "action-primary",
                hidden: this.product.get("productUsage") == "Bundle",
                scale: "medium",
                margin: "0 0 20, 0",
                text: "Manage",
                handler: me.manageInventory,
                scope: me
            });
            
            this.tools = [this.manageInventoryButton];
        }
        
        this.manageStock = Ext.widget({
            xtype: 'checkboxfield',
            name: 'manageStock',
            boxLabel: 'Track stock level',
            checked: track,
            //hidden: this.product.get("productUsage") == "Bundle",
            listeners: {
                change: function (field, checked) {
                    this.updateFieldVisibility();
                },
                scope: this
            }
        });

        
        // need to filter the list of possible values;
        // if the productUsage is of type bundle, we will need to remove the allowBackorder option;
        
        this.outOfStockState = Ext.widget({
            xtype: 'selectfield',
            fieldLabel: 'If out of stock...',
            width: 250,
            allowBlank: true,
            margin: '0 0 0 20',
            //hidden: (!track || this.product.get("productUsage") == "Component"),
            queryMode: 'local',
            store: [
                ['DisplayMessage', 'Show out of stock message'],
                ['AllowBackorder', 'Allow backordering'],
                ['HideProduct', 'Hide Product in Store']
            ],
            name:'outOfStockBehavior'
        });

        //options = Ext.create('Taco.view.product.option.Form', {
        //    product: this.product
        //});

        this.items = [{
            xtype: 'container',
            width: '100%',
            layout: 'vbox',
            items: [
                this.manageStock,
             //   stockOnHand,
                this.outOfStockState
            ]
        }];

        this.callParent(arguments);
        
        this.updateFieldVisibility();

        me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.onProductUsageChange, me);
        });

    },
    
    // all the logic for what is show or hidden is managed here;
    updateFieldVisibility: function () {
        var me = this;
        
        // hide if the productUsage is Bundle
        var value = this.product.get("productUsage");

        this.manageStock.setVisible(value != "Bundle");

        var track = this.manageStock.getValue();
        

        // hide if the productUsage is component
        var outOfStockStateVisible = false;
            
        if (this.product.get("productUsage") == "Bundle") {
            outOfStockStateVisible = true;
            
            //filter out the allow backordering option
            this.outOfStockState.store.filter([
                {
                    filterFn: function (item) {
                        return item.get('field1') != "AllowBackorder";
                    }
                }
            ]);

        } else if (this.product.get("productUsage") == "Component") {
            outOfStockStateVisible = false;
            this.outOfStockState.store.clearFilter();
        } else {
            this.outOfStockState.store.clearFilter();
            if (track) {
                outOfStockStateVisible = true;
            }
        }
        
        this.outOfStockState.setVisible(outOfStockStateVisible);

        if (me.manageEnabled) {
            // hide if the productUsage is Bundle
            this.manageInventoryButton.setVisible(value != "Bundle");
        }
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
    },
    
    /**
    *   When the productUsage changes, the inventory subForm should have the following behavior
    *   When productUsage is bundle, do not allow managment of inventory
    *
    *
    *
    *
    */
    onProductUsageChange: function (view, value) {
        var me = this;
        this.updateFieldVisibility();
    },
    
    // todo implement this feature
    manageInventory : function () {
        
    }

});