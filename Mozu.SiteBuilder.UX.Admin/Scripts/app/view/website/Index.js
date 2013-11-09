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
        'Taco.view.website.entityAdapters.ProductEntityAdapter'
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
                margin: '0 0 0 10',
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


        this.mon(this.controller, 'pageload', this.onPageLoad, this);
        this.mon(this.controller, 'widgetdrop', this.onWidgetDrop, this);
        this.mon(this.controller, 'widgetedit', this.onWidgetEdit, this);
        this.mon(this.controller, 'pagedirtychange', this.onDirtyChange, this);
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
                        src: '/_gosite/' + Taco.app.context.getSiteId() + '?redir=' + encodeURIComponent(Ext.String.urlAppend(this.options && this.options.startUrl ? this.options.startUrl : '/widgettest', 'iseditmode=true'))
                    }]
                }, {
                    xtype: 'panel',
                    title: 'Settings',
                    itemId: 'settingsPanel',
                    header: false,
                    items: [{
                        xtype: 'formform',
                        itemId: 'pageSettings',
                        ui: 'subform',
                        title: 'Page Settings',
                        margin: '20 30 10 30',
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'foo',
                            emptyText: 'bar',
                            allowOnlyWhitespace: false
                        }]
                    }]
                }],
            dockedItems: [{
                dock: 'right',
                title: 'Sidebar',
                padding: '0 0 10',
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

        this.down('#pageSettings').getForm().getBoundItems().add(this.down('#primaryAction'));

        this.down('#primaryAction').setHandler(function () {
            console.log('handler updated');
        });
        this.iframe = this.down('#iframe');
        this.settingsPanel = this.down('#settingsPanel');
        window.webSiteIndex = this;
    },

    entityTypeEditConfig: {
        blog: 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        "default": 'Taco.view.website.entityAdapters.DocumentEntityAdapter',
        category: 'Taco.view.website.entityAdapters.CategoryEntityAdapter',
        product: 'Taco.view.website.entityAdapters.ProductEntityAdapter',
        link: 'Taco.view.website.entityAdapters.ExternalLinkEntityAdapter'
    },

    getPageContext: function () {
        return this.iframe.getWin().require.mozuData('pagecontext');
    },

    navigate: function (config) {
        this.iframe.getWin().location.href = Ext.String.urlAppend(config.url, 'iseditmode=true');
        Taco.core.StateManager.addState('website/page' + config.url);
    },

    onPageLoad: function (editor) {
        var me = this,
            pc = this.getPageContext(),
            entitypeTypeHandler = Ext.create(this.entityTypeEditConfig[pc.pageType || "default"], {
                editor: editor,
                manager: this
            });


        Ext.EventManager.on(this.iframe.getDoc(), 'click', function (e, target, eOpts) {
            if (target.hostname == this.iframe.getWin().location.hostname) {
                me.fireEvent('beforeIframeClickNavigate', { url: target.pathname + target.search });
                this.navigate({
                    url: target.pathname + target.search
                });
                e.stopEvent();
            }


        }, this, {
            delegate: 'a'
        });


        this.loadSettings();
    },
    loadSettings: function () {

    },

    onWidgetDrop: function (config) {
        var pageContext = this.getPageContext(),
            jsonData = {
                zoneScope: 'page',
                source: pageContext.cmsContext.page,
                definitionId: config.widgetTypeId
            };

        var def = this.widgetDefinitions.getById(config.widgetTypeId);
        
        
        //Ext.defer(
        //    function () {
        //        var markup;
        //        if (config.widgetTypeId == 'text') {
        //            markup = '<div><h1>hi mom' + Ext.Number.randomInt(1, 10000000) + '</h1><div>im herer</div></div>';
        //            config.callback(markup, {
        //                id: 'id-' + Ext.Number.randomInt(1, 10000000),
        //                //widgetTypeDefinition of the widget instance
        //                typeId: config.widgetTypeId,
        //                //specific instance config info for the widget
        //                config: {
        //                    body: markup
        //                }
        //            });

        //        } else {
        //            markup = ' <div class="mz-cms-image-cover" style="background-image: url(\'http://arnoldthemethodical.files.wordpress.com/2007/06/small_cat_astonished.jpg\'); height:200px;"></div>';
        //            config.callback(markup, {
        //                id: 'id-' + Ext.Number.randomInt(1, 10000000),
        //                //widgetTypeDefinition of the widget instance
        //                typeId: config.widgetTypeId,
        //                //specific instance config info for the widget
        //                config: {
        //                    src: markup,
        //                    alt: 'steve',
        //                    height:200
        //                }
        //            });
        //        }


        //    }, 700);
        

        if (config.widgetTypeId == 'content' ) {
            jsonData.config = {
                body: '<div><h1>hi mom' + Ext.Number.randomInt(1, 10000000) + '</h1><div>im herer</div></div>'
            };

        }

        Ext.Ajax.request({
            url: '/Widgets/preview',
            jsonData: jsonData,
            success: function (response) {
                var ret = Ext.JSON.decode(response.responseText);

                config.callback(
                    ret.output,
                    ret.config
                );

            }
        });


        //pc.cmsContext.page
        //{
        //    //the editor firing the event
        //    editor: editor,
        //    //the widgetTypeId of the widgetBeing dropped
        //    widgetTypeId: 'qewr-asdf-asdf',
        //    //callback method to be called when content and data are ready to be inserted into the page
        //    // html is the markup to be inserted the 
        //    // data is the persistable widgetInstanceData of the widget
        //    callback: function (html, data) {

        //    }


    },

    onDirtyChange: function (config) {

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


    }


    // onRender: function () {
    //     this.callParent(arguments);

    //     Ext.defer(function () {
    //         var header = this.getHeader();

    //         if (header && header.isComponent) {
    //             header.updateLayout();
    //         }
    //     }, 600, this);
    // }
});