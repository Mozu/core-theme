/**
 * @class Taco.view.customers.Index
 */

Ext.define('Taco.view.customers.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.customer',
    requires: [
        'Taco.model.CustomerAccount',
        'Taco.store.Customers',
        'Taco.view.customers.AdvancedSearchForm',
        'Taco.store.CustomerGroups'
    ],

    typeName: 'Customer',
    modelName: 'Taco.model.CustomerAccount',
    store: { type: 'Taco.store.Customers' },
    editorName: 'Taco.view.customer.Edit',
    useTilePanel: false,
    
  
    initComponent: function () {
        var me = this;

        this.header = {
            title: 'Customers'
        };

        this.tagStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerGroups');

        this.gridPanelConf = {
            columns: [ {
                dataIndex: 'id',
                text: 'Customer Number',
                width: 130
            },{
                dataIndex: 'firstName',
                text: 'First Names',
                width: 130,
                renderer: function (value, metaData, record) {
                    if (value)
                        return value;
                    if (!Ext.isEmpty(record.data.contacts)) {
                        return record.data.contacts[0].firstName;
                    }
                    return null;
                }
                
            }, {
                dataIndex: 'lastName',
                text: 'Last Name',
                width: 130,
                renderer: function (value, metaData, record) {
                    if (value)
                        return value;
                    if (!Ext.isEmpty(record.data.contacts)) {
                        return record.data.contacts[0].lastName;
                    }
                    return null;
                }
            }, {
                dataIndex: 'emailAddress',
                text: 'Email',
                width: 200,
                renderer: function (value, metaData, record) {
                    if (value)
                        return value;
                    if (!Ext.isEmpty(record.data.contacts)) {
                        return record.data.contacts[0].emailAddress;
                    }
                    return null;
                }
            }, {
                dataIndex: 'orderCount',
                text: 'Total Orders',
                width: 100
            }, {
                dataIndex: 'totalSpent',
                text: 'Spent',
                width: 100,
                renderer: function (value, metaData, record) {
                    return Ext.util.Format.usMoney(value);
                }
            },  {
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

                        if (names.length) {
                            return names.join(', ');
                        }
                    }
                },
                minWidth: 100,
                flex: 1
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                flex:1,
                menuItems: [{
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
                onMenuShow: function (menu, eventData) {}
            }]
        };
        
        this.callParent(arguments);
    },
    
    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.customers.AdvancedSearchForm'
    },
    

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('customers/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
});
