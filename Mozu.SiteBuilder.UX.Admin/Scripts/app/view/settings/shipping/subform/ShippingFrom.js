/**
 * @class Taco.view.settings.shipping.subform.ShippingFrom
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingFrom', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Shipping From',

    initComponent: function () {
        var me = this, isAddressEmpty = true;

        this.addressRecord = Ext.create('Taco.model.Contact', this.record.get('siteShippingOriginAddress') || {});


        this.addressView = Ext.widget({
            xtype: 'component',
            cls: 'address',
            style: 'line-height: 2.5rem;background-color: #f9f9f9;border: 1px solid #bfbfbf',
            data: this.addressRecord.data,
            tpl: [
                '<div class="name">{firstName} {lastName}</div>',
                '<div class="address-line-1">{address1}</div>',
                '<div class="address-line-2">{address2}</div>',
                '<div class="address-line-3">{address3}</div>',
                '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                '<div class="country">{countryCode}</div>',
                '<div class="phone">{[ values.workPhone ? values.workPhone : values.homePhone ]}</div>'
            
            ]
            
        });

        this.editButton = Ext.widget({
            xtype: 'secondarybutton',
            text: 'Edit',
            click: function () {
                me.editAddress();
            } 
           
        });


        if (this.addressRecord.data) {

            Ext.Object.each(this.addressRecord.data, function (key, value) {
                if (value && value !== '') {
                    isAddressEmpty = false;
                }
            });

        }


        this.items = [this.addressView, this.editButton];

        this.callParent(arguments);

        if (isAddressEmpty) {
            this.on('boxready', function () {
                this.editAddress();
            }, this);

        }

    },
    editAddress: function () {
        var me = this,
            modal = Ext.create('Taco.shared.view.modal.Address', {
            record: me.addressRecord,
            addressHasNames: false,
            validateAddress: true,
            listeners: {
                savesuccess: function () {
                    me.record.set('siteShippingOriginAddress', Ext.apply({}, me.addressRecord.data));
                    me.addressView.update(me.addressRecord.data);
                }
            }
        });
    }
    
});