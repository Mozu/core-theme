/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productinventorysubform',
  //  requires: ['Taco.view.product.option.Form'],

    title: 'Inventory',
    
    // enables the manage button; This is part of future work;
    manageEnabled: true,

    bodyPadding:"10 0 0 0",
    
    initComponent: function () {
        var me = this,
            track = this.product.get('manageStock'),
          //  stockOnHand,
            options;

        

        this.record = this.product;

        if (this.manageEnabled) {
            this.manageInventoryButton = Ext.create('Ext.button.Button', {
                ui: "action",
                hidden: this.product.get("productUsage") == "Bundle",
                scale: "medium",
                margin: "0 0 0, 0",
                text: "Manage Inventory",
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


            /*
            this.viewStockLink = Ext.create('Ext.button.Button', {
                text: 'View Inventory',
                ui: "action",
                scale:"medium",
                handler: function () {
                    Taco.core.StateManager.attemptNavigate('inventory?q=productCode:'+ this.record.getId());
                },
                scope:this
            });
            */

        //options = Ext.create('Taco.view.product.option.Form', {
        //    product: this.product
        //});

        this.items = [{
            xtype: 'container',
            width: '100%',
            layout: 'vbox',
            items: [
                this.manageStock,
                //this.viewStockLink,
             //   stockOnHand,
                this.outOfStockState
              
            ]
        }];

        this.callParent(arguments);
        
        this.updateFieldVisibility();

        me.on('afterrender', function () {
            var productForm = me.up("productform");

            if (me.manageInventoryButton) {
                productForm.getForm().getBoundItems().add('manageInventoryButton', me.manageInventoryButton);
            }

            me.mon(productForm, 'productusagechange', me.onProductUsageChange, me);
        });

    },

    onDestroy: function () {
        
        // remove the inventory from the bound items before destroying the view;;
        var me = this;
        if (me.manageInventoryButton) {
            var boundItems = me.productForm.getForm().getBoundItems()
            boundItems.removeAtKey("manageInventoryButton");            
        }

        this.callParent(arguments);
    },
    
    // all the logic for what is show or hidden is managed here;
    updateFieldVisibility: function () {
        var me = this;
        
        // hide if the productUsage is Bundle
        var value = this.product.get("productUsage");

        

        var track = this.manageStock.getValue();

        this.manageStock.setVisible(value != "Bundle");
        
        //this.viewStockLink.setVisible(track);
        
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
            this.manageInventoryButton.setVisible(value != "Bundle" && track);
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
    manageInventory: function () {
        var productEditor = this.up('taco-product-editor');
        if (productEditor.requiresSave) {
            Ext.MessageBox.show({
                title: 'Unsaved Changes',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: 'You have unsaved changes. Save changes now?',
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (rec) {
                    if (rec === 'yes') {
                        var saveButton = productEditor.down("#save").toggle(true);
                    }
                }
            });

        } else {
            Taco.core.StateManager.attemptNavigate('inventory?q=productCode:' + this.record.getId());
        }
        
    }

});