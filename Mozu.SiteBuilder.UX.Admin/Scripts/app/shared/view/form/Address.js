/**
 * @class Taco.shared.view.form.Address
 * Encapsulates a Taco.model.Address and binds fields to a form. You can specify fields to hide with hiddenFields and insert
 * additional fields, by putting them in extraFields.
 */
Ext.define('Taco.shared.view.form.Address', {
	extend: 'Taco.core.ux.form.Form',
	alias: 'widget.taco-addressform',

	requires: [
		'Taco.model.Contact',
		'Taco.core.ux.form.SelectField',
		'Taco.store.StateComboBox',
		'Taco.store.CountryComboBox'
	],

	title: 'Edit Address',

	addressHasNames: true,
	
	showCompanyName: true,
	showEmail: true,
	showPhoneNumbers: true,


	initComponent: function () {
	    var me = this,
	        fields = [];
        
		this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor-fields';


        if (me.showCompanyName) {
            fields.push({
                xtype: 'textfield',
                width: 315,
                name: 'companyName',
                fieldLabel: 'Company Name',
                margin: '0 14 5 0',
                style: { 'display': 'inline-table' }
            })
        }
	    
        if (me.showEmail) {
            fields.push({
                xtype: 'textfield',
                width: 315,
                name: 'email',
                fieldLabel: 'Email',
                margin: '0 0 5 0',
                style: { 'display': 'inline-table' }
            })
        }

		fields.push({
            xtype: 'textfield',
            width: 315,
            name: 'address1',
            fieldLabel: 'Address 1',
            margin: '0 14 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address2',
            fieldLabel: 'Address 2',
            margin: '0 0 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address3',
            fieldLabel: 'Address 3',
            margin: '0 14 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address4',
            fieldLabel: 'Address 4',
            margin: '0 0 5 0',
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
            name: 'state',
            fieldLabel: 'State',
            margin: '0 14 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            name: 'zipCode',
            fieldLabel: 'ZIP',
            margin: '0 15 5 0',
            allowBlank: false,
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'combo',
            name: 'countryCode',
            margin: '0 0 5 0',
            style: { 'display': 'inline-table' },
            fieldLabel: 'Country',
            queryMode: 'local',
            displayField: 'label',
            valueField: 'val',
            allowBlank: false,
            store: Ext.create('Ext.data.Store', {
                fields: ['val', 'label'],
                data: [
                    { "val": "US", "label": "US" }
                ]
            })
        });
	    
        if (this.showPhoneNumbers) {
            fields.push({
                    xtype: 'textfield',
                    width: 206,
                    name: 'homePhone',
                    fieldLabel: 'Home Phone',
                    margin: '0 13 5 0',
                    style: { 'display': 'inline-table' }
                }, {
                    xtype: 'textfield',
                    width: 206,
                    name: 'workPhone',
                    fieldLabel: 'Work Phone',
                    margin: '0 13 5 0',
                    style: { 'display': 'inline-table' }
                }, {
                    xtype: 'textfield',
                    width: 206,
                    name: 'mobilePhone',
                    fieldLabel: 'Mobile Phone',
                    margin: '0 0 5 0',
                    style: { 'display': 'inline-table' }
                });
        }
		


        if (this.addressHasNames) {
            fields.unshift({
                xtype: 'textfield',
                width: 206,
                name: 'firstName',
                fieldLabel: 'First Name',
                margin: '0 13 5 0',
                allowBlank: false,
                style: { 'display': 'inline-table' }
            }, {
                xtype: 'textfield',
                width: 206,
                name: 'middleName',
                fieldLabel: 'Middle Name',
                margin: '0 13 5 0',
                style: { 'display': 'inline-table' }
            }, {
                xtype: 'textfield',
                width: 206,
                name: 'lastName',
                fieldLabel: 'Last Name',
                allowBlank: false,
                margin: '0 0 5 0',
                style: { 'display': 'inline-table' }
            });
        }

        this.items = fields;

		this.callParent(arguments);
	},

    addSaveTasks: function (tasks) {
        tasks.add({
            key: 'update-contact',
            updateRecord: this.record,
            updateForm: this
        });
    }
});
