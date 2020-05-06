
Ext.define('Taco.view.order.subform.fulfillment.TransfersTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.TransferShipmentGrid'
    ],

    initComponent: function () {

        this.tabTitle = "Transfers";
        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
        this.shipmentItems = Ext.create('Taco.view.order.widget.TransferShipmentGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record         
        });

        this.items = [
            this.shipmentItems
        ];
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});