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
            //{
            //    name: 'keyword',
            //    fieldLabel: 'Keyword Search'
            //}, 
            //{
            //    name: 'productName',
            //    fieldLabel: 'Product Name'
            //},
            {
                xtype: 'fieldcontainer',
                layout: {
                    type: 'hbox',
                    align: 'left'
                },
                items: [{
                    xtype: "textfield",
                    fieldLabel: "Product Code",
                    name: 'productCodeFilter',
                    flex: 1,
                    margin: { right: 20 }
                },
                //{
                //xtype: 'combobox',
                //name: 'productStatus',
                //disabled: (Taco.app.context.getCurrentContext().contextType !== 'c'),
                //fieldLabel: 'Product Catalog Status',
                //flex: 1,
                //valueField: 'id',
                //displayField: 'name',
                //queryMode: 'local',
                //valueNotFoundText: 'not found',
                //editable: false,
                //forceSelection: true,
                //initialValue: "Active",
                //trigger2Cls: 'x-form-clear-trigger',
                //onTrigger2Click: function () {
                //    this.clearValue();
                //},
                //store: Ext.create('Ext.data.Store', {
                //    fields: ['id', "name"],
                //    data: [
                //        {
                //            name: "Active",
                //            id: "Active"
                //        }, {
                //            name: "Disabled",
                //            id: "Disabled"
                //        }, {
                //            name: "All",
                //            id: "All"
                //        }
                //    ]
                //})
                //}
                ]
            },
            {
                xtype: 'panel',
                layout: "column",
                items: [
                    {
                        items: [{
                            xtype: "textfield",
                            fieldLabel: "SKU",
                            name: 'sku',
                            flex: 1,
                            width: 475
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "Part Number",
                            name: 'mfgPartNumber',
                            flex: 1,
                            width: 475
                        }]
                    }
                ]
            },
            //{
            //    xtype: 'panel',
            //    layout: "column",
            //    items: [
            //        {
            //            xtype: 'fieldcontainer',
            //            fieldLabel: 'On Hand Range',
            //            columnWidth: .5,
            //            layout: {
            //                type: 'hbox'
            //            },
            //            items: [{
            //                xtype: 'numberfield',
            //                name: 'onhandFrom',
            //                hideTrigger: true,
            //                mouseWheelEnabled: true,
            //                selectOnFocus: true,
            //                width: 100
            //            }, {
            //                xtype: 'component',
            //                html: 'to',
            //                margin: '7 10'
            //            }, {
            //                xtype: 'numberfield',
            //                name: 'onhandTo',
            //                hideTrigger: true,
            //                mouseWheelEnabled: true,
            //                selectOnFocus: true,
            //                width: 100,
            //                margin: {right: 40}
            //            }]
            //        }, {
            //            xtype: 'fieldcontainer',
            //            fieldLabel: 'Available Range',
            //            columnWidth: .5,
            //            layout: {
            //                type: 'hbox'
            //            },
            //            items: [{
            //                xtype: 'numberfield',
            //                name: 'availableFrom',
            //                hideTrigger: true,
            //                minValue: 0,
            //                mouseWheelEnabled: true,
            //                selectOnFocus: true,
            //                width: 100
            //            }, {
            //                xtype: 'component',
            //                html: 'to',
            //                margin: '7 10'
            //            }, {
            //                xtype: 'numberfield',
            //                name: 'availableTo',
            //                hideTrigger: true,
            //                minValue: 0,
            //                mouseWheelEnabled: true,
            //                selectOnFocus: true,
            //                width: 100
            //            }]
            //        }]
            //}, {
            //    xtype: 'fieldcontainer',
            //    fieldLabel: 'On Backorder Range',
            //    layout: {
            //        type: 'hbox'
            //    },
            //    items: [{
            //        xtype: 'numberfield',
            //        name: 'backorderFrom',
            //        hideTrigger: true,
            //        minValue: 0,
            //        mouseWheelEnabled: true,
            //        selectOnFocus: true,
            //        width:100
            //    }, {
            //        xtype: 'component',
            //        html: 'to',
            //        margin: '7 10'
            //    }, {
            //        xtype: 'numberfield',
            //        name: 'backorderTo',
            //        hideTrigger: true,
            //        minValue: 0,
            //        mouseWheelEnabled: true,
            //        selectOnFocus: true,
            //        width: 100
            //    }]
            //},
            //{
            //    xtype: 'taco-adminuserfield',
            //    name: 'createBy',
            //    fieldLabel: 'Inventory Created By',
            //    flex: 1
            //},
            //{
            //    xtype: 'fieldcontainer',
            //    fieldLabel: 'Inventory Created Date Range',
            //    layout: {
            //        type: 'hbox',
            //        align: 'middle'
            //    },
            //    items: [
            //        {
            //            xtype: 'datefield',
            //            name: 'createdFrom',
            //            altFormats: "c",
            //            flex: 1
            //        }, {
            //            xtype: 'component',
            //            html: 'to',
            //            margin: '0 10'
            //        }, {
            //            xtype: 'datefield',
            //            name: 'createdTo',
            //            altFormats: "c",
            //            flex: 1
            //        }
            //    ]
            //},
            //{
            //    xtype: 'taco-adminuserfield',
            //    name: 'lastModifiedBy',
            //    fieldLabel: 'Inventory Modified By',
            //    flex: 1
            //},
            //{
            //    xtype: 'fieldcontainer',
            //    fieldLabel: 'Inventory Modified Date Range',
            //    layout: {
            //        type: 'hbox',
            //        align: 'middle'
            //    },
            //    items: [
            //        {
            //            xtype: 'datefield',
            //            name: 'modifiedFrom',
            //            altFormats: "c",
            //            flex: 1
            //        }, {
            //            xtype: 'component',
            //            html: 'to',
            //            margin: '0 10'
            //        }, {
            //            xtype: 'datefield',
            //            name: 'modifiedTo',
            //            altFormats: "c",
            //            flex: 1
            //        }
            //    ]
            //}
        ];

        this.callParent(arguments);
    }
});