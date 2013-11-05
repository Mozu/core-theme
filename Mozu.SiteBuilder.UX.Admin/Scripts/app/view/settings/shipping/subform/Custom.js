/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.Custom', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Custom Rate',
    padding: '10 10 10 10',
    initComponent: function() {
        var me = this;
        var customRate = this.record.get('customRate') || {};


        this.items = [
            {
                xtype: 'textfield',
                width: 200,
                emptyText: 'e.g. Standard Shipping',
                fieldLabel: 'Name',
                labelAlign: 'top',
                name: 'name',
                value: customRate.name
            },
            
            {
                xtype: 'selectfield',
                displayField: 'text',
                valueField: 'value',
                labelAlign: 'top',
                fieldLabel: 'Rate Type',
                value: customRate.type || 'Flat rate per item',
                width: 200,
                name: 'type',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data: [
                        ['Flat rate per item', 'FLAT_RATE_PER_ITEM_EXACT_AMOUNT'],
                        ['Flat rate per order', 'FLAT_RATE_PER_ORDER_EXACT_AMOUNT']
                    ]
                })
            },
            
            Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
                name: 'amount',
                fieldLabel: 'Rate',
                labelAlign: 'top',
                width: 200,
                unitString: '$',
                emptyText: '0',
                unitAtEnd: false,
                value: customRate.amount
            }),
            
            {
                xtype: 'checkbox',
                fieldLabel: 'Status',
                labelAlign: 'top',
                name: 'isEnabled',
                boxLabel:"Enabled",
                
                checked: customRate.isEnabled,
                value: customRate.isEnabled
            }
        ];

        this.callParent(arguments);
    },
    beforeSave: function () {
        var settings = this.getForm().getValues(false, false, false, true);
        this.record.set('customRate', settings);
    }
});