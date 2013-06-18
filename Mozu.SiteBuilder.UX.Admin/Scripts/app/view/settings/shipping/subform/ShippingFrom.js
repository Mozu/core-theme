/**
 * @class Taco.view.settings.shipping.subform.ShippingFrom
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingFrom', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Shipping From',
    initComponent: function () {
        var me = this;

        this.addressRecord = Ext.create('Taco.model.Contact', this.record.get('siteShippingOriginAddress') || {});      


        this.addressView = Ext.widget({
            xtype: 'component',
            cls: 'address',
            data: this.addressRecord.data,
            tpl: [
                '<div class="name">{companyName}</div>',
                '<div class="address-line-1">{address1}</div>',
                '<div class="address-line-2">{address2}</div>',
                '<div class="address-line-3">{address3}</div>',
                '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                '<div class="country">{countryCode}</div>'
            ]
        });

        this.editButton = {
            xtype: 'secondarybutton',
            text: 'Edit',
            click: function () {
                var modal = Ext.create('Taco.view.customers.AddressModal', {
                    record: me.addressRecord,
                    addressHasNames: false,
                    listeners: {
                        save: function () {
                            me.record.set('siteShippingOriginAddress', Ext.apply({}, me.addressRecord.data));
                            me.addressView.update(me.addressRecord.data);
                        }
                    }
                });
            }
        };        


        this.items = [this.addressView, this.editButton];

        this.callParent(arguments);
    }
});