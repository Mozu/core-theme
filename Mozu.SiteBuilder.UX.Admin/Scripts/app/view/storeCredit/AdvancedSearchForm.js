/**
 * @class Taco.view.discount.AdvancedSearchForm
 */
Ext.define('Taco.view.storeCredit.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Ext.form.field.Date',
        'Taco.core.ux.form.CurrencyField',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this

        this.items = []
        
        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            },            
            {
                xtype: 'fieldcontainer',
                //fieldLabel: 'Start Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype:"textfield",
                        name: 'code',
                        flex:1,
                        fieldLabel: 'Code'
                    }, {
                        xtype: "textfield",
                        name: 'customerid',
                        flex: 1,
                        margin: '0 0 0 20',
                        fieldLabel: 'Customer Id'
                    }
                ]
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Activate Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'activatedatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;                    
                    altFormats: "c",                 
                    name: 'activatedateto',
                    flex: 1
                }]
            },

            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Expiration Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'expirationdatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;                    
                    altFormats: "c",                 
                    name: 'expirationdateto',
                    flex: 1
                }]
            },


            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Create Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'createdatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",                 
                    name: 'createdateto',
                    flex: 1
                }]
            },

            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Update Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datefield',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'updatedatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datefield',                    
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'updatedateto',
                    flex: 1
                }]
            },

            {
                xtype: 'fieldcontainer',
                //fieldLabel: 'Start Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype: "currencyfield",
                        name: 'Initialbalance',
                        flex: 1,                        
                        forcePrecision: true,
                        labelAlign: 'top',
                        currencyCode: Taco.app.context.getCurrent().currencyCode,
                        align: 'right',
                        unitAtEnd: false,
                        minValue: 0,
                        fieldLabel: 'Initial Balance'
                    }, {
                        xtype: "currencyfield",
                        name: 'currentBalance',
                        flex: 1,
                        forcePrecision: true,
                        labelAlign: 'top',
                        currencyCode: Taco.app.context.getCurrent().currencyCode,
                        align: 'right',
                        unitAtEnd: false,
                        minValue: 0,
                        margin: '0 0 0 20',
                        fieldLabel: 'Current Balance'
                    }
                ]
            },


            {
                xtype: 'fieldcontainer',
                //fieldLabel: 'Start Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype: 'combobox',
                        name: 'status',
                        fieldLabel: 'Type',
                        flex: 1,
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        valueNotFoundText: 'not found',
                        editable: false,
                        forceSelection: true,
                        initialValue: "Active",
                        trigger2Cls: 'x-form-clear-trigger',
                        onTrigger2Click: function () {
                            this.clearValue();
                        },
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', "name"],
                            data: [
                                {
                                    name: "Store Credit",
                                    id: "StoreCredit"
                                }, {
                                    name: "Gift Card",
                                    id: "GiftCard"
                                }
                            ]
                        })
                    }, {
                        xtype: 'combobox',
                        name: 'currencycode',
                        fieldLabel: 'Currency Code',
                        margin: "0 0 0 20",
                        flex: 1,
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        valueNotFoundText: 'not found',
                        editable: false,
                        forceSelection: true,
                        initialValue: "Active",
                        trigger2Cls: 'x-form-clear-trigger',
                        onTrigger2Click: function () {
                            this.clearValue();
                        },
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', "name"],
                            data: [
                                {
                                    name: "US Dollars ($)",
                                    id: "$"
                                }, {
                                    name: "Euro (€)",
                                    id: "€"
                                }
                            ]
                        })
                    }
                ]
            }            
        ];

            
        this.callParent(arguments);
    }
});