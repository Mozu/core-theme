Ext.define('Taco.view.order.subform.fulfillment.ShipmentDetails', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'taco-order-fulfillment-ShipmentDetails',

    cls:'taco-order-fulfillment-ShipmentDetails',
    //extend: 'Ext.panel.Panel',

    //ui: 'subform-section-child',
    //bodyPadding: '10 10 10 10',

    collapsible: true,

    initComponent: function () {
        this.items = [];
        this.packageContainer = Ext.create('Taco.view.order.subform.fulfillment.Packages', {
            record: this.record
        });

        this.items.push(this.packageContainer);

        //subtotals, orderlevel discounts, tax shipping, and totals
        this.shipmentTotals = Ext.create('Taco.view.order.widget.ShipmentTotalPanel', {
            margin: '0 0 20 0',
            record: this.record
        });

        this.items.push(this.shipmentTotals);

        this.callParent(arguments);
    }
    
});