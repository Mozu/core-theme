Ext.define('Taco.view.order.subform.fulfillment.ShipmentDetails', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'taco-order-fulfillment-ShipmentDetails',

    cls:'taco-order-fulfillment-ShipmentDetails',
    //extend: 'Ext.panel.Panel',

    //ui: 'subform-section-child',
    //bodyPadding: '10 10 10 10',

    collapsible: false,

    initComponent: function () {
        this.items = [];
        this.packageContainer = Ext.create('Taco.view.order.subform.fulfillment.Packages', {
            record: this.record,
            shipmentRecord: this.shipmentRecord
        });

        this.items.push(this.packageContainer);

        

        this.callParent(arguments);
    }
    
});