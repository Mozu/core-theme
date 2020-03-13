
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
        me.defaultShippingMethod = (this.tracking.trackingData[0].shippingMethodCode || this.shipmentRecord.shippingMethodCode);
        if (this.tracking.count == 1 && me.defaultShippingMethod) {
            this.tabTitle = '<span class="label">Tracking</span><span class="title">' + me.defaultShippingMethod + ' ' + this.tracking.trackingData[0].trackingNumbers[0] + '</span>';
            this.isTabTitleHtml = true;
        }
        else if (this.tracking.count > 1) 
            this.tabTitle = 'Tracking' + ' (' + this.tracking.count + ')';
        else
            this.tabTitle = 'Tracking';


        this.items = [];
        for (var count = 0; count < this.tracking.trackingData.length; count++) {
            this.items.push(
                Ext.widget({
                    xtype: 'container',
                    cls: 'taco-order-fulfillment-package-body',
                    padding: '5 20 5 20',
                    //minHeight: 300,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    defaults: {
                        xtype: 'component',
                        data: this.tracking.trackingData[count]
                    },
                    items:
                        [
                            {
                                minWidth: '300',
                                tpl: [
                                    '<div class="labelvalue">' + me.defaultShippingMethod + '</div>'
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
                })
            );
        }
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});