/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Address', {
    extend: 'Taco.core.ux.window.WindowWithActions',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address'
    ],

    autoShow: true,

    width: 700,

    addressHasNames: true,
    validateAddress: false,

    formCfg: null,

    initComponent: function () {
        this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!this.record || !this.record.isModel) {
            this.record = Ext.create('Taco.model.Contact', this.record);
        }

        this.form = Ext.widget(Ext.apply({
            xtype: 'taco-addressform',
            record: this.record,
            manageHeight: false
        }, this.formCfg));

        this.items = [this.form];
        
        this.callParent(arguments);

        this.on({
            save: function () {
                if (this.validateAddress) {
                    console.log('TODO: Validate Address');
                    this.form.save();
/* TODO: Replace two lines above with the following:

1) invoke /app/address/validate with a body that looks like this:
    {
        "firstName": "ojas",
        "middleName": "",
        "lastName": "patel",
        "companyName": "ojas's company",
        "address1": "po box 1271",
        "address2": "",
        "address3": "",
        "address4": "",
        "cityOrTown": "austin",
        "countryCode": "US",
        "zipCode": "78701",
        "state": "TX",
        "homePhone": "512-589-2634",
        "mobilePhone": "",
        "workPhone": ""
    }

2) response will contain array of validated addresses like this:
    {
        "items": [
            {
            "address1": "PO BOX 1271", 
            "address2": "", 
            "cityOrTown": "AUSTIN", 
            "countryCode": "US", 
            "state": "TX", 
            "zipCode": "78767-1271"
            }
        ], 
        "success": true, 
        "total": 1
    }

3) if total == 0:
        this.form.save()
   else:
        display confirmation window "Use this address?" that shows first address with two buttons:
        - Yes: update record with validate address, then call this.form.save()
        - No: call this.form.save()
*/
                } else {
                    this.form.save();
                }
            },
            scope: this
        });
    }
});