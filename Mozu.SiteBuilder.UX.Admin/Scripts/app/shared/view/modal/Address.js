/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Address', {
    extend: 'Taco.core.ux.window.WindowWithActions',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address',
        'Ext.window.MessageBox'
    ],

    autoShow: true,

    width: 700,

    addressHasNames: true,
    validateAddress: true,

    formCfg: null,

    initComponent: function () {
        var me = this;
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

        //ToDo: Fix this. If multiple recs are returned
        me.on({
            save: function () {
                if (this.validateAddress) {
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
                                                for (item in validatedAddr) {
                                                    me.record.set(item, validatedAddr[item]);
                                                }
                                                this.form.loadRecord(me.record);
                                                this.form.save();
                                            } else {
                                                this.form.save();
                                            }
                                        }
                                    });
                                } else {
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
                } else {
                    this.form.save();
                }
            },
            scope: me
        });
    }
});