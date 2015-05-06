Ext.define('Taco.view.customers.subform.ShippingInformation', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Shipping Information',
    cls: Taco.baseCSSPrefix + 'customer-shippingInfo',
    initComponent: function () {

        var data = this.record;

        this.items = [{
            xtype: 'dataview',
            cls: 'addresses',
            itemSelector: '.address',
            store: data,
            width: 300,
            tpl: [
                '<tpl for=".">' +
                '<div class="address">',
                '<div class="edit"><a>Edit</a> &nbsp; &nbsp; Address Validated: <tpl if="addressIsValidated">Yes<tpl else>No</tpl></div>',
                '<hr>',
                '<div class="name">{firstName:stripTags} {middleName:stripTags} {lastName:stripTags}</div>',
                '<div class="address-line-1">{address1:stripTags}</div>',
                '<div class="address-line-2">{address2:stripTags}</div>',
                '<div class="address-line-3">{address3:stripTags}</div>',
                '<div class="city-state-zip">{cityOrTown:stripTags}, {stateOrProvince:stripTags} {postalOrZipCode:stripTags} {countryCode:stripTags}</div>',
                '<div class="country">{email}</div>',
                '<div class="phone">{homePhone:stripTags}</div>',
                '</div></tpl>'
            ],
            listeners: {
                itemclick: function (view, record, item, index, e) {
                    var modal;

                    if (e.getTarget('.edit', 10)) {
                        modal = Ext.create('Taco.shared.view.modal.Address', {
                            record: record,
                            validateAddress: true
                        });
                    }
                }
            }
        }];

        this.callParent(arguments);
    }
});