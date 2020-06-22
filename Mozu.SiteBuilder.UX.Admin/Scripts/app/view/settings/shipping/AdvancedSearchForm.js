/**
 * @class Taco.view.settings.shipping.AdvancedSearchForm
 */
Ext.define('Taco.view.settings.shipping.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width: 500,
        xtype: 'textfield'
    },
    initComponent: function () {

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: {
                    type: 'hbox',
                    align: 'left'
                },
                items: [{
                    xtype: "textfield",
                    fieldLabel: "Name",
                    name: 'name',
                    flex: 1,
                    margin: { right: 20 }
                },
                ]
            },
            {
                xtype: 'panel',
                layout: "column",
                items: [
                    {
                        items: [{
                            xtype: "selectfield",
                            fieldLabel: "Carrier",
                            name: 'carrierId',
                            displayField: 'value',
                            allowBlank: true,
                            valueField: 'id',
                            flex: 1,
                            width: 475,
                             store: Ext.create('Ext.data.Store', {
                                 fields: ['id', 'value'],
                                 data: [
                                     //{ "id": '', value: '' },
                                     { "id": "canadapost", "value": "CanadaPost" },
                                     { "id": "fedex", "value": "FedEx" },
                                     { "id": "purolator", "value": "Purolator" },
                                     { "id": "ups", "value": "UPS" },
                                     { "id": "usps", "value": "USPS" }                                    
                                 ]
                             })
                        }
                        ]
                    }
                ]
            },
           
        ];

        this.callParent(arguments);
    }
});