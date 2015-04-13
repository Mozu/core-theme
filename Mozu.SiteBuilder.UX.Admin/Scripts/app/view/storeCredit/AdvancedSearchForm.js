/**
 * @class Taco.view.discount.AdvancedSearchForm
 */
Ext.define('Taco.view.storeCredit.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.AdminUsers',
        'Taco.core.ux.form.field.AdminUser',
        'Taco.shared.view.field.Customer',
        'Ext.form.FieldContainer',
        'Ext.form.field.Date',
        'Taco.core.ux.form.CurrencyField',
        'Taco.store.Currencies',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },

    trackResetOnLoad:false,

    initComponent: function () {
        var me = this;

        this.items = [];

        this.customerIdField = Ext.widget({
            xtype: "numberfield",
            name: 'customerid',
            hideTrigger: true,
            minValue: 0,
            flex: 1,
            margin: '0 0 0 0',
            // this helps with the reset working. not sure why but this seems to help
            originalValue:"",
            fieldLabel: 'Customer Id'
        });

        this.customerSelector = Ext.widget({
            xtype: 'taco-customerfield',
            name:"customer",
            fieldLabel: "Customer Search",
            displayField: 'fullName',
            itemId: 'customerSelector',
            originalValue: "",
            showAnonymousCustomers: true,
            //autoFetchDisplayValue:true,
            //width: 300,
            flex:1,
            emptyText: 'Customer Search',
            listeners: {
                select: function (combo, records) {
                    // need to check to see if the custtomer has an email address for the default shipping address.
                    // if not, need to prompt user to edit the customer on the customer detail view.
                    if (records[0]) {
                        var customer = records[0];
                        //me.customerIdField.setValue(customer.get("id"));
                    }
                },
                scope: this
            }
        });

        this.items = [
            {
                name: 'keyword',
                originalValue: "",
                trackResetOnLoad:false,
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
                    }
                ]
            },

            this.customerSelector,
            this.customerIdField,

            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Activate Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'activatedatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'datetime',
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
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'expirationdatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'datetime',
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
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'createdatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'datetime',
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
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'updatedatefrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'updatedateto',
                    flex: 1
                }]
            },

            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Initial Balance',
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype: "currencyfield",
                        name: 'InitialbalanceFrom',
                        flex: 1,                        
                        forcePrecision: true,
                        labelAlign: 'top',
                        currencyCode: Taco.app.context.getCurrent().currencyCode,
                        align: 'right',
                        unitAtEnd: false,
                        minValue: 0,
                        maxValue: 100000000000000000000
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '7 10'
                    },{
                        xtype: "currencyfield",
                        name: 'InitialbalanceTo',
                        flex: 1,                        
                        forcePrecision: true,
                        labelAlign: 'top',
                        currencyCode: Taco.app.context.getCurrent().currencyCode,
                        align: 'right',
                        unitAtEnd: false,
                        minValue: 0,
                        maxValue: 100000000000000000000
                    }
                ]
            },



            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Current Balance',
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype: "currencyfield",
                        name: 'currentBalanceFrom',
                        flex: 1,
                        forcePrecision: true,
                        labelAlign: 'top',
                        currencyCode: Taco.app.context.getCurrent().currencyCode,
                        align: 'right',
                        unitAtEnd: false,
                        minValue: 0
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '7 10'
                    }, {
                        xtype: "currencyfield",
                        name: 'currentBalanceTo',
                        flex: 1,
                        forcePrecision: true,
                        labelAlign: 'top',
                        currencyCode: Taco.app.context.getCurrent().currencyCode,
                        align: 'right',
                        unitAtEnd: false,
                        minValue: 0
                    }
                ]
            },
            {
                xtype: 'combobox',
                name: 'credittype',
                fieldLabel: 'Type',
                flex: 1,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                //initialValue: "StoreCredit",
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
                listeners: {
                    expand: {
                        scope: me,
                        single: true,
                        fn: function (field) {
                            // if the field has no currently set value, default the picker to a default value;
                            if (!field.getValue() && field.initialPickerValue) {
                                field.setValue(field.initialPickerValue);
                            }
                        }
                    }
                },
                initialPickerValue: "USD",
                //margin: "0 0 0 20",
                flex: 1,
                valueField: 'code',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                //initialValue: "USD",
                trigger2Cls: 'x-form-clear-trigger',
                onTrigger2Click: function () {
                    this.clearValue();
                },
                store: { type: 'Taco.store.Currencies' }

            }, {
                xtype:"taco-adminuserfield",
                name: 'modifiedby',
                fieldLabel: 'Modified by',
                flex: 1,
                tpl: Ext.create('Ext.XTemplate',
                  '<tpl for=".">',
                      '<div class="x-boundlist-item">{firstName} {lastName}, {emailAddress}</div>',
                  '</tpl>'
                ),
                trigger2Cls: 'x-form-clear-trigger',
                onTrigger2Click: function () {
                    this.clearValue();
                },
                store: { type: 'Taco.store.AdminUsers'}
            }
        ];

            
        this.callParent(arguments);
    }
});