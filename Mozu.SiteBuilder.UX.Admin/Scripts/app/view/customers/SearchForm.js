/**
 * @class Taco.view.customers.SearchForm
 */
/*
// deprecated


Ext.define('Taco.view.customers.SearchForm', {
	extend: 'Taco.core.ux.form.Form',
	requires: ['Taco.store.OptionComboBox', 'Taco.core.ux.form.DateTime', 'Ext.ux.form.field.BoxSelect', 'Ext.form.Label', 'Taco.store.StateComboBox'],

    floating: true,
    shadow: false,
    cls: Taco.baseCSSPrefix + 'floating-formpanel',

    searchButton: null,

	initComponent: function () {
		var me = this;

		me.stateStore = Ext.create('Taco.store.StateComboBox');

		// ============================================================= customer name + marketing

		me.customerName = Ext.widget('container', {
			layout: 'hbox',
			defaults: {
				labelAlign: 'top',
				width: 150,
				margin: '0 30 0 0'
			},
			items: [{
				xtype: 'textfield',
				name: 'customerName',
				fieldLabel: 'Customer Name',
				width: 330
			}, {
				xtype: 'combobox',
				name: 'acceptsMarketing',
                mode: 'local',
                valueField: 'storedValue',
                displayField: 'displayValue',
                editable: false,
				store: Ext.create('Ext.data.ArrayStore', {
                    fields: [{
                        name: 'storedValue',
                        type: 'boolean'
                    }, {
                        name: 'displayValue',
                        type: 'string'
                    }],
                    data: [
                        [true, 'Yes'],
                        [false, 'No']
                    ]
                }),
				fieldLabel: 'Accepts Marketing'
			}]
		});

		// ============================================================= customer location

		me.customerLocation = Ext.widget('container', {
			layout: 'hbox',
			defaults: {
				labelAlign: 'top',
				width: 150,
				margin: '0 30 0 0'
			},
			items: [{
				xtype: 'textfield',
		        fieldLabel: 'City',
				name: 'city'
			}, {
		    	xtype: 'selectfield',
		        fieldLabel: 'State',
		        name: 'stateOrProvince',
		        valueField: 'stateCode',
	            displayField: 'stateCode',
				store: me.stateStore
			}, {
				xtype: 'textfield',
		        fieldLabel: 'Zip code',
				name: 'postalOrZipCode'
			}]
		});

		// ============================================================= date ranges

		me.lastOrderStart = Ext.create('Taco.core.ux.form.DateTime', {
			name: 'lastOrderRangeLow',
			emptyText: 'MM/DD/YYYY',
			margin: '0 0 0 0',
			disabled: true
		});

		me.lastOrderEnd = Ext.create('Taco.core.ux.form.DateTime', {
			name: 'lastOrderRangeHigh',
			emptyText: 'MM/DD/YYYY',
			margin: '0 0 0 0',
			disabled: true
		});

		me.dates = Ext.widget('container', {
			layout: 'hbox',
			defaults: {
				width: 150
			},
			items: [{
				xtype: 'combo',
				name: 'range',
				labelAlign: 'top',
				margin: '0 30 0 0',
				editable: false,
				allowBlank: true,
				valueField: 'storedValue',
				displayField: 'displayValue',
				emptyText: 'Filter by date',
				listConfig: { 
					itemTpl: "<span>{displayValue}&nbsp;</span>"
				},
				listeners: {
					change: function (field, newValue) {
						var isCustomRange = newValue !== 'Custom';
						me.lastOrderStart.setDisabled(isCustomRange);
						me.lastOrderEnd.setDisabled(isCustomRange);
					}
				},
				store: Ext.create('Ext.data.ArrayStore', {
					fields: [{
                        name: 'storedValue',
                        type: 'string'
                    }, {
                        name: 'displayValue',
                        type: 'string'
                    }],
					data: [
						[' ', ' '],
						['Today', 'Today'],
						['Yesterday', 'Yesterday'],
						['LastWeek', 'Last Week'],
						['LastMonth', 'Last Month'],
						['Custom', 'Custom Range']
					]
				})

			}, me.lastOrderStart, {

				xtype: 'label',
				html: 'TO',
				pack: 'center',
				align: 'middle',
				width: 30,
				padding: '9 9 9 9'

			}, me.lastOrderEnd]
		});

		// ============================================================= spent

		

		// =============================================================

		me.searchForm = Ext.create('Taco.core.FormPanel', {
			url: me.url,
			layout: { type: 'vbox' },
            xtype: 'formpanel',
            bodyPadding: '0 10',
            title: 'Search by:',
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                margin: '10 0 0 0'
            },
			items: [
				me.customerName,
				me.customerLocation,
				{ xtype: 'label', html: 'Last Order' },
				me.dates,
				{ xtype: 'label', html: 'Spent' },
				me.spent,
				me.searchButton
			]
		});

		me.items = [me.searchForm];

		me.callParent(arguments);
	}
});
*/