/**
 * @class Taco.shared.view.form.Address
 * Encapsulates a Taco.model.Address and binds fields to a form. You can specify fields to hide with hiddenFields and insert
 * additional fields, by putting them in extraFields.
 */
Ext.define('Taco.shared.view.form.Address', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-addressform',

    requires: [
        'Taco.store.StatesStatic',
        'Taco.model.Contact',
        'Taco.core.ux.form.SelectField',
        'Taco.core.ux.form.PhoneNumberField'
    ],

    title: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.title,

    addressHasNames: true,

    showCompanyName: true,
    showEmail: true,
    showPhoneNumbers: true,
    showDefaultOptions: false,

    emailRequired: false,

    // wether to default the country code field to the default country code
    useDefaultCountryCode: true,

    // the default country code to use;
    defaultCountryCode: "US",

    initComponent: function () {
        var me = this,
            fields = [];

        this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor-fields';

        this.layout = {
            type: "anchor"
        };

        // default the country code if one is not provided;
        var countryCode = this.record.get("countryCode");
        if (!countryCode && this.useDefaultCountryCode) {
            this.record.set("countryCode", this.defaultCountryCode);
            countryCode = this.defaultCountryCode;
        }
        var isUsaOrCanada = (!countryCode || countryCode === 'US' || countryCode === 'CA');

        var nameFieldContainer = {
            xtype: "fieldcontainer",
            layout: "hbox",
            anchor: "0",
            items: []
        };


        if (me.showCompanyName) {
            nameFieldContainer.items.push({
                xtype: 'textfield',
                name: 'companyOrOrganization',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.company_name,
                flex: 1,
                margin: '0 15 0 0'
            })
        }

        if (me.showEmail) {
            nameFieldContainer.items.push({
                xtype: 'textfield',
                flex: 1,
                allowBlank: !this.emailRequired,
                name: 'email',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.email,
                margin: '0 15 0 0'
            });
        }


        var addressType = {
            xtype: 'combobox',
            name: 'addressType',
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.address_type,
            forceSelection: true,
            store: [Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.residential_addr, Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.commercial_addr]
        };

        if (me.showEmail || me.showCompanyName) {
            addressType.flex = 1;
        } else {
            addressType.width = "33%";
        }

        nameFieldContainer.items.push(addressType)

        fields.push(nameFieldContainer);


        fields.push({
            xtype: 'textfield',
            name: 'address1',
            anchor: '0',
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.address_1,
            allowBlank: false
        });

        fields.push({
            xtype: "fieldcontainer",
            layout: "hbox",
            items: [
                {
                    xtype: 'textfield',
                    flex: 1,
                    name: 'address2',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.address_2,
                    margin: '0 15 0 0'
                }, {
                    xtype: 'textfield',
                    flex: 1,
                    name: 'address3',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.address_3,
                    margin: '0 15 0 0'
                }, {
                    xtype: 'textfield',
                    flex: 1,
                    name: 'address4',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.address_4
                }
            ]
        });

        me.postalRegion = Ext.create('Taco.core.ux.form.TextField', {
            name: 'stateOrProvince',
            fieldStyle: isUsaOrCanada ? 'text-transform:uppercase' : '',
            flex: 1,
            fieldLabel: isUsaOrCanada ? Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.state : Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.region,
            minLength: isUsaOrCanada ? 2 : 0,
            margin: '0 15 0 0',
            allowBlank: !isUsaOrCanada
        });
        me.postalCode = Ext.create('Taco.core.ux.form.TextField', {
            flex: 1,
            name: 'postalOrZipCode',
            fieldLabel: isUsaOrCanada ? Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.ZIP : Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.postal_code,
            allowBlank: !isUsaOrCanada
        });

        // me.postalFieldContainer = Ext.create('Ext.form.FieldContainer', {
        //     xtype: "fieldcontainer",
        //     layout: "hbox",
        //     flex: 1,
        //     margin: '0 15 0 0',
        //     items: [
        //         me.postalRegion,
        //         me.postalCode
        //     ]
        // });

        fields.push({
            xtype: "fieldcontainer",
            layout: "hbox",
            items: [
                {
                    xtype: 'textfield',
                    name: 'cityOrTown',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.city,
                    flex: 1,
                    margin: '0 15 0 0',
                    allowBlank: false
                },
                // me.postalFieldContainer,
                me.postalRegion,
                me.postalCode,
                //{
                //    xtype: "fieldcontainer",
                //    layout: "hbox",
                //    flex: 1,
                //    margin: '0 15 0 0',
                //    items: [
                //        me.postalRegion,
                //        me.postalCode
                //    ]
                //},

                {
                    xtype: 'combobox',
                    name: 'countryCode',
                    flex: 1,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.country,
                    allowBlank: false,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'code',
                    forceSelection: true,
                    store: {
                        type: 'Taco.store.Countries'
                    },
                    emptyText: "Country",
                    selectOnFocus: true,
                    listeners: {
                        change: {
                            fn: me.onCountryChange,
                            scope: me
                        }
                    }
                }
            ]
        });


        if (this.showPhoneNumbers) {
            fields.push({
                xtype: "fieldcontainer",
                layout: "hbox",
                items: [{
                    xtype: 'phonefield',
                    name: 'homePhone',
                    flex: 1,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.home_phone,

                    margin: '0 15 0 0',
                    allowBlank: false
                }, {
                    xtype: 'phonefield',
                    name: 'workPhone',
                    flex: 1,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.work_phone,
                    margin: '0 15 0 0'
                }, {
                    xtype: 'phonefield',
                    name: 'mobilePhone',
                    flex: 1,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.mobile_phone,
                    margin: '0 0 0 0'
                }]
            });
        }


        if (this.addressHasNames) {
            fields.unshift({
                xtype: "fieldcontainer",
                layout: "hbox",
                items: [
                    {
                        xtype: 'textfield',
                        flex: 1,
                        name: 'firstName',
                        fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.first_name,
                        margin: '0 15 0 0',
                        allowBlank: false,
                        labelStyle: 'padding-top: 5px'
                    }, {
                        xtype: 'textfield',
                        // width: 206,
                        flex: 1,
                        name: 'middleName',
                        fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.middle_name,
                        margin: '0 15 0 0',
                        labelStyle: 'padding-top: 5px'
                    }, {
                        xtype: 'textfield',
                        flex: 1,
                        name: 'lastName',
                        fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.last_name,
                        allowBlank: false,
                        labelStyle: 'padding-top: 5px'
                    }
                ]
            });
        }

        if (this.showDefaultOptions) {
            fields.push({
                xtype: 'container',
                width: '100%',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'checkbox',
                        margin: '0,10,0,0',
                        boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.billing_address,
                        name: 'isBilling',
                        inputValue: true,
                        listeners: {
                            change: me.onBillingOrShippingChange,
                            scope:me
                        }
                    },
                    {
                        xtype: 'checkbox',
                        margin: '0 10',
                        boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.default_billing_address,
                        name: 'isPrimaryBilling',
                        inputValue: true,
                        listeners: {
                            change: me.onBillingOrShippingChange,
                            scope: me
                        }
                    }, {
                        xtype: 'checkbox',
                        margin: '0 10',
                        boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.shipping_address,
                        name: 'isShipping',
                        inputValue: true,
                        listeners: {
                            change: me.onBillingOrShippingChange,
                            scope: me
                        }
                    }, {
                        xtype: 'checkbox',
                        margin: '0,0,0,10',
                        boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.default_shipping_address,
                        name: 'isPrimaryShipping',
                        inputValue: true,
                        listeners: {
                            change: me.onBillingOrShippingChange,
                            scope: me
                        }
                    }]
            });
        }

        this.items = fields;

        this.callParent(arguments);

        // need to set the raw value of the country code field becuase the isValid checks rawValue instead of value.
        var countryCodeField = this.getForm().findField("countryCode");
        if (countryCodeField) {
            countryCodeField.setValue(this.record.get("countryCode"))
        }

    },

    beforeSave: function () {
        var me = this;
        if (this.showDefaultOptions) {
            this.record.set('isPrimaryBilling', this.down('[name="isPrimaryBilling"]').getValue());
            this.record.set('isPrimaryShipping', this.down('[name="isPrimaryShipping"]').getValue());
            this.record.set('isBilling', this.down('[name="isBilling"]').getValue());
            this.record.set('isShipping', this.down('[name="isShipping"]').getValue());
        }

        // convert state to 2 digit value if the countryCode is US
        var countryCode = me.form.findField("countryCode").getValue();
        // only do the conversion if the country is the US
        if (countryCode == "US") {
            var stateField = me.form.findField("stateOrProvince"),
                stateCode = stateField.getValue();

            // only convert if the value isn't a 2 character code;
            if (stateField.getValue().length != 2) {
                var stateStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.StatesStatic');
                var stateRecord = stateStore.findRecord("value", stateField.getValue(), 0, true, false, false);
                if (stateRecord) {
                    stateCode = stateRecord.get("code");
                    // overwrite the user entered value with a usps code version;
                    stateField.setValue(stateCode);
                }
            }
        }

        return true
    },

    addSaveTasks: function (tasks) {
        tasks.add({
            key: 'update-contact',
            updateRecord: this.record,
            updateForm: this
        });
    },

    onCountryChange: function (scope, newVal, oldVal, eOpts) {
        var isUsaOrCanada = (!newVal || newVal === 'US' || newVal === 'CA');

        if (isUsaOrCanada) {
            this.postalRegion.setFieldLabel(Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.state);
            //this.postalRegion.setFieldStyle('text-transform:uppercase');
            this.postalCode.setFieldLabel(Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.ZIP);
            this.postalCode.minLength = 2;
        } else {
            this.postalRegion.setFieldLabel(Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.region);
            // todo: field style not refreshing DOM - Greg Murray on 2014-10-24
            //this.postalRegion.setFieldStyle(''); 
            this.postalCode.setFieldLabel(Localizer.langResources.ORDERS.Orders.OrderEdit.AddNewAddress.postal_code);
            this.postalCode.minLength = 0;
        }
        this.postalRegion.setAllowBlank(!isUsaOrCanada);
        this.postalCode.setAllowBlank(!isUsaOrCanada);
    },
    onBillingOrShippingChange: function (scope, newValue) {
        // (using billing but same for shipping)
        // If the name doesn't contain primary and its being unchecked
        // we want to uncheck the isPrimaryBilling else if the name contains primary and its being checked
        // we want to make sure to check the IsBilling
        var name = scope.name.indexOf('Primary') == -1 && !newValue
            ? 'isPrimary' + scope.name.substr(2)
            : scope.name.indexOf('Primary') > -1 && newValue
                ? scope.name.replace('Primary', '')
                : null;

        if (name) {
            scope.up().down('[name=' + name + ']').setValue(newValue);
        }
    }
});