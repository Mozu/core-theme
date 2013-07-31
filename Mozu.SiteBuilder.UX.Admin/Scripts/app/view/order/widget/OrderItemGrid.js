/**
 * @class Taco.view.order.widget.OrderItemGrid
 */
Ext.define('Taco.view.order.widget.OrderItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.widget.ProductPickerField',
        'Taco.core.ux.grid.Pager'
    ],
    
    config: {
        header: false,
        
        editMode: false,
        
        enableCellEditing: true,
        
        enableActionColumn: true,
        
        enableToolbar: false,

        autoHeight: true,

        // automatically scroll the grid when it overflows
        autoScroll: true,
        
        // number of products per page to display in the add product search field
        productsPerPage : 30,

        // the toolbar that is currently being displayed atop the order item grid panel
        activeAddToolbar : null,

        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 100,

        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function(eOpts) {
        var me = this,
            siteContext;
        
        this.addEvents('save','saveFailure','saveSuccess');


        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-orderitemgrid'].join(' ');
        
        siteContext = Taco.app.context.getCurrent().urlToken;

        var actions = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [

            ]
        });



        // todo: need to create a custome bound list to have the ability to replace the paging toolbar. Will also need to figure out why the paging toolbar has issues. 
        /*
        var pager = Ext.create('Taco.core.ux.grid.Pager', {
            store: me.productStore
        });
        */

        /*
        var productFilterProperties = [{
                property: 'all',
                text: 'All',
                isDefault: true
            }, {
                property: 'productName',
                text: 'Name'
            }, {
                property: 'productCode',
                text: 'Code'
            }, {
                property: 'producttypeid',
                text: 'Product Type'
            }, {
                property: 'productFullDescription',
                text: 'Description'
            }
        ];
        */
        
        

        // if the grid is editable show the edit toolbar;
        if (this.getEditMode()) {
            
            this.dockedItems = [
                {
                    xtype: "toolbar",
                    doc: "top",
                    componentCls: "title-toolbar",
                    enableOverflow: true,
                    weight: 1,
                    style: "margin:5px 0px 5px 0px; border:0px;background-color:#fff;",
                    items: [
                        {
                            xtype: "component",
                            html: "Edit Order Details",
                            style: "padding:5px 0px 5px 0px; font-size: 1.25em",
                            cls: "title",
                        },
                        "->",
                        {
                            //xtype: 'taco.button',
                            //   autoEl: 'a',
                            cls: "taco-toolbar-link",
                            style: "font-size: 1.0em;color:blue",
                            text: "Order Level Adjustment",
                            handler: function() {
                                this.toggleAddToolbar("orderLevelAdjustment");
                            },
                            scope: this
                        },
                        {
                            //xtype: 'taco.button',
                            // autoEl: 'a',
                            //style: "padding:5px; margin-left:10px;font-size: 1.0em;cursor:pointer;color:blue",
                            cls: "taco-toolbar-link",
                            text: "Add Coupon",
                            handler: function() {
                                this.toggleAddToolbar("coupon");
                            },
                            scope: this
                        },
                        {
                            //xtype: 'taco.button',
                            //autoEl: 'a',
                            //style: "padding:5px;margin-left:10px; font-size: 1.0em;cursor:pointer;color:blue",
                            cls: "taco-toolbar-link",
                            text: "Add Product",
                            handler: function() {

                                this.toggleAddToolbar("product");
                            },
                            scope: this
                        }
                    ]
                }
            ];
        };
        

        this.on('beforeedit', function(plugin, edit) {
            // disable editing when the grid is not editMode:true
            return this.editMode;
        },this);

        this.on('selectionchange', function(view, selected, eOpts) {
            var me = this;
            // process the modification;
        }, this);


        Ext.apply(this, {
            features: [
                // This is the plugin for enabling the adding of an adustment row for each orderItem
                {
                    ftype: 'rowbody',
                    rowBodyTrCls: "x-grid-row-adjustment",
                    rowBodyDivCls: "x-grid-cell-inner adustment-cell-inner",
                    rowBodyTdCls: "x-grid-cell adjustment-cell",
                    getAdditionalData: function(data, rowIndex, record, orig) {
                        var colspan = 1,
                            discount = record.get("discount"),
                            rowBodyCls = (discount) ? "hasDiscount" : "noDiscount";

                        return {
                            discountData: discount,
                            rowBodyCls: rowBodyCls,
                            rowBodyColspan: colspan
                        };
                    },

                    getRowBody: function(values) {

                        return [
                            '<tr class="' + this.rowBodyTrCls + ' {rowBodyCls}">',
                            '<td  class="' + this.rowBodyTdCls + '" colspan="{rowBodyColspan}">',
                            '<div class="' + this.rowBodyDivCls + '">Discount: {discountData.description}</div>',
                            '</td>',
                            '<td  class="' + this.rowBodyTdCls + '">',
                            '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">-{discountData.unitPrice:usMoney}</div>',
                            '</td>',
                            '<td class="' + this.rowBodyTdCls + '">',
                            '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">{discountData.quantity}</div>',
                            '</td>',
                            '<td  class="' + this.rowBodyTdCls + '">',
                            '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">-{discountData.total:usMoney}</div>',
                            '</td>',
                            '<td  class="' + this.rowBodyTdCls + '">',
                            '<div class="' + this.rowBodyDivCls + '"></div>',
                            '</td>',
                            '</tr>'
                        ].join('');
                    }
                }
            ],

            viewConfig: {
                cls: (this.getEditMode()) ? "editmode-enabled" : "",
                // changing the hover class to get rid of taco overrides of grid
                overItemCls: 'taco-orderItem-grid-row-over',
                emptyText: '<div class="emptyGridMessage">No order items to display</div>',
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
                    if (record.get("discount")) {
                        return 'taco-order-orderItem-hasDiscount';
                    }
                    return '';
                }
            },

            selModel: {
                selType: 'cellmodel'
            },

            plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            })],

            columns: [
                {
                    text: 'Products',
                    draggable: false,
                    xtype: 'templatecolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    tpl: [
                        '<tpl if="isDeleted">',
                        '<span class="productLinkDisabled" productCode="{productCode}">{productName}</span>',
                        '<tpl else>',
                        '<a class="productLink" productCode="{productCode}" target="_blank" href="/admin/' + siteContext + '/products/edit/{productCode}">{productName}</a>',
                        '</tpl>',
                        '<div class="productOptions">',
                        '<tpl for="options">',
                        '<span class="option">{.}, </span>',
                        '</tpl>',
                        '</div>'
                    ],
                    dataIndex: 'productName'
                },
                {
                    text: 'Price',
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "right",
                    renderer: 'usMoney',
                    tdCls: "editableCell",  // adds the dotted line hover to the cells in the column
                    editor: {
                        xtype: 'unitfield',
                        unitString: "$",
                        unitAtEnd: false,
                        allowBlank: true,
                        minValue: 0,
                        maxValue: 100000
                    },
                    dataIndex: 'unitPrice'
                },
                {
                    text: 'Quantity',
                    draggable: false,
                    width: 100,
                    sortable: false,
                    menuDisabled: true,
                    align: "right",
                    tdCls: "editableCell",  // adds the dotted line hover to the cells in the column
                    editor: {
                        xtype: 'textfield',
                        allowBlank: true,
                        minValue: 0,
                        maxValue: 100000
                    },
                    dataIndex: 'quantity'
                },
                {
                    text: 'Row Total',
                    draggable: false,
                    menuDisabled: true,
                    width: this.getRowTotalColumnWidth(),
                    sortable: false,
                    align: "right",
                    renderer: 'usMoney',
                    dataIndex: 'subtotal'
                },
                {
                    xtype: 'taco.menucolumn',
                    draggable: false,
                    text: '',
                    width: this.getActionColumnWidth(),
                    menuDisabled: true,
                    iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger ' + Taco.baseCSSPrefix + 'grid-row-menu-trigger-remove',
                    menuItems: [],
                    handler: function(grid, rowIndex, colIndex, header, e, record, item) {
                        Ext.Msg.alert('Remove Item', 'TODO: Confirm the removal of item.');
                    },
                    renderer: function(value, metaData, record) {

                    },
                    onMenuShow: function(menu, eventData) {
                        // todos: remove item from grid

                    }
                }
            ]
        });

      
        me.callParent(arguments);

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
        }

        return columns;
    },
    
    
    toggleAddToolbar: function (toolbarType) {
        var me=this,
            tb;
        
        // if we have an existing toolbar we need to destroy it.
        if (me.activeAddToolbar && !me.activeAddToolbar.isDestroyed) {
            
            me.activeAddToolbar.hide();
            me.removeDocked(me.activeAddToolbar,true);
            // if the type is the same as the currently active toolbar then just destroy it and end. this is the user toggling the toolbar close by clicking on the add product link again;
            if (me.activeAddToolbar.toolbarType == toolbarType) {
                return;
            }
        }

        // create the new toolbar and add it to the container;
        switch (toolbarType) {
            case "product":
                tb = me.getAddProductToolbar();
                break;
            case "coupon":
                break;
            case "orderLevelAdjustment":
                break;
        }

        me.activeAddToolbar = tb;
        me.addDocked(tb);
    },
    
    // pass focus to the active search field so the user can keep adding / searching after exiting a previous selection
    focusActiveSearchField: function () {
        if (this.activeSearchField && !this.activeSearchField.isDestroyed) {
            this.activeSearchField.focus(true, 100);
        }
    },
    
    // creates and returns a toolbar for adding products;
    getAddProductToolbar: function (config) {
        var me = this,
            tbConfig;

        this.activeSearchField = Ext.create('Taco.view.order.widget.ProductPickerField', {
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                pageSize: me.productsPerPage,
                autoLoad: true
            }),
            pageSize: me.productsPerPage,
            listeners: {
                beforeselect: {
                    fn: function (combo, record, index, e) {
                        var productCode = record.get("productCode"),
                            isConfigurable = record.get("isConfigurable");
                        
                        //var picker = combo.getPicker();
                        combo.collapse();
                        

                        // determine if we need to show the configurator
                        if (isConfigurable) {
                            var win = Ext.create('Taco.view.order.modal.ProductConfigurator', {
                                productCode: productCode,
                                listeners: {
                                    'configureproduct': {
                                        fn: function (configurationData) {
                                            this.
                                                addConfiguredProduct([configurationData]);
                                        },
                                        scope: this
                                    },
                                    'beforeclose': {
                                        fn: this.focusActiveSearchField,
                                        scope: this
                                    }
                                }
                            });
                        } else {
                            // the product doesn't require configuration so just add it and skip opening the dialog;
                            this.addConfiguredProduct([
                                {
                                    // always going to be 1 because they don't want to open the configurator for products without options or extras
                                    quantity: 1,
                                
                                    productCode: productCode
                                }
                            ]);
                            this.focusActiveSearchField();
                        }
                        
                        // cancel the selection so that the same product can be reselected again;
                        return false;
                    },
                    scope: this
                }
            }
        });
                
        tbConfig = Ext.apply({
            toolbarType:"product",
            items: [
                {
                    xtype: 'component',
                    html: "Add Product",
                    style: "padding:0px 10px 0px 10px;"
                },
                this.activeSearchField
            ]
        }, config);

        return me.getAddItemToolbar(tbConfig);
    },
    
    getAddItemToolbar: function (config) {
        var tbConfig = Ext.apply({
            dock: "top",
            weight:2,
            cls: "additem-toolbar",
            style: "border-color:#CCC;background-color:#f1f1f1;padding:5px;",
            items: [],
            listeners: {
                afterlayout: {
                    fn: function () {
                        this.focusActiveSearchField();
                    },
                    scope: this
                } 
            },
            onDestroy: function() {
            
            }
        }, config);

        // add the closer;
        tbConfig.items.push(
            {
                text: "X",
                xtype: "taco.button",
                height: 24,
                style: "padding:5px;min-width:30px;",
                handler: function(button, evt) {
                    var tb = button.up('toolbar');
                    // destroy all the child components
                    tb.removeAll(true);
                    // need to hide the toolbar before deleting it to avoid a bug in hbox layout 
                    
                    tb.hide();
                    
                    // remove the toolbar from its owner container and destroy it.
                    tb.ownerCt.removeDocked(tb,true);
                },
                scope: this
            }
        );
    
        return Ext.create('Ext.toolbar.Toolbar', tbConfig);
    },
    
    // returns an array of field configs for the store of this grid
    getFields: function() {
        return [

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
                // success handling here

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    this.setLoading(false);
                    return;
                }
                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                // error handling here
                this.setLoading(false);
            },
            scope: this
        };


        
        this.setLoading(true);
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
    

    // accepts an array of orderItem configuration data objects and calls the service to persist it.
    addConfiguredProduct: function (orderItems) {
        var me = this;
        this.fireEvent('save');
        
        this.record.addOrderItem({
            jsonData: {
                orderId: this.record.get('id'),
                orderItems: orderItems
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    this.fireEvent('saveFailure');
                    
                    var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                        text: "Error adding order item."
                    });
                    errorDialog.show();

                    return;
                }
                this.fireEvent('saveSuccess');

                //this.record.reload();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error adding order item.";
                
                this.fireEvent('saveFailure');
                
                var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                    text: msg
                });
                errorDialog.show();
            },
            scope: this
        });

    }
});