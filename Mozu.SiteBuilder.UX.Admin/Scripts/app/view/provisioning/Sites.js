/**
 * @class Taco.view.product.Sites
 */
Ext.define('Taco.view.provisioning.Sites', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
        'Taco.core.context.StoreItem',
        'Taco.model.Provisionable',
        'Taco.view.provisioning.SiteProvisionerModal'
    ],

    modelName: 'Taco.model.Provisionable',

    title: 'Settings | Structure',

    addContentViewPadding: true,

    enableNavHeader: true,

    createButtonText: 'Create',

    createButtonEnabled: true,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    hideSearchToolbar: true,

    enableSearchBarInHeader: false,

    advancedSearchConfig: {
        emptySearch: 'Search'
    },
   
    initComponent: function () {

        var siteData = [];

        this.store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            model: 'Taco.model.Provisionable',
            proxy: {
                type: 'ajax',
                url: '/admin/app/provisioning/sites',
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                }
            }
        });

        this.catalogTreeStore = Ext.create('Ext.data.TreeStore', {
            model: 'Taco.model.Provisionable',
            root: { path: '/' },
            proxy: {
                type: 'ajax',
                url: '/admin/app/provisioning/catalogs',
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                }
            }
        });
        
        var me = this;
        // this.body = {
        //     layout: {
        //         type: 'hbox',
        //         align: 'stretch'
        //     },

        //     items:
        //     [          
        //         {
        //             xtype: 'grid',
        //             flex: 1,
        //             autoHeight: true,
        //             stateId: 'statefulSitesGrid',
        //             stateful:true,
        //             dockedItems: [
        //                 {
        //                     xtype: 'toolbar',
        //                     dock: 'top',
        //                     padding: '0 0 10 0',
        //                     items: [{
        //                             xtype: 'box',
        //                             html: '<h3>Sites</h3>'
        //                         }, '->',
        //                         {
        //                             xtype: 'button',
        //                             ui: 'action-primary',
        //                             scale: 'medium',
        //                             handler: this.showSiteModal,
        //                             scope: this,
        //                             text: 'Create'
        //                         }]
        //                 }
        //             ],
        //             store: this.siteStore,
        //             columns: [
        //                 { text: 'Name', stateId:"name",  dataIndex: 'name', flex: 1 },
        //                 { text: 'Currency', stateId: "defaultCurrencyCode", dataIndex: 'defaultCurrencyCode' },
        //                 { text: 'Locale', stateId: "defaultLocaleCode", dataIndex: 'defaultLocaleCode' },
        //                 { text: 'Status', stateId: "status", dataIndex: 'status' },
        //                 {
        //                     xtype: 'taco.menucolumn',
        //                     text: 'Actions',
        //                     menuItems: [
        //                         {
        //                             itemId: 'rename',
        //                             text: 'Rename',
        //                             hideOnClick: false,
        //                             menuColumnHandler: function (item, eventData) {
        //                                 eventData.record.raw.itemType = 'site';
        //                                 me.showRenameModal(eventData.record.raw);
        //                             }
        //                         }, {
        //                             itemId: 'Delete',
        //                             text: 'Delete',
        //                             hideOnClick: false,
        //                             menuColumnHandler: function (item, eventData) {
        //                                 eventData.record.raw.itemType = 'site';
        //                                 me.deleteEntity(eventData.record.raw);
        //                             }
        //                         }
        //                     ]
        //                 }
        //             ]
        //         }]
        // };

        me.store.on('load', me.onSiteStoreLoad, this, {single: true});

        this.columns = [
            { text: 'Name', stateId:"name",  dataIndex: 'name', flex: 1 },
            { text: 'Currency', stateId: "defaultCurrencyCode", dataIndex: 'defaultCurrencyCode' },
            { text: 'Locale', stateId: "defaultLocaleCode", dataIndex: 'defaultLocaleCode' },
            { text: 'Status', stateId: "status", dataIndex: 'status' },
            {
                xtype: 'taco.menucolumn',
                menuItems: [
                    {
                        itemId: 'rename',
                        text: 'Rename',
                        hideOnClick: false,
                        menuColumnHandler: function (item, eventData) {
                            eventData.record.raw.itemType = 'site';
                            me.showRenameModal(eventData.record.raw);
                        }
                    }, {
                        itemId: 'Delete',
                        text: 'Delete',
                        hideOnClick: false,
                        menuColumnHandler: function (item, eventData) {
                            eventData.record.raw.itemType = 'site';
                            me.deleteEntity(eventData.record.raw);
                        }
                    }
                ]
            }
        ];

        me.callParent(arguments);

    },

    doCreate: function() {
        this.showSiteModal();
    },
    showSiteModal: function (config) {

        var me = this,
            modal = Ext.create('Taco.view.provisioning.SiteProvisionerModal', {
                catalogStore: me.createCatalogStore(),
                listeners: {
                    savesuccess: function (site, request) {
                        me.provision({ jsonData: request, itemType: 'site' });

                    }
                }
            });


    },
    showRenameModal: function (entity) {
        var me = this;
        Ext.create('Taco.core.ux.window.Modal', {
            closeAction: 'destroy',
            autoShow: true,
            scale: 'small',
            title:'Rename',
            items: [{
                xtype: 'formform',
                layout: 'fit',
                items: [{
                    xtype: 'textfield',
                    name: 'name',
                    fieldLabel: 'Name',
                    value: entity.name,
                    allowBlank: false
                }]
            }],
            listeners: {
                savesuccess: function (modal) {
                    entity.name = modal.form.findField('name').getValue();
                    me.renameEntity(entity);

                }
            }
        });
    },
    deleteEntity: function (entity) {
        var me = this,
            request = {
                url: '/admin/app/provisioning/deleteEntity',
                method: "POST",
                jsonData: entity,
                success: function (response, opts) {
                    if (entity.itemType == 'site') {
                        me.store.reload();
                    } else {
                        me.catalogTreeStore.reload();
                        me.store.reload();
                    }
                },
                failure: function (response, opts) {
                    var respObj = Ext.decode(response.responseText, true),
                        errorMsg = respObj && respObj.message ? respObj.message : 'Failure Deleting';

                    Taco.app.fireEvent('setmessage', errorMsg, 'error');
                }
            };
            Ext.Msg.show({
                title: 'Delete',
                msg: ('<p style="padding-right: 1em;">Are you certain you want to delete the following?</p><ul style="margin-top: 1em;"><li>' +
                    entity.name + '</li></ul>'),
                buttons: Ext.Msg.YESNO,
                // buttonText: {yes: "Yes, delete it", no: "No, keep it"},
                closable: false,
                rightJustifyButtons: true,
                scope: this,
                fn: function (val) {
                    if (val === "yes") {
                        Ext.Ajax.request(request);
                    }
                }
            });
       
    },
    renameEntity: function (entity) {
        var me = this;
        var request = {
            url: '/admin/app/provisioning/renameEntity',
            method: "POST",
            jsonData: entity,
            success: function (response, opts) {
                if (entity.itemType == 'site') {
                    me.store.reload();
                } else {
                    me.catalogTreeStore.reload();
                }
            },
            failure: function (response, opts) {
                var respObj = Ext.decode(response.responseText, true),
                    errorMsg = respObj && respObj.message ? respObj.message : 'Failure renaming';

                Taco.app.fireEvent('setmessage', errorMsg, 'error');
            }
        };

        Ext.Ajax.request(request);
    },
    createCatalogStore: function () {
        var catalogs = [],
            rootNode = this.catalogTreeStore.getRootNode();

        Ext.Array.each(rootNode.childNodes, function (mcNode) {
            catalogs = catalogs.concat(mcNode.childNodes);
        });


        return Ext.create('Ext.data.Store', {
            autoLoad: true,
            model: 'Taco.model.Provisionable',
            data: catalogs
        });
    },
    provision: function (config) {
        var me = this;
        Ext.apply(config, {
            url: '/admin/app/provisioning/provision' + config.itemType,
            method: "POST",
            jsonData: config.jsonData,
            success: function (response, opts) {
                
                var json = Ext.decode(response.responseText);
                Ext.Ajax.request({
                    url: '/admin/app/provisioning/provisionCommit',
                    method: "POST",
                    jsonData: json,
                    success: function (response2, opts2) {
                        if (config.itemType == 'site') {
                            me.store.reload();
                        } else {
                            me.catalogTreeStore.reload();
                        }
                    },
                    failure: function (response2, opts2) {
                        var respObj = Ext.decode(response2.responseText, true),
                        errorMsg = respObj && respObj.message ? respObj.message : 'Failure Provisioning';

                        Taco.app.fireEvent('setmessage', errorMsg, 'error');
                    }
                });


                if (config.itemType == 'site') {
                    me.store.reload();
                } else {
                    me.catalogTreeStore.reload();
                }
            },
            failure: function (response, opts) {
                var respObj = Ext.decode(response.responseText, true),
                    errorMsg = respObj && respObj.message ? respObj.message : 'Failure Provisioning';

                Taco.app.fireEvent('setmessage', errorMsg, 'error');
            }
        });

        Ext.Ajax.request(config);
    },
    onSiteStoreLoad: function (store, record) {
        if (store.data.findBy(function (x) { return x.raw.status == 'InProgress'; })) {
            Ext.defer(store.reload, 5000, store);
        }
    }
});