/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.publishing.grid.GridWrapper', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.gridwrapper',
    header: false,
    layout: 'card',
    requires: [
        'Taco.view.publishing.grid.Draft',
        'Taco.view.publishing.grid.Publish'
    ],

    initComponent: function () {
        this.items = [];

        this.items.push(this[this.gridClass]());

        if (this.panelConfig) this.items.push(this.getPanelMessage(this.panelConfig));
    
        this.callParent(arguments);

        if (this.type === 'publishSetContents') {
            this.getLayout().setActiveItem(1);
        }
    },
    getPublishGridConfig: function() {

        return {
            title: this.title,
            xtype: 'panel',
            ui: 'subform',
            layout: 'fit',
            style: 'border-top-width:0px;',
            split: true,
            minWidth: 300,
            itemId: 'publish-grid-container',
            tools: [this.getPublishButton()],
            items: [
                Ext.create('Taco.view.publishing.grid.Publish', {
                    storeConfig: {
                        title: 'Publish Sets',
                        name: 'Taco.store.PublishSets',
                        options:  {
                            includeCounts: true
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.Publish'
                })
            ]
        };
    },
    getDraftGridConfig: function() {
        return { 
            title: this.title,
            xtype: 'tabpanel',
            ui: 'subform',
            layout: 'fit',
            style: 'border-top-width:0px;',
            split: true,
            minWidth: 300,
            tools: [this.getFilterCheckBox(this.title)],
            items: [
                Ext.create('Taco.view.publishing.grid.Draft', {
                    scope: this,
                    title: 'Product',
                    type: this.title.toLowerCase(),
                    hideSearchBar: false,
                    storeConfig: {
                        name: 'Taco.store.PublishSetItems',
                        options:  {
                            code: 'unassigned',
                            type: 'product' // should be product, but service isnt there
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.Draft'
                }),
                Ext.create('Taco.view.publishing.grid.Draft', {
                    scope: this,
                    title: 'Content',
                    hideSearchBar: true,
                    type: this.title.toLowerCase(),
                    storeConfig: {
                        name: 'Taco.store.PublishSetItems',
                        options:  {
                            code: 'unassigned',
                            type: 'cms'
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.Draft'
                })
            ]
        };
    },
    getFilterCheckBox: function(title) {
        if (title === 'Drafts') {
            return {
                xtype: 'checkbox',
                labelAlign: 'left',
                fieldLabel: 'Include Drafts in Publish Sets',
                labelWidth: 180,
                listeners: {
                    change: function(cmp, val) {
                        this.updateStores(cmp, val ? 'all' : 'unassigned');
                    },
                    scope: this
                }
            };
        }
        else {
            return {};
        }
    },
    getPublishButton: function() {
        return  {
            xtype: 'button',
            text: 'Publish Now',
            ui: 'action-primary',
            scale: 'medium',
            disabled: true,
            itemId: 'taco-publishset-button',
            handler: function(cmp) {
                var record = cmp.up('gridwrapper').down('#publish-grid').getSelectionModel().getSelection()[0];

                this.getConfirmationModal({
                    header: 'Publish ' + record.get('name'),
                    message: 'Are you sure you want to publish all drafts associated with this publish set?',
                    callback: this.onPublishSetPublish.bind(cmp, record),
                });
            },
            scope: this
        };
    },

    onPublishSetPublish: function(record) {
        var store = this.up('gridwrapper').down('#publish-grid').store;

        Taco.model.PublishSet.publishAll({
            data: [record.data],
            success: function() {
                store.reload();
            },
            failure: function() {
                Taco.app.fireEvent('setmessage', 'There was an error publishing this publish set!', 'error');
            }
        });
    },

    getPanelMessage: function(config) {
        return Ext.create('Ext.panel.Panel', {
            title: config.header,
            html: config.body,
            bodyPadding: 20
        });
    },
    updateStores: function(cmp, code) {
        var contentstore = cmp.up('tabpanel').down('#content').store,
            productStore = cmp.up('tabpanel').down('#product').store;
        
        contentstore.read({code: code, type: 'cms'});
        productStore.read({code: code, type: 'product'});
    },

    getConfirmationModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: 'Confirm',
            secondaryText: 'Cancel',
            primaryHandler: function() {
                config.callback();
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
                        html: config.message
                    })
                ]
            }]
        }).show();
    }
});