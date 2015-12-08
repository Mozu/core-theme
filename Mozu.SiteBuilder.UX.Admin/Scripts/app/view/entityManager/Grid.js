/**
 * @class Taco.view.entityManager.Grid
 */

Ext.define('Taco.view.entityManager.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.entityManagerGrid',
    requires: ['Taco.view.entityManager.AdvancedSearchForm'],
    contextConfig: {
        supportedLevels: ['t', 'm', 'c', 's']
    },
    launchEditorOnClick: false,
    enableNavHeader: false,
    addContentViewPadding: true,
    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    enableAutoSelect: false,
    showActionsColumn: true,
    hideSearchToolbar: false,
    selType: 'rowmodel',
    autoScroll: true,
    enableQuickFilters: false,
    stateful: true,
    itemId: 'dymanicEnityGrid',
    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.entityManager.AdvancedSearchForm',
        quickFilterData: [],
        emptySearchText: 'Search'
    },

    initComponent: function() {
        var me = this;

        me.store = Ext.create('Taco.store.EntityLists', {
            entityType: this.entityType,
            autoLoad: false,
            remoteFilter: true
        })

        me.callParent(arguments);

    },

    getStateFulId: function(dynamicFields) {
        var start = this.listMetaData.entityType + this.listMetaData.name + this.listMetaData.listFQN;

        if (!dynamicFields) return start;

        if (!dynamicFields.length || dynamicFields.length === 0) return start;
        
        else {
            var key = dynamicFields.fields.map(function(rec) { return rec.name; }).join(',');
            return start + key;
        }
    },

    initListView: function(record) {

        var me = this,
            metaData = this.buildColumns(record);

        if (me.rendered) {
            me.reconfigure(metaData.store, metaData.columns);
        } else {
            me.columns = metaData.columns;
            me.store = metaData.store;
        }

        me.store.on('load', me.updatePagerToolbar.bind(me, record), me);

        me.on('cellclick', me.onCellClick, me);
    },

    updatePagerToolbar: function(record) {

        if (record.get('views').length > 0) {

            var menu = Ext.widget('menu'),
                exisitingMenu = this.down('#taco-view-menu'),
                me = this;

            Ext.Array.each(record.get('views'), function(view) {
                menu.add({
                    text: view.name,
                    view: view,
                    handler: function(cmp) {
                        me.initListView.bind(me, record, view)
                    }
                });
            });

            this.viewMenu = {
                itemId: 'taco-view-menu',
                text: 'views',
                menu: menu,
                style: {
                    marginLeft: '10px'
                }
            };

            if (exisitingMenu) {
                exisitingMenu.destroy();
                this.gridPager.insert(this.gridPager.items.getCount() - 2, this.viewMenu);
            }

            else {
                this.gridPager.insert(this.gridPager.items.getCount() - 2, this.viewMenu);
            }
        }
    },

    buildColumns: function(record) {

        var me = this;
        var split = me.up('entity-split');
        var columns = [];
        var view;
        var store;

        this.listMetaData = record;

        if (record.get('entityType') === 'cms') {

            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.data.name;
                },
                text: 'Document Name',
                dataIndex: 'name',
                flex: 1,
                width: 150,
                sortable: true,
                stateful: true,
                stateId: 'name'
            });

        } 

        else {
            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.data.id;
                },
                text: 'Id',
                flex: 1,
                width: 125,
                dataIndex: 'id',
                sortable: false,
                stateful: true,
                stateId: 'id'
            });
        }

        view = record.get('views') || { fields: [] };

        Ext.Array.each(view.fields || [], function(viewField) {
            columns.push({
                xtype: 'gridcolumn',
                dataIndex: viewField.name,
                renderer: function(value, metaData, record) {
                    var fields = record.getFields();
                    if (fields) {
                        return fields[viewField.name];
                    }
                    return undefined;
                },
                text: viewField.name,
                flex: 1,
                width: 125,
                sortable: false,
                stateful: true,
                stateId: viewField.name + 'dynamic'
            });
        });

        if (record.get('entityType') === 'cms') {

            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.data.documentTypeFQN;
                },
                text: 'Content Type',
                flex: 1,
                width: 150,
                dataIndex: 'type',
                sortable: false,
                stateful: true,
                stateId: 'documentTypeFQN'
            });

            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.get('publishState') ? record.get('publishState') : 'Live';
                },
                text: 'Status',
                flex: 1,
                width: 150,
                dataIndex: 'status',
                sortable: false,
                stateful: true,
                stateId: 'publishState'
            });

            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.get('startDate') ? record.get('startDate') : 'Now';
                },
                text: 'Start Date',
                flex: 1,
                width: 150,
                dataIndex: 'dateRange',
                sortable: false,
                hidden: true,
                stateful: true,
                stateId: 'startDate'
            });

            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.get('endDate') ? record.get('endDate') : 'Never';
                },
                text: 'End Date',
                flex: 1,
                width: 150,
                dataIndex: 'dateRange',
                sortable: false,
                hidden: true,
                stateful: true,
                stateId: 'endDate'
            });
        }

        columns.push({
            xtype: 'taco.menucolumn',
            menuItems: [{
                text: 'Edit',
                hideOnClick: false,
                menuColumnHandler: function(item, eventData) {
                    split.onItemEdit(eventData.grid, eventData.record, eventData.grid.listMetaData);
                }
            }, {
                text: 'Delete',
                hideOnClick: false,
                menuColumnHandler: function(item, eventData) {
                    me.deleteRecordFromStore(eventData.record);
                }
            }]
        });

        if (Ext.util.Cookies.get('debugext') === 'true') {
            columns[columns.length - 1].menuItems.push({
                text: 'Edit Raw',
                hideOnClick: false,
                menuColumnHandler: function(item, eventData) {

                    split.onItemEdit(eventData.grid, eventData.record, eventData.grid.listMetaData, {
                        editMode: 'raw'
                    });
                }
            });
        }

        store = Ext.create('Taco.store.Entities', {
            listName: record.get('listFQN'),
            entityType: record.get('entityType'),
            view: view.name,
            autoLoad: true,
            remoteSort: true,
            remoteFilter: true
        });

        split.updateSearchContext(store);

        return {
            columns: columns,
            store: store
        };
    },

    deleteRecordFromStore: function(record) {
        record.destroy({
            success: function() {
                Taco.app.fireEvent('setmessage', 'Successfully deleted', 'success');
            },
            failure: function() {
                Taco.app.fireEvent('setmessage', 'An error occurred while trying to delete this record', 'error');
            }
        });
    },

    onCellClick: function(view, td, cellIndex, record, tr, rowIndex, e) {

        //sigh, if we click a context menu, ignore it
        if (td.querySelector('.taco-grid-row-menu-trigger')) {
            return false;
        }

        var split = this.up('entity-split');
        split.onItemEdit(view, record, this.listMetaData);
    }
    
});
