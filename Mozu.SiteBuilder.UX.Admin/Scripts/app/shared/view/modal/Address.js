/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Address', {
    extend: 'Taco.core.ux.window.Modal',
    alias: 'widget.taco-address-modal',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address',
        'Ext.window.MessageBox'
    ],

    autoShow: true,

    height: 610,
    width: 700,
    title: 'Edit Address',

    // need this layout in order for scrollbar showing up to cause the form to resize. criminy...
    layout:"anchor",

    addressHasNames: true,
    showCompanyName: true,
    showEmail: true,
    showPhoneNumbers: true,
    showDefaultOptions: false,

    // force user to enter at least one phone number
    singlePhoneRequired: false,
    emailRequired: true,
    validateAddress: true,

    formCfg: null,

    config : {
        actions: [{
            xtype: 'button',
            itemId: 'otherAction',
            ui: 'action',
            scale: 'medium',
            text: 'Validate',
            handler: function () {
                this.validateAndPrompt(true, Ext.emptyFn);
            }
        }, {
            xtype: 'tbfill'
        }, {
            xtype: 'button',
            itemId: 'secondaryAction'
        }, {
            xtype: 'button',
            itemId: 'primaryAction',
            formBind: true,
            handler: function () {                
                this.doSave()
            },
            scope:this
        }]
    },

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
            emailRequired:true,
            addressHasNames: this.addressHasNames,
            showCompanyName: this.showCompanyName,
            showEmail: this.showEmail,
            showPhoneNumbers: this.showPhoneNumbers,
            showDefaultOptions: this.showDefaultOptions,
            manageHeight: false,
            listeners: {                
                savesuccess: {
                    fn: function (form) {
                        // need to wait for the form to finish saving before closing or the events won't fire.                        
                        me.saveSuccess(form.record);
                    },
                    scope: me
                }
            }
        }, this.formCfg));

        this.items = [this.form];
        
        this.callParent(arguments);

        this.down('#otherAction').setDisabled(this.validateAddress === false);
    },


    doSave: function () {        
        this.form.save();
    },

    /**
     * Validate the address, if validated address differs from record, ask if should use validated address instead, then invoke callback
     *
     * @private
     */
    validateAndPrompt: function (onDemandMode, callback) {
        var me = this;

        // before making the server side validation, need to do pseudo check for at least one phone number field
        if (this.singlePhoneRequired) {
            var homePhone = this.form.findField("homePhone").getValue();
            var workPhone = this.form.findField("workPhone").getValue();
            var mobilePhone = this.form.findField("mobilePhone").getValue();
            
            if (!(homePhone.length || workPhone.length || mobilePhone.length)) {
                Taco.app.fireEvent('setmessage', 'Validation error. At least one of the phone numbers is required', 'error');
                return
            }            
        }

        // skip address validation for now
        if (!me.validateAddress) {
            callback();
            return;
        }
        this.validateForm(function (response) {
            if (response.error) {
                Ext.Msg.show({
                    title: 'Address',
                    msg: 'Unable to validate address',
                    buttons: Ext.Msg.OK
                });
                callback();
            } else if (response.changed) {
                var message = '';
                message += response.validatedAddr['address1'] + '<br />';
                if (response.validatedAddr['address2'] != '') {
                    message += response.validatedAddr['address2'] + '<br />';
                }
                message += response.validatedAddr['cityOrTown'] + ', ';
                message += response.validatedAddr['stateOrProvince'] + ' ';
                message += response.validatedAddr['postalOrZipCode'] + '<br />';
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
                if (onDemandMode) {
                    Ext.Msg.show({
                        title: 'Address',
                        msg: 'Address is valid',
                        buttons: Ext.Msg.OK
                    });
                }
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

                // Merge the result of validation with the fields from the form. 
                // The form contains fields like first/last name that are not part of the validation result.
                var mergedFormWithValidationResults = {
                    addressIsValidated: true
                };
                Ext.Object.merge(mergedFormWithValidationResults, me.form.getValues(), this.validatedAddr);
                me.record.set(mergedFormWithValidationResults);

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
                    var a, b;
                    response.error = false;
                    response.changed = false;
                    response.validatedAddr = validatedAddr;
                    for (item in validatedAddr) {
                        if (item == 'addressIsValidated' || item == 'id')
                            continue;
                        a = rawAddr[item];
                        b = validatedAddr[item];
                        a = a === null ? '' : a.toString().toUpperCase();
                        b = b === null ? '' : b.toString().toUpperCase();
                        if (a!==b) {
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
    }
});
