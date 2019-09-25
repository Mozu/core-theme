/**
 * @class Taco.view.order.subform.Attributes
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.Attributes', {
    extend: 'Taco.view.order.subform.Subform',    
    title: 'Attributes',
    ui: 'subform',
    bodyPadding: '11 0 0 0',

    requires: [
        "Ext.grid.Panel",
        "Taco.core.ux.window.Modal",
        "Taco.shared.view.form.ExtensibleAttribute",
        "Taco.view.order.widget.AttributeGrid"
    ],

    layout: 'card',

    initComponent: function () {
        var me = this;
        if (this.record.get('isUnified')) {
            this.tools = [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Edit',
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update'
                },
                {
                    model: 'Taco.model.Order',
                    behavior: 'updateAttribute'
                }],
                scope: this,
                handler: this.openAttributesDialog
            }];
        }        

        this.orderAttributesGrid = Ext.create('Taco.view.order.widget.AttributeGrid', {
            minHeight: 100,
            record: me.record,
            store: this.attributeDefinitionStore
        });

        this.items = [{
                xtype: 'component',
                cls: 'order-no-content',
                html: 'N/A',
                padding: '0 0 40 0'
            },
            this.orderAttributesGrid
        ];

        this.activeTab = this.attributeDefinitionStore.count() > 0 ? 1 : 0;

        this.mon(this.attributeDefinitionStore, 'load', this.changeCards, this);

        this.callParent(arguments);
        this.changeCards();
    },

    openAttributesDialog: function (focusAfterCloseCmp) {
        var me = this;

        if (this.attributesDialog) {
            this.attributesDialog.show();
        } else {
            this.attributesDialog = Ext.create('Taco.core.ux.window.Modal', {
                autoShow: true,
                scale: 'large',
                title: 'Order Attributes',
                overflowY: 'auto',
                closeAction: 'hide',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [this.orderForm.orderAttr],
                listeners: {
                    afterclose: function (view, e) {
                        if (focusAfterCloseCmp) {
                            focusAfterCloseCmp.focus();
                        }
                    },
                    savesuccess: {
                        scope: this,
                        fn: function () {
                            var me = this;
                            var orderForm = this.orderForm;

                            orderForm.setLoading(true, orderForm.body);

                            // rely on the subform's "beforeSave" method to save attributes to the model correctly.
                            orderForm.orderAttr.beforeSave();

                            orderForm.record.saveAttributes({
                                success: function () {
                                    orderForm.setLoading(false, orderForm.body);

                                    me.refreshGrid();
                                },
                                failure: function (msg) {
                                    orderForm.setLoading(false, this.body);
                                    
                                    var res = Ext.JSON.decode(msg.responseText);
                                   
                                    Taco.app.fireEvent('setmessage', res.items[0].message, 'error', orderForm);
                                }
                            });
                        }
                    }
                }
            });
        }
    },

    onDestroy: function () {
        Ext.destroy(this.attributesDialog);

        this.callParent(arguments);
    },

    refreshGrid: function () {
        this.down('grid').getView().refresh();

        this.changeCards();
    },

    changeCards: function () {
        this.getLayout().setActiveItem(this.attributeDefinitionStore.count() > 0 ? 1 : 0);
    }
});
