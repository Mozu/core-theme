/**
 * @class Taco.view.publishing.grid.Draft
*/
Ext.define('Taco.view.publishing.grid.Draft', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.draftpublishlist',
    requires: [
        'Ext.Date',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.core.ux.window.Modal',
        'Taco.model.PublishSetItem',
        'Taco.store.PublishSetItems',
        'Taco.view.publishing.advancedSearchForm.Publish',
        'Taco.view.publishing.advancedSearchForm.DraftContent',
        'Taco.view.publishing.advancedSearchForm.DraftProduct',
        'Taco.view.publishing.modal.PublishSetPicker'
    ],
    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },
    launchEditorOnClick: false,
    modelName: 'Taco.model.PublishSetItem',
    enableNavHeader: false,
    addContentViewPadding: true,
    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    showActionsColumn: true,
    hideSearchToolbar: false,
    title: this.title,
    autoScroll: true,
    enableQuickFilters:false,
    onCreate: Ext.emptyFn,
    stateful: true,
    stateId: 'statefulPublishSetGrid',
    initComponent: function () {
        console.log(this.advancedFormCls)
        this.advancedSearchConfig = {advancedFormCls: this.advancedFormCls};

        this.itemId = this.title.toLowerCase(); //establish the grid as either product or content
        
        this.store = Ext.create(this.storeConfig.name, this.storeConfig.options);
        
        this.columns = this.getColumnConfig(this.itemId, this.type);

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            ignoreRightMouseSelection: true,
            headerWidth: 37,
            listeners: {
                selectionchange: {
                    scope: this,
                    fn: function (selModel, selected) {
                        this.searchToolbar.items.get('bulkActions').setVisible(selected.length > 1);
                    }
                }
            }
        });


        this.callParent(arguments);

        if (!this.hideSearchToolbar) this.addBulkActions();
    },

    addBulkActions: function() {

        this.searchToolbar.insert(0, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            itemId: 'bulkActions',
            text: 'Bulk Actions',
            margin: '0 10 0 0',
            hidden: true,
            menu: [
                {
                    itemId: 'Publish',
                    text: 'Publish Now',
                    scope: this,
                    handler: function (item, eventData) {
                        this.getConfirmationModal({
                            message: 'Are you sure you\'d like to publish the selected drafts?',
                            callback: this.doBulkAction.bind(this, item),
                            header: 'Publish Drafts?'
                        });
                    }
                },
                {
                    itemId: 'Move',
                    text: 'Move to Publish Set',
                    scope: this,
                    handler: function (item, eventData) {
                        this.doBulkAction.call(this, item, eventData);
                    }
                },
                {
                    itemId: 'Remove',
                    text: 'Remove from Publish Set',
                    scope: this,
                    handler: function (item, eventData) {
                        this.doBulkAction.call(this, item);
                    }
                },
                {
                    itemId: 'Discard',
                    text: 'Discard Drafts',
                    scope: this,
                    handler: function (item, eventData) {
                        this.getConfirmationModal({
                            message: 'Are you sure you\'d like to discard the selected drafts?',
                            callback: this.doBulkAction.bind(this, item),
                            header: 'Discard Drafts?'
                        });
                    }
                }
            ]
        });
    },

    getColumnConfig: function (gridType, parentContainer) {

        var me = this,
            col = {
                name:   { 
                    xtype: 'gridcolumn',
                    dataIndex: 'name',
                    stateId: 'name',
                    columnWidth: 100,
                    text: 'Name'
                }, 
                publishSetCode: {
                    type: 'gridcolumn',
                    dataIndex: 'publishSetCode',
                    stateId: 'publishSetCode',
                    columnWidth: 100,
                    text: 'Publish Set'
                },
                draftUpdateDate: {
                    xtype: 'gridcolumn',
                    dataIndex: 'draftUpdateDate',
                    stateId: 'draftUpdateDate',
                    columnWidth: 100,
                    text: 'Last Modified',
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                },
                updatedBy: {
                    xtype: 'gridcolumn',
                    dataIndex: 'updatedBy',
                    stateId: 'updatedBy',
                    columnWidth: 100,
                    text: 'Modified By',
                    renderer: this.getAssociatedUserName
                },
                id: {
                    xtype: 'gridcolumn',
                    dataIndex: 'id',
                    stateId: 'id',
                    text: 'Id',
                    columnWidth: 100,
                    hidden: true
                },
                type: { 
                    xtype: 'gridcolumn',
                    dataIndex: 'type',
                    stateId: 'type',
                    columnWidth: 100,
                    text: 'Type',
                    hidden: true
                }, 
                lastPublished: {
                    xtype: 'gridcolumn',
                    dataIndex: 'draftUpdateDate',
                    stateId: 'lastPublished',
                    text: 'Last Published',
                    hidden: true,
                    columnWidth: 100,
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                },
                lastPublishedBy: {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastPublishedBy',
                    stateId: 'lastPublishedBy',
                    text: 'Last Published By',
                    columnWidth: 100,
                    hidden: true
                },
                modification: {
                    xtype: 'gridcolumn',
                    dataIndex: 'publishType',
                    stateId: 'modification',
                    text: 'Modification',
                    columnWidth: 100,
                    hidden: true
                },
                added: {
                    xtype: 'gridcolumn',
                    dataIndex: 'added',
                    stateId: 'added',
                    text: 'Added',
                    columnWidth: 100,
                    hidden: true
                },
                addedBy: {
                    xtype: 'gridcolumn',
                    dataIndex: 'addedBy',
                    stateId: 'addedBy',
                    text: 'Added By',
                    columnWidth: 100,
                    hidden: true
                },
                catalogId: {
                    xtype: 'gridcolumn',
                    dataIndex: 'catalogId',
                    stateId: 'catalogId',
                    text: 'Catalog Id',
                    columnWidth: 100,
                    hidden: true
                }, 
                listFQN: {
                    xtype: 'gridcolumn',
                    dataIndex: 'listFQN',
                    stateId: 'listFQN',
                    text: 'List Name',
                    columnWidth: 100
                },    
                siteId: {
                    xtype: 'gridcolumn',
                    dataIndex: 'siteId',
                    stateId: 'siteId',
                    text: 'Site ID',
                    columnWidth: 100,
                    hidden: true
                },         
                actions: {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',

                    onMenuShow: function(cmp, eventData) {
                        var removeMenuColumn = cmp.down('#remove-from-publish-set'),
                            editMenuColumn = cmp.down('#edit-draft'),
                            editable = eventData.record.get('listFQN').toLowerCase() === 'pagetemplatecontent@mozu' || eventData.record.get('listFQN').toLowerCase() === 'pages@mozu' || eventData.record.get('type').toLowerCase() === 'product';
                        
                        editMenuColumn.setText(me.setEditColumnText(eventData.record));
                        removeMenuColumn[eventData.record.get('publishSetCode').toLowerCase() === 'unassigned' ? 'disable' : 'enable']();
                        editMenuColumn[editable ? 'enable' : 'disable']();

                    },

                    menuItems: [
                        {
                            text: 'Edit',
                            itemId: 'edit-draft',
                            menuColumnHandler: this.showEditPage.bind(this)
                        }, 
                        {
                            text: 'Publish Now',
                            menuColumnHandler: this.doPublishBulk.bind(this)
                        },
                        {
                            text: 'Move to Publish Set',
                            menuColumnHandler: this.doMoveBulk.bind(this)
                        },
                        {
                            text: 'Remove from Publish Set',
                            itemId: 'remove-from-publish-set',
                            menuColumnHandler: this.doRemoveBulk.bind(this)
                        },
                        {
                            text: 'Discard Draft',
                            menuColumnHandler: this.doDiscardBulk.bind(this)
                        }
                    ]
                }
            };
        
        var columns = {
            'publish set contents': {
                content: [
                    col.name,
                    col.draftUpdateDate,
                    col.updatedBy,
                    col.type,
                    col.modification,
                    col.lastPublished,
                    col.added,
                    col.addedBy,
                    col.actions
                ],
                product: [
                    col.name,
                    col.draftUpdateDate,
                    col.updatedBy,
                    col.id,
                    col.lastPublished,
                    col.lastPublishedBy,
                    col.modification,
                    col.added,
                    col.addedBy,
                    col.actions
                ]
            },
            drafts: {
                content: [
                    col.name,
                    col.publishSetCode,
                    col.draftUpdateDate,
                    col.listFQN,
                    col.type,
                    col.modification,
                    col.updatedBy,
                    col.lastPublished,
                    col.siteId,
                    col.actions,
                ],
                product: [
                    col.name,
                    col.publishSetCode,
                    col.draftUpdateDate,
                    col.updatedBy,
                    col.id,
                    col.lastPublished,
                    col.lastPublishedBy,
                    col.modification,
                    col.actions
                ]
            }
        };

        return columns[parentContainer][gridType];
    },

    setEditColumnText: function(record) {
        var text = 'Preview';

        if (record.get('type') === 'product') {
            text = 'Edit';
        }

        return text;
    },

    getAssociatedUserName: function(value){
        var user = Ext.Array.findBy(window.Taco.siteUsersRaw, function(u) { return u.id === value; });

        if (!user) return ' ';

        return Ext.String.format('{0} {1}', user.firstName, user.lastName);
    },

    getBulkConfig: function(records) {
        var isArr = Ext.isArray(records),
            type = !isArr ? records.get('type') : records[0].get('type');


        return {
            records: isArr ? records.map(function(rec) { return rec.get('id'); }) : [records.get('id')],
            store: !isArr ? records.store : records[0].store,
            type: type
        };
    },

    doPublishBulk: function(item, eventData) {
        var me = this,
            config = this.getBulkConfig(eventData.record),
            func = config.type === 'product' ? 'publishCatalogBulk' : 'publishCMSBulk';

        Taco.model.PublishSetItem[func]({
            data: config.records,
            success: function() {
                config.store.read();
                me.updatePublishSetStore();
            },
            failure: this.showMessage.bind(this, 'There was an error publishing this draft!', 'error')
        });
    },

    doDiscardBulk : function(item, eventData) {
        var me = this,
            config = this.getBulkConfig(eventData.record),
            func = config.type === 'product' ? 'discardCatalogBulk' : 'discardCMSBulk';

        Taco.model.PublishSetItem[func]({
            data: config.records,
            success: function() {
                config.store.reload();
                me.updatePublishSetStore();
            },
            failure: this.showMessage.bind(this, 'There was an error discarding this draft!', 'error')
        });
    },

    doBulkAction: function(item) {
        var action = item.itemId,
            records = item.scope.selModel.getSelection(),
            method = 'do' + action + 'Bulk';

        this[method](item, {record: records}); 
    },

    showEditPage: function(item, eventData) {
        
        var record = eventData.record,
            route;

        if (record.get('type') === 'product') {
            Taco.app.context.setCurrentContext(Taco.app.context.findCatalog(record.get('masterCatalogId')), false);
            route = 'products/edit/' + record.get('id');
        }

        else if (record.get('listFQN').toLowerCase() === 'pagetemplatecontent@mozu') {
            Taco.app.context.setCurrentContext(Taco.app.context.findSite(record.get('siteId')), false);
            route = 'website/page/templates/' + record.get('name');
        }

        else {
            Taco.app.context.setCurrentContext(Taco.app.context.findSite(record.get('siteId')), false);
            route = 'website/page/' + record.get('name');
        }

        Taco.app.StateManager.attemptNavigate(route);
    },

    doMoveBulk: function(item, eventData) {
        var me = this,
            modal = Ext.create('Taco.view.publishing.modal.PublishSetPicker', {
            record: !Ext.isArray(eventData.record) ? eventData.record : eventData.record[0],
            callback: function(publishSetCode) {
                me.setPublishCode(item, eventData, publishSetCode);
            }
        });

        modal.show();
    },

    updatePublishSetStore: function() {
        var grid = this.up('publish-split').getEast().down('#publish-grid'),
            productStore = this.up('publish-split').getEast2().down('#product').store,
            contentStore = this.up('publish-split').getEast2().down('#content').store;

        // if the publish grid has a selection made, let's reload the publish set content grid
        if (grid.getSelectionModel().getSelection().length > 0) {
            contentStore.reload();
            productStore.reload();
        }

        //if an update occurrs on the publish set contents, we need to refresh draft grid
        if (this.type === 'publish set contents') { 
            this.up('publish-split').getWest().down('#product').store.reload();
            this.up('publish-split').getWest().down('#content').store.reload();
        }

        grid.store.reload();
       
    },

    onAfterRecordUpdate: function(recordStore, response) {

        if (response && response.hasException) {
            this.showMessage(Ext.JSON.decode(response.exceptions[0].error.responseText).message, 'error');
        }

        else {
            
            if (recordStore) recordStore.reload(); 
            this.updatePublishSetStore.call(this);
        }
    },

    setPublishCode: function(item, eventData, code) {

        if (!Ext.isArray(eventData.record)) {
            eventData.record.set('publishSetCode', code);
            eventData.record.store.sync({
                callback: this.onAfterRecordUpdate.bind(this, eventData.record.store)
            });
        }

        else {
            eventData.record.forEach(function(rec){
                rec.set('publishSetCode', code);
            });
            eventData.record[0].store.sync({
                callback: this.onAfterRecordUpdate.bind(this, eventData.record[0].store)
            });
        }
    },

    doRemoveBulk: function(item, eventData) {
        this.setPublishCode(item, eventData, 'unassigned');
    },

    showMessage: function(msg, type) {
        Taco.app.fireEvent('setmessage', msg, type);
    },

    getConfirmationModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: 'Confirm',
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
    }
});