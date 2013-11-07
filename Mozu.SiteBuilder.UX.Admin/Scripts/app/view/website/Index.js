/**
 * @class Taco.view.website.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.model.NavigationTreeNode',
        'Taco.store.NavigationTreeNodes',
        'Taco.view.website.Tree'
    ],
    requiresContextOfType: [ 's'],
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

        this.mon(this.controller,'pageload', this.onPageLoad, this);
        this.mon(this.controller,'widgetdrop', this.onWidgetDrop, this);
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
                    itemId:'iframe',
                    xtype: 'uxiframe',
                    src: '/widgettest?iseditmode=true'
                }]
            }, {
                xtype: 'panel',
                title: 'Settings',
                itemId:'settingsPanel',
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
        blog: {
            editors: ["Taco.view.website.dataViews.Blog", "Taco.view.website.dataViews.Meta"],
            adapter: 'Taco.view.website.entityAdapters.DocumentEntityAdapter'
        },
        "default": {
            editors: ["Taco.view.website.dataViews.Meta"],
            adapter: 'Taco.view.website.entityAdapters.DocumentEntityAdapter'
        },
        category: {
            editors: ["Taco.view.category.Basic"],
            adapter: 'Taco.view.website.entityAdapters.CategoryEntityAdapter'
        },
        product: {
            editors: ["Taco.view.product.edit.Inline"],
            adapter: 'Taco.view.website.entityAdapters.ProductEntityAdapter'
        },
        link: {
            editors: [],
            adapter: 'Taco.view.website.entityAdapters.ExternalLinkEntityAdapter'
        }
    },
    getPageSettings:function () {
        return this.iframe.getWin().require.mozuData('pagecontext');
    },
    onPageLoad: function (editor) {
        var pc = getPageSettings();
    },
    onWidgetDrop:function (config) {
        
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
    
    onDirtyChange:function (config) {
        
    },
    
    onWidgetEdit:function (config) {
        

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
