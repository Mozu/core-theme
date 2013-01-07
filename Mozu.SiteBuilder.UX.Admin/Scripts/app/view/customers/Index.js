/**
 * @class Taco.view.customers.Index
 */
    Ext.define('Taco.view.customers.Index', {
        extend: 'Taco.core.ux.content.Container',
        alias: 'widget.customerlist',
        requires: ['Ext.form.Panel', 'Taco.core.ux.BaseGrid', 'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 'Taco.core.ux.FilterableDataView', 'Taco.store.Customers', 'Taco.view.customers.Edit', 'Taco.view.customers.ItemBrowser'],
        mixins: {
            protectable: 'Taco.core.util.Protectable'
        },
        filters: [],

        initComponent: function (eOpts) {
            var me = this,
                basegridview;
                

            me.header = {
                title: 'Customers'
            };

            me.store = Ext.create('Taco.store.Customers', { filters: me.filters });

            var nameRenderer = function(value, metaData, record, rowIndex, colIndex, store) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
            };

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
                        text: 'clear filters',
                        xtype: 'secondarybutton',
                        hidden: me.filters == null || me.filters.length == 0,
                        listeners: {
                            click: function () {
                                me.store.filters.clear();
                                me.store.load();
                                this.setVisible(false);
                            }
                        }
                    }]
                }],

                columns: [{
                    xtype: 'gridcolumn',
                    dataIndex: 'firstName',
                    text: 'First Name',
                    hideable: false,
                    flex: 1,
                    minWidth: 110,
                    renderer: nameRenderer
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastName',
                    text: 'Last Name',
                    flex: 1,
                    minWidth: 110,
                    renderer: nameRenderer
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'email',
                    text: 'Email',
                    flex: 1,
                    minWidth: 110,
                    hidden: false
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'totalOrders',
                    flex: 1,
                    minWidth: 40,
                    text: 'Total Orders'
                }, {
                    xtype: 'numbercolumn',
                    dataIndex: 'spent',
                    flex: 1,
                    minWidth: 40,
                    format: '$0,000.00',
                    text: 'Spent'
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'groups',
                    flex: 1,
                    minWidth: 100,
                    text: 'Group',
                    renderer: function (groups) {
                        var mapped = Ext.Array.map(groups, function (group) {
                            return ' ' + group.name;
                        })
                        var text = Ext.Array.flatten(mapped).toString();
                        var trimmed = Ext.String.trim(text);
                        return '<span class="tooltip">' + trimmed + '</span>';
                    }
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'lastOrderedOn',
                    text: 'Date of Last Order',
                    hidden: true
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'phoneNumber',
                    text: 'Phone No.',
                    hidden: true
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'marketingList',
                    text: 'On Marketing List',
                    hidden: true
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'createdOn',
                    text: 'Customer Since',
                    hidden: true
                }]
            });

            me.itembrowser = Ext.create('Taco.view.customers.ItemBrowser', {
                uniquePanels: [this.basegrid],
                itemStore: me.store,
                itemType: 'customers',
                filterProperty: 'id',
                flex: 1
            });

            Ext.apply(me.body, {
                layout: 'fit',
                items: [me.itembrowser]
            });

            me.callParent(arguments);

            me.store.load();
            
            basegridview = me.basegrid.view;
            basegridview.mon(basegridview, 'itemclick', me.onItemClick, me);
        },

        onGlobalModelSave: function (model) {
            var me = this,
                itemInStore = me.store.getById(model.getId());
            if (itemInStore == null) {
                me.store.add([model]);
                return;
            }
            if (itemInStore !== model) {
                itemInStore.copyData(model);
            }
        },

        onNavigate: function (newState) {
            var md = newState.getMetaData();
            if (md.controller && md.controller === "customers" && md.action === "edit") {
                this.launchEditor(md.args[0]);
                return false;
            }
        },

        launchEditor: function (record) {
            var me = this,
                token = 'customers/edit/',
                editorView = Ext.create('Taco.view.customers.Edit',
                {
                    logicalParent: me,
                    listeners:
                    {
                        cancel: function () {
                            editorView.destroy();
                            Taco.core.StateManager.addState('customers');
                            if (me.isDirty) {
                                me.store.load();
                                me.isDirty = false;
                            }
                        },
                        save: function () {
                            me.isDirty = true;
                        }
                    },
                    recordId: record
                });

            Taco.app.contentView.add(editorView);
        },

        onItemClick: function (view, record, elm, index, e) {
            if (e.target.className === 'taco-launch-editor') {
                e.preventDefault();
                this.launchEditor(record);
                Taco.app.StateManager.addState('customers/edit/' + record.getId(), { id: record.getId() });
            }
        }
    });

