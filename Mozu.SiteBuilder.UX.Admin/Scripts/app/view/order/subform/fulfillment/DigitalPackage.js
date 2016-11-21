Ext.define('Taco.view.order.subform.fulfillment.DigitalPackage', {
    extend: 'Taco.view.order.subform.fulfillment.Package',

    requires: [
        'Taco.view.order.subform.fulfillment.DigitalGrid'
    ],

    initComponent: function () {

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
            this.packageData.contact = this.record.get('billingContact');
        }

        this.details = Ext.widget({
            xtype: 'component'
        });

        this.actions = [{
            text: 'Resend Email',
            handler: this.handleResendEmail,
            requiredBehaviors: [{
                model: 'Taco.model.Order',
                behavior: 'update'
            },
                                       {
                                           model: 'Taco.model.Order',
                                           behavior: 'fulfill'
                                       }]
        }];

        this.collapsedInfo = {
            xtype: 'component',
            flex: 1,
            tpl: [
                '{date} | Email: {email} | {itemCount} ',
                'item<tpl if="itemCount !== 1">s</tpl>'
            ],
            data: {
                date: Ext.Date.format(new Date(this.packageData.fulfillmentDate), 'm/d/Y h:i:s a'),
                email: this.record.get('billingContact').email,
                itemCount: this.packageData.totalQuantity
            }
        };

        this.callParent(arguments);
    },

    handleResendEmail: function () {
        this.updateOrder({
            methodName: 'resendDigitalPackage',
            errorMsg: 'Error sending Gift Card email',
            reloadRecord: false,
            data: {
                orderId: this.record.getId(),
                digitalPackageids: [this.packageData.id]
            },
            success: function () {
                Taco.MessageBox.show({
                    title: 'Resend E-mail',
                    buttons: Ext.Msg.OK,
                    msg: new Ext.XTemplate([
                        '<p>Successfully resent e-mail containing:</p>',
                        '<ul>',
                        '<tpl for="items">',
                            '<li>{productName} <i>{productCode}</i> {giftCardCode}</li>',
                        '</tpl>',
                        '</ul>'
                    ]).apply(this.packageData)
                });
            }
        });
    }
});