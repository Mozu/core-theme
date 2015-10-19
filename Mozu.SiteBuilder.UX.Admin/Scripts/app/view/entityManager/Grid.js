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
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.TargetRule',
    enableNavHeader: false,
    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,
    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    showActionsColumn: true,
    hideSearchToolbar: false,
    selType: 'rowmodel',
    autoScroll: true,
    enableQuickFilters: false,
    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.entityManager.AdvancedSearchForm',
        quickFilterData: []
    },

    stateful: false,

    initComponent: function() {
        var me = this,
            menu;

        me.defaultView = me.listMetaData.views[0];
        me.currentView = me.defaultView;
        this.initListView(me.currentView);

        me.callParent(arguments);

        if (me.listMetaData.views.length > 0) {

            menu = Ext.widget('menu');
            Ext.Array.each(me.listMetaData.views, function(view) {
                menu.add({
                    text: view.name,
                    view: view,
                    handler: function(cmp) {
                        me.initListView(cmp.view);
                    }
                });
            });
            this.gridPager.insert(this.gridPager.items.getCount() - 2, '-');
            this.gridPager.insert(this.gridPager.items.getCount() - 2, {
                text: 'views',
                menu: menu
            });
        }

    },
    initListView: function(view) {

        var me = this,
            columns = [],
            store;

        if (me.listMetaData.entityType === 'cms') {
            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.data.name;
                },
                text: 'document name',
                dataIndex: 'name',
                flex: 1,
                width: 150,
                sortable: true
            });
        } else {
            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.data.id;
                },
                text: 'id',
                flex: 1,
                width: 125,
                dataIndex: 'id',
                sortable: false
            });
        }
        view = view || {
            fields: []
        };
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
                sortable: false
            });
        });
        if (me.listMetaData.entityType === 'cms') {
            columns.push({
                xtype: 'gridcolumn',
                renderer: function(value, metaData, record) {
                    return record.data.documentTypeFQN;
                },
                text: 'content type',
                flex: 1,
                width: 150,
                dataIndex: 'type',
                sortable: false
            });
        }
        columns.push({
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Edit',
                hideOnClick: false,
                menuColumnHandler: function(item, eventData) {
                    me.fireEvent('itemedit', eventData.grid, eventData.record, eventData.grid.listMetaData);
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
                    me.fireEvent('itemedit', eventData.grid, eventData.record, eventData.grid.listMetaData, {
                        editMode: 'raw'
                    });
                }
            });
        }
        store = Ext.create('Taco.store.Entities', {
            listName: me.listMetaData.listFQN,
            entityType: me.listMetaData.entityType,
            view: view.name,
            autoLoad: true,
            remoteSort: true
        });
        if (me.rendered) {
            me.reconfigure(store, columns);
        } else {
            me.columns = columns;
            me.store = store;
        }
        me.on('cellclick', me.onCellClick, me);
    },
    onCreate: function() {
        //do nothing
    },
    deleteRecordFromStore: function(record) {
        record.destroy();
    },
    onCellClick: function(view, td, cellIndex, record, tr, rowIndex, e) {
            var me = this,
                header = view.getHeaderAtIndex(cellIndex);
            if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation !== false && this.allowNavigation !== false) {
                e.preventDefault();
                me.fireEvent('itemedit', me, record, me.listMetaData);
            }
        }
        //launchLoadedEditor: function (record, options) {
        //    var complexMetaData = { record: record, options: options };
        //    if (this.reFetchRecordOnEdit) {
        //        delete complexMetaData.record;
        //    }
        //    Ext.defer(function () {
        //        Taco.core.StateManager.attemptNavigate(this.editorRoute + '/' + record.getId(), complexMetaData);
        //    }, 1, this);
        //},
});
