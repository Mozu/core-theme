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
        'Taco.view.publishing.modal.PublishSetPicker',
        'Taco.view.Growl'
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
    layout: 'fit',
    initComponent: function () {

        this.stateId = this.statefulId; 

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
                        this.searchToolbar.items.get('bulkActions')[selected.length > 0 ? 'enable': 'disable']();
                    }
                }
            }
        });

        this.store.on('load', this.updateTabPanelIdentifiers, this, {single: false});


        this.callParent(arguments);

        if (!this.hideSearchToolbar) this.addBulkActions();

        this.on('afterrender', this.updateStyles, this, {single: true});
    },

    updateStyles: function() {
        this.up('tabpanel').body.dom.style.border = 'none';
    },

    updateTabPanelIdentifiers: function(store, records) {
        var index = store.type === 'product' ? 0 : 1,
            text = store.type === 'product' ? 'Product (' + records.length + ')': 'Content (' + records.length + ')';

        if (this.up('tabpanel').tabBar) {
            this.up('tabpanel').tabBar.items.items[index].setText(text);
        }
    },

    addBulkActions: function() {

        this.searchToolbar.insert(0, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            itemId: 'bulkActions',
            text: 'Bulk Actions',
            margin: '0 10 0 0',
            hidden: false,
            disabled: true,
            onMenuShow: function(cmp, eventData) {
                var selection = eventData.scope.up('grid').getSelectionModel().getSelection(),
                    allAreUnassigned = selection.every(function(rec) {return rec.get('publishSetCode') === '';});

                cmp.down('#Remove')[allAreUnassigned ? 'hide' : 'show']();
            },  
            menu: [
                {
                    itemId: 'Publish',
                    text: 'Publish Now',
                    scope: this,
                    handler: function (item, eventData) {

                        var selection = item.scope.selModel.getSelection(),
                            name = selection.length === 1 ? selection[0].get('name') : undefined,
                            msg = selection.length === 1 ? 'Are you sure you\'d like to publish the  ' + name + ' Draft?' : 'Are you sure you\'d like to publish the selected Drafts?';


                        this.getConfirmationModal({
                            message: msg,
                            callback: this.doBulkAction.bind(this, item),
                            header: 'Publish Now',
                            primaryText: 'Yes, Publish Now'
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


                        var me = this,
                            selection = item.scope.selModel.getSelection(),
                            name = selection.length === 1 ? selection[0].get('name') + ' Draft' : 'Drafts';

                        if (selection.length === 1) {
                            this.getPublishSetName(selection[0], function(res){

                                var pubsetName = res.items && res.items.length > 0 ? res.items[0].name : ' Publish Set';

                                me.getConfirmationModal({
                                    message: 'Are you sure want to remove the ' + name + ' from the ' + pubsetName + '?',
                                    callback: me.doBulkAction.bind(me, item),
                                    header: 'Remove From Publish Set',
                                    primaryText: 'Yes, Remove'
                                });
                            });
                        }
                        
                        else {
                            this.getConfirmationModal({
                                message: 'Are you sure want to removed the selected Drafts from their corresponding Publish Sets?',
                                callback: this.doBulkAction.bind(this, item),
                                header: 'Remove From Publish Set',
                                primaryText: 'Yes, Remove'
                            });
                        }
                    }
                },
                {
                    itemId: 'Discard',
                    text: 'Discard Drafts',
                    scope: this,
                    handler: function (item, eventData) {
                        var total = item.scope.selModel.getSelection().length,
                            prefix = total === 1 ? 'this ' : 'these ',
                            word = total === 1 ? ' Draft?' : ' Drafts?';
                        this.getConfirmationModal({
                            message: 'Are you sure you\'d like to discard ' + prefix + total + word,
                            callback: this.doBulkAction.bind(this, item),
                            header: 'Discard Drafts',
                            primaryText: 'Yes, Discard'
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
                    minWidth: 100,
                    text: 'Name',
                    flex: 2,
                    sortable: gridType === 'product'
                }, 
                publishSetCode: {
                    type: 'gridcolumn',
                    dataIndex: 'publishSetCode',
                    stateId: 'publishSetCode',
                    columnWidth: 100,
                    text: 'Publish Set Code',
                    flex: 2,
                    sortable: false
                },
                draftUpdateDate: {
                    xtype: 'gridcolumn',
                    dataIndex: 'draftUpdateDate',
                    stateId: 'draftUpdateDate',
                    columnWidth: 100,
                    text: 'Last Modified',
                    renderer: Ext.util.Format.dateRenderer('d M, Y'),
                    flex: 2,
                    sortable: true
                },
                updatedBy: {
                    xtype: 'gridcolumn',
                    dataIndex: 'updatedBy',
                    stateId: 'updatedBy',
                    columnWidth: 100,
                    text: 'Modified By',
                    renderer: this.getAssociatedUserName,
                    sortable: false
                },
                id: {
                    xtype: 'gridcolumn',
                    dataIndex: 'id',
                    stateId: 'id',
                    text: 'ID',
                    columnWidth: 100,
                    hidden: true, 
                    sortable: false
                },
                productCode: {
                    xtype: 'gridcolumn',
                    dataIndex: 'id',
                    stateId: 'id',
                    text: 'Product Code',
                    columnWidth: 100,
                    hidden: true,
                    sortable: true
                },
                type: { 
                    xtype: 'gridcolumn',
                    dataIndex: 'type',
                    stateId: 'type',
                    columnWidth: 100,
                    text: 'Type',
                    hidden: true,
                    sortable: false
                }, 
                lastPublished: {
                    xtype: 'gridcolumn',
                    dataIndex: 'draftUpdateDate',
                    stateId: 'lastPublished',
                    text: 'Last Published',
                    hidden: true,
                    columnWidth: 100,
                    renderer: Ext.util.Format.dateRenderer('d M, Y'),
                    sortable: false
                },
                lastPublishedBy: {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastPublishedBy',
                    stateId: 'lastPublishedBy',
                    text: 'Last Published By',
                    columnWidth: 100,
                    hidden: true,
                    sortable: false
                },
                modification: {
                    xtype: 'gridcolumn',
                    dataIndex: 'publishType',
                    stateId: 'modification',
                    text: 'Modification',
                    columnWidth: 100,
                    hidden: true,
                    sortable: false
                },
                added: {
                    xtype: 'gridcolumn',
                    dataIndex: 'added',
                    stateId: 'added',
                    text: 'Added',
                    columnWidth: 100,
                    hidden: true,
                    sortable: false
                },
                addedBy: {
                    xtype: 'gridcolumn',
                    dataIndex: 'addedBy',
                    stateId: 'addedBy',
                    text: 'Added By',
                    columnWidth: 100,
                    hidden: true,
                    sortable: false
                },
                catalogId: {
                    xtype: 'gridcolumn',
                    dataIndex: 'catalogId',
                    stateId: 'catalogId',
                    text: 'Catalog Id',
                    columnWidth: 100,
                    hidden: true,
                    sortable: false
                }, 
                listFQN: {
                    xtype: 'gridcolumn',
                    dataIndex: 'listFQN',
                    stateId: 'listFQN',
                    text: 'List Name',
                    columnWidth: 100,
                    sortable: false
                },    
                siteId: {
                    xtype: 'gridcolumn',
                    dataIndex: 'siteId',
                    stateId: 'siteId',
                    text: 'Site ID',
                    columnWidth: 100,
                    hidden: true,
                    sortable: false
                },     
                publishSetName:  {
                    xtype: 'gridcolumn',
                    dataIndex: 'publishSetName',
                    stateId: 'publishSetName',
                    text: 'Publish Set Name',
                    columnWidth: 100,
                    sortable: false
                },         
                actions: {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',

                    onMenuShow: function(cmp, eventData) {
                        var removeMenuColumn = cmp.down('#Remove'),
                            editMenuColumn = cmp.down('#edit-draft'),
                            showInPublishSet = cmp.down('#show-in-publish-set'),
                            editable = eventData.record.get('listFQN').toLowerCase() === 'pagetemplatecontent@mozu' || eventData.record.get('listFQN').toLowerCase() === 'pages@mozu' || eventData.record.get('type').toLowerCase() === 'product';
                        
                        editMenuColumn.setText(me.setEditColumnText(eventData.record));
                        removeMenuColumn[eventData.record.get('publishSetCode') ? 'show' : 'hide']();
                        editMenuColumn[editable ? 'show' : 'hide']();
                        
                        if (showInPublishSet) showInPublishSet[eventData.record.get('publishSetCode') ? 'show' : 'hide']();
                    },

                    menuItems: this.getMenuItems.apply(this)
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
                    col.publishSetName,
                    col.draftUpdateDate,
                    col.listFQN,
                    col.updatedBy,
                    col.lastPublished,
                    col.modification,
                    col.siteId,
                    col.type,
                    col.actions,
                ],
                product: [
                    col.name,
                    col.publishSetCode,
                    col.publishSetName,
                    col.draftUpdateDate,
                    col.updatedBy,
                    col.productCode,
                    col.lastPublished,
                    col.lastPublishedBy,
                    col.modification,
                    col.actions
                ]
            }
        };

        return columns[parentContainer][gridType];
    },

    getMenuItems: function() {

        var me = this,

            menuItems =  [{
                text: 'Edit',
                itemId: 'edit-draft',
                menuColumnHandler: this.showEditPage.bind(this)
            }];

        if (this.scope.stateId !== 'taco-publish-sets'){
            menuItems.push({
                text: 'Show in Publish Set',
                itemId: 'show-in-publish-set',
                menuColumnHandler: this.showInPublishSet.bind(this)
            });
        }

        menuItems = menuItems.concat([
            {
                text: 'Move to Publish Set',
                menuColumnHandler: this.doMoveBulk.bind(this)
            },
            {
                text: 'Remove from Publish Set',
                itemId: 'Remove',
                menuColumnHandler: function(item, eventData) {

                    if (eventData.record.get('publishSetCode')) {
                        me.getPublishSetName(eventData.record, function(res) {

                            var name = res.items && res.items.length > 0 ? res.items[0].name : 'this';

                            me.getConfirmationModal({
                                message: 'Are you sure you want to remove ' + eventData.record.get('name') + ' from the ' + name + ' Publish Set?',
                                callback: me.doRemoveBulk.bind(me, item, eventData),
                                header: 'Remove from Publish Set'
                            });
                        });
                    }

                    else {
                        me.doRemoveBulk.call(me, item, eventData);
                    }
                },
                scope: me
            },
            {
                text: 'Publish Now',
                menuColumnHandler: function(item, eventData) {

                    // this was removed per Jason Muxlow's most recent review
                    // if (eventData.record.get('publishSetCode')) {
                        me.getConfirmationModal({
                            message: 'Are you sure want to publish ' + eventData.record.get('name') + '?',
                            callback: me.doPublishBulk.bind(me, item, eventData),
                            header: 'Publish Now',
                            primaryText: 'Yes, Publish Now'
                        });
                    // }

                    // else {
                    //     me.doPublishBulk.call(me, item, eventData);
                    // }
                },
                scope: me
            },
            {
                text: 'Discard Draft',
                menuColumnHandler:  function(item, eventData) {
                    me.getConfirmationModal({
                        message: 'Are you sure want to discard the ' + eventData.record.get('name') + ' Draft?',
                        callback: me.doDiscardBulk.bind(me, item, eventData),
                        header: 'Discard Draft',
                        primaryText: 'Yes, Discard Now'
                    });
                }
            }
        ]);

        return menuItems;
    },
    getPublishSetName: function(record, callback) {
        Ext.Ajax.request({
            url: '/admin/app/publishsets/getBy/' + record.get('publishSetCode'),
            method: 'GET',
            success: function (res, status) {
                callback(JSON.parse(res.responseText));
            }
        }, this);
    },
    showInPublishSet: function(cmp, e) {
        Taco.app.StateManager.attemptNavigate('/publishing/publishsets/' + cmp.eventData.record.get('publishSetCode'));
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
                me.showGrowl('Published');
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
                me.showGrowl('Discarded');
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

        //if were a draft grid with an associated publish set store - i.e. the publish set view
        if (this.up('publish-split')) { 
            this.up('publish-split').down('#publish-grid').store.reload();
        }
       
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
        var growlMessage;

        if (!Ext.isArray(eventData.record)) {
            eventData.record.set('publishSetCode', code);

            growlMessage = '<span style="font-weight:bold;">Moved</span>';

            if (!this.up('publish-split')) growlMessage+= '<br><br><span><a style="color:white;" href="/admin/' + Taco.app.StateManager.getCurrentState().getMetaData().ctx + '/publishing/publishsets/' + code + '">View in Publish Set</a></span>';

            this.showGrowl(code === 'unassigned' ? 'Removed' : growlMessage);
            eventData.record.store.sync({
                callback: this.onAfterRecordUpdate.bind(this, eventData.record.store)
            });
        }

        else {
            eventData.record.forEach(function(rec){
                rec.set('publishSetCode', code);
            });
            
            growlMessage = '<span style="font-weight:bold;">Moved</span>';

            if (!this.up('publish-split')) growlMessage+= '<br><br><span><a style="color:white;" href="/admin/' + Taco.app.StateManager.getCurrentState().getMetaData().ctx + '/publishing/publishsets/' + code + '">View in Publish Set</a></span>';

            this.showGrowl(code === 'unassigned' ? 'Removed' : growlMessage);
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

    showGrowl: function(msg) {
        Taco.app.fireEvent('setgrowl', msg, null, 2000);
    },

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
    }
});