/**
 * @class Taco.view.priceList.Grid
*/
Ext.define('Taco.view.priceList.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.PriceList',
        'Taco.store.PriceLists',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn',
        'Ext.selection.CheckboxModel',
        'Taco.view.priceList.form.AdvancedSearch',
        'Taco.view.priceList.Form',
        'Taco.view.priceList.Edit'
    ],

    mixins: {

    },

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.PriceList',
    
    controllerName: 'PriceLists',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: 'Create New Price List',

    showActionsColumn: true,

    enableEditAction: false,
    //enableDisableAction: true,

    hideSearchToolbar: false,

    title: 'Price Lists',

    store: null,

    autoScroll: true,

    enableQuickFilters: false,

    enableBulkActions: true,
    enableDeleteAction: true,

    pageSize: 25,

    advancedSearchConfig : {
        form: null
    },

    onCreate: Ext.emptyFn,
    isDisabled: false,

    stateful: true,
    stateId: 'statefulPriceListGrid',

    statics: {

    },


    initComponent: function () {
        var me = this,
            model;

        this.columns = this.getColumnConfig();

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        model = Ext.ModelManager.getModel(me.modelName);
        me.createButtonEnabled = model.allowCreate();

        if (model.allowUpdate()) {
            this.selModel = Ext.create('Ext.selection.CheckboxModel', {
                selType: 'checkboxmodel',
                checkOnly: true,
                ignoreRightMouseSelection: true,
                headerWidth: 37
            });
            this.bulkActionConfig = this.getBulkActionsConfig();
        } else {
            this.enableBulkActions = false;
        }

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        me.mon(Taco.app, 'pricelistcreated', me.reloadGrid, me);

        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PriceLists',
            createOnly: true,
            pageSize: this.pageSize,
            autoLoad: true,
            clearFilters: true,
            remoteFilter: true
        });

        me.advancedSearchConfig.form = Ext.create('Taco.view.priceList.form.AdvancedSearch', {});

        me.callParent(arguments);
    },

    reloadGrid: function() {
        this.store.reload();
    },

    getColumnConfig: function () {
        var me = this;
        var columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'code',
                stateId: 'code',
                text: 'Code',
                hideable: true,
                flex: 1,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 2,                
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'parentName',
                stateId: 'parentName',
                text: 'Parent',
                hideable: true,
                flex: 2,
                sortable: false,
                renderer: function(val, metaData, record) {
                    var code = record.get('parentCode');
                    if (code) {
                        val += ' (' + code + ')';
                    }
                    return val;
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'validSitesDisplay',
                stateId: 'validSitesDisplay',
                text: 'Applied Sites',
                hideable: true,
                flex: 3,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'customerSegments',
                stateId: 'customerSegments',
                text: 'Customer Segments',
                hideable: true,
                flex: 3,
                sortable: false
            }
        ];
        //if (includeSiteColumn) {
        //    columns.push({
        //        xtype: 'gridcolumn',
        //        dataIndex: 'siteName',
        //        stateId: 'siteName',
        //        text: 'Site',
        //        hideable: true,
        //        flex: 1,
        //        sortable: false
        //    });
        //}
        return columns.concat([
            {
                xtype: 'gridcolumn',
                dataIndex: 'status',
                stateId: 'status',
                text: 'Status',
                flex:1,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'createDate',
                stateId: 'createDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Created Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'createByUser',
                stateId: 'createByUser',
                text: 'Created By',
                flex:1,
                hidden: true,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'lastModifiedDate',
                stateId: 'lastModifiedDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Last Modified Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'lastModifiedByUser',
                stateId: 'lastModifiedByUser',
                text: 'Last Modified By',
                flex:1,
                hidden: true,
                sortable: false
            }
        ]);
    },

    // list of actions to put in action column and context menu;
    getActionItems: function () {
        var me = this;
        return [
            {
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.PriceList',
                    behavior: 'read'
                },
                menuColumnHandler: me.doEdit,
                scope:me
            }, {
                text: 'Enable',
                itemId: 'enableMenuItem',
                requiredBehaviors: {
                    model: 'Taco.model.PriceList',
                    behavior: 'update'
                },
                menuColumnHandler: me.doEnableBulk,
                scope: me
            }, {
                text: 'Disable',
                itemId: 'disableMenuItem',
                requiredBehaviors: {
                    model: 'Taco.model.PriceList',
                    behavior: 'update'
                },
                menuColumnHandler: me.doDisableBulk,
                scope: me
            }, {
                text: 'Delete',
                itemId: "deleteMenuItem",
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: "deleteMenuColumnHandler",
                requiredBehaviors: {
                    model: 'Taco.model.PriceList',
                    behavior: 'destroy'
                },
                scope: me
            }
        ];
    },

    onActionMenuShow: function (menu, eventData) {
        var disableMenuItem = menu.down('#disableMenuItem'),
            enableMenuItem = menu.down('#enableMenuItem');
        if (!disableMenuItem || !enableMenuItem) {
            return;
        }
        if (eventData.record.get('enabled')) {
            disableMenuItem.show();
            enableMenuItem.hide();
        } else {
            enableMenuItem.show();
            disableMenuItem.hide();
        }
    },

    getBulkActionsConfig: function () {
        return {
            onMenuShow: function(selModel) {
                var selection = selModel.getSelection(),
                    disableBulkAction = this.down('#Disable'),
                    enableBulkAction = this.down('#Enable'),
                    allActive,
                    allInactive;

                allActive = Ext.Array.every(selection, function(item) {
                    return item.get('enabled');
                });

                if (allActive) {
                    disableBulkAction.setDisabled(false);
                    enableBulkAction.setDisabled(true);
                    return;
                }

                allInactive = Ext.Array.every(selection, function(item) {
                    return !item.get('enabled');
                });

                if (allInactive) {
                    enableBulkAction.setDisabled(false);
                    disableBulkAction.setDisabled(true);
                    return;
                }

                enableBulkAction.setDisabled(false);
                disableBulkAction.setDisabled(false);
            },
            actions: [
                {
                    itemId: 'Enable',
                    text: 'Enable',
                    scope: this,
                    requiredBehaviors: {
                        model: 'Taco.model.PriceList',
                        behavior: 'update'
                    },
                    handler: function (item, eventData) {
                        this.doBulkAction.call(this, item, eventData);
                    }
                },
                {
                    itemId: 'Disable',
                    text: 'Disable',
                    scope: this,
                    requiredBehaviors: {
                        model: 'Taco.model.PriceList',
                        behavior: 'update'
                    },
                    handler: function (item, eventData) {
                        var selection = item.scope.selModel.getSelection(),
                            name = selection.length === 1 ? selection[0].get('name') : undefined,
                            msg = selection.length === 1 ? 'Are you sure you\'d like to disable the  ' + name + ' price list?' : 'Are you sure you\'d like to disable the selected price lists?';


                        this.getConfirmationModal({
                            message: msg,
                            callback: this.doBulkAction.bind(this, item),
                            header: 'Disable Price Lists',
                            primaryText: 'Yes, Disable'
                        });
                    }
                }
            ]
        };
    },

    doBulkAction: function(item) {
        var action = item.itemId,
            records = item.scope.selModel.getSelection(),
            method = 'do' + action + 'Bulk';

        this[method](item, {record: records});
    },

    setPriceListEnabled: function(item, eventData, isActive) {
        if (!Ext.isArray(eventData.record)) {
            eventData.record.set('enabled', isActive);
        } else {
            eventData.record.forEach(function(rec){
                rec.set('enabled', isActive);
            });
        }
        if (isActive) {
            this.store.sync({
                callback: this.onAfterRecordEnabled.bind(this, eventData.record.store)
            });
        } else {
            this.store.sync({
                callback: this.onAfterRecordDisabled.bind(this, eventData.record.store)
            });
        }
        this.setLoading(true);
    },

    onAfterRecordUpdate: function(response, isActive) {
        var growlText = (isActive) ? 'Enabled' : 'Disabled',
            growlMessage = '<span style="font-weight:bold;">' + growlText + '</span>';

        this.setLoading(false);
        if (response && response.hasException) {
            this.showMessage(Ext.JSON.decode(response.exceptions[0].error.responseText).message, 'error');
        } else {
            this.showMessage(growlMessage);
            this.selModel.deselectAll();
            this.store.reload();
        }
    },

    onAfterRecordEnabled: function(recordStore, response) {
        this.onAfterRecordUpdate(response, true);
    },

    onAfterRecordDisabled: function(recordStore, response) {
        this.onAfterRecordUpdate(response, false);
    },

    doDisableBulk: function(item, eventData) {
        item.scope.setPriceListEnabled(item, eventData, false);
    },

    doEnableBulk: function(item, eventData) {
        item.scope.setPriceListEnabled(item, eventData, true);
    },

    getActionColumn: function () {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            };
        }

        return actionColumn;
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            this.openEditor(record, false);
        }, 1, this);
    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.openEditor(record, record.get('code'), false);
            //this.doEdit(record, e);
            //this.launchEditor(record);
            //Taco.app.StateManager.addState(this.controllerName + '/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doEdit : function (item, eventData) {
        var rec = eventData.record;
        item.scope.openEditor(rec, false);
    },

    openEditor: function (record, isNew) {
        var me = this;

        Ext.defer(function () {
            if (!isNew) {
                Taco.core.StateManager.attemptNavigate('priceLists/edit/' + record.getId(), {}); //{complexMetaData: {record: record}});
            } else {
                Taco.core.StateManager.attemptNavigate('priceLists/create', {});
            }
        }, 1, this);
        return;
    },

    doCreate : function (){
        this.openEditor(null, true);
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    },

    disablePriceLists: function () {
        var createActionButton = Ext.ComponentQuery.query('button[itemId=createActionButton]');
        if (createActionButton && createActionButton.length > 0) {
            createActionButton[0].setDisabled(true);
        }
        var advFilterButton = Ext.ComponentQuery.query('button[itemId=advancedFilter]');
        if (advFilterButton && advFilterButton.length > 0) {
            advFilterButton[0].setDisabled(true);
        }
    },

    //move to base class?
    getConfirmationModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: config.primaryText ? config.primaryText : 'Confirm',
            secondaryText: 'Cancel',
            primaryHandler: function() {
                config.callback();
                this.save();
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items: [
                    Ext.create('Ext.panel.Panel', {
                        width: '100%',
                        html: config.message
                    })
                ]
            }]
        }).show();
    },

    showMessage: function(msg, type) {
        Taco.app.fireEvent('setmessage', msg, type || 'success');
    }

});