/**
 * @class Taco.view.publishing.grid.Draft
*/
Ext.define('Taco.view.publishing.grid.Publish', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.publishlist',

    requires: [
        'Taco.model.PublishSet',
        'Taco.store.PublishSets',
        'Taco.view.publishing.advancedSearchForm.Publish',
        'Ext.Date',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.view.publishing.modal.CreatePublishSet',
        'Taco.core.ux.window.Modal'
    ],

    margin: '30 0 0 0',

    launchEditorOnClick: false,

    border: false,

    modelName: 'Taco.model.PublishSet',

    enableNavHeader: false,

    addContentViewPadding: true,
    id: 'publishList',

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: 'Create New Publish Set',

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: this.title,

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.publishing.advancedSearchForm.Publish'
    },

    onCreate: Ext.emptyFn,
    itemId: 'publish-grid',

    stateful: true,
    stateId: 'statefulPublishSetGrid',
    layout: 'fit',
        
    initComponent: function () {

        this.store = Ext.create(this.storeConfig.name, this.storeConfig.options);
        
        this.columns = this.getColumnConfig();

        this.callParent(arguments);

        if (this.isPicker) {
            this.addCreateButton();
        }

        // this.getSelectionModel().on('select', this.fireSelectionEvent, this, {single: false});
    },

    // fireSelectionEvent: function() {
    //     this.up('gridwrapper').down('#taco-publishset-button').enable();
    // },

    addCreateButton: function() {
        this.down('toolbar').insert({
            xtype: 'button',
            ui: 'action-primary',
            scale: 'medium',
            itemId: 'createActionButton',
            text: 'Create New Publish Set',
            margin: '0 0 0 10',
            handler: this.showCreateModal,
            scope: this
        });
    },

    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'name',
                    stateId: 'name',
                    text: 'Name',
                    hideable: false
                }, 
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'code',
                    stateId: 'id',
                    text: 'Code',
                    hideable: false
                }, 
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'totalCount',
                    stateId: 'totalCount',
                    width: 100,
                    text: 'Count'
                }, 
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'publishDate',
                    stateId: 'publishDate',
                    width: 100,
                    text: 'Publish Date',
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'createDate',
                    stateId: 'createDate',
                    width: 100,
                    text: 'Created Date',
                    hidden: true,
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'updateBy',
                    stateId: 'modifiedBy',
                    width: 100,
                    text: 'Modified By',
                    hidden: true,
                    renderer: this.getAssociatedUserName
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastPublished',
                    stateId: 'lastPublished',
                    width: 100,
                    text: 'Last Published',
                    hidden: true,
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastPublishedBy',
                    stateId: 'lastPublishedBy',
                    width: 100,
                    text: 'Last Published By',
                    hidden: true,
                    renderer: this.getAssociatedUserName
                }
                // {
                //     xtype: 'gridcolumn',
                //     dataIndex: 'masterCatalog',
                //     stateId: 'masterCatalog',
                //     width: 100,
                //     text: 'Master Catalog',
                //     hidden: true
                // }
            ];

        if (!this.isPicker) {
            columns.push({
                xtype: 'taco.menucolumn',
                text: 'Actions',

                onMenuShow: function(cmp, eventData) {
                    var editMenuColumn = cmp.down('#edit-publish-set'),
                        deleteMenuColumn = cmp.down('#delete-publish-set');

                    deleteMenuColumn[eventData.record.get('code').toLowerCase() === 'unassigned' ? 'disable' : 'enable']();
                    editMenuColumn[eventData.record.get('code').toLowerCase() === 'unassigned' ? 'disable' : 'enable']();
                },

                menuItems: [
                    {
                        text: 'Edit',
                        itemId: 'edit-publish-set',
                        menuColumnHandler: this.showEditModal
                    },
                    {
                        text: 'Manage Contents',
                        menuColumnHandler: function(item, eventData) {
                            this.scope.up('publish-split').getEast2().expand();
                        },
                        scope: this
                    },
                    {
                        text: 'Publish Now',
                        menuColumnHandler: function(item, eventData) {
                            me.getConfirmationModal({
                                header: 'Publish ' + eventData.record.get('name'),
                                message: 'Are you sure you want to publish all drafts associated with this publish set?',
                                callback: me.onPublishSetPublish.bind(me, item, eventData)
                            });
                        }
                    },
                    {
                        text: 'Delete',
                        itemId: 'delete-publish-set',
                        menuColumnHandler: function(item, eventData) {
                            var totalRecords = eventData.record.get('productCount') + eventData.record.get('contentCount');

                            if (totalRecords > 0) {

                                me.getConfirmationModal({
                                    header: 'Delete Publish Set Options',
                                    message: 'Would you like to discard all associated drafts, or move all drafts to unassigned?',
                                    primaryOptions: {
                                        text: 'Discard Drafts',
                                        handler: me.onPublishSetDelete.bind(me, 'discard', item, eventData)
                                    },
                                    secondaryOptions: {
                                        text: 'Unassign Drafts',
                                        handler: me.onPublishSetDelete.bind(me, 'unassign', item, eventData)
                                    }
                                });
                            }

                            else {

                                me.getConfirmationModal({
                                    header: 'Delete ' + eventData.record.get('name'),
                                    message: 'Are you sure you want to delete this publish set?',
                                    callback: me.onPublishSetDelete.bind(me, null, item, eventData)
                                });
                            }
                
                        },
                    }
                ]
            });
        }
    
        return columns;
    },

    getAssociatedUserName: function(value){
        var user = Ext.Array.findBy(window.Taco.siteUsersRaw, function(u) { return u.id === value; });

        if (!user) return ' ';

        return Ext.String.format('{0} {1}', user.firstName, user.lastName);
    },

    onPublishSetDelete: function(method, item, eventData) {

        if (method === 'unassign' || method === 'discard') {
            Taco.model.PublishSet.doDelete({
                data: [eventData.record.data],
                method: method,
                success: function() {
                    eventData.record.store.read();
                },
                failure: this.showMessage.bind(this, 'There was an error deleting this publish set!', 'error')
            });
        }

        else {
             eventData.record.destroy({
                failure: this.showMessage.bind(this, 'There was an error deleting this publish set!', 'error')
            });
        }
       
    },

    onPublishSetPublish: function(item, eventData) {
        Taco.model.PublishSet.publishAll({
            data: [eventData.record.data],
            success: function() {
                eventData.record.store.read();
            },
            failure: this.showMessage.bind(this, 'There was an error publishing this publish set!', 'error')
        });
    },

    showEditModal: function(item, eventData) {
        Ext.create('Taco.view.publishing.modal.CreatePublishSet', {
            record: eventData.record,
            callback: function() {
                eventData.record.store.reload();
            },
            isEdit: true
        }).show();
    },
    

    showCreateModal: function() {
        var modal = Ext.create('Taco.view.publishing.modal.CreatePublishSet');
        modal.show();
    },

    getConfirmationModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: config.primaryOptions ? config.primaryOptions.text : 'Confirm',
            secondaryText: config.secondaryOptions ? config.secondaryOptions.text : 'Cancel',
            primaryHandler: function() {
                if (config.primaryOptions) {
                    config.primaryOptions.handler();
                }

                else {
                    config.callback();
                }

                this.save();
            },
            secondaryHandler: function(){
                if (config.secondaryOptions) config.secondaryOptions.handler();
                this.close();
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
        Taco.app.fireEvent('setmessage', msg, type);
    }

});