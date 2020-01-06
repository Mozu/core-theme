/**
 * @class  Taco.view.publishing.Edit
 */

Ext.define('Taco.view.publishing.Drafts', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.publishing.Form',
        'Taco.core.ux.grid.plugins.AutoSelect',
        'Taco.view.publishing.component.DraftGridToolBar'
    ],
    typeName: 'Publish Set',
    formCls: 'Taco.core.ux.form.Form',
    enableSearchBarInHeader: false,
    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },
    autoTitle: true,
    autoScroll: false,
    title: 'Drafts',
    header: false,
    addContentViewPadding: true,

    cancelButtonVisible: false,
    saveButtonVisible: false,
    layout: 'fit',
    style: 'padding-top:10px;',
    initComponent: function () {

        var me = this;

        this.moreButtonCfg = {
            menu: {
                cls: 'taco-ellipsis-split-button',
                items: [
                    {
                        xtype: 'menucheckitem',
                        text: 'Show Assigned Drafts',
                        checked: true,
                        handler: this.updateStores.bind(this),

                    }
                ]
            }
        };

        this.panel = Ext.create('Ext.panel.Panel', {
            title: false,
            type: 'publishSetContents',
            layout: {
                type: 'card'
            },
            header: false,
            tbar: Ext.create('Taco.view.publishing.component.DraftGridToolBar', {
                parentScope: me,
                toolbarTitle: 'Drafts',
                buttons: true,
                onSelection: me.onToolBarSelection,
                advancedSearchConfig: {
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.DraftProduct',
                    emptySearchText: 'Search'
                }
            }),
            style: {
                border: 'none'
            },
            items: [
                Ext.create('Taco.view.publishing.grid.Draft', {
                    scope: this,
                    title: false,
                    uniqueId: 'Product',
                    type: 'drafts',
                    statefulId: 'draft-product',
                    hideSearchBar: true,
                    storeConfig: {
                        name: 'Taco.store.PublishSetItems',
                        options:  {
                            code: 'all',
                            type: 'product',
                            filterByCatalog: false,
                            listeners: {
                                load: {
                                    fn: function(store) {
                                        if (store.lastOperation.exception) {
                                            Taco.app.fireEvent('setmessage', 'There was an error retrieving product drafts', 'error');
                                        }
                                    },
                                    single: true
                                }
                            }
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.DraftProduct',
                    listeners: {
                        afterrender: function(cmp) {
                            // cmp.searchToolbar.add(this.getFilterCheckBox('productCheckbox'));
                        },
                        scope:this
                    }
                }),
                Ext.create('Taco.view.publishing.grid.Draft', {
                    scope: this,
                    title: false,
                    uniqueId: 'Content',
                    hideSearchBar: true,
                    statefulId: 'draft-content',
                    type: 'drafts',
                    storeConfig: {
                        name: 'Taco.store.PublishSetItems',
                        options:  {
                            code: 'all',
                            type: 'cms',
                            listeners: {
                                load: {
                                    fn: function(store) {
                                        if (store.lastOperation.exception) {
                                            Taco.app.fireEvent('setmessage', 'There was an error retrieving content drafts', 'error');
                                        }
                                    },
                                    single: true
                                }
                            }
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.DraftContent'
                })
            ]
        });

        this.items = [this.panel];
        
        this.callParent(arguments);
    },

    updateStores: function(cmp, eventData) {
        
        var checked = cmp.checked;
        var code = checked ? 'all' : 'unassigned';
        
        this.down('#product').store.read({code: code, type: 'product'});
        this.down('#content').store.read({code: code, type: 'cms'});
        
    }
});