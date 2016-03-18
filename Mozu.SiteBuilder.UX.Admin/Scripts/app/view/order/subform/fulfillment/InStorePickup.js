Ext.define('Taco.view.order.subform.fulfillment.InStorePickup', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [

    ],
    alias: 'widget.taco-order-fulfillment-in-store-pickup',

    initComponent: function () {

        this.title = '<span class="section-header">In-store Pickup</span>';

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingPickups();

        this.buildUnPickedUpPackages();

        this.buildPickedUpPackages();

        this.callParent(arguments);
    },

    buildInfoHeader: function () {
        this.items.push(Ext.widget({
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
                    '<span class="label">Customer:</span><br>',
                    '{billingContact.firstName:htmlEncode}<tpl if="billingContact.middleName"> {billingContact.middleName:htmlEncode}</tpl> {billingContact.lastName:htmlEncode}<br>',
                    '{billingContact.address1:htmlEncode}<br>',
                    '<tpl if="billingContact.address2">{billingContact.address2:htmlEncode}<br></tpl>',
                    '<tpl if="billingContact.address3">{billingContact.address3:htmlEncode}<br></tpl>',
                    '<tpl if="billingContact.address4">{billingContact.address4:htmlEncode}<br></tpl>',
                    '{billingContact.cityOrTown:htmlEncode}, {billingContact.stateOrProvince:htmlEncode} {billingContact.postalOrZipCode:htmlEncode} {billingContact.countryCode:htmlEncode}',
                    '<tpl if="billingContact.homePhone"><br>{billingContact.homePhone:htmlEncode}</tpl>',
                    '<tpl if="billingContact.mobilePhone"><br>{billingContact.mobilePhone:htmlEncode}</tpl>',
                    '<tpl if="billingContact.workPhone"><br>{billingContact.workPhone:htmlEncode}</tpl>'
                ]
            }, {
                flex: 1,
                html: ''
            }, {
                tpl: [
                    '<table class="section-summary">',
                        '<tr>',
                            '<td>Unfulfilled Items:</td>',
                            '<td>{itemsNotPickedup}</td>',
                        '</tr><tr>',
                            '<td>Fulfilled Items:</td>',
                            '<td>{itemsPickedup}</td></tr>',
                        '</tr><tr>',
                            '<td>In Store Pickup Items:</td>',
                            '<td>{totalPickupItems}<td>',
                        '</tr>',
                    '</table>'
                ]
            }]
        }));
    },

    buildPendingPickups: function () {
        var items = this.record.get('unpickedupItems');

        if (!items.length) return;

        this.items.push(Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            data: items,
            unfulfilledFieldName: 'pendingPickups',
            moveToNewText: 'New Pickup',
            createAction: 'createPickup',
            moveAction: 'movePickupItems'
        }));
    },

    buildUnPickedUpPackages: function () {
        Ext.each(this.record.get('pendingPickups'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.InStorePackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    },

    buildPickedUpPackages: function () {
        Ext.each(this.record.get('pickedupPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.InStorePackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    }
});