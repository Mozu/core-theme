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
    title: 'Edit Address',

    addressHasNames: true,
    showCompanyName: true,
    showEmail: true,
    showPhoneNumbers: true,
    
    validateAddress: true,

    title:"Edit Address",

    formCfg: null,

    actions: [{
        xtype: 'button',
        ui: 'action',
        scale: 'medium',
        text: 'Validate',
        handler: function () {
            //this.validateOnly();
            this.validateAndPrompt(function () {
                //me.form.save();
            });
        },
        itemId: 'otherAction'
    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction',
        handler: function () {
            var me = this;
            this.validateAndPrompt(function () {
                me.form.save();
                me.close();
            });
        },
        formBind: true
    }],

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

        //this.on({
        //    beforesave: {
        //        scope: this,
        //        fn: 'maybeValidate'
        //    },
        //    save: {
        //        scope: this,
        //        fn: 'save'
        //    }
        //});
    },

    /**
     * Request address validation if the current address has not yet been validated. If this dialog
     * was configured to bypass address validation, this function will always return true.
     *
     * @private
     * @return {Boolean} The validity state of the current address (before validation).
     */
    maybeValidate: function () {
        var wasValid = this.validateAddress ? !!(this.record.get('addressIsValidated')) : true;

        if (!wasValid) {
            this.validate();
        }

        return wasValid;
    },

    /**
     * Save the form.
     *
     * @private
     * @deprecated
     */
    save: function () {
        this.form.save();
    },

    /**
     * Validate the address and update the record
     *
     * @private
     */
    validateOnly: function () {
        var me = this;
        this.validateForm(function (response) {
            if (response.error) {
                Ext.Msg.show({
                    title: 'Address',
                    msg: 'Unable to validate address'
                });
            } else {
                response.applyToRecord();
            }
        });
    },

    /**
     * Validate the address, if validated address differs from record, ask if should use validated address instead, then invoke callback
     *
     * @private
     */
    validateAndPrompt: function (callback) {
        var me = this;
        this.validateForm(function (response) {
            if (response.error) {
                Ext.Msg.show({
                    title: 'Address',
                    msg: 'Unable to validate address'
                });
                callback();
            } else if (response.changed) {
                var message = '';
                message += response.validatedAddr['address1'] + '<br />';
                if (response.validatedAddr['address2'] != '') {
                    message += response.validatedAddr['address2'] + '<br />';
                }
                message += response.validatedAddr['cityOrTown'] + ', ';
                message += response.validatedAddr['state'] + ' ';
                message += response.validatedAddr['zipCode'] + '<br />';
                message += response.validatedAddr['countryCode'];
                Ext.Msg.show({
                    title: 'Validated Address',
                    msg: 'Valid address is:<p>' + message + '</p>',
                    buttons: Ext.Msg.YESNO,
                    buttonText: {yes: "Use This", no: "Keep Original"},
                    xbuttons: { 
                        ok: "Use This", 
                        handler: function(){ 
                            Ext.MessageBox.hide(); 

                        },
                        cancel: "Keep Original",
                        handler: function(){
                            Ext.MessageBox.hide();
                        }
                    },

                    closable: false,
                    rightJustifyButtons: true,
                    scope: this,
                    fn: function (rec) {
                        if (rec === "yes") {
                            response.applyToRecord();
                        }
                        callback();
                    }
                });
            } else {
                callback();
            }
        });
    },

    /**
     * Validate the form and invoke callback with summarized response
     *
     * @private
     */
    validateForm: function (callback) {
        var me = this;
        this.setLoading(true);
        var response = {
            error: true,
            changed: null,
            validatedAddr: {},
            applyToRecord: function () {
                this.validatedAddr.addressIsValidated = true;
                for (item in this.validatedAddr) {
                    me.record.set(item, this.validatedAddr[item]);
                }
                me.form.loadRecord(me.record);
            }
        };
        Ext.Ajax.request({
            url: '/admin/app/address/validate',
            method: 'POST',
            jsonData: this.form.getValues(),
            scope: this,
            success: function (resp) {
                this.setLoading(false);
                this.json = JSON.parse(resp.responseText);
                if (this.json.total > 0) {
                    var validatedAddr = this.json.items[0];
                    var rawAddr = this.form.getValues();
                    response.error = false;
                    response.changed = false;
                    response.validatedAddr = validatedAddr;
                    for (item in validatedAddr) {
                        if (item == 'addressIsValidated')
                            continue;
                        if (rawAddr[item] != validatedAddr[item]) {
                            response.changed = true;
                            break;
                        }
                    }
                }
                if (response.changed) {
                    me.record.set('addressIsValidated', false);
                }
                callback(response);
            },
            failure: function () {
                this.setLoading(false);
                me.record.set('addressIsValidated', false);
                callback(response);
            }
        });
    },

    /**
     * Perform an ajax request to validate the current address.
     *
     * @private
     * @deprecated
     */
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
