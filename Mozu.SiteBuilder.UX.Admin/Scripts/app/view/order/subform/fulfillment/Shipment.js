Ext.define('Taco.view.order.subform.fulfillment.Shipment', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'widget.taco-order-fulfillment-shipments',
    requires: [
        //'Taco.view.order.subform.fulfillment.Container',
        'Taco.view.order.subform.fulfillment.Packages',

    ],
    packageContainer: {},

    initComponent: function () {

        this.fulfillmentStatus = Taco.core.util.Common.camelToSpace(this.record.get('fulfillmentStatus'));

        this.items = [];

        this.buildShipmentInfoHeader();

        this.callParent(arguments);
    },

    buildShipmentInfoHeader: function () {
        this.infoContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-shipments',
            padding: '20 20 25 20',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items:
                [{
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Shipment</span><br/><br/>',
                        '#TBD'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Status</span><br/><br/>',
                        ' <span class="x-column-content-pill x-column-content-pill-false">' + this.fulfillmentStatus + '</span>'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Assigned</span><br/><br/>',
                        '05/02/2019 (#TBD)'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Total</span><br/><br/>',
                        '$XXX.XX'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Fulfilled From</span><br/><br/>',
                        'Dallas Warehouse <br/>',
                        '1100 N Royal Ln, Dallas, TX 75261 <br/>',
                        '123-456-7890 * email@name.com'
                    ]
                },
                {
                    flex: 1,
                    html: '',
                },
                {
                    xtype: 'container',
                    padding: '0 20 0 0',
                    items: [
                        Ext.widget('button', {
                            itemId: 'cancelShipment',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Cancel Shipment',
                            handler: function (evt) {
                                Ext.create('Taco.view.order.modal.fulfillment.ShipmentCancellation', {
                                    layout: 'hbox',
                                    width: 600,
                                    height: 400,
                                    //record: record,
                                    //parentRecord: me.record,
                                    //store: me.record.getCancellationReasons(),
                                    //originalQuantity: originalQuantity,
                                    //listeners: {
                                    //    saveSuccess: {
                                    //        fn: function (json) {
                                    //            //me.fireEvent('orderCancelled', json);
                                    //        },
                                    //        //scope: me
                                    //    }
                                    //}
                                });
                            }
                        }),

                    ]
                },
                {
                    xtype: 'container',
                    items: [
                        Ext.widget('button', {
                            itemId: 'reassignShipment',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Reassign Shipment',
                            handler: function (evt) {
                                Ext.create('Taco.view.order.modal.fulfillment.OrderCancellation', {
                                    layout: 'hbox',
                                    width: 600,
                                    height: 400,
                                    //record: record,
                                    //parentRecord: me.record,
                                    //store: me.record.getCancellationReasons(),
                                    //originalQuantity: originalQuantity,
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
                ],
            //listeners: {
            //    render: function (c) {                                     
            //        c.el.on('click', function () {
            //            Ext.ComponentQuery.query(c.el.dom.nextSibling.id);
            //            if (Ext.getCmp(c.el.dom.nextSibling.id).getEl().dom.style.display.toLowerCase() == "none")
            //                Ext.getCmp(c.el.dom.nextSibling.id).getEl().dom.style.display = "block";
            //            else {
            //                Ext.getCmp(c.el.dom.nextSibling.id).getEl().dom.style.display = "none";
            //                Ext.getCmp(c.el.dom.nextSibling.id).getEl().dom.style.position = "relative";
            //            }

            //            //c.el.dom.nextSibling.id
            //            //Ext.getCmp(c.el.dom.nextSibling.id);
            //            //Ext.getCmp('taco-shipmentform-1289').getEl().toggle();
            //        });
            //    }
            //},
        });

        this.items.push(this.infoContainer);

        this.packageContainer = Ext.create('Taco.view.order.subform.fulfillment.Packages', {
            record: this.record
        });

        this.items.push(this.packageContainer);
    },

});


