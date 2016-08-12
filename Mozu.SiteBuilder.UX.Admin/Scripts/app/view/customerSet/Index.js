/**
 * @class Taco.view.channel.Index
 */
Ext.define('Taco.view.customerSet.Index', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
        'Taco.store.CustomerSet',
        'Taco.model.CustomerSet',
        'Taco.view.customerset.DeleteModal'
    ],

    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,

    // default data to use when createing new entity
    defaultRowEditingData: {},

    //editorName: 'Taco.view.locationType.Edit',

    //plural: false,
    modelName: 'Taco.model.CustomerSet',

    store: {
        type: 'Taco.store.CustomerSet'
    },

    useTilePanel: false,
    addContentViewPadding: true,
    title: 'Customer Sets',
    createButtonText: 'Create New Customer Set',
    createButtonEnabled: true,
    cancelButtonEnabled: false,
    saveButtonEnabled: false,
    hideSearchToolbar: true,
    enableNavHeader: true,
    enableSearchBarInHeader: false,
    stateful: false,
    launchEditorOnClick: false,

    initComponent: function() {
        var me = this;
        me.siteStore = Taco.app.context.getStore(true);
        me.siteStore.filter('contextType', 's');
        var siteData = me.siteStore.data.items.map(function(i) {
            return [i.raw.id, i.raw.name]
        });
        this.columns = [
            {
                dataIndex: 'code',
                text: 'Code',
                editor: {
                    // defaults to textfield if no xtype is supplied
                    emptyText: "Code",
                    msgTarget: "qtip",
                    // optional enhancement to rowEditor. Makes the field only editable during a create;
                    editableOnCreateOnly: true,
                    selectOnFocus: true,
                    allowBlank: false
                },
                width: 200
            }, {
                dataIndex: 'name',
                editor: {
                    // defaults to textfield if no xtype is supplied
                    emptyText: "Name",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: false
                },
                text: 'Name',
                width: 200

            }, {
                dataIndex: 'isDefault',
                text: 'Default',
                width: 100,
                renderer: function(value) {
                    return value ? 'Y' : 'N';
                }
            }, {
                dataIndex: 'sites',
                flex: 1,
                renderer: function(value, metaData, record) {
                    if (!value || !value.length) {
                        return '';
                    }

                    return value.map(function(id) {
                        var rec = me.siteStore.findRecord('id', id);
                        if (rec) {
                            return rec.get('name');
                        }
                        return id;
                    }).join(', ');
                },
                editor: {
                    xtype: 'boxselect',
                    fieldLabel: null,
                    name: 'sites',
                    queryMode: 'local',

                    //  valueField: 'id',
                    store: siteData,


                    //  displayField: 'name',
                    msgTarget: "qtip",
                    selectOnFocus: true


                },
                text: 'Sites',

            }, {
                dataIndex: 'customerCount',
                text: 'Customers',
                width: 150
            }, {
                xtype: 'taco.menucolumn',

                menuItems: [{
                    itemId: 'Delete',
                    text: 'Delete',
                    menuColumnHandler: function (item, eventData) {
                        if (eventData.record.get('isDefault')) {
                            return;
                        }
                        var record = eventData.record;
                        me.doDelete(record, me.store);
                    }
                }],
                preProcessMenuItems: function (items, menuColumn, eventData) {
                    
                    var found = items.find(function (item, index) {
                        return item.itemId.toLowerCase() === 'delete';
                    });
                    if (found) {
                        found.disabled = eventData.record.get('isDefault');
                    }
                    
                    return items;
                }
            }
        ];

        this.callParent(arguments);


        this.store.on('update', function(store, record, operation) {
            if (operation === 'commit') {
                store.reload();
            }
        });
    },

    doCreate: function() {
        this.onRowEditorCreate();
    },

    beforeRowUpdate: function (rowEditor, store) {
        if (rowEditor.context.rowIdx > 0) {
            // Not adding a new row, just editing an existing one.
            return true;
        } else {
            // I'm purposely checking if found > 0 because found can't be greater then 0. I'm searching starting at index 1.
            var found = store.find('code', store.getAt(0).get('code'), 1, false, true, true);
            if (found > 0) {
                Taco.app.fireEvent('setmessage', 'New customer set code already exists. The code must be unique.', 'error');
                store.removeAt(0);
                return false;
            }
            return true;
        }
    },

    doDelete: function(record, store) {
        this.modal = Ext.create('Taco.view.customerset.DeleteModal', {
            record: record,
            store: store,
            listeners: {
                savesuccess: function(modal, values) {
                    store.reload();
                },
                scope: this
            }
        });
    }

});