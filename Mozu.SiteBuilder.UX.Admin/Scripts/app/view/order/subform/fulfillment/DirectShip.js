Ext.define('Taco.view.order.subform.fulfillment.DirectShip', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [

    ],
    alias: 'widget.taco-order-fulfillment-direct-ship',

    title: 'Direct Ship Items',

    initComponent: function() {

        this.infoContainer = Ext.widget({
            xtype: 'container',
            padding: '0 0 10 0',
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
                    '<span class="taco-order-label">Preferred Shipping Method:</span><br>',
                    '{shippingMethodName}'
                ]
            }, {
                padding: '0 50, 0 0',
                tpl: [
                    '<span class="taco-order-label">Total Weight:</span><br>',
                    '61 lbs'
                ]
            }, {
                flex: 1,
                style: {
                    textAlign: 'right'
                },
                tpl: [
                    'Pending Items: {}<br>',
                    'Fulfilled Items: {}<br>',
                    '<span class="taco-order-label">Direct Ship Items: {}</span>'
                ]
            }]
        });

        this.grid = Ext.create('Taco.view.order.widget.ShippingItemGrid', {

            isPackage: false,

            //the unpackaged items data to be loaded by the store
            data: this.record.get('unpackagedItems'),

            record: this.record,

            isUnShippedItems: true,

            // configs for the grid
            editMode: true,

            enableCellEditing: true,

            enableCheckBoxSelection: true,

            enableActionColumn: false,

            enableToolbar: true,

            enableMoveMenu: true,

            enableShippingMethodMenu: false,

            enableShippingLabelButton: false,

            enabledPackingSlipButton: false,

            enabledRemoveButton: false,

            enabledMarkAsShippedButton: false
        });

        this.items = [this.infoContainer, this.grid];

        this.callParent(arguments);
    }
});