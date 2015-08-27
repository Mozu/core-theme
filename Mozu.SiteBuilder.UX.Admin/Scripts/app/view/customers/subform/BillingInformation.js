Ext.define('Taco.view.customers.subform.BillingInformation', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Billing Information',
    cls: Taco.baseCSSPrefix + 'customer-billingInfo',
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
                '<div class="name">{firstName:htmlEncode} {middleName:htmlEncode} {lastName:htmlEncode}</div>',
                '<div class="address-line-1">{address1:htmlEncode}</div>',
                '<div class="address-line-2">{address2:htmlEncode}</div>',
                '<div class="address-line-3">{address3:htmlEncode}</div>',
                '<div class="city-state-zip">{cityOrTown:htmlEncode}, {stateOrProvince:htmlEncode} {postalOrZipCode} {countryCode}</div>',
                '<div class="country">{email:htmlEncode}</div>',
                '<div class="phone">{homePhone:htmlEncode}</div>',
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