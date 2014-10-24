
/**
 * @class Taco.shared.view.field.Address
 * Display field that shows an address; Also will show a button to open address editor modal;
 * Supports adding additional components to the buttonContainer
 */

Ext.define('Taco.shared.view.field.Address', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.taco-addressfield',
    requires: [
        'Taco.shared.view.modal.Address',
        //'Ext.form.field.Display',
        'Taco.core.ux.form.field.EditableDisplayField',
        'Ext.button.Button',
        'Ext.form.FieldContainer',
        'Ext.XTemplate'
    ],
    width: 400,
    fieldLabel: 'Address',
    name: "address",
    readOnly: false,
    disabled: false,
  //  items:[],
    
    // fore the button container to be hidden or shown; will automatically hide and show based on its contents;
    showButtons: true,
    // hides/shows the edit button. Will automatically be hidden when field is readOnly or disabled;
    showEditButton: true,
        
    // additional components to be added after the edit button or in place of the edit button;
    buttonItems: null,
        
    // if you want to override the editAddressButton pass in a componened
    editAddressButton: null,
        
    // Container that will eventually container all the buttons at the bottom of the display field
    buttonContainer: null,

    // the scoped reference to the display field showing the address information
    addressField : null,

    editOnFieldClick: true,

    addressValidationRequired: false,

    defaultValue : {
        "address1": "",
        "address2": "",
        "address3": "",
        "address4": "",
        "cityOrTown": "",
        "stateOrProvince": "",
        "countryCode": "",
        "postalOrZipCode": "",				
        "addressType": {}, 
        "addressIsValidated": false
    },

    //allowBlank: true,
    
    initComponent: function () {
        var me = this,
            addressDisplayTpl = me.getAddressDisplayTemplate();
        
        if (!me.items) {
            me.items = [];
        }

        if (!me.buttonItems) {
            me.buttonItems = [];
        }

        // this is a work around for arrays defined in the config;
        //me.buttonItems = Ext.clone(me.buttonItems);

        
        me.addressField = Ext.create('Taco.core.ux.form.field.EditableDisplayField', {
            name: me.name,
            width: "100%",
            allowBlank: me.allowBlank,
            onClick: function() {
                if (me.editOnFieldClick) {
                    me.editAddress();
                }
            },
            validator: function (value) {
                var errors = [];
                
                if (me.allowBlank) {
                    return true;
                } else {
                    // requires a valid address (uses editors validation methodology
                    if (value && this.addressValidationRequired) {
                        if (value.addressIsValidated) {
                            return true;
                        } else {
                            return "Address requires validation. Click the \"Edit address\" button and then click the \"Validate\" button";
                        }
                    } else {
                        var isUsaOrCanada = (! value || value.countryCode === 'US' || value.countryCode === 'CA');
                        if ((!value || !value.address1 || !value.cityOrTown || !value.countryCode)
                            || (isUsaOrCanada && (!value.stateOrProvince || !value.postalOrZipCode))) {
                            return "Address is required";
                        }
                        return true;
                    }
                }

                
            },
            tpl: me.getAddressDisplayTemplate()
        });

        me.items.push(me.addressField);
        
        me.initActionButtons();
        
        me.callParent(arguments);
    },
    initActionButtons: function () {
        var me = this;
        
        if (me.readOnly || me.disabled) {
            me.showEditButton = false;
        }

        if (me.showEditButton) {
            // if button was not provided, create one.
            if (!me.editAddressButton) {
                me.editAddressButton = Ext.create('Ext.button.Button', {
                    ui: "action",
                    scale: "medium",
                    text: 'Edit Address',
                    handler: me.editAddress,
                    scope: me
                });
            }
            
            me.buttonItems.unshift(me.editAddressButton);
        }


        if (me.buttonItems && me.buttonItems.length) {
            // button container under the displayField. Can include additional components;
            me.buttonContainer = Ext.create('Ext.Container', {
                width: 400,
                //hidden: !me.showButtons,
                layout: 'hbox',
                items: me.buttonItems
            });

            me.items.push(me.buttonContainer);
        }

        
    },
    
    getAddressDisplayTemplate: function () {
        return Ext.create('Ext.XTemplate', [
            '<tpl if="!address1 && !address2 && !address3 && !address4">',
            //'<div class="address-none" style="color:#ccc;"><br></div>',
            '<br>',
            '<tpl else>',
            '<div class="address-line-1">{address1}</div>',
            '<div class="address-line-2">{address2}</div>',
            '<div class="address-line-3">{address3}</div>',
            '<div class="address-line-4">{address4}</div>',
            '<div class="city-state-zip">{cityOrTown}, {stateOrProvince} {postalOrZipCode}</div>',
            '<div class="country">{countryCode}</div>',
            '</tpl>'
        ]);
    },
    
    editAddress: function() {
        var me = this,
        addressData = Ext.clone(me.addressField.getValue()),
        modal = Ext.create('Taco.shared.view.modal.Address', {
            record: addressData,
            scale: null,
            addressHasNames: false,
            showCompanyName: false,
            showEmail: false,
            showPhoneNumbers: false,
            validateAddress: false,
            listeners: {
                close:function (){
                    me.addressField.focus();
                },
                savesuccess: function (win, record) {
                    var updatedAddressData = record.data,
                        address = Ext.clone(me.addressField.originalValue),
                        addressFields = Ext.Object.getKeys(me.defaultValue);
                    
                    address = Ext.copyTo(address, updatedAddressData, addressFields);
                    me.addressField.setValue(address);
                }
            }
        });
        
    },
    onDestroy: function () {
        var me = this;
        
        me.addressField.destroy();
        
        if (me.editAddressButton) {
            me.editAddressButton.destroy();
        }
        
        if (me.buttonContainer) {
            
            me.buttonContainer.destroy();
        }

        me.buttonItems = null;
        
        this.callParent(arguments);
    }
});
