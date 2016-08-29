/**
 * @class Taco.view.location.inventory.AdvancedSearchForm
 */
Ext.define('Taco.view.location.inventory.AdvancedSearchForm', {
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
        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            }, {
                name: 'productName',
                fieldLabel: 'Product Name'
            },
            {
                xtype: 'fieldcontainer',
                layout:"hbox",
                items: [{
                    xtype:"textfield",
                    fieldLabel: "Product Code",
                    name: 'productCode',
                    flex: 1,
                    margin: { right: 40 }
                },{
                    xtype:"textfield",
                    fieldLabel: "Base Product Code",
                    name: 'baseProductCode',
                    flex: 1
                }]
            },
            {
                xtype: 'panel',
                layout: "column",
                items: [
                    {
                        xtype: 'fieldcontainer',
                        fieldLabel: 'On Hand Range',
                        columnWidth: .5,
                        layout: {
                            type: 'hbox'
                        },
                        items: [{
                            xtype: 'numberfield',
                            name: 'onhandFrom',
                            hideTrigger: true,
                            minValue: 0,
                            mouseWheelEnabled: true,
                            selectOnFocus: true,
                            width: 100
                        }, {
                            xtype: 'component',
                            html: 'to',
                            margin: '7 10'
                        }, {
                            xtype: 'numberfield',
                            name: 'onhandTo',
                            hideTrigger: true,
                            minValue: 0,
                            mouseWheelEnabled: true,
                            selectOnFocus: true,
                            width: 100,
                            margin: {right: 40}
                        }]
                    }, {
                        xtype: 'fieldcontainer',
                        fieldLabel: 'Available Range',
                        columnWidth: .5,
                        layout: {
                            type: 'hbox'
                        },
                        items: [{
                            xtype: 'numberfield',
                            name: 'availableFrom',
                            hideTrigger: true,
                            minValue: 0,
                            mouseWheelEnabled: true,
                            selectOnFocus: true,
                            width: 100
                        }, {
                            xtype: 'component',
                            html: 'to',
                            margin: '7 10'
                        }, {
                            xtype: 'numberfield',
                            name: 'availableTo',
                            hideTrigger: true,
                            minValue: 0,
                            mouseWheelEnabled: true,
                            selectOnFocus: true,
                            width: 100
                        }]
                    }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'On Backorder Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'backorderFrom',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width:100
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '7 10'
                }, {
                    xtype: 'numberfield',
                    name: 'backorderTo',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width: 100
                }]
            },
            {
                xtype: 'taco-adminuserfield',
                name: 'createBy',
                fieldLabel: 'Created By',
                flex: 1
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Created Date Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'createdFrom',
                        altFormats: "c",
                        flex: 1
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'createdTo',
                        altFormats: "c",
                        flex: 1
                    }
                ]
            },
            {
                xtype: 'taco-adminuserfield',
                name: 'lastModifiedBy',
                fieldLabel: 'Modified By',
                flex: 1
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Modified Date Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        altFormats: "c",
                        flex: 1
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        altFormats: "c",
                        flex: 1
                    }
                ]
            }
        ];

            
        this.callParent(arguments);
    }
});