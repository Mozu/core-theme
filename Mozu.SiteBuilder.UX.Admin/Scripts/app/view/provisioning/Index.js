/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.provisioning.Index', {
    extend: 'Taco.core.ux.content.Container',

    requires: [
        'Taco.core.context.StoreItem',
        'Taco.model.Provisionable',
        'Taco.view.provisioning.SiteProvisionerModal',
        'Taco.view.provisioning.CatalogProvisionerModal',
        'Taco.core.ux.modal.Confirmation'
    ],

   
    initComponent: function () {

        var siteData = [];


        this.catalogTreeStore = Ext.create('Ext.data.TreeStore', {
            model: 'Taco.model.Provisionable',
            root: { path: "/" },
            proxy: {
                type: 'ajax',
                url: '/admin/app/provisioning/catalogs',
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                },
            },
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
                },
            },
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
                    width: '45%',
                    padding: 10,
                    xtype: 'treepanel',
                    autoHeight: true,
                    store: this.catalogTreeStore,
                    rootVisible: false,
                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [{
                                    xtype: 'box',
                                    html: '<h3>Catalog Structure</h3>'
                                }, '->',
                                {
                                    xtype: 'button',
                                    text: 'Create',
                                    handler: function () { this.showCatalogModal({ itemType: 'mastercatalog' }); },
                                    scope: this
                                }]
                        }
                    ],
                    columns: [
                        { xtype: 'treecolumn', text: 'Name', dataIndex: 'name', flex: 1 },
                        { text: 'Currency', dataIndex: 'defaultCurrencyCode' },
                        { text: 'Locale', dataIndex: 'defaultLocaleCode' },
                        { text: 'Status', dataIndex: 'status' },
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
                    padding: 10,
                    width: '45%',
                    xtype: 'grid',
                    autoHeight: true,
                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [{
                                    xtype: 'box',
                                    html: '<h3>Sites</h3>'
                                }, '->',
                                {
                                    xtype: 'button',
                                    handler: this.showSiteModal,
                                    scope: this,
                                    text: 'Create'
                                }]
                        }
                    ],
                    store: this.siteStore,
                    columns: [
                        { text: 'Name', dataIndex: 'name', flex: 1 },
                        { text: 'Currency', dataIndex: 'defaultCurrencyCode' },
                        { text: 'Locale', dataIndex: 'defaultLocaleCode' },
                        { text: 'Status', dataIndex: 'status' },
                        {
                            xtype: 'taco.menucolumn',
                            text: 'Actions',
                            menuItems: [
                                //{
                                         //    itemId: 'addnew',
                                         //    text: 'Add New',
                                         //    hideOnClick: false,
                                         //    menuColumnHandler: function (item, eventData) {


                                         //        alert('add new');
                                         //    }
                                         //},
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
                    ],                    
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
                    save: function (site, request) {
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
                    save: function (site, request) {
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
            items: [
                {
                    xtype: 'formform',
                    items: [
                        {                            
                            xtype: 'textfield',
                            name: 'name',
                            fieldLabel: 'Name',
                            value: entity.name,
                            allowBlank: false,
                            width: 400                         
                        }
                    ]
                }
            ],

            listeners: {
                save: function (modal) {
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
                    }
                },
                failure: function (response, opts) {
                    var respObj = Ext.decode(response.responseText, true),
                        errorMsg = respObj && respObj.message ? respObj.message : 'Failure Deleting';

                    Taco.app.fireEvent('setmessage', errorMsg, 'error');
                }
            };
        Ext.create('Taco.core.ux.modal.Confirmation', {
            text: 'You are about to delete "' +entity.name +'"!<br/>Are your sure you want to continue?',
            confirm: function () {
                confirm.close();
                Ext.Ajax.request(request);
            },
            autoShow: true
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