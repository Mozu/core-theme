/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.product.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.AdminUser',
        'Taco.core.ux.form.CurrencyField',
        'Taco.shared.view.field.ProductTypePickerField'
    ],
    defaults: {
        width: 500,
        xtype: 'textfield'
    },
    removeFilters: function(items) {
        var me = this;

        if (!Array.isArray(this.excludeFilters)) {
            return items;
        }

        items = items.filter(function(item) {
            if (me.excludeFilters.indexOf(item.name) !== -1) {
                return false;
            }

            if (Array.isArray(item.items)) {
                item.items = me.removeFilters(item.items);
            }

            return true;
        });

        return items;
    },
    initComponent: function() {
        var items = [
            {
                name: 'keyword',
                flex: 1,
                fieldLabel: 'Keyword Search'
            },
            {
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
                        flex: 1
                    },
                    {
                        xtype: 'textfield',
                        name: 'upc',
                        fieldLabel: 'UPC',
                        margin: '0 0 0 35',
                        flex: 1
                    }
                ]
            },
            {
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
                        flex:1
                    },
                    {
                        xtype: 'textfield',
                        name: 'distPartNumber',
                        fieldLabel: 'Dist Part #',
                        margin: '0 0 0 35',
                        flex: 1
                    }
                ]
            },
            {
                xtype:'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: "taco-producttypepickerfield",
                        fieldLabel: 'Product Type',
                        name: 'productType',
                        flex:1,
                        includeBaseProductType: false
                    },
                    {
                        xtype: 'combobox',
                        name: 'productUsage',
                        fieldLabel: 'Product Usage',
                        flex: 1,
                        margin: '0 0 0 35',
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
                    }
                ]
            },
            {
                xtype: 'taco-categorycombobox',
                store: { type: 'Taco.store.Categories' },
                flex:1,
                name: 'category',
                fieldLabel: 'Category',
                valueField: 'id',
                displayField: 'nameAndCodeAndStatus',
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
                        flex:1
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
                        flex:1
                    }]
            },
            {
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
                    flex:1
                }, {
                    xtype: 'currencyfield',
                    name: 'msrp',
                    fieldLabel: 'MSRP',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    margin: '0 0 0 35',
                    flex: 1
                }]
            },
            {
                xtype: 'taco-adminuserfield',
                name: 'modifiedBy',
                fieldLabel: 'Modified By',
                flex: 1
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Modfied Range',
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
            },
            {
                xtype:'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'combobox',
                        name: 'publishedStateFilter',
                        fieldLabel: 'Status',
                        flex: 1,
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
                                    name: "Live",
                                    id: "Live"
                                }, {
                                    name: "Draft",
                                    id: "Draft"
                                }, {
                                    name: "New",
                                    id: "New"
                                }
                            ]
                        })
                    }
                ]
            }
            ,{
                xtype: 'textfield',
                    name: 'attribute',
                    fieldLabel: 'Attribute Search (e.g. code1=value1;code2=value2)',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    flex: 1
            }
        ]

        items = this.removeFilters(items);

        this.items = items;

        this.callParent(arguments);

    }
});