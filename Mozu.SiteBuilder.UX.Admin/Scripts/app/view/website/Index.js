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
                    xtype: 'uxiframe',
                    src: '/widgettest?iseditmode=true'
                }]
            }, {
                xtype: 'panel',
                title: 'Settings',
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
