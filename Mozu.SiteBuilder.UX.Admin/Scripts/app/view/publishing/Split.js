/**
 * @class Taco.view.publishing.Split
 */


Ext.define('Taco.view.publishing.Split', {
    extend: 'Taco.core.ux.content.SplitContainer',
    alias: [
        'widget.publish-split',
        'widget.publish.split'
    ],
    requires: [
        'Taco.core.ux.mixins.SplitEditor',
        'Taco.core.ux.grid.MenuColumn' // just to refer to its classname
    ],

    mixins: {
        splitEditor: 'Taco.core.ux.mixins.SplitEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    stateId: 'taco-publish-sets',
    title: 'Publish Sets',

    createButtonEnabled: true,
    createButtonText: 'Create New Publish Set',
    saveButtonVisible: false,
    cancelButtonVisible: false,
    enableSearchBarInHeader: false,

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    statics: {
        eastConfigs: {
            placeholder: {
                xtype: 'component',
                html: ''
            },
            form: {
                xtype: 'panel',
                html: 'test'
            }
        },
        factory: function (cfg, callback, scope) {
            callback.call(scope || this, Ext.create('Taco.view.publishing.Split', cfg));
        }
    },

    initComponent: function () {

        this.config.west = [this.eastGrid()];

        this.config.east = [this.westGrid()];

        this.mixins.navHeader.init.apply(this);
        
        this.callParent(arguments);

        //override split width
        this.east.flex = 333;
    },

    setActiveCard: function(cmp, idx) {
        cmp.getLayout().setActiveItem(idx);
    },
    eastGrid: function() {
        return Ext.create('Ext.panel.Panel', {
            layout: 'card',
            items: [
                Ext.create('Taco.view.publishing.grid.Publish', {
                    title: false,
                    type: 'publishSet',
                    storeConfig: {
                    title: 'Publish Sets',
                    name: 'Taco.store.PublishSets',
                        options:  {
                            includeCounts: true
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.Publish'
                }),
                Ext.create('Ext.panel.Panel', {
                    html: ['<span style="font-size:2.0rem;">You have no Publish Sets</span><br><br>',
                           'Publish Sets are a new feature in Mozu. Use them to collect product and content drafts into related sets and provide an optional publish date for those changes to go live',
                           '<br><br>Click the "Create New Publish Set" button above to get started.'].join('')
                }),
            ]
        });
    },
    westGrid: function() {
        var me = this;

        this.panel = Ext.create('Ext.panel.Panel', {
            title: false,
            type: 'publishSetContents',
            ui: 'subform',
            layout: {
                type: 'card' 
            },
            split: true,
            minWidth: 300,
            tbar: Ext.create('Taco.view.publishing.component.DraftGridToolBar', {
                parentScope: me,
                toolbarTitle: 'Drafts',
                buttons: true
            }),
            style: {
                border: 'none'
            },
            items: [
                Ext.create('Taco.view.publishing.grid.Draft', {
                    scope: this,
                    type: 'drafts',
                    uniqueId: 'product',
                    itemId: 'product',
                    statefulId: 'draft-product-publishset',
                    hideSearchBar: false,
                    storeConfig: {
                        name: 'Taco.store.PublishSetItems',
                        options:  {
                            code: 'unassigned',
                            type: 'product',
                            autoLoad: true
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.DraftProduct'
                }),
                Ext.create('Taco.view.publishing.grid.Draft', {
                    scope: this,
                    uniqueId: 'Content',
                    hideSearchBar: true,
                    itemId: 'content',
                    type: 'drafts',
                    statefulId: 'draft-content-publishset',
                    storeConfig: {
                        name: 'Taco.store.PublishSetItems',
                        options:  {
                            code: 'unassigned',
                            type: 'cms',
                            autoLoad: true
                        }
                    },
                    advancedFormCls: 'Taco.view.publishing.advancedSearchForm.DraftContent'
                })
            ]
        });

        return this.panel;
    },
    onCreate: function() {
        var me = this;        
        Ext.create('Taco.view.publishing.modal.CreatePublishSet', {
            listeners: {
                aftersaveclose: function () {                    
                    me.down('#publish-grid').store.read();
                    me.showMessage('Created', null);
                    me.getWest().down('panel').getLayout().setActiveItem(0);
                },
                scope:me
            }
        }).show();
    },

    handleAddToEast: function (ct, cmp) {
        
    },

    onRecordChange: function (record) {
       
    },

    onSelectRecord: function (record) {
        
    },

    updateSplit: function (nextSplit) {

    },

    updateSplitTitle: function () {
        var eastCollapsed = this.getEast().getCollapsed();
        var activeTitle = this.getWestTitle() || 'Records';

        Ext.suspendLayouts();
        this.setTitle(activeTitle);
        Ext.resumeLayouts();
    },

    showMessage: function(msg, type) {
        Taco.app.fireEvent('setmessage', msg, type);
    }
});
