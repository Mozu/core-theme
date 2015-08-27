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
        "Taco.shared.view.form.ExtensibleAttribute"
    ],

    initComponent: function () {
        var me = this;

        this.tools = [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Edit',
            scope: this,
            handler: this.openAttributesDialog
        }];

        this.items = [{
            xtype: 'grid',
            store: this.attributeDefinitionStore,
            columns: [{
                dataIndex: 'adminName',
                text: 'Name',
                flex: 2
            }, {
                dataIndex: 'values',
                text: 'Value',
                flex: 3,
                renderer: function (value, meta, record, index) {
                    var att = Ext.Array.findBy(me.record.get('attributes'), function (attribute) {
                        return (attribute.fullyQualifiedName || '').toLowerCase() === (record.get('id') || '').toLowerCase();
                    });

                    return (att && !Ext.isEmpty(att.values) ? att.values.join(', ').replace(/\n/g, '<br>') : '--');
                }
            }]
        }];

        this.callParent(arguments);
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
    }
});
