Ext.define('Taco.view.order.subform.fulfillment.InStorePackage', {
    extend: 'Taco.view.order.subform.fulfillment.Package',

    requires: [
        'Taco.view.order.subform.fulfillment.Grid'
    ],

    initComponent: function () {

        this.title = 'Pickup: ' + this.packageData.code;


        this.details = Ext.widget({
            xtype: 'component',
            html: 'header'
        });

        this.grid = Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            packageData: this.packageData,
            unfulfilledFieldName: 'pendingPickups',
            moveToNewText: 'New Pickup',
            createAction: 'createPickup',
            moveAction: 'movePickupItems'
        });

        if (!this.packageData.contact) {
            this.packageData.contact = this.record.get('fulfillmentContact');
        }

        this.details = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-info-header',
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
            }/*, {
                tpl: [
                    'Location Phone Number:<br>',
                    '123-456-7890'
                ],
                data: {}
            } */]
        });

        this.actions = [{
            text: 'Cancel',
            handler: this.handleCancel,
            hidden: this.packageData.status === 'Fulfilled'
        }, {
            text: 'Mark as Ready',
            handler: this.handleReady,
            hidden: true
        }, {
            text: 'Mark as Fulfilled',
            handler: this.handleFulfilled,
            hidden: this.packageData.status === 'Fulfilled'
        }];

        this.collapsedInfo = {
            xtype: 'component',
            flex: 1,
            tpl: [
                '{date} | Location: {fulfillmentLocationCode} | {itemCount} ',
                'item<tpl if="itemCount !== 1">s</tpl>'
            ],
            data: {
                date: Ext.Date.format(new Date(this.packageData.fulfillmentDate), 'm/d/Y h:i:s a'),
                fulfillmentLocationCode: this.packageData.fulfillmentLocationCode,
                itemCount: this.packageData.totalQuantity
            }
        };

        this.callParent(arguments);
    },

    handleCancel: function () {
        this.updateOrder({
            methodName: 'deletePickup',
            errorMsg: 'Error deleting pickup',
            data: {
                orderId: this.record.getId(),
                pickupIds: [this.packageData.id]
            }
        });
    },

    handleReady: function () {

    },

    handleFulfilled: function () {
        this.updateOrder({
            methodName: 'markPickupFulfilled',
            errorMsg: 'Error marking pickup fulfilled',
            data: {
                orderId: this.record.getId(),
                pickupIds: [this.packageData.id]
            }
        });
    }
});