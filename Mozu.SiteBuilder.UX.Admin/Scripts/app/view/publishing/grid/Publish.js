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
        'Taco.core.ux.window.Modal',
        'Taco.view.Growl'
    ],

    margin: '0 0 0 0',

    launchEditorOnClick: false,

    border: false,

    modelName: 'Taco.model.PublishSet',

    enableNavHeader: false,

    addContentViewPadding: true,

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

        this.stateId = 'statefulPublishSetGrid';

        this.store = Ext.create(this.storeConfig.name, this.storeConfig.options);
        
        this.columns = this.getColumnConfig();

        this.callParent(arguments);

        this.getSelectionModel().on('select', this.fireSelectionEvent, this, {single: false});

        this.store.on('load', this.updateCard, this, {single: true});

    },

    listeners: {
        beforeitemdblclick: {
            fn: function(cmp) {
                cmp.up('publish-split').getEast().expand();
            }
        }
    },

    updateCard: function(store, records) {

        if (records.length > 0) {
      
            if (window.location.pathname.indexOf('/publishsets/') !== -1){
                var path = window.location.pathname,
                    id = path.substring(path.lastIndexOf('/') + 1, path.length);

                this.getSelectionModel().select(this.store.getById(id));

                this.up('publish-split').getEast().expand();
            }

            else {
                 this.up('publish-split').getEast().collapse();
            }
        }
        else {
            this.up('panel').getLayout().setActiveItem(1);
            this.up('publish-split').getEast().collapse();
        }
    },

    updateUrl: function(record) {

        var url = 'publishing/publishsets';

        if (record) {
            url += '/' + record.getId();
            //if were loading a page that is already in the url -- we dont need to add to history
            if (record.getId() !== window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1)) {
                Taco.app.StateManager.addState(url);
            }
        }
    },

    fireSelectionEvent: function(store, record, isDelete) {
        //override the paramater, EXT passes the id of the record, but we only recognize true or false;
        isDelete = isDelete !== true ? false : isDelete;
        
        var contentLayout = this.up('publish-split').down('tabpanel');

        this.updateUrl(record);

        if (!isDelete) {
            contentLayout.setTitle('<span style="font-weight:bold;">' + record.get('name') + '</span> <span style="color:#999;">Drafts</span>');
        }

        else {
            contentLayout.setTitle('<span>Publish Set Contents</span>');
        }

        contentLayout.down('#content').store.read({code: record.get('code'), type: 'cms'});
        contentLayout.down('#product').store.read({code: record.get('code'), type: 'product'});
    },

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
                    minWidth: 100,
                    flex: 3,
                    sortable: false
                }, 
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'code',
                    stateId: 'id',
                    text: 'Code',
                    flex: 2,
                    sortable: false
                }, 
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'totalCount',
                    stateId: 'totalCount',
                    columnWidth: 100,
                    text: 'Count',
                    flex: 2,
                    sortable: false
                }, 
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'publishDate',
                    stateId: 'publishDate',
                    columnWidth: 100,
                    text: 'Publish Date',
                    renderer: Ext.util.Format.dateRenderer('d M, Y'),
                    sortable: false
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'createDate',
                    stateId: 'createDate',
                    columnWidth: 100,
                    text: 'Created Date',
                    hidden: true,
                    renderer: Ext.util.Format.dateRenderer('d M, Y'),
                    sortable: false
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'updateBy',
                    stateId: 'modifiedBy',
                    columnWidth: 100,
                    text: 'Modified By',
                    hidden: true,
                    renderer: this.getAssociatedUserName,
                    sortable: false
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastPublished',
                    stateId: 'lastPublished',
                    columnWidth: 100,
                    text: 'Last Published',
                    hidden: true,
                    renderer: Ext.util.Format.dateRenderer('d M, Y'),
                    sortable: false
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastPublishedBy',
                    stateId: 'lastPublishedBy',
                    columnWidth: 100,
                    text: 'Last Published By',
                    hidden: true,
                    renderer: this.getAssociatedUserName,
                    sortable: false
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'status',
                    stateId: 'status`',
                    columnWidth: 100,
                    text: 'Status',
                    hidden: true,
                    sortable: false
                },
                {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',

                    onMenuShow: function(cmp, eventData) {
                        var publishNow = cmp.down('#publish-now');

                        publishNow[eventData.record.get('totalCount') > 0 ? 'enable' : 'disable']();
                    },

                    menuItems: [
                        {
                            text: 'Edit',
                            itemId: 'edit-publish-set',
                            menuColumnHandler: this.showEditModal
                        },
                        {
                            text: 'Manage Drafts',
                            menuColumnHandler: function(item, eventData) {
                                this.scope.up('publish-split').getEast().expand();
                            },
                            scope: me
                        },
                        {
                            text: 'Publish Now',
                            itemId: 'publish-now',
                            menuColumnHandler: function(item, eventData) {
                                me.getConfirmationModal({
                                    header: 'Publish Now',
                                    message: me.getPublishModalMessage(eventData.record),
                                    primaryOptions: {
                                        text: 'Yes, Publish Now',
                                        handler: me.onPublishSetPublish.bind(me, item, eventData),
                                    }
                                });
                            }
                        },
                        {
                            text: 'Delete',
                            itemId: 'delete-publish-set',
                            menuColumnHandler: function(item, eventData) {
                                var totalRecords = eventData.record.get('productCount') + eventData.record.get('contentCount');

                                if (totalRecords > 0) {
                                    me.getDeleteModal({
                                        msg: 'Would you like to discard all ' + eventData.record.get('totalCount') + ' drafts, or move all ' + eventData.record.get('totalCount') + ' drafts to unassigned?',
                                        discardFunc: me.onPublishSetDelete.bind(me, 'discard', item, eventData),
                                        unassignFunc: me.onPublishSetDelete.bind(me, 'unassign', item, eventData)
                                    });
                                }

                                else {
                                    me.getConfirmationModal({
                                        header: 'Delete ' + eventData.record.get('name'),
                                        message: 'Are you sure you want to delete this publish set?',
                                        primaryOptions: {
                                            text: 'Yes, Delete Publish Set',
                                            handler: me.onPublishSetDelete.bind(me, null, item, eventData),
                                        }
                                    });
                                }
                    
                            },
                        }
                    ]
            }
        ];
    
        return columns;
    },

    getPublishModalMessage: function(record) {
        var message,
            word = record.get('totalCount') === 1 ? record.get('totalCount') + ' Draft' : record.get('totalCount') + ' Drafts';

        if (record.get('publishDate')) {
            message = 'The ' + record.get('name') + ' Publish Set contains ' + word + ' and is currently scheduled to go live on ' + Ext.util.Format.date(record.get('publishDate'), 'm/d/Y g:i a');
        } 

        else {
            message = 'The ' + record.get('name') + ' Publish Set contains ' + word + '.';
        }
        
        message+= ' <br><br>Are you sure you want to publish ' + word + '?';

        return message;

    },

    getAssociatedUserName: function(value){
        var user = Ext.Array.findBy(window.Taco.siteUsersRaw, function(u) { return u.id === value; });

        if (!user) return ' ';

        return Ext.String.format('{0} {1}', user.firstName, user.lastName);
    },

    onPublishSetDelete: function(method, item, eventData) {

        var me = this;

        if (method === 'unassign' || method === 'discard') {
            Taco.model.PublishSet.doDelete({
                data: [eventData.record.data],
                method: method,
                success: function() {
                    eventData.record.store.read();
                    me.fireSelectionEvent(null, eventData.record, true);
                    me.up('publish-split').showGrowl('Deleted');
                },
                failure: this.showMessage.bind(this, 'There was an error deleting this publish set!', 'error')
            });
        }

        else {
            eventData.record.destroy({
                failure: this.showMessage.bind(this, 'There was an error deleting this publish set!', 'error'),
                success: function() {
                    me.up('publish-split').showGrowl('Deleted');
                    me.fireSelectionEvent(null, eventData.record, true);
                }
            });
        }
       
    },

    onPublishSetPublish: function(item, eventData) {
        var me = this;
        Taco.model.PublishSet.publishAll({
            data: [eventData.record.data],
            success: function() {
                me.up('publish-split').showGrowl('Scheduled to Publish', 'info');
                eventData.record.store.read();
            },
            scope: this,
            failure: this.showMessage.bind(this, 'There was an error publishing this publish set!', 'error')
        });
    },

    showConfirmation: function(eventData) {
        this.getConfirmationModal({
            header: 'Publish ',
            message: eventData.record.get('name') + ' has been scheduled to publish',
            primaryOptions: {
                text: 'Ok',
                handler: function() {}
            },
            beforeShowFunction: function(cmp){
                cmp.down('button').hide();
            }
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

    getDeleteModal: function(config) {
        
        var modal = Ext.create('Taco.core.ux.window.Modal', {
                scale: 'small',
                title: 'Delete Publish Set',
                modal: true,
                closeAction: 'destroy',
                height: 250,
                width: 470,
                actions: [
                    {
                        ui: 'action',
                        scale: 'medium',
                        text: 'Cancel',
                        handler: function() {
                            this.close();
                        }
                    },
                    {
                        xtype: 'splitbutton',
                        ui: 'action-primary',
                        scale: 'medium',
                        text: 'Yes, Delete',
                        menu: {
                            plain: true,
                            shadow: false,
                            items: [{
                            text: 'Delete and Discard Drafts',
                                scope: this,
                                plain: true,
                                handler: function () {
                                    modal.close();
                                    config.discardFunc();
                                }
                            }
                            ]
                        },
                        handler: function() {
                            this.close();
                            config.unassignFunc();
                        }
                    }
                ],
                items: [{
                    xtype: 'container',
                    layout: { 
                        type: 'hbox' 
                    },
                    items: [
                        Ext.create('Ext.panel.Panel', {
                            width: '100%',
                            html: config.msg
                        })
                    ]
                }]
            }).show();
    },

    getConfirmationModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 250,
            width: 470,
            beforeShowFunction: config.beforeShowFunction,
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
            }],
            listeners:  {
                beforeshow: function(cmp) {
                    if (this.beforeShowFunction) this.beforeShowFunction.call(this, cmp);
                }
            }
        }).show();
    },

    showMessage: function(msg, type) {
        Taco.app.fireEvent('setmessage', msg, type);
    }
});