/**
 * @class Taco.view.order.widget.PickupItemGrid
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.widget.PickupItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: [],
    
    config: {
        header: false,

        // false if its unpackaged items grid
        isPackage: true,
        
        // way to quickly determine which package type we are looking at
        isShippedPackage: false,

        editMode: true,
        
        enableCellEditing: true,
        
        enableCheckBoxSelection: true,
        
        enableActionColumn: true,
        
        enableToolbar: true,
        
        enableMoveMenu: true,
        
        enabledRemoveButton: true,
        
        enabledMarkAsFulfilledButton: true,
        
        packageMenuPagingSize: 10,

        autoHeight: true,
        
        preselectAll:true,
        
        showFulfillmentMethodColumn: true,
        
        showFulfillmentLocationColumn: true,

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
                    
                    if (!me.isShippedPackage) {
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
        }
    },
    
    initComponent: function(eOpts) {
        var me = this,
            data = [];

        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-shippingitemgrid'].join(' ');

        // if data is already set on the panel load it by default.
        if (me.data) {
            data = me.data;
        }
        
        if (me.isShippedPackage) {
            me.disableSelection = true;
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
        
        // if toolbar is enabled and there is data to display show the toolbar and this is the unshipped items then show the toolbar.
        if (me.getEnableToolbar() && data.length && me.isUnShippedItems) {
            this.tbar = Ext.create('Ext.toolbar.Toolbar', this.getToolBarConfig()); 
        }

        Ext.apply(this, {
            viewConfig: {
                // changing the hover class to get rid of taco overrides of grid
                overItemCls: 'taco-order-shippingItem-grid-row-over',
                emptyText: '<div class="empty-grid-message">No items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false,  // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disabledCls: "taco-order-shippingitemgrid-disabled", // css class to add when the order grid is disabledstripeRows: false,
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

        if (this.editMode) {
            if (this.preselectAll) {
                this.on('viewready', function (grid) {
                    this.getSelectionModel().selectAll(true);
                });
            }
        }

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
                text: "New Pickup",
                moveAction: "addSelectionToPackage",
                moveTargetId: -1
            }
        );
        
        //only show this if its not the unshipped items. 
        if (!me.isUnShippedItems) {
            menu.push(
                {
                    text: "Pending Items",
                    moveAction: "addSelectionToPackage",
                    moveTargetId: 0
                }
            );
        }
        
        
        var unshippedPackages = this.record.get("pendingPickups");

        // loop on the packages adding them as addTo Targets;
        var packageLength = unshippedPackages.length;
        for (var i = packageLength; i > 0; i--) {

            var packageId = null;
            if (me.packageData) {
                packageId = me.packageData.id
            }

            // only include the packages that we are not currently operating on.
            if (unshippedPackages[i - 1].id != packageId) {
                menu.push({
                    text: "Pickup " + i,
                    moveAction: "addSelectionToPackage",
                    moveTargetId: unshippedPackages[i - 1].id
                });
            }
        }
        

        return menu;
    },

    getToolBarConfig : function() {
        var me = this,
            availableActions=[],
            tb = {
                plain: true,
                //cls:"shipping-toolbar",
                style:"background-color:#ffffff;padding-bottom:2px;",
                enableOverflow:true,
                items:[]
            };

        
        if (me.packageData) {
            availableActions = me.packageData.availableActions;
        }
        
        if (me.getEnableMoveMenu()) {

            var unShippedPackages = this.record.get("pendingPickups");
            // if there is a last package use its id, otherwise make the target a new package
            var lastPackage = unShippedPackages[unShippedPackages.length - 1];
            var lastPackageId = (lastPackage) ? lastPackage.id : -1;

            var moveMenuText = "Add to Pickup";
            var menuXtype = "Ext.button.Split";
            if (!me.isUnShippedItems) {
                moveMenuText = "Move to";
                menuXtype = "Ext.button.Button";
                // note that the taco button doesn't support being enabled and disabled
            }
            
            

            // note: i had to use the ext split button. The Taco.core.ux.action.SplitButton doesn't responsd to .enabled(), .disable() and needs to be refactored to support the standard extjs button behaviors fully.
            //me.moveMenuAction = Ext.create("Taco.core.ux.action.SplitButton", {
            me.moveMenuAction = Ext.create(menuXtype, {
                ui: 'action',
                scale: 'medium',
                menuAlign: 'tr-br',
                margin:"0 2px 0 0",
                text: moveMenuText,
                itemId: 'moveMenuTrigger',
                moveAction: "addSelectionToPackage",
                moveTargetId: lastPackageId,
                
                disabled:(!this.preselectAll),
                handler: function (button, e) {
                    // only do the click to move if its in the unshipped items. for regular packages its a menu button instead of split button
                    if (me.isUnShippedItems) {
                        me.moveSelectedItems(null, button, e);
                    }
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
        
        
        if (me.enabledRemoveButton && false) {
            me.removeButton = Ext.create("Ext.button.Button", {
                text: 'Remove',
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                handler: me.removeSelectedItems,
                scope: me
            });

            tb.items.push(me.removeButton);
        }       
        

        if (me.enabledMarkAsFulfilledButton && Ext.Array.contains(availableActions, "PickUp") && false) {
            me.markAsFulfilledButton = Ext.create("Ext.button.Button", {
                text: 'Mark As Fulfilled',
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                handler: me.markAsFulfilled,
                scope: me
            });

            tb.items.push(me.markAsFulfilledButton);
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
                headerWidth: 37,
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
                width: 80,
                sortable: false,
                menuDisabled: true,
                align: "left",
                editor: {
                    xtype: 'textfield',
                    // highlights the cell when not editing
                    showBorder: true,
                    selectOnFocus:true,
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
                    '<span class="product-options">',
                    '<tpl for="options">',
                    '<span class="option">{.}, </span>',
                    '</tpl>',
                    '</span>'
                ],
                dataIndex: 'productName'
            }, {
                text: 'Weight (lbs)',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: "center",
                dataIndex: 'weight'
            }
        );
        

        if (this.showFulfillmentMethodColumn) {
            columns.push(
                {
                    text: 'Method',
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "left",
                    dataIndex: 'fulfillmentMethod'
                }
            );
        }
        
        if (this.showFulfillmentLocationColumn) {
            columns.push(
                {
                    text: 'Location',
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "left",
                    dataIndex: 'fulfillmentLocationCode'
                }
            );
        }

        /*
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
                        // tell the method that we we want to move this item back to the unshippedItems list;
                        var dom = Ext.get(item);
                        dom.moveTargetId = 0;
                        grid.up('gridpanel').moveSelectedItems(null, dom);
                    },
                    scope:me,
                    renderer: function (value, metaData, record) {

                    },
                    onMenuShow: function (menu, eventData) {
                        // todos: remove item from grid

                    }
                }
            );
        }*/

        if (me.enableActionColumn) {
            columns.push(
                {
                    xtype: 'taco.menucolumn',
                    draggable: false,
                    text: 'Actions',
                    menuDisabled: true,
                    width: this.getActionColumnWidth(),
                    menu: Ext.create('Ext.menu.Menu', {
                        plain: true,
                        listeners: {
                            click: {
                                fn: me.moveSelectedItems,
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        },
                        items: [{
                            text: "loading..."
                        }]
                    }),
                    menuItems: [],
                    onMenuShow: function (menu, eventData) {
                        var extraMenu = eventData.grid.getMenuActions();
                        menu.removeAll();
                        menu.add(extraMenu);
                    }
                }
            );
        }

        return columns;
    },
    
    // returns an array of field configs for the store of this grid
    getFields: function() {
        return [
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
            },
            {
                "name": "fulfillmentMethod",
                "type": "string",
                "useNull": true
            },
            {
                "name": "fulfillmentLocationCode",
                "type": "string",
                "useNull": true
            }
        ];
    },


    executeMoveItems: function (config) {
        var me = this,
            isCreate = false,
            callConfig;

        var orderId = me.record.get("id");
        var sourcePickupId = config.sourcePickupId;
        var destinationPickupId = config.destinationPickupId;
        var items = config.items;


        // determine if this is a create
        if (destinationPickupId == -1) {
            isCreate = true;
        }
        
        callConfig = {
            jsonData: {
                orderId: orderId,
                items: items,
                sourcePickupId: sourcePickupId,
                destinationPickupId: destinationPickupId
            },
            showMask: true,
            success: function (response) {
                this.record.reload();
            },
            scope: this
        };
        
        Taco.app.viewPort.setLoading(true);
        // call the model method to persist the change
        if (isCreate) {
            this.record.createPickup(callConfig);
        } else {
            this.record.movePickupItems(callConfig);
        }
    },
    // extract the json package data from the current grid selection and return it 
    getSelectedDataItems: function () {
        var items = [];
        var selection = this.getSelectionModel().getSelection();
        Ext.Array.forEach(selection,function (element, index, array) {
            items.push(element.getData());
        });

        return items;
    },

    // process the grid selections and call the exectueMove
    moveSelectedItems: function (menu, item, e, eOpts) {
        var me = this;
        if (item) {
            var items = me.getSelectedDataItems();
            var sourcePickupId = (me.packageData) ? me.packageData.id : null;
            var destinationPickupId = (item.moveTargetId) ? item.moveTargetId : null;
            
            // execute the call
            me.executeMoveItems({
                sourcePickupId: sourcePickupId,
                destinationPickupId: destinationPickupId,
                items: items
            });
        }
    },
    
    // move the currently selected items and move them to the unshipped items 
    removeSelectedItems: function () {
        var me = this,
            items = me.getSelectedDataItems(),
            sourcePickupId = (me.packageData) ? me.packageData.id : null;
        if (sourcePickupId && items.length) {
            me.executeMoveItems({
                sourcePickupId: sourcePickupId,
                destinationPickupId: null,
                items: items
            });
        }
    },
    
    // mark pickup as a fulfilled;
    markAsFulfilled: function () {
        var me = this,
            callConfig;

        var orderId = me.record.get("id");
        var sourcePickupId = me.packageData.id;
        callConfig = {
            jsonData: {
                orderId: orderId,
                pickupIds: [sourcePickupId]
            },
            showMask: true,
            success: function (response) {
                this.record.reload();
            },
            scope: this
        };

        Taco.app.viewPort.setLoading(true);
        this.record.markPickupFulfilled(callConfig);

    },
    
    // mark pickup as a ready;
    markAsReady: function () {
        var me = this,
            callConfig;

        var orderId = me.record.get("id");
        var sourcePickupId = me.packageData.id;

        callConfig = {
            jsonData: {
                orderId: orderId,
                pickupIds: [sourcePickupId]
            },
            showMask: true,
            success: function (response) {
                this.record.reload();
            },
            scope: this
        };
        
        this.record.markPickupReady(callConfig);

    },


    viewPackingSlip: function (button, e) {
        var grid = button.up("gridpanel"),
            data = {
                shippingMethodName: grid.packageData.shippingMethodName,
                items: grid.packageData.items,
                billingContact: this.order.data.billingContact,
                fulfillmentContact: this.order.data.fulfillmentContact,
                payment: this.order.data.payments[0],
                order: this.order.data,
                orderRecord:this.order,
                siteName: Taco.app.context.getSite().name
            },
            win = window.open(),
            tpl;



        tpl = new Ext.XTemplate(
            '<div style="font: 14px/1.5 sans-serif;">',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody><tr>',
                    '<td style="padding: 4px 30px 20px 4px; width: 100%;">',
                        '<h1 style="margin: 0px;">{siteName}</h1>',
                    '</td>',
                    '<td style="padding: 4px 30px 20px 4px;">',
                        '<h2 style="margin: 0px; white-space: nowrap;">PACKING SLIP</h2>',
                        '<table style="border-collapse: collapse; border-spacing: 0px;"><tbody><tr>',
                            '<td style="padding: 4px 30px 4px 4px;">',
                                '<div style="font-weight: bold; white-space: nowrap;">Date:</div>',
                                '<div style="white-space: nowrap;">{order.createDate:date("M d g:ia")}</div>',
                            '</td>',
                            '<td style="padding: 4px 30px 4px 4px;">',
                                '<div style="font-weight: bold; white-space: nowrap;">Order #:</div>',
                                '<div style="font-weight: bold; white-space: nowrap;">{order.orderNumber}</div>',
                            '</td>',
                        '</tr></tbody></table>',
                    '</td>',
                '</tr></tbody></table>',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody>',
                    '<tr>',
                        '<td style="font-weight: bold;">Bill To: (Customer ID #1)</td>',
                        '<td style="font-weight: bold;">Ship To:</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 20px 4px;">',
                            '<div>{billingContact.firstName} {billingContact.lastName}</div>',
                            '<div>{billingContact.address1}</div>',
                            '<div>{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode}</div>',
                            '<div>{billingContact.countryCode}</div>',
                            '<div>{billingContact.homePhone}</div>',
                            '<div>{billingContact.email}</div>',
                        '</td>',
                        '<td style="border-top: 2px solid black; font-size: 16px; font-weight: bold; padding: 4px 30px 20px 4px;">',
                            '<div>{fulfillmentContact.firstName} {fulfillmentContact.lastName}</div>',
                            '<div>{fulfillmentContact.address1}</div>',
                            '<div>{fulfillmentContact.cityOrTown}, {fulfillmentContact.stateOrProvince} {fulfillmentContact.postalOrZipCode}</div>',
                            '<div>{fulfillmentContact.countryCode}</div>',
                            '<div>{fulfillmentContact.homePhone}</div>',
                            '<div>{fulfillmentContact.email}</div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="font-weight: bold;">Payment Method:</td>',
                        '<td style="font-weight: bold;">Shipping Method:</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="border-top: 2px solid black; font-weight: bold; padding: 4px 30px 20px 4px;">{payment.paymentType}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 20px 4px;">{shippingMethodName}</td>',
                    '</tr>',
                '</tbody></table>',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody>',
                    '<tr>',
                        '<td style="font-weight: bold; white-space: nowrap;">Code</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Name</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Qty</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Price</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Total</td>',
                    '</tr>',
                    '<tpl for="items"><tr>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{productCode}</td>',
                        '<td style="border-top: 2px solid black; font-weight: bold; padding: 4px 30px 15px 4px; width: 100%;">{productName}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{quantity}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{[values.orderRecord.formatCurrency(values.unitPrice)]}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{[values.orderRecord.formatCurrency(values.total)]}</td>',
                    '</tr></tpl>',
                '</tbody></table>',
            '</div>'
        );

        
        Ext.fly(win.document.body).setHTML(tpl.apply(data));
    }
    
});
