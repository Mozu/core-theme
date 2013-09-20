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

        //ToDo: Fix this. It doesn't resubmit the second time you click save.
        //ToDo: Fix this. If multiple recs are returned
        this.on({
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
                                var message = '';
                                message += this.json.items[0]['address1'] + ', ';
                                if (this.json.items[0]['address2'] != '') {
                                    message += this.json.items[0]['address2'] + ', ';
                                }
                                message += this.json.items[0]['cityOrTown'] + ' ';
                                message += this.json.items[0]['state'] + ', ';
                                message += this.json.items[0]['countryCode'] + ', ';
                                message += this.json.items[0]['zipCode'];
                                Ext.Msg.show({
                                    title: 'Address',
                                    msg: 'Did you mean: ' + message,
                                    buttons: Ext.Msg.YESNO,
                                    closable: false,
                                    rightJustifyButtons: true,
                                    scope: this,
                                    fn: function (rec) {
                                        if (rec === "yes") {
                                            for (item in this.json.items[0]) {
                                                this.form.record.data[item] = this.json.items[0][item];
                                            }
                                            this.form.loadRecord(this.form.record);
                                            this.form.save();
                                            //this.setLoading(false);
                                        } else {
                                            //this.setLoading(false);
                                        }
                                    }
                                });
                            }
                            this.setLoading(false);

                        }
                    });
                } else {
                    this.form.save();
                }
            },
            scope: this
        });
    }
});