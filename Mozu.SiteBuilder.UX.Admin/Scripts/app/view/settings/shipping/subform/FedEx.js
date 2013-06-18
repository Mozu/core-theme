/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.FedEx', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'FedEx',
    layout: 'card',
    initComponent: function () {
        var me = this;
        //p.getLayout().setActiveItem(1);
        this.customRate = this.record.get('customRate') || {};
        
        this.configContainer = Ext.widget({
            xtype: 'container',
            layout:'vbox',
            items: [
                 {
                     xtype: 'textfield',
                     name: 'apiusername',
                     fieldLable: 'API use rname'
                 },
                 {
                     xtype: 'textfield',
                     name: 'apipassword',
                     fieldLable: 'API password',
                     inputType: 'password',
                 },
                {
                    xtype:'textfield',
                    name: 'meternumber',
                    fieldLable: 'meter number'
                },
                {
                    xtype: 'textfield',
                    name: 'accountnumber',
                    fieldLable: 'account number'
                },
                {
                    xtype: 'textfield',
                    name: 'pickuptype',
                    fieldLable: 'pickup type'
                }
            ]
        });
        
        this.rates = Ext.widget(
            {
                xtype:'boxselect'
            })

        
        this.items = [
            {
                xtype: 'textfield',
                width: 200,
                emptyText: 'e.g. Standard Shipping',
                fieldLabel: 'Name',
                labelAlign: 'top',
                name: 'name',
                value: customRate.type
            },
            {
                xtype: 'selectfield',
                displayField: 'text',
                valueField: 'value',
                labelAlign: 'top',
                fieldLabel: 'Rate Type',
                value: customRate.type || 'Flat rate per item',
                //width: 600,
                name: 'type',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data: [
                        ['Flat rate per item', 'FLAT_RATE_PER_ITEM_EXACT_AMOUNT'],
                        ['Flat rate per order', 'FLAT_RATE_PER_ORDER_EXACT_AMOUNT']
                    ]
                }),
            },
            Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
                name: 'amount',
                fieldLabel: 'Rate',
                labelAlign: 'top',

                unitString: '$',
                emptyText: '0',
                unitAtEnd: false,
                value: customRate.amount
            }),
            {
                xtype: 'checkbox',
                //  width: 200,
                fieldLabel: 'Is Enabled',
                labelAlign: 'top',
                name: 'isEnabled',
                checked: customRate.isEnabled,
                value: customRate.isEnabled
            }
        ];

        this.callParent(arguments);
    }
});