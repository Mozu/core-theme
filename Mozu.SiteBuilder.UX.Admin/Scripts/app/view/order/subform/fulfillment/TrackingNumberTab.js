
Ext.define('Taco.view.order.subform.fulfillment.TrackingNumberTab', {
    extend: 'Taco.view.order.subform.Subform',

    tabTitle: 'Tracking',
    title: 'Tracking Numbers',

    initComponent: function () {

        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
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
                            '<div class="labelvalue">UPS Ground</div>'
                        ]
                    },
                    {
                        tpl: [
                            '<div class="labelvalue">1Z204E380338723749</div>'
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