/**
 * @class Taco.view.website.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.Index', {
    // extend: 'Taco.core.ux.content.Container',
    extend: 'Ext.panel.Panel',
    mixins: {
        //  editorwrapper: 'Taco.core.ux.form.EditorWrapper',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    requires: [
        'Taco.model.NavigationTreeNode',
        'Taco.store.NavigationTreeNodes',
        'Taco.view.website.Tree',
        'Taco.view.website.entityAdapters.BaseEntityAdapter',
        'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        'Taco.view.website.entityAdapters.ProductEntityAdapter',
        'Taco.core.ux.form.field.QuickFilter',
        'Taco.view.website.WidgetEditor',
        'Taco.view.website.widgetEditors.HorizontalRule',
        'Taco.view.website.widgetEditors.Image',
        'Taco.view.website.widgetEditors.DealOfTheDay',
        'Taco.view.website.entityAdapters.SiteTemplateEntityAdapter',
        'Taco.view.website.entityAdapters.TemplateEntityAdapter',
        'Taco.view.website.entityAdapters.DocumentListEntityAdapter',
        'Taco.view.website.entityAdapters.EmailTemplateEntityAdapter',
        'Ext.ux.IFrame',
        'Taco.store.ThemeListing',
        'Ext.menu.CheckItem',
        'Taco.view.entityManager.Grid',
        'Taco.view.entityManager.DynamicFormContainer',
        'Taco.store.EntityEditors',
        'Taco.store.PageTypeDefinitions',
        'Ext.ux.IFrame'
    ],
    selectedTheme: '',
    itemId: 'websiteIndex',

    contextConfig: {
        //   supportedLevels: ['s'],
        requiresContextOfType: ['s'],
        hidden: true
    },
    title: false,
    entityTypeEditConfig: {
        blog: 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        'default': 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        category: 'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        product: 'Taco.view.website.entityAdapters.ProductEntityAdapter',
        link: 'Taco.view.website.entityAdapters.ExternalLinkEntityAdapter',
        email: 'Taco.view.website.entityAdapters.EmailTemplateEntityAdapter',
        documentList: 'Taco.view.website.entityAdapters.DocumentListEntityAdapter'
    },
    enableNavHeader: true,
    options: {},


    layout: {
        type: 'fit'
    },
    padding: '0 0 0 0',


    initComponent: function () {
        var navStore,
           productStore,
            me = this;


        this.entityEditors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');
        this.pageTypeDefinitions = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions');

        this.on('navigatestart', this.onNavigateStart, this);
        this.on('navigatecomplete', this.onNavigateComplete, this);

        this.actions = [
            {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Page Editor',
                toggleGroup: 'websiteEditorTabs',
                itemId: 'pageEditorTabButton',
                buttonGroup: 'isWebPage',
                allowDepress: false,
                enableToggle: true,
                pressed: true,
                style: {
                    borderRadius: '2px 0px 0px 2px'
                },
                scope: this,
                handler: function () {
                    var cardpanel = this.down('#editorCardPanel');

                    cardpanel.getLayout().setActiveItem(0);
                },

            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                buttonGroup: 'hasSettings',
                text: 'Settings',
                itemId: 'pageSettingsTabButton',
                toggleGroup: 'websiteEditorTabs',
                allowDepress: false,
                enableToggle: true,
                scope: this,
                style: {
                    borderRadius: '0px 2px 2px 0px'
                },
                handler: function () {
                    var cardpanel = this.down('#editorCardPanel');

                    cardpanel.getLayout().setActiveItem(1);
                },
                toggleHandler: function (cmp, isPressed) {
                    this.down('#dropZonesCB').setDisabled(isPressed);
                    this.down('#widgetsActionButton').setDisabled(isPressed);
                }

            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                buttonGroup: 'isDocumentList',
                text: 'Grid',
                itemId: 'contentGridTabButton',
                toggleGroup: 'websiteEditorTabs',
                allowDepress: false,
                enableToggle: true,
                scope: this,
                style: {
                    borderRadius: '0px 2px 2px 0px'
                },
                handler: function () {
                    var cardpanel = this.down('#editorCardPanel');

                    cardpanel.getLayout().setActiveItem(2);
                },
                toggleHandler: function (cmp, isPressed) {
                    this.down('#dropZonesCB').setDisabled(isPressed);
                    this.down('#widgetsActionButton').setDisabled(isPressed);
                }

            }, {
                xtype: 'checkboxfield',
                itemId: 'dropZonesCB',
                buttonGroup: 'isWebPageView',
                boxLabel: 'View dropzones',
                margin: '0 0 0 25',
                //    flex: 1,
                scope: this,
                handler: function (checkbox, checked) {
                    this.showDropZones = checked;
                    if (checked) {
                        this.chorizoEditor.showDropZones();
                    } else {
                        this.chorizoEditor.hideDropZones();
                    }
                }
            }, '->',
            {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',

                itemId: 'widgetsActionButton',
                text: 'Widgets',
                buttonGroup: 'isWebPageView',
                margin: '0 0 0 10',
                scope: this,
                handler: function () {
                    this.chorizoEditor.widgets().toggle();
                }
            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                itemId: 'moreActionButton',
                buttonGroup: 'isWebPage',
                text: 'More',
                margin: '0 0 0 10',
                scope: this,
                menu: {
                    plain: true,
                    shadow: false,
                    items: [
                        {
                            text: 'Live Version',
                            handler: function (menuItem) {
                                //scope is set to index on all action buttons by container.
                                var url = menuItem.up('button').scope.url;
                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=live&redir=' + encodeURIComponent(url));
                            }
                        }, {
                            text: 'Staging Version',
                            handler: function (menuItem) {
                                //scope is set to index on all action buttons by container.
                                var url = menuItem.up('button').scope.url;
                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent(url));
                            }
                        }, {
                            text: 'Preview Theme',
                            itemId: 'previewThemesMenu'
                        }, {
                            text: 'Resolution',
                            menu: {
                                items: [
                                    {
                                        text: 'Default',
                                        xtype: 'menucheckitem',
                                        checked: true,
                                        group: 'resolutions',
                                        handler: function () {
                                            var iframeOffset = me.down('#iframeOffset');

                                            iframeOffset.setWidth(0);
                                        }
                                    }, {
                                        text: 'Phone (480px)',
                                        xtype: 'menucheckitem',
                                        group: 'resolutions',
                                        handler: function () {
                                            var iframeW = me.iframe.getWidth(),
                                                iframeOffset = me.down('#iframeOffset'),
                                                iframeOffsetW = iframeOffset.getWidth();

                                            iframeOffset.setWidth(iframeOffsetW + iframeW - 480);
                                        }
                                    },
                                    {
                                        text: 'Tablet (768px)',
                                        xtype: 'menucheckitem',
                                        group: 'resolutions',
                                        handler: function () {
                                            var iframeW = me.iframe.getWidth(),
                                                iframeOffset = me.down('#iframeOffset'),
                                                iframeOffsetW = iframeOffset.getWidth();
                                            iframeOffset.setWidth(iframeOffsetW + iframeW - 768);
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                buttonGroup: 'isSavable',
                itemId: 'cancelActionButton',
                handler: me.cancelActionHandler,
                scope: me,
                text: 'Cancel',
                margin: '0 0 0 10'
            }, {
                xtype: 'button',
                itemId: 'saveActionButton',
                ui: 'action-primary',
                scale: 'medium',
                buttonGroup: 'isSavable',
                text: 'Save',
                margin: '0 0 0 10'
            }, {
                xtype: 'button',
                itemId: 'publishActionButton',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Publish',
                margin: '0 0 0 10',
                buttonGroup: 'isPublishable',
                hidden: true,
                disabled: true,
                scope: this,
                handler: function () {
                    this.onPublish();
                }
            },
            {
                xtype: 'button',

                itemId: 'createActionButton',
                buttonGroup: 'isCreatable',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Create',
                margin: '0 0 0 10',
                scope: me,
                handler: me.OnCreateClick
            }
        ];

        this.controller = Taco.app.controllers.get('Website');
        this.url = this.options && this.options.startUrl ? this.options.startUrl : '/';
        this.widgetDefinitions = Taco.core.data.StoreManager.getOrCreate("Taco.store.WidgetDefinitions");

        navStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes');

        productStore = Ext.create('Taco.store.ProductComboBox', {
            autoLoad: false
        });

        me.items = [
            {
                xtype: 'panel',
                bodyStyle: {
                    'border-width': '0px 1px 0px 0px'
                },
                layout: {
                    type: 'border'
                },
                items: [
                    {
                        xtype: 'panel',
                        itemId: 'editorCardPanel',
                        region: 'center',

                        layout: {
                            type: 'card'
                        },
                        defaults: {
                            listeners: {
                                activate: me.onCardPanelItemActivate,
                                scope: me
                            }
                        },

                        items: [
                            {
                                xtype: 'panel',
                                title: 'Editor',
                                border: false,
                                header: false,
                                itemId: 'pageEditor',
                                isWebEditor: true,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        itemId: 'iframe',
                                        xtype: 'uxiframe',
                                        src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend(this.url, 'iseditmode=true&SBTHEME=' + this.selectedTheme))
                                    },
                                    {
                                        xtype: 'component',
                                        itemId: 'iframeOffset',
                                        width: 0
                                    }
                                ]
                            }, {
                                xtype: 'formform',
                                title: 'Settings',
                                isWebEditor: true,
                                overflowY: 'auto',
                                itemId: 'pageSettingsContainer',
                                border: false,
                                header: false,
                                items: [
                                    {
                                        xtype: 'formform',
                                        itemId: 'pageSettings',
                                        ui: 'subform',
                                        title: 'Settings',
                                        // margin: '20 30 10 30',
                                        defaults: {
                                            margin: '10 0 10 0'
                                        }
                                    }
                                ]
                            }, {
                                xtype: 'panel',
                                title: 'Grid!!!',

                                overflowY: 'auto',
                                border: false,
                                layout: 'fit',
                                itemId: 'contentListContainer',
                                header: false
                            }
                        ]
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
                            canResize: true,
                            size: 10,
                            cls: 'taco-website-sidebar-splitter'
                        },
                        layout: {
                            type: 'card'
                        },
                        items: [
                            {
                                xtype: 'taco-website-tree',
                                store: navStore
                            }, {
                                xtype: 'gridpanel',
                                title: 'Results',
                                store: productStore,
                                columns: [
                                    {
                                        dataIndex: 'productCode',
                                        text: 'Product Code',
                                        width: 100
                                    }, {
                                        dataIndex: 'productName',
                                        text: 'Name',
                                        flex: 1
                                    }
                                ],
                                listeners: {
                                    itemclick: {
                                        scope: this,
                                        fn: 'onGridProductItemClick'
                                    }
                                },
                                dockedItems: [
                                    {
                                        xtype: 'pagingtoolbar',
                                        store: productStore, // same store GridPanel is using
                                        dock: 'bottom',
                                        displayInfo: true
                                    }, {
                                        dock: 'top',
                                        xtype: 'button',
                                        text: '← back',
                                        scope: this,
                                        handler: function () {
                                            this.sideBar.getLayout().setActiveItem(0);
                                        }
                                    }
                                ]
                            }
                        ],
                        dockedItems: [
                            {
                              //  xtype: 'container',
                              //  dock: 'top',
                              ////  padding: '14 20 0 14',
                              //  height: 60,
                              //  items: [
                              //      {
                                        xtype: 'taco-quickfilter',
                                        emptyText: 'Search',
                                        triggerCls: 'x-form-search-trigger',
                                        flex:1,
                                        width: '100%',
                                        listeners: {
                                            change: this.onSearchTextChange,
                                            scope: this,
                                            buffer: 505
                                        }
                                //    }
                                //]
                            }
                            
                        ]
                    }
                ]
            }
        ];

        if (this.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);
        }

        this.callParent(arguments);
        this.fireEvent('navigatestart', this, { url: this.url });

        this.themeStore = Ext.create('Taco.store.ThemeListing', {
            autoLoad: true,
            listeners: {
                load: this.onThemeLoad,
                scope: this
            }
        });


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
        this.tree.on('contentlistclick', this.onContentListClick, this);
        this.tree.on('navigationchange', this.reloadPage, this);
        this.tree.on('navigationchange', this.reloadPage, this);
        this.on('render', function () {
            var header = me.getHeader();

            //me.standardToolBar = header.down('toolbar');
            // me.standardToolBar.toolbarTypes = ['standard'];
            //me.contentEditorToolbar = Ext.widget({
            //    xtype: "toolbar",
            //    cls: "taco-navheader-toolbar",
            //    dock: 'top',
            //    toolbarTypes:['contentEditor'],
            //    hidden: true,
            //    //padding: '10px 20px 10px 20px',
            //    //style: "border-bottom: 1px solid #bfbfbf !important",
            //    items: [

            //    ]
            //});

            // me.header.add(me.contentEditorToolbar);

            me.publishButton = header.down('#publishActionButton');
            me.pageSettingsTabButton = header.down('#pageSettingsTabButton');
            me.pageEditorTabButton = header.down('#pageEditorTabButton');
            me.createActionButton = header.down('#createActionButton');
          //  me.publishButton.setVisible(Taco.app.context.getCurrent().isContentPublishingEnabled());
            if (!me.themeStore.isLoading()) {
                me.onThemeLoad();
            }
            me.bindToForm();
        });
    },
    showHideButtons: function (buttonGroups, leaveExisting) {
        var buttons = this.header.query('component[buttonGroup]');

        Ext.Array.each(buttons, function (btn) {
            if (btn.buttonGroup && buttonGroups.indexOf(btn.buttonGroup) > -1) {
                btn.show();
            } else if (leaveExisting !== true) {
                btn.hide();
            }
        });

    },
    onCardPanelItemActivate: function (cmp) {
        this.fireEvent('activecardchanged', this, cmp);
        
    },
    getCardPanel: function () {
        this.cardpanel = this.cardpanel || this.down('#editorCardPanel');
        return this.cardpanel;
    },
    toggleCard: function (item) {
        this.cardpanel = this.cardpanel || this.down('#editorCardPanel');

        this.cardpanel.getLayout().setActiveItem(item);
    },
    getActiveCard: function () {
        this.cardpanel = this.cardpanel || this.down('#editorCardPanel');

        return this.cardpanel.getLayout().getActiveItem();
    },
    doCancel: function () {

        //simple reset to web viewer...
        this.toggleCard(0);
        this.reloadPage();

    },
    onThemeLoad: function () {

        if (!this.getHeader().$className) {
            return;
        }

        var me = this,
            previewThemesMenu = this.getHeader().down('#previewThemesMenu'),
            menu = {
                items: []
            };

        this.themeStore.each(function (themeRecord) {
            menu.items.push({
                xtype: 'menucheckitem',
                text: themeRecord.get('name'),
                //     icon: '/admin/Scripts/build/resources/images/menu/checked.gif',
                checked: themeRecord.get('isSelectedDesktop'),
                group: 'selectedTheme',
                handler: function (menuItem) {
                    me.selectedTheme = themeRecord.get('id');
                    me.navigate({
                        url: me.url
                    });
                    menuItem.setChecked(true);
                }

            });
        });
        previewThemesMenu.setMenu(menu);


    },
    bindToForm: function () {
        var primaryAction = this.getHeader().down('#saveActionButton');

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

        if ((pageContext.editMode || "").toLowerCase() === 'template') {
            cls = 'Taco.view.website.entityAdapters.TemplateEntityAdapter';
        } else if ((pageContext.editMode || "").toLowerCase() === 'site') {
            //todo create sitetemplate
            cls = 'Taco.view.website.entityAdapters.SiteTemplateEntityAdapter';
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

    onNavigateStart: function () {
        var me = this;
        this.loadingMaskTaskId = Ext.defer(function () {
            me.getCardPanel().setLoading(true);
        }, 500, this);
    },
    onNavigateComplete: function () {
        var me = this;
        me.getCardPanel().setLoading(false);
        window.clearTimeout(this.loadingMaskTaskId);
    },

    navigate: function (config) {
        var parser = document.createElement('a');
        parser.href = config.url;

        if ((parser.hostname ||'').toLowerCase() !== ( window.location.hostname || '').toLowerCase()) {
            Ext.Msg.alert('Attention', 'editing of url [<b><a href="' + parser.href + '" target="_blank">' + parser.href + '</a></b>] not supported');
            
            return;
        }

        config.url = parser.pathname + parser.search

        this.fireEvent('navigatestart', this, config);
        //  this.showHideButtons([]);
        this.url = config.url;
  
        this.pageSettings.removeAll(true);
        this.iframe.getWin().location.href = Ext.String.urlAppend(config.url, 'iseditmode=true&SBTHEME=' + this.selectedTheme);
        Taco.core.StateManager.addState('website/page' + config.url);
        if (config.view === 'page') {
            this.toggleCard(0);
        }
        if (config.view === 'settings') {
            this.toggleCard(1);
        }
        if (config.view === 'contentGrid') {
            this.toggleCard(3);
        }

    },
    reloadPage: function () {
        this.navigate({ url: this.iframe.getWin().location });
        //this.iframe.getWin().location.reload();
    },

    onDirtyChange: Ext.emptyFn,

    onEntityTypeAdapterLoad: function () {
        var settings = this.entitypeTypeHandler.getPageSettings();

        this.pageSettings.add(settings);
    },

    onPageLoad: function (editor) {
        var me = this,
            pc = this.getPageContext();

        this.fireEvent('navigatecomplete', this, { url: this.url });


        this.showHideButtons(['isWebPage', 'hasSettings', 'isSavable', 'isWebPageView']);

        if (!this.getActiveCard().isWebEditor) {
            this.toggleCard(0);
        }

        this.chorizoEditor = editor;

        this.setPublishable(false);

        if (this.showDropZones) {
            this.chorizoEditor.showDropZones();
        } else {
            this.chorizoEditor.hideDropZones();
        }


        this.entitypeTypeHandler = this.createEntityTypeAdapter(pc, editor);

        Ext.EventManager.on(this.iframe.getDoc(), 'click', function (e, target) {
            //cancel if over a dropzone.   dont interfere with 
            if (this.chorizoEditor && this.chorizoEditor.isOverGrid()) {
                e.stopEvent();
                return;
            }
            if (!e.browserEvent.defaultPrevented) {
                me.fireEvent('beforeIframeClickNavigate', {
                    url: target.pathname + target.search,
                    fullUrl:target.href
                });

                this.navigate({
                    url: target.href
                });

                e.stopEvent();
            }
        }, this, {
            delegate: 'a'
        });
    },

    onSave: function (button) {
        var tasks = this.entitypeTypeHandler.getSaveTask();

        // button.setDisabled(true);
        button.addCls('taco-button-processing');
        button.setText('Saving...');

        tasks.on({
            complete: function () {
                // button.setDisabled(false);
                if (button) {
                    button.removeCls('taco-button-processing');
                    button.setText('Save');
                }
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
            },
            widgetEditForm,
            entityEditor,
            serverRenderFn;

        cfg.config = Ext.apply({}, def.get('defaultConfig'));

        serverRenderFn = function (jsonData) {
            Ext.fly(body).setStyle('cursor', 'wait');
            Ext.Ajax.request({
                url: '/Widgets/preview',
                jsonData: jsonData,
                callback: function () {
                    Ext.fly(body).setStyle('cursor', 'auto');
                },
                failure: function (response) {
                    var res = Ext.JSON.decode(response.responseText);
                    Taco.MessageBox.alert('Error', 'There was a problem adding the widget: ' + res.message);
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

  



        if (!Ext.isEmpty(def.get('editViewFields')) || !Ext.isEmpty(def.get('customEditor')) || !Ext.isEmpty(def.get('editViewConfig')) || !Ext.isEmpty(def.get('editView'))) {
            
            if (!Ext.isEmpty(def.get('customEditor'))) {
                entityEditor = this.entityEditors.findCustomEditor(def.get('customEditor'));
            
                try {
                    widgetEditForm = eval(entityEditor.get('code'));

                } catch (e) {
                    console.log(e, def.get('customEditor'), entityEditor.get('code'));
                }
            }

            Ext.widget(def.get('editView') || 'taco-widgeteditor', {
                editViewFields: def.get('editViewFields'),
                editViewConfig: def.get('editViewConfig'),
                form: widgetEditForm,
                autoShow: true,
                closeAction: 'destroy',
                widgetData: cfg.config,
                title: def.get('displayName'),
                listeners: {
                    savesuccess: function (modal) {
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
            },
            callbackWrapper,
                entityEditor,
                widgetEditForm;

        callbackWrapper = function (ret, cfg) {
            cfg.callback(ret.output, {
                config: ret.config,
                id: ret.id,
                definitionId: ret.definitionId
            });
        };


        if (!Ext.isEmpty(def.get('editViewFields')) || !Ext.isEmpty(def.get('customEditor')) || !Ext.isEmpty(def.get('editViewConfig')) || !Ext.isEmpty(def.get('editView'))) {

            if (!Ext.isEmpty(def.get('customEditor'))) {
                entityEditor = this.entityEditors.findCustomEditor(def.get('customEditor'));

                try {
                    widgetEditForm = eval(entityEditor.get('code'));

                } catch (e) {
                    console.log(e, def.get('customEditor'), entityEditor.get('code'));
                }
            }
            Ext.widget(def.get('editView') || 'taco-widgeteditor', {
                editViewFields: def.get('editViewFields'),
                editViewConfig: def.get('editViewConfig'),
                form: widgetEditForm,
                autoShow: true,
                closeAction: 'destroy',
                widgetData: cfg.data.config,
                title: def.get('displayName'),
                listeners: {
                    savesuccess: function (modal) {
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
                            },
                            failure: function (response) {
                                var res = Ext.JSON.decode(response.responseText);
                                Taco.MessageBox.alert('Error', 'There was a problem adding the widget: ' + res.message);
                            }
                        });
                    }
                }
            });
        } else {
            callbackWrapper(ret, cfg);
        }
    },

    onSearchTextChange: function (field, newValue) {
        var store = this.productGrid.store;

        if (!newValue) {
            this.sideBar.getLayout().setActiveItem(0);
            return;
        }

        if (this.sideBar.getLayout().getActiveItem() !== this.productGrid) {
            store.extraFilters.clear();
        }

        this.sideBar.getLayout().setActiveItem(this.productGrid);
        store.extraFilters.clear();
        store.addFilter([
            {
                id: 'all',
                property: 'all',
                value: newValue
            }
        ]);
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
        store.extraFilters.add({
            id: "categoryids",
            property: 'categoryids',
            value: navRecord.get('originalId')
        });
        store.load();
    },

    onTreeUrlClick: function (tree, url) {
        this.navigate({
            url: url
        });
    },
    onContentListClick: function (tree, metaData) {

        var me = this;

        Ext.suspendLayouts();
        me.showEntityManagerGrid(metaData);
        me.toggleCard(2);
        me.showHideButtons(['isCreatable']);
        Ext.resumeLayouts(true);

    },
    showEntityManagerGrid: function (metaData) {
        var me = this,
            contentContainer = me.down('#contentListContainer');

        if (Ext.isString(metaData)) {
            if (this.tree.store.isLoading()) {
                this.tree.store.on('load', function () {
                    me.showEntityManagerGrid(metaData);
                }, me, { single: true });
                return;
            }

            Ext.Object.each(this.tree.store.tree.nodeHash, function (key, value) {
                if (value.raw.metaData && value.raw.metaData.entityType === 'cms' && value.raw.metaData.listFQN === metaData) {
                    metaData = value.raw.metaData;
                }
            });
        }


        contentContainer.removeAll();
        contentContainer.add(
            Ext.create('Taco.view.entityManager.Grid', {
                    itemId: 'entityManagerGrid',
                    listeners: {
                        itemedit: me.onContentListItemEdit,
                        scope: me
                    },
                    listMetaData: metaData
                }
            ));

    },
    OnCreateClick: function () {
        var me = this,
            grid = me.down('#entityManagerGrid'),
            listMetaData = grid.listMetaData,
            newRecord = new Taco.model.Entity({
                tenantId: Taco.app.context.getTenantId(),


                listFQN: listMetaData.listFQN || listMetaData.name,
                entityType: listMetaData.entityType,
                documentTypeFQN: listMetaData.documentTypes && listMetaData.documentTypes.length ? listMetaData.documentTypes[0] : undefined,
                properties: {},
                item: {}

            }),
            menu;


        if (listMetaData.documentTypes && listMetaData.documentTypes.length > 1) {
            menu = Ext.widget({
                xtype: 'menu',
                itemHandler: function (cmp) {
                    newRecord.set('documentTypeFQN', cmp.text);
                    me.loadEntityEditor(newRecord);
                }

            });
            Ext.Array.each(listMetaData.documentTypes, function (dType) {
                menu.add({
                    text: dType,
                    handler: menu.itemHandler

                });
            });
            menu.showBy(me.createActionButton);
            return;

        }
        me.loadEntityEditor(newRecord);
    },

    loadEntityEditor: function (record) {
       


        this.pageSettings.removeAll(false);
        this.entitypeTypeHandler = Ext.create('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
            // editor: editor,
            record: record,
            //pageContext: {
            //    cmsContext: {
            //        page: {
            //            listFQN:record.get('listFQN'),
            //            id:record.get('')
            //        }
            //    }  
            //},
            manager: this,
            listeners: {
                load: this.onEntityTypeAdapterLoad,
                //todo see if isWebPage
                //savesuccess: record.phantom ? 
                scope: this
            }
        });
        //   this.showHideButtons(['isWebPage', 'hasSettings', 'isWebPageView', 'isSavable', 'isCreatable']);
        this.showHideButtons(['hasSettings', 'isSavable']);
        this.toggleCard(1);


//contentContainer.removeAll();
        //form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
        //    record: record,
        //    bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
        //    editor: me.entityEditors.findEditor(record)
        //});
        //contentContainer.add(form);

    },


    onContentListItemEdit: function (grid, record) {
        var me = this;
            // cardpanel = me.down('#editorCardPanel'),
            //contentContainer = me.down('#contentListContainer');


        //todo if page.. navigate
        // me.pageEditorTabButton.disable();

        //todo see if is isWebPage...

        me.navigate({ url: '/cms/' + record.get('listFQN') + '/' + record.get('name'), view: 'settings' });
        //me.toggleCard(1);
        return;
        //record.reload({
        //    success: function () {


        //        Ext.suspendLayouts();

        //        contentContainer.removeAll();

        //        contentContainer.add(Ext.create('Taco.view.entityManager.DynamicFormContainer', {
        //            record: record,
        //            bubbleEvents: ['savesuccess', 'saveSuccess'],
        //            editor: me.entityEditors.findEditor(record)
        //        }));


        //        Ext.resumeLayouts(true);
        //    }
        //});


    }

});