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
        'Taco.view.website.WidgetEditor',
        'Taco.view.website.widgetEditors.HorizontalRule',
        'Taco.view.website.widgetEditors.Image',
        'Taco.view.website.entityAdapters.SiteTemplateEntityAdapter',
        'Taco.view.website.entityAdapters.TemplateEntityAdapter',
        'Taco.view.website.entityAdapters.EmailTemplateEntityAdapter',
        'Ext.ux.IFrame'
    ],

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s'],
        hidden: true
    },

    entityTypeEditConfig: {
        blog: 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        'default': 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        category: 'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        product: 'Taco.view.website.entityAdapters.ProductEntityAdapter',
        link: 'Taco.view.website.entityAdapters.ExternalLinkEntityAdapter',
        email: 'Taco.view.website.entityAdapters.EmailTemplateEntityAdapter'
    },

    options: {},

    header: {
        title: false,
        actions: [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Page Editor',
                toggleGroup: 'websiteEditorTabs',
                allowDepress: false,
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
                allowDepress: false,
                enableToggle: true,
                style: {
                    borderRadius: '0px 2px 2px 0px'
                },
                handler: function () {
                    var cardpanel = this.down('#editorCardPanel');

                    cardpanel.getLayout().setActiveItem(1);
                },
                toggleHandler: function (cmp, isPressed) {
                    cmp.nextSibling('checkboxfield').setDisabled(isPressed);
                    cmp.nextSibling('button[text="Widgets"]').setDisabled(isPressed);
                }
            }, {
                xtype: 'checkboxfield',
                boxLabel: 'View dropzones',
                margin: '0 0 0 25',
                flex: 1,
                handler: function (checkbox, checked) {
                    this.showDropZones = checked;
                    if (checked) {
                        this.chorizoEditor.showDropZones();
                    } else {
                        this.chorizoEditor.hideDropZones();
                    }
                }
            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Widgets',
                margin: '0 0 0 10',
                handler: function () {
                    this.chorizoEditor.widgets().toggle();
                }
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
                            text: 'Live Version',
                            handler: function (menuItem) {
                                //scope is set to index on all action buttons by container.
                                var url = menuItem.up('button').scope.url;
                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=live&redir=' + encodeURIComponent(url), 'taco-preview');
                            }
                        },
                        {
                            text: 'Staging Version',
                            handler: function (menuItem) {
                                //scope is set to index on all action buttons by container.
                                var url = menuItem.up('button').scope.url;
                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent(url), 'taco-preview');
                            }
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
            },
            {
                xtype: 'button',
                itemId: 'publishAction',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Publish',
                margin: '0 0 0 10',
                hidden: true,
                disabled: true,
                handler: function () {
                    this.onPublish();
                }
            }]
    },

    initComponent: function () {
        var navStore,
            items,
            gridStore;

        this.controller = Taco.app.controllers.get('Website');
        this.url = this.options && this.options.startUrl ? this.options.startUrl : '/';
        this.widgetDefinitions = Taco.core.data.StoreManager.getOrCreate("Taco.store.WidgetDefinitions");

        navStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes');

        productStore = Ext.create('Taco.store.ProductComboBox', {
            autoLoad: false
        });

        items = [{
            xtype: 'panel',
            bodyStyle: {
                'border-width': '0px 1px 0px 0px'
            },
            layout: {
                type: 'border'
            },
            items: [{
                    xtype: 'panel',
                    itemId: 'editorCardPanel',
                    region: 'center',
                    layout: {
                        type: 'card'
                    },
                    items: [{
                            xtype: 'panel',
                            title: 'Editor',
                            border: false,
                            header: false,
                            layout: {
                                type: 'fit'
                            },
                            items: [{
                                itemId: 'iframe',
                                xtype: 'uxiframe',
                                src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend(this.url, 'iseditmode=true'))
                            }]
                        }, {
                            xtype: 'panel',
                            title: 'Settings',
                            overflowY: 'auto',
                            border: false,
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
                        }]
                }, {
                    xtype: 'panel',
                    itemId: 'sideBar',
                    region: 'east',
                    title: 'Sidebar',
                    cls: 'taco-website-sidebar',
                    collapseDirection: 'right',
                    collapseMode: 'mini',
                    animCollapse: false,
                    collapsible: true,
                    header: false,
                    width: 240,
                    style: {
                        overflow: 'visible'
                    },
                    split: {
                        canResize: false,
                        size: 10
                    },
                    layout: {
                        type: 'card'
                    },
                    items: [{
                            xtype: 'taco-website-tree',
                            store: navStore
                        }, {
                            xtype: 'gridpanel',
                            title: 'Results',
                            store: productStore,
                            columns: [{
                                    dataIndex: 'productCode',
                                    text: 'Product Code',
                                    width: 100
                                }, {
                                    dataIndex: 'productName',
                                    text: 'Name',
                                    flex: 1
                                }],
                            listeners: {
                                itemclick: {
                                    scope: this,
                                    fn: 'onGridProductItemClick'
                                }
                            },
                            dockedItems: [{
                                    xtype: 'pagingtoolbar',
                                    store: productStore,   // same store GridPanel is using
                                    dock: 'bottom',
                                    displayInfo: true
                                }, {
                                    dock: 'top',
                                    xtype: 'button',
                                    text: '<= back',
                                    scope: this,
                                    handler: function (field) {
                                        this.sideBar.getLayout().setActiveItem(0);
                                    }
                                }]
                        }],
                    dockedItems: [{
                        xtype: 'container',
                        dock: 'top',
                        padding: '14 20 0 14',
                        height: 60,
                        items: [{
                            //     xtype: 'component',
                            //     html: '',
                    //     cls: 'taco-collapse-handle',
                    //     width: 15,
                    //     height: 30,
                    //     listeners: {
                    //         click: {
                    //             scope: this,
                    //             element: 'el',
                    //             fn: function (e, t) {
                    //                 this.sideBar.toggleCollapse();
                    //             }
                    //         }
                    //     }
                    // }, {
                            xtype: 'textfield',
                            emptyText: 'Search',
                            width: '100%',
                            listeners: {
                                change: this.onSearchTextChange,
                                scope: this,
                                buffer: 505
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


        this.publishButton = this.down('#publishAction');
        this.down('#publishAction').setVisible(Taco.app.context.getCurrent().isPublishingEnabled());


        this.bindToForm();

        this.iframe = this.down('#iframe');
        this.pageSettings = this.down('#pageSettings');
        this.tree = this.down('taco-website-tree');
        this.productGrid = this.down('gridpanel');
        this.sideBar = this.down('#sideBar');
        // TODO: remove when dev complete
        window.webSiteIndex = this;

        this.mon(this.controller, 'pageload', this.onPageLoad, this);
        this.mon(this.controller, 'widgetdrop', this.onWidgetDrop, this);
        this.mon(this.controller, 'widgetedit', this.onWidgetEdit, this);
        this.mon(this.controller, 'pagedirtychange', this.onDirtyChange, this);

        this.tree.on('showproducts', this.onShowProducts, this);
        this.tree.on('pagecreate', this.onPageCreate, this);
        this.tree.on('urlclick', this.onTreeUrlClick, this);
    },

    bindToForm: function () {
        var primaryAction = this.down('#primaryAction');

        this.down('#pageSettings').getForm().getBoundItems().add(primaryAction);

        primaryAction.setHandler(this.onSave, this);
    },

    setPublishable: function (value) {
        if (value) {
            this.publishButton.enable();
        } else {
            this.publishButton.disable();
        }

    },
    onPageCreate: function (navRecord) {
        this.navigate({
            url: navRecord.get('url')
        });
    },
    createEntityTypeAdapter: function (pageContext, editor) {
        var cls = this.entityTypeEditConfig[pageContext.pageType || "default"] || this.entityTypeEditConfig["default"];

        if ((pageContext.editMode || "").toLowerCase() == 'template') {
            cls = 'Taco.view.website.entityAdapters.TemplateEntityAdapter';
        } else if ((pageContext.editMode || "").toLowerCase() == 'site') {
            //todo create sitetemplate
            cls = 'Taco.view.website.entityAdapters.TemplateEntityAdapter';
        }

        return Ext.create(cls, {
            editor: editor,
            pageContext: pageContext,
            manager: this,
            listeners: {
                load: this.onEntityTypeAdapterLoad,
                scope: this
            }
        });
    },

    getPageContext: function () {
        return this.iframe.getWin().require.mozuData('pagecontext');
    },

    navigate: function (config) {
        this.url = config.url;
        this.iframe.getWin().location.href = Ext.String.urlAppend(config.url, 'iseditmode=true');
        Taco.core.StateManager.addState('website/page' + config.url);
    },

    onDirtyChange: Ext.emptyFn,

    onEntityTypeAdapterLoad: function () {
        var settings = this.entitypeTypeHandler.getPageSettings();

        this.pageSettings.add(settings);
    },

    onPageLoad: function (editor) {
        var me = this,
            pc = this.getPageContext();


        this.chorizoEditor = editor;

        this.setPublishable(false);

        if (this.showDropZones) {
            this.chorizoEditor.showDropZones();
        } else {
            this.chorizoEditor.hideDropZones();
        }

        this.pageSettings.removeAll(true);

        this.entitypeTypeHandler = this.createEntityTypeAdapter(pc, editor);

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
            delegate: 'a',
            delay: 100
        });
    },

    onSave: function (button) {
        var tasks = this.entitypeTypeHandler.getSaveTask();

        button.setDisabled(true);

        tasks.on({
            complete: function () {
                button.setDisabled(false);
            }
        });

        tasks.execute();
    },

    onPublish: function () {
        this.entitypeTypeHandler.publish();
    },

    onWidgetDrop: function (cfg) {
        var pageContext = this.getPageContext(),
            def = this.widgetDefinitions.getById(cfg.widgetTypeId),
            body = this.iframe.getDoc().body,
            jsonData = {
                zoneScope: 'page',
                source: pageContext.cmsContext.page,
                definitionId: cfg.widgetTypeId
            }, serverRenderFn;

        cfg.config = def.get('defaultConfig');

        serverRenderFn = function (jsonData) {
            Ext.fly(body).setStyle('cursor', 'wait');
            Ext.Ajax.request({
                url: '/Widgets/preview',
                jsonData: jsonData,
                callback: function () {
                    Ext.fly(body).setStyle('cursor', 'auto');
                },
                success: function (response) {
                    var ret = Ext.JSON.decode(response.responseText);

                    cfg.callback(ret.output, {
                        config: ret.config,
                        id: ret.id,
                        height: ret.height,
                        definitionId: ret.definitionId
                    });

                }
            });
        };


        if (!Ext.isEmpty(def.get('editViewFields')) || !Ext.isEmpty(def.get('editViewConfig')) || !Ext.isEmpty(def.get('editView'))) {
            Ext.widget(def.get('editView') || 'taco-widgeteditor', {
                editViewFields: def.get('editViewFields'),
                editViewConfig: def.get('editViewConfig'),
                autoShow: true,
                closeAction: 'destroy',
                widgetData: cfg.config,
                title: def.get('displayName'),
                listeners: {
                    save: function (modal) {
                        jsonData.config = modal.widgetData;

                        serverRenderFn(jsonData);

                    }
                }
            });
        } else {
            jsonData.config = cfg.config;

            serverRenderFn(jsonData);
        }
    },

    onWidgetEdit: function (cfg) {
        var pageContext = this.getPageContext(),
            def = this.widgetDefinitions.getById(cfg.data.definitionId),
            body = this.iframe.getDoc().body,
            jsonData = {
                zoneScope: 'page',
                source: pageContext.cmsContext.page,
                definitionId: cfg.data.definitionId
            }, callbackWrapper;

        callbackWrapper = function (ret, cfg) {
            cfg.callback(ret.output, {
                config: ret.config,
                id: ret.id,
                definitionId: ret.definitionId
            });
        };            


        if (!Ext.isEmpty(def.get('editViewFields')) || !Ext.isEmpty(def.get('editViewConfig')) || !Ext.isEmpty(def.get('editView'))) {
            Ext.widget(def.get('editView') || 'taco-widgeteditor', {
                editViewFields: def.get('editViewFields'),
                editViewConfig: def.get('editViewConfig'),
                autoShow: true,
                closeAction: 'destroy',
                widgetData: cfg.data.config,
                title: def.get('displayName'),
                listeners: {
                    save: function (modal) {
                        jsonData.config = modal.widgetData;
                        Ext.fly(body).setStyle('cursor', 'wait');
                        Ext.Ajax.request({
                            url: '/Widgets/preview',
                            jsonData: jsonData,
                            callback: function () {
                                Ext.fly(body).setStyle('cursor', 'auto');
                            },
                            success: function (response) {
                                var ret = Ext.JSON.decode(response.responseText);
                                callbackWrapper(ret, cfg);
                            }
                        });
                    }
                }
            });
        } else {
            callbackWrapper(ret, cfg);
        }
    },

    onSearchTextChange: function (field, newValue, oldValue, eOpts) {
        var store = this.productGrid.store;

        if (!newValue) {
            this.sideBar.getLayout().setActiveItem(0);
            return;
        }

        if (this.sideBar.getLayout().getActiveItem() != this.productGrid) {
            store.extraFilters.clear();
        }

        this.sideBar.getLayout().setActiveItem(this.productGrid);
        store.extraFilters.clear();
        store.addFilter([{
            id: 'all',
            property: 'all',
            value: newValue
        }]);
        // store.extraFilters.add({ id: "categoryids", property: 'categoryids', value: navRecord.get('originalId') });
        store.load();
    },

    onGridProductItemClick: function (grid, record) {
        this.navigate({
            url: '/p/' + record.getId()
        });
    },

    onShowProducts: function (navRecord) {
        var store = this.productGrid.store;

        this.sideBar.getLayout().setActiveItem(this.productGrid);
        store.extraFilters.clear();
        store.extraFilters.add({ id: "categoryids", property: 'categoryids', value: navRecord.get('originalId') });
        store.load();
    },

    onTreeUrlClick: function (tree, url, record, item, index, e, eOpts) {
        this.navigate({
            url: url
        });
    }
});