/**
 * @class Taco.view.order.widget.ShippingItemGrid
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.widget.ShippingItemGrid', {
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

        enableShippingMethodMenu: true,

        enableShippingLabelButton: true,

        enabledPackingSlipButton: true,

        enabledRemoveButton: true,

        enabledMarkAsShippedButton: true,


        packageMenuPagingSize: 10,

        autoHeight: true,

        preselectAll: true,

        showFulfillmentMethodColumn: true,

        showFulfillmentLocationColumn: true,

        plugins: [],

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
            selectionchange: {
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

    initComponent: function (eOpts) {
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

        if (me.getEnableToolbar() && data.length) {
            this.bbar = Ext.create('Ext.toolbar.Toolbar', this.getToolBarConfig());

        }

        Ext.apply(this, {
            viewConfig: {
                // changing the hover class to get rid of taco overrides of grid
                overItemCls: 'taco-order-shippingItem-grid-row-over',
                emptyText: '<div class="empty-grid-message">No items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false, // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disabledCls: "taco-order-shippingitemgrid-disabled", // css class to add when the order grid is disabledstripeRows: false,
                //   enableTextSelection: true
                listeners: {
                    itemmouseenter: {
                        fn: function (view, record, item, index, e, eOpts) {

                        },
                        scope: me
                    },
                    highlightitem: {
                        fn: function (view, record, item, index, e, eOpts) {

                        },
                        scope: me
                    }
                },

                // provides selective row class addition based on record.
                getRowClass: function (record) {
                    if (!record) return '';
                    return '';
                }
            },
            columns: me.getColumnConfig()
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


        // make sure the value that the user enters is appropriate;
        // if the user clears the value or enters text or a number greater then what's available then reset it to the maximum;
        this.on('edit', function (editor, e) {
            if (e.field == "quantity") {
                // make sure the quantity does not exceed the maximum available;
                var maxAllowed = e.record.raw.quantity;
                var newValue = parseInt(e.value);
                // tring to move more then are available;
                if (!newValue || newValue > maxAllowed) {
                    e.record.set(e.field, maxAllowed);
                }
            }
        });

        me.callParent(arguments);

    },

    // dynamically build the menu options based on the current state of the order shipment data entities
    getMenuActions: function (config) {
        var me = this,
            menu = [];

        var specificPackages = [];

        // if the package already has a shipmentId that means the user has clicked the viewShippingLabel buttona and the package can no longer be modified. It can only be deleted;

        var isDisabled = (this.packageData && this.packageData.shipmentId);


        // always need to have new package
        menu.push({
            text: "New Package",
            moveAction: "addSelectionToPackage",
            disabled: isDisabled,
            moveTargetId: -1
        });

        //only show this if its not the unshipped items. 
        if (!me.isUnShippedItems) {
            menu.push({
                text: "Pending Items",
                moveAction: "addSelectionToPackage",
                disabled: isDisabled,
                moveTargetId: 0
            });
        }


        var unshippedPackages = this.record.get("unShippedPackages");

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
                    text: "Package " + i,
                    moveAction: "addSelectionToPackage",
                    disabled: isDisabled,
                    moveTargetId: unshippedPackages[i - 1].id
                });
            }
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

    getToolBarConfig: function () {
        var me = this,
            tb = {
                plain: true,
                style: "background-color:#ffffff;padding-bottom:2px;",
                enableOverflow: true,
                items: ['->']
            };


        if (me.getEnableMoveMenu() && me.isUnShippedItems) {

            var unShippedPackages = this.record.get("unShippedPackages");
            // if there is a last package use its id, otherwise make the target a new package
            var lastPackage = unShippedPackages[unShippedPackages.length - 1];
            var lastPackageId = (lastPackage) ? lastPackage.id : -1;

            var moveMenuText = "Move to";
            var menuXtype = "Ext.button.Split";
            if (!me.isUnShippedItems) {
                moveMenuText = "Move to";
                menuXtype = "Ext.button.Button";
                // note that the taco button doesn't support being enabled and disabled
            }

            me.moveMenuAction = Ext.create(menuXtype, {
                ui: 'action',
                scale: 'medium',
                margin: "0 2px 0 0",
                text: moveMenuText,
                itemId: 'moveMenuTrigger',
                moveAction: "addSelectionToPackage",
                moveTargetId: lastPackageId,

                disabled: (!this.preselectAll),
                handler: function (button, e) {
                    // only do the click to move if its in the unshipped items. for regular packages its a menu button instead of split button
                    if (me.isUnShippedItems) {
                        me.moveSelectedItems(null, button, e);
                    }
                },
                scope: me,
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

        return tb;
    },

    // initializes the selection model. Enables the checkbox by config
    initSelectionModel: function () {
        var me = this;
        if (me.enableCheckBoxSelection) {
            me.selModel = Ext.create('Ext.selection.CheckboxModel', {
                selType: 'checkboxmodel',
                checkOnly: true,
                injectCheckbox: 'last',
                //toggleOnClick: false,
                headerWidth: 37,
                showHeaderCheckbox: true
            });
        }
    },

    // returns the column configuration for this grid
    getColumnConfig: function () {
        var me = this,
            columns = [];

        columns.push({
            text: 'Code',
            draggable: false,
            width: 140,
            sortable: false,
            menuDisabled: true,
            align: "left",
            dataIndex: 'productCode'
        }, {
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
            width: 140,
            sortable: false,
            menuDisabled: true,
            align: "left",
            dataIndex: 'weight'
        });


        if (this.showFulfillmentMethodColumn) {
            columns.push({
                text: 'Method',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: "left",
                dataIndex: 'fulfillmentMethod'
            });
        }

        if (this.showFulfillmentLocationColumn) {
            columns.push({
                text: 'Location',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: "left",
                dataIndex: 'fulfillmentLocationCode'
            });
        }


        if (me.enableActionColumn) {
            columns.push({
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

            });
        }

        columns.push({
            text: 'Quantity',
            draggable: false,
            width: 100,
            sortable: false,
            menuDisabled: true,
            align: "left",
            editor: {
                xtype: 'textfield',
                // highlights the cell when not editing
                showBorder: true,
                selectOnFocus: true,
                allowBlank: true,
                minValue: 0,
                maxValue: 100000
            },
            dataIndex: 'quantity'
        });

        return columns;
    },

    // returns an array of field configs for the store of this grid
    getFields: function () {
        return [


            /*
            orderItemId: "fe629abaecb64743b82c424279f50aba"
productCode: "uuu"
productName: "t-shirt"
quantity: 2
weight: 2
            */

            {
                "name": "productCode",
                "type": "string",
                "useNull": false
            }, {
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
                "defaultValue": 0
            }, {
                "name": "fulfillmentMethod",
                "type": "string",
                "useNull": true
            }, {
                "name": "fulfillmentLocationCode",
                "type": "string",
                "useNull": true
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


    executeMoveItems: function (config) {
        var me = this,
            isCreate = false,
            callConfig;

        var orderId = me.record.get("id");
        var sourcePackageId = config.sourcePackageId;
        var destinationPackageId = config.destinationPackageId;
        var items = config.items;


        // determine if this is a create
        if (destinationPackageId == -1) {
            isCreate = true;
        }

        callConfig = {
            jsonData: {
                orderId: orderId,
                items: items,
                sourcePackageId: sourcePackageId,
                destinationPackageId: destinationPackageId
            },

            success: function (response) {
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.fireEvent('setmessage', "Error moving items", 'error');
                    Taco.app.viewPort.setLoading(false);
                    return;
                }
                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error moving items";
                Taco.app.fireEvent('setmessage', msg, 'error');
                Taco.app.viewPort.setLoading(false);
            },
            scope: this
        };

        Taco.app.viewPort.setLoading(true);
        // call the model method to persist the change
        if (isCreate) {
            this.record.createPackage(callConfig);
        } else {
            this.record.movePackageItems(callConfig);
        }
    },
    // extract the json package data from the current grid selection and return it 
    getSelectedDataItems: function () {
        var items = [];
        var selection = this.getSelectionModel().getSelection();
        Ext.Array.forEach(selection, function (element, index, array) {
            items.push(element.getData());
        });

        return items;
    },

    // process the grid selections and call the exectueMove
    moveSelectedItems: function (menu, item, e, eOpts) {
        var me = this;

        if (item) {
            var items = me.getSelectedDataItems();
            var sourcePackageId = (me.packageData) ? me.packageData.id : null;
            var destinationPackageId = (item.moveTargetId) ? item.moveTargetId : null;

            // execute the call
            me.executeMoveItems({
                sourcePackageId: sourcePackageId,
                destinationPackageId: destinationPackageId,
                items: items
            });
        }
    },

    changeShippingMethod: function (menu, item, e, eOpts) {

        if (item) {

            var grid = item.up("gridpanel");
            // get package json
            data = grid.packageData;
            // update the shipping code
            data.shippingMethodCode = item.key;
            data.shippingMethodName = item.text;

            config = {
                jsonData: [data],
                success: function (response) {
                    // success handling here
                    Taco.app.viewPort.setLoading(false);
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', "Error changing shipping method", 'error');
                        return;
                    }
                    // reload the record
                    this.record.reload();
                },
                failure: function (response) {
                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : "Error changing shipping method";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    Taco.app.viewPort.setLoading(false);
                },
                scope: this
            };

            Taco.app.viewPort.setLoading(true);

            // call the model method to persist the change
            this.record.changeShippingMethod(config);


        }
    },

    // move the currently selected items and move them to the unshipped items 
    removeSelectedItems: function () {
        var me = this,
            items = me.getSelectedDataItems(),
            sourcePackageId = (me.packageData) ? me.packageData.id : null;
        if (sourcePackageId && items.length) {
            me.executeMoveItems({
                sourcePackageId: sourcePackageId,
                destinationPackageId: null,
                items: items
            });
        }
    },

    // mark package as a shipped package
    markAsShipped: function () {
        var me = this,
            callConfig;

        var orderId = me.record.get("id");
        var sourcePackageId = me.packageData.id;

        callConfig = {
            jsonData: {
                orderId: orderId,
                packageIds: [sourcePackageId]
            },

            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', "Error marking as shipped", 'error');
                    Taco.app.viewPort.setLoading(false);
                    return;
                }
                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error marking as shipped";
                Taco.app.fireEvent('setmessage', msg, 'error');
                Taco.app.viewPort.setLoading(false);
            },
            scope: this
        };

        Taco.app.viewPort.setLoading(true);
        this.record.markPackagesShipped(callConfig);

    },

    viewShippingLabel: function (button, e) {


        // view shipping label. open in new tab. this initiates a work flow that makes the package uneditable.
        // subsequent edits to a package with a shipping label will need to be confirmed with a ui that tells the user 
        // to destroy the shipping label. and should probably remove the tracking number from the package as well.


        var newWindow,
            me = this,
            grid = button.up("gridpanel"),
            data = grid.packageData,
            labelUrl = '/admin/app/order/shipping/package/label?orderId=' + data.orderId + '&packageId=' + data.id,
            windowName = "shippingLabel-" + data.orderId + "-" + data.id;

        if (data.shipmentId === null || data.shipmentId === undefined) {
            // need to open the window immediately after the click so the popup blocker doesn't suppress it. 
            //newWindow = window.open('/admin/Scripts/resources/images/legacy/loading.gif');

            newWindow = window.open('/admin/Scripts/build/resources/images/loading-shipping-label-m.gif', windowName);
            var errorIcon = "/admin/Scripts/build/resources/images/error-shipping-label.gif";

            me.setLoading(true);
            Ext.Ajax.request({
                url: '/admin/app/order/shipping/package/prepareshipment',
                method: 'POST',
                jsonData: {
                    orderId: data.orderId,
                    packageIds: [data.id],
                    defaultWeight: data.weight,
                    defaultPackagingType: data.packagingType
                },
                success: function (response) {
                    me.setLoading(false);

                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', "Error viewing shipping label", 'error');
                        newWindow.location = errorIcon;
                        return;
                    }
                    newWindow.location = labelUrl;
                    me.record.reload();
                },
                failure: function (response) {
                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : "Error moving items";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    newWindow.location = errorIcon;
                    me.setLoading(false);
                }
            });

        } else {
            window.open(labelUrl, windowName);
        }
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
                orderRecord: this.order.data,
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
            '<div>{billingContact.firstName:htmlEncode} {billingContact.lastName:htmlEncode}</div>',
            '<div>{billingContact.address1:htmlEncode}</div>',
            '<div>{billingContact.cityOrTown:htmlEncode}, {billingContact.stateOrProvince:htmlEncode} {billingContact.postalOrZipCode:htmlEncode}</div>',
            '<div>{billingContact.countryCode:htmlEncode}</div>',
            '<div>{billingContact.homePhone:htmlEncode}</div>',
            '<div>{billingContact.email:htmlEncode}</div>',
            '</td>',
            '<td style="border-top: 2px solid black; font-size: 16px; font-weight: bold; padding: 4px 30px 20px 4px;">',
            '<div>{fulfillmentContact.firstName:htmlEncode} {fulfillmentContact.lastName:htmlEncode}</div>',
            '<div>{fulfillmentContact.address1:htmlEncode}</div>',
            '<div>{fulfillmentContact.cityOrTown:htmlEncode}, {fulfillmentContact.stateOrProvince:htmlEncode} {fulfillmentContact.postalOrZipCode:htmlEncode}</div>',
            '<div>{fulfillmentContact.countryCode:htmlEncode}</div>',
            '<div>{fulfillmentContact.homePhone:htmlEncode}</div>',
            '<div>{fulfillmentContact.email:htmlEncode}</div>',
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