/**
 * @class Taco.view.tax.Index
 */
Ext.define('Taco.view.tax.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.store.TaxRates', 'Taco.store.StateComboBox'],

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Tax Settings',
            actions: [{
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                listeners: {
                    click: function () {
                        me.store.sync({
                            success: me.onStoreStateChange,
                            scope: me
                        });
                    }
                }
            }]
        };

        me.store = Ext.create('Taco.store.TaxRates', {
            autoLoad: true,
            listeners: {
                add: me.onStoreStateChange,
                datachanged: me.onStoreStateChange,
                update: me.onStoreStateChange,
                scope: me
            }
        });

        me.statesStore = Ext.create('Taco.store.StateComboBox');

        me.addform = Ext.create('Ext.form.Panel', {
            layout: { type: 'hbox', align: 'middle' },
            defaults: {
                xtype: 'container',
                width: 180,
                layout: { type: 'vbox', align: 'left' },
                cls: Taco.baseCSSPrefix + 'toolbar-form-cell'
            },
            items: [{
                // state name container
                flex: 1,
                items: [{
                    xtype: 'selectfield',
                    name: 'stateName',
                    mode: 'local',
                    valueField: 'stateCode',
                    displayField: 'stateCode',
                    allowBlank: true,
                    emptyText: 'Select state',
                    store: me.statesStore,
                    // configuration passed to selectfield's boundList
                    listConfig: {
                        listeners: {
                            beforeselect: {
                                fn: function (viewmodel, record) {
                                    var state = record.get('stateCode');
                                    if (viewmodel.view) {
                                        return !(Ext.fly(viewmodel.view.getNodeByRecord(record)).hasCls('x-boundlist-item-unselectable'));
                                    }
                                },
                                scope: this
                            },
                            show: { fn: me.applyFilter, scope: me }
                        }
                    }
                }]
            }, {
                // tax rate container
                items: [{
                    xtype: 'textfield',
                    name: 'taxRate',
                    emptyText: '%'
                }]
            }, {
                // tax shipping container
                layout: { type: 'vbox', align: 'center' },
                items: [{
                    xtype: 'checkbox',
                    name: 'appliesToShipping',
                    checked: false
                }]
            }, {
                // action container
                width: 48,
                layout: { type: 'vbox', align: 'center' },
                items: [{
                    xtype: 'component',
                    autoEl: { tag: 'a', html: 'add' },
                    listeners: {
                        click: {
                            element: 'el',
                            fn: function () {
                                var form = me.addform.getForm();
                                me.fireEvent('addtax', form.getFieldValues());
                                form.reset();
                            },
                            scope: this
                        }
                    }
                }]
            }]
        });

        me.gridpanel = Ext.create('Taco.core.ux.BaseGrid', {
            store: me.store,
            width: 800,
            selType: 'cellmodel',

            columns: [{
                dataIndex: 'id',
                text: 'ID',
                hidden: true
            }, {
                dataIndex: 'stateCode',
                text: 'State',
                flex: 1,
                editor: {
                    xtype: 'selectfield',
                    mode: 'local',
                    valueField: 'stateCode',
                    displayField: 'stateCode',
                    allowBlank: true,
                    emptyText: 'Select state',
                    store: me.statesStore,
                    cls: [Taco.baseCSSPrefix + 'grid-editor-textfield',
                        Taco.baseCSSPrefix + 'grid-editor-fixedwidth'],
                    listConfig: {
                        listeners: {
                            beforeselect: {
                                fn: function (viewmodel, record) {
                                    var state = record.get('stateCode');
                                    if (viewmodel.view) {
                                        return !(Ext.fly(viewmodel.view.getNodeByRecord(record)).hasCls('x-boundlist-item-unselectable'));
                                    }
                                },
                                scope: this
                            },
                            show: { fn: me.applyFilter, scope: me }
                        }
                    }
                }
            }, {
                dataIndex: 'rate',
                text: 'Tax Rate',
                width: 180,
                editor: {
                    xtype: 'textfield',
                    cls: [Taco.baseCSSPrefix + 'grid-editor-textfield',
                        Taco.baseCSSPrefix + 'grid-editor-fixedwidth']
                },
                renderer: function (value) {
                    return value + ' %';
                }
            }, {
                dataIndex: 'appliesToShipping',
                text: 'Tax Shipping?',
                align: 'center',
                width: 180,
                editor: {
                    xtype: 'checkbox',
                    cls: Taco.baseCSSPrefix + 'grid-editor-checkbox'
                },
                renderer: function (value) {
                    if (value) {
                        return "Yes";
                    } else {
                        return "No";
                    }
                }
            }],

            actions: [{
                tooltip: 'Remove',
                iconCls: Taco.baseCSSPrefix + 'action-remove',
                eventName: 'removetax'
            }],

            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                weight: 101,
                layout: { type: 'vbox', align: 'stretch' },
                cls: Taco.baseCSSPrefix + 'toolbar-form',
                items: [me.addform]
            }],

            plugins: [{ ptype: 'cellediting'}],

            listeners: {
                'removetax': {
                    fn: me.removeTax,
                    scope: me
                }
            }
        });

        Ext.apply(me.body, {
            layout: { type: 'vbox', align: 'left' },
            items: [me.gridpanel]
        });

        me.callParent(arguments);

        me.on({
            'addtax': {
                fn: me.addTax,
                scope: me
            }
        });
    },

    onStoreStateChange: function (form) {
        var me = this,
            isDirty = me.isDirty(),
            dirtyButton = me.down('dirtybutton');

        dirtyButton.setDirty(isDirty);
    },

    isDirty: function () {
        var me = this;

        return (me.store.getNewRecords().length > 0 ||
            me.store.getUpdatedRecords().length > 0 ||
            me.store.getRemovedRecords().length > 0);
    },

    initSaveTasks: function (chain) {
        var me = this;

        chain.addSyncStoreTask({
            key: 'taxStore',
            depends: [],
            store: me.store
        });

        this.callParent(arguments);
    },

    applyFilter: function (list) {
        //debugger;
        var me = this,
        unselectable = [];

        me.store.each(function (record) {
            unselectable.push(record.get('stateCode'));
        });

        me.statesStore.each(function (record) {
            var invalid = Ext.Array.contains(unselectable, record.get('stateCode')),
                oldCls = 'x-boundlist-item-' + ((invalid) ? 'selectable' : 'unselectable'),
                newCls = 'x-boundlist-item-' + ((invalid) ? 'unselectable' : 'selectable');

            Ext.fly(list.getNodeByRecord(record)).replaceCls(oldCls, newCls);
        });
    },

    addTax: function (values) {
        var me = this;

        if (!(values.stateName) || !(values.taxRate)) {
            return false;
        }

        me.store.add({
            appliesToShipping: values.appliesToShipping,
            rate: values.taxRate,
            stateCode: values.stateName
        });
    },

    removeTax: function (view, index, idx, action, e, record) {
        var me = this;

        me.store.remove(record);
    }
});