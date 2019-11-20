
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ShippingPackagesGrid'
    ],

    //tabTitle: 'All Items',
    initComponent: function () {

        this.tabTitle = this.shipmentRecord.items ? "Items (" + this.shipmentRecord.items.length + ")" : "Items (0)";
        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
        // itemId: this.packageRecord.code + 'shipment';
        this.shipmentItems = Ext.create('Taco.view.order.widget.ShippingPackagesGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record,
            hidden: this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled',
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0',
            minHeight: me.calculateHeight(),
            listeners: {
                shipmentReassign: function () {
                    me.fireEvent('shipmentRefresh');
                },
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                }
            }
        });

        this.shipmentLabelContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-body',
            padding: '0 0 10 0',
            hidden: this.shipmentRecord.shipmentStatus.toLowerCase() != 'canceled',
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                xtype: 'component',
            },
            items: [
                {
                    margin: {
                        left: 500,
                        top: 50,
                    },
                    flex: 1,
                    html: '<h3 class="">Shipment is canceled, see all items on the cancellation tab.</h3>',
                },
                {
                    flex: 1,
                    html: '',
                }
            ]
        });

        this.items = [
            this.shipmentLabelContainer,
            this.shipmentItems
        ];
    },

    calculateHeight: function () {
        return this.shipmentRecord.items ? (100 + (55 * this.shipmentRecord.items.length)) : 60;
    },

    onDestroy: function () {
        this.callParent(arguments);
    },

    doSave: function (shipmentRecord) {
    }

});