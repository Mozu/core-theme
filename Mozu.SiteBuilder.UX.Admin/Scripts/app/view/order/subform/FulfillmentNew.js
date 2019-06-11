Ext.define('Taco.view.order.subform.FulfillmentNew', {
    extend: 'Taco.view.order.subform.Subform',
    //requires: [
    //    //'Taco.view.order.subform.fulfillment.Container',
    //    'Taco.view.order.subform.fulfillment.Packages',
    //    'Taco.view.order.widget.OrderTotalPanel'
    //],
    alias: 'widget.taco-order-fulfillment',

    tabTitle: 'Fulfillment',

    initComponent: function () {

        this.cls = [this.cls, 'taco-order-fulfillment'].join(' ');

        this.record.on({
            reload: this.buildComponents,
            scope: this
        });

        this.callParent(arguments);

        this.buildComponents();
    },

    buildComponents: function () {
        console.log(this.record);
        this.add(Ext.create('Taco.view.order.subform.fulfillment.ShipmentHeader', {
            record: this.record
        }));
        
        var shipments = this.record.get('shipments');
        if (shipments) {
            for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
                this.add(Ext.create('Taco.view.order.subform.fulfillment.Shipment', {
                    record: this.record,
                    shipmentRecord: shipments[shipmentCount]
                }));
            }
        }
    }
});