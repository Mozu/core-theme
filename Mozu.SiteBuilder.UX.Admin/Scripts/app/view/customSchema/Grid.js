/**
 * @class Taco.view.customSchema.Grid
 */

Ext.define('Taco.view.customSchema.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.entityManagerGrid',
    requires: ['Taco.view.customSchema.AdvancedSearchForm'],
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
        advancedFormCls: 'Taco.view.customSchema.AdvancedSearchForm',
        quickFilterData: [],
        emptySearchText: 'Search',
        disableAdvancedSearch: true
    },

    initComponent: function () {
        var me = this;

        me.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');

        var getDefaultView = function (list) {

            var views = list
                ? list.views
                : [];

            if (!views || !Array.isArray(views) || views.length < 1) {
                return null;
            }

            else {
                return views[0];
            }

        };

        this.stateId = this.getStateFulId(getDefaultView(me.listMetaData));

        if (me.standaloneGrid) {
            this.applyViewConfig();
        }

        else {
            me.store = Ext.create('Taco.store.EntityLists', {
                entityType: this.entityType,
                autoLoad: false,
                remoteFilter: true,
                view: (getDefaultView(me.listMetaData) || {}).name
            });
        }

        if (this.siteBuilderList) {
            this.createRecord(this.listMetaData);
            this.initListView(this.record, null, getDefaultView(this.listMetaData));
        }

        me.callParent(arguments);
    },

    createRecord: function (data) {
        this.record = Ext.create('Taco.model.EntityList', {
            entityType: data.entityType,
            autoLoad: true,
            listFQN: data.listFQN,
            views: data.views || []
        });
    },

    applyViewConfig: function () {
        this.enableNavHeader = true;

        this.record = Ext.create('Taco.model.EntityList', {
            entityType: this.entityType,
            autoLoad: true,
            listFQN: this.listFQN,
            views: this.views
        });

        this.setTitle(this.listName);

        this.initListView(this.record, true);
    },

    getStateFulId: function (rec) {

        var fields = rec
            ? rec.fields
            : [];

        if (!this.listMetaData) {
            return 'customSchema-grid';
        }

        var start =
                this.listMetaData.get ?
                    this.listMetaData.get('entityType')
                        + this.listMetaData.get('name')
                        + this.listMetaData.get('listFQN')
                    : this.listMetaData.entityType
                        + this.listMetaData.name
                        + this.listMetaData.listFQN;

        if (!fields) return start;

        if (!fields.length || fields.length === 0) return start;

        else {
            var key = fields.map(function (rec) { return rec.name; }).join(',');
            return start + key;
        }
    },

    initListView: function (record, isSinglePage, view) {

        var me = this,
            metaData = this.buildColumns(record, null, view);

        if (me.rendered) {
            me.reconfigure(metaData.store, metaData.columns);
        } else {
            me.columns = metaData.columns;
            me.store = metaData.store;
        }

        me.store.on('load', me.updatePagerToolbar.bind(me, record, isSinglePage), me);

        me.on('cellclick', me.onCellClick, me);
    },

    updatePagerToolbar: function (record, isSinglePage) {
        var exisitingMenu = this.down('#taco-view-menu');

        if (record.get('views').length > 0) {

            var menu = Ext.widget('menu'),
                me = this;

            Ext.Array.each(record.get('views'), function (view) {
                menu.add({
                    text: view.name,
                    view: view,
                    handler: function (cmp) {
                        me.initListView(record, null, cmp.view);
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
                Ext.suspendLayouts();
                exisitingMenu.destroy();
                this.gridPager.insert(this.gridPager.items.getCount() - 2, this.viewMenu);
                Ext.resumeLayouts(true);
            }

            else {
                if ((me.gridPager && isSinglePage) || this.siteBuilderList) {
                    me.gridPager.on('change', function () {
                        var exisitingMenu = this.down('#taco-view-menu');
                        if (exisitingMenu) {
                            Ext.suspendLayouts();
                            exisitingMenu.destroy();
                            me.gridPager.insert(me.gridPager.items.getCount() - 2, me.viewMenu);
                            Ext.resumeLayouts(true);
                        }
                        else {
                            me.gridPager.insert(me.gridPager.items.getCount() - 2, me.viewMenu);
                        }
                    })
                }

                else {
                    me.gridPager.insert(me.gridPager.items.getCount() - 2, me.viewMenu);
                }
            }
        }
        if ((record.get('views').length === 0 || record.get('views').length === undefined) && exisitingMenu) {
            exisitingMenu.destroy();
        }
    },

    buildColumns: function (record, ignoreStore, view) {

        var me = this;
        var split = me.up('entity-split');
        var columns = [];
        var view;
        var store;

        this.listMetaData = record;

        if (record.get('entityType') === 'cms') {

            columns.push({
                xtype: 'gridcolumn',
                renderer: function (value, metaData, record) {
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
                renderer: function (value, metaData, record) {
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

        view = view || { fields: [] };

        Ext.Array.each(view.fields || [], function (viewField) {
            columns.push({
                xtype: 'gridcolumn',
                dataIndex: viewField.name,
                renderer: function (value, metaData, record) {
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
                renderer: function (value, metaData, record) {
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
                renderer: function (value, metaData, record) {
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
                renderer: function (value, metaData, record) {
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
                renderer: function (value, metaData, record) {
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
            onMenuShow: function (cmp, item) {
                var isPublishable = item.record.get('publishState') === 'draft';
                cmp.down('#publish-handler')[isPublishable ? 'enable' : 'disable']();
            },
            menuItems: [
                {
                    text: 'Edit',
                    hideOnClick: false,
                    menuColumnHandler: function (item, eventData) {
                        if (split) {
                            split.onItemEdit(eventData.grid, eventData.record, eventData.grid.listMetaData);
                        }

                        else if (eventData.grid.siteBuilderList) {

                            eventData.record.reload({
                                success: function () {
                                    me.record = eventData.record;
                                    me.saveButton.show();
                                    me.viewContainer.removeAll();
                                    me.grid = null;
                                    me.form = Ext.create('Taco.view.customSchema.DynamicFormContainer', {
                                        record: eventData.record,
                                        ui: 'subform-section',
                                        defaults: {
                                            margin: '10 10 10 10',
                                        },
                                        bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
                                        editor: me.editors.findEditor(eventData.record)
                                    });
                                    me.viewContainer.add(me.form);
                                }
                            });
                        }

                        else {
                            me.navigateToEdit(eventData.record);
                        }
                    }
                },
                {
                    text: 'Delete',
                    hideOnClick: false,
                    menuColumnHandler: function (item, eventData) {
                        me.deleteRecordFromStore(eventData.record);
                    }
                },
                {
                    text: 'Publish',
                    hideOnClick: false,
                    itemId: 'publish-handler',
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;

                        record.publish({
                            success: function () {
                                Taco.app.fireEvent('setmessage', 'Published', 'success');
                                eventData.grid.store.reload();
                            }
                        });
                    }
                }
            ]
        });

        if (Ext.util.Cookies.get('debugExt') || Ext.util.Cookies.get('debugext')) {
            columns[columns.length - 1].menuItems.push({
                text: 'Edit Raw',
                hideOnClick: false,
                menuColumnHandler: function (item, eventData) {
                    if (split) {
                        split.onItemEdit(eventData.grid, eventData.record, eventData.grid.listMetaData, {
                            editMode: 'raw'
                        });
                    }

                    else if (eventData.grid.siteBuilderList) {

                        eventData.record.reload({
                            success: function () {
                                me.record = eventData.record;
                                me.viewContainer.removeAll();
                                me.saveButton.show();
                                me.grid = null;
                                me.form = Ext.create('Taco.view.customSchema.DynamicFormContainer', {
                                    record: eventData.record,
                                    ui: 'subform-section',
                                    defaults: {
                                        margin: '10 10 10 10',
                                    },
                                    bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
                                    editMode: 'raw',
                                    editor: me.editors.findEditor(eventData.record)
                                });
                                me.viewContainer.add(me.form);
                            }
                        });
                    }

                    else {
                        me.navigateToEdit(eventData.record);
                    }
                }
            });
        }
        if (!ignoreStore) {
            store = Ext.create('Taco.store.Entities', {
                listName: record.get('listFQN'),
                entityType: record.get('entityType'),
                view: view.name,
                autoLoad: true,
                remoteSort: true,
                remoteFilter: true
            });
        }

        if (split) split.updateSearchContext(store);

        return {
            columns: columns,
            store: store
        };
    },

    navigateToEdit: function (record) {
        var me = this;

        if (record) {
            Taco.core.StateManager.attemptNavigate('customschema/edit?type=' + record.get('entityType') + '&list=' + record.get('listFQN') + '&record=' + record.get('id'), record.raw);
        }

        else {
            var record = Ext.create('Taco.model.Entity', {
                listFQN: me.listFQN,
                type: me.entityType,
                listFlags: {
                    enableADR: me.enableActiveDateRanges,
                    enablePublishing: me.enablePublishing
                }
            });

            Taco.core.StateManager.attemptNavigate('customschema/edit?type=' + this.entityType + '&list=' + this.listFQN, record.raw);
        }
    },

    deleteRecordFromStore: function (record) {
        record.destroy({
            success: function () {
                Taco.app.fireEvent('setmessage', 'Successfully deleted', 'success');
            },
            failure: function () {
                Taco.app.fireEvent('setmessage', 'An error occurred while trying to delete this record', 'error');
            }
        });
    },

    doCreate: function () {
        this.navigateToEdit();
    },

    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e) {

        //sigh, if we click a context menu, ignore it
        if (td.querySelector('.taco-grid-row-menu-trigger')) {
            return false;
        }

        var split = this.up('entity-split');
        var eventData = this.gridPager;
        var me = this;

        if (split) {
            split.onItemEdit(eventData.grid, record, eventData.grid.listMetaData);
        }

        else if (eventData.grid.siteBuilderList) {

            record.reload({
                success: function () {
                    me.record = record;
                    me.saveButton.show();
                    me.viewContainer.removeAll();
                    me.grid = null;
                    me.form = Ext.create('Taco.view.customSchema.DynamicFormContainer', {
                        record: record,
                        ui: 'subform-section',
                        defaults: {
                            margin: '10 10 10 10',
                        },
                        bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
                        editor: me.editors.findEditor(record)
                    });
                    me.viewContainer.add(me.form);
                }
            });
        }

        else {
            me.navigateToEdit(record);
        }
    }
});
