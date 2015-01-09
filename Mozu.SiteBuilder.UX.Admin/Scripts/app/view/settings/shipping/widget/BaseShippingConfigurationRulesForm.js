Ext.define('Taco.view.settings.shipping.widget.BaseShippingConfigurationRulesForm', {
    extend: 'Taco.core.ux.EditContainer',
    // alias: 'widget.shippinginclusionruleform',
    requires: [
        'Taco.store.ShippingInclusionRules',
        'Taco.core.ux.DragHandleColumn'
    ],
    title: '...',
    showAllMethodsWhenMethodsAreEmpty: false,

    getStore: function () {
        console.log('xxx'); //Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingInclusionRules')
    },
    createRoute: 'shipping/shippingMethodCreate',
    editRoute: 'shipping/shippingMethodEdit',

    
    stateId: null,

    initComponent: function () {
        var me = this,
            gridCfg;
        me.tools = [
            {
                xtype: "button",
                text: 'Add New',

                handler: function () {
                    Taco.core.StateManager.attemptNavigate(me.createRoute);
                }
            }
        ];
        gridCfg = {
            xtype: 'grid',

            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragText: 'Drag and drop to reorganize'
                },
                listeners: {
                    cellclick: me.onCellClick,
                    drop: function (node, data, overModel, dropPosition, eOpts) {
                        var store = me.down('grid').store,
                            i;

                        for (i = 0; i < store.getCount(); i++) {
                            store.getAt(i).set('sequence', i + 1);
                        }
                        store.sync();
                    },
                    scope: me
                },

            },
            store: this.getStore(),
            dockedItems: [this.createGridPager()],
            columns: [
                {
                    width: 16,
                    stateId: 'dragHandle',
                    xtype: 'draghandlecolumn',
                    allowNavigation: false

                },
                {
                    dataIndex: 'sequence',
                    stateId:"sequence",
                    text: 'Sequence',
                    width: 100,
                    allowNavigation: false


                }, {
                    dataIndex: 'shippingTargetRuleCodes',
                    stateId: "shippingTargetRuleCodes",
                    text: 'Zones',
                    flex: 1,
                    renderer: function (value, metaData, record) {
                        if (value && value.length) {
                            return value.join(',');
                        } else {
                            return '[All Zones]';
                        }
                    }
                },
                {
                    dataIndex: 'productTargetRuleCodes',
                    text: 'Rules',
                    stateId: "productTargetRuleCodes",
                    flex: 1,
                    renderer: function (value, metaData, record) {
                        if (value && value.length) {
                            return value.join(',');
                        } else {
                            return '[All Products]';
                        }
                    }
                },
                {
                    dataIndex: 'serviceTypes',
                    text: 'Methods',
                    stateId: "serviceTypes",
                    flex: 1,
                    renderer: function (value, metaData, record) {
                        value = record.raw.serviceTypes;
                        var ret = [];
                        if (value && value.length) {
                            Ext.Array.each(value, function (val) {
                                ret.push(val.content.name);
                            });
                            return ret.join(',');
                        } else {
                            if (me.showFeeColumn || me.showAllMethodsWhenMethodsAreEmpty) {
                                return '[All methods]';
                            }
                            return '[No methods]';
                        }
                    }
                },
                {
                    xtype: 'taco.menucolumn',
                    allowNavigation: false,
                    text: 'Actions',
                    width: 100,
                    menuDisabled: true,
                    menuItems: [
                        {
                            text: 'Edit',
                            menuColumnHandler: function(item, eventData) {
                                return me.launchEditor(eventData.record);
                            }
                        },
                        {
                            text: 'Delete',
                            //requiredBehaviors: {
                            //    model: 'Taco.model.Discount',
                            //    behavior: 'destroy'
                            //},
                            menuColumnHandler: me.onDeleteClick
                        }
                    ]
                }
            ]

        };
        if (me.showFeeColumn) {
            gridCfg.columns.splice(gridCfg.columns.length - 2, 0, {
                dataIndex: 'value',
                text: 'Fees',
                stateId: "fees",
                flex: 1,
                renderer: function (value, metaData, record) {
                    var valueType = record.get('valueType');
                    if (valueType == 'flatrate') {
                        return Taco.app.context.getCurrent().formatCurrency(value);
                    }
                    return value + '%';
                }
            });
        }


        if (me.stateId && Ext.isString(me.stateId)) {
            Ext.apply(gridCfg, {
                stateful:true,
                stateId:me.stateId
            })
        }

        me.items = [
            gridCfg
        ];
        me.callParent(arguments);


    },
    createGridPager: function () {
        this.gridPager = Ext.create('Ext.toolbar.Paging', {
            dock: 'bottom',
            componentCls: 'x-grid-paging-toolbar',
            displayInfo: false,
            store: this.store,
            inputItemWidth: 45,
            border: '0 1 1'
        });


        return this.gridPager;
    },
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var metaData = {
                id: record.getId()
            },
            header = view.getHeaderAtIndex(cellIndex);
        if (!header) {
            return;
        }
        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation !== false && this.allowNavigation !== false) {
            e.preventDefault();
            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }
            this.launchEditor(record, metaData);
        }

    },
    launchEditor: function (record, options) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate(this.editRoute + '/' + record.getId());
        }, 1, this);
    },
    onDeleteClick: function (item, eventData) {
        var grid = eventData.grid,
            record = eventData.record;


        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: "Are you sure you want to delete this",
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {

                    var store = grid.getStore();
                    grid.setLoading(true);
                    store.remove(record);
                    store.sync({
                        success: function (m) {
                            grid.setLoading(false);
                        },
                        failure: function (m) {
                            store.reload();
                            grid.setLoading(false);

                            var text = "Unknown error.";
                            if (m.exceptions && Taco.core.util.ExceptionWhiner.wasHandled(m.exceptions)) {
                                return;
                            }
                            if (m.exceptions) {
                                text = Taco.core.util.ExceptionWhiner.createHtmlList(m.exceptions);
                            }

                            Taco.app.fireEvent('setmessage', text, 'error');

                        }

                    });
                }
            }
        });

    }
});