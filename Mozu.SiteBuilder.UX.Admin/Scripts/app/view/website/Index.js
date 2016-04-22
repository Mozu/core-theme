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
        'Taco.core.ux.content.Tooltip',
        'Taco.view.website.entityAdapters.BaseEntityAdapter',
        'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        'Taco.view.website.entityAdapters.ProductEntityAdapter',
        'Taco.core.ux.form.field.QuickFilter',
        'Taco.view.website.WidgetEditor',
        'Taco.view.website.widgetEditors.HorizontalRule',
        'Taco.view.website.widgetEditors.Image',
        'Taco.view.website.widgetEditors.DealOfTheDay',
        'Taco.view.website.WidgetTray',
        'Taco.view.website.entityAdapters.SiteTemplateEntityAdapter',
        'Taco.view.website.entityAdapters.TemplateEntityAdapter',
        'Taco.view.website.entityAdapters.DocumentListEntityAdapter',
        'Taco.view.website.entityAdapters.EmailTemplateEntityAdapter',
        'Taco.view.website.entityAdapters.OrderTemplateEntityAdapter',
        'Ext.ux.IFrame',
        'Taco.store.ThemeListingsTree',
        'Ext.menu.CheckItem',
        'Taco.view.customSchema.Grid',
        'Taco.view.customSchema.DynamicFormContainer',
        'Taco.store.EntityEditors',
        'Taco.store.PageTypeDefinitions',
        'Ext.ux.IFrame',
        'Taco.core.ux.DraftIcon',
        'Taco.view.publishing.modal.PublishSetPicker',
        'Taco.core.ux.content.IndicatorContainer',
        'Taco.core.ux.action.Action',
        'Taco.view.publishing.component.button.PublishButton',
        'Taco.view.navigation.ContextSwitcher',
        'Taco.store.WidgetDefinitions',
        'Taco.store.LayoutWidgetDefinitions',
        'Taco.core.ux.content.SiteViewDropdown',
        'Taco.view.navigation.ContextSwitcherSelector',
        'Taco.core.ux.action.ProgressButton'
    ],
    selectedTheme: '',
    itemId: 'websiteIndex',
    dontFloatHeaderButtons: true,
    hideContextSwitcherBar: true,
    title: false,
    entityTypeEditConfig: {
        blog: 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        'default': 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        category: 'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        product: 'Taco.view.website.entityAdapters.ProductEntityAdapter',
        link: 'Taco.view.website.entityAdapters.ExternalLinkEntityAdapter',
        email: 'Taco.view.website.entityAdapters.EmailTemplateEntityAdapter',
        order: 'Taco.view.website.entityAdapters.OrderTemplateEntityAdapter',
        documentList: 'Taco.view.website.entityAdapters.DocumentListEntityAdapter'
    },
    enableNavHeader: true,
    cancelButtonEnabled: false,
    options: {},
    
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    layout: {
        type: 'fit'
    },
    padding: '0 0 0 0',

    enableSearchBarInHeader: false,

    initComponent: function () {
        var navStore,
            productStore,
            me = this;

        // if (this && this.options && this.options.DO_NOT_RENDER) {
        //     this.callParent(arguments);
        //     return false;
        // }

        this.LayoutEngine = Taco.tenantSettings.newLayoutEngine ? 'CALIENTE' : 'CHORIZO';
        this.entityEditors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');
        this.pageTypeDefinitions = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions');

        this.on({
            navigatecomplete: this.onNavigateComplete,
            navigatestart: this.onNavigateStart,
            scope: this
        });

        this.resolutionOverride = 0;

        this.publishButton =  {
            xtype: 'publishbutton',
            itemId: 'publishActionButton',
            beforeItemId: 'saveActionButton',
            buttonGroup: 'isPublishable',
            hidden: false,
            disabled: true,
            scope: this,
            handler: function() {
                this.publishButton.setLoading(true);
                this.onPublish();
                me.showMessage('Published', 'success');
            },

            onMoveToPublish: function(record, code) {
                me.publishButton.setLoading(true);
                record.setPublishCode(code, function() {
                    me.publishButton.setLoading(false);
                    me.showMessage('Moved to Publish Set', 'success');
                });
            },

            onRemoveFromPublishSet: function(record) {
                me.publishButton.setLoading(true);
                record.setPublishCode(null, function() {
                    me.publishButton.setLoading(false);
                    me.showMessage.bind(me, 'Removed From Publish Set', 'success');
                });
            },

            onDiscardDraft: function(record) {
                me.publishButton.setLoading(true);
                record.discardDraft(function() {
                    me.setPublishable(false);
                    me.publishButton.setLoading(false);
                    me.showMessage('Discarded', 'success');
                    me.down('#draftPill').hide();
                    me.cancel();
                });
            }
        };

        this.moreButtonCfg = {
            scope: this,
            menu: {
                plain: true,
                shadow: false,
                cls: 'taco-more-action-button-menu',
                items: [
                    {  
                        text: 'Preview Theme',
                        itemId: 'previewThemesMenu'
                    },
                    {
                        text: 'Hide Dropzones',
                        itemId: 'hideDropzones',
                        handler: function() {
                            me.isDropZoneShown = !me.isDropZoneShown;
                            me.chorizoEditor.isDropZoneShown = !me.isDropZoneShown;
                            me.chorizoEditor[me.isDropZoneShown ? 'showDropZones' : 'hideDropZones']();
                            this.setText(me.isDropZoneShown ? 'Hide Dropzones' : 'Show Dropzones');
                        }
                    }
                
                ]
            }
        };

        this.tooltip = Ext.create('Taco.core.ux.content.Tooltip', {
            elementSelector: '[data-role="website-draft-pill"]',
            messageKey: 'publishset.publishsetdate',
            arrowPosition: 'top',
            offsetTop: -22,
            showToolTipIcon: false,
            defaultTpl: [
                '<div style="line-height: 15px;">',
                    '<span>Publish Set:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{publishSetName}</span>',
                '</div>',
                '<div style="line-height: 15px;">',
                    '<span>Publish Date:&nbsp;&nbsp;&nbsp;{publishDate}</span>',
                '</div>'
            ],
            defaultTplData: {
                publishSetName: 'Unassigned',
                publishDate: 'Unscheduled'
            }
        });

        this.actions = [
            Ext.create('Taco.view.navigation.ContextSwitcherSelector', {
                supportedLevels: ['s'],
                requiresContextOfType: ['s']
            }),
            {
                xtype: 'container',
                itemId: 'titleDraftContainer',
                flex: 1,
                layout: 'hbox',
                items: [
                    {
                        xtype: 'component',
                        itemId: 'taco-page-title',
                        html: ''
                    },
                    {
                        xtype: 'component',
                        itemId: 'draftPill',
                        hidden: true,
                        afterrender: this.setAction.bind(this),
                        tpl: '<span class="x-column-content-pill x-column-content-pill-dark" data-role="website-draft-pill">Draft</span>',
                        data: {a: 1}
                    }
                ],
                listeners: {
                    afterlayout: this.checkTitleOverflow,
                    scope: this
                }
            },
            {
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
                hidden: true,
                style: {
                    borderRadius: '0px 2px 2px 0px'
                },
                handler: function () {
                    var cardpanel = this.down('#editorCardPanel');

                    cardpanel.getLayout().setActiveItem(2);
                },
                toggleHandler: function (cmp, isPressed) {
                    // this.down('#dropZonesCB').setDisabled(isPressed);
                    this.down('#widgetsActionButton').setDisabled(isPressed);
                }

            },
            {
                xtype: 'taco-siteviewdropdown',
                viewLiveHandler: function() {
                    var url = me.url;
                    window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=live&redir=' + encodeURIComponent(url));
                },
                viewStagedHandler: function() {
                    var url = me.url;
                    window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent(url));
                }
            },
            {
                xtype: 'button',
                height: 40,
                ui: 'link',
                scale: 'medium',
                buttonGroup: 'isSavable',
                itemId: 'cancelActionButton',
                handler: function() {
                    if (me.chorizoEditor._dirty) {
                        me.getRevertModal();
                    }
                },
                scope: me,
                text: 'Cancel',
                margin: '0 0 0 0'
            },
            this.publishButton,
            {
                xtype: 'progressbutton',
                height: 40,
                itemId: 'saveActionButton',
                ui: 'action-primary',
                scale: 'medium',
                buttonGroup: 'isSavable'
            },
            {
                xtype: 'button',
                itemId: 'createActionButton',
                buttonGroup: 'isCreatable',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Create',
                margin: '0 0 0 10',
                height: 40,
                scope: me,
                hidden: true,
                handler: me.OnCreateClick
            }
        ];

        this.firstToggle = true;
        this.isDropZoneShown = true;
        this.controller = Taco.app.controllers.get('Website');
        this.url = this.options && this.options.startUrl ? '/' + this.options.startUrl : '/';

        navStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes');

        productStore = Ext.create('Taco.store.ProductComboBox', {
            autoLoad: false
        });

        this.CALIENTE_TREE_BUTTONS = {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                pack: 'left'
            },
            cls: 'taco-website-subheader taco-above-tree',
            items: [
                {
                    xtype: 'button',
                    ui: 'link',
                    scale: 'small',
                    scope: me,
                    text: 'Pages',
                    toggleGroup: 'aboveTreeButtons',
                    pressed: true,
                    pressedCls: 'active',
                    allowDepress: false,
                    enableToggle: true,
                    cls: 'taco-link-button',
                    handler: function() {
                        this.sideBar.getLayout().setActiveItem(0);
                    }

                },
                {
                    xtype: 'button',
                    ui: 'link',
                    scale: 'small',
                    scope: me,
                    toggleGroup: 'aboveTreeButtons',
                    allowDepress: false,
                    enableToggle: true,
                    text: 'Widgets',
                    pressedCls: 'active',
                    cls: 'taco-link-button',
                    handler: function() {
                        this.sideBar.getLayout().setActiveItem(1);
                    }
                },
            ]
        };

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
                        dockedItems: this.getSubheader(),
                        items: [
                            {

                                itemId: 'pageEditor',
                                isWebEditor: true,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                cls: 'taco-website-holder taco-navheader',
                                items: [
                                    {
                                        xtype: 'component',
                                        itemId: 'leftIframeOffset',
                                        width: 0
                                    },
                                    {
                                        flex: 1,
                                        itemId: 'iframe',
                                        xtype: 'uxiframe',
                                        cls: 'taco-website-iframe',
                                        src: this.getStartUrl()
                                    },
                                    {
                                        xtype: 'component',
                                        itemId: 'rightIframeOffset',
                                        width: 0
                                    }
                                ]
                            }, 
                            {
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
                            }, 
                            {
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
                                store: navStore,
                                url: this.url
                            },
                            {
                                xtype: 'taco-widget-tray',
                                controller: this.controller
                            },
                            {
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
                            this.CALIENTE_TREE_BUTTONS,
                            {
                                xtype: 'taco-quickfilter',
                                emptyText: 'Search',
                                triggerCls: 'x-form-search-trigger',
                                cls: 'taco-quickfilter-bar website',
                                flex:1,
                                width: '100%',
                                style: {
                                    marginTop: 0, //DONT REMOVE
                                },
                                listeners: {
                                    change: this.onSearchTextChange,
                                    scope: this,
                                    buffer: 505
                                }

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

        this.themeStore = Ext.create('Taco.store.ThemeListingsTree', {
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
        this.container = this.down('.taco-website-holder');
        this.titleDraftContainer = this.navHeader.down('#titleDraftContainer');
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
        this.tree.on('navigationchange', this.onNavigationChange, this);
        this.tree.on('load', this.createEntityTables, this);

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

    getSubheader: function() {
        var me = this;

        return {
            xtype: 'toolbar',
            cls: 'taco-website-subheader',
            items: [
                {
                    xtype: 'panel',
                    flex: 1,
                    items : [
                        { 
                            xtype: 'panel',
                            width: 210, // width of button group / 2 so we can center the buttons below
                            items: [
                                me.getPageEditorButton(),
                                me.getLayoutButton(),
                                me.getSettingsButton(), 
                            ]
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    flex: 1,
                    style: {
                        top: 0,
                        marginLeft: '-105px',
                    },
                    items : [       
                        me.getDesktopButton(),
                        me.getTabletButton(),
                        me.getPhoneButton()
                    ]
                }
            ]
        }
    },

    getPublishRecord: function() {
        return this.publishRecord;
    },
    getDesktopButton: function() {
        return {
            xtype: 'button',
            cls: 'taco-website-resolution-btn desktop',
            scale: 'small',
            style: {
                margin: '0 5px'
            },
            scope: this,
            handler: function() {
                this.resolutionOverride = 0;
                this.resizeIframeSpacers(this.getWidthForFrameAndSpacers.call(this), this.resolutionOverride);
            }
        };
    },

    getTabletButton: function() {
        return {
            xtype: 'button',
            cls: 'taco-website-resolution-btn tablet',
            scale: 'small',
            style: {
                margin: '0 5px'
            },
            scope: this,
            handler: function() {
                this.resolutionOverride = 768;
                this.resizeIframeSpacers(this.getWidthForFrameAndSpacers.call(this), this.resolutionOverride);
            }
        };
    },

    getPhoneButton: function() {
        return {
            xtype: 'button',
            cls: 'taco-website-resolution-btn phone',
            scale: 'small',
            style: {
                margin: '0 5px'
            },
            scope: this,
            handler: function() {
                this.resolutionOverride = 480;
                this.resizeIframeSpacers(this.getWidthForFrameAndSpacers.call(this), this.resolutionOverride);
            }
        };
    },

    getPageEditorButton: function() {
        return {
            xtype: 'button',
            cls: 'taco-link-button',
            ui: 'link',
            scale: 'small',
            text: 'Content',
            pressedCls: 'active',
            toggleGroup: 'websiteEditorTabs',
            itemId: 'pageEditorTabButton',
            buttonGroup: 'isWebPage',
            allowDepress: false,
            enableToggle: true,
            pressed: true,
            scope: this,
            handler: function () {
                var cardpanel = this.down('#editorCardPanel');

                // if (this.LayoutEngine === 'CALIENTE') {
                    this.widgetTray.showContentWidgets(true);
                    this.widgetTray.showLayoutWidgets(false);
                    this.chorizoEditor.showLayoutHeaders(false);
                // }

                cardpanel.getLayout().setActiveItem(0);

                this.chorizoEditor.hideLayouts = true;
            }
        };
    },

    getLayoutButton: function() {

        var config =  {
            xtype: 'button',
            cls: 'taco-link-button',
            ui: 'link',
            scale: 'small',
            text: 'Layout',
            pressedCls: 'active',
            toggleGroup: 'websiteEditorTabs',
            itemId: 'layoutTabButton',
            buttonGroup: 'isWebPage',
            allowDepress: false,
            enableToggle: true,
            pressed: false,
            margin: '0 0 0 0',
            scope: this,
            handler: function () {
                var cardpanel = this.down('#editorCardPanel');

                this.chorizoEditor.showLayoutHeaders(true);
                this.widgetTray.showContentWidgets(false);
                this.widgetTray.showLayoutWidgets(true);
                cardpanel.getLayout().setActiveItem(0);

                this.chorizoEditor.hideLayouts = false;
            }
        };

        return config;
    },

    showMessage: function(msg, type) {
        Taco.app.fireEvent('setmessage', msg, type);
    },

    getSettingsButton: function() {
        return {
            xtype: 'button',
            cls: 'taco-link-button',
            ui: 'link',
            scale: 'small',
            pressedCls: 'active',
            buttonGroup: 'hasSettings',
            itemId: 'pageSettingsTabButton',
            toggleGroup: 'websiteEditorTabs',
            text: 'Settings',
            allowDepress: false,
            enableToggle: true,
            scope: this,
            handler: function () {
                var cardpanel = this.down('#editorCardPanel');
                cardpanel.getLayout().setActiveItem(1);
            },
            toggleHandler: function (cmp, isPressed) {
                // this.down('#hideDropzones').setDisabled(isPressed);
                // this.down('#widgetsActionButton').setDisabled(isPressed);
            }
        };
    },
    createEntityTables: function(store) {

        if (this.entityList && store.tree.nodeHash._cmsContentTypes) {

            var list = store.tree.nodeHash._cmsContentTypes.childNodes[0];

            this.navigate({url: this.url, metaData: list.raw.metaData});
            this.onNavigateComplete();
        }
    },

    getStartUrl: function() {

        if (/-content-list-/.test(this.url)) {
            this.entityList = true;
            return '';
        }

        return '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend(this.url, 'iseditmode=true&SBTHEME=' + this.selectedTheme));
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

    getWidgetType: function(type) {
        //if type is undefined, were using chorizo, so it's a widget -- not a layout
        if (!type) return true;
        return type === 'content';
    },

    getWidgetDefinitions: function (cfg) {
        var storeType = this.getWidgetType(cfg.type) ? 'Taco.store.WidgetDefinitions' : 'Taco.store.LayoutWidgetDefinitions';
        var themeId = this.getPageContext().themeId;
        var store = Taco.core.data.StoreManager.getOrCreate({
            id: storeType + themeId,
            type: storeType,
            themeId: themeId
        });
        return store;

    },
    getCardPanel: function () {
        this.cardpanel = this.cardpanel || this.down('#editorCardPanel');
        return this.cardpanel;
    },
    toggleCard: function (item) {

        this.cardpanel = this.cardpanel || this.down('#editorCardPanel');

        this.cardpanel.getLayout().setActiveItem(item);

        this.setActiveButton(item);

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
            },
            hash = this.themeStore.tree.nodeHash;

        Object.keys(hash).forEach(function (key) {
            var rec = hash[key];

            if (rec.get('name') && rec.isLeaf()) {
                menu.items.push({
                    xtype: 'menucheckitem',
                    text: rec.get('name'),
                    checked: rec.get('isSelectedDesktop'),
                    group: 'selectedTheme',
                    handler: function (menuItem) {
                        me.selectedTheme = rec.get('id');
                        me.navigate({
                            url: me.url
                        });
                        menuItem.setChecked(true);
                    }

                });
            }
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
        var cls = this.entityTypeEditConfig[pageContext.pageType || 'default'] || this.entityTypeEditConfig['default'];

        if ((pageContext.editMode || '').toLowerCase() === 'template') {
            cls = 'Taco.view.website.entityAdapters.TemplateEntityAdapter';
        } else if ((pageContext.editMode || '').toLowerCase() === 'site') {
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

    setPublishRecord: function(entityHandler) {

        var record = entityHandler.getDocument();

        this.publishRecord = record;

        this.publishButton.addRecord(record);

        this.updateDraftIcon(record);

        this.updateHeaderTitle(null, entityHandler.getTitle());
    },

    updateDraftIcon: function(record) {
        
        var me = this;

        if (record && record.get('publishState') && record.get('publishState') && record.get('publishState') !== 'active') {

            var pubInfo = record.getPublishingInfo();

            if (pubInfo.publishSetInfo) {

                var callback = function(record) {
                    var date = record.get('publishDate') ? Ext.Date.format(record.get('publishDate'), 'M j, Y g:ia T') : 'Unscheduled';
                    me.pubRecord = record;
                    me.down('#draftPill').show();
                    
                    me.tooltip.update({
                        publishSetName: me.pubRecord.get('name'),
                        publishDate: me.pubRecord.get('publishDate') ? Ext.util.Format.date(me.pubRecord.get('publishDate'), 'M j, Y g:ia T') : 'Unscheduled'
                    });
                };

                Ext.Ajax.request({
                    url: '/admin/app/publishsets/getBy/' + pubInfo.publishSetInfo.code,
                    method: 'GET',
                    success: function (res, status) {
                        var record = Ext.create('Taco.model.PublishSet', JSON.parse(res.responseText).items[0]);
                        callback(record);
                    },
                    failure: function() {
                        Taco.app.fireEvent('setmessage', 'Error Retrieving Publish Set Information', 'error');
                    }
                }, this);

            }

            else {
                this.down('#draftPill').show();
                me.tooltip.update({
                    publishSetName: 'Unassigned',
                    publishDate: 'Unscheduled'
                });
            }

        }

        else {
            this.down('#draftPill').hide();
        }
    },

    setAction: function(toolTip) {
        var pubInfo = this.getPublishRecord();

        if (pubInfo.get('publishSetCode')) {
            Ext.create('Taco.core.ux.action.Action', {
                text: this.pubRecord.get('name'),
                renderTo: 'publishSetName',
                listeners: {
                    click: {
                        fn: function(cmp) {
                            toolTip.tipContent.hide();
                            Taco.app.StateManager.attemptNavigate('/publishing/publishsets/' + pubInfo.get('publishSetCode'));
                        }
                    }
                }
            });
        }

    },

    getPageContext: function () {
        return this.iframe.getWin().require.mozuData('pagecontext');
    },

    onNavigateStart: function () {
        var me = this;
        // window.clearTimeout(this.loadingMaskTaskId);
        // this.loadingMaskTaskId = Ext.defer(function () {
        //     // me.getCardPanel().setLoading(true);
        // }, 500, this);
    },
    onNavigateComplete: function () {
        var me = this;
        // me.getCardPanel().setLoading(false);
        // window.clearTimeout(this.loadingMaskTaskId);
    },

    navigate: function (config) {

        if (!config.metaData) {

            var parser = document.createElement('a');
            parser.href = config.url;


            // not a real way to tell if a non http/https url is relative
            if (parser.hostname && (parser.hostname ).toLowerCase() !== ( window.location.hostname || '').toLowerCase()) {
                Ext.Msg.alert('Attention', 'editing of url [<b><a href="' + parser.href + '" target="_blank">' + parser.href + '</a></b>] not supported');
                return;
            }

            config.url = parser.pathname + parser.search;

            if (config.url.length && config.url[0] !== '/') {
                config.url = '/' + config.url;
            }

            this.fireEvent('navigatestart', this, config);
            //  this.showHideButtons([]);
            this.url = config.url;

            this.pageSettings.removeAll(true);

            this.setIFrameLocation(config);

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
        }

        //loading a content list
        else {
            Ext.suspendLayouts();
            this.showEntityManagerGrid(config.metaData);
            this.toggleCard(2);
            this.showHideButtons(['isCreatable']);
            Ext.resumeLayouts(true);
            Taco.core.StateManager.addState('website/page' + config.url);
        }

    },

    setIFrameLocation: function(config) {

        var url = Ext.String.urlAppend(config.url, 'iseditmode=true&SBTHEME=' + this.selectedTheme+'&cb='+ new Date().getTime()),
            emailQueryParams = window.emailParams;

        if (emailQueryParams) {
            url += '&queryParams=' + JSON.stringify(emailQueryParams);
        }

        this.iframe.getWin().location.href = url;
    },

    setActiveButton: function(item) {
        var cardButtons = {
            0: '#pageEditorTabButton',
            1: '#pageSettingsTabButton',
            3: '#contentGridTabButton'
        },
        button = this.down(cardButtons[item]);

        if (button && button.toggle) button.toggle(true);
    },
    onNavigationChange:function () {

        this.reloadPage();
    },
    reloadPage: function () {

        var win = this.iframe.getWin();

        if (win && win.location.pathname && this.url )
        {
            if (win.location.pathname.toLowerCase().indexOf(this.url.toLowerCase()) === 0 && win.document.readyState !== 'complete') {
                return;
            }
            if (win.location.pathname.toLowerCase().indexOf(this.url.toLowerCase()) === -1 ) {
                return;
            }
        }

        this.navigate({ url: this.url });

    },

    onDirtyChange: Ext.emptyFn,

    onEntityTypeAdapterLoad: function () {
        var settings = this.entitypeTypeHandler.getPageSettings();

        this.setPublishRecord(this.entitypeTypeHandler);

        this.pageSettings.add(settings);
    },

    onPageLoad: function (editor) {
        var me = this,
            pc = this.getPageContext();

        this.fireEvent('navigatecomplete', this, { url: this.url });

        this.showHideButtons(['isWebPage', 'hasSettings', 'isSavable', 'isWebPageView', 'isPublishable']);

        if (!this.getActiveCard().isWebEditor) {
            this.toggleCard(0);
        }

        this.chorizoEditor = editor;
        this.setPublishable(false);
        this.widgetTray = this.down('#taco-widget-tray');


        if (this.isDropZoneShown) {
            this.chorizoEditor.areDropzonesHidden = false;
            this.chorizoEditor.showDropZones();
        }

        else {
            this.chorizoEditor.areDropzonesHidden = true;
            this.chorizoEditor.hideDropZones();
        }

        if (this.down('#pageEditorTabButton').pressed) {
            this.chorizoEditor.hideLayouts = true;
            this.widgetTray.showContentWidgets(true);
            this.widgetTray.showLayoutWidgets(false);
        }

        else {
            this.chorizoEditor.hideLayouts = false;
            this.widgetTray.showContentWidgets(false);
            this.widgetTray.showLayoutWidgets(true);
        }

        window.addEventListener("resize", function () {
            // have to delay because browsers throw this event before the resize finishes.
            setTimeout(function(){
                me.resizeIframeSpacers(me.getWidthForFrameAndSpacers.call(me), me.resolutionOverride);
            }, 150);
        });

        this.entitypeTypeHandler = this.createEntityTypeAdapter(pc, editor);

        Ext.EventManager.on(this.iframe.getDoc(), 'click', function (e, target) {

            if (this.chorizoEditor && this.chorizoEditor._dirty) {
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

        button.startLoading();

        tasks.on({
            complete: function () {
                if (button) {
                    button.stopLoading();   
                }
            }
        });

        tasks.execute();
    },

    onPublish: function () {
        this.entitypeTypeHandler.publish();
        this.updateDraftIcon();
    },

    onWidgetDrop: function (cfg, isDragEvent) {
        var me = this,
            pageContext = this.getPageContext(),
            def = this.getWidgetDefinitions(cfg).getById(cfg.widgetTypeId),
            body = this.iframe.getDoc().body,
            jsonData = {
                zoneScope: 'page',
                source: pageContext.cmsContext.page,
                definitionId: cfg.widgetTypeId,
                widgetType: cfg.type
            },
            widgetEditForm,
            entityEditor,
            serverRenderFn;

        if (!isDragEvent) {
            cfg.config = Ext.apply({}, def.get('defaultConfig'));
        }

        //otherwise we default to the passed in config
        else {
            cfg.config = cfg.data.config;
        }

        serverRenderFn = function (jsonData) {
            Ext.fly(body).setStyle('cursor', 'wait');
            Ext.Ajax.request({
                url: me.getWidgetType(jsonData.widgetType) ? '/Widgets/widgetPreview' : '/Widgets/layoutPreview',
                jsonData: me.formatWidgetJSON(jsonData),
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
                        definitionId: ret.definitionId,
                        type: cfg.type
                    });

                }
            });
        };





        if (!Ext.isEmpty(def.get('editViewFields')) || !Ext.isEmpty(def.get('customEditor')) || !Ext.isEmpty(def.get('editViewConfig')) || !Ext.isEmpty(def.get('editView'))) {

            if (!Ext.isEmpty(def.get('customEditor'))) {
                entityEditor = this.entityEditors.findCustomEditor(def.get('customEditor'));

                try {
                    /*jslint evil: true */
                    widgetEditForm = eval(entityEditor.get('code'));

                } catch (e) {
                    console.log(e, def.get('customEditor'), entityEditor.get('code'));
                }
            }

            //if the widget declares the it wants to ingore the editor, by pass it, render the default config
            if (!cfg.ignoreEditor) {
                Ext.widget(def.get('editView') || 'taco-widgeteditor', {
                    editViewFields: def.get('editViewFields'),
                    editViewConfig: def.get('editViewConfig'),
                    form: widgetEditForm,
                    autoShow: true,
                    closeAction: 'destroy',
                    widgetData: cfg.config,
                    title: def.get('displayName'),
                    itemId: 'widgetEditor',
                    layout: 'fit',
                    listeners: {
                        savesuccess: function (modal) {
                            jsonData.config = modal.widgetData;

                            serverRenderFn(jsonData);

                        }
                    }
                });
            }

            else {
                jsonData.config = cfg.config;

                serverRenderFn(jsonData);
            }

        } else {
            jsonData.config = cfg.config;

            serverRenderFn(jsonData);
        }
    },

    onWidgetEdit: function (cfg) {
        var me = this,
            pageContext = this.getPageContext(),
            def =  this.getWidgetDefinitions(cfg).getById(cfg.data.definitionId),
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
                    /*jslint evil: true */
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
                itemId: 'widgetEditor',
                title: def.get('displayName'),
                listeners: {
                    savesuccess: function (modal) {
                        jsonData.config = modal.widgetData;

                        if (!cfg.layoutCallback) {
                            Ext.fly(body).setStyle('cursor', 'wait');
                            Ext.Ajax.request({
                                url: '/Widgets/widgetPreview',
                                headers: { 'x-vol-dataview-mode': 'Pending' },
                                jsonData: me.formatWidgetJSON(jsonData),
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

                        else {
                            cfg.layoutCallback(me.formatWidgetJSON(jsonData));
                        }
                    }
                }
            });
        } else {
            callbackWrapper(null, cfg);
        }
    },

    formatWidgetJSON: function(data) {

        // removing unnecessary properties from layout editor
        Object.keys(data.config).forEach(function(k){
            if (k.indexOf('mz-layout-radiofield') != -1 || k.indexOf('widthType') != -1) {
                delete data.config[k];
            }
        });
        return data;
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
            id: 'categoryids',
            property: 'categoryids',
            value: navRecord.get('originalId')
        });
        store.load();
    },

    onTreeUrlClick: function (tree, url, record) {

        this.navigate({
            url: record.get('url')
        });
    },

    updateHeaderTitle: function(cmp, title) {

        var tree = this.down('taco-website-tree'),
            selection = tree.getSelectionModel().getSelection(),
            homePageNode,
            keys = Object.keys(tree.store.tree.nodeHash);

        //if selection is empty -- we grab the node that isHomePage
        if (selection.length === 0) {
            homePageNode = tree.getHomePage();

            if (homePageNode)tree.selectPath(homePageNode.getPath());
        }

        this.down('#taco-page-title').update( '<h2 class="page-title">' + title + '</h2>');
    },

    onContentListClick: function (tree, metaData) {

        var me = this;

        me.navigate({url: '/-content-list-/' + metaData.listFQN, metaData: metaData});

        // Ext.suspendLayouts();
        // me.showEntityManagerGrid(metaData);
        // me.toggleCard(2);
        // me.showHideButtons(['isCreatable']);
        // Ext.resumeLayouts(true);

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

        this.listMetaData = metaData;

        this.record = new Taco.model.Entity({
            tenantId: Taco.app.context.getTenantId(),
            listFQN: metaData.listFQN || metaData.name,
            entityType: metaData.entityType,
            documentTypeFQN: metaData.documentTypes && metaData.documentTypes.length ? metaData.documentTypes[0] : undefined,
            properties: {},
            listFlags: {
                enableADR: metaData.enableActiveDateRanges,
                enablePublishing: metaData.enablePublishing
            },
            item: {}
        });

        // this.entitypeTypeHandler = Ext.create('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
        //     record: this.record,
        //     manager: me,
        //     listeners: {
        //         load: me.onEntityTypeAdapterLoad,
        //         scope: me
        //     }
        // });

        contentContainer.removeAll();

        contentContainer.add(
            Ext.create('Taco.view.customSchema.Grid', {
                    itemId: 'entityManagerGrid',
                    listeners: {
                        itemclick: me.onContentListItemEdit,
                        scope: me
                    },
                    listMetaData: metaData,
                    siteBuilderList: true,
                    viewContainer: contentContainer,
                    saveButton: me.down('#saveActionButton')
                }
            ));

    },
    OnCreateClick: function () {
        var me = this,
            listMetaData = me.listMetaData,
            newRecord = new Taco.model.Entity({
                tenantId: Taco.app.context.getTenantId(),
                listFQN: listMetaData.listFQN || listMetaData.name,
                entityType: listMetaData.entityType,
                documentTypeFQN: listMetaData.documentTypes && listMetaData.documentTypes.length ? listMetaData.documentTypes[0] : undefined,
                properties: {},
                listFlags: {
                    enableADR: listMetaData.enableActiveDateRanges,
                    enablePublishing: listMetaData.enablePublishing
                },
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
            record: record,
            manager: this,
            listeners: {
                load: this.onEntityTypeAdapterLoad,
                //todo see if isWebPage
                scope: this
            }
        });

        this.showHideButtons(['hasSettings', 'isSavable']);
        this.toggleCard(1);
    },


    onContentListItemEdit: function (grid, record) {
        var me = this;
        //todo if page.. navigate

        //todo see if is isWebPage...

        me.navigate({ url: '/cms/' + record.get('listFQN') + '/' + record.get('name'), view: 'settings' });
        return;
    },

    getWidthForFrameAndSpacers : function() {
        // for some reason, the container reports its width as including the sidebar portion, so we have to remove it here.
        return this.container.getWidth() - this.sideBar.getWidth();
    },

    resizeIframeSpacers : function(maxSpace, spaceToReserve) {
        var me = this;

        var leftoffset = me.down('#leftIframeOffset');
        var rightoffset = me.down('#rightIframeOffset');

        if (spaceToReserve === 0) {
            leftoffset.setWidth(0);
            rightoffset.setWidth(0);
        } else {
            var allotedWidth = maxSpace - spaceToReserve;
            var availableWidth = Math.max(allotedWidth, 0); // handle negatives ok?

            leftoffset.setWidth(availableWidth / 2);
            rightoffset.setWidth(availableWidth / 2);
        }
    },
    getRevertModal: function() {

        var me = this;

        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: 'Discard Changes?',
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: 'Ok',
            secondaryText: 'Review Changes',
            primaryHandler: function() {
                me.cancel();
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
                        html: 'This page has unsaved changes. Press Ok to discard all changes, or Review Changes to stay on the current page.'
                    })
                ]
            }]
        }).show();

    },

    checkTitleOverflow: function () {
        var innerEl = this.titleDraftContainer.getEl().down('.x-box-inner'),
            titleEl = innerEl.down('.page-title'),
            draftCmp = this.titleDraftContainer.items.getAt(1),
            width = innerEl.getWidth(),
            scrollWidth = innerEl.dom.scrollWidth,
            maxWidth = width - 50;

        if (!this.checkTitleOverflowStack) {
            this.checkTitleOverflowStack = 1;
        }

        if (!this.checkTitleOverflowBufferMax) {
            this.checkTitleOverflowBufferMax = 50;
        }

        clearTimeout(this.checkTitleOverflowStackTimeout);

        this.checkTitleOverflowStackTimeout = setTimeout(function () {
            this.checkTitleOverflowStack = 1;
        }.bind(this), 1000);

        this.checkTitleOverflowStack++;

        if (this.checkTitleOverflowStack > 20) {
            this.checkTitleOverflowBufferMax = 500;
            return;
        }

        if (draftCmp) {
            maxWidth -= draftCmp.getWidth();
        }

        if (Date.now() - this.buffer < this.checkTitleOverflowBufferMax || !titleEl) {
            return;
        }

        this.buffer = Date.now();

        if (width < scrollWidth) {
            this.last = true;
            titleEl.setWidth(maxWidth);
            this.titleDraftContainer.updateLayout();
        } else {
            if (this.last) {
                this.buffer = 0;
            }
            this.last = false;
            titleEl.setWidth(null);
            this.titleDraftContainer.updateLayout();
        }
    }
});

