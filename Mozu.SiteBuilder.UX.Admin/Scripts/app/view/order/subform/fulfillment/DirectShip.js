Ext.define('Taco.view.order.subform.fulfillment.DirectShip', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [
        'Taco.view.order.subform.fulfillment.DirectShipPackage',
        'Taco.view.order.widget.ShippingItemGrid'
    ],
    alias: 'widget.taco-order-fulfillment-direct-ship',

    title: 'Direct Ship Items',

    initComponent: function() {

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingPackages();

        this.buildUnShippedPackages();

        this.buildShippedPackages();

        this.callParent(arguments);
    },

    buildInfoHeader: function() {
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
                    'Pending Items: {itemsNotShipped}<br>',
                    'Fulfilled Items: {itemsShipped}<br>',
                    '<span class="taco-order-label">Direct Ship Items: {totalDirectShipItems}</span>'
                ]
            }]
        });

        this.items.push(this.infoContainer);
    },

    buildPendingPackages: function() {
        var items = this.record.get('unpackagedItems');

        if (!items.length) return;

        this.pendingGrid = Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            data: this.record.get('unpackagedItems'),
            unfulfilledFieldName: 'unShippedPackages'
        });

        this.items.push(this.pendingGrid);
    },

    buildUnShippedPackages: function() {
        Ext.each(this.record.get('unShippedPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DirectShipPackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    },

    buildShippedPackages: function() {
        Ext.each(this.record.get('shippedPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DirectShipPackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    }
});