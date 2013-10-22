
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
    config: {
        // fore the button container to be hidden or shown; will automatically hide and show based on its contents;
        showButtons: true,
        // hides/shows the edit button. Will automatically be hidden when field is readOnly or disabled;
        showEditButton: true,
        // additional components to be added after the edit button or in place of the edit button;
        buttonItems: [],
        
        // if you want to override the editAddressButton pass in a componened
        editAddressButton: null,
        
        // Container that will eventually container all the buttons at the bottom of the display field
        buttonContainer: null,

        // the scoped reference to the display field showing the address information
        addressField : null,

        defaultValue : {
            "address1": "",
            "address2": "",
            "address3": "",
            "address4": "",
            "cityOrTown": "",
            "state": "",
            "countryCode": "",
            "zipCode": "",				
            "addressType": {}, 
            "addressIsValidated": false
        },

        allowBlank: true
    },

    initComponent: function () {
        var me = this;

        if (!this.items) {
            this.items = [];
        }
        

        var addressDisplayTpl = me.getAddressDisplayTemplate();

        this.addressField = Ext.create('Taco.core.ux.form.field.EditableDisplayField', {
            name: this.name,
            width: "100%",
            allowBlank: this.allowBlank,
            validator: function () {
                var errors = [],
                    value = this.getValue();
                
                if (this.allowBlank) {
                    return true;
                } else if (value && value.addressIsValidated) {
                    return true;
                } else {
                    return "Address is required";
                }
            },
            renderer: function (value, field) {
                return addressDisplayTpl.apply(value);
            }
        });

        this.items.push(this.addressField);
        
        this.initButtons();
        
        this.callParent(arguments);
    },
    initButtons: function () {
        var me = this;
        if (this.readOnly || this.disabled) {
            this.showEditButton = false;
        }

        if (this.showEditButton) {
            
            // if button was not provided, create one.
            if (!this.editAddressButton) {
                this.editAddressButton = Ext.create('Ext.button.Button', {
                    ui: "action",
                    scale: "medium",
                    text: 'Edit Address',
                    handler: function () {
                        var addressData = Ext.clone(me.addressField.getValue());
                        var modal = Ext.create('Taco.shared.view.modal.Address', {
                            record: addressData,
                            scale: null,
                            addressHasNames: false,
                            showCompanyName: false,
                            showEmail: false,
                            showPhoneNumbers: false,
                            validateAddress: true,
                            listeners: {
                                savesuccess: function (win, record) {
                                    
                                    var updatedAddressData = record.data;
                                    var address = Ext.clone(me.addressField.originalValue);
                                    var addressFields = Ext.Object.getKeys(address);
                                    address = Ext.copyTo(address, updatedAddressData, addressFields);
                                    me.addressField.setValue(address);
                                }
                            }
                        });
                    },
                    scope: this

                });
            }
            
            me.buttonItems.unshift(this.editAddressButton);
        }

        // button container under the displayField. Can include additional components;
        this.buttonContainer = Ext.create('Ext.Container', {
            width: 400,
            hidden:!this.showButtons,
            layout: 'hbox',
            items: me.buttonItems
        });
        
        this.items.push(this.buttonContainer);
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
            '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
            '<div class="country">{countryCode}</div>',
            '</tpl>'
        ]);
    } 
})