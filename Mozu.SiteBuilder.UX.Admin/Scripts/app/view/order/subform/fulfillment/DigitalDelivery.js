Ext.define('Taco.view.order.subform.fulfillment.DigitalDelivery', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [

    ],
    alias: 'widget.taco-order-fulfillment-digital-delivery',

    initComponent: function () {

        this.title = '<span class="section-header">Gift Card</span>',

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingDigitalItems();

        this.buildDeliveredDigitalItems();

        this.callParent(arguments);
    },

    buildInfoHeader: function () {
        this.items.push(Ext.widget({
            xtype: 'container',
            padding: '0 0 10 0',
            cls: 'taco-order-fulfillment-info-header',
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
                    '{billingContact.firstName}<tpl if="billingContact.middleName"> {billingContact.middleName}</tpl> {billingContact.lastName}<br>',
                    '{billingContact.address1}<br>',
                    '<tpl if="billingContact.address2">{billingContact.address2}<br></tpl>',
                    '<tpl if="billingContact.address3">{billingContact.address3}<br></tpl>',
                    '<tpl if="billingContact.address4">{billingContact.address4}<br></tpl>',
                    '{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}',
                    '<tpl if="billingContact.homePhone"><br>{billingContact.homePhone}</tpl>',
                    '<tpl if="billingContact.mobilePhone"><br>{billingContact.mobilePhone}</tpl>',
                    '<tpl if="billingContact.workPhone"><br>{billingContact.workPhone}</tpl>'
                ]
            }, {
                padding: '0 50 0 0',
                tpl: [
                    '<span class="label">Email:</span><br>',
                    '<a href="mailto:{fulfillmentContact.email}">{fulfillmentContact.email}</a>'
                ]
            }, {
                flex: 1,
                html: ''
            }, {
                tpl: [
                    '<table class="section-summary">',
                        '<tr>',
                            '<td>Pending Items:</td>',
                            '<td>{itemsNotDigitallyFulfilled}</td>',
                        '</tr><tr>',
                            '<td>Fulfilled Items:</td>',
                            '<td>{itemsDigitallyFulfilled}</td></tr>',
                        '</tr><tr>',
                            '<td>Digital Items:</td>',
                            '<td>{totalDigitalItems}<td>',
                        '</tr>',
                    '</table>'
                ]
            }]
        }));
    },

    buildPendingDigitalItems: function () {
        var items = this.record.get('undeliveredDigitalItems');

        if (!items.length) return;

        this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DigitalGrid', {
            data: items,
            record: this.record
        }));
    },

    buildDeliveredDigitalItems: function () {
        Ext.each(this.record.get('digitalPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DigitalPackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    }
});