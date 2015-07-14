/**
 * @class Taco.view.publishing.Split
 */


Ext.define('Taco.view.publishing.Split', {
    extend: 'Taco.core.ux.content.TripleSplitContainer',
    alias: [
        'widget.publish-split',
        'widget.publish.split'
    ],
    requires: [
        'Taco.core.ux.mixins.SplitEditor',
        'Taco.core.ux.grid.MenuColumn' // just to refer to its classname
    ],

    mixins: {
        splitEditor: 'Taco.core.ux.mixins.SplitEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    stateId: 'taco-publish-sets',
    title: 'Pending Changes',

    createButtonEnabled: true,
    createButtonText: 'Create New Publish Set',
    saveButtonVisible: false,
    cancelButtonVisible: false,

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },
    
    statics: {
        eastConfigs: {
            placeholder: {
                xtype: 'component',
                html: ''
            },
            form: {
                xtype: 'panel',
                html: 'test'
            }
        },
        factory: function (cfg, callback, scope) {
            callback.call(scope || this, Ext.create('Taco.view.publishing.Split', cfg));
        }
    },

    initComponent: function () {

        // this.createButtonCfg = this.getCreateButtonConfig();

        this.config.east = [this.eastGrid()];

        this.config.west = [this.westGrid()];

        this.config.east2 = [this.eastTwoGrid()];

        this.mixins.navHeader.init.apply(this);
        
        this.callParent(arguments);

        this.setupGridCommunication.apply(this);

        Taco.app.setLoading(false);

        this.mon(this.getEast(), {
            add: {
                scope: this,
                fn: 'handleAddToEast'
            }
        });
    },
    setupGridCommunication: function() {

        this.gridCommunication = {
            publistSetLayout: this.config.east[0],
            contentLayout: this.config.east2[0],
            selectionModel: this.config.east[0].down('#publish-grid').selModel,
            contentsProductStore: this.config.east2[0].down('#product').store,
            contentsDocumentStore: this.config.east2[0].down('#content').store
        };

        this.gridCommunication.selectionModel.on('select', this.fireSelectionEvent, this, {single: false});
    },
    fireSelectionEvent: function(store, record) {
        this.updateContentGrid.call(this, record);
        this.setActiveCard(this.gridCommunication.contentLayout, 0);
    },

    updateContentGrid: function(record) {
        this.gridCommunication.contentLayout.down('tabpanel').setTitle('<b>' + record.get('name') + '</b> Drafts');
        this.gridCommunication.contentsDocumentStore.read({code: record.get('code'), type: 'cms'});
        this.gridCommunication.contentsProductStore.read({code: record.get('code'), type: 'product'});
    },
    setActiveCard: function(cmp, idx) {
        cmp.getLayout().setActiveItem(idx);
    },
    westGrid: function() {
        return Ext.create('Taco.view.publishing.grid.GridWrapper', {
            title: 'Drafts',
            gridClass: 'getDraftGridConfig'
        });
    },
    eastGrid: function() {
        return Ext.create('Taco.view.publishing.grid.GridWrapper', {
            title: 'Publish Sets',
            type: 'publishSet',
            gridClass: 'getPublishGridConfig',
            panelConfig: {
                header: 'Publish Sets',
                body: [ 'Publish Sets are a new feature in Mozu. Use them to collect product and content drafts into related sets and set an optional ',
                        'publish date for those changes to go live.<br><br> <b>Click the "Create New Publish Set" button above to get started!</b>'].join('')
            }
        });
    },
    eastTwoGrid: function() {
        return Ext.create('Taco.view.publishing.grid.GridWrapper', {
            title: 'Publish Set Contents',
            gridClass: 'getDraftGridConfig',
            type: 'publishSetContents',
            panelConfig: {
                header: 'Publish Set Drafts',
                body: 'You can view the content of a publish grid by selecting a publish set!'
            }
        });
    },
    onCreate: function() {
        var me = this;
        Ext.create('Taco.view.publishing.modal.CreatePublishSet', {
            callback: function() {
               me.gridCommunication.publistSetLayout.down('#publish-grid').store.read();
               me.setActiveCard(me.gridCommunication.publistSetLayout, 0);
            }
        }).show();
    },

    handleAddToEast: function (ct, cmp) {
        
    },

    onRecordChange: function (record) {

       
    },

    // handleCollapseToolClick: function(e, t) {
    //     console.log(t);
    // },

    onSelectRecord: function (record) {
        
    },

    showAndHideSplitActions: function (toolbar) {
        var record = this.getRecord();
        var editorActions = ['cancelActionButton', 'saveActionButton', 'next', 'previous'];

        toolbar = toolbar || this.header.down('toolbar');
        toolbar.items.each(function (cmp) {
            var id = cmp.getItemId ? cmp.getItemId() : null;

            if (record) {
                if (record.get('orderStatus') === 'Pending') {
                    if (id === 'cancelActionButton' || id === 'saveActionButton') {
                        cmp.show();
                    } else if (id === 'createActionButton') {
                        cmp.hide();
                    }
                } else if (id === 'next' || id === 'previous') {
                    cmp.show();
                }
            } else {
                if (id === 'createActionButton') {
                    cmp.show();
                }
                if (Ext.Array.contains(editorActions, id)) {
                    cmp.hide();
                }
            }
        });
    },

    updateSplit: function (nextSplit) {

    },

    // updateSplitActions: function () {
        
    // },

    // handleChildCollapseExpand: function (panel) {
    //     this.callParent(arguments);

        
    // },

    updateSplitTitle: function () {
        var eastCollapsed = this.getEast().getCollapsed();
        var activeTitle = this.getWestTitle() || 'Records';

        Ext.suspendLayouts();
        this.setTitle(activeTitle);
        Ext.resumeLayouts();
    },

    // getCreateButtonConfig: function () {
    //     var me = this;
        
    //     // get site list
    //     var contextStore = Taco.app.context.getStore(false),
    //         menu = [],
    //         isMultiCatalog;

    //     // filter the context store to be only sites;
    //     contextStore.filter([
    //         {
    //             filterFn: function (item) {
    //                 return Ext.Array.contains(['m'], item.get('contextType'));
    //             },
    //             scope: this
    //         }
    //     ]);

    //     isMultiCatalog = (contextStore.count() > 1);

    //     // if multisite we need to make a menu button
    //     if (isMultiCatalog) {
    //         contextStore.each(function (record) {
    //             var itemConfig = {};
    //             itemConfig.siteId = record.raw.id; //Ext.clone(record.raw);
    //             itemConfig.text = record.raw.name;
    //             // remove the id from the data as it will cause conflicts between the duplicated items when they are configured;
    //             //delete itemConfig.id;
    //             menu.push(itemConfig);
    //         });
    //     }


    //     var createButtonConfig=  {
    //         xtype: 'button',
    //         text: me.createButtonText,
    //         margin: '0 0 0 10',
    //         ui: 'action-primary',
    //         scale: 'medium',
    //         hidden: false,
    //         itemId: 'createActionButton',
    //         handler: me.createActionHandler,
    //         scope: me
    //     };

    //     // need to make create a menu button with list of sites;
    //     if (isMultiCatalog) {
    //         Ext.apply(createButtonConfig, {
    //             //remove the handler since it will be handled by the menu;
    //             handler: Ext.emptyFn,
    //             menu: {
    //                 plain: true,
    //                 showSeparator: false,
    //                 listeners: {
    //                     click: {
    //                         fn: function (menu, menuItem, e) {                                
    //                             if (!menuItem) {
    //                                 return;
    //                             }
    //                             //var context= menuItem.context;
    //                             var siteId = menuItem.siteId;
    //                             // set the context to the siteId of the selected store;
    //                             var context = Taco.app.context.getStore().findRecord('id', siteId).raw;
    //                             Taco.app.context.setCurrentContext(context);
    //                             //create the 
    //                             me.createActionHandler();

    //                         },
    //                         scope: me,
    //                         delegate: 'x-menu-item-link'
    //                     }
    //                 },
    //                 items: menu
    //             }
    //         });
    //     }

    //     return createButtonConfig;
    // },
});
