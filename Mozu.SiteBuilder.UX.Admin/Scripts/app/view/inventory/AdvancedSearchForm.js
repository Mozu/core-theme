/**
 * @class Taco.view.product.AdvancedSearchForm
 */

// this doesn't appear to be used. commenting out prior to removing file


//Ext.define('Taco.view.inventory.AdvancedSearchForm', {
//    extend: 'Taco.core.ux.form.Form',
//    requires: [
//        'Taco.core.ux.form.field.AdminUser'
//    ],

//    defaults: {
//        width: 450,
//        xtype: 'textfield'
//    },
//    items: [{
//        name: 'keyword',
//        fieldLabel: 'Keyword Search'
//    }, {
//        name: 'productCode',
//        fieldLabel: 'Product Code'
//    },
//        {
//            xtype:'container',
//            layout: 'hbox',
           
//            items: [
//                {
//                    xtype: 'combobox',
//                    name: 'productType',
//                    fieldLabel: 'Product Type',
//                    valueField: 'id',
//                    width:200,
//                    displayField: 'name',
//                    queryMode: 'local',
//                    allowBlank: true,
//                    valueNotFoundText: 'not found',
//                    editable: true,
//                    forceSelection: true,
//                    store: { type: 'Taco.store.ProductTypes' }
//                },{ width:20},
//                {
//                    xtype: 'combobox',
//                    name: 'productUsage',
//                    fieldLabel: 'Product Usage',
//                    width: 200,
//                    valueField: 'id',
//                    displayField: 'name',
//                    queryMode: 'local',
//                    valueNotFoundText: 'not found',
//                    editable: true,
//                    forceSelection: true,
//                    store: Ext.create('Ext.data.Store', {
//                        fields: ['id', "name"],
//                        data: [
//                            {
//                                name: "Standard Product",
//                                id: "Standard"
//                            }, {
//                                name: "Configurable Product With Options",
//                                id: "Configurable"
//                            }, {
//                                name: "Product Bundle",
//                                id: "Bundle"
//                            }, {
//                                name: "Bundle Component",
//                                id: "Component"
//                            }
//                        ]
//                    })
//                }]
//        },
//        {
//            xtype: 'combo',
//            store: { type: 'Taco.store.Categories' },

//            name: 'category',
//            fieldLabel: 'Category',

//            valueField: 'id',
//            displayField: 'name',
//            queryMode: 'local',
//            valueNotFoundText: 'not found',
//            editable: true,
//            forceSelection: true,
//            listeners: {
//                added: function (cmp) {
//                    cmp.hidden = !Taco.app.context.getCatalogId();
//                }
//            }
//        },
//        {
//            xtype: 'fieldcontainer',
//            fieldLabel: 'Price Range',
//            layout: {
//                type: 'hbox',
//                align: 'middle'
//            },
//            items: [{
//                    xtype: 'numberfield',
//                    name: 'minPrice',
//                    hideTrigger: true,
//                    keyNavEnabled: false,
//                    mouseWheelEnabled: false,
//                    width: 200
//                }, {
//                    xtype: 'component',
//                    html: 'to',
//                    margin: '0 10'
//                }, {
//                    xtype: 'numberfield',
//                    name: 'maxPrice',
//                    hideTrigger: true,
//                    keyNavEnabled: false,
//                    mouseWheelEnabled: false,
//                    width: 200
//                }]
//        },
//        {
//            xtype: 'taco-adminuserfield',
//            name: 'modifiedBy',
//            fieldLabel: 'Modified By'
//        },
//        {
//            xtype: 'fieldcontainer',
//            fieldLabel: 'Modfied Range',
//            layout: {
//                type: 'hbox',
//                align: 'middle'
//            },
//            items: [{
//                    xtype: 'datefield',
//                    name: 'modifiedFrom',
//                    width: 200
//                }, {
//                    xtype: 'component',
//                    html: 'to',
//                    margin: '0 10'
//                }, {
//                    xtype: 'datefield',
//                    name: 'modifiedTo',
//                    width: 200
//                }]
//        }]
//});