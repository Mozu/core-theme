/**
 * @class Taco.view.customers.Index
 */
Ext.define('Taco.view.customers.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.customer',
    requires: [
        'Taco.model.CustomerAccount',
        'Taco.store.Customers'
    ],

    typeName: 'Customer',
    modelName: 'Taco.model.CustomerAccount',
    store: { type: 'Taco.store.Customers' },
    editorName: 'Taco.view.customer.Edit',
    useTilePanel: false,
    requiresContextOfType: 's',
    gridPanelConf: {
        columns: [{
            dataIndex: 'primaryFirstName',
            text: 'First Name',
            width: 130
        }, {
            dataIndex: 'primaryLastName',
            text: 'Last Name',
            width: 130
        }, {
            dataIndex: 'primaryEmail',
            text: 'Email',
            width: 200
        }, {
            dataIndex: 'primaryCityOrTown',
            text: 'Location',
            width: 150,
            renderer: function (value, metaData, record) {
                return value ? [Ext.String.capitalize(value), record.get('primaryState')].join(', ') : '';
            }
        }, {
            dataIndex: 'orderCount',
            text: 'Total Orders',
            width: 100
        }, {
            dataIndex: 'totalSpent',
            text: 'Spent',
            width: 100
        }, {
            dataIndex: 'groups',
            text: 'Groups',
            renderer: function (value, metaData, record) {
                if (value && value.length) {
                    return value.join(',');
                }
            },
            minWidth: 100,
            flex: 1
        }]
    },
    initComponent: function () {
        var me = this;
        me.header = {
            title: 'Customers',
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Customer',
                click: function () {
                    me.launchEditor(Ext.create('Taco.model.CustomerAccount'));
                }
            }]
        };
        this.tagStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerTags');
        this.gridPanelConf = {
            columns: [{
                dataIndex: 'primaryFirstName',
                text: 'First Name',
                width: 130
            }, {
                dataIndex: 'primaryLastName',
                text: 'Last Name',
                width: 130
            }, {
                dataIndex: 'primaryEmail',
                text: 'Email',
                width: 200
            }, {
                dataIndex: 'primaryCityOrTown',
                text: 'Location',
                width: 150,
                    renderer: function(value, metaData, record) {
                    return value ? [Ext.String.capitalize(value), record.get('primaryState')].join(', ') : '';
                }
            }, {
                dataIndex: 'orderCount',
                text: 'Total Orders',
                width: 100
            }, {
                dataIndex: 'totalSpent',
                text: 'Spent',
                width: 100
            }, {
                dataIndex: 'groups',
                text: 'Groups',
                    width: 300,
                    renderer: function(value, metaData, record) {
                    if (value && value.length) {
                        var names = [];
                            Ext.each(value || [], function(tagId) {
                            var tagRecord = me.tagStore.getById(tagId);
                            if (tagRecord) {
                                names.push(tagRecord.get('Value'));
                            }
                                
                            
                        });

                        if (names.length)
                            return names.join(', ');
                    }
                },
                minWidth: 100,
                flex: 1
                },{
            xtype: 'taco.menucolumn',
        text: 'Actions',
        flex:1,
        menuItems: [
        {
            text: 'Edit',
            requiredBehaviors: {
                model: 'Taco.model.CustomerAccount',
                behavior: 'update'
            },
            menuColumnHandler: function (item, eventData) {
                var page = eventData.grid.getParentPage(),
                    record = eventData.record,
                    metaData = { id: record.getId() };

                page.launchEditor(record, metaData);

            }
        }],
        // do any processing needed to show menu
        onMenuShow: function (menu, eventData) {
        }
            }]
        };
        
        this.callParent(arguments);
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('customers/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
});