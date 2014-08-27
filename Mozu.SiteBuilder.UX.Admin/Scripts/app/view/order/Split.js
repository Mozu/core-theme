/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Split', {
    extend: 'Taco.core.ux.form.SplitEditor',
    alias: [
        'widget.order-split',
        'widget.order.split'
    ],
    requires: [
        'Taco.model.Order',
        'Taco.view.order.Grid',
        'Taco.store.OrderGrid',
        'Taco.view.order.Form',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.AdvancedSearchForm',
        'Taco.core.ux.grid.MenuColumn' // just to refer to its classname
    ],

    stateId: 'taco-orders',
    title: 'Orders',

    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    createButtonEnabled: true,
    saveButtonVisible: false,
    cancelButtonVisible: false,
    
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
                            this.onSelectRecord(record);
                        }
                    }
                },
                itemclick: {
                    scope: this,
                    fn: function (grid, record, row, index, e, opts) {
                        if (!e.getTarget('.' + Taco.core.ux.grid.MenuColumn.prototype.iconCls) && !e.getTarget('.' + Taco.core.ux.grid.MenuColumn.prototype.tdCls)) {
                            this.onSelectRecord(record);
                        }
                    }
                }
            }
        });

        this.createButtonCfg = this.orderList.getCreateButtonConfig();

        this.config.west = [this.orderList];
        
        this.callParent(arguments);

        this.mon(this.getEast(), {
            add: {
                scope: this,
                fn: 'handleAddToEast'
            }
        });
    },

    createActionHandler: function () {
       
        var ctx = Taco.app.context.getCurrentContext();
        var record;

        if (ctx.contextType !== 's') {
            Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', 's').raw);
            return;
        }

        Taco.app.setLoading();

        record = Ext.create('Taco.model.Order');
        record.save({
            callback: function (records, operation, success) {

                if (!success) {
                    Taco.app.fireEvent('setmessage', "Error creating order", 'error');
                    Taco.app.setLoading(false);
                    return;
                }

                //changing the path to be edit instead of create so that the user can refresh the page and get back to it if they accidently navigate away;
                Taco.core.StateManager.attemptNavigate('s-' + record.data.siteId + '/orders/edit/' + record.data.id);
            },
            scope: this
        });
    },

    getAdditionalActions: function (ids) {
        ids = Ext.Array.merge(ids, ['cancelActionButton', 'saveActionButton']);

        return this.editor.header.down('toolbar').queryBy(function (cmp) {
            var index = Ext.Array.indexOf(ids, cmp.getItemId());
            return index > -1;
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
                },
                cancel: {
                    scope: this,
                    fn: function () { this.setRecord(null); }
                }
            });
        }
    },

    onRecordChange: function (record) {

        var me = this,
            args = arguments;
        if (record) {
            Taco.app.setLoading();
            Taco.view.order.Edit.factory({ record: record }, function (cmp) {
                Ext.suspendLayouts();

                me.getEast().removeAll(true);

                me.getEast().add(cmp);
                
                me.superclass.onRecordChange.apply(me,args);

                me.showAndHideSplitActions();
                me.updateSplitTitle();

                Ext.resumeLayouts(true);
                Taco.app.setLoading(false);
            });
        } else {


            Ext.suspendLayouts();

            this.getEast().removeAll(true);

            this.callParent(arguments);

            this.showAndHideSplitActions();
            this.updateSplitTitle();

            Ext.resumeLayouts(true);
        }
    },

    onSelectRecord: function (record) {
        var url = 'orders';
        var site;

        if (record) {
            url = 'orders/edit/' + record.getId();
            site = Taco.app.context.findSite(record.get('siteId'));
            if (site != Taco.app.context.getCurrentContext()) {
                Taco.app.context.currentCtx = site;
                //Taco.app.context.setCurrentContext(site, false, false);
            }
        }

        Taco.core.StateManager.attemptNavigate(url);
    },

    showAndHideSplitActions: function (toolbar) {
        var record = this.getRecord();
        var editorActions = ['cancelActionButton', 'saveActionButton', 'next', 'previous'];

        toolbar = toolbar || this.header.down('toolbar');
        toolbar.items.each(function (cmp) {
            var id = cmp.getItemId ? cmp.getItemId() : null;

            if (record) {
                if (record.get('orderStatus') === 'Pending') {
                    if (id === 'cancelActionButton' || id === 'saveActionButton') {
                        cmp.show();
                    } else if (id === 'createActionButton') {
                        cmp.hide();
                    }
                } else if (id === 'next' || id === 'previous') {
                    cmp.show();
                }
            } else {
                if (id === 'createActionButton') {
                    cmp.show();
                }
                if (Ext.Array.contains(editorActions, id)) {
                    cmp.hide();
                }
            }
        });
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

                    this.showAndHideSplitActions(toolbar);
                }
            }
        });
        
        // insert each additionalAction into the toolbar after the spacer
        Ext.Array.forEach(buttons, function (button, index) {
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

    handleChildCollapseExpand: function (panel) {
        this.callParent(arguments);

        this.updateSplitTitle();
    },

    updateSplitTitle: function () {
        var record = this.getRecord();
        var eastCollapsed = this.getEast().getCollapsed();
        var activeTitle = this.getWestTitle() || 'Records';

        if (record && !eastCollapsed) {
            activeTitle = '<a href="/admin/orders" class="taco-content-header-title-root">' + activeTitle + '</a> / Order #' + record.get('orderNumber');
        }

        Ext.suspendLayouts();
        this.setTitle(activeTitle);
        Ext.resumeLayouts();
    }
});
