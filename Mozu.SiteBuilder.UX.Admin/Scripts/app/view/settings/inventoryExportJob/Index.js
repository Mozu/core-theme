/**
 * @class Taco.view.settings.paymentGateways.Index
 */

Ext.define('Taco.view.settings.inventoryExportJob.Index', {
    extend: 'Taco.view.react.Index',

    requires: [
        'Taco.model.InventoryExportJob',
        'Taco.store.InventoryExportJob'
    ],

    modelName: 'Taco.model.InventoryExportJob',

    store: {
        type: 'Taco.store.InventoryExportJob'
    },

    title: 'Inventory Export Job',

    createRoute: 'settings/inventoryExportJob',

    initComponent: function () {
        var me = this;
        me.callParent(arguments);

    },

})