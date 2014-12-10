/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.product.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.AdminUser',
        'Taco.core.ux.form.CurrencyField'
    ],

    defaults: {
        width: 435,
        xtype: 'textfield'
    },
    items: [
        {
            name: 'keyword',
            fieldLabel: 'Keyword Search'
        },{
            xtype: 'fieldcontainer',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'productCode',
                    fieldLabel: 'Product Code',
                    width: 200
                },
                {
                    width:35
                },
                {
                    xtype: 'textfield',
                    name: 'upc',
                    fieldLabel: 'UPC',
                    width: 200
                } 
            ]
        }, {
            xtype: 'fieldcontainer',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'mfgPartNumber',
                    fieldLabel: 'Mfg Part #',
                    width: 200
                },
                {
                    width: 35
                },
                {
                    xtype: 'textfield',
                    name: 'distPartNumber',
                    fieldLabel: 'Dist Part #',
                    width: 200
                }
            ]
        }, {
            xtype:'container',
            layout: 'hbox',
           
            items: [
                {
                    xtype: 'combobox',
                    name: 'productType',
                    fieldLabel: 'Product Type',
                    valueField: 'id',
                    width:200,
                    displayField: 'name',
                    queryMode: 'local',
                    allowBlank: true,
                    valueNotFoundText: 'not found',
                    editable: true,
                    forceSelection: true,
                    store: { type: 'Taco.store.ProductTypes' }
                }, {
                     width:35
                },{
                    xtype: 'combobox',
                    name: 'productUsage',
                    fieldLabel: 'Product Usage',
                    width: 200,
                    valueField: 'id',
                    displayField: 'name',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: true,
                    forceSelection: true,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', "name"],
                        data: [
                            {
                                name: "Standard Product",
                                id: "Standard"
                            }, {
                                name: "Configurable Product With Options",
                                id: "Configurable"
                            }, {
                                name: "Product Bundle",
                                id: "Bundle"
                            }, {
                                name: "Bundle Component",
                                id: "Component"
                            }
                        ]
                    })
                }]
        },
        {
            xtype: 'combo',
            store: { type: 'Taco.store.Categories' },

            name: 'category',
            fieldLabel: 'Category',

            valueField: 'id',
            displayField: 'nameAndCode',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: true,
            forceSelection: true,
            listeners: {
                added: function (cmp) {
                    cmp.hidden = !Taco.app.context.getCatalogId();
                }
            }
        },
        {
            xtype: 'fieldcontainer',
            fieldLabel: 'Price Range',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                    xtype: 'currencyfield',
                    name: 'minPrice',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 200
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'currencyfield',
                    name: 'maxPrice',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 200
                }]
        }, {
            xtype: 'fieldcontainer',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                xtype: 'currencyfield',
                name: 'map',
                fieldLabel: 'MAP',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                width: 200
            }, {
                width: 35
            }, {
                xtype: 'currencyfield',
                name: 'msrp',
                fieldLabel: 'MSRP',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                width: 200
            }]
        },
        {
            xtype: 'taco-adminuserfield',
            name: 'modifiedBy',
            fieldLabel: 'Modified By'
        },
        {
            xtype: 'fieldcontainer',
            fieldLabel: 'Modfied Range',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                    xtype: 'datefield',
                    name: 'modifiedFrom',
                    //                    fieldLabel: 'Modified From',
                    width: 200
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datefield',
                    name: 'modifiedTo',
                    //fieldLabel: 'Modified To',
                    width: 200
                }]
        }]
});