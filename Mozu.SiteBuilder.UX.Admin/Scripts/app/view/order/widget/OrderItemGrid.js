/**
 * @class Taco.view.order.widget.OrderItemGrid
 * This is both the readonly and editable version of the order details grid.
 * It will be displayed in readOnly mode on the order details subForm and in editable mode in the EditOrderDetail.js Modal;
 *
 */
Ext.define('Taco.view.order.widget.OrderItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Taco.view.order.widget.AddOrderItemToolbar',
        'Ext.MessageBox',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.order.widget.DiscountPickerField',
        'Taco.view.order.widget.DiscountRowBody',
        'Taco.view.order.widget.FulfillmentPickerField',        
        'Taco.core.ux.grid.ActionColumn',
        'Taco.view.order.modal.FulfillmentMethod'
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
        actionColumnWidth: 30,
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function(eOpts) {
        var me = this,
            siteContext,
            editModeCls = (this.getEditMode()) ? ' order-editable ' : '';


        // attribute names need to be looked up for each order item that contains an option. :(
        this.attributeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Attributes');

        // set tabIndex on the grid so that it can be tabbed too;
        if (this.getEditMode()) {
            this.autoEl = {
                tabIndex: 0
            }
        }

        this.dockedItems = [];

        this.addEvents('save','saveFailure','saveSuccess');
        
        me.cls = [this.cls,'focus-grid', editModeCls, Taco.baseCSSPrefix + 'orderform-orderitemgrid'].join(' ');

        me.bodyCls = Taco.baseCSSPrefix + 'orderform-orderitemgrid-body';
        
        siteContext = Taco.app.context.getCurrent().urlToken;

            
            
        // if the grid is editable show the edit toolbar;
        if (this.getEditMode()) {
            // listen for changes to the amount and quantity fields and persist them
            me.mon(me,'edit', me.onFieldEdit, me);
        } else {
            // if there is a draft version of this order we need to show a warning toolbar
            if (this.record.get('hasDraft')) {
                me.showHasDraftToolbar();
            }
        };

        this.mon(this,'beforeedit', function (editorPlugin, e, eOpts) {
            // disable editing when the grid is not editMode:true
            if (!this.editMode) {
                return false;
            }
            var editor = e.column.getEditor(),
                record = e.record;
        
            if (editor.$className == 'Taco.view.order.widget.FulfillmentPickerField') {

                
                // prevent the user from editing the fulfillment method of an electronic download since we don't support that yet.
                if (record.data.fulfillmentMethod == 'Digital') {
                    return false;
                }

                // neeed to set the productCode on the fulfillmentCombo editor so that the store can use it in its filter when opened;
                var productCode = record.get('productCode'),
                    parentProductCode = record.get('parentProductCode'),
                    fulfillmentConfig;

                // if we have a parentProductCode, that means our productCode is really the code for the product varient; need to remamp these so that the service is happy.
                if (parentProductCode) {
                    fulfillmentConfig = {
                        productCode: parentProductCode,
                        variationProductCode: productCode
                    }
                } else {
                    fulfillmentConfig = {
                        productCode: productCode,
                        variationProductCode: null
                    }
                }

                //editor.setProductCode(productCode);
                editor.setProductConfig(fulfillmentConfig);
            }
   
            return true;
        }, this);
        
        if (this.getEditMode()) {
            // this is the combo box that shows in the fullment column when the user clicks in the grid
            me.fulfillmentFieldComboEditor = Ext.widget({
                xtype: 'taco-fulfillmentpickerfield',
                showBorder: (this.getEditMode()),
                allowBlank: false,
                typeAhead: false,
                autoSelectFirstRecord: false,
                msgTarget: 'qtip',
                listeners: {
                    render: function (combo) {
                        var me = this;
                        // attach a listener to the ownerCt which is the Ext.grid.CellEditor class. This will let me fix an issue where the value in the combo is getting set to the display tpl text of the column.
                        // will also allow me to auto load the combo store and expande the menu;                        
                        var editor = combo.ownerCt;
                        me.mon(editor, 'beforestartedit', function (cellEditor, el, value, eOpts) {
        
                            // reset the value for the field to empty text so that we get the full set of location options but still allow the user to type in search terms. This is the primary reason why I had to use the beforestartedit with canceled return; Criminy!
                            value = '';
                            
                            // BEGIN COPIED CODE: from Ext.Editor.startEdit();
                            // need to return false to cancel the edit and then do what the original method did but with the value reset to '', store loaded, and menu expanded;
                            cellEditor.startValue = value;
                            cellEditor.show();                                
                            var field = cellEditor.field;
                            // temporarily suspend events on field to prevent the 'change' event from firing when reset() and setValue() are called
                            field.suspendEvents();
                            field.reset();
                            field.setValue(value);
                            field.resumeEvents();
                            cellEditor.realign(true);
                            field.focus([field.getRawValue().length]);
                            if (field.autoSize) {
                                field.autoSize();
                            }
                            cellEditor.editing = true;
                            // end code copied from the Ext.Ediitor class

                            // expand first so that the loading mask appears inside the expanded menu;
                            field.expand();
                            field.store.load();                            

                            // cancel the default editor snerst since I am doing it here;
                            return false;
                        }, me)
                    },
                    select: this.onFulfillmentChange,
                    scope: me
                }
            })
        }


        Ext.apply(this, {
            features: [
                {
                    ftype: 'discountrowbody'
                }, {
                    ftype: 'rowwrap'
                }
            ],

            viewConfig: {
                cls: (this.getEditMode()) ? 'editmode-enabled' : '',
                trackOver: (this.getEditMode()),
                // changing the hover class to get rid of taco overrides of grid
                //overItemCls: 'taco-orderItem-grid-row-over',

                emptyText: '<div class="empty-grid-message">No order items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false, // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disableSelection: (!this.getEditMode()),
                listeners: {
                    beforecellmousedown: function(view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        //prevent the column from being selected unless its an editor column
                        return me.columns[cellIndex].hasEditor();
                    }
                },
                // provides selective row class addition based on record.
                getRowClass: function(record) {
                    if (!record) return '';
                    if (record.get('discount')) {
                        return 'taco-order-orderItem-hasDiscount';
                    }
                    return '';
                }
            },

            selModel: Ext.create('Ext.selection.CellModel', {
                enableFieldTabbing: true,
                // this disables support for tabbing into the grid when not editable;
                enableKeyNav: (this.getEditMode()) ? true : false
            }),

            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    pluginId: 'cellEditing',
                    clicksToEdit: 1
                })
            ],

            columns: [
                {
                    text: 'Line',
                    draggable: false,
                    resizable: true,
                    width: 50,
                    sortable: false,
                    menuDisabled: true,
                    hidden: false,
                    align: 'center'
                    //dataIndex: ''
                },
                {
                    text: 'Code',
                    draggable: false,
                    resizable: true,
                    width: 140,
                    sortable: false,
                    menuDisabled: true,
                    hidden:false,
                    align: 'left',                                        
                    dataIndex: 'productCode'
                },
                {
                    text: 'Products',
                    draggable: false,
                    minWidth:80,
                    xtype: 'templatecolumn',
                    flex: 1,
                    //tdCls:'taco-product-column',
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
                                '<span class="option"><tpl if="xindex &gt; 1">, </tpl>{[this.getAttributeName(values)]}',
                                ': {value}',
                            '</span>',
                            '</tpl>',
                            '<tpl for="bundledProducts">',
                                '<div class="bundledProduct">',
                                    '{productCode} - {name} (Qty. {quantity})',
                                '</div>',
                            '</tpl>',
                    
                            /*
                            '<div>',
                                // if order item supports instore pickup and user is currently editing the order. make the fulfillment method a link;
                                '<tpl if="this.isEditable() && supportsInStorePickup">',
                                    'Fulfillment Method: <a class="fulfillment-link" href="#" fulfillmentMethod="{fulfillmentMethod}">{[this.getFulfillmentMethodText(values)]}</a>',
                                '<tpl else>',
                                    'Fulfillment Method: {[this.getFulfillmentMethodText(values)]}',
                                '</tpl>',
                            '</div>',
                            */

                        '</div>',
                        {
                            getAttributeName: function (val) {
                                var rec = me.attributeStore.getById(val.attributeFQN)
                                return (rec) ? rec.get('name') :  ''
                            }
                        }
                        /*,
                        {
                            getFulfillmentMethodText: function (record) {                            
                                var fulfillmentMethod = record.fulfillmentMethod;
                                var fulfillmentLocation = ' (' + record.fulfillmentLocationCode + ')';
                                if (fulfillmentMethod == 'Ship') {
                                    return 'Direct Ship' + fulfillmentLocation;
                                } else {
                                    return 'In Store Pickup' + fulfillmentLocation;                                
                                }
                            },
                            isEditable: function (values) {
                                return me.getEditMode();
                            }
                        }
                        */

                        ),
                        dataIndex: 'productName',
                        listeners: {
                            click: {
                                fn: function (view, cell, cellIndex, rowIndex, e, record, row, eOpt) {

                                
                                    var editMode = view.ownerCt.editMode,
                                        fulfillmentMethod = e.target.getAttribute('fulfillmentMethod'),
                                        orderRecord = me.record

                                

                                    // if user clicks the fulfillment method link. open the fulfillment Method Selector;
                                    if (editMode && fulfillmentMethod) {
                                        me.editFulfillmentMethod(record,orderRecord);
                                    }

                                    if (!editMode || e.target.tagName != 'A') {
                                        return;
                                    }
                                
                                    //temporarily disabling while we add service support for updating the options and extras.
                                    return;

                                    // prevent the default link behavior
                                    e.preventDefault();
                                
                                    var productCode = record.get('productCode'),
                                    isConfigurable = record.get('isConfigurable');

                                    // determine if we need to show the configurator
                                    //if (isConfigurable) {
                                
                                        var win = Ext.create('Taco.view.order.modal.ProductConfigurator', {
                                            productCode: productCode,
                                            configuredProduct: record,
                                            listeners: {
                                        'savesuccess': {
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
                    text: 'Status',
                    draggable: false,
                    resizable: true,
                    width: 120,
                    sortable: false,
                    menuDisabled: true,
                    hidden: false,
                    align: 'left'
                    //dataIndex: ''
                },
                {
                    text: 'Fulfillment',
                    editorId: 'fulfillmentColumn',
                    xtype: 'templatecolumn',
                    dataIndex: 'fulfillmentId',
                    draggable: false,
                    resizable: true,
                    //flex:1,
                    width:180,
                    sortable: false,
                    menuDisabled: true,
                    align: 'left',
                    tpl: [
                        '{fulfillmentMethod}',
                        '<tpl if="values.fulfillmentMethod == \'Digital\'">',
                        ' (Download)',
                        '<tpl else>',
                            ' ({fulfillmentLocationCode})',
                        '</tpl>'
                    ],
                    editor : (this.getEditMode()) ? me.fulfillmentFieldComboEditor : null
                }, {
                    text: 'Price',
                    draggable: false,
                    resizable: false,
                    width: 80,
                    sortable: false,
                    menuDisabled: true,
                    align: 'right',
                    renderer: function (value) {
                        return me.record.formatCurrency(value);
                    },
                    editor: (this.getEditMode()) ? {
                        xtype: 'numberfield',
                        showBorder:(this.getEditMode()),
                        forcePrecision: true,
                        selectOnFocus:true,
                        hideTrigger: true,
                        fieldStyle: 'text-align:right;padding-right:4px;',
                        mouseWheelEnabled: false,
                        
                        //unitString: '$',
                        //unitAtEnd: false,
                        allowBlank: true,
                        minValue: 0,
                        maxValue: 100000
                    } : null,
                    dataIndex: 'unitPrice'
                }, {
                    text: 'Quantity',
                    draggable: false,
                    resizable: false,
                    width: 80,
                    sortable: false,
                    menuDisabled: true,
                    align: 'right',
                    editor: {
                        xtype: 'numberfield',
                        showBorder: (this.getEditMode()),
                        fieldStyle: 'text-align:right;',
                        selectOnFocus: true,
                        allowBlank: true,
                        hideTrigger:true,
                        minValue: 1,
                        maxValue: 100000
                    },
                    dataIndex: 'quantity'
                },
                {
                    text: 'Row Total',
                    width:80,
                    draggable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: this.getRowTotalColumnWidth(),
                    sortable: false,
                    align: 'right',
                    
                    renderer: function (value) {
                        return me.record.formatCurrency(value);
                    },
                    dataIndex: 'displaySubtotal'
                },
                {
                    //xtype: 'taco.menucolumn',
                    //xtype:'templatecolumn',
                    xtype: 'taco.actioncolumn',
                    
                    disabled:(!this.getEditMode()),
                    draggable: false,
                    resizable: false,
                    menuDisabled: true,
                    text: '',
                    width: this.actionColumnWidth,
                    // note: 'x-action-col-icon' is required for the action column to call the handler;
                    //innerCls: 'x-grid-cell-inner-action-col x-action-col-icon',
                    iconCls: Taco.baseCSSPrefix + 'grid-row-action-trigger ' + Taco.baseCSSPrefix + 'grid-row-action-trigger-remove',
                    //tdCls: 'remove-order-item-cell',
                    actionIconTpl: [
                        '<div roles="button" alt="{altText}" class="{cls}" {tooltip} ></div>'
                    ],
                    handler: function (grid, rowIndex, colIndex, header, e, record, item) {
                        // confirm the removal of the order item;
                        var order = me.record;
                        

                        Ext.MessageBox.show({
                            title: 'Delete Item',
                            // pushes the buttons to the right to be consistant with our dialog ux.
                            rightJustifyButtons: true,
                            // reverses the order of the buttons
                            reverseOrder: true,
                            msg: 'Are you certain you want to delete this item?',
                            closable: false,
                            buttons: Ext.Msg.YESNO,
                            fn: function (val) {
                                if (val === 'yes') {
                                    
                                    me.removeOrderItem({
                                        jsonData: {
                                            orderId: order.getId(),
                                            orderItemIds: [record.getId()]
                                        }
                                    });
                                    
                                }
                            }
                        });


                    },
                    renderer: function (value, metaData, record) {
                        // if you need to message the data or dom cls. you can do it here;
                    }
                }
            ]
        });
        


        this.initAddProductToolbar();

        me.callParent(arguments);

        if (this.getEditMode()) {

            


            // pass focus to the add product field; 
            if (this.addProductToolbar) {
                me.mon(me, 'boxready', function () {

                    // need to listen for focus on the grid el.
                    me.mon(me.el, 'focus', function () {
                        if (me.store.getCount()) {
                            me.focusGridTop()
                        } else {
                            // no grid items to focus. pass focus to the productPickerField;
                            this.addProductToolbar.productPickerField.focus(null, 10);
                        }
                    }, this)


                    this.addProductToolbar.productPickerField.focus(null, 10);
                }, this)
            }

            // listening for a custom event added to the cellSelectionModel via override; this is a cancellable event; retun false to prevent the key navigation to get processed by the grid;
            me.mon(this.view, 'beforecellkeymove', function (view, pos, newPos, dir, e) {                
                var me = this,
                    rowCount = me.store.getCount(),
                    cellCount = me.columns.length,
                    cellIndex = pos.column,
                    rowIndex = pos.row;

                //console.log(dir);

                // user clicks down arrow while in last row or user hits tab key when in last cell on last row
                if ((rowIndex == rowCount - 1 && dir == 'down') || (rowIndex == rowCount - 1 && cellIndex == cellCount - 1 && dir == 'right')) {
                    // need to manually deselect the last selected grid cell to work around a bug in extjs;
                    me.view.onCellDeselect({
                        column: cellIndex,
                        row: rowIndex
                    });
                    
                    me.view.getSelectionModel().deselectAll();

                    //set focus on product picker field
                    this.addProductToolbar.productPickerField.focus(null, 100);
                    return false;
                } else {
                    return true;
                }
            }, me)




            

            /*
                // this code should work but doesn't due to two bugs in Extjs related to keyEvents for grid.view;
                bug 1. beforeKey events don't fire before the grid navigates to next cell;
                bug 2. rowIndex is incorrect in the arguments that are passed when the events fire; this is working in the 4.2.3 nightly but not working in the 4.2.2 release;
                Keep this code around so we can use it when the bugs are fixed and my override can be removed;
                See 'beforecellkeymove' which is a custom event that I added to the CellModel override to fix both issues above;

                this.mon(this.view, 'beforecellkeydown', function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    var me = this,
                        rowCount = me.store.getCount(),
                        cellCount = me.columns.length;

                    // user clicks down arrow while in last row or user hits tab key when in last cell on last row
                    if ((rowIndex == rowCount - 1 && e.getKey() == e.DOWN) || (rowIndex == rowCount - 1 && cellIndex == cellCount -1 &&  e.getKey() == e.TAB)) {
                        // need to manually deselect the last selected grid cell to work around a bug in extjs;
                        me.view.onCellDeselect({
                            column: cellIndex,
                            row: rowIndex
                        });
                        me.view.getSelectionModel().deselectAll();
                        //set focus on product picker field
                        this.addProductToolbar.productPickerField.focus(null, 100);
                    }

                }, this);            
            */



                        }
    },



    // User selects a different location and or fulfillment method; Persistance call;
    onFulfillmentChange: function (combo, records, eOpts) {
        if (!records.length) {
            return
                        }
        var me = this,
            comboRecord = records[0],
            editor = combo.ownerCt,
            gridRecord = this.getSelectionModel().getSelection()[0],
            plugin = me.getPlugin('cellEditing'),
            fulfillmentMethod = comboRecord.get('fulfillmentMethod'),
            fulfillmentLocationCode = comboRecord.get('locationCode'),
            orderId = me.record.get('id'),
            data= Ext.clone(gridRecord.data);

        
        var mask = me.setLoading({
            msg: 'Saving'
        }, me.body);
        
            

        /*
        gridRecord.set('fulfillmentMethod', fulfillmentMethod);
        gridRecord.set('fulfillmentLocationCode', fulfillmentLocationCode);
        gridRecord.set('fulfillmentId', fulfillmentMethod + '(' + fulfillmentLocationCode + ')');
        */
        
        Ext.apply(data, {
            fulfillmentMethod: fulfillmentMethod,
            fulfillmentLocationCode : fulfillmentLocationCode,
            fulfillmentId: fulfillmentMethod + '(' + fulfillmentLocationCode + ')'
        })

        plugin.completeEdit();
        gridRecord.set('fulfillmentMethod', fulfillmentMethod);
        gridRecord.set('fulfillmentLocationCode', fulfillmentLocationCode);
        gridRecord.set('fulfillmentId', fulfillmentMethod + '(' + fulfillmentLocationCode + ')');


        me.record.editOrderItemFulfillmentMethod({
            jsonData: {
                orderId: orderId,
                orderItems: [
                    data
                ]
                    },
            failure: function (response) {
                me.setLoading(false, me.body);
                gridRecord.reject();

            },
            success: function (response) {
                

                //gridRecord.commit();
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly                    
                    gridRecord.reject();
                    me.setLoading(false, me.body);
                            return;
                }
                gridRecord.commit();
                me.setLoading(false, me.body);
                //need to fire this event to get the record to reload
                me.fireEvent('saveSuccess', json);
            },
            scope: this
        });
    },


    initAddProductToolbar: function () {
        var me = this;

        if (!this.getEditMode()) {
            return
                }






        // todo: syncronize the width of columns that are resized
        this.mon(this, 'columnresize', function (columnHeader, column, width, eOpts) {
            // need to synchronize the width of the columns and the addProductToolbar fields when user resizes the columns                
            var columnIndex = columnHeader.columnManager.columns.indexOf(column);
            var cell = this.addProductToolbar.items.items[columnIndex]
            cell.setWidth(width);
        },this)








        
        this.addProductToolbar = Ext.create('Taco.view.order.widget.AddOrderItemToolbar', {
            grid : this,
            listeners: {
                save: {
                    fn: function (toolbar, configuredProduct) {                        
                        me.addConfiguredProduct([
                            configuredProduct
                        ])
                    },
                    scope:me
                    },
                focus: {
                    fn: me.onGridBlur,
                    scope: me
                }
            }
        });

        // when user keys up arrow pass focus back to grid;
        this.mon(this.addProductToolbar, 'gridfocus', function (field, e) {
            var me = this,
                cellIndex,
                lastCellIndex = me.columns.length - 1,
                lastRow = me.store.getCount() - 1,
                rowIndex;
            
            // no grid data;
            if (lastRow == -1) {
                // nothing to pass focus to in the grid, so we need to pass focus back to the field
                this.addProductToolbar.productPickerField.focus(null, 10);
                return;
            }

            // shift tab go to first cell in grid;
            if (e.getKey() == e.TAB && e.shiftKey) {
                // set the cell index to the last cell;
                cellIndex = 0;
                rowIndex = 0;
            } else if (e.getKey() == e.UP) {
                cellIndex = 1;
                rowIndex = lastRow
            } else {
                return
            }
            
            // this line is required for extjs 4.2.2; not neaded for extjs 4.3 nightly;
            me.getSelectionModel().setCurrentPosition({ row: rowIndex, column: cellIndex });
            me.view.focusRow(rowIndex);
            
        },this);

        this.dockedItems.push(this.addProductToolbar);
            },            
    focusGridTop:function (){
        var me = this;

        if (me.store.getCount()) {
            me.getSelectionModel().setCurrentPosition({ row: 0, column: 0 });
            me.view.focusRow(0);
                }
    },

    // manually deselects visually the current selection of the grid;
    onGridBlur: function (){
        //blur the grid
        var selModel = this.getSelectionModel()
        if (selModel.getSelection().length) {
            // need to manually visually deselect the last cell due to extjs bug that leaves the css class on the sell when deselected;
            var pos = selModel.getCurrentPosition();
            this.view.onCellDeselect(pos);
            selModel.deselectAll();
        }
    },

    onRowEditorCreate: function () {
        //this.rowEditor.cancelEdit();

        // check with the rowEditor to see if creation is allowed;
        
        
        // Create a model instance
        var modelName = this.store.model.getName();
        var r = Ext.create(modelName, {});
        this.store.insert(0, r);
        //this.rowEditor.startEdit(0, 0);
        //this.rowEditor.editor.focusContextCell()


    },
    
    showHasDraftToolbar: function () {
        var me = this;
        if (!this.hasDraftToolbar) {
            
            this.hasDraftToolbar = Ext.create('Ext.toolbar.Toolbar', {
                doc: 'top',
                componentCls: 'title-toolbar draft-toolbar',
                enableOverflow: false,
                weight: 1,
                items: [
                    {
                        xtype: 'component',
                        html: 'Warning: You have draft changes to this order detail',
                        cls: 'title',
                        flex: 1
                    }, {
                        //xtype: 'taco.button',
                        xtype: 'button',
                        ui: 'action',
                        scale:'medium',
                        text: 'Discard Changes',
                        handler: function () {
                            me.removeDraftOrder();
                        },
                        scope: this
                    }, {
                        //xtype: 'taco.button',
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Continue Editing',
                        style: 'margin-left:5px;',
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
        
        //e.record.commit();

        // don't need to persist changes to this field as they are handled by the select of the combo;
        if (e.field == 'fulfillmentId') {            
            return;
        }

        // persist the changes to the price and quantity field;
        if (e.record && e.record.dirty) {
            me.editOrderItem(e, {
                data: [
                    e.record.getData()
                ]
            });
            }
    },
    
    // after the grid reloads its data, the selection will be lost. this method restores a position if one is passed in;
    restoreSelection: function (position) {
        var me = this,
            rowIndex,
            cellIndex,
            count= me.store.getCount();
            
        // if no position the grid didn't have a selection; could be the add item toolbar or the total panel fields;
        if (position) {
            rowIndex = position.row
            cellIndex = position.column
            // check to make sure the row is still there. It could have been deleted; 
            if (count == 0) {
                this.addProductToolbar.productPickerField.focus(null, 10);
                return;
            } else if (count == rowIndex) {
                //deleted the last row need to select the row above it;
                rowIndex--
            }
                    
            me.getSelectionModel().setCurrentPosition({ row: rowIndex, column: cellIndex });
            me.view.focusRow(rowIndex);
            }
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
                    Taco.app.fireEvent('setmessage', 'Error adding coupon.', 'error');
                    return;
                }
                this.fireEvent('saveSuccess',json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error adding coupon.';
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

        me.addInProgress = true;

        me.record.addOrderItem({
            jsonData: {
                orderId: me.record.get('id'),
                orderItems: orderItems
            },
            success: function (response) {
                // success handling here
                me.addInProgress = false;
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    me.fireEvent('saveFailure');
                    
                    Taco.app.fireEvent('setmessage', 'Error adding order item.', 'error');
                    return;
                }
                
                this.addProductToolbar.reset();

                me.fireEvent('saveSuccess', json);

                // after a successful add, pass focus back to the searchfield;
                //me.focusActiveSearchField();
            },
            failure: function (response) {
                // error handling here
                me.addInProgress = false;
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error adding order item.';

                Taco.app.fireEvent('setmessage', msg, 'error');
                me.fireEvent('saveFailure');
            },
            scope: me
        });

    },
    
    // accepts an array of orderItem data objects and calls the service to persist it.
    editOrderItem: function (e, config) {
        var me = this,
            field = e.field,
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
                    Taco.app.fireEvent('setmessage', 'Error editing order item.', 'error');
                    // reset the value to its default
                    var evt = e;
                    e.record.set(e.field, e.record.raw[e.field]);

                    return;
                }
                this.fireEvent('saveSuccess', json);
                
                // need to deselect the cell so it can be reselected and focused. shoot me now.
                //me.focusGridTop()

                //selModel.setCurrentPosition(pos);
                //selModel.select(selected);
                //me.view.focusRow(pos);
                
                //me.view.focusCell(pos,100);

                //me.getSelectionModel().setCurrentPosition({ row: rowIndex, column: cellIndex });
                //me.view.focusRow(rowIndex);


            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error editing order item.';                
                // reset the value to its default
                var evt = e;
                e.record.set(e.field, e.record.raw[e.field]);

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });

    },


    // deprecated and moved to the orderTotalEditable Panel;
    // accepts an array of orderItem configuration data objects and calls the service to persist it.
    //updateOrderAdjustment: function (config) {

    //    var me = this,
    //        jsonData = {
    //            orderId: this.record.get('id'),
    //            orderAdjustment: Ext.clone(this.record.get('orderAdjustment')),
    //            shippingAdjustment: Ext.clone(this.record.get('shippingAdjustment'))
    //        };
        
    //    if (!config.data) {
    //        return;
    //    }
        
    //    // override the json data with passed in data
    //    if (config.data.orderAdjustment) {
    //        Ext.apply(jsonData.orderAdjustment, config.data.orderAdjustment);
    //    }
    
    //    if (config.data.shippingAdjustment) {
    //        Ext.apply(jsonData.shippingAdjustment, config.data.shippingAdjustment);
    //    }
        
    //    this.fireEvent('save');
        
    //    this.record.updateOrderAdjustment({
    //        jsonData: jsonData,
    //        success: function (response) {
    //            // success handling here
    //            var json = Ext.decode(response.responseText, true);
    //            if (!json || !json.success) {
    //                this.fireEvent('saveFailure');
    //                Taco.app.fireEvent('setmessage', 'Error adding adjustments', 'error');
    //                return;
    //            }
    //            me.removeDocked(me.activeAddToolbar, true);
    //            this.fireEvent('saveSuccess', json);
    //        },
    //        failure: function (response) {
    //            var json = Ext.decode(response.responseText, true),
    //                msg = (json && json.message) ? json.message : 'Error adding adjustments.';
    //            Taco.app.fireEvent('setmessage', msg, 'error');
    //            this.fireEvent('saveFailure');
    //        },
    //        scope: this
    //    });

    //},
    
    removeOrderItem: function (config) {
        var me = this;

        this.fireEvent('save');

        this.record.removeOrderItem({
            jsonData: config.jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', 'Error deleting order item', 'error');
                    this.fireEvent('saveFailure');
                    return;
                }
                me.fireEvent('saveSuccess',json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error deleting order item';

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    

    acceptOrder: function () {
        var me = this;

        me.ownerCt.setLoading({
            maskCls: 'x-mask taco-white-mask'
        });

        me.record.acceptOrder({
            jsonData: {
                orderId: me.record.get('id')
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', 'Error accepting order', 'error');
                    me.fireEvent('saveFailure');
                    return;
                }
                me.ownerCt.setLoading(false);
                me.fireEvent('orderAccepted', json);
            },
            failure: function (response) {
                me.setLoading(false);
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error accepting order';
                Taco.app.fireEvent('setmessage', msg, 'error');
                me.ownerCt.setLoading(false);
                me.fireEvent('saveFailure');
            },
            scope: me
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
                        maskCls: 'x-mask taco-white-mask'
                    });

                    me.record.cancelOrder({
                        jsonData: {
                            orderId: me.record.get('id')
                        },
                        success: function (response) {
                            // success handling here
                            var json = Ext.decode(response.responseText, true);
                            if (!json || !json.success) {
                                Taco.app.fireEvent('setmessage', 'Error canceling order', 'error');
                                me.fireEvent('saveFailure');
                                return;
                            }
                            me.ownerCt.setLoading(false);
                            me.fireEvent('orderCancelled', json);
                            
                        },
                        failure: function (response) {
                            me.setLoading(false);
                            // error handling here
                            var json = Ext.decode(response.responseText, true),
                                msg = (json && json.message) ? json.message : 'Error canceling order';
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
                    Taco.app.fireEvent('setmessage', 'Error suppressing order item discount', 'error');
                    this.fireEvent('saveFailure');
                    return;
                }
                
                me.fireEvent('saveSuccess',json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error suppressing order item discount';

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
                    Taco.app.fireEvent('setmessage', 'Error activating order item discount', 'error');
                    this.fireEvent('saveFailure');
                    return;
                }
                me.fireEvent('saveSuccess',json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error activating order item discount';

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    
    /**
    * Deletes the draft order;
    */
    removeDraftOrder: function () {
        var me = this;
        this.fireEvent('save');
        
        this.record.removeDraftOrder({
            jsonData: {
                orderId: this.record.get('id')
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.fireEvent('setmessage', 'Error cancelling changes', 'error');
                    
                    this.fireEvent('saveFailure');
                    return;
                }
                me.fireEvent('draftOrderRemoved');
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error cancelling changes';

                Taco.app.fireEvent('setmessage', msg, 'error');
                
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },
    

    /**
    * Overwrites the original order with the draft order;
    */
    saveDraftOrder: function () {
        var me = this;
        
        this.fireEvent('save');
        
        this.record.saveDraftOrder({
            jsonData: {
                orderId: this.record.get('id')
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    this.fireEvent('saveFailure');
                    Taco.app.fireEvent('setmessage', 'Error saving changes', 'error');
                    return;
                }
                
                me.fireEvent('draftOrderSaved',json);
            },
            failure: function(response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error saving changes';
                Taco.app.fireEvent('setmessage', msg, 'error');
                
                this.fireEvent('saveFailure');
                
            },
            scope: this
        });
    },
    

    editFulfillmentMethod: function(orderItemRecord, orderRecord) {
        var me = this,
            editor;
        
        editor = Ext.create('Taco.view.order.modal.FulfillmentMethod', {
            record: orderItemRecord,
            orderRecord: orderRecord,
            listeners: {
                savsuccess: {
                    fn: function(view, data) {
                        

                    },
                    scope:me
                }
            }
        });
}
});
