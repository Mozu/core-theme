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

    title: 'Edit Address',

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
        }

        // default the country code if one is not provided;
        var countryCode = this.record.get("countryCode");
        if (!countryCode && this.useDefaultCountryCode) {
            this.record.set("countryCode", this.defaultCountryCode);
            countryCode = this.defaultCountryCode;
        }
        var isUnitedStates = (!countryCode || countryCode === 'US');

        var nameFieldContainer = {
            xtype: "fieldcontainer",
            layout: "hbox",
            anchor: "0",
            items: []
        }


        if (me.showCompanyName) {
            nameFieldContainer.items.push({
                xtype: 'textfield',
                name: 'companyOrOrganization',
                fieldLabel: 'Company Name',
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
                fieldLabel: 'Email',
                margin: '0 15 0 0'
            });
        }


        var addressType = {
            xtype: 'combobox',
            name: 'addressType',
            fieldLabel: 'Address Type',
            forceSelection: true,
            store: ['Residential', 'Commercial']
        }

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
            fieldLabel: 'Address 1',
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
                    fieldLabel: 'Address 2',
                    margin: '0 15 0 0'
                }, {
                    xtype: 'textfield',
                    flex: 1,
                    name: 'address3',
                    fieldLabel: 'Address 3',
                    margin: '0 15 0 0'
                }, {
                    xtype: 'textfield',
                    flex: 1,
                    name: 'address4',
                    fieldLabel: 'Address 4'
                }
            ]
        });

        me.postalRegion = Ext.create('Taco.core.ux.form.TextField', {
            name: 'stateOrProvince',
            fieldStyle: 'text-transform:uppercase',
            flex: 1,
            fieldLabel: isUnitedStates ? 'State' : 'Region',
            minLength: isUnitedStates ? 2 : 0,
            margin: '0 15 0 0',
            allowBlank: !isUnitedStates
        });
        me.postalCode = Ext.create('Taco.core.ux.form.TextField', {
            flex: 1,
            name: 'postalOrZipCode',
            fieldLabel: isUnitedStates ? 'ZIP' : 'Postal Code',
            allowBlank: !isUnitedStates
        });

        me.postalFieldContainer = Ext.create('Ext.form.FieldContainer', {
            xtype: "fieldcontainer",
            layout: "hbox",
            flex: 1,
            margin: '0 15 0 0',
            items: [
                me.postalRegion,
                me.postalCode
            ]
        });

        fields.push({
            xtype: "fieldcontainer",
            layout: "hbox",
            items: [
                {
                    xtype: 'textfield',
                    name: 'cityOrTown',
                    fieldLabel: 'City',
                    flex: 1,
                    margin: '0 15 0 0',
                    allowBlank: false
                },
                me.postalFieldContainer,
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
                    fieldLabel: 'Country',
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
        })


        if (this.showPhoneNumbers) {
            fields.push({
                xtype: "fieldcontainer",
                layout: "hbox",
                items: [{
                    xtype: 'phonefield',
                    name: 'homePhone',
                    flex: 1,
                    fieldLabel: 'Home Phone',
                    margin: '0 15 0 0'
                }, {
                    xtype: 'phonefield',
                    name: 'workPhone',
                    flex: 1,
                    fieldLabel: 'Work Phone',
                    margin: '0 15 0 0'
                }, {
                    xtype: 'phonefield',
                    name: 'mobilePhone',
                    flex: 1,
                    fieldLabel: 'Mobile Phone',
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
                        fieldLabel: 'First Name',
                        margin: '0 15 0 0',
                        allowBlank: false,
                        labelStyle: 'padding-top: 5px'
                    }, {
                        xtype: 'textfield',
                        // width: 206,
                        flex: 1,
                        name: 'middleName',
                        fieldLabel: 'Middle Name',
                        margin: '0 15 0 0',
                        labelStyle: 'padding-top: 5px'
                    }, {
                        xtype: 'textfield',
                        flex: 1,
                        name: 'lastName',
                        fieldLabel: 'Last Name',
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
                items: [{
                    xtype: 'checkbox',
                    boxLabel: 'Default Billing Address',
                    name: 'isPrimaryBilling',
                    inputValue: true,
                    checked: this.record.get('isPrimaryBilling')
                }, {
                    xtype: 'checkbox',
                    padding: '0 0 0 20',
                    boxLabel: 'Default Shipping Address',
                    name: 'isPrimaryShipping',
                    inputValue: true,
                    checked: this.record.get('isPrimaryShipping')
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
        var isUnitedStates = (!newVal || newVal === 'US');
        
        if (isUnitedStates) {
            this.postalRegion.setFieldLabel('State');
            this.postalCode.setFieldLabel('Zip');
            this.postalCode.minLength = 2;
        } else {
            this.postalRegion.setFieldLabel('Region');
            this.postalCode.setFieldLabel('Postal Code');
            this.postalCode.minLength = 0;
        }
        this.postalRegion.setAllowBlank(!isUnitedStates);
        this.postalCode.setAllowBlank(!isUnitedStates);
    }
});