Ext.define('Taco.view.order.subform.fulfillment.InStorePackage', {
    extend: 'Taco.view.order.subform.fulfillment.Package',

    requires: [
        'Taco.view.order.subform.fulfillment.Grid'
    ],

    initComponent: function() {

        this.title = 'Pickup: ' + this.packageData.code;


        this.details = Ext.widget({
            xtype: 'component',
            html: 'header'
        });

        this.grid = Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            packageData: this.packageData,
            unfulfilledFieldName: 'pendingPickups'
        });

        if (!this.packageData.contact) {
            this.packageData.contact = this.record.get('fulfillmentContact');
        }

        this.details = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                xtype: 'component'
            },
            items: [{
                tpl: [
                    'Location:<br>',
                    '{fulfillmentLocationCode}'
                ],
                data: this.packageData
            }, {
                tpl: [
                    'Location Phone Number:<br>',
                    '123-456-7890'
                ],
                data: {}
            }]
        });

        this.actions = [{
            text: 'Cancel',
            handler: this.handleCancel
        }, {
            text: 'Mark as Ready',
            handler: this.handleReady
        }, {
            text: 'Mark as Fulfilled',
            handler: this.handleFulfilled
        }];

        this.callParent(arguments);
    },

    handleCancel: function() {

    },

    handleReady: function() {

    },

    handleFulfilled: function() {

    }
});