
Ext.define('Taco.view.order.subform.fulfillment.TrackingNumberTab', {
    extend: 'Taco.view.order.subform.Subform',

    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.track_shipment,

    initComponent: function () {
        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {        
        this.tabTitle = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.tracking + ' (' + this.tracking.count + ')';

        this.items = [];
        for (var count = 0; count < this.tracking.count; count++) {
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
                        data: this.tracking.trackingData[count].trackings[0]
                    }, 
                    items:
                        [                            
                            {
                                tpl: [
                                    '<tpl for="values.number">',
                                    this.tracking.trackingData[count].carrier && this.tracking.trackingData[count].carrier.toLowerCase() !== 'other' ?
                                    'Track: ' + this.tracking.trackingData[count].carrier + ' <a target="_blank" href="' + this.tracking.trackingData[count].trackings[0].url + '" class="title">{.}</a> <br/>' : 'Other' + ' <span class="title">' + this.tracking.trackingData[count].trackings[0].number + '</span> <br/>',
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