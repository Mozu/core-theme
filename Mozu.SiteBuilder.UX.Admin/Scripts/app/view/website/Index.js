/**
 * @class Taco.view.website.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.model.NavigationTreeNode',
        'Taco.store.NavigationTreeNodes',
        'Taco.view.website.Tree',
        'Taco.view.website.entityAdapters.BaseEntityAdapter',
        'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        'Taco.view.website.entityAdapters.ProductEntityAdapter',
        'Taco.view.website.WidgetEditor'
    ],

    options: {},

    requiresContextOfType: ['s'],

    header: {
        title: false,
        actions: [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Page Editor',
            toggleGroup: 'websiteEditorTabs',
            enableToggle: true,
            pressed: true,
            style: {
                borderRadius: '2px 0px 0px 2px'
            },
            handler: function () {
                var cardpanel = this.down('#editorCardPanel');

                cardpanel.getLayout().setActiveItem(0);
            }
        }, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Page Settings',
            toggleGroup: 'websiteEditorTabs',
            enableToggle: true,
            style: {
                borderRadius: '0px 2px 2px 0px'
            },
            handler: function () {
                var cardpanel = this.down('#editorCardPanel');

                cardpanel.getLayout().setActiveItem(1);
            }
        }, {
            xtype: 'checkboxfield',
            boxLabel: 'View dropzones',
            margin: '0 0 0 25',
            flex: 1
        }, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Widgets',
            margin: '0 0 0 10'
        }, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'More',
            margin: '0 0 0 10',
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    text: 'thom'
                }]
            }
        }, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Cancel',
            margin: '0 0 0 10'
        }, {
            xtype: 'button',
            itemId: 'primaryAction',
            ui: 'action-primary',
            scale: 'medium',
            text: 'Save',
            margin: '0 0 0 10'
        }]
    },

    initComponent: function () {
        var store,
            items;

        this.controller = Taco.app.controllers.get('Website');
        this.widgetDefinitions = Taco.core.data.StoreManager.getOrCreate("Taco.store.WidgetDefinitions");

        store = Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes');

        items = [{
            xtype: 'panel',
            itemId: 'editorCardPanel',
            bodyStyle: {
                'border-right-width': '1px'
            },
            layout: {
                type: 'card'
            },
            items: [{
                    xtype: 'panel',
                    title: 'Editor',
                    header: false,
                    layout: {

                        type: 'fit'
                    },
                    items: [{
                        itemId: 'iframe',
                        xtype: 'uxiframe',
                        src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend(this.options && this.options.startUrl ? this.options.startUrl : '/', 'iseditmode=true'))
                    }]
                }, {
                    xtype: 'panel',
                    title: 'Settings',
                    overflowY: 'auto',
                    header: false,
                    items: [{
                        xtype: 'formform',
                        itemId: 'pageSettings',
                        ui: 'subform',
                        title: 'Page Settings',
                        margin: '20 30 10 30',
                        defaults: {
                            margin: '10 0 10 0'
                        }
                    }]
                }],
            dockedItems: [{
                dock: 'right',
                title: 'Sidebar',
                padding: '0 0 10',
                collapseDirection: 'right',
                animCollapse: false,
                collapsible: true,
                header: false,
                width: 240,
                layout: {
                    type: 'card'
                },
                items: [{
                        xtype: 'taco-website-tree',
                        store: store,
                        viewConfig: {
                            stripeRows: true
                        }
                    }, {
                        xtype: 'panel',
                        title: 'Results',
                        html: 'Results go here.'
                    }],
                dockedItems: [{
                    xtype: 'container',
                    dock: 'top',
                    padding: '14 20 0 14',
                    height: 60,
                    items: [{
                        xtype: 'textfield',
                        emptyText: 'Search',
                        width: '100%',
                        listeners: {
                            change: function (field, newValue) {
                                field.up('panel').getLayout().setActiveItem(Ext.String.trim(newValue).length > 0 ? 1 : 0);
                            }
                        }
                    }]
                }]
            }]
        }];

        Ext.apply(this.body, {
            layout: 'fit',
            padding: '0 0 0 0',
            items: items
        });

        this.callParent(arguments);

        this.bindToForm();

        this.iframe = this.down('#iframe');
        this.pageSettings = this.down('#pageSettings');
        this.tree = this.down('taco-website-tree');
        // TODO: remove when dev complete
        window.webSiteIndex = this;

        this.mon(this.controller, 'pageload', this.onPageLoad, this);
        this.mon(this.controller, 'widgetdrop', this.onWidgetDrop, this);
        this.mon(this.controller, 'widgetedit', this.onWidgetEdit, this);
        this.mon(this.controller, 'pagedirtychange', this.onDirtyChange, this);
        this.tree.on('pagecreate', this.onPageCreate, this);
        this.tree.on('urlclick', this.onTreeUrlClick, this);
    },

    entityTypeEditConfig: {
        blog: 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        "default": 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        category: 'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        product: 'Taco.view.website.entityAdapters.ProductEntityAdapter',
        link: 'Taco.view.website.entityAdapters.ExternalLinkEntityAdapter'
    },

    bindToForm: function () {
        var primaryAction = this.down('#primaryAction');

        this.down('#pageSettings').getForm().getBoundItems().add(primaryAction);

        primaryAction.setHandler(this.onSave, this);
    },

    getPageContext: function () {
        return this.iframe.getWin().require.mozuData('pagecontext');
    },

    navigate: function (config) {
        this.iframe.getWin().location.href = Ext.String.urlAppend(config.url, 'iseditmode=true');
        Taco.core.StateManager.addState('website/page' + config.url);
    },

    onDirtyChange: Ext.emptyFn,

    onEntityTypeAdapterLoad:function () {
        var settings = this.entitypeTypeHandler.getPageSettings();
        
        this.pageSettings.add(settings);
    },

    onPageLoad: function (editor) {
        var me = this,
            pc = this.getPageContext();
        
        this.pageSettings.removeAll(true);
        
        this.entitypeTypeHandler  = Ext.create(this.entityTypeEditConfig[pc.pageType || "default"] || this.entityTypeEditConfig["default"], {
            editor: editor,
            pageContext:pc,
            manager: this,
            listeners: {
                load: me.onEntityTypeAdapterLoad,
                scope:me
            }
        });

        

     

        Ext.EventManager.on(this.iframe.getDoc(), 'click', function (e, target) {
            if (target.hostname == this.iframe.getWin().location.hostname) {
                me.fireEvent('beforeIframeClickNavigate', {
                    url: target.pathname + target.search
                });
                this.navigate({
                    url: target.pathname + target.search
                });
                e.stopEvent();
            }
        }, this, {
            delegate: 'a'
        });
    },

    onSave:function (button) {
        var tasks = this.entitypeTypeHandler.getSaveTask();
        button.setDisabled(true);
        tasks.on({
            complete: function () {
                button.setDisabled(false);
            }
        });

        tasks.execute();
    },

    onWidgetDrop: function (cfg) {
        var pageContext = this.getPageContext(),
            def = this.widgetDefinitions.getById(cfg.widgetTypeId),
            jsonData = {
                zoneScope: 'page',
                source: pageContext.cmsContext.page,
                definitionId: cfg.widgetTypeId
            };

        cfg.config = def.get('defaultConfig');

        if (!Ext.isEmpty(def.get('editViewFields')) || !Ext.isEmpty(def.get('editViewConfig'))) {
            Ext.create('Taco.view.website.WidgetEditor', {
                editViewFields: def.get('editViewFields'),
                editViewConfig: def.get('editViewConfig'),
                widgetData: cfg.config,
                title: def.get('displayName'),
                listeners: {
                    save: function (modal) {
                        jsonData.config = modal.widgetData;

                        Ext.Ajax.request({
                            url: '/Widgets/preview',
                            jsonData: jsonData,
                            success: function (response) {
                                var ret = Ext.JSON.decode(response.responseText);

                                cfg.callback(ret.output, {
                                    config:ret.config,
                                    id:ret.id,
                                    definitionId:ret.definitionId
                                });
                            }
                        });
                    }
                }
            });
        } else {
            jsonData.config = cfg.config;
            
            Ext.Ajax.request({
                url: '/Widgets/preview',
                jsonData: jsonData,
                success: function (response) {
                    var ret = Ext.JSON.decode(response.responseText);

                    cfg.callback(ret.output, {
                        config: ret.config,
                        id: ret.id,
                        definitionId: ret.definitionId
                    });
                    
                }
            });
        }
    },

    onWidgetEdit: function (config) {
        //{
        //    //the editor firing the event
        //    editor: editor,
        //    //the widgetTypeId of the widgetBeing dropped
        //    widgetTypeId: 'qewr-asdf-asdf',
        //    // the  widgetInstanceData of the widget
        //    data: {
        //        id: '111-222-333',
        //        typeId: 'qewr-asdf-asdf',
        //        config: {
        //            userId: 'adsf',
        //            keywords: ['cats', 'more cats'],
        //            count: 22
        //        }
        //    },
        //    //callback method to be called when content and data are ready to be inserted into the page
        //    // html is the markup to be inserted the 
        //    // data is the persistable widgetInstanceData of the widget
        //    callback: function (html, data) {

        //    }
    },
    onPageCreate: function (tree, cmsDoc, isLinked, parentRecord) {

        this.tree.store.reload();
        //todo navigage?

    },
    onTreeUrlClick:function ( tree, url, record, item, index, e, eOpts) {
        this.navigate({ url: url });
    }
});
