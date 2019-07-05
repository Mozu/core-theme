Ext.define('Taco.view.order.modal.fulfillment.ItemsReassign', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.Form',
        'Ext.grid.View',
        'Ext.layout.container.Card',
        'Ext.tab.Bar',
        'Ext.form.field.Number',
        'Ext.toolbar.TextItem'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Save',
    secondaryText: 'Cancel',
    scale: 'large',
    title: 'Items Reassign',
    isRecordSaved: false,
    layout: {
        type: 'fit'
    },

    initComponent: function () {

        var inventoryData = [
            ['Austin warehouse', "XXX.X Mi", "Yes"],
            ['Houstan Warehouse', "XXX.X Mi", "Yes"],
            ['California Warehouse', "XXX.X Mi", "Yes"],
            ['Store name', "XXX.X Mi", "Yes"],
            ['Store name', "XXX.X Mi", "Yes"],
            ['Store name', "XXX.X Mi", "Yes"],
            ['Store name', "XXX.X Mi", "Yes"]
        ];

        var itemsPerPage = 2;

        var inventoryStore = Ext.create('Ext.data.Store', {
            storeId: 'simpsonsStore',
            autoLoad: false,
            //autoLoad: { start: 0, limit: 5 },
            pageSize: itemsPerPage,
            remoteSort: true,
            sorters: [{
                property: 'location',
                direction: 'asc'
            }],
            fields: ['location', 'distance', 'stock'],
            groupField: 'location',
            data: {
                'items': [
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                    { 'location': 'Austin warehouse', "distance": "XXX.X Mi",  "availableQty": "263 of 298", "orderedQty": "263 of 298","reassignQty":""  },
                ]
            },
            proxy: {
                type: 'memory',

                reader: {
                    type: 'json',
                    root: 'items',
                    totalProperty: 'total',
                    enablePaging: true

                }
            }
        });

        // specify segment of data you want to load using params
        inventoryStore.load({
            params: {
                start: 0,
                limit: itemsPerPage
            }
        });


        //var nameRenderer = function () {
        //    return '<div ext-xtype="radiofield"></div>';

        //}

        var inventorygrid = Ext.create('Ext.grid.Panel', {
            title: 'Inventory',
            //features: [{
            //    ftype: 'grouping'
            //}],

            store: Ext.data.StoreManager.lookup('simpsonsStore'),
            //viewConfig: {

            //    listeners: {
            //        // Column Autosize to its data
            //        refresh: function (dataview) {
            //            Ext.each(dataview.panel.columns, function (column) {
            //                if (column.autoSizeColumn === true) column.autoSize();
            //            })
            //        }
            //    }
            //},
            columns: [
                {
                    header: 'Location',
                    dataIndex: 'location',
                    width: 500,
                    //xtype: 'radiocolumn'
                    //autoSizeColumn: true,
                    //  cls: 'checkbox-overwrite',
                    //items: [{
                    //    xtype: 'radiofield'
                    //}]
                },
                { header: 'Distance', dataIndex: 'distance', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150 },
               
                { text: 'Available', dataIndex: 'availableQty', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150 },
                { text: 'Qty Ordered', dataIndex: 'orderedQty', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150 },

                {
                    text: 'Qty to reassign', dataIndex: 'reassignQty', width: 150,
                    editor: {
                        xtype: 'textfield',
                        cls: 'x-grid-checkheader-editor',
                        inputValue: true,
                        uncheckedValue: false
                    }
                },
                //{
                //    xtype: 'checkcolumn',
                //    header: 'Stock',
                //    dataIndex: 'stock',
                //    listeners: {
                //        beforecheckchange: function () {
                //            return false;
                //        }
                //    },
                //    width: 60,
                //    editor: {
                //        xtype: 'checkbox',
                //        cls: 'x-grid-checkheader-editor',
                //        inputValue: true,
                //        uncheckedValue: false
                //    }
                //}
            ],
            height: 150,
            width: 1000,

            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: inventoryStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            }],
            selModel: {
                selModel: 'rowmodel',
                //    seltype: 'checkboxmodel', 
                //    mode: 'single',    
                //    checkonly : true
            },
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1,
                autoCancel: false
            },
            listeners: {
                selectionchange: function () {
                },
                select: function () {
                },
                deselect: function () {
                },
                //beforeload: function (store, operation, eOpts) {

                //    store.proxy.data = inventoryData;
                //}
            },

            //listeners: {
            //    viewready: function (view) {
            //        var els = view.el.query('div[ext-xtype]');
            //        Ext.each(els, function (domEl) {
            //            var xtype = Ext.get(domEl).getAttribute('ext-xtype');
            //            Ext.widget(xtype, { renderTo: domEl });
            //        }, this);
            //        view.up('viewport').doLayout();


            //    }
            //}
            //    renderTo: Ext.getBody()
        });

        Ext.create('Ext.data.Store', {
            storeId: 'simpsonsStore2',
            fields: ['name', 'email', 'phone'],
            data: {
                'items': [{
                    'name': 'Lisa',
                    "email": "lisa@simpsons.com",
                    "phone": "555-111-1224"
                }, {
                    'name': 'Bart',
                    "email": "bart@simpsons.com",
                    "phone": "555-222-1234"
                }, {
                    'name': 'Homer',
                    "email": "homer@simpsons.com",
                    "phone": "555-222-1244"
                }, {
                    'name': 'Marge',
                    "email": "marge@simpsons.com",
                    "phone": "555-222-1254"
                }]
            },
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        var grid2 = Ext.create('Ext.grid.Panel', {
            title: 'All Locations',
            store: Ext.data.StoreManager.lookup('simpsonsStore2'),
            columns: [{
                text: 'Name',
                dataIndex: 'name'
            }, {
                text: 'Email',
                dataIndex: 'email',
                flex: 1
            }, {
                text: 'Phone',
                dataIndex: 'phone'
            }],
            height: 200,
            width: 400
        });

        this.fieldContainer = Ext.create('Ext.tab.Panel', {
            width: 1000,
            height: 400,
            renderTo: Ext.getBody(),
            items: [
                inventorygrid,
                grid2
            ]
        });

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },

    //validateModal: function () {
    //    //verify quantity is not null and less than 0 and should not be greater than max quantity
    //    var quantity = this.down('#cancelQuantity').getValue();

    //    if (!quantity || quantity <= 0 || quantity > (this.originalQuantity || this.record.data.quantity))
    //        return false;

    //    //verify cancel reason should be filled
    //    var reason = (this.down('#cancelReason').getValue() === 'Other'
    //        ? this.down('#otherReason').getValue()
    //        : this.down('#cancelReason').getValue());

    //    if (!reason)
    //        return false;

    //    return true;
    //},

    //getCancelItemQuantityPayload: function () {
    //    var me = this;
    //    var order = this.record;
    //    var reason = this.down('#cancelReason').getValue();
    //    var description = (this.down('[name=otherReason]').isVisible() ?
    //        this.down('#otherReason').getValue() : null);

    //    return {
    //        orderId: order.get('taco.model.order_id'),
    //        orderItemId: order.get('id'),
    //        quantity: this.down('#cancelQuantity').getValue(),
    //        reason: {
    //            reasonCode: reason,
    //            description: description
    //        }
    //    };
    //},

    //doSave: function () {

    //    if (this.validateModal()) {
    //        var me = this;

    //        Ext.MessageBox.show({
    //            title: 'Cancel Item',
    //            // pushes the buttons to the right to be consistant with our dialog ux.
    //            rightJustifyButtons: true,
    //            // reverses the order of the buttons
    //            reverseOrder: true,
    //            msg: 'Are you certain you want to Cancel this item?',
    //            closable: false,
    //            buttons: Ext.Msg.YESNO,
    //            fn: function (val) {
    //                if (val === 'yes') {

    //                    me.setLoading(true, me.body);
    //                    var order = me.parentRecord;
    //                    var payloadData = me.getCancelItemQuantityPayload();
    //                    order.cancelItemQuantity({
    //                        jsonData: payloadData,
    //                        success: function (response) {
    //                            me.isRecordSaved = true;
    //                            me.setLoading(false, me.body);
    //                            var json = Ext.decode(response.responseText, true);
    //                            if (!json || !json.success) {
    //                                return;
    //                            }
    //                            me.saveSuccess(json);
    //                            // close the dialog
    //                            me.close();
    //                        },
    //                        failure: function (response) {
    //                            me.setLoading(false, me.body);
    //                            // close the dialog
    //                            me.close();
    //                        }
    //                    });
    //                }
    //            }
    //        });
    //    }
    //},
    ///**
    //* Do any class level cleanup. Destroy and null any scoped refs.     
    //*/
    //onDestroy: function (destroy) {
    //    if (!this.isRecordSaved && this.originalQuantity)
    //        this.record.set('quantity', this.originalQuantity);
    //    this.callParent(arguments);
    //}
});

Ext.require('*');

Ext.define('Ext.ux.grid.column.RadioColumn', {
    extend: 'Ext.grid.column.CheckColumn',

    alternateClassName: 'Ext.ux.RadioColumn',

    alias: 'widget.radiocolumn',

	/**
	 * @cfg {String} groupField
	 *
	 * Name of the field used for radio groups. If left undefined, this will default to the store's
	 * {@link Ext.data.Store#groupField}, and if this is undefined as well, then the whole data set
	 * will be considered as one and only group.
	 */
    groupField: undefined,

	/**
	 * @cfg {Boolean}
	 *
	 * True to allow unchecking an item by click on it when it is selected. If left to false, then
	 * an item can only be deselected by selecting another one in the group.
	 */
    allowUncheck: false,

    renderer: function (value, meta) {
        var cssPrefix = Ext.baseCSSPrefix,
            cls = [
                cssPrefix + 'form-radio', // for radio image
                cssPrefix + 'form-field' // for disabled style
            ];

        if (this.disabled) {
            meta.tdCls += ' ' + this.disabledCls;
        }
        if (value) {
            meta.tdCls += ' ' + cssPrefix + 'form-cb-checked';
        }

        return '<img class="' + cls.join(' ') + '" src="' + Ext.BLANK_IMAGE_URL + '"/>';
    },

    initComponent: function () {
        this.addEvents(
			/**
			 * @event
			 *
			 * Fires when the selected row in a group changes. This
			 *
			 * @param {Ext.ux.grid.column.RadioColumn} this RadioColumn
			 * @param {Integer} rowIndex The selected row index.
			 * @param {Ext.data.Record} selectedRecord The selected record.
			 * @param {Mixed} group Value of the {@link #groupField}. If `groupField` is not defined,
			 * this will be `undefined`.
			 */
            'radiocheckchange'
        );

        this.callParent(arguments);

        this.on({
            scope: this,
            checkchange: this.onCheckChange,
            beforecheckchange: this.onBeforeCheckChange
        });
    },

    // private
    onBeforeCheckChange: function (col, index, checked) {
        if (!checked && !this.allowUncheck) {
            return false;
        }
    },

    // private
    onCheckChange: function (col, index, checked) {

        if (!checked) {
            return;
        }

        var dataIndex = this.dataIndex,
            grid = this.up('tablepanel'),
            store = grid.getStore(),
            record = store.getAt(index),
            groupField = this.groupField || store.groupField,
            group = groupField && record.get(groupField) || undefined,
            groupItems = group
                ? store.query(groupField, group).items
                : store.getRange(),
            i = groupItems.length,
            r;

        while (i--) {
            r = groupItems[i];
            if (r !== record) {
                r.set(dataIndex, false);
            }
        }

        this.fireEvent('radiocheckchange', this, index, record, group);
    }
});