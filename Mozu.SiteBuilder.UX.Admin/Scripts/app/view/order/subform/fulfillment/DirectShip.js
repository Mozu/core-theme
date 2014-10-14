Ext.define('Taco.view.order.subform.fulfillment.DirectShip', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [
        'Taco.view.order.subform.fulfillment.DirectShipPackage',
        'Taco.view.order.widget.ShippingItemGrid'
    ],
    alias: 'widget.taco-order-fulfillment-direct-ship',


    initComponent: function () {

        this.title = '<span class="section-header">Direct Ship Items</span>';

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingPackages();

        this.buildUnShippedPackages();

        this.buildShippedPackages();

        this.callParent(arguments);
    },

    buildInfoHeader: function () {
        var weight = this.calculateWeight();

        this.infoContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-info-header',
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
                    '<span class="label">Preferred Shipping Method:</span><br>',
                    '{shippingMethodName}'
                ]
            }, {
                padding: '0 50 0 0',
                tpl: [
                    '<span class="label">Total Weight:</span><br>',
                    '{weight} lbs'
                ],
                data: {
                    weight: weight
                }
            }, {
                flex: 1,
                html: '',
            }, {
                tpl: [
                    '<table class="section-summary">',
                        '<tr>',
                            '<td>Unshipped Items:</td>',
                            '<td>{itemsNotShipped}</td>',
                        '</tr><tr>',
                            '<td>Fulfilled Items:</td>',
                            '<td>{itemsShipped}</td></tr>',
                        '</tr><tr>',
                            '<td>Direct Ship Items:</td>',
                            '<td>{totalDirectShipItems}<td>',
                        '</tr>',
                    '</table>'
                ]
            }]
        });

        this.items.push(this.infoContainer);
    },

    buildPendingPackages: function () {
        var items = this.record.get('unpackagedItems');
        
        if (!items.length) return;

        this.pendingGrid = Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            data: items,
            unfulfilledFieldName: 'unShippedPackages'
        });

        this.items.push(this.pendingGrid);
    },

    buildUnShippedPackages: function () {
        Ext.each(this.record.get('unShippedPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DirectShipPackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    },

    buildShippedPackages: function () {
        Ext.each(this.record.get('shippedPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DirectShipPackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    },

    calculateWeight: function () {
        var weight = 0;

        Ext.each(this.record.get('unpackagedItems'), function (item) {
            weight += item.weight || 0;
        });

        Ext.each(this.record.get('unShippedPackages'), function (packageData) {
            weight += packageData.weight || 0;
        });

        Ext.each(this.record.get('shippedPackages'), function (packageData) {
            weight += packageData.weight || 0;
        });

        return weight.toFixed(1);
    }
});
