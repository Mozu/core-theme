/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.provisioning.Index', {
    extend: 'Taco.core.ux.content.Container',

    requires: [
        'Taco.core.context.StoreItem',
        'Taco.model.Provisionable',
        'Taco.view.provisioning.SiteProvisionerModal',
        'Taco.view.provisioning.CatalogProvisionerModal'
    ],

   
    initComponent: function () {

        var siteData = [];


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


        this.siteStore = Ext.create('Ext.data.Store', {
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


        this.mon(this.catalogTreeStore, 'load', this.onCatealogTreeStoreLoad, this);
        this.mon(this.siteStore, 'load', this.onSiteStoreLoad, this);


        
        var me = this;
        this.body = {
            layout: {
                type: 'hbox',
                align: 'stretch'
            
            },

            items:
            [          
                {
                    xtype: 'treepanel',
                    flex: 1,
                    margin: '0 10 0 0',
                    autoHeight: true,
                    store: this.catalogTreeStore,
                    rootVisible: false,
                    stateful: true,
                    stateId: 'statefulCatalogStructureGrid',

                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            padding: '0 0 10 0',
                            dock: 'top',
                            items: [{
                                    xtype: 'box',
                                    html: '<h3>Catalog Structure</h3>'
                                }, '->',
                                {
                                    xtype: 'button',
                                    ui: 'action-primary',
                                    scale: 'medium',
                                    text: 'Create',
                                    handler: function () { this.showCatalogModal({ itemType: 'mastercatalog' }); },
                                    scope: this
                                }]
                        }
                    ],
                    columns: [
                        { xtype: 'treecolumn', stateId: 'name', text: 'Name', dataIndex: 'name', flex: 1 },
                        { text: 'Currency', stateId: 'currency', dataIndex: 'defaultCurrencyCode' },
                        { text: 'Locale', stateId: 'locate', dataIndex: 'defaultLocaleCode' },
                        { text: 'Status', stateId: 'status', dataIndex: 'status' },
                        {
                            xtype: 'taco.menucolumn',
                            text: 'Actions',
                            menuItems: [                                       
                                {
                                    itemId: 'rename',
                                    text: 'Rename',
                                    hideOnClick: false,
                                    menuColumnHandler: function (item, eventData) {

                                        me.showRenameModal(eventData.record.raw);
                                    }
                                }, {
                                    itemId: 'Delete',
                                    text: 'Delete',
                                    hideOnClick: false,
                                    menuColumnHandler: function (item, eventData) {

                                        me.deleteEntity(eventData.record.raw);
                                    }
                                }
                            ]
                        }                    
                    ]
                },               
                {
                    xtype: 'grid',
                    flex: 1,
                    margin: '0 0 0 10',
                    autoHeight: true,
                    stateId: 'statefulSitesGrid',
                    stateful:true,
                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            padding: '0 0 10 0',
                            items: [{
                                    xtype: 'box',
                                    html: '<h3>Sites</h3>'
                                }, '->',
                                {
                                    xtype: 'button',
                                    ui: 'action-primary',
                                    scale: 'medium',
                                    handler: this.showSiteModal,
                                    scope: this,
                                    text: 'Create'
                                }]
                        }
                    ],
                    store: this.siteStore,
                    columns: [
                        { text: 'Name', stateId:"name",  dataIndex: 'name', flex: 1 },
                        { text: 'Currency', stateId: "defaultCurrencyCode", dataIndex: 'defaultCurrencyCode' },
                        { text: 'Locale', stateId: "defaultLocaleCode", dataIndex: 'defaultLocaleCode' },
                        { text: 'Status', stateId: "status", dataIndex: 'status' },
                        {
                            xtype: 'taco.menucolumn',
                            text: 'Actions',
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
                    ]
                }]
        };
        me.callParent(arguments);
        me.setTitle('Settings | Structure');

    },
    createMasterCatalogStore: function () {
        var rootNode = this.catalogTreeStore.getRootNode(),
            masterCats = rootNode.childNodes;


        return Ext.create('Ext.data.Store', {
            autoLoad: true,
            model: 'Taco.model.Provisionable',
            data: masterCats
        });
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
    showSiteModal: function (config) {

        var me = this,
            modal = Ext.create('Taco.view.provisioning.SiteProvisionerModal', {
                catalogStore: this.createCatalogStore(),
                listeners: {
                    savesuccess: function (site, request) {
                        me.provision({ jsonData: request, itemType: 'site' });

                    }
                }
            });


    },
    showCatalogModal: function (config) {
        var me = this,
            modal = Ext.create('Taco.view.provisioning.CatalogProvisionerModal', {                
                catalogType: config.itemType == config.itemType,
                masterCatalogStore: this.createMasterCatalogStore(),
                listeners: {
                    savesuccess: function (site, request) {
                        me.provision({ jsonData: request, itemType: request.itemType });

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
                        me.siteStore.reload();
                    } else {
                        me.catalogTreeStore.reload();
                        me.siteStore.reload();
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
                    me.siteStore.reload();
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
                            me.siteStore.reload();
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
                    me.siteStore.reload();
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

    onCatealogTreeStoreLoad: function (store) {
        var rootNode = store.getRootNode(),
            findFn = function (node) {
                if (node.raw.status == 'InProgress') {
                    return true;
                }
                if (node.childNodes) {
                    return Ext.Array.findBy(node.childNodes, findFn) != null;
                }
                return false;
            };

        if (Ext.Array.findBy(rootNode.childNodes, findFn) != null) {
            Ext.defer(store.reload, 5000, store);
        }
    },
    onSiteStoreLoad: function (store, record) {
        if (store.data.findBy(function (x) { return x.raw.status == 'InProgress'; })) {
            Ext.defer(store.reload, 5000, store);
        }
    }
    /*
      public const string ACTIVE = "Active";
      public const string INPROGRESS = "InProgress";
      public const string ERRORED = "Errored";
      public const string UNKNOWN = "Unknown";
      */
});