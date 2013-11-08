/**
 * @class Taco.view.order.widget.OrderItemGrid
 */
Ext.define('Taco.view.order.widget.OrderItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.MessageBox',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.order.widget.DiscountPickerField',
        'Taco.view.order.widget.DiscountRowBody',
        'Taco.core.ux.grid.Pager',
        'Taco.core.ux.modal.Confirmation',
        'Taco.core.ux.grid.ActionColumn'
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
        productsPerPage: 30,
        
        // number of discounts per page to display in the add coupon search field
        discountsPerPage: 30,

        // the toolbar that is currently being displayed atop the order item grid panel
        activeAddToolbar : null,

        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 110,

        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function(eOpts) {
        var me = this,
            siteContext,
            editModeCls = (this.getEditMode()) ? " orderEditable " : "";
        
        this.addEvents('save','saveFailure','saveSuccess');
        
        me.cls = [this.cls, editModeCls, Taco.baseCSSPrefix + 'orderform-orderitemgrid'].join(' ');
        
        siteContext = Taco.app.context.getCurrent().urlToken;

        // if the grid is editable show the edit toolbar;
        if (this.getEditMode()) {
            
            // listen for changes to the amount and quantity fields and persist them
            me.on('edit', me.onFieldEdit, me);

            this.dockedItems = [
                {
                    xtype: "toolbar",
                    doc: "top",
                    componentCls: "title-toolbar",
                    enableOverflow: true,
                    weight: 1,
                    items: [
                        {
                            xtype: "component",
                            html: "Edit Order Details",
                            cls: "title"
                        },
                        "->",
                        {
                            xtype: "button",
                            scale: "medium",
                            ui:"link",
                            cls: "taco-toolbar-link",
                            text: "Order Level Adjustment",
                            handler: function() {
                                this.toggleAddToolbar("orderAdjustment");
                            },
                            scope: this
                        },
                        {
                            xtype: "button",
                            scale: "medium",
                            ui: "link",
                            cls: "taco-toolbar-link",
                            text: "Add Coupon",
                            handler: function() {
                                this.toggleAddToolbar("coupon");
                            },
                            scope: this
                        },
                        {
                            xtype: "button",
                            scale: "medium",
                            ui: "link",
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
        } else {
            // if there is a draft version of this order we need to show a warning toolbar
            if (this.record.get("hasDraft")) {
                me.showHasDraftToolbar();
            }
        };
   

        this.on('beforeedit', function(plugin, edit) {
            // disable editing when the grid is not editMode:true
            return this.editMode;
        }, this);
        
        
        Ext.apply(this, {
            features: [
                {
                    ftype: 'discountrowbody'
                }
            ],

            viewConfig: {
                cls: (this.getEditMode()) ? "editmode-enabled" : "",
                trackOver: (this.getEditMode()),
                // changing the hover class to get rid of taco overrides of grid
                overItemCls: 'taco-orderItem-grid-row-over',
                emptyText: '<div class="empty-grid-message">No order items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false,  // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disableSelection: (!this.getEditMode()),
                listeners: {
                    beforecellmousedown: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        //prevent the column from being selected unless its an editor column
                        return me.columns[cellIndex].hasEditor();
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
                resizable: false,
                menuDisabled: true,
                tpl: new Ext.XTemplate(
                    '<tpl if="isDeleted">',
                    '<span class="product-link-disabled" productCode="{productCode}">{productName}</span>',
                    '<tpl else>',
                    //'<a class="product-link" productCode="{productCode}" target="_blank" href="/admin/' + siteContext + '/products/edit/{productCode}">{productName}</a>',
                    '<span class="product-link-disabled">{productName}</span>',
                    '</tpl>',
                    '<div class="product-options">',
                    '<tpl for="options">',
                    '<span class="option"><tpl if="xindex &gt; 1">, </tpl>{Name}',
                    ': {Value}',
                    '</span>',
                    '</tpl>',
                    ' Fulfillment Method: {fulfillmentMethod}',
                    '</div>'
                    ),
                    dataIndex: 'productName',
                    listeners: {
                        click: {
                            fn: function (view, cell, cellIndex, rowIndex, e, record, row, eOpt) {
                                
                                var editMode = view.ownerCt.editMode;
                                if (!editMode || e.target.tagName != "A") {
                                    return;
                                }
                                
                                //temporarily disabling while we add service support for updating the options and extras.
                                return;

                                // prevent the default link behavior
                                e.preventDefault();
                                
                                var productCode = record.get("productCode"),
                                isConfigurable = record.get("isConfigurable");

                                // determine if we need to show the configurator
                                //if (isConfigurable) {
                                
                                    var win = Ext.create('Taco.view.order.modal.ProductConfigurator', {
                                        productCode: productCode,
                                        configuredProduct: record,
                                        listeners: {
                                            'configureproduct': {
                                                fn: function (configurationData) {
                                                    //this.addConfiguredProduct([configurationData]);
                                                    
                                                },
                                                scope: this
                                            }
                                        }
                                    });
                                //}
                                
                            },
                            scope: this
                        }
                        
                    }
                },
                {
                    text: 'Price',
                    draggable: false,
                    resizable: false,
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
                    resizable: false,
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
                    resizable: false,
                    menuDisabled: true,
                    width: this.getRowTotalColumnWidth(),
                    sortable: false,
                    align: "right",
                    renderer: 'usMoney',
                    dataIndex: 'displaySubtotal'
                },
                {
                    //xtype: 'taco.menucolumn',
                    //xtype:"templatecolumn",
                    xtype: 'taco.actioncolumn',
                    disabled:(!this.getEditMode()),
                    draggable: false,
                    resizable: false,
                    menuDisabled: true,
                    text: '',
                    width: this.getActionColumnWidth(),
                    // note: "x-action-col-icon" is required for the action column to call the handler;
                    //innerCls: "x-grid-cell-inner-action-col x-action-col-icon",
                    iconCls: Taco.baseCSSPrefix + 'grid-row-action-trigger ' + Taco.baseCSSPrefix + 'grid-row-action-trigger-remove',
                    //tdCls: "remove-order-item-cell",
                    actionIconTpl: [
                        '<div roles="button" alt="{altText}" class="{cls}" {tooltip} ></div>'
                    ],
                    handler: function (grid, rowIndex, colIndex, header, e, record, item) {
                        // confirm the removal of the order item;
                        var order = me.record;
                        var confirm = Ext.create('Taco.core.ux.modal.Confirmation', {
                            text: 'Are you certain you want to delete this item?',
                            confirm: function() {
                                confirm.hide();
                                me.removeOrderItem({
                            jsonData: {
                                orderId: order.getId(),
                                        orderItemIds: [record.getId()]
                                }
                                });
                            },
                            autoShow: true
                        });
                    },
                    renderer: function (value, metaData, record) {
                        // if you need to message the data or dom cls. you can do it here;
                    }
                }
            ]
        });
        
        me.callParent(arguments);
    },
    
    showHasDraftToolbar: function () {
        var me = this;
        if (!this.hasDraftToolbar) {
            
            this.hasDraftToolbar = Ext.create('Ext.toolbar.Toolbar', {
                doc: "top",
                componentCls: "title-toolbar draft-toolbar",
                enableOverflow: false,
                weight: 1,
                items: [
                    {
                        xtype: "component",
                        html: "Warning: You have unsaved changes to this order detail",
                        cls: "title",
                        flex: 1
                    }, {
                        //xtype: "taco.button",
                        xtype: "button",
                        ui: "action",
                        scale:"medium",
                        text: "Discard Changes",
                        handler: function () {
                            me.removeDraftOrder();
                        },
                        scope: this
                    }, {
                        //xtype: "taco.button",
                        xtype: "button",
                        ui: "action",
                        scale: "medium",
                        text: "Edit Details",
                        style: "margin-left:5px;",
                        handler: function (button, e) {
                            var animationTarget = button.el;
                            me.editOrder(animationTarget);
                        },
                        scope: me
                    }
                ]
            });

            if (me.rendered) {
                this.addDocked(this.hasDraftToolbar);
            } else {
                this.dockedItems = [
                    this.hasDraftToolbar
                ];
            }
        }


    },
    
    onFieldEdit : function(editor, e) {
        var me = this;
        
        if (e.record && e.record.dirty) {
            me.editOrderItem(e.field, {
                data: [
                    e.record.getData()
                ]
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
            }
        );

        if (me.enableActionColumn) {
            columns.push(
                {
                    xtype: 'taco.menucolumn',
                    draggable: false,
                    text: '',
                    resizable:false,
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
    
    editOrder: function (animationTarget) {
        
        // to avoid duplication, bubble up the component hierarchy looking for 
        // Taco.view.order.subform.Detail and call editOrder there;
        
        var me = this;
        var ct = this.up('taco-orderdetail');
        if (ct) {
            ct.editOrder(animationTarget);
        }
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
                tb = me.getAddCouponToolbar();
                break;
            case "orderAdjustment":
                tb = me.getAddAdjustmentToolbar();
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

        this.activeSearchField = Ext.create('Taco.shared.view.field.ProductPickerField', {
            fieldCls: "toolbar-field",
            pageSize: me.productsPerPage,
            listeners: {
                'specialkey':{
                    fn: function(field, e) {
                        // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                        // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                        if (e.getKey() == e.ESC) {
                            
                            
                            //return false;
                        }
                    },
                    scope: me
                },     
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
                                            this.addConfiguredProduct([configurationData]);
                                        },
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
    
    // creates and returns a toolbar for adding coupons;
    getAddCouponToolbar: function (config) {
        var me = this,
            tbConfig;


        this.activeSearchField = Ext.create('Taco.view.order.widget.DiscountPickerField', {
            fieldCls: "toolbar-field",
            
            validOnDate : this.record.get("createDate"),
            
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Discounts',
                pageSize: me.discountsPerPage,
                autoLoad: true
            }),
            pageSize: me.discountsPerPage,
            listeners: {
                beforeselect: {
                    fn: function (combo, record, index, e) {                        

                        //var picker = combo.getPicker();
                        combo.collapse();
                        
                        // the product doesn't require configuration so just add it and skip opening the dialog;
                        this.addOrderCoupon([
                           record.get("couponCode")
                        ]);

                        // cancel the selection so that the same product can be reselected again;
                        return false;
                    },
                    scope: this
                }
            }
        });

        tbConfig = Ext.apply({
            toolbarType: "coupon",
            items: [
                {
                    xtype: 'component',
                    html: "Add Coupon",
                    style: "padding:0px 10px 0px 10px;"
                },
                this.activeSearchField
            ]
        }, config);

        return me.getAddItemToolbar(tbConfig);
    },
    
    // creates and returns a toolbar for adding adjustments;
    getAddAdjustmentToolbar: function (config) {
        var me = this,
            tbConfig,
            orderAdjustmentValue,
            shippingAdjustmentValue;

        orderAdjustmentValue = me.record.get("orderAdjustment").amount;
        shippingAdjustmentValue = me.record.get("shippingAdjustment").amount;

        //this.activeSearchField = Ext.create('Taco.core.ux.form.CurrencyField', {
        this.activeSearchField = Ext.create('Ext.form.field.Number', {
            label: "Order Adjustment",
            itemId: "orderAdjustmentField",
            width: 80,
            fieldCls: "toolbar-field",
            selectOnFocus: true,
            hideTrigger:true,
            decimalPrecision: 2,
            value: orderAdjustmentValue
        });

        tbConfig = Ext.apply({
            toolbarType: "orderAdjustment",
            items: [
                {
                    xtype: 'component',
                    html: "Order Adjustment",
                    style: "padding:0px 10px 0px 10px;"
                },
                this.activeSearchField,
                {
                    xtype: 'component',
                    html: "Shipping Adjustment",
                    style: "padding:0px 10px 0px 30px;"
                },
                {
                    xtype: "numberfield",
                    itemId: "shippingAdjustmentField",
                    width: 80,
                    style: "margin:0px 10px 0px 10px;top:0px;",
                    fieldCls: "toolbar-field",
                    selectOnFocus: true,
                    hideTrigger:true,
                    decimalPrecision: 2,
                    value: shippingAdjustmentValue
                },
                {
                    xtype: "button",
                    scale: "medium",
                    ui:"action",
                    text:"Apply",
                    itemId: "applyadjustmentField",
                    style: "margin:0px 20px 0px 10px;",
                    handler:function(button,e) {
                        
                        var orderAdjustmentField = button.up('toolbar').getComponent('orderAdjustmentField');
                        var shippingAdjustmentField = button.up('toolbar').getComponent('shippingAdjustmentField');
                        
                        // get the values from the fields and persist the adjustments;
                        me.updateOrderAdjustment({
                            data: {
                                orderAdjustment: {
                                    amount: orderAdjustmentField.getValue()
                                },
                                shippingAdjustment: {
                                    amount: shippingAdjustmentField.getValue()
                                }
                            }
                        })

                    },
                    scope:me
                },
                "->"
            
            ]
        }, config);

        return me.getAddItemToolbar(tbConfig);
    },
    
    getAddItemToolbar: function (config) {
        var tbConfig = Ext.apply({
            dock: "top",
            
            layout: {
                type: "hbox",
                align: "middle"
            },
            
            weight:2,
            cls: "additem-toolbar",
            //style: "border-color:#CCC;background-color:#f1f1f1;padding:5px;",
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
                xtype: "button",
                scale: "medium",
                ui:"action",
                style: "min-width:30px;margin-left:10px",
                handler: function(button, evt) {
                    var tb = button.up('toolbar');
                    // destroy all the child components
                    tb.removeAll(true);
                    // need to hide the toolbar before deleting it to avoid a bug in hbox layout 
                    
                    tb.hide();
                    
                    // remove the toolbar from its owner container and destroy it.
                    tb.ownerCt.removeDocked(tb, true);
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
    
    handleError : function() {
        
    },

    // accepts an array of order coupons configuration data objects and calls the service to persist it.
    addOrderCoupon: function (coupons) {
        var me = this;

        this.fireEvent('save');
        this.record.addOrderCoupon({
            jsonData: {
                orderId: this.record.get('id'),
                coupons: coupons
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', "Error adding coupon.", 'error');
                    return;
                }
                this.fireEvent('saveSuccess',json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error adding coupon.";
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });

    },
    
    // accepts an array of orderItem configuration data objects and calls the service to persist it.
    addConfiguredProduct: function (orderItems) {
        var me = this;
        
        me.fireEvent('save');
        me.record.addOrderItem({
            jsonData: {
                orderId: me.record.get('id'),
                orderItems: orderItems
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    me.fireEvent('saveFailure');
                    Taco.app.fireEvent('setmessage', "Error adding order item.", 'error');
                    return;
                }
                
                me.fireEvent('saveSuccess', json);
                // after a successful add, pass focus back to the searchfield;
                me.focusActiveSearchField();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error adding order item.";

                Taco.app.fireEvent('setmessage', msg, 'error');
                me.fireEvent('saveFailure');
            },
            scope: me
        });

    },
    
    // accepts an array of orderItem data objects and calls the service to persist it.
    editOrderItem: function (field, config) {
        var me = this,
            fieldsToMethod = {
                'quantity': 'editOrderItemQuantity',
                'unitPrice': 'editOrderItemPrice'
            },
            updateMethodName = fieldsToMethod[field],
            jsonData = {
                orderId: this.record.get('id'),
                orderItems: []
            };

//        

        if (!config.data) {
            return;
        }

        if (!updateMethodName) {
            return;
        }

        jsonData.orderItems = config.data;

        this.fireEvent('save');

        
        this.record[updateMethodName]({
            jsonData: jsonData,
            success: function (response) {
                // success handling here
                
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    this.fireEvent('saveFailure');

                    Taco.app.fireEvent('setmessage', "Error editing order item.", 'error');
                    return;
                }
                this.fireEvent('saveSuccess', json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error editing order item.";
                
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });

    },


    // accepts an array of orderItem configuration data objects and calls the service to persist it.
    updateOrderAdjustment: function (config) {
        var me = this,
            jsonData = {
                orderId: this.record.get('id'),
                orderAdjustment: this.record.get("orderAdjustment"),
                shippingAdjustment: this.record.get("shippingAdjustment")
            };
        
        if (!config.data) {
            return;
        }
        
        // override the json data with passed in data
        if (config.data.orderAdjustment) {
            Ext.apply(jsonData.orderAdjustment, config.data.orderAdjustment);
        }
    
        if (config.data.shippingAdjustment) {
            Ext.apply(jsonData.shippingAdjustment, config.data.shippingAdjustment);
        }
        
        this.fireEvent('save');
        
        this.record.updateOrderAdjustment({
            jsonData: jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    this.fireEvent('saveFailure');
                    Taco.app.fireEvent('setmessage', "Error adding adjustments", 'error');
                    return;
                }
                me.removeDocked(me.activeAddToolbar, true);
                this.fireEvent('saveSuccess', json);
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error adding adjustments.";
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });

    },
    
    removeOrderItem: function (config) {
        var me = this;

        this.fireEvent('save');

        this.record.removeOrderItem({
            jsonData: config.jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', "Error deleting order item", 'error');
                    this.fireEvent('saveFailure');
                    return;
                }
                me.fireEvent("saveSuccess",json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error deleting order item";

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    

    cancelOrder: function () {
        var me = this;
        




        Ext.MessageBox.show({
            title: 'Cancel Order',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: 'Are you sure you want to cancel this order?',
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (rec) {
                if (rec === 'yes') {
                    me.ownerCt.setLoading({
                        maskCls: "x-mask taco-white-mask"
                    });

                    me.record.cancelOrder({
                        jsonData: {
                            orderId: me.record.get('id')
                        },
                        success: function (response) {
                            // success handling here
                            var json = Ext.decode(response.responseText, true);
                            if (!json || !json.success) {
                                Taco.app.fireEvent('setmessage', "Error canceling order", 'error');
                                me.fireEvent('saveFailure');
                                return;
                            }
                            me.ownerCt.setLoading(false);
                            me.fireEvent("orderCancelled", json);
                            
                        },
                        failure: function (response) {
                            me.setLoading(false);
                            // error handling here
                            var json = Ext.decode(response.responseText, true),
                                msg = (json && json.Message) ? json.Message : "Error canceling order";
                            Taco.app.fireEvent('setmessage', msg, 'error');
                            me.ownerCt.setLoading(false);
                            me.fireEvent('saveFailure');
                        },
                        scope: me
                    });



                }
            }
        });




    },
    
    suppressDiscount: function (config) {
        var me = this;
        config.jsonData.orderId = me.record.get('id'),

        me.fireEvent('save');

        me.record.suppressDiscount({
            jsonData: config.jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.fireEvent('setmessage', "Error suppressing order item discount", 'error');
                    this.fireEvent('saveFailure');
                    return;
                }
                
                me.fireEvent("saveSuccess",json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error suppressing order item discount";

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    
    activateDiscount: function (config) {
        var me = this;
        config.jsonData.orderId = me.record.get('id'),

        me.fireEvent('save');

        me.record.activateDiscount({
            jsonData: config.jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.fireEvent('setmessage', "Error activating order item discount", 'error');
                    this.fireEvent('saveFailure');
                    return;
                }
                me.fireEvent("saveSuccess",json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error activating order item discount";

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    

    removeDraftOrder: function () {
        var me = this;
        this.fireEvent('save');
        
        this.record.removeDraftOrder({
            jsonData: {
                orderId: this.record.get("id")
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.fireEvent('setmessage', "Error cancelling changes", 'error');
                    
                    this.fireEvent('saveFailure');
                    return;
                }
                me.fireEvent("draftOrderRemoved");
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error cancelling changes";

                Taco.app.fireEvent('setmessage', msg, 'error');
                
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    
    saveDraftOrder: function () {
        var me = this;
        
        this.fireEvent('save');
        
        this.record.saveDraftOrder({
            jsonData: {
                orderId: this.record.get("id")
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    this.fireEvent('saveFailure');
                    Taco.app.fireEvent('setmessage', "Error saving changes", 'error');
                    return;
                }
                
                me.fireEvent("draftOrderSaved",json);
            },
            failure: function(response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error saving changes";
                Taco.app.fireEvent('setmessage', msg, 'error');
                
                this.fireEvent('saveFailure');
                
            },
            scope: this
        });
    }
});
