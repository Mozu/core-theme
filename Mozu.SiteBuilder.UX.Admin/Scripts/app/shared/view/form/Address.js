/**
 * @class Taco.shared.view.form.Address
 * Encapsulates a Taco.model.Address and binds fields to a form. You can specify fields to hide with hiddenFields and insert
 * additional fields, by putting them in extraFields.
 */
Ext.define('Taco.shared.view.form.Address', {
	extend: 'Taco.core.ux.form.Form',
	alias: 'widget.taco-addressform',

	requires: [
        //'Taco.store.StateComboBox',
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

		
        // default the country code if one is not provided;
		var countryCode = this.record.get("countryCodecountryCode");
		if (!countryCode && this.useDefaultCountryCode) {
		    this.record.set("countryCode", this.defaultCountryCode);
		}
	    


        if (me.showCompanyName) {
            fields.push({
                xtype: 'textfield',
                name: 'companyOrOrganization',
                fieldLabel: 'Company Name',
                margin: '0 15 5 0',
                style: { 'display': 'inline-table' }
            })
        }

        if (me.showEmail) {
            fields.push({
                xtype: 'textfield',
                allowBlank: !this.emailRequired,
                name: 'email',
                fieldLabel: 'Email',
                margin: '0 15 5 0',
                style: { 'display': 'inline-table' }
            });
        }

		fields.push({
            xtype: 'combobox',
            // width: 315,
            name: 'addressType',
            fieldLabel: 'Address Type',
            margin: '0 100 5 0',
            style: { 'display': 'inline-table' },
            store: ['Residential', 'Commercial']
        }, {
            xtype: 'textfield',
            width: 480,
            name: 'address1',
            fieldLabel: 'Address 1',
            margin: '0 100 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            // width: 315,
            name: 'address2',
            fieldLabel: 'Address 2',
            margin: '0 15 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            // width: 315,
            name: 'address3',
            fieldLabel: 'Address 3',
            margin: '0 15 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            // width: 315,
            name: 'address4',
            fieldLabel: 'Address 4',
            margin: '0 100 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            name: 'cityOrTown',
            fieldLabel: 'City',
            margin: '0 15 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 68,
            name: 'stateOrProvince',
            fieldStyle: 'text-transform:uppercase',
            fieldLabel: 'State',
            minLength:2,
            margin: '0 14 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 68,
            name: 'postalOrZipCode',
            fieldLabel: 'ZIP',
            margin: '0 14 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'combobox',
            name: 'countryCode',
            margin: '0 100 5 0',
            style: { 'display': 'inline-table' },
            fieldLabel: 'Country',
            allowBlank: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',            
            store: { type: 'Taco.store.Countries' },
            emptyText: "Country",
            selectOnFocus: true
	    });

        if (this.showPhoneNumbers) {
            fields.push({
                    xtype: 'phonefield',
                    name: 'homePhone',
                    fieldLabel: 'Home Phone',
                    margin: '0 15 5 0',
                    style: { 'display': 'inline-table' }
                }, {
                    xtype: 'phonefield',
                    name: 'workPhone',
                    fieldLabel: 'Work Phone',
                    margin: '0 15 5 0',
                    style: { 'display': 'inline-table' }
                }, {
                    xtype: 'phonefield',
                    name: 'mobilePhone',
                    fieldLabel: 'Mobile Phone',
                    margin: '0 0 5 0',
                    style: { 'display': 'inline-table' }
                });
        }
		


        if (this.addressHasNames) {
            fields.unshift({
                xtype: 'textfield',
                // width: 206,
                name: 'firstName',
                fieldLabel: 'First Name',
                margin: '0 15 5 0',
                allowBlank: false,
                labelStyle: 'padding-top: 5px',
                style: { 'display': 'inline-table' }
            }, {
                xtype: 'textfield',
                // width: 206,
                name: 'middleName',
                fieldLabel: 'Middle Name',
                margin: '0 15 5 0',
                labelStyle: 'padding-top: 5px',
                style: { 'display': 'inline-table' }
            }, {
                xtype: 'textfield',
                // width: 206,
                name: 'lastName',
                fieldLabel: 'Last Name',
                allowBlank: false,
                margin: '0 100 5 0',
                labelStyle: 'padding-top: 5px',
                style: { 'display': 'inline-table' }
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
	},

	beforeSave: function (){
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
	        if (stateField.getValue().length != 2){	            
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
    }
});
