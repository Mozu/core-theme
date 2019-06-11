Ext.define('Taco.view.order.subform.fulfillment.ShipmentHeader', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'widget.taco-order-fulfillment-shipment-header',


    initComponent: function () {
        this.items = [];

        this.buildOrderInfoHeader();

        this.callParent(arguments);
    },

    buildOrderInfoHeader: function () {
        var me = this;
        var fulfillmentStatus = this.record.get('fulfillmentStatus');
        fulfillmentStatus = Taco.core.util.Common.camelToSpace(fulfillmentStatus);


        this.infoContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-info-header',
            padding: '0 20 10 20',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items: [{
                padding: '0 50 0 0',
                tpl: [
                    '<span class="label">Shipment Status</span><br>',
                    '<span class="x-column-content-pill x-column-content-pill-false">' + fulfillmentStatus + '</span>&nbsp;&nbsp;&nbsp;',
                    //'<span class="x-column-content-pill x-column-content-pill-false">1 Fullfilled</span>'
                ]
            }, {
                flex: 1,
                html: '',
            },
            {
                xtype: 'container',
                items: [
                    Ext.widget('button', {
                        itemId: 'cancelOrder',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Cancel Order',
                        handler: function () {
                            Ext.create('Taco.view.order.modal.fulfillment.OrderCancellation', {
                                layout: 'hbox',
                                width: 600,
                                height: 400,
                                record: me.record,
                                store: me.record.getCancellationReasons(),
                                listeners: {
                                    saveSuccess: {
                                        fn: function (json) {
                                            //me.fireEvent('orderCancelled', json);
                                        },
                                        //scope: me
                                    }
                                }
                            });
                        }
                    }),
                ]
            }
            ]
        });


        this.items.push(this.infoContainer);
    }
});
