///**
// * @author Travis Johnson
// * @class Taco.view.product.edit.ProductOption
// */

//    Ext.define('Taco.view.product.edit.ProductOption', {
//        extend: 'Ext.form.Panel',
//        // height: 500,
//        store: null,
//        requires: ['Taco.view.option.Edit'],
//        initComponent: function () {
//            var me = this;

       

//            me.editLink = {
//                html: '<h4 style="text-decoration:underline;cursor:pointer">Edit [' + me.data.get('internalName') + ']</h4>',
//                listeners: {
//                    click: {
//                        element: 'el',
//                        fn: function () {
                          
//                            var mdl = Ext.create('Taco.core.ux.modal.Content', {
//                                autoShow: true,
//                                //height: 600,
//                                //width: 800,
//                                //align: 'stretch',
//                                content: {
//                                    items: [{
//                                        xtype: 'optionedit',
//                                        close: function () {
//                                            mdl.hide();
//                                        },
//                                        recordId: me.data.getId(),
//                                        height: 600
//                                    }]
//                                }

//                            });
//                            return false;
//                        }
//                    }
//                }
//            };

//            me.headerTxt = Ext.create('Ext.Component', {
//                tpl: '<div>display name:{name} </div><div>display type:{inputType}</div><div>selection required:{isRequired}</div>',
//                data: me.data.data
//            });

//            me.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
//                clicksToEdit: 1
//            });

//            me.store = Ext.create('Ext.data.Store', {
//                model: 'Taco.model.ProductOptionValue',
//                filters: [{
//                    property: 'option_id',
//                    value: me.data.get('id')
//                }, {
//                    property: 'productCode',
//                    value: me.data.get('productCode')
//                }],
//                modelDefaults: [{
//                    property: 'option_id',
//                    value: me.data.get('id')
//                }, {
//                    property: 'productCode',
//                    value: me.data.get('productCode')
//                }]
//            });

//            me.store.load({
//                success: function () {
//                    console.log(arguments);
//                },
//                callback: function () {
//                    console.log(arguments);
//                },
//                failure: function () {
//                    console.log(arguments);
//                }
//            });
            
//            me.grid = Ext.create('Ext.grid.Panel', {
//                title: me.data.get('internalName'),
//                store: me.store,
//                columns: [{
//                    header: 'values',
//                    dataIndex: 'value'
//                }, {
//                    header: 'Price',
//                    dataIndex: 'deltaPrice',
//                    editor: {
//                        xtype: 'textfield',
//                        allowBlank: false
//                    }
//                }, {
//                    header: 'Weight',
//                    dataIndex: 'deltaWeight',
//                    editor: {
//                        xtype: 'textfield',
//                        allowBlank: false
//                    }
//                }],
//                selModel: {
//                    selType: 'cellmodel'
//                },
//                width: 400,
//                plugins: [me.cellEditing]

//            });

//            me.items = [me.editLink, me.headerTxt, me.grid];
//            me.callParent(arguments);
//        },
//        initSaveTasks: function (chain) {
//            var me = this;
//            chain.addSyncStoreTask({
//                key: 'productOption-' +me.data.getId() ,
//                depends:[],
//                store: me.store,
//                errorMsg:'error saving prod opt' + me.data.getId()
//            });
//            ;
//            //todo
//        }
//    });
