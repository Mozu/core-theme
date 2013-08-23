/**
* The Discount list (grid) view
*/
Ext.define('Taco.view.discount.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.discountlist',
    requires: ['Ext.Date', 'Taco.store.TargetedShippingMethods', 
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid', 
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 
        'Taco.view.discount.Edit', 'Taco.core.ux.action.SecondaryButton',
        'Taco.core.ux.FilterableDataView'
    ],
    modelName: 'Taco.model.Discount',
    store: { type: 'Taco.store.Discounts' },
    editorName: 'Taco.view.discount.Edit',
    typeName: 'Discount',

    requiresContextOfType: 's',
    
    initComponent: function () {
        var me = this;
        me.header = {
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Discount',
                click: function () {
                    me.launchEditor(Ext.create('Taco.model.Discount'));
                }
            }]
        };
        this.callParent(arguments);
    },
    
    gridPanelConf: {
        columns: [{
            xtype: 'gridcolumn',
            dataIndex: 'name',
            text: 'Name',
            hideable: false,
            flex: 1,
            minWidth: 150
            //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
            //}
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'amountType',
            text: 'Type',
            width: 150,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                // percentage
                if (value == "Percentage") {
                    return record.get("amount") + "% OFF";
                }

                // amount
                if (value == "Amount") {
                    return "$" + record.get("amount") + " OFF";
                }

                // freeShipping
                if (value == "Free") {
                    return "Free";
                }

                return Ext.emptyString;
            }
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'target',
            text: 'Applies To',
            width: 180,
            hidden: false,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                var val = "";

                if (record.get("targetType") == "allproducts") {
                    val = "All products";
                    return val;
                }

                if (record.get("products").length > 0) {
                    val = record.get("products").length + ((record.get("products").length > 1) ? " Products" : " Product");
                }

                if (record.get("categories").length) {
                    val += ((record.get("products").length > 0) ? " &amp; " : Ext.emptyString) + record.get("categories").length + ((record.get("categories").length > 1) ? " Categories" : " Category");
                }

                if (record.get("targetType") == "Order") {
                    val = "Min. Order ($" + record.get("minimumOrderAmount") + ")";
                }

                return val;
            }
        }, {
            xtype: 'datecolumn',
            dataIndex: 'startDate',
            width: 100,
            text: 'Start Date'
        }, {
            xtype: 'datecolumn',
            dataIndex: 'expirationDate',
            width: 100,
            text: 'End Date',
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                var val = "";

                if (!record.get("expirationDate")) {
                    val = "Never";
                    return val;
                }

                return Ext.Date.format(value, "n/j/Y");
            }
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'status',
            text: 'Status'
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'couponCode',
            text: 'Coupon Code',
            width: 130,
            hidden: false
        }, {
            xtype: 'numbercolumn',
            dataIndex: 'currentRedemptionCount',
            format: "0",
            text: 'Used',
            width: 80,
            hidden: false
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems:[{
                text: 'Delete',
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior:'destroy'
                },
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }],
    },
    //ToDo: WTF is this used for
    initComponent2: function (eOpts) {
        var me = this,
                basegridview;

        me.header = {
            title: 'Discounts',
            actions: [{
                xtype: 'primarybutton',
                text: 'Create Discount steve',
                onClick: function () {
                    Taco.app.StateManager.attemptNavigate('discounts/create');
                }
            }]
        };

        me.store = Ext.create('Taco.store.Discounts', { filters: me.filters });

        me.basegrid = Ext.create('Taco.core.ux.BaseGrid', {
            store: me.store,
            enableColumnHide: true,
            dockedItems: [{
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                store: me.store,
                displayInfo: true
            }, {
                xtype: 'toolbar',
                items: [{
                    xtype: 'textfilter',
                    store: me.store,
                    param: 'name',
                    emptyText: 'Search',
                    width: 200
                },
                    {
                        text: 'clear filters',
                        xtype: 'secondarybutton',
                        hidden: !me.filters || me.filters.length === 0,
                        listeners: {
                            click: function () {
                                me.store.filters.clear();
                                me.store.load();
                                this.setVisible(false);
                            }
                        }
                    }]
            }],

            listeners: {
                deletediscount: function (list, index) {
                    var grid = this;
                    var model = list.store.getAt(index);

                    Ext.create('Taco.core.ux.modal.Confirmation', {
                        autoShow: true,
                        content: {
                            html: 'Are you sure you want to delete this discount?'
                        },
                        listeners: {
                            cancel: function () { },
                            confirm: function () {
                                grid.setLoading(true);
                                grid.getStore().remove(model);
                                grid.getStore().sync({
                                    success: function (m) {
                                        grid.setLoading(false);
                                        Taco.app.fireEvent('setmessage', 'Discount deleted.', 'status', m);
                                    },
                                    failure: function (m) {
                                        grid.setLoading(false);
                                        Taco.app.fireEvent('setmessage', 'Discount deletion failed.', 'error', m);
                                    }
                                });
                            }
                        }
                    });
                }
            }

        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [me.basegrid]
        });
        me.callParent(arguments);
        me.store.load();
        basegridview = me.basegrid.view;
        basegridview.mon(basegridview, 'itemclick', me.onItemClick, me);
    },

    /**
    * Handler for when the user attempts to navigate away from this view
    */
    onNavigatez: function (newState) {
        // navigation events that i can totes handle include: 
        var md = newState.getMetaData();
        if (md.controller && md.controller === "discounts" && md.action === "edit") {
            this.launchEditor(md.args[0]);
            return false;
        }
    },

    /**
    * When a list item is clicked, this method instatiates the editor view and initializes it with a {@link Taco.core.Model}
    * @param {Model} record The model associated with the list item that was selected
    */
    launchEditorz: function (record) {
        var me = this,
                token = 'discounts/edit/',
                id = record.getId ? record.getId() : record,

            editorView = Ext.create('Taco.view.discount.Edit',
            {
                logicalParent: me,
                listeners:
                {
                    cancel: function () {
                        editorView.destroy();
                        Taco.core.StateManager.addState('discounts');
                        if (me.isDirty) {
                            me.store.load();
                            me.isDirty = false;
                        }
                    },
                    save: function () {
                        me.isDirty = true;
                    },
                    create: function (newRecord) {
                        me.isDirty = true;
                        editorView.destroy();
                        me.launchEditor(newRecord);
                        Taco.app.StateManager.addState('discounts/create');
                    },
                    copyrecord: function (newRecord) {
                        editorView.destroy();
                        me.store.insert(0, newRecord);
                        me.launchEditor(newRecord);
                        Taco.app.StateManager.addState('discounts/edit/' + newRecord.id || -1, { id: newRecord.id || -1 });
                    },
                    deleterecord: function () {
                        editorView.destroy();
                        me.isDirty = true;

                    }
                },
                recordId: record
            });

        Taco.app.contentView.add(editorView);
    },

    /**
    * Handler for the list item click event
    */
    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('discounts/edit/' + record.getId(), { id: record.getId() });
        }
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
});

