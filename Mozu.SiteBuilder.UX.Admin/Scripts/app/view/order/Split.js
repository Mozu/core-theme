/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Split', {
    extend: 'Taco.core.ux.form.SplitEditor',
    alias: 'widget.order.split',
    requires: [
        'Taco.model.Order',
        'Taco.view.order.Grid',
        'Taco.store.OrderGrid',
        'Taco.view.order.Form',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.AdvancedSearchForm'
    ],

    stateId: 'taco-orders',
    title: 'Orders',

    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },
    
    statics: {
        eastConfigs: {
            placeholder: {
                xtype: 'component',
                html: 'hello world'
            },
            form: {
                xtype: 'panel',
                html: 'test'
            }
        }
    },

    // cls: "taco-content-navcontainer-padding",

    initComponent: function () {
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderGrid');

        this.editor = this.statics().eastConfigs.placeholder;

        this.config.east = [this.editor];
        
        this.orderList = Ext.create('Taco.view.order.Grid', {

            header: false, // hides the header (the title)
            addContentViewPadding: false,
            enableNavHeader: false, // disables the navHeader Mixin
            launchEditorOnClick: false, // this disables the default behavior in the LaunchEditor Mixin
            listeners: {
                itemkeydown: {
                    scope: this,
                    fn: function (grid, record, item, index, e) {
                        if (e.getKey() == Ext.EventObject.ENTER) {
                            this.setRecord(record)
                        }
                    }
                },
                itemclick: {
                    scope: this,
                    fn: function (grid, record, item, index, e) {
                        this.setRecord(record);
                    }
                }
            }
        });

        this.config.west = [this.orderList];
        
        this.callParent(arguments);

        this.mon(this.getEast(), {
            add: {
                scope: this,
                fn: 'handleAddToEast'
            }
        });
    },

    getAdditionalActions: function (ids) {
        return this.editor.header.down('toolbar').queryBy(function (cmp) {
            return ids.indexOf(cmp.getItemId()) > -1;
        });
    },

    // override of template method in splitEditor.js. Used to delegate the title to the views
    getEastTitle: function () {
        var title = (this.editor && this.editor.getTitle) ? this.editor.getTitle() : 'Edit';
        return title;
    },

    // override of template method in splitEditor.js. Used to delegate the title to the views
    getWestTitle: function () {
        return this.orderList.getTitle();
    },

    handleAddToEast: function (ct, cmp) {
        this.editor = cmp;
        this.updateSplitTitle();

        if (this.getRecord()) {
            this.mon(this.editor, {
                afterrender: {
                    scope: this,
                    fn: 'updateSplitActions'
                },
                afterlayout: {
                    scope: this,
                    single: true,
                    fn: function () {
                        this.editor.header.hide();
                        var c = this.editor.getComponent(0);
                        c.padding = 0;
                        c.getLayout().innerCt.applyStyles({ padding: '0px' });
                        c.doLayout();
                    }
                }
            });
        }
    },

    onRecordChange: function (nextRecord) {
        var url = 'orders/split';

        Ext.suspendLayouts();
        this.callParent(arguments);
        Ext.resumeLayouts();

        if (nextRecord) {
            url = 'orders/edit/' + nextRecord.getId();
            Taco.core.StateManager.attemptNavigate(url, { complexMetaData: { container: this.getEast() } });
        } else {
            Taco.core.StateManager.attemptNavigate(url);
        }
    },

    updateSplitActions: function () {
        var ids = Ext.Array.pluck(this.editor.additionalActions || [], 'itemId');
        var buttons = this.getAdditionalActions(ids);
        var toolbar = this.header.down('toolbar');

        // after buttons are inserted into the toolbar, we need to re-layout the toolbar
        // this is horrible, but at least it's not Ext.defer
        this.mon(toolbar, {
            afterlayout: {
                scope: this,
                single: true,
                fn: function () {
                    toolbar.doComponentLayout();
                }
            }
        });
        
        // insert each additionalAction into the toolbar after the spacer
        buttons.forEach(function (button, index) {
            var id = button.getItemId();

            if (toolbar.getComponent(id)) {
                toolbar.remove(id);
            }

            toolbar.insert(index + 2, button);
        }, this);

        // clean up the managed listener
        this.mun(this.editor, {
            afterrender: {
                scope: this,
                fn: 'updateSplitActions'
            }
        });
    },

    updateSplitTitle: function () {
        var record = this.getRecord();
        var isEdit = this.editor && this.editor.isEdit && this.editor.isEdit();
        var activeTitle = '<span class="taco-content-header-title-root">' + (this.getWestTitle() || 'Records') + '</span>';

        if (record) {
            activeTitle += (' / Order #' + record.get('orderNumber'));
        }

        Ext.suspendLayouts();
        this.setTitle(activeTitle);
        Ext.resumeLayouts();
    }
});
