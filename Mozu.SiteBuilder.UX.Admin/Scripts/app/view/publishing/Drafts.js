/**
 * @class  Taco.view.publishing.Edit
 */

Ext.define('Taco.view.publishing.Drafts', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.publishing.Form',
        'Taco.core.ux.grid.plugins.AutoSelect'
    ],
    typeName: 'Publish Set',
    formCls: 'Taco.core.ux.form.Form',

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },
    autoTitle: true,
    autoScroll: false,
    title: 'Drafts',
    header: false,
    cancelButtonVisible: false,
    saveButtonVisible: false,
    layout: 'fit',
    style: 'padding-top:10px;',
    initComponent: function () {
        this.items = [
            Ext.create('Ext.tab.Panel', {
                title: false,
                type: 'publishSetContents',
                ui: 'subform',
                layout: 'fit',
                style: 'border-top-width:0px; background-color:transparent; padding-top: 10px;',
                split: true,
                minWidth: 300,
                header: false,
                tabBar: {
                    style: 'padding-bottom: 10px;'
                },
                items: [
                    Ext.create('Taco.view.publishing.grid.Draft', {
                        scope: this,
                        title: 'Product',
                        type: 'drafts',
                        statefulId: 'draft-product',
                        hideSearchBar: false,
                        storeConfig: {
                            name: 'Taco.store.PublishSetItems',
                            options:  {
                                code: 'unassigned',
                                type: 'product',
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
                                cmp.searchToolbar.add(this.getFilterCheckBox('productCheckbox'));
                            },
                            scope:this
                        }
                    }),
                    Ext.create('Taco.view.publishing.grid.Draft', {
                        scope: this,
                        title: 'Content',
                        hideSearchBar: true,
                        statefulId: 'draft-content',
                        type: 'drafts',
                        storeConfig: {
                            name: 'Taco.store.PublishSetItems',
                            options:  {
                                code: 'unassigned',
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
                        advancedFormCls: 'Taco.view.publishing.advancedSearchForm.DraftContent',
                        listeners: {
                            afterrender: function(cmp) {
                                cmp.searchToolbar.add(this.getFilterCheckBox('contentCheckbox'));
                            },
                            scope:this
                        }
                    })
                ]
            })
        ];

        this.callParent(arguments);
    },

    getFilterCheckBox: function(itemId) {
        return {
            xtype: 'checkbox',
            labelAlign: 'right',
            labelSeparagtor: '',
            margin: '0 0 0 10',
            hideLabel: true,
            boxLabel: 'Show Drafts assigned to Publish Sets',
            fieldLabel: 'Show Drafts assigned to Publish Sets',
            itemId: itemId,
            listeners: {
                change: function(cmp, val) {
                    this.updateStores(cmp, val ? 'all' : 'unassigned', val);
                },
                afterrender: function(cmp) {
                    // the check box for the content grid hasnt been rendered, so we need to check it, once it renders only if the product grid has been checked
                    if (cmp.itemId === 'contentCheckbox' && cmp.up('tabpanel').down('#productCheckbox').getValue()) {
                        cmp.setValue(true);
                    }
                },
                scope: this
            }
        };
    },

    updateStores: function(cmp, code, val) {
        var type = cmp.itemId === 'productCheckbox' ? '#product' : '#content',
            othercheckbox = cmp.itemId === 'productCheckbox' ? '#contentCheckbox' : '#productCheckbox';

        if (cmp.up('tabpanel').down(othercheckbox)) cmp.up('tabpanel').down(othercheckbox).setValue(val);
        
        cmp.up('tabpanel').down(type).store.read({code: code, type: type === '#content' ? 'cms' : 'product'});
        
    }
});