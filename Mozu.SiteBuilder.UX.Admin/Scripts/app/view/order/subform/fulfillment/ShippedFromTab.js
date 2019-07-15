
Ext.define('Taco.view.order.subform.fulfillment.ShippedFromTab', {
    extend: 'Taco.view.order.subform.Subform',

    title: 'Location',

    initComponent: function () {


        if (this.shipmentRecord.items && this.shipmentRecord.items.length > 0 && this.shipmentRecord.items[0].fulfillmentLocationCode) {
            this.tabTitle = '<span class="label">Shipped From</span><span class="title">' + this.shipmentRecord.items[0].fulfillmentLocationCode + '</span>';
            this.isTabTitleHtml = true;
        }
        else {
            this.tabTitle = 'Shipped From';
        }

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
                        minWidth: '400',
                        tpl: [
                            '<span class="label">Name</span>',
                            '<div class="labelvalue">Dallas Warehouse</div>'
                        ]
                    },
                    {
                        tpl: [
                            '<span class="label">Code</span>',
                            '<div class="labelvalue">KIBODAL</div>'
                        ]
                    }
                ]
        });

        this.addressInfoContainer = Ext.widget({
            //itemId:'addressInfoContainer',
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-body',
            padding: '20 20 25 20',
            layout: {
                type: 'hbox',
                align: 'stretch',
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items:
                [
                    {
                        minWidth: '400',
                        tpl: [
                            '<span class="label">Address</span>',
                            '<div class="labelvalue">' + me.getFullfillmentFromAddress(this.shipmentRecord.destinationAddress) + '</div>'
                        ]
                    },
                    {
                        tpl: [
                            '<span class="label">Shipping Origin Contact</span>',
                            '<div class="labelvalue">' + me.getFullfillmentFromAddress(this.shipmentRecord.originAddress) + '</div>'
                        ]
                    }
                ]
        });

        this.items = [
            this.locationInfoContainer,
            this.addressInfoContainer
        ];
    },

    getFullfillmentFromAddress: function (originAddress) {
        var address = "";
        //var originAddress = this.shipmentRecord.originAddress;
        if (originAddress)
            return '<div class="addressdiv">' + originAddress.firstName + ' ' + originAddress.lastName + ' <br/>' +
                originAddress.address1 + ', ' + '<br/>' + originAddress.cityOrTown + ', ' + originAddress.stateOrProvince + ' ' + originAddress.postalOrZipCode + '<br/>' +
                originAddress.mobilePhone + ' * ' + originAddress.email + '</div>';
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});