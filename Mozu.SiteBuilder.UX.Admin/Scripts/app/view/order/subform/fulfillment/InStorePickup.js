Ext.define('Taco.view.order.subform.fulfillment.InStorePickup', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [

    ],
    alias: 'widget.taco-order-fulfillment-in-store-pickup',

    title: 'In-store Pickup',

    initComponent: function() {

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingPickups();

        this.buildUnPickedUpPackages();

        this.buildPickedUpPackages();

        this.callParent(arguments);
    },

    buildInfoHeader: function() {
        
    },

    buildPendingPickups: function() {
        
    },

    buildUnPickedUpPackages: function() {
        
    },

    buildPickedUpPackages: function() {
        
    }
});