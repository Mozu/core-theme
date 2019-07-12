
Ext.define('Taco.view.order.widget.ShippingPackagesGrid', {
    extend: 'Ext.grid.Panel', 
    requires: ['Ext.grid.CellEditor',
        'Ext.util.DelayedTask',
    'Ext.form.RadioManager'],

    title: '',

    viewConfig: {
        deferEmptyText: false,
        emptyText: "No items available",
    },

    selType: 'cellmodel',
   
    plugins: [],
    
    cls:'shipping-packages-grid',

    allSelected: false,

    initEvents: function () {
        var me = this;
        me.initEditTriggers();
    },
    initEditTriggers: function () {
        var me = this,
            view = me.view;

        // Listen for the edit trigger event.
        if (me.triggerEvent == 'cellfocus') {
            me.mon(view, 'cellfocus', me.onCellFocus, me);
        } else if (me.triggerEvent == 'rowfocus') {
            me.mon(view, 'rowfocus', me.onRowFocus, me);
        } else {

            // Prevent the View from processing when the SelectionModel focuses.
            // This is because the SelectionModel processes the mousedown event, and
            // focusing causes a scroll which means that the subsequent mouseup might
            // take place at a different document XY position, and will therefore
            // not trigger a click.
            // This Editor must call the View's focusCell method directly when we recieve a request to edit
            if (view.getSelectionModel().isCellModel) {
                view.onCellFocus = Ext.Function.bind(me.beforeViewCellFocus, me);
            }

            // Listen for whichever click event we are configured to use
            me.mon(view, me.triggerEvent || ('cell' + (me.clicksToEdit === 1 ? 'click' : 'dblclick')), me.onCellClick, me);
        }

        // add/remove header event listeners need to be added immediately because
        // columns can be added/removed before render
        //me.initAddRemoveHeaderEvents()
        // wait until render to initialize keynav events since they are attached to an element
        //view.on('render', me.initKeyNavHeaderEvents, me, { single: true });
    },
    
    initComponent: function () {
        var me = this;
        this.plugins.push(
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                pluginId: 'editing',
                listeners: {
                    beforeedit: function (editor, context) {
                        var me = this;
                        var allowed = !!me.isEditAllowed;
                        this.initEvents();
                        if (me.grid.selModel.selected.keys[0] == context.grid.selModel.selected.keys[0]) {
                            return;
                            me.isEditAllowed = true;
                           
                        }
                        else {
                            return false;
                        }
                    },
                    'edit': function (e) {
                        me.onFieldEdit(e); // called to open modal pop up for quantity field
                            this.isEditAllowed = false;
                    }
                }
        }));

        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.packageStore.items,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'productName',
                type: 'string',
                useNull: true
            }, {
                name: 'quantity',
                type: 'int',
                useNull: true
            }, {
                name: 'unitPrice',
                type: 'float',
                useNull: true
            },
            {
                name: 'itemTax',
                type: 'int',
                useNull: true
            },
            {
                name: 'discount',
                type: 'int',
                useNull: true
            },
            {
                name: 'total',
                type: 'float',
                useNull: true
            },
            {
                name: 'weight',
                type: 'float',
                defaultValue: 0
            }, {
                name: 'isPackagedStandAlone',
                type: 'boolean'
            }, {
                name: 'lineId',
                type: 'int',
                unseNull: false
            }, {
                name: 'fulfillmentStatus',
                type: 'string',
                useNull: true
            }, {
                name: 'optionAttributeFQN',
                type: 'string',
                useNull: true
            }],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('lineId') === b.get('lineId')) {
                        return 0;
                    }
                    return (a.get('lineId') < b.get('lineId') ? -1 : 1);
                }
            }]
        });
        
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            mode: 'single',
            injectCheckbox: 'first',
            headerWidth: 37,
            checkOnly: true,
            showHeaderCheckbox: true,
            setup: function () {
                this.maxSelections = 0;
                var selections = this.store.getRange();

                for (var key in selections) {
                    if (selections[key].data.quantityReturnable !== 0) {
                        this.maxSelections++;
                    }
                }

                this.isSetup = true;
            },

            setHeader: function (header) {
                this.checkallBox = header;
            },

            setErrorEl: function (el) {
                this.errorEl = el;
            },
            
            checkSelected: function () {
            //    console.log(this);
                var me =this;
            },

            selectAll: function (suppressEvent, header) {
                if (!this.allSelected) {
                    this.allSelected = true;
                    var selections = this.store.getRange();
                    var returnableItems = [];

                    for (var key in selections) {
                        if (selections[key].data.quantityReturnable !== 0) {
                            returnableItems.push(selections[key]);
                        }
                    }

                    var len = returnableItems.length;
                    for (var i = 0; i < len; i++) {
                        this.doSelect(returnableItems[i], true, suppressEvent);

                        var unreturned = returnableItems[i].get('quantityFulfilled') - returnableItems[i].get('quantityReturned');

                        if (!returnableItems[i].get('quantity') && unreturned > 0) {
                            returnableItems[i].set('quantity', 1);
                        }
                    }

                    if (this.getSelection().length !== 0) {
                        header.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                    } else {
                        this.errorEl.setError('All items have already been returned');
                        this.allSelected = false;
                        return;
                    }
                } else {
                    this.allSelected = false;
                    this.deselectAll(suppressEvent);
                }

                this.errorEl.setError('');
            },

            onHeaderClick: function (headerCt, header, e) {
                if (!header.isCheckerHd) {
                    return;
                }

                e.stopEvent();
                this.selectAll(true, header);
            },

            listeners: {
                deselect: function (grid, record) {
                    this.checkSelected();
                //    this.errorEl.setError('');
                },

                select: function (grid, record) {
                    this.checkSelected();
                //    this.errorEl.setError('');
                }

                
            },

            renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
                var baseCSSPrefix = Ext.baseCSSPrefix;
                metaData.tdCls = baseCSSPrefix + 'grid-cell-special ' + baseCSSPrefix + 'grid-cell-row-checker';
                return record.get('quantityReturnable') === 0 ? '<div class="' + baseCSSPrefix + 'grid-row-checker disabled-return-checkbox"> </div>' : '<div class="' + baseCSSPrefix + 'grid-row-checker"> </div>';
            }
        });

        //this.columns = this.getColumnConfig(me);

        me.customUnitTaxEditor = Ext.widget({
            xtype: 'CustomEditorField-form',
            showBorder: true,
            allowBlank: false,
            typeAhead: false,
            msgTarget: 'qtip',
            listeners: {
            }
        });

        this.columns = [
            {
                dataIndex: 'lineId',
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 60,
                sortable: false,
                menuDisabled: true,
                hidden: false
            },
            {
                text: 'Image',
                draggable: false,
                resizable: true,
                menuDisabled: true,
                hidden: false,
                renderer: function (value) {
                    return '<img src="http://dtlr258s62w81.cloudfront.net/19638-23793/cms/23793/files/6ac0c98f-402d-4fd2-95da-a482f3520041?max=160&_mzcb=_1486049853491" style="width:60px" />';
                }
            },
            {
                dataIndex: 'productName',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                dataIndex: 'optionAttributeFQN',
                text: 'Item Attributes',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                dataIndex: 'unitPrice',
                text: 'Unit Price',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                editor: {
                    xtype: 'numberfield',
                    showBorder: false,
                    hideTrigger: true,
                    minValue: 0,

                },
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                dataIndex: 'itemTax',
                text: 'Unit Tax',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                editor: {
                    showBorder: false
                    //xtype: 'CustomEditorField-form',
                    //hideTrigger: true,
                    //minValue: 0,
                    //text: 'Name',
                    //dataIndex: 'name',
                },
                listeners: {
                    click: {
                        fn: function (view, cell, cellIndex, rowIndex, e, record, row, eOpt) {
                            me.customUnitTaxEditor;
                            //var editMode = view.ownerCt.editMode,
                        },
                    }
                }
            },
            {
                dataIndex: 'quantity',
                text: 'Qty',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                //editor: {
                //    xtype: 'numberfield',
                //    showBorder: false,
                //    hideTrigger: true,
                //    minValue: 0,
                //}
            },
            {
                dataIndex: 'quantity',
                text: 'Avail Qty',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
            },
            {
                dataIndex: 'discount',
                text: 'Discount',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                //editor: {
                //    xtype: 'numberfield',
                //    showBorder: false,
                //    hideTrigger: true,
                //    minValue: 0,
                //},
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                dataIndex: 'total',
                text: 'Subtotal',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                xtype: 'taco.menucolumn',
                stateId: 'actionsColumn',
                menuItems: [
                    {
                        text: 'Edit Item',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {

                        }
                    },
                    {
                        text: 'Cancel Item',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            me.openItemCancellationPopup();
                            
                        },
                    },
                    //        {
                    //            text: 'Move Item',
                    //            requiredBehaviors: {
                    //                model: 'Taco.model.Product',
                    //                behavior: 'update'
                    //            },
                    //            menuColumnHandler: function (item, eventData) {

                    //            }
                    //        }
                ]
            }
        ];

        

        this.callParent();
        
        // Loading should be kicked off by the parent Return subform.
        //this.loadReturnableItemsData();

        var i = 0;
        while (true) {
            var header = this.headerCt.getHeaderAtIndex(i);
            this.getSelectionModel().setHeader(header);
            break;
            i++;
        }
    },
   
    getColumnConfig: function (me) {
    //    return 
    },

    

    onFieldEdit: function (e) {
        var me = this;
        if (e.context.field == 'itemTax') {
            me.editOrderItem(e, {
                data: [
                    e.context.grid.record.getData()
                ]
            });
        }
    },

    editOrderItem: function (e, config) {

        var me = this;
        field = e.context.field;
        Ext.create('Taco.view.order.modal.fulfillment.ItemUnitTax', {
            layout: 'hbox',
            width: 600,
            height: 400,
            record: e.context.grid.record,
            parentRecord: me.record,
            //store: me.record.getCancellationReasons(),
            originalQuantity: e.context.originalValue,
            //listeners: {
            //    saveSuccess: {
            //        fn: function (json) {
            //            me.fireEvent('orderCancelled', json);
            //        },
            //        scope: me
            //    }
            //}
        });
    },

    openItemCancellationPopup: function () {
        var me = this;
        var store = me.record.getCancellationReasons();
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                for (var i = 0; i < records.length; i++) {
                    me.record.localeStore.each(function (localeRecord) {
                        if (records[i].get('reasonCode') == localeRecord.get('key')) {
                            records[i].dirty = true;
                            records[i].set('description', localeRecord.get('value'));
                            records[i].setDirty('description', localeRecord.get('value'));
                            records[i].commit();
                        }
                    });
                }
                Ext.create('Taco.view.order.modal.fulfillment.OrderItemCancellation', {
                    layout: 'hbox',
                    width: 600,
                    height: 400,
                    record: me.record,
                    store: store,
                    //originalQuantity: originalQuantity,
                    listeners: {
                        saveSuccess: {
                            fn: function (json) {
                                //me.fireEvent('orderCancelled', json);
                            },
                            //scope: me
                        }
                    }
                });
            }
        });

    }
});




Ext.define('CustomEditorField', {
    extend: 'Ext.form.Panel',
    alias: 'widget.CustomEditorField-form',
    title: 'Unit Tax',
    width: 100,
    bodyPadding: 0,
    border :1,
    items: [{
        xtype: 'fieldcontainer',
        //fieldLabel: 'Unit Tax',
        labelWidth: 100,
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            flex: 1
        },
        {
            xtype: 'splitter'
        },
        {
            xtype: 'textfield',
            flex: 1
        }
        ]
    }]
});



