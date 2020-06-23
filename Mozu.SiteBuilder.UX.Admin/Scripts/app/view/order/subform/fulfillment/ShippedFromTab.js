
Ext.define('Taco.view.order.subform.fulfillment.ShippedFromTab', {
    extend: 'Taco.view.order.subform.Subform',

    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.location,

    initComponent: function () {
        var shipmentTypeDescription = "";
        if (this.shipmentRecord.shipmentType) {
            if (this.shipmentRecord.shipmentType == "STH")
                shipmentTypeDescription = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.shipped_from;
            else if (this.shipmentRecord.shipmentType == "BOPIS")
            shipmentTypeDescription = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.pickup_from;
            else if (this.shipmentRecord.shipmentType == "Transfer")
                shipmentTypeDescription = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.transfer_from;
        }

        if (this.shipmentRecord.location && this.shipmentRecord.location.displayName) {
            this.tabTitle = '<span class="label">' + shipmentTypeDescription +'</span><span class="title">' + this.shipmentRecord.location.displayName + '</span>';
            this.isTabTitleHtml = true;
        }
        else {
            this.tabTitle = shipmentTypeDescription;
        }

        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
        this.locationInfoContainer = Ext.widget({
            //itemId: 'locationInfoContainer',
            xtype: 'container',
            cls: 'taco-order-fulfillment-shipped-from-tab',
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
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.name + '</span>',
                            '<div class="labelvalue">' + this.shipmentRecord.location.displayName + '</div>'
                        ]
                    },
                    {
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.code + '</span>',
                            '<div class="labelvalue">' + this.shipmentRecord.location.displayCode + '</div>'
                        ]
                    }
                ]
        });

        this.addressInfoContainer = Ext.widget({
            //itemId:'addressInfoContainer',
            xtype: 'container',
            cls: 'taco-order-fulfillment-shipped-from-tab',
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
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.address + '</span>',
                            '<div class="labelvalue">' + me.getFullfillmentFromAddress(this.shipmentRecord.location.address) + '</div>'
                        ]
                    },
                    {
                        tpl: [
                            '<span class="label">' + (me.shipmentRecord.shipmentType == "BOPIS" ? Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.pickup : Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.shipping)+' '+ Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.origin_contact +'</span>',
                            '<div class="labelvalue">' + me.getFullfillmentFromContact(this.shipmentRecord.location.shippingOriginContact) + '</div>'
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
        if (originAddress) {
            if (originAddress.address1)
                address += originAddress.address1 + ' <br/>';
            if (originAddress.address2)
                address += originAddress.address2 + ' <br/>';
            if (originAddress.address3)
                address += originAddress.address3 + ' <br/>';
            if (originAddress.address4)
                address += originAddress.address4 + ' <br/>';
            return '<div class="addressdiv">' + address +
                (originAddress.cityOrTown ? originAddress.cityOrTown : '') + ', ' +
                (originAddress.stateOrProvince ? originAddress.stateOrProvince : '') + ', ' +
                (originAddress.postalOrZipCode ? originAddress.postalOrZipCode : '') + ', ' +
                (originAddress.countryCode ? originAddress.countryCode : '') +
                '</div>';
        }
    },

    getFullfillmentFromContact: function (contact) {
        var tempContact = "";
        if (contact) {
            if (contact.firstName)
                tempContact += 'Name: ' + contact.firstName + ' ' + contact.lastNameOrSurname + ' <br/>';
            if (contact.companyOrOrganization)
                tempContact += 'Company: ' + contact.companyOrOrganization + ' <br/>';
            if (contact.phoneNumber)
                tempContact += 'Phone Number: ' + contact.phoneNumber + ' <br/>';
            if (contact.email)
                tempContact += 'Email: ' + contact.email + ' <br/>';
        }

        return '<div class="addressdiv">' + tempContact +  '</div>';
    },

    onDestroy: function () {
        this.callParent(arguments);
    }
});