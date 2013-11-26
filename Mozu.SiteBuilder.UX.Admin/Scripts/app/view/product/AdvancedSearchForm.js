/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.product.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [   
    ],
    getSupportingStores: function () {
        return this.supportingStores;
    },

    initComponent: function () {
        this.supportingStores = {
            productType: Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes'),
            productUsage: Ext.create('Ext.data.Store', {
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
        };
        this.items = [{
                xtype: 'textfield',
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            }, {
                xtype: 'textfield',
                name: 'productCode',
                fieldLabel: 'Product Code'
            }, {
                xtype: 'combobox',
                name: 'productType',
                fieldLabel: 'Product Type',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                store: this.supportingStores.productType
            },
            {
                xtype: 'combobox',
                name: 'productUsage',
                fieldLabel: 'Product Usage',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                store: this.supportingStores.productUsage
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Price Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'numberfield',
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
                        xtype: 'numberfield',
                        name: 'maxPrice',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }]
            }, {
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
            }];

        this.callParent(arguments);
    }
});