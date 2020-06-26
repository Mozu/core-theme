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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.keyword_search
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
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_code,
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
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.mfg_part,
                        flex:1
                    },
                    {
                        xtype: 'textfield',
                        name: 'distPartNumber',
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.dist_part,
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
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_type,
                        name: 'productType',
                        flex:1,
                        includeBaseProductType: false
                    },
                    {
                        xtype: 'combobox',
                        name: 'productUsage',
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_usage,
                        flex: 1,
                        margin: '0 0 0 35',
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
                        editable: true,
                        forceSelection: true,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', "name"],
                            data: [
                                {
                                    name: Localizer.langResources.CATALOG.Products.ProductEdit.standard_product,
                                    id: "Standard"
                                }, {
                                    name: Localizer.langResources.CATALOG.Products.ProductEdit.product_with_options,
                                    id: "Configurable"
                                }, {
                                    name: Localizer.langResources.CATALOG.Products.ProductEdit.product_bundle,
                                    id: "Bundle"
                                }, {
                                    name: Localizer.langResources.CATALOG.Products.ProductEdit.bundle_component,
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
                fieldLabel: Localizer.langResources.CATALOG.Products.AdvancedFilter.category,
                valueField: 'id',
                displayField: 'nameAndCodeAndStatus',
                queryMode: 'local',
                valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
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
                fieldLabel: Localizer.langResources.CATALOG.Products.AdvancedFilter.price_range,
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
                        html: Localizer.langResources.SHARED.FileManager.AdvancedFilter.to,
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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.modified_by,
                flex: 1
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.modfied_range,
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
                        html: Localizer.langResources.SHARED.FileManager.AdvancedFilter.to,
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
                        fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.status,
                        flex: 1,
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
                        editable: true,
                        forceSelection: true,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', "name"],
                            data: [
                                {
                                    name: Localizer.langResources.CATALOG.Products.AdvancedFilter.live,
                                    id: "Live"
                                }, {
                                    name: Localizer.langResources.CATALOG.Products.AdvancedFilter.draft,
                                    id: "Draft"
                                }, {
                                    name: Localizer.langResources.CATALOG.Products.AdvancedFilter.new_text,
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