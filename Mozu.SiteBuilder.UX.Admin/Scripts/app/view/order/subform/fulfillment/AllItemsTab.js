
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',

    tabTitle: 'All Items',
    
    initComponent: function () {

        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);

        //this.needToReload = true;
        //this.mon(this.record, 'reload', function() {
        //    // Only bother reloading if the order has changed.
        //    this.needToReload = true;
        //}, this);
    },

    initUI: function () {
        var me = this;
        // itemId: this.packageRecord.code + 'shipment';
        
        this.shipmentItems = Ext.create('Taco.view.order.widget.ShippingPackagesGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record,
            hidden: this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled' ,
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0',
            minHeight: '300',
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
            hidden: this.shipmentRecord.shipmentStatus.toLowerCase() != 'canceled' ,
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
                    html: '<h3 class="">Shipment is cancelled, see all items on the cancellation tab.</h3>',
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

    onDestroy: function () {
        this.callParent(arguments);
    },

    doSave: function (shipmentRecord) {
    }

});