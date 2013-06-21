/**
 * @class Taco.view.order.widget.OrderItemGrid
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.widget.OrderItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: [],
    
    config: {
        header: false,
        // controls whether the editable fields are editable. Can be toggled on and off. 

        // false if its unpackaged items grid
        isPackage: true,
        
        // way to quickly determine which package type we are looking at
        isShippedPackage: false,

        editMode: true,
        
        enableCellEditing: true,
        
        enableCheckBoxSelection: true,
        
        enableActionColumn: true,
        
        enableToolbar: true,

        // the text used in the move menu split button.  Will be overridden by subclasses
        moveMenuText: "Add to Package",
        
        enableMoveMenu: true,
        
        enableShippingMethodMenu: true,
        
        enableShippingLabelButton: true,
        
        enabledPackingSlipButton: true,
        
        enabledRemoveButton: true,
        
        enabledMarkAsShippedButton: true,

        
        packageMenuPagingSize: 10,

        autoHeight: true,
        
        
        plugins:[],
        
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: [],
       
       
        listeners: {
            beforeedit: {
                fn: function (plugin, edit) {
                    // disable editing when the grid is not editMode:true
                    return this.editMode;
                }
            },
            selectionchange : {
                fn: function (view, selected, eOpts) {
                    var me = this;
                    
                    //todo: fix the taco.split button to allow it to be enabled and disabled;
                    
                    // disable menu button if nothing is selected?
                    if (selected.length == 0) {
                        if (!me.moveMenuAction.isDisabled()) {
                            me.moveMenuAction.disable();
                        }
                    } else {
                        // re enabled the menu button
                        if (me.moveMenuAction.isDisabled()) {
                            me.moveMenuAction.enable();
                        }
                    }
                }                
            }
        }
    },
    
    initComponent: function(eOpts) {
        var me = this,
            data = [];

        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-orderItemGrid'].join(' ');

        // if data is already set on the panel load it by default.
        if (me.data) {
            data = me.data;
        }

        me.store = Ext.create('Ext.data.JsonStore', {
            fields: me.getFields(),
            data: data
        });
        
        if (me.enableCellEditing) {
            // plugin to add suppourt to the grid for editing the price and quantity columns
            var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            });

            me.getPlugins().push(
                cellEditing
            );
        }
        
        if (me.getEnableToolbar()) {
            this.tbar = Ext.create('Ext.toolbar.Toolbar', this.getToolBarConfig()); 
        }

        Ext.apply(this, {
            viewConfig: {
                // changing the hover class to get rid of taco overrides of grid
                overItemCls: 'taco-order-shippingItem-grid-row-over',
                emptyText: '<div class="emptyGridMessage">No items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false,  // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disabledCls: "taco-order-orderItemGrid-disabled", // css class to add when the order grid is disabledstripeRows: false,
                //   enableTextSelection: true
                listeners: {
                        itemmouseenter: {
                            fn: function(view, record, item, index, e, eOpts) {

                            },
                            scope: me
                        },
                    highlightitem: {
                        fn: function(view, record, item, index, e, eOpts) {

                        },
                        scope: me
                    }
                },

                // provides selective row class addition based on record.
                getRowClass: function(record) {
                    if (!record) return '';
                    return '';
                }
            },
            columns:me.getColumnConfig()
        });

        // initialized the selection model
        me.initSelectionModel();

        me.callParent(arguments);

    },
    
    // dynamically build the menu options based on the current state of the order shipment data entities
    getMenuActions: function (config) {
        var me = this,
            menu = [];

        var specificPackages = [];

        // always need to have new package
        menu.push(
            {
                text: "New Package",
                moveAction: "addSelectionToPackage",
                moveTargetId: -1
            }
        );
        
        menu.push(
            {
                text: "Unshipped Items",
                moveAction: "addSelectionToPackage",
                moveTargetId: 0
            }
        );
        
        var unshippedPackages = this.record.get("unShippedPackages");

        // loop on the packages adding them as addTo Targets;
        var packageLength = unshippedPackages.length;
        for (var i = packageLength; i > 0; i--) {
            /*
            specificPackages.push({
                text: "Package " + i
            });
            */
            
            menu.push({
                text: "Package " + i,
                moveAction: "addSelectionToPackage",
                moveTargetId: unshippedPackages[i-1].id
            });

        }
        
        
        
        
        
        //todo: need some paging solution for adding support to have many packages
        /*
        if (packageLength > packageMenuPagingSize) {
            menu.push(
             {
                 text: "Add to Package",
                 menu: {
                     plain: true,
                     items: specificPackages
                 }
             }
         );
        }
        */



        return menu;
    },

    getToolBarConfig : function() {
        var me = this,
            tb = {
                plain: true,
                enableOverflow:true,
                items:[]
            };

        /*
        var testButton = Ext.create("Taco.core.ux.action.SplitButton", {
            text: "<-I need theming not reinvention",
            menu : {
                plain: true,
                items:[{
                    text: "asdf"
                }]
            }
        });
        */

        /*
        tb.items.push({
            text:"reload",
            handler:function() {
                this.record.reload();
            },
            scope:this

        });
        */
        
        
        
        if (me.getEnableMoveMenu()) {

            var unShippedPackages = this.record.get("unShippedPackages");
            // if there is a last package use its id, otherwise make the target a new package
            var lastPackage = unShippedPackages[unShippedPackages.length - 1];
            var lastPackageId = (lastPackage) ? lastPackage.id : -1;
            

            // note: i had to use the ext split button. The Taco.core.ux.action.SplitButton doesn't responsd to .enabled(), .disable() and needs to be refactored to support the standard extjs button behaviors fully.
            //me.moveMenuAction = Ext.create("Taco.core.ux.action.SplitButton", {
            me.moveMenuAction = Ext.create("Ext.button.Split", {
                menuAlign: 'tr-br',
                cls: "taco-splitbutton",
                text: me.getMoveMenuText(),
                itemId: "moveMenuTrigger",
                

                moveAction: "addSelectionToPackage",
                moveTargetId: lastPackageId,
                
                disabled: true,
                handler: function (button,e) {
                    me.moveSelectedItems(null, button,e);
                },
                scope:me,
                listeners: {
                    menushow: {
                        fn: function (button, menu, eOpts) {
                            menu.removeAll();
                            menu.add(me.getMenuActions());
                        },
                        scope: me
                    }
                },
                menu: {
                    plain: true,
                    listeners: {
                        click: me.moveSelectedItems,
                        scope: me,
                        delegate: "x-menu-item-link"
                    },
                    items: [{
                        text: "asdf"
                    }]
                }
            });
            
            tb.items.push(me.moveMenuAction);

        }
        
        if (me.enableShippingMethodMenu) {
            // note: i had to use the ext split button. The Taco.core.ux.action.SplitButton doesn't responsd to .enabled(), .disable() and needs to be refactored to support the standard extjs button behaviors fully.
            //me.moveMenuAction = Ext.create("Taco.core.ux.action.SplitButton", {
            me.shippingMethodMenu = Ext.create("Taco.core.ux.action.Button", {
                menuAlign: 'tr-br',
                //cls: "taco-splitbutton",
                text: "Change Shipping Method",
                listeners: {
                    menushow: {
                        fn: function (button, menu, eOpts) {
                            var menuData = me.getShippingRatesMenu();
                            me.shippingMethodMenu.menu.removeAll();
                            me.shippingMethodMenu.menu.add(menuData);
                        },
                        scope: me
                    }
                },
                menu: {
                    plain: true,
                    listeners: {
                        click: {
                            fn:me.changeShippingMethod,
                            scope: me,
                            delegate: "x-menu-item-link"   
                        }
                    },
                    items: [{
                        text: "loading..."
                    }]
                }
            });

            
            
                        
            /*
            me.shippingMethodMenu = Ext.create('Ext.form.ComboBox', {
                store: this.allRates,
                queryMode: 'local',
                displayField: 'Value',
                valueField: 'Key',
                value: this.record.get("shippingMethodCode")
                

            });
            */

            
            
            
            

            tb.items.push(me.shippingMethodMenu);

        }
        
        if (me.enableShippingLabelButton) {
            
            me.shippingLabelButton = Ext.create("Taco.core.ux.action.Button", {
                text: "View Shipping Label",
                handler: me.viewShippingLabel,
                scope:me
            });

            tb.items.push(me.shippingLabelButton);

        }
        
        if (me.enabledPackingSlipButton) {
            me.packingSlipButton = Ext.create("Taco.core.ux.action.Button", {
                text: "View Packing Slip",
                handler: me.viewPackingSlip,
                scope: me
            });

            tb.items.push(me.packingSlipButton);
        }
        
        if (me.enabledRemoveButton) {
            me.removeButton = Ext.create("Taco.core.ux.action.Button", {
                text: "Remove",
                handler: me.removeSelectedItems,
                scope: me
            });

            tb.items.push(me.removeButton);
        }
        
        if (me.enabledMarkAsShippedButton) {
            me.markAsShippedButton = Ext.create("Taco.core.ux.action.Button", {
                text: "Mark As Shipped",
                handler: me.markAsShipped,
                scope: me
            });

            tb.items.push(me.markAsShippedButton);
        }
        

        return tb;
    },
   
    // initializes the selection model. Enables the checkbox by config
    initSelectionModel: function () {
        var me = this;
        if (me.enableCheckBoxSelection) {
            me.selModel = Ext.create('Ext.selection.CheckboxModel', {
                selType: 'checkboxmodel',
                checkOnly: true,
                showHeaderCheckbox: true
            });
        } 
    },

    // returns the column configuration for this grid
    getColumnConfig: function () {
        var me = this,
            columns = [];

        columns.push(
            {
                text: 'Quantity',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: "left",
                tdCls: "editableCell",  // adds the dotted line hover to the cells in the column
                editor: {
                    xtype: 'textfield',
                    allowBlank: true,
                    minValue: 0,
                    maxValue: 100000
                },
                dataIndex: 'quantity'
            }, {
                text: 'Code',
                draggable: false,
                width: 140,
                sortable: false,
                menuDisabled: true,
                align: "left",
                dataIndex: 'productCode'
            },
            {
                text: 'Products',
                draggable: false,
                xtype: 'templatecolumn',
                flex: 1,
                sortable: false,
                menuDisabled: true,
                tpl: [
                    '<span class="productname" >{productName}</span>',
                    '<span class="productOptions">',
                    '<tpl for="options">',
                    '<span class="option">{.}, </span>',
                    '</tpl>',
                    '</span>'
                ],
                dataIndex: 'productName'
            }, {
                text: 'Weight (lbs)',
                draggable: false,
                width: 140,
                sortable: false,
                menuDisabled: true,
                align: "left",
                dataIndex: 'weight'
            }
        );

        if (me.enableActionColumn) {
            columns.push(
                {
                    xtype: 'taco.menucolumn',
                    draggable: false,
                    text: '',
                    width: this.getActionColumnWidth(),
                    menuDisabled: true,
                    iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger ' + Taco.baseCSSPrefix + 'grid-row-menu-trigger-remove',
                    menuItems: [],
                    handler: function (grid, rowIndex, colIndex, header, e, record, item) {
                        Ext.Msg.alert('Remove Item', 'TODO: Confirm the removal of item.');
                    },
                    renderer: function (value, metaData, record) {

                    },
                    onMenuShow: function (menu, eventData) {
                        // todos: remove item from grid

                    }
                }
            );
        }

        return columns;
    },
    
    // returns an array of field configs for the store of this grid
    getFields: function() {
        return [
            
            
            /*
            orderItemId: "fe629abaecb64743b82c424279f50aba"
productCode: "uuu"
productName: "t-shirt"
quantity: 2
weight: 2
            */

            {
                "name": "orderItemId",
                "type": "string",
                "useNull": true
            },
            
            {
                "name": "productCode",
                "type": "string",
                "useNull": false
            },
            {
                "name": "productName",
                "type": "string",
                "useNull": true
            },

            {
                "name": "quantity",
                "type": "int",
                "useNull": true
            },
            
            {
                "name": "weight",
                "type": "float",
                "useNull": true,
                "defaultValue": 1
            }

            /*
            ,
            
            
            

            {
                "name": "unitPrice",
                "type": "auto",
                "defaultValue": []
            },
            
            {
                "name": "discount",
                "type": "auto",
                "useNull": true
            },
            {
                "name": "subtotal",
                "type": "float",
                "useNull": true
            },
            {
                "name": "total",
                "type": "float",
                "useNull": true
            },
       
            
            

            // not currently in json
            {
                "name": "options", //<== get list of options or extras
                "type": "auto",
                "defaultValue": []
            },

            // added this so the ui can modify its behavior when products are deleted
            {
                "name": "isDeleted",
                "type": "auto",
                "defaultValue": false
            }
        
            */


        ];
    },
    
    getShippingRatesMenu : function () {
        var allRatesMenuData = [],
            store = Taco.properties.shippingRates;
        
        if (store) {
            store.each(function (record) {
                allRatesMenuData.push({
                    text: record.get("Value"),
                    key: record.get("Key")
                });
            });
        }
        return allRatesMenuData;
    },
    
    moveSelectedItems: function (menu, item, e, eOpts) {
        var me = this,
            data = {
                orderId: me.record.get("id"),
                items : []
            },
            isCreate = false,
            isMoveToUnshipped=false,
            moveAction,
            
            moveTargetId,
            moveSourceId,
            orderId,
            config,
            grid,
            selection;

        
        
        
        
        
        if (item) {
            moveAction = item.moveAction;
            moveTargetId = item.moveTargetId;
            
            // determine if this is a create
            if (moveTargetId == -1) {
                isCreate = true;
            }
            
            // determine if this is a move back to unshippedItems
            if (moveTargetId == 0) {
                isMoveToUnshipped = true;
            }
            
            grid = item.up("gridpanel");
            selection = grid.getSelectionModel().getSelection();

            
            data.sourcePackageId = (grid.packageData) ? grid.packageData.id : null;
            data.destinationPackageId = (item.moveTargetId) ?item.moveTargetId : null;
            
            if (!isCreate) {
                // if we have package data then we are moving items from an existing package;
                
            }

            if (selection) {
                selection.forEach(function (element, index, array) {
                    data.items.push(element.getData());
                });
            }
            



        }

        
        var jsonData;
        if (isCreate) {
            jsonData = {
                package: data
            };
        } else {
            jsonData = data
        }
        

        config = {
            jsonData: jsonData,

            success: function (response) {
                // success handling here
                    
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }


                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                // error handling here
                    
            },
            scope: this
        };

        
        // call the model method to persist the change

        
        
        if (isCreate) {
            this.record.createPackage(config);
        } else {
            this.record.movePackageItems(config);
        }
    },
    
    changeShippingMethod: function (menu, item, e, eOpts) {
        
        if (item) {
            
            var grid = item.up("gridpanel");
            // get package json
            data = grid.packageData;
            // update the shipping code
            data.shippingMethodCode = item.key;
            
            config = {
                jsonData: [data],
                success: function (response) {
                    // success handling here
                    Taco.app.viewPort.unmask();
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        // service didnt' return data properly
                        return;
                    }
                    // reload the record
                    this.record.reload();
                },
                failure: function (response) {
                    // error handling here
                    Taco.app.viewPort.unmask();

                },
                scope: this
            };

            
            Taco.app.viewPort.mask("loading");

            
            // call the model method to persist the change
            this.record.changeShippingMethod(config);
            
            

        }
    },
    
    removeSelectedItems: function () {
        console.log('OrderItemGrid.removeSelectedKItems()');
        // move selection to the unpackagedItems

    },
    
    markAsShipped: function () {
        console.log('OrderItemGrid.markAsShipped()');
        // mark package as a shipped package
    },
    
    viewShippingLabel: function (button, e) {
        console.log('OrderItemGrid.viewShippingLabel()');
        // view shipping label. open in new tab. this initiates a work flow that makes the package uneditable.
        // subsequent edits to a package with a shipping label will need to be confirmed with a ui that tells the user 
        // to destroy the shipping label. and should probably remove the tracking number from the package as well.

        
        var grid = button.up("gridpanel"),
            data = grid.packageData;
        
        window.open("http://whereisMyShippingLabel.com", "_blank")
    },

    viewPackingSlip: function (button, e) {
        console.log('OrderItemGrid.viewPackingSlip()');
        // view packing slip. open in new tab
        var grid = button.up("gridpanel"),
            data = grid.packageData;
        
        window.open("http://whereisMyPackingSlip.com", "_blank")
    }
    
});
