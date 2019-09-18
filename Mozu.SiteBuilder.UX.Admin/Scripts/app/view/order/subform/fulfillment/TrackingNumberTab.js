
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

        if (this.shipmentRecord.trackingNumbers && this.shipmentRecord.trackingNumbers.length == 1 && this.shipmentRecord.shippingMethodCode) {
            this.tabTitle = '<span class="label">Tracking</span><span class="title">' + this.shipmentRecord.shippingMethodName + ' ' + this.shipmentRecord.trackingNumbers[0] + '</span>';
            this.isTabTitleHtml = true;
        }
        else if (this.shipmentRecord.trackingNumbers && this.shipmentRecord.trackingNumbers.length > 1) 
            this.tabTitle = 'Tracking' + ' (' + this.shipmentRecord.trackingNumbers.length + ')';
        else
            this.tabTitle = 'Tracking';


        this.trackingInfoContainer = Ext.widget({
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
                data: this.shipmentRecord
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
                            '<tpl for="values.trackingNumbers">',
                            '<div class="labelvalue">{.}</div> <br/>',
                            '</tpl>'
                        ]
                    }
                ]
        });

        this.items = [
            this.trackingInfoContainer
        ];
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});