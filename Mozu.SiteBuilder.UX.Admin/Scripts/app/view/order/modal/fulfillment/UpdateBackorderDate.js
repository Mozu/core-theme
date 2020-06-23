Ext.define('Taco.view.order.modal.fulfillment.UpdateBackorderDate', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.TextField',
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.update,
    secondaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.cancel,
    scale: 'small',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.update_backorder_date,

    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this;
        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'updateBackorderDate',
            monitorValid: true,
            width: '100%',
            items:
                [
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        width: '100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [{
                                xtype: 'datefield',
                                id: 'backorderDate',
                                width: 270,
                                name: 'backorderDate',
                                anchor: '100%',
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.backorder_date,
                                format: 'm/d/Y',
                                value: new Date(),  // defaults to today
                                minValue: new Date(),  // defaults to today
                                listeners: {
                                    change: {
                                        scope: this,
                                        fn: function (combobox, newValue) {
                                            this.down("#primaryAction").setDisabled(!Ext.getCmp('backorderDate').isValid());
                                        }
                                    }
                                }
                            }
                            ]
                    }
                ],
            scope: this
        }, this);

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },

    isDate: function (date) {
        return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
    },

    getUpdateBackorderDatePayload: function () {
        var me = this;
        var backorderDate = Ext.getCmp('backorderDate').getValue();
        if (backorderDate) {
            var items = [];
            if (me.isShipment)
                me.shipmentRecord.items.forEach(function (item, index) {
                    items.push({
                        "backorderReleaseDate": new Date(backorderDate).toISOString(),
                        "lineId": item.lineId
                    });
                });
            else
                items.push({
                    "backorderReleaseDate": new Date(backorderDate).toISOString(),
                    "lineId": me.selectedItem.lineId
                });

            return {
                shipmentNumber: this.shipmentRecord.number,
                backorderItemsRequest: {
                    items: items
                }
            };
        }
    },

    doSave: function () {
        if (Ext.getCmp('backorderDate').isValid()) {
            var me = this;
            me.setLoading(true, me.body);
            var order = me.record;
            var payloadData = me.getUpdateBackorderDatePayload();
            order.backorderItemsUpdate({
                jsonData: payloadData,
                success: function (response) {                    
                    me.setLoading(false, me.body);
                    // success handling here
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_updating_backorder_date, 'error');
                        return;
                    }
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.backorder_date_successfully_updated, 'success');
                    me.fireEvent('dateUpdated', json);
                    me.close();
                },
                failure: function (response) {
                    me.setLoading(false);
                    // error handling here
                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_updating_backorder_date;

                    Taco.app.fireEvent('setmessage', msg, 'error');
                },
                scope: me
            });
        }
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        this.callParent(arguments);
    }
});