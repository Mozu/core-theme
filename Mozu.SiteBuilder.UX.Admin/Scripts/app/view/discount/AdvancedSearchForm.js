/**
 * @class Taco.view.discount.AdvancedSearchForm
 */
Ext.define('Taco.view.discount.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this;

        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search',
            }, {
                name: 'discountName',
                fieldLabel: 'Discount Name',
            },

            {
                xtype: 'fieldcontainer',
                layout:"hbox",
                items: [{
                    xtype:"textfield",
                    fieldLabel: "Coupon Code",
                    name: 'couponCode',                    
                    flex: 1,
                    margin: { right: 40 }
                }, {
                    xtype: 'combobox',
                    name: 'status',
                    fieldLabel: 'Status',
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
                                name: "Active",
                                id: "Active"
                            }, {
                                name: "Scheduled",
                                id: "Scheduled"
                            }, {
                                name: "Ended",
                                id: "Ended"
                            }, {
                                name: "All",
                                id: "All"
                            }
                        ]
                    })
                }]
            },

            


            {
                xtype: 'fieldcontainer',
                layout: "hbox",
                items: [{
                    xtype: 'combobox',
                    name: 'appliesto',
                    fieldLabel: 'Applies To',
                    valueField: 'id',
                    displayField: 'name',
                    queryMode: 'local',
                    margin: { right: 40 },
                    flex:1,
                    trigger2Cls: 'x-form-clear-trigger',
                    onTrigger2Click: function () {
                        this.clearValue();
                    },
                    valueNotFoundText: 'not found',
                    editable: false,
                    forceSelection: true,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', "name"],
                        data: [
                            {
                                name: "Order",
                                id: "Order"
                            }, {
                                name: "Line Item",
                                id: "LineItem"
                            }
                        ]
                    })
                }, {
                    xtype: 'combobox',
                    name: 'effect',
                    fieldLabel: 'Affects',
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
                                name: "Product",
                                id: "Product"
                            }, {
                                name: "Shipping",
                                id: "Shipping"
                            }
                        ]
                    })
                }]
            },

            {
                xtype: 'fieldcontainer',
                layout: "hbox",
                items: [ {
                    xtype: 'combobox',
                    name: 'type',
                    fieldLabel: 'Type',
                    valueField: 'id',
                    displayField: 'name',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: false,
                    forceSelection: true,
                    trigger2Cls: 'x-form-clear-trigger',
                    onTrigger2Click: function () {
                        this.clearValue();
                    },
                    margin: { right: 40 },
                    flex: 1,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', "name"],
                        data: [
                            {
                                name: "Free",
                                id: "Free"
                            }, {
                                name: "Percentage",
                                id: "Percentage"
                            }, {
                                name: "Amount",
                                id: "Amount"
                            }, {
                                name: "Fixed Price",
                                id: "FixedPrice"
                            }
                        ]
                    })
                }, {
                    xtype: 'numberfield',
                    name: 'amount',
                    fieldLabel: "Amount",
                    hideTrigger: true,
                    minValue: 0,
                    
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    flex: 1

                }]
            },

            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Usage Count',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'usageCountFrom',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width:100
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'numberfield',
                    name: 'usageCountTo',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width: 100
                }]
            },

            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Start Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'startDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'startDateTo',
                    flex: 1
                }]
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'End Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'endDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'endDateTo',
                    flex: 1
                }]
            }
        
        ];

            
        this.callParent(arguments);
    }
});