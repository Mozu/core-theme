/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Address', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address',
        'Ext.window.MessageBox'
    ],

    autoShow: true,

    width: 700,

    addressHasNames: true,
    showCompanyName: true,
    showEmail: true,
    showPhoneNumbers: true,
    
    validateAddress: true,

    title:"Edit Address",

    formCfg: null,

    initComponent: function () {
        var me = this;
        this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!this.record || !this.record.isModel) {
            this.record = Ext.create('Taco.model.Contact', this.record);
        }

        

        this.form = Ext.widget(Ext.apply({
            xtype: 'taco-addressform',
            header:false,
            record: this.record,
            addressHasNames: this.addressHasNames,
            showCompanyName: this.showCompanyName,
            showEmail: this.showEmail,
            showPhoneNumbers: this.showPhoneNumbers,
            manageHeight: false
        }, this.formCfg));

        this.items = [this.form];
        
        this.callParent(arguments);

        //ToDo: Fix this. If multiple recs are returned
        me.on({
            beforesave: {
                scope: this,
                fn: 'maybeValidate'
            },
            save: {
                scope: this,
                fn: 'save'
            }
        });
    },

    maybeValidate: function () {
        var wasValid = this.validateAddress ? !!(this.record.get('addressIsValidated')) : true;

        if (!wasValid) {
            this.validate();
        }

        return wasValid;
    },

    save: function () {
        this.form.save();
    },

    validate: function () {
        var me = this;

        me.record.set('addressIsValidated', false);
        this.setLoading(true);
        Ext.Ajax.request({
            url: '/admin/app/address/validate',
            method: 'POST',
            jsonData: this.form.getValues(),
            scope: this,
            success: function (response) {
                this.json = JSON.parse(response.responseText);
                if (this.json.total > 0) {
                    var addrChanged = false;
                    var validatedAddr = this.json.items[0];
                    var rawAddr = this.form.getValues();

                    for (item in validatedAddr) {
                        if (item == 'addressIsValidated')
                            continue;
                        if (rawAddr[item] != validatedAddr[item]) {
                            addrChanged = true;
                            break;
                        }
                    }

                    if (addrChanged) {
                        var message = '';
                        message += validatedAddr['address1'] + ', ';
                        if (validatedAddr['address2'] != '') {
                            message += validatedAddr['address2'] + ', ';
                        }
                        message += validatedAddr['cityOrTown'] + ' ';
                        message += validatedAddr['state'] + ', ';
                        message += validatedAddr['countryCode'] + ', ';
                        message += validatedAddr['zipCode'];
                        Ext.Msg.show({
                            title: 'Address',
                            msg: 'Did you mean: ' + message,
                            buttons: Ext.Msg.YESNO,
                            closable: false,
                            rightJustifyButtons: true,
                            scope: this,
                            fn: function (rec) {
                                if (rec === "yes") {
                                    validatedAddr['addressIsValidated'] = true;
                                    for (item in validatedAddr) {
                                        me.record.set(item, validatedAddr[item]);
                                    }
                                    this.form.loadRecord(me.record);
                                }
                                this.form.save();
                            }
                        });
                    } else {
                        me.record.set('addressIsValidated', true);
                        this.form.save();
                    }
                }
                this.setLoading(false);

            },
            failure: function () {
                Ext.Msg.show({
                    title: 'Address',
                    msg: 'Unable to validate address'
                });
                this.setLoading(false);
                this.form.save();
            }
        });
    }
});
