/**
 * @class Taco.view.address.AddressForm
 * Encapsulates a Taco.model.Address and binds fields to a form. You can specify fields to hide with hiddenFields and insert
 * additional fields, by putting them in extraFields.
 */
Ext.define('Taco.view.address.AddressForm', {
	extend: 'Taco.core.ux.form.Form',
	requires: ['Taco.model.Address','Taco.core.ux.form.SelectField','Taco.store.StateComboBox','Taco.store.CountryComboBox'],

	/**
	 * This array should contain the names of the fields/properties, that are included in the form, but are hidden input elements.
	 * @type {Array}
	 */
	hiddenFields: [],

	/**
	 * This array should contain fields that will be appended to the end of the list of default address fields.
	 * @type {Array}
	 */
	extraFields: [],

    initComponent: function () {
    	var me = this;

    	me.stateStore = Ext.create('Taco.store.StateComboBox');
    	me.countryStore = Ext.create('Taco.store.CountryComboBox');

    	var hide = function (name) {
    		return Ext.Array.contains(me.hiddenFields, name);
    	};

    	me.fields = [{
	    	xtype: 'comboboxselect',
	        fieldLabel: 'Type',
	        name: 'type',
	        hidden: hide('type')
	    }, {
	    	xtype: 'formflexbox',
	    	defaults: {
	    		xtype: 'textfield',
		        labelAlign: 'top',
		        labelSeparator: '',
		        width: 235,
		        margin: '0 15 0 0'
		    },
	    	items: [{
		        fieldLabel: 'First',
		        name: 'firstName'
		    }, {
		        fieldLabel: 'Last',
		        name: 'lastName'
		    }]
	    }, {
	        fieldLabel: 'Address Line 1',
	        name: 'address1'
	    }, {
	        fieldLabel: 'Address Line 2',
	        name: 'address2'
	    }, {
	    	xtype: 'formflexbox',
	    	defaults: {
	    		xtype: 'textfield',
		        labelAlign: 'top',
		        labelSeparator: '',
		        width: 100,
		        margin: '0 15 0 0'
		    },
	    	items: [{
		        width: 235,
		        fieldLabel: 'City',
		        name: 'cityOrTown'
		    }, {
		    	xtype: 'selectfield',
		        fieldLabel: 'State',
		        name: 'stateOrProvince',
		        valueField: 'stateCode',
	            displayField: 'stateCode',
		        store: me.stateStore,
		        emptyText: 'Select state'
		    }, {
		        fieldLabel: 'Zip code',
		        name: 'postalOrZipCode'
		    }]
	    }, {
	    	xtype: 'selectfield',
	        fieldLabel: 'Country',
	        name: 'countryCode',
	        valueField: 'countryCode',
	        displayField: 'name',
	        store: me.countryStore
	    }, {
	        fieldLabel: 'Phone',
	        name: 'phoneNumber',
	        hidden: hide('phoneNumber')
	    }, {
	    	width: 500,
	        fieldLabel: 'Company',
	        name: 'companyOrOrganization',
	        hidden: hide('companyOrOrganization')
	    }, {
	    	xtype: 'checkbox',
	        boxLabel: 'Use same for shipping',
	        boxAlign: 'right',
	        name: 'sameForShipping',
	        hidden: hide('sameForShipping')
	    }];

		me.addressForm = Ext.create('Taco.core.FormPanel', {

		    defaults: {
		        xtype: 'textfield',
		        labelAlign: 'top',
		        labelSeparator: '',
		        width: 235
		    },
			items: me.fields.concat(me.extraFields)
	    });

		this.items = [me.addressForm];

    	me.callParent(arguments);
    }
});
