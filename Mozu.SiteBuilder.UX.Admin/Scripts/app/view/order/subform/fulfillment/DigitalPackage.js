Ext.define('Taco.view.order.subform.fulfillment.DigitalPackage', {
    extend: 'Taco.view.order.subform.fulfillment.Package',

    requires: [
        'Taco.view.order.subform.fulfillment.DigitalGrid'
    ],

    initComponent: function() {

        this.title = 'Gift Card Email: ' + this.packageData.code;


        this.details = Ext.widget({
            xtype: 'component',
            html: 'header'
        });

        this.grid = Ext.create('Taco.view.order.subform.fulfillment.DigitalGrid', {
            record: this.record,
            packageData: this.packageData,
            unfulfilledFieldName: 'pendingPickups',
            moveToNewText: 'New Pickup'
        });

        if (!this.packageData.contact) {
            this.packageData.contact = this.record.get('fulfillmentContact');
        }

        this.details = Ext.widget({
            xtype: 'component'
        });

        this.actions = [{
            text: 'Resend Email',
            handler: this.handleResendEmail
        }];

        this.callParent(arguments);
    },

    handleResendEmail: function() {
        alert('send it yourself, don\'t be lazy');
    }
});