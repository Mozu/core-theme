
Ext.define('Taco.view.order.subform.fulfillment.TrackingNumberTab', {
    extend: 'Taco.view.order.subform.Subform',

    title: 'Tracking Numbers',

    initComponent: function () {
        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;

        if (this.shipmentRecord.trackingNumber && this.shipmentRecord.shippingMethodName) {
            this.tabTitle = '<span class="label">Tracking</span><span class="title">' + this.shipmentRecord.shippingMethodName + ' ' + this.shipmentRecord.trackingNumber + '</span>';
            this.isTabTitleHtml = true;
        }
        else {
            this.tabTitle = 'Tracking';
        }
        this.locationInfoContainer = Ext.widget({
            itemId: 'locationInfoContainer',
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-body',
            padding: '20 20 25 20',
            minHeight:300,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items:
                [
                    {
                        minWidth: '300',
                        tpl: [
                            '<div class="labelvalue">' + this.shipmentRecord.shippingMethodName +'</div>'
                        ]
                    },
                    {
                        tpl: [
                            '<div class="labelvalue">' + this.shipmentRecord.trackingNumber +'</div>'
                        ]
                    }
                ]
        });

        this.items = [
            this.locationInfoContainer
        ];
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});